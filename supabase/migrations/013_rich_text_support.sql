-- =====================================================
-- MIGRATION: Rich Text Support for Questions
-- Description: Update questions table to support rich text content (HTML)
-- Date: 2025-10-08
-- =====================================================

-- =====================================================
-- 1. UPDATE QUESTIONS TABLE
-- =====================================================

-- Add new columns for rich text support
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS question_text_html TEXT,
ADD COLUMN IF NOT EXISTS explanation_html TEXT,
ADD COLUMN IF NOT EXISTS time_limit INTEGER DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.questions.question_text_html IS 'Rich text HTML content for question';
COMMENT ON COLUMN public.questions.explanation_html IS 'Rich text HTML content for explanation';
COMMENT ON COLUMN public.questions.time_limit IS 'Time limit per question in seconds (optional)';

-- =====================================================
-- 2. UPDATE QUESTION_OPTIONS TABLE
-- =====================================================

-- Add column for rich text option content
ALTER TABLE public.question_options
ADD COLUMN IF NOT EXISTS option_text_html TEXT;

-- Add comment
COMMENT ON COLUMN public.question_options.option_text_html IS 'Rich text HTML content for option';

-- =====================================================
-- 3. CREATE STORAGE BUCKET FOR QUESTION IMAGES
-- =====================================================

-- Create bucket if not exists (run this in Supabase Dashboard Storage)
-- Bucket name: tryout-assets
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/gif, image/webp

-- Note: This needs to be done manually in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Create new bucket: "tryout-assets"
-- 3. Set as public
-- 4. Configure policies

-- =====================================================
-- 4. STORAGE POLICIES FOR TRYOUT-ASSETS
-- =====================================================

-- Policy: Anyone can view images
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'tryout-assets');

-- Policy: Authenticated users can upload
-- CREATE POLICY "Authenticated users can upload"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'tryout-assets'
--   AND auth.role() = 'authenticated'
-- );

-- Policy: Admins can delete
-- CREATE POLICY "Admins can delete"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'tryout-assets'
--   AND public.is_admin(auth.uid())
-- );

-- =====================================================
-- 5. HELPER FUNCTION: Strip HTML Tags
-- =====================================================

CREATE OR REPLACE FUNCTION public.strip_html_tags(html_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Simple HTML tag removal (for search/indexing purposes)
  RETURN regexp_replace(html_text, '<[^>]+>', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.strip_html_tags IS 'Remove HTML tags from text for search/indexing';

-- =====================================================
-- 6. UPDATE EXISTING DATA (MIGRATION)
-- =====================================================

-- Copy existing plain text to HTML columns
UPDATE public.questions
SET 
  question_text_html = CASE 
    WHEN question_text IS NOT NULL THEN '<p>' || question_text || '</p>'
    ELSE NULL
  END,
  explanation_html = CASE 
    WHEN explanation IS NOT NULL THEN '<p>' || explanation || '</p>'
    ELSE NULL
  END
WHERE question_text_html IS NULL OR explanation_html IS NULL;

-- Copy existing option text to HTML columns
UPDATE public.question_options
SET option_text_html = CASE 
  WHEN option_text IS NOT NULL THEN '<p>' || option_text || '</p>'
  ELSE NULL
END
WHERE option_text_html IS NULL;

-- =====================================================
-- 7. CREATE INDEX FOR SEARCH
-- =====================================================

-- Create GIN index for full-text search on stripped HTML
CREATE INDEX IF NOT EXISTS idx_questions_text_search 
ON public.questions 
USING gin(to_tsvector('indonesian', strip_html_tags(COALESCE(question_text_html, ''))));

-- =====================================================
-- 8. UPDATE N8N WEBHOOK HANDLER (NOTES)
-- =====================================================

-- Note: Update n8n workflow to handle rich text:
-- 1. Accept question_text (HTML) instead of plain text
-- 2. Accept options as array of {label, text (HTML)}
-- 3. Accept explanation (HTML)
-- 4. Store in question_text_html, explanation_html columns
-- 5. Also store stripped version in question_text, explanation for backward compatibility

-- Example n8n workflow structure:
-- {
--   "tryout_package_id": "uuid",
--   "questions": [
--     {
--       "question_number": 1,
--       "question_text": "<p>Pertanyaan dengan <strong>bold</strong> dan <img src='...' /></p>",
--       "subject": "TWK",
--       "difficulty": "medium",
--       "options": [
--         {"label": "A", "text": "<p>Pilihan A dengan <em>italic</em></p>"},
--         {"label": "B", "text": "<p>Pilihan B</p>"}
--       ],
--       "correct_answer": "A",
--       "explanation": "<p>Pembahasan dengan <a href='...'>link</a></p>",
--       "points": 1,
--       "time_limit": 60
--     }
--   ]
-- }

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 013 completed successfully!';
  RAISE NOTICE 'Rich text support added to questions table';
  RAISE NOTICE 'New columns: question_text_html, explanation_html, time_limit';
  RAISE NOTICE 'New columns in question_options: option_text_html';
  RAISE NOTICE 'Helper function created: strip_html_tags()';
  RAISE NOTICE 'Full-text search index created';
  RAISE NOTICE '';
  RAISE NOTICE 'MANUAL STEPS REQUIRED:';
  RAISE NOTICE '1. Create Storage bucket "tryout-assets" in Supabase Dashboard';
  RAISE NOTICE '2. Set bucket as public';
  RAISE NOTICE '3. Configure storage policies (see comments above)';
  RAISE NOTICE '4. Update n8n webhook to handle rich text (see notes above)';
END $$;

