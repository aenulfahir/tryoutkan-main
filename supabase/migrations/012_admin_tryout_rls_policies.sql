-- =====================================================
-- MIGRATION: Admin RLS Policies for Tryout Management
-- Description: Add RLS policies to allow admin CRUD on tryout_packages and questions
-- Date: 2025-10-08
-- =====================================================

-- =====================================================
-- 1. TRYOUT_PACKAGES TABLE - RLS POLICIES
-- =====================================================

-- Enable RLS on tryout_packages (if not already enabled)
ALTER TABLE public.tryout_packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "admin_insert_tryout_packages" ON public.tryout_packages;
DROP POLICY IF EXISTS "admin_update_tryout_packages" ON public.tryout_packages;
DROP POLICY IF EXISTS "admin_delete_tryout_packages" ON public.tryout_packages;
DROP POLICY IF EXISTS "admin_read_tryout_packages" ON public.tryout_packages;
DROP POLICY IF EXISTS "users_read_active_tryout_packages" ON public.tryout_packages;

-- Policy: Admin can INSERT tryout packages
CREATE POLICY admin_insert_tryout_packages
ON public.tryout_packages
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
);

-- Policy: Admin can UPDATE tryout packages
CREATE POLICY admin_update_tryout_packages
ON public.tryout_packages
FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid())
)
WITH CHECK (
  public.is_admin(auth.uid())
);

-- Policy: Admin can DELETE tryout packages
CREATE POLICY admin_delete_tryout_packages
ON public.tryout_packages
FOR DELETE
TO authenticated
USING (
  public.is_admin(auth.uid())
);

-- Policy: Admin can READ all tryout packages
CREATE POLICY admin_read_tryout_packages
ON public.tryout_packages
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
);

-- Policy: Regular users can READ only active tryout packages
CREATE POLICY users_read_active_tryout_packages
ON public.tryout_packages
FOR SELECT
TO authenticated
USING (
  is_active = true
  OR public.is_admin(auth.uid())
);

-- =====================================================
-- 2. QUESTIONS TABLE - RLS POLICIES
-- =====================================================

-- Enable RLS on questions (if not already enabled)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "admin_insert_questions" ON public.questions;
DROP POLICY IF EXISTS "admin_update_questions" ON public.questions;
DROP POLICY IF EXISTS "admin_delete_questions" ON public.questions;
DROP POLICY IF EXISTS "admin_read_questions" ON public.questions;
DROP POLICY IF EXISTS "users_read_questions" ON public.questions;

-- Policy: Admin can INSERT questions
CREATE POLICY admin_insert_questions
ON public.questions
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
);

-- Policy: Admin can UPDATE questions
CREATE POLICY admin_update_questions
ON public.questions
FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid())
)
WITH CHECK (
  public.is_admin(auth.uid())
);

-- Policy: Admin can DELETE questions
CREATE POLICY admin_delete_questions
ON public.questions
FOR DELETE
TO authenticated
USING (
  public.is_admin(auth.uid())
);

-- Policy: Admin can READ all questions
CREATE POLICY admin_read_questions
ON public.questions
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
);

-- Policy: Regular users can READ questions from active tryout packages they own
CREATE POLICY users_read_questions
ON public.questions
FOR SELECT
TO authenticated
USING (
  -- User has purchased the tryout package
  EXISTS (
    SELECT 1 FROM public.user_tryout_purchases
    WHERE user_id = auth.uid()
    AND tryout_package_id = questions.tryout_package_id
    AND is_active = true
  )
  OR
  -- Or it's a free tryout package
  EXISTS (
    SELECT 1 FROM public.tryout_packages
    WHERE id = questions.tryout_package_id
    AND is_free = true
    AND is_active = true
  )
  OR
  -- Or user is admin
  public.is_admin(auth.uid())
);

-- =====================================================
-- 3. QUESTION_OPTIONS TABLE - RLS POLICIES
-- =====================================================

-- Enable RLS on question_options (if not already enabled)
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "admin_insert_question_options" ON public.question_options;
DROP POLICY IF EXISTS "admin_update_question_options" ON public.question_options;
DROP POLICY IF EXISTS "admin_delete_question_options" ON public.question_options;
DROP POLICY IF EXISTS "admin_read_question_options" ON public.question_options;
DROP POLICY IF EXISTS "users_read_question_options" ON public.question_options;

-- Policy: Admin can INSERT question options
CREATE POLICY admin_insert_question_options
ON public.question_options
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
);

-- Policy: Admin can UPDATE question options
CREATE POLICY admin_update_question_options
ON public.question_options
FOR UPDATE
TO authenticated
USING (
  public.is_admin(auth.uid())
)
WITH CHECK (
  public.is_admin(auth.uid())
);

-- Policy: Admin can DELETE question options
CREATE POLICY admin_delete_question_options
ON public.question_options
FOR DELETE
TO authenticated
USING (
  public.is_admin(auth.uid())
);

-- Policy: Admin can READ all question options
CREATE POLICY admin_read_question_options
ON public.question_options
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
);

-- Policy: Regular users can READ question options for questions they have access to
CREATE POLICY users_read_question_options
ON public.question_options
FOR SELECT
TO authenticated
USING (
  -- User has access to the question
  EXISTS (
    SELECT 1 FROM public.questions q
    JOIN public.user_tryout_purchases p ON p.tryout_package_id = q.tryout_package_id
    WHERE q.id = question_options.question_id
    AND p.user_id = auth.uid()
    AND p.is_active = true
  )
  OR
  -- Or it's a free tryout
  EXISTS (
    SELECT 1 FROM public.questions q
    JOIN public.tryout_packages tp ON tp.id = q.tryout_package_id
    WHERE q.id = question_options.question_id
    AND tp.is_free = true
    AND tp.is_active = true
  )
  OR
  -- Or user is admin
  public.is_admin(auth.uid())
);

-- =====================================================
-- 4. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tryout_packages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_options TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify policies
DO $$
BEGIN
  RAISE NOTICE 'Migration 012 completed successfully!';
  RAISE NOTICE 'RLS policies created for:';
  RAISE NOTICE '  - tryout_packages (5 policies)';
  RAISE NOTICE '  - questions (5 policies)';
  RAISE NOTICE '  - question_options (5 policies)';
END $$;

