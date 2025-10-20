import { supabase } from "@/lib/supabase";
import type {
  TryoutPackage,
  UserTryoutPurchase,
  UserTryoutSession,
  Question,
  UserAnswer,
  PurchaseResponse,
  CalculateResultResponse,
  TryoutResult,
  Ranking,
  UserStatistics,
} from "@/types/tryout";

// =====================================================
// TRYOUT PACKAGES
// =====================================================

export async function getTryoutPackages(filters?: {
  category?: string;
  difficulty?: string;
  searchQuery?: string;
}) {
  let query = supabase
    .from("tryout_packages")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }

  if (filters?.searchQuery) {
    query = query.ilike("title", `%${filters.searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as TryoutPackage[];
}

export async function getTryoutPackageById(id: string) {
  const { data, error } = await supabase
    .from("tryout_packages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as TryoutPackage;
}

// =====================================================
// PURCHASES
// =====================================================

export async function checkPurchaseStatus(userId: string, packageId: string) {
  const { data, error } = await supabase
    .from("user_tryout_purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("tryout_package_id", packageId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data as UserTryoutPurchase | null;
}

export async function getUserPurchases(userId: string) {
  const { data, error } = await supabase
    .from("user_tryout_purchases")
    .select(
      `
      *,
      tryout_packages (*)
    `
    )
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("purchased_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function purchaseTryoutPackage(packageId: string, userId: string) {
  const { data, error } = await supabase.rpc("purchase_tryout_package", {
    p_tryout_package_id: packageId,
    p_user_id: userId,
  });

  if (error) throw error;
  return data as PurchaseResponse;
}

// =====================================================
// SESSIONS
// =====================================================

export async function createTryoutSession(
  userId: string,
  packageId: string,
  purchaseId: string
) {
  const { data, error } = await supabase
    .from("user_tryout_sessions")
    .insert({
      user_id: userId,
      tryout_package_id: packageId,
      purchase_id: purchaseId,
      status: "in_progress",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as UserTryoutSession;
}

export async function getTryoutSession(sessionId: string) {
  const { data, error } = await supabase
    .from("user_tryout_sessions")
    .select(
      `
      *,
      tryout_packages (*)
    `
    )
    .eq("id", sessionId)
    .single();

  if (error) throw error;
  return data as UserTryoutSession;
}

export async function updateTryoutSession(
  sessionId: string,
  updates: Partial<UserTryoutSession>
) {
  const { data, error } = await supabase
    .from("user_tryout_sessions")
    .update(updates)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw error;
  return data as UserTryoutSession;
}

export async function getUserSessions(userId: string) {
  const { data, error } = await supabase
    .from("user_tryout_sessions")
    .select(
      `
      *,
      tryout_packages (*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as UserTryoutSession[];
}

// =====================================================
// QUESTIONS
// =====================================================

export async function getQuestions(packageId: string) {
  const { data, error } = await supabase
    .from("questions")
    .select(
      `
      *,
      question_options (*)
    `
    )
    .eq("tryout_package_id", packageId)
    .order("question_number");

  if (error) throw error;
  return data as Question[];
}

// =====================================================
// ANSWERS
// =====================================================

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedOption: string,
  timeSpent: number
) {
  // Get correct answer and points
  const { data: question } = await supabase
    .from("questions")
    .select("correct_answer, points")
    .eq("id", questionId)
    .single();

  const isCorrect = question?.correct_answer === selectedOption;
  const pointsEarned = isCorrect ? question?.points || 0 : 0;

  const { data, error } = await supabase
    .from("user_answers")
    .upsert({
      user_tryout_session_id: sessionId,
      question_id: questionId,
      selected_option: selectedOption,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      time_spent_seconds: timeSpent,
      answered_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as UserAnswer;
}

export async function getSessionAnswers(sessionId: string) {
  const { data, error } = await supabase
    .from("user_answers")
    .select("*")
    .eq("user_tryout_session_id", sessionId);

  if (error) throw error;
  return data as UserAnswer[];
}

// =====================================================
// RESULTS
// =====================================================

export async function calculateTryoutResult(sessionId: string) {
  const { data, error } = await supabase.rpc("calculate_tryout_result", {
    p_session_id: sessionId,
  });

  if (error) throw error;
  return data as CalculateResultResponse;
}

export async function getTryoutResult(sessionId: string) {
  const { data, error } = await supabase
    .from("tryout_results")
    .select(
      `
      *,
      tryout_packages (*),
      section_results (*)
    `
    )
    .eq("user_tryout_session_id", sessionId)
    .single();

  if (error) throw error;
  return data as TryoutResult;
}

export async function getUserResults(userId: string) {
  const { data, error } = await supabase
    .from("tryout_results")
    .select(
      `
      *,
      tryout_packages (*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as TryoutResult[];
}

// =====================================================
// RANKINGS
// =====================================================

export async function getRankings(packageId: string, limit = 100) {
  console.log("📊 Fetching rankings for package:", packageId);

  try {
    // First, try with JOIN to profiles
    const { data, error } = await supabase
      .from("rankings")
      .select(
        `
        *,
        user:profiles (
          id,
          name,
          email,
          avatar_url
        )
      `
      )
      .eq("tryout_package_id", packageId)
      .order("rank_position")
      .limit(limit);

    if (error) {
      console.error("❌ Error fetching rankings with profiles:", error);

      // Fallback: fetch without JOIN
      console.log("🔄 Trying fallback query without profiles JOIN...");
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("rankings")
        .select("*")
        .eq("tryout_package_id", packageId)
        .order("rank_position")
        .limit(limit);

      if (fallbackError) {
        console.error("❌ Fallback query also failed:", fallbackError);
        throw fallbackError;
      }

      console.log(
        "✅ Rankings fetched (fallback):",
        fallbackData?.length || 0,
        "records"
      );
      return fallbackData as Ranking[];
    }

    console.log("✅ Rankings fetched:", data?.length || 0, "records");
    console.log("📊 Rankings data:", data);
    return data as Ranking[];
  } catch (error) {
    console.error("❌ Error in getRankings:", error);
    throw error;
  }
}

export async function getUserRank(userId: string, packageId: string) {
  console.log("📊 Fetching user rank for:", userId, packageId);

  const { data, error } = await supabase
    .from("rankings")
    .select(
      `
      *,
      user:profiles (
        id,
        name,
        email,
        avatar_url
      )
    `
    )
    .eq("user_id", userId)
    .eq("tryout_package_id", packageId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("❌ Error fetching user rank:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }

  console.log("✅ User rank fetched:", data);
  return data as Ranking | null;
}

// =====================================================
// STATISTICS
// =====================================================

export async function getUserStatistics(userId: string) {
  const { data, error } = await supabase
    .from("user_statistics")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as UserStatistics | null;
}
