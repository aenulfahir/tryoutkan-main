-- Migration: Create promo_codes and promo_code_usage tables
-- Description: Tables for voucher top-up system

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'topup' CHECK (type IN ('topup')),
  topup_amount INTEGER NOT NULL CHECK (topup_amount > 0),
  max_usage INTEGER,
  current_usage INTEGER DEFAULT 0 CHECK (current_usage >= 0),
  per_user_limit INTEGER DEFAULT 1 CHECK (per_user_limit > 0),
  min_purchase INTEGER DEFAULT 0 CHECK (min_purchase >= 0),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create promo_code_usage table
CREATE TABLE IF NOT EXISTS public.promo_code_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON public.promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_expires_at ON public.promo_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_promo_code_id ON public.promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user_id ON public.promo_code_usage(user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_promo_codes_updated_at 
    BEFORE UPDATE ON public.promo_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_usage ENABLE ROW LEVEL SECURITY;

-- Policies for promo_codes
-- Users can only see active promo codes
CREATE POLICY "Users can view active promo codes" ON public.promo_codes
    FOR SELECT USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policies for promo_code_usage
-- Users can see their own usage
CREATE POLICY "Users can view own promo usage" ON public.promo_code_usage
    FOR SELECT USING (user_id = auth.uid());

-- Admins can view all usage
CREATE POLICY "Admins can view all promo usage" ON public.promo_code_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Users can insert their own usage (through function)
CREATE POLICY "Users can insert own promo usage" ON public.promo_code_usage
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Comments
COMMENT ON TABLE public.promo_codes IS 'Table for storing voucher/top-up promo codes';
COMMENT ON TABLE public.promo_code_usage IS 'Table for tracking promo code usage by users';
COMMENT ON COLUMN public.promo_codes.type IS 'Type of promo: topup for balance credit';
COMMENT ON COLUMN public.promo_codes.topup_amount IS 'Amount to credit to user balance in Rupiah';
COMMENT ON COLUMN public.promo_codes.max_usage IS 'Maximum number of times this code can be used globally';
COMMENT ON COLUMN public.promo_codes.per_user_limit IS 'Maximum times a single user can use this code';