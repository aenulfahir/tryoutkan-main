-- =====================================================
-- REMOVE PAYMENT AUTO-UPDATE TRIGGER
-- =====================================================
-- Description: Remove auto-update payment status trigger
-- Reason: Payment status should only be updated by payment gateway webhook
-- Author: Augment Agent
-- Date: 2025-10-08
-- =====================================================

-- =====================================================
-- 1. DROP TRIGGER
-- =====================================================

-- Drop trigger that auto-updates pending to unpaid
DROP TRIGGER IF EXISTS check_payment_expiry_trigger ON public.payments;

-- =====================================================
-- 2. DROP FUNCTION
-- =====================================================

-- Drop function that checks payment expiry
DROP FUNCTION IF EXISTS public.check_payment_expiry();

-- Drop function that updates expired pending payments
DROP FUNCTION IF EXISTS public.update_expired_pending_payments();

-- =====================================================
-- 3. DROP INDEX (Optional - keep for performance)
-- =====================================================

-- Keep the index as it's still useful for queries
-- DROP INDEX IF EXISTS idx_payments_status_created_at;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify trigger removed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'check_payment_expiry_trigger'
  ) THEN
    RAISE NOTICE '✅ Payment auto-update trigger removed successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to remove payment auto-update trigger';
  END IF;
END $$;

-- =====================================================
-- NOTES
-- =====================================================

-- Payment status should now ONLY be updated by:
-- 1. Payment gateway webhook (when payment is completed/failed)
-- 2. Manual admin action (if needed)
-- 
-- Frontend will only READ the status from database
-- No auto-update based on time

