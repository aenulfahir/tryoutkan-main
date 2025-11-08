// =====================================================
// TRYOUT SYSTEM TYPES
// =====================================================

export interface TryoutPackage {
  id: string;
  title: string;
  description: string | null;
  category:
    | "CPNS"
    | "BUMN_TKD"
    | "BUMN_AKHLAK"
    | "BUMN_TBI"
    | "STAN"
    | "PLN"
    | "OTHER";
  difficulty: "easy" | "medium" | "hard";
  duration_minutes: number;
  total_questions: number;
  price: number;
  is_free: boolean;
  is_active: boolean;
  passing_grade: number | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TryoutSection {
  id: string;
  tryout_package_id: string;
  section_name: string;
  section_order: number;
  total_questions: number;
  duration_minutes: number | null;
  description: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  tryout_package_id: string;
  section_id: string | null;
  question_number: number;
  question_text: string;
  question_text_html?: string | null; // Rich text HTML
  question_type: "multiple_choice" | "essay" | "true_false";
  subject: string | null;
  topic: string | null;
  difficulty: "easy" | "medium" | "hard";
  correct_answer: string | null;
  explanation: string | null;
  explanation_html?: string | null; // Rich text HTML
  explanation_video_url: string | null; // URL to explanation video (YouTube or direct video)
  points: number;
  time_limit?: number | null; // Time limit per question
  image_url: string | null;
  created_at: string;
  updated_at: string;
  question_options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_key: string;
  option_text: string;
  option_text_html?: string | null; // Rich text HTML
  option_image_url: string | null;
  created_at: string;
}

export interface UserTryoutPurchase {
  id: string;
  user_id: string;
  tryout_package_id: string;
  purchase_price: number;
  purchased_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export interface UserTryoutSession {
  id: string;
  user_id: string;
  tryout_package_id: string;
  purchase_id: string | null;
  status: "not_started" | "in_progress" | "completed" | "abandoned";
  started_at: string | null;
  completed_at: string | null;
  time_spent_seconds: number;
  total_score: number;
  percentage: number;
  created_at: string;
  updated_at: string;
  tryout_packages?: TryoutPackage;
}

export interface UserAnswer {
  id: string;
  user_tryout_session_id: string;
  question_id: string;
  selected_option: string | null;
  is_correct: boolean | null;
  points_earned: number;
  time_spent_seconds: number;
  answered_at: string | null;
  created_at: string;
}

export interface TryoutResult {
  id: string;
  user_tryout_session_id: string;
  user_id: string;
  tryout_package_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  rank_position: number | null;
  total_participants: number | null;
  percentile: number | null;
  passed: boolean | null;
  created_at: string;
  tryout_packages?: TryoutPackage;
  section_results?: SectionResult[];
}

export interface SectionResult {
  id: string;
  tryout_result_id: string;
  section_id: string;
  section_name: string;
  score: number;
  max_score: number;
  percentage: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  created_at: string;
}

export interface Ranking {
  id: string;
  user_id: string;
  tryout_package_id: string;
  tryout_result_id: string;
  score: number;
  rank_position: number;
  percentile: number | null;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
  };
}

export interface UserStatistics {
  id: string;
  user_id: string;
  total_tryouts_completed: number;
  total_tryouts_purchased: number;
  total_time_spent_hours: number;
  average_score: number;
  best_score: number;
  worst_score: number | null;
  total_correct_answers: number;
  total_wrong_answers: number;
  total_unanswered: number;
  last_tryout_at: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface PurchaseResponse {
  success: boolean;
  message: string;
  purchase_id?: string;
  transaction_id?: string;
  new_balance?: number;
  required?: number;
  current_balance?: number;
  shortfall?: number;
}

export interface CalculateResultResponse {
  success: boolean;
  result_id?: string;
  total_score?: number;
  max_score?: number;
  percentage?: number;
  correct_answers?: number;
  wrong_answers?: number;
  unanswered?: number;
  passed?: boolean;
  rank_position?: number;
  total_participants?: number;
  percentile?: number;
  message?: string;
}

// =====================================================
// UI STATE TYPES
// =====================================================

export interface TryoutExecutionState {
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> selectedOption
  timeRemaining: number; // in seconds
  flaggedQuestions: Set<string>; // questionIds
  visitedQuestions: Set<string>; // questionIds
}

export interface TryoutFilters {
  category?: string;
  difficulty?: string;
  priceRange?: [number, number];
  searchQuery?: string;
}

// =====================================================
// CHART DATA TYPES
// =====================================================

export interface ScoreDistributionData {
  section: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface TimeAnalysisData {
  questionNumber: number;
  timeSpent: number;
  isCorrect: boolean;
}

export interface ProgressHistoryData {
  date: string;
  score: number;
  percentage: number;
  tryoutTitle: string;
}

// =====================================================
// CATEGORY METADATA
// =====================================================

export const CATEGORY_INFO: Record<
  string,
  {
    name: string;
    description: string;
    icon: string;
    color: string;
  }
> = {
  CPNS: {
    name: "CPNS",
    description: "Tes Seleksi CPNS (TWK, TIU, TKP)",
    icon: "🏛️",
    color: "blue",
  },
  BUMN_TKD: {
    name: "BUMN - TKD",
    description: "Tes Kemampuan Dasar BUMN",
    icon: "🏢",
    color: "green",
  },
  BUMN_AKHLAK: {
    name: "BUMN - AKHLAK",
    description: "Tes Core Values AKHLAK",
    icon: "⭐",
    color: "purple",
  },
  BUMN_TBI: {
    name: "BUMN - TBI",
    description: "Tes Bahasa Inggris BUMN",
    icon: "🌐",
    color: "orange",
  },
  STAN: {
    name: "STAN",
    description: "Tes Seleksi PKN STAN",
    icon: "🎓",
    color: "indigo",
  },
  PLN: {
    name: "PLN",
    description: "Tes Rekrutmen PLN",
    icon: "⚡",
    color: "yellow",
  },
  OTHER: {
    name: "Lainnya",
    description: "Tes lainnya",
    icon: "📝",
    color: "gray",
  },
};

export const DIFFICULTY_INFO: Record<
  string,
  {
    label: string;
    color: string;
  }
> = {
  easy: {
    label: "Mudah",
    color: "green",
  },
  medium: {
    label: "Sedang",
    color: "yellow",
  },
  hard: {
    label: "Sulit",
    color: "red",
  },
};
