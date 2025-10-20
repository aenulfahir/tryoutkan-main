-- =====================================================
-- AUTO UPDATE PAYMENT STATUS: pending -> unpaid
-- =====================================================

-- 1. Create function to auto-update pending payments to unpaid after 10 minutes
CREATE OR REPLACE FUNCTION public.update_expired_pending_payments()
RETURNS void AS $$
BEGIN
  -- Update payments that are still pending after 10 minutes
  UPDATE public.payments
  SET 
    status = 'unpaid',
    updated_at = NOW()
  WHERE 
    status = 'pending'
    AND created_at < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a scheduled job using pg_cron (if available)
-- Note: pg_cron extension must be enabled in Supabase
-- This will run every minute to check for expired pending payments

-- Enable pg_cron extension (run this in Supabase SQL Editor if not enabled)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job to run every minute
-- SELECT cron.schedule(
--   'update-expired-pending-payments',
--   '* * * * *', -- Every minute
--   'SELECT public.update_expired_pending_payments();'
-- );

-- 3. Alternative: Create a trigger-based approach
-- This trigger will check payment status on SELECT queries

CREATE OR REPLACE FUNCTION public.check_payment_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment is pending and older than 10 minutes, update to unpaid
  IF NEW.status = 'pending' AND NEW.created_at < NOW() - INTERVAL '10 minutes' THEN
    NEW.status = 'unpaid';
    NEW.updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on payments table
DROP TRIGGER IF EXISTS check_payment_expiry_trigger ON public.payments;
CREATE TRIGGER check_payment_expiry_trigger
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_payment_expiry();

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.update_expired_pending_payments() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_payment_expiry() TO authenticated;

-- 5. Add updated_at column if not exists
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 6. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payments_status_created_at 
ON public.payments(status, created_at);

