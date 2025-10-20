-- Migration: Create redeem_promo_code function
-- Description: Server-side function for redeeming voucher codes with atomic operations

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

  -- Get promo code details with lock
  SELECT * INTO v_promo
  FROM public.promo_codes
  WHERE code = UPPER(trim(p_code))
  AND is_active = true
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

  -- Check per-user usage limit
  SELECT COUNT(*) INTO v_user_usage_count
  FROM public.promo_code_usage
  WHERE promo_code_id = v_promo.id
  AND user_id = p_user_id;

  IF v_user_usage_count >= v_promo.per_user_limit THEN
    RETURN QUERY SELECT false, 'Anda telah mencapai batas penggunaan untuk kode promo ini', 0, 0, NULL::UUID, v_promo.id;
    RETURN;
  END IF;

  -- Start atomic transaction
  BEGIN
    -- Get or create user balance record
    SELECT id, balance INTO v_balance_id, v_new_balance
    FROM public.balances
    WHERE user_id = p_user_id
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

-- Create helper function for admins to create promo codes
CREATE OR REPLACE FUNCTION public.create_promo_code(
  p_code VARCHAR(50),
  p_description TEXT DEFAULT NULL,
  p_topup_amount INTEGER DEFAULT NULL,
  p_max_usage INTEGER DEFAULT NULL,
  p_per_user_limit INTEGER DEFAULT 1,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  promo_code_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promo_id UUID;
BEGIN
  -- Get user ID if not provided
  IF p_created_by IS NULL THEN
    p_created_by := auth.uid();
  END IF;

  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_created_by AND role = 'admin'
  ) THEN
    RETURN QUERY SELECT false, 'Hanya admin yang dapat membuat kode promo', NULL::UUID;
    RETURN;
  END IF;

  -- Validate input
  IF p_code IS NULL OR trim(p_code) = '' THEN
    RETURN QUERY SELECT false, 'Kode promo tidak boleh kosong', NULL::UUID;
    RETURN;
  END IF;

  IF p_topup_amount IS NULL OR p_topup_amount <= 0 THEN
    RETURN QUERY SELECT false, 'Amount top-up harus lebih dari 0', NULL::UUID;
    RETURN;
  END IF;

  -- Check if code already exists
  IF EXISTS (
    SELECT 1 FROM public.promo_codes
    WHERE code = UPPER(trim(p_code))
  ) THEN
    RETURN QUERY SELECT false, 'Kode promo sudah ada', NULL::UUID;
    RETURN;
  END IF;

  -- Create promo code
  INSERT INTO public.promo_codes (
    code,
    description,
    type,
    topup_amount,
    max_usage,
    per_user_limit,
    expires_at,
    created_by
  ) VALUES (
    UPPER(trim(p_code)),
    p_description,
    'topup',
    p_topup_amount,
    p_max_usage,
    p_per_user_limit,
    p_expires_at,
    p_created_by
  ) RETURNING id INTO v_promo_id;

  RETURN QUERY SELECT 
    true,
    'Kode promo berhasil dibuat',
    v_promo_id;
END;
$$;

-- Grant execute permission to authenticated users (admins only)
GRANT EXECUTE ON FUNCTION public.create_promo_code(VARCHAR(50), TEXT, INTEGER, INTEGER, INTEGER, TIMESTAMPTZ, UUID) TO authenticated;

-- Create function to get promo code usage statistics (admin only)
CREATE OR REPLACE FUNCTION public.get_promo_code_stats()
RETURNS TABLE (
  promo_code_id UUID,
  code VARCHAR(50),
  description TEXT,
  topup_amount INTEGER,
  max_usage INTEGER,
  current_usage INTEGER,
  per_user_limit INTEGER,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  unique_users_count BIGINT,
  total_amount_credited BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Hanya admin yang dapat melihat statistik promo code';
  END IF;

  RETURN QUERY
  SELECT 
    pc.id,
    pc.code,
    pc.description,
    pc.topup_amount,
    pc.max_usage,
    pc.current_usage,
    pc.per_user_limit,
    pc.expires_at,
    pc.is_active,
    pc.created_at,
    COUNT(DISTINCT pcu.user_id) as unique_users_count,
    COALESCE(SUM(pcu.amount), 0) as total_amount_credited
  FROM public.promo_codes pc
  LEFT JOIN public.promo_code_usage pcu ON pc.id = pcu.promo_code_id
  GROUP BY pc.id, pc.code, pc.description, pc.topup_amount, pc.max_usage, 
           pc.current_usage, pc.per_user_limit, pc.expires_at, pc.is_active, pc.created_at
  ORDER BY pc.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users (admins only)
GRANT EXECUTE ON FUNCTION public.get_promo_code_stats() TO authenticated;