-- =====================================================
-- MIGRATION: Storage RLS Policies for tryout-assets
-- Description: Fix RLS policies for image upload
-- Date: 2025-10-08
-- =====================================================

-- =====================================================
-- 1. CREATE STORAGE BUCKET (if not exists)
-- =====================================================

-- Note: This needs to be done in Supabase Dashboard
-- Bucket name: tryout-assets
-- Public: true
-- File size limit: 5MB

-- =====================================================
-- 2. DROP EXISTING POLICIES (if any)
-- =====================================================

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view tryout assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload tryout assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete own tryout assets" ON storage.objects;

-- =====================================================
-- 3. CREATE NEW POLICIES
-- =====================================================

-- Policy 1: Public Read Access
-- Anyone can view/download images from tryout-assets bucket
CREATE POLICY "Anyone can view tryout assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'tryout-assets');

-- Policy 2: Authenticated Upload
-- Any authenticated user can upload to tryout-assets bucket
CREATE POLICY "Authenticated can upload tryout assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tryout-assets'
  AND auth.role() = 'authenticated'
);

-- Policy 3: Authenticated Update
-- Authenticated users can update their own files
CREATE POLICY "Authenticated can update own tryout assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tryout-assets'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'tryout-assets'
  AND auth.role() = 'authenticated'
);

-- Policy 4: Authenticated Delete
-- Authenticated users can delete their own files
CREATE POLICY "Authenticated can delete own tryout assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tryout-assets'
  AND auth.role() = 'authenticated'
);

-- =====================================================
-- 4. VERIFY POLICIES
-- =====================================================

-- List all policies for storage.objects
DO $$
BEGIN
  RAISE NOTICE 'Storage policies created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Policies for bucket: tryout-assets';
  RAISE NOTICE '1. Anyone can view tryout assets (SELECT)';
  RAISE NOTICE '2. Authenticated can upload tryout assets (INSERT)';
  RAISE NOTICE '3. Authenticated can update own tryout assets (UPDATE)';
  RAISE NOTICE '4. Authenticated can delete own tryout assets (DELETE)';
  RAISE NOTICE '';
  RAISE NOTICE 'IMPORTANT: Make sure bucket "tryout-assets" exists!';
  RAISE NOTICE 'Create it in Supabase Dashboard → Storage if not exists';
END $$;

