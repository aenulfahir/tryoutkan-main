-- =====================================================
-- MIGRATION 017: Add Missing Foreign Keys (Simple Version)
-- Description: Only add missing foreign keys without creating revenue table
-- Date: 2025-10-08
-- =====================================================

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY: rankings → profiles
-- =====================================================

DO $$
BEGIN
  -- Check if foreign key exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'rankings_user_id_fkey' 
    AND table_name = 'rankings'
  ) THEN
    -- Add foreign key
    ALTER TABLE public.rankings
    ADD CONSTRAINT rankings_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Added foreign key: rankings_user_id_fkey → profiles(id)';
  ELSE
    RAISE NOTICE 'ℹ️  Foreign key rankings_user_id_fkey already exists';
  END IF;
END $$;

-- =====================================================
-- 2. ADD MISSING FOREIGN KEY: user_tryout_purchases → profiles
-- =====================================================

DO $$
BEGIN
  -- Check if foreign key exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_tryout_purchases_user_id_fkey' 
    AND table_name = 'user_tryout_purchases'
  ) THEN
    -- Add foreign key
    ALTER TABLE public.user_tryout_purchases
    ADD CONSTRAINT user_tryout_purchases_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Added foreign key: user_tryout_purchases_user_id_fkey → profiles(id)';
  ELSE
    RAISE NOTICE 'ℹ️  Foreign key user_tryout_purchases_user_id_fkey already exists';
  END IF;
END $$;

-- =====================================================
-- 3. VERIFY FOREIGN KEYS
-- =====================================================

DO $$
DECLARE
  fk_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'VERIFICATION RESULTS';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  -- Count foreign keys on rankings
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE table_name = 'rankings'
  AND constraint_type = 'FOREIGN KEY';
  RAISE NOTICE '✅ Rankings table has % foreign keys', fk_count;

  -- Count foreign keys on user_tryout_purchases
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE table_name = 'user_tryout_purchases'
  AND constraint_type = 'FOREIGN KEY';
  RAISE NOTICE '✅ User_tryout_purchases table has % foreign keys', fk_count;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ MIGRATION 017 COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Foreign keys added:';
  RAISE NOTICE '  • rankings_user_id_fkey → profiles(id)';
  RAISE NOTICE '  • user_tryout_purchases_user_id_fkey → profiles(id)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Test admin ranking page';
  RAISE NOTICE '  2. Test admin revenue page';
  RAISE NOTICE '';
END $$;

