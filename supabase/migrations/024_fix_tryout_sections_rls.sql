-- =====================================================
-- FIX TRYOUT SECTIONS RLS POLICIES
-- =====================================================
-- This migration fixes the RLS policies for tryout_sections table
-- to allow admins to manage sections and users to view them
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view tryout sections" ON public.tryout_sections;
DROP POLICY IF EXISTS "Admins can manage tryout sections" ON public.tryout_sections;
DROP POLICY IF EXISTS "Users can view sections from purchased tryouts" ON public.tryout_sections;

-- Create new policies for tryout_sections
-- Admins can do anything with sections
CREATE POLICY "Admins can manage tryout sections"
ON public.tryout_sections
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Users can view sections from tryouts they have purchased
CREATE POLICY "Users can view sections from purchased tryouts"
ON public.tryout_sections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_tryout_purchases p
    JOIN public.tryout_packages tp ON tp.id = p.tryout_package_id
    WHERE p.user_id = auth.uid()
    AND tp.id = tryout_sections.tryout_package_id
    AND p.is_active = true
  )
);

-- Users can view sections from tryouts they have sessions for
CREATE POLICY "Users can view sections from tryout sessions"
ON public.tryout_sections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_tryout_sessions s
    JOIN public.tryout_packages tp ON tp.id = s.tryout_package_id
    WHERE s.user_id = auth.uid()
    AND tp.id = tryout_sections.tryout_package_id
  )
);

-- Allow anonymous users to view sections (for public tryouts)
CREATE POLICY "Allow anonymous users to view sections"
ON public.tryout_sections
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tryout_packages tp
    WHERE tp.id = tryout_sections.tryout_package_id
    AND tp.is_free = true
  )
);

-- Enable RLS (should already be enabled, but just in case)
ALTER TABLE public.tryout_sections ENABLE ROW LEVEL SECURITY;