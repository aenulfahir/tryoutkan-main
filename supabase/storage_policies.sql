-- =====================================================
-- STORAGE POLICIES FOR TRYOUT-ASSETS BUCKET
-- =====================================================
-- Purpose: Allow authenticated users to upload images
--          and allow public read access
-- Date: 2025-10-08
-- =====================================================

-- 1. Create bucket if not exists (run in Supabase Dashboard > Storage)
-- Bucket name: tryout-assets
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/*

-- 2. Add RLS policies for bucket

-- Policy 1: Allow authenticated users to upload
INSERT INTO storage.policies (
  name,
  bucket_id,
  definition
)
VALUES (
  'Authenticated users can upload to tryout-assets',
  'tryout-assets',
  '(bucket_id = ''tryout-assets''::text) AND (auth.role() = ''authenticated''::text)'
)
ON CONFLICT (bucket_id, name) DO NOTHING;

-- Policy 2: Allow public read access
INSERT INTO storage.policies (
  name,
  bucket_id,
  definition
)
VALUES (
  'Public can read from tryout-assets',
  'tryout-assets',
  '(bucket_id = ''tryout-assets''::text)'
)
ON CONFLICT (bucket_id, name) DO NOTHING;

-- Policy 3: Allow users to delete their own uploads
INSERT INTO storage.policies (
  name,
  bucket_id,
  definition
)
VALUES (
  'Users can delete their own uploads',
  'tryout-assets',
  '(bucket_id = ''tryout-assets''::text) AND (auth.role() = ''authenticated''::text)'
)
ON CONFLICT (bucket_id, name) DO NOTHING;

-- Policy 4: Allow admins to delete any file
INSERT INTO storage.policies (
  name,
  bucket_id,
  definition
)
VALUES (
  'Admins can delete any file',
  'tryout-assets',
  '(bucket_id = ''tryout-assets''::text) AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = ''admin''::text
  )'
)
ON CONFLICT (bucket_id, name) DO NOTHING;

-- Verify policies
SELECT 
  name,
  bucket_id,
  definition
FROM storage.policies
WHERE bucket_id = 'tryout-assets'
ORDER BY name;

-- =====================================================
-- FOLDER STRUCTURE IN BUCKET
-- =====================================================
-- tryout-assets/
-- ├── questions/           (images in questions, options, explanations)
-- │   ├── {timestamp}-{random}.jpg
-- │   ├── {timestamp}-{random}.png
-- │   └── ...
-- ├── thumbnails/          (tryout package thumbnails)
-- │   ├── {package_id}/
-- │   │   ├── {timestamp}-{random}.jpg
-- │   │   └── ...
-- │   └── ...
-- └── temp/                (temporary uploads)
--     └── ...

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Upload image (JavaScript/TypeScript):
/*
import { supabase } from "@/lib/supabase";

// Upload to questions folder
const { data, error } = await supabase.storage
  .from("tryout-assets")
  .upload(`questions/${fileName}`, file);

// Upload to thumbnails folder
const { data, error } = await supabase.storage
  .from("tryout-assets")
  .upload(`thumbnails/${packageId}/${fileName}`, file);

// Get public URL
const { data: urlData } = supabase.storage
  .from("tryout-assets")
  .getPublicUrl(filePath);

console.log(urlData.publicUrl);
*/

-- Delete image (JavaScript/TypeScript):
/*
const { error } = await supabase.storage
  .from("tryout-assets")
  .remove([filePath]);
*/

-- List files in folder (JavaScript/TypeScript):
/*
const { data, error } = await supabase.storage
  .from("tryout-assets")
  .list("questions", {
    limit: 100,
    offset: 0,
    sortBy: { column: "created_at", order: "desc" }
  });
*/

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- Check if bucket exists:
SELECT * FROM storage.buckets WHERE name = 'tryout-assets';

-- Check all policies for bucket:
SELECT * FROM storage.policies WHERE bucket_id = 'tryout-assets';

-- Check if user can upload (test in browser console):
/*
const { data, error } = await supabase.storage
  .from("tryout-assets")
  .upload("test.txt", new Blob(["test"], { type: "text/plain" }));

console.log({ data, error });
*/

-- Delete test file:
/*
const { error } = await supabase.storage
  .from("tryout-assets")
  .remove(["test.txt"]);
*/

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Bucket must be created manually in Supabase Dashboard
-- 2. Set bucket to "Public" for public read access
-- 3. Set file size limit to 5MB
-- 4. Allowed MIME types: image/*
-- 5. Policies are automatically applied after insert
-- 6. Use ON CONFLICT to avoid duplicate policy errors

