-- =====================================================
-- TRYOUT SYSTEM DATABASE SCHEMA
-- =====================================================
-- This migration creates the complete tryout system
-- with support for CPNS and BUMN recruitment tests
-- =====================================================

-- =====================================================
-- 1. TRYOUT PACKAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tryout_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'CPNS', 'BUMN_TKD', 'BUMN_AKHLAK', 'BUMN_TBI'
  difficulty VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  duration_minutes INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  price INTEGER NOT NULL DEFAULT 0, -- Price in Rupiah
  is_free BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  passing_grade INTEGER, -- Minimum score to pass
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. TRYOUT SECTIONS TABLE (for multi-section tests)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tryout_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tryout_package_id UUID NOT NULL REFERENCES public.tryout_packages(id) ON DELETE CASCADE,
  section_name VARCHAR(100) NOT NULL, -- 'TWK', 'TIU', 'TKP', 'Verbal', 'Numerik', etc.
  section_order INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  duration_minutes INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. QUESTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tryout_package_id UUID NOT NULL REFERENCES public.tryout_packages(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.tryout_sections(id) ON DELETE SET NULL,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) DEFAULT 'multiple_choice', -- 'multiple_choice', 'essay', 'true_false'
  subject VARCHAR(100), -- 'TWK', 'TIU', 'TKP', 'Verbal', 'Numerik', 'Figural', etc.
  topic VARCHAR(100), -- More specific topic
  difficulty VARCHAR(20) DEFAULT 'medium',
  correct_answer VARCHAR(10), -- 'A', 'B', 'C', 'D', 'E' or answer key
  explanation TEXT, -- Explanation for the correct answer
  points INTEGER DEFAULT 1, -- Points for this question
  image_url TEXT, -- For questions with images
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. QUESTION OPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_key VARCHAR(10) NOT NULL, -- 'A', 'B', 'C', 'D', 'E'
  option_text TEXT NOT NULL,
  option_image_url TEXT, -- For options with images
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. USER TRYOUT PURCHASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_tryout_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tryout_package_id UUID NOT NULL REFERENCES public.tryout_packages(id) ON DELETE CASCADE,
  purchase_price INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiry date
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, tryout_package_id)
);

-- =====================================================
-- 6. USER TRYOUT SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_tryout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tryout_package_id UUID NOT NULL REFERENCES public.tryout_packages(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES public.user_tryout_purchases(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'abandoned'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER DEFAULT 0,
  total_score DECIMAL(10,2) DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. USER ANSWERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_tryout_session_id UUID NOT NULL REFERENCES public.user_tryout_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option VARCHAR(10), -- 'A', 'B', 'C', 'D', 'E' or null if not answered
  is_correct BOOLEAN,
  points_earned DECIMAL(10,2) DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_tryout_session_id, question_id)
);

-- =====================================================
-- 8. TRYOUT RESULTS TABLE (Detailed Analysis)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tryout_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_tryout_session_id UUID NOT NULL REFERENCES public.user_tryout_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tryout_package_id UUID NOT NULL REFERENCES public.tryout_packages(id) ON DELETE CASCADE,
  total_score DECIMAL(10,2) NOT NULL,
  max_score DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  correct_answers INTEGER NOT NULL,
  wrong_answers INTEGER NOT NULL,
  unanswered INTEGER NOT NULL,
  rank_position INTEGER,
  total_participants INTEGER,
  percentile DECIMAL(5,2),
  passed BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_tryout_session_id)
);

-- =====================================================
-- 9. SECTION RESULTS TABLE (Per-section analysis)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.section_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tryout_result_id UUID NOT NULL REFERENCES public.tryout_results(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.tryout_sections(id) ON DELETE CASCADE,
  section_name VARCHAR(100) NOT NULL,
  score DECIMAL(10,2) NOT NULL,
  max_score DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  correct_answers INTEGER NOT NULL,
  wrong_answers INTEGER NOT NULL,
  unanswered INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. RANKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tryout_package_id UUID NOT NULL REFERENCES public.tryout_packages(id) ON DELETE CASCADE,
  tryout_result_id UUID NOT NULL REFERENCES public.tryout_results(id) ON DELETE CASCADE,
  score DECIMAL(10,2) NOT NULL,
  rank_position INTEGER NOT NULL,
  percentile DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. USER STATISTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_tryouts_completed INTEGER DEFAULT 0,
  total_tryouts_purchased INTEGER DEFAULT 0,
  total_time_spent_hours DECIMAL(10,2) DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  best_score DECIMAL(5,2) DEFAULT 0,
  worst_score DECIMAL(5,2),
  total_correct_answers INTEGER DEFAULT 0,
  total_wrong_answers INTEGER DEFAULT 0,
  total_unanswered INTEGER DEFAULT 0,
  last_tryout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_tryout_packages_category ON public.tryout_packages(category);
CREATE INDEX idx_tryout_packages_is_active ON public.tryout_packages(is_active);
CREATE INDEX idx_questions_tryout_package ON public.questions(tryout_package_id);
CREATE INDEX idx_questions_section ON public.questions(section_id);
CREATE INDEX idx_user_purchases_user ON public.user_tryout_purchases(user_id);
CREATE INDEX idx_user_purchases_tryout ON public.user_tryout_purchases(tryout_package_id);
CREATE INDEX idx_user_sessions_user ON public.user_tryout_sessions(user_id);
CREATE INDEX idx_user_sessions_status ON public.user_tryout_sessions(status);
CREATE INDEX idx_user_answers_session ON public.user_answers(user_tryout_session_id);
CREATE INDEX idx_rankings_tryout ON public.rankings(tryout_package_id);
CREATE INDEX idx_rankings_user ON public.rankings(user_id);
CREATE INDEX idx_rankings_score ON public.rankings(score DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.tryout_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryout_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tryout_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tryout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tryout_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Tryout Packages: Everyone can read active packages
CREATE POLICY "Anyone can view active tryout packages"
  ON public.tryout_packages FOR SELECT
  USING (is_active = true);

-- Tryout Sections: Everyone can read
CREATE POLICY "Anyone can view tryout sections"
  ON public.tryout_sections FOR SELECT
  USING (true);

-- Questions: Users can only see questions from purchased tryouts
CREATE POLICY "Users can view questions from purchased tryouts"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_tryout_purchases
      WHERE user_id = auth.uid()
      AND tryout_package_id = questions.tryout_package_id
      AND is_active = true
    )
  );

-- Question Options: Same as questions
CREATE POLICY "Users can view options from purchased tryouts"
  ON public.question_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.user_tryout_purchases p ON p.tryout_package_id = q.tryout_package_id
      WHERE q.id = question_options.question_id
      AND p.user_id = auth.uid()
      AND p.is_active = true
    )
  );

-- User Purchases: Users can only see their own purchases
CREATE POLICY "Users can view their own purchases"
  ON public.user_tryout_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
  ON public.user_tryout_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Sessions: Users can only access their own sessions
CREATE POLICY "Users can view their own sessions"
  ON public.user_tryout_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.user_tryout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.user_tryout_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- User Answers: Users can only access their own answers
CREATE POLICY "Users can view their own answers"
  ON public.user_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_tryout_sessions
      WHERE id = user_answers.user_tryout_session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own answers"
  ON public.user_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_tryout_sessions
      WHERE id = user_answers.user_tryout_session_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own answers"
  ON public.user_answers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_tryout_sessions
      WHERE id = user_answers.user_tryout_session_id
      AND user_id = auth.uid()
    )
  );

-- Tryout Results: Users can view their own results
CREATE POLICY "Users can view their own results"
  ON public.tryout_results FOR SELECT
  USING (auth.uid() = user_id);

-- Section Results: Users can view their own section results
CREATE POLICY "Users can view their own section results"
  ON public.section_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tryout_results
      WHERE id = section_results.tryout_result_id
      AND user_id = auth.uid()
    )
  );

-- Rankings: Everyone can view rankings
CREATE POLICY "Anyone can view rankings"
  ON public.rankings FOR SELECT
  USING (true);

-- User Statistics: Users can only view their own statistics
CREATE POLICY "Users can view their own statistics"
  ON public.user_statistics FOR SELECT
  USING (auth.uid() = user_id);

