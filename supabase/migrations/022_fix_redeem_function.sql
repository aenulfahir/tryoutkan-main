-- Migration: Fix ambiguous column reference in redeem_promo_code function
-- Description: Fix the SQL error when joining tables with same column names

-- Drop the existing function and recreate with proper table aliases
DROP FUNCTION IF EXISTS public.redeem_promo_code(VARCHAR(50), UUID);

CREATE OR REPLACE FUNCTION public.redeem_promo_code(
  p_code VARCHAR(50),
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  amount_credited INTEGER,
  new_balance INTEGER,
  transaction_id UUID,
  promo_code_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promo RECORD;
  v_user_usage_count INTEGER;
  v_balance_id UUID;
  v_new_balance INTEGER;
  v_transaction_id UUID;
  v_current_time TIMESTAMPTZ := NOW();
BEGIN
  -- Get user ID if not provided
  IF p_user_id IS NULL THEN
    p_user_id := auth.uid();
  END IF;

  -- Validate input
  IF p_code IS NULL OR trim(p_code) = '' THEN
    RETURN QUERY SELECT false, 'Kode promo tidak valid', 0, 0, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  IF p_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'User tidak terautentikasi', 0, 0, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  -- Get promo code details with lock - use explicit table alias
  SELECT pc.* INTO v_promo
  FROM public.promo_codes AS pc
  WHERE pc.code = UPPER(trim(p_code))
  AND pc.is_active = true
  FOR UPDATE;

  -- Check if promo code exists
  IF v_promo.id IS NULL THEN
    RETURN QUERY SELECT false, 'Kode promo tidak ditemukan atau tidak aktif', 0, 0, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  -- Check if promo code has expired
  IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < v_current_time THEN
    RETURN QUERY SELECT false, 'Kode promo telah kadaluarsa', 0, 0, NULL::UUID, v_promo.id;
    RETURN;
  END IF;

  -- Check if max usage limit reached
  IF v_promo.max_usage IS NOT NULL AND v_promo.current_usage >= v_promo.max_usage THEN
    RETURN QUERY SELECT false, 'Kode promo telah mencapai batas penggunaan maksimum', 0, 0, NULL::UUID, v_promo.id;
    RETURN;
  END IF;

  -- Check per-user usage limit - use explicit table alias
  SELECT COUNT(*) INTO v_user_usage_count
  FROM public.promo_code_usage AS pcu
  WHERE pcu.promo_code_id = v_promo.id
  AND pcu.user_id = p_user_id;

  IF v_user_usage_count >= v_promo.per_user_limit THEN
    RETURN QUERY SELECT false, 'Anda telah mencapai batas penggunaan untuk kode promo ini', 0, 0, NULL::UUID, v_promo.id;
    RETURN;
  END IF;

  -- Start atomic transaction
  BEGIN
    -- Get or create user balance record - use explicit table alias
    SELECT b.id, b.balance INTO v_balance_id, v_new_balance
    FROM public.balances AS b
    WHERE b.user_id = p_user_id
    FOR UPDATE;

    IF v_balance_id IS NULL THEN
      -- Create new balance record
      INSERT INTO public.balances (user_id, balance)
      VALUES (p_user_id, v_promo.topup_amount)
      RETURNING id, balance INTO v_balance_id, v_new_balance;
    ELSE
      -- Update existing balance
      UPDATE public.balances
      SET balance = balance + v_promo.topup_amount,
          updated_at = v_current_time
      WHERE id = v_balance_id
      RETURNING balance INTO v_new_balance;
    END IF;

    -- Create transaction record
    INSERT INTO public.transactions (
      user_id,
      type,
      amount,
      description,
      created_at
    ) VALUES (
      p_user_id,
      'topup',
      v_promo.topup_amount,
      'Top up dengan kode promo: ' || v_promo.code,
      v_current_time
    ) RETURNING id INTO v_transaction_id;

    -- Create promo code usage record
    INSERT INTO public.promo_code_usage (
      promo_code_id,
      user_id,
      transaction_id,
      amount,
      used_at
    ) VALUES (
      v_promo.id,
      p_user_id,
      v_transaction_id,
      v_promo.topup_amount,
      v_current_time
    );

    -- Update promo code usage count
    UPDATE public.promo_codes
    SET current_usage = current_usage + 1,
        updated_at = v_current_time
    WHERE id = v_promo.id;

    -- Return success result
    RETURN QUERY SELECT 
      true,
      'Berhasil redeem kode promo. Saldo ditambah Rp ' || v_promo.topup_amount,
      v_promo.topup_amount,
      v_new_balance,
      v_transaction_id,
      v_promo.id;

  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback and return error
      RETURN QUERY SELECT 
        false,
        'Terjadi kesalahan saat redeem kode promo: ' || SQLERRM,
        0,
        0,
        NULL::UUID,
        v_promo.id;
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.redeem_promo_code(VARCHAR(50), UUID) TO authenticated;