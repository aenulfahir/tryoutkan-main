/**
 * AI Question Generator Service
 *
 * This service uses a custom AI endpoint to generate questions automatically.
 *
 * Setup Instructions:
 * 1. Ensure your custom AI service is running at the specified base URL.
 * 2. Add your API key to .env.local: VITE_AI_API_KEY=your-api-key-here
 */

import { toast } from "sonner";

// Configuration
const AI_PROVIDER = "custom_openai"; // Can be "openai" or "gemini" if you add back the logic
const CUSTOM_BASE_URL = "https://ai.sumopod.com";
const API_KEY = import.meta.env.VITE_AI_API_KEY;
const MODEL = "gemini/gemini-2.0-flash"; // Or any model your custom endpoint supports

export interface GeneratedQuestion {
  question_text: string;
  options: {
    key: string; // "A" | "B" | "C" | "D" | "E"
    text: string;
  }[];
  correct_answer: string;
  explanation: string;
}

export interface GenerateQuestionParams {
  questionType: string; // "TWK" | "TIU" | "TKP" | "multiple_choice"
  topic?: string; // Optional specific topic
  difficulty?: "easy" | "medium" | "hard";
  questionNumber?: number;
}

/**
 * Generate question using the custom AI endpoint
 */
async function generateQuestionWithCustomAI(
  params: GenerateQuestionParams
): Promise<GeneratedQuestion> {
  if (!API_KEY) {
    throw new Error(
      "AI API key tidak ditemukan. Tambahkan VITE_AI_API_KEY ke .env.local"
    );
  }

  const { questionType, topic, difficulty = "medium", questionNumber } = params;
  const prompt = buildPrompt(questionType, topic, difficulty, questionNumber);

  // Construct the full URL for the chat completions endpoint
  const fetchURL = `${CUSTOM_BASE_URL}/v1/chat/completions`;

  try {
    const response = await fetch(fetchURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "Anda adalah ahli pembuat soal ujian CPNS Indonesia. Buat soal yang berkualitas, akurat, dan sesuai standar. Selalu return valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Custom AI API error");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // It's safer to clean the response before parsing
    const cleanedContent = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const question = JSON.parse(cleanedContent);
    return question;
  } catch (error: any) {
    console.error("Custom AI API error:", error);
    throw new Error("Gagal generate soal dengan Custom AI: " + error.message);
  }
}

// NOTE: The `generateQuestionWithGemini` function is kept as is.
// If you remove it, be sure to update the `generateQuestion` function.

/**
 * Build prompt based on question type
 */
function buildPrompt(
  questionType: string,
  topic?: string,
  difficulty?: string,
  questionNumber?: number
): string {
  const difficultyText =
    difficulty === "easy"
      ? "mudah"
      : difficulty === "hard"
      ? "sulit"
      : "sedang";

  let specificInstructions = "";

  switch (questionType.toUpperCase()) {
    case "TWK":
      specificInstructions = `Buat soal Tes Wawasan Kebangsaan (TWK) tentang ${
        topic || "Pancasila, UUD 1945, NKRI, atau Bhinneka Tunggal Ika"
      }.
Soal harus menguji pemahaman tentang nilai-nilai kebangsaan, sejarah Indonesia, dan konstitusi.`;
      break;

    case "TIU":
      specificInstructions = `Buat soal Tes Intelegensi Umum (TIU) tentang ${
        topic || "verbal, numerik, atau logika"
      }.
Soal bisa berupa: sinonim/antonim, analogi kata, deret angka, aritmatika, atau penalaran logika.`;
      break;

    case "TKP":
      specificInstructions = `Buat soal Tes Karakteristik Pribadi (TKP) tentang ${
        topic || "integritas, kerjasama, komunikasi, atau pelayanan publik"
      }.
Soal harus berupa situasi/kasus dengan pilihan respons yang menunjukkan karakteristik pribadi.
PENTING: Untuk TKP, semua pilihan bisa benar dengan nilai berbeda (1-5 poin).`;
      break;

    default:
      specificInstructions = `Buat soal multiple choice ${
        topic ? "tentang " + topic : ""
      }.`;
  }

  return `${specificInstructions}

Tingkat kesulitan: ${difficultyText}
${questionNumber ? `Nomor soal: ${questionNumber}` : ""}

Format output sebagai JSON dengan struktur:
{
  "question_text": "Teks pertanyaan yang jelas dan lengkap",
  "options": [
    {"key": "A", "text": "Pilihan A"},
    {"key": "B", "text": "Pilihan B"},
    {"key": "C", "text": "Pilihan C"},
    {"key": "D", "text": "Pilihan D"},
    {"key": "E", "text": "Pilihan E"}
  ],
  "correct_answer": "A",
  "explanation": "Penjelasan lengkap mengapa jawaban tersebut benar dan pilihan lain salah"
}

PENTING:
1. Pertanyaan harus dalam Bahasa Indonesia yang baik dan benar
2. Pilihan jawaban harus masuk akal dan tidak terlalu mudah ditebak
3. Penjelasan harus detail dan edukatif
4. Untuk TWK: gunakan fakta yang akurat
5. Untuk TIU: pastikan logika benar
6. Untuk TKP: semua pilihan valid dengan nilai berbeda
7. Hanya return JSON, tanpa teks tambahan`;
}

/**
 * Main function to generate question
 */
export async function generateQuestion(
  params: GenerateQuestionParams
): Promise<GeneratedQuestion> {
  try {
    // The logic is simplified to only call your custom AI provider
    const question = await generateQuestionWithCustomAI(params);

    // Validate question
    if (
      !question.question_text ||
      !question.options ||
      question.options.length !== 5
    ) {
      throw new Error("Format soal yang dihasilkan tidak valid");
    }

    return question;
  } catch (error: any) {
    console.error("Error generating question:", error);
    toast.error(error.message || "Gagal memuat soal. Silakan coba lagi.");
    throw error;
  }
}

/**
 * Check if AI service is configured
 */
export function isAIConfigured(): boolean {
  return !!API_KEY;
}

/**
 * Get AI provider name
 */
export function getAIProvider(): string {
  // You can customize this name
  return "SumoPod AI";
}

/**
 * Get example topics for each question type
 */
export function getExampleTopics(questionType: string): string[] {
  switch (questionType.toUpperCase()) {
    case "TWK":
      return [
        "Pancasila sila ke-1",
        "UUD 1945 Pasal 28",
        "Sejarah kemerdekaan Indonesia",
        "Bhinneka Tunggal Ika",
        "Lambang negara Garuda Pancasila",
      ];
    case "TIU":
      return [
        "Sinonim kata",
        "Deret angka",
        "Analogi verbal",
        "Aritmatika dasar",
        "Penalaran logika",
      ];
    case "TKP":
      return [
        "Integritas dalam bekerja",
        "Kerjasama tim",
        "Komunikasi efektif",
        "Pelayanan publik",
        "Orientasi pada hasil",
      ];
    default:
      return ["Umum"];
  }
}
