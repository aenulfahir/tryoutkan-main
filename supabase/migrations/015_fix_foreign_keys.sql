-- =====================================================
-- MIGRATION: Fix Foreign Keys for Admin Pages
-- Description: Fix foreign key relationships for rankings and payments
-- Date: 2025-10-08
-- =====================================================

-- =====================================================
-- 1. CHECK EXISTING FOREIGN KEYS
-- =====================================================

-- Check rankings table foreign keys
DO $$
BEGIN
  RAISE NOTICE 'Checking rankings table foreign keys...';
END $$;

-- =====================================================
-- 2. FIX RANKINGS TABLE (if needed)
-- =====================================================

-- The rankings table should have foreign keys to:
-- - user_id → profiles(id) or auth.users(id)
-- - package_id → tryout_packages(id)

-- Check if foreign key exists, if not create it
DO $$
BEGIN
  -- Check if foreign key to profiles exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'rankings_user_id_fkey' 
    AND table_name = 'rankings'
  ) THEN
    -- Add foreign key to profiles if it doesn't exist
    ALTER TABLE public.rankings
    ADD CONSTRAINT rankings_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Added foreign key: rankings_user_id_fkey';
  ELSE
    RAISE NOTICE 'Foreign key rankings_user_id_fkey already exists';
  END IF;

  -- Check if foreign key to tryout_packages exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'rankings_tryout_package_id_fkey'
    AND table_name = 'rankings'
  ) THEN
    ALTER TABLE public.rankings
    ADD CONSTRAINT rankings_tryout_package_id_fkey
    FOREIGN KEY (tryout_package_id)
    REFERENCES public.tryout_packages(id)
    ON DELETE CASCADE;

    RAISE NOTICE 'Added foreign key: rankings_tryout_package_id_fkey';
  ELSE
    RAISE NOTICE 'Foreign key rankings_tryout_package_id_fkey already exists';
  END IF;
END $$;

-- =====================================================
-- 3. FIX PAYMENTS TABLE (if needed)
-- =====================================================

-- Payments table already exists with structure:
-- - id, user_id, invoice_url, status, external_id, amount, created_at, updated_at
-- Note: This table doesn't have package_id, it's managed separately

DO $$
BEGIN
  -- Check and add foreign key to profiles if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'payments_user_id_fkey'
    AND table_name = 'payments'
  ) THEN
    ALTER TABLE public.payments
    ADD CONSTRAINT payments_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;

    RAISE NOTICE 'Added foreign key: payments_user_id_fkey';
  ELSE
    RAISE NOTICE 'Foreign key payments_user_id_fkey already exists';
  END IF;
END $$;

-- =====================================================
-- 4. VERIFY FOREIGN KEYS
-- =====================================================

DO $$
DECLARE
  fk_count INTEGER;
BEGIN
  -- Count foreign keys on rankings
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE table_name = 'rankings'
  AND constraint_type = 'FOREIGN KEY';

  RAISE NOTICE 'Rankings table has % foreign keys', fk_count;

  -- Count foreign keys on payments
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE table_name = 'payments'
  AND constraint_type = 'FOREIGN KEY';

  RAISE NOTICE 'Payments table has % foreign keys', fk_count;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration 015 completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Foreign keys verified/created:';
  RAISE NOTICE '- rankings_user_id_fkey → profiles(id)';
  RAISE NOTICE '- rankings_tryout_package_id_fkey → tryout_packages(id)';
  RAISE NOTICE '- payments_user_id_fkey → profiles(id)';
  RAISE NOTICE '';
  RAISE NOTICE 'Note: Payments table does not have package_id column.';
  RAISE NOTICE 'Use user_tryout_purchases table for revenue tracking.';
END $$;

