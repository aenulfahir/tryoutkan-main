-- =====================================================
-- ADD NEW TRYOUT CATEGORIES
-- =====================================================
-- This migration adds support for new tryout categories
-- including STAN, PLN, and OTHER categories
-- =====================================================

-- Update the category constraint to include new categories
ALTER TABLE public.tryout_packages 
DROP CONSTRAINT IF EXISTS tryout_packages_category_check;

-- Add the updated constraint with all categories including new ones
ALTER TABLE public.tryout_packages 
ADD CONSTRAINT tryout_packages_category_check 
CHECK (category IN ('CPNS', 'BUMN_TKD', 'BUMN_AKHLAK', 'BUMN_TBI', 'STAN', 'PLN', 'OTHER'));

-- Create section templates for different categories
-- This is for reference only - actual sections will be created through the admin interface

-- CPNS Template Sections (for reference)
-- TWK - Tes Wawasan Kebangsaan (30 soal, 30 menit)
-- TIU - Tes Intelegensi Umum (35 soal, 35 menit)
-- TKP - Tes Karakteristik Pribadi (45 soal, 45 menit)

-- BUMN TKD Template Sections (for reference)
-- Kemampuan Verbal (33 soal, 30 menit)
-- Kemampuan Numerik (33 soal, 30 menit)
-- Penalaran Logis (34 soal, 30 menit)

-- BUMN AKHLAK Template Sections (for reference)
-- Tes Situasional (45 soal, 40 menit)
-- Tes Kepribadian (45 soal, 40 menit)

-- BUMN TBI Template Sections (for reference)
-- Structure & Written Expression (50 soal, 45 menit)
-- Reading Comprehension (50 soal, 45 menit)

-- STAN Template Sections (for reference)
-- Tes Wawasan Kebangsaan (30 soal, 25 menit)
-- Tes Intelegensi Umum (35 soal, 30 menit)
-- Tes Karakteristik Pribadi (35 soal, 25 menit)

-- PLN Template Sections (for reference)
-- Tes Akademik (50 soal, 60 menit)
-- Tes Teknis (50 soal, 60 menit)

-- Update existing RLS policies to ensure they work with new categories
-- No changes needed as existing policies are category-agnostic

-- Add indexes for better performance on category queries
CREATE INDEX IF NOT EXISTS idx_tryout_packages_category_stan ON public.tryout_packages(category) WHERE category = 'STAN';
CREATE INDEX IF NOT EXISTS idx_tryout_packages_category_pln ON public.tryout_packages(category) WHERE category = 'PLN';
CREATE INDEX IF NOT EXISTS idx_tryout_packages_category_other ON public.tryout_packages(category) WHERE category = 'OTHER';