import { supabase } from "@/lib/supabase";

/**
 * Question data structure for creating questions
 */
export interface QuestionData {
  question_number: number;
  question_text: string; // HTML content
  subject: string;
  difficulty: string;
  options: { label: string; text: string }[]; // text is HTML
  correct_answer: string;
  explanation: string; // HTML content
  points: number;
  time_limit?: number;
}

/**
 * Strip HTML tags from text for plain text storage
 */
function stripHtmlTags(html: string): string {
  if (!html) return "";
  // Create a temporary div to parse HTML
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

/**
 * Save questions directly to Supabase database
 * @param tryout_package_id - UUID of the tryout package
 * @param questions - Array of question data
 * @returns Promise with success status and created question IDs
 */
export async function saveQuestionsToSupabase(
  tryout_package_id: string,
  questions: QuestionData[]
) {
  try {
    const createdQuestions = [];

    // Process each question
    for (const question of questions) {
      // 1. Insert question to questions table
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert({
          tryout_package_id,
          question_number: question.question_number,
          question_text: stripHtmlTags(question.question_text), // Plain text
          question_text_html: question.question_text, // Rich text HTML
          subject: question.subject,
          difficulty: question.difficulty,
          correct_answer: question.correct_answer,
          explanation: stripHtmlTags(question.explanation), // Plain text
          explanation_html: question.explanation, // Rich text HTML
          points: question.points,
          time_limit: question.time_limit,
        })
        .select()
        .single();

      if (questionError) {
        console.error("Error inserting question:", questionError);
        throw new Error(
          `Failed to insert question ${question.question_number}: ${questionError.message}`
        );
      }

      // 2. Insert options to question_options table
      const optionsToInsert = question.options.map((option) => ({
        question_id: questionData.id,
        option_key: option.label, // 'A', 'B', 'C', 'D', 'E'
        option_text: stripHtmlTags(option.text), // Plain text
        option_text_html: option.text, // Rich text HTML
      }));

      const { error: optionsError } = await supabase
        .from("question_options")
        .insert(optionsToInsert);

      if (optionsError) {
        console.error("Error inserting options:", optionsError);
        // Rollback: delete the question
        await supabase.from("questions").delete().eq("id", questionData.id);
        throw new Error(
          `Failed to insert options for question ${question.question_number}: ${optionsError.message}`
        );
      }

      createdQuestions.push({
        id: questionData.id,
        question_number: question.question_number,
      });
    }

    return {
      success: true,
      count: createdQuestions.length,
      questions: createdQuestions,
      message: `${createdQuestions.length} soal berhasil disimpan!`,
    };
  } catch (error: any) {
    console.error("Error saving questions:", error);
    return {
      success: false,
      count: 0,
      questions: [],
      message: error.message || "Gagal menyimpan soal",
    };
  }
}

/**
 * Update existing question
 */
export async function updateQuestion(
  questionId: string,
  questionData: Partial<QuestionData>
) {
  try {
    const updateData: any = {};

    if (questionData.question_text !== undefined) {
      updateData.question_text = stripHtmlTags(questionData.question_text);
      updateData.question_text_html = questionData.question_text;
    }

    if (questionData.explanation !== undefined) {
      updateData.explanation = stripHtmlTags(questionData.explanation);
      updateData.explanation_html = questionData.explanation;
    }

    if (questionData.subject) updateData.subject = questionData.subject;
    if (questionData.difficulty)
      updateData.difficulty = questionData.difficulty;
    if (questionData.correct_answer)
      updateData.correct_answer = questionData.correct_answer;
    if (questionData.points) updateData.points = questionData.points;
    if (questionData.time_limit !== undefined)
      updateData.time_limit = questionData.time_limit;

    const { error } = await supabase
      .from("questions")
      .update(updateData)
      .eq("id", questionId);

    if (error) throw error;

    // Update options if provided
    if (questionData.options) {
      // Delete existing options
      await supabase
        .from("question_options")
        .delete()
        .eq("question_id", questionId);

      // Insert new options
      const optionsToInsert = questionData.options.map((option) => ({
        question_id: questionId,
        option_key: option.label,
        option_text: stripHtmlTags(option.text),
        option_text_html: option.text,
      }));

      const { error: optionsError } = await supabase
        .from("question_options")
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;
    }

    return { success: true, message: "Soal berhasil diupdate!" };
  } catch (error: any) {
    console.error("Error updating question:", error);
    return { success: false, message: error.message || "Gagal update soal" };
  }
}

/**
 * Delete question and its options
 */
export async function deleteQuestion(questionId: string) {
  try {
    // Options will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId);

    if (error) throw error;

    return { success: true, message: "Soal berhasil dihapus!" };
  } catch (error: any) {
    console.error("Error deleting question:", error);
    return { success: false, message: error.message || "Gagal hapus soal" };
  }
}

/**
 * Get questions by tryout package ID
 */
export async function getQuestionsByPackageId(tryout_package_id: string) {
  try {
    const { data, error } = await supabase
      .from("questions")
      .select(
        `
        *,
        question_options (*)
      `
      )
      .eq("tryout_package_id", tryout_package_id)
      .order("question_number", { ascending: true });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    return { success: false, data: [], message: error.message };
  }
}
