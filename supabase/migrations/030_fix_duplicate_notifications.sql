-- =====================================================
-- FIX: Remove duplicate notification creation in purchase function
-- =====================================================

-- Update purchase_tryout_package function to REMOVE explicit notification creation
-- We rely on the trigger 'on_purchase_create_notification' defined in 028_fix_duplicate_notifications_and_add_delete.sql
CREATE OR REPLACE FUNCTION public.purchase_tryout_package(
  p_tryout_package_id UUID,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_package_price INTEGER;
  v_package_title VARCHAR;
  v_user_balance INTEGER;
  v_user_name VARCHAR;
  v_purchase_id UUID;
  v_transaction_id UUID;
BEGIN
  -- Get package price and title
  SELECT price, title INTO v_package_price, v_package_title
  FROM public.tryout_packages
  WHERE id = p_tryout_package_id AND is_active = true;
  
  IF v_package_price IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Tryout package not found or inactive'
    );
  END IF;
  
  -- Check if already purchased
  IF EXISTS (
    SELECT 1 FROM public.user_tryout_purchases
    WHERE user_id = p_user_id
    AND tryout_package_id = p_tryout_package_id
    AND is_active = true
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'You have already purchased this tryout package'
    );
  END IF;
  
  -- Get user balance and name
  SELECT b.balance, p.name INTO v_user_balance, v_user_name
  FROM public.balances b
  JOIN public.profiles p ON b.user_id = p.id
  WHERE b.user_id = p_user_id;
  
  IF v_user_balance IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User balance not found'
    );
  END IF;
  
  -- Check if balance is sufficient
  IF v_user_balance < v_package_price THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Insufficient balance',
      'required', v_package_price,
      'current_balance', v_user_balance,
      'shortfall', v_package_price - v_user_balance
    );
  END IF;
  
  -- Start transaction
  -- Deduct balance
  UPDATE public.balances
  SET balance = balance - v_package_price,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Create purchase record
  -- This INSERT will trigger 'on_purchase_create_notification' which creates the notification
  INSERT INTO public.user_tryout_purchases (
    user_id,
    tryout_package_id,
    purchase_price,
    purchased_at,
    is_active
  ) VALUES (
    p_user_id,
    p_tryout_package_id,
    v_package_price,
    NOW(),
    true
  ) RETURNING id INTO v_purchase_id;
  
  -- Create transaction record WITH tryout_package_id
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    description,
    tryout_package_id,
    created_at
  ) VALUES (
    p_user_id,
    'usage',
    -v_package_price,
    'Purchase tryout package',
    p_tryout_package_id,
    NOW()
  ) RETURNING id INTO v_transaction_id;
  
  -- REMOVED: Explicit INSERT INTO notifications
  -- The trigger handles this now
  
  -- Update user statistics
  INSERT INTO public.user_statistics (user_id, total_tryouts_purchased)
  VALUES (p_user_id, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_tryouts_purchased = user_statistics.total_tryouts_purchased + 1,
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'message', 'Tryout package purchased successfully',
    'purchase_id', v_purchase_id,
    'transaction_id', v_transaction_id,
    'new_balance', v_user_balance - v_package_price
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'An error occurred: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.purchase_tryout_package(UUID, UUID) TO authenticated;
