-- =====================================================
-- MIGRATION 016: Add Missing Foreign Keys & Revenue Table
-- Description: Fix foreign key relationships and create revenue tracking
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
-- 3. CREATE REVENUE TABLE (for better tracking)
-- =====================================================

DO $$
BEGIN
  -- Check if revenue table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'revenue'
  ) THEN
    -- Create revenue table
    CREATE TABLE public.revenue (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      tryout_package_id UUID NOT NULL REFERENCES public.tryout_packages(id) ON DELETE CASCADE,
      purchase_id UUID REFERENCES public.user_tryout_purchases(id) ON DELETE SET NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50),
      payment_status VARCHAR(20) DEFAULT 'completed',
      transaction_id VARCHAR(255),
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create index for faster queries
    CREATE INDEX idx_revenue_user_id ON public.revenue(user_id);
    CREATE INDEX idx_revenue_package_id ON public.revenue(tryout_package_id);
    CREATE INDEX idx_revenue_created_at ON public.revenue(created_at DESC);
    CREATE INDEX idx_revenue_status ON public.revenue(payment_status);

    -- Enable RLS
    ALTER TABLE public.revenue ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Users can view their own revenue"
    ON public.revenue FOR SELECT
    USING (auth.uid() = user_id);

    CREATE POLICY "Admins can view all revenue"
    ON public.revenue FOR SELECT
    USING (public.is_admin(auth.uid()));

    CREATE POLICY "Admins can insert revenue"
    ON public.revenue FOR INSERT
    WITH CHECK (public.is_admin(auth.uid()));

    CREATE POLICY "Admins can update revenue"
    ON public.revenue FOR UPDATE
    USING (public.is_admin(auth.uid()));

    RAISE NOTICE '✅ Created revenue table with foreign keys and RLS policies';
  ELSE
    RAISE NOTICE 'ℹ️  Revenue table already exists';
  END IF;
END $$;

-- =====================================================
-- 4. POPULATE REVENUE TABLE FROM EXISTING PURCHASES
-- =====================================================

DO $$
DECLARE
  inserted_count INTEGER;
BEGIN
  -- Only populate if revenue table is empty
  IF (SELECT COUNT(*) FROM public.revenue) = 0 THEN
    -- Insert from user_tryout_purchases
    INSERT INTO public.revenue (
      user_id,
      tryout_package_id,
      purchase_id,
      amount,
      payment_method,
      payment_status,
      description,
      created_at
    )
    SELECT
      utp.user_id,
      utp.tryout_package_id,
      utp.id,
      COALESCE(utp.purchase_price, 0),
      'online',
      CASE
        WHEN utp.is_active THEN 'completed'
        ELSE 'pending'
      END,
      'Pembelian tryout: ' || tp.title,
      utp.purchased_at
    FROM public.user_tryout_purchases utp
    JOIN public.tryout_packages tp ON utp.tryout_package_id = tp.id
    WHERE utp.is_active = true;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RAISE NOTICE '✅ Populated revenue table with % records from purchases', inserted_count;
  ELSE
    RAISE NOTICE 'ℹ️  Revenue table already has data, skipping population';
  END IF;
END $$;

-- =====================================================
-- 5. CREATE FUNCTION TO AUTO-ADD REVENUE ON PURCHASE
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_revenue_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create revenue if purchase is active
  IF NEW.is_active = true THEN
    INSERT INTO public.revenue (
      user_id,
      tryout_package_id,
      purchase_id,
      amount,
      payment_method,
      payment_status,
      description,
      created_at
    )
    SELECT
      NEW.user_id,
      NEW.tryout_package_id,
      NEW.id,
      COALESCE(NEW.purchase_price, 0),
      'online',
      'completed',
      'Pembelian tryout: ' || tp.title,
      NEW.purchased_at
    FROM public.tryout_packages tp
    WHERE tp.id = NEW.tryout_package_id
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CREATE TRIGGER FOR AUTO REVENUE CREATION
-- =====================================================

DO $$
BEGIN
  -- Drop trigger if exists
  DROP TRIGGER IF EXISTS trigger_create_revenue_on_purchase ON public.user_tryout_purchases;
  
  -- Create trigger
  CREATE TRIGGER trigger_create_revenue_on_purchase
  AFTER INSERT OR UPDATE ON public.user_tryout_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.create_revenue_on_purchase();
  
  RAISE NOTICE '✅ Created trigger for automatic revenue creation';
END $$;

-- =====================================================
-- 7. VERIFY FOREIGN KEYS
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

  -- Count foreign keys on revenue
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE table_name = 'revenue'
  AND constraint_type = 'FOREIGN KEY';
  RAISE NOTICE '✅ Revenue table has % foreign keys', fk_count;

  -- Count revenue records
  SELECT COUNT(*) INTO fk_count FROM public.revenue;
  RAISE NOTICE '✅ Revenue table has % records', fk_count;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ MIGRATION 016 COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE 'Foreign keys added:';
  RAISE NOTICE '  • rankings_user_id_fkey → profiles(id)';
  RAISE NOTICE '  • user_tryout_purchases_user_id_fkey → profiles(id)';
  RAISE NOTICE '';
  RAISE NOTICE 'New table created:';
  RAISE NOTICE '  • revenue (with 3 foreign keys)';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers created:';
  RAISE NOTICE '  • trigger_create_revenue_on_purchase';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Update Revenue.tsx to use revenue table';
  RAISE NOTICE '  2. Test admin ranking page';
  RAISE NOTICE '  3. Test admin revenue page';
  RAISE NOTICE '';
END $$;

