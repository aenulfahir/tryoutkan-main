/**
 * AI Question Extractor Service
 *
 * This service uses a custom AI endpoint to extract questions from PDF files.
 *
 * Setup Instructions:
 * 1. Ensure your custom AI service is running at the specified base URL.
 * 2. Add your API key to .env.local: VITE_AI_API_KEY=your-api-key-here
 * 3. If you add back Gemini, you can uncomment and use its key.
 */

import { toast } from "sonner";

// Configuration
const AI_PROVIDER = "custom_openai"; // "custom_openai" or "gemini"
const CUSTOM_BASE_URL = "https://ai.sumopod.com";
const API_KEY = import.meta.env.VITE_AI_API_KEY; // Using the new key
// const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // Kept for reference
const MODEL = "gpt-4o"; // Or any model your custom endpoint supports
// const GEMINI_MODEL = "gemini-pro";

export interface ExtractedQuestion {
  question_number: number;
  question_type: string; // "TWK" | "TIU" | "TKP" | "multiple_choice"
  question_text: string;
  options: {
    key: string; // "A" | "B" | "C" | "D" | "E"
    text: string;
  }[];
  correct_answer: string;
  explanation: string;
  confidence: number; // 0-1
}

export interface ExtractionResult {
  success: boolean;
  questions: ExtractedQuestion[];
  totalExtracted: number;
  errors: string[];
}

/**
 * Extract text from PDF file using PDF.js
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamically import pdfjs-dist
    const pdfjsLib = await import("pdfjs-dist");

    // Set worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText;
  } catch (error: any) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Gagal membaca PDF: " + error.message);
  }
}

/**
 * Split text into chunks for batch processing
 */
function splitTextIntoChunks(
  text: string,
  maxChunkSize: number = 15000
): string[] {
  const chunks: string[] = [];
  const lines = text.split("\n");
  let currentChunk = "";

  for (const line of lines) {
    if (
      (currentChunk + line).length > maxChunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk);
      currentChunk = line + "\n";
    } else {
      currentChunk += line + "\n";
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Call the Custom AI API (OpenAI compatible) to extract questions
 */
async function extractQuestionsWithCustomAI(
  text: string,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedQuestion[]> {
  if (!API_KEY) {
    throw new Error(
      "AI API key tidak ditemukan. Tambahkan VITE_AI_API_KEY ke .env.local"
    );
  }

  // Split text into chunks if too long
  const chunks = splitTextIntoChunks(text, 15000);
  const allQuestions: ExtractedQuestion[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    if (onProgress) {
      onProgress(i + 1, chunks.length);
    }

    const prompt = `Ekstrak SEMUA soal dari teks berikut. Jangan batasi jumlah soal yang diekstrak.

Untuk setiap soal, berikan:
1. Nomor soal (sesuai urutan di teks)
2. Jenis soal (TWK/TIU/TKP atau multiple_choice jika tidak jelas)
3. Teks pertanyaan lengkap
4. Pilihan jawaban (A, B, C, D, E) - ekstrak semua pilihan yang ada
5. Jawaban yang benar
6. Penjelasan/pembahasan (jika ada)
7. Confidence score (0-1) seberapa yakin ekstraksi ini benar

Format output sebagai JSON array dengan struktur:
[
  {
    "question_number": 1,
    "question_type": "TWK",
    "question_text": "...",
    "options": [
      {"key": "A", "text": "..."},
      {"key": "B", "text": "..."},
      {"key": "C", "text": "..."},
      {"key": "D", "text": "..."},
      {"key": "E", "text": "..."}
    ],
    "correct_answer": "A",
    "explanation": "...",
    "confidence": 0.95
  }
]

Teks (Chunk ${i + 1}/${chunks.length}):
${chunk}

PENTING:
- Ekstrak SEMUA soal yang ada di teks, jangan batasi jumlahnya
- Hanya return JSON array, tanpa teks tambahan
- Pastikan JSON valid dan complete
- Jika ada 50 soal, ekstrak semua 50 soal`;

    try {
      const fetchURL = `${CUSTOM_BASE_URL}/v1/chat/completions`;

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
                "Anda adalah asisten yang ahli dalam mengekstrak soal ujian dari teks. Ekstrak SEMUA soal yang ada tanpa batasan jumlah. Selalu return valid JSON array.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 16000, // Increased from 4000 to 16000
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Custom AI API error");
      }

      const data = await response.json();
      let content = data.choices[0].message.content;

      // Clean the response to ensure it's valid JSON
      content = content.trim();
      if (content.startsWith("```json")) {
        content = content.substring(7, content.length - 3).trim();
      } else if (content.startsWith("```")) {
        content = content.substring(3, content.length - 3).trim();
      }

      const questions = JSON.parse(content);

      // Adjust question numbers for subsequent chunks
      if (i > 0 && allQuestions.length > 0) {
        const offset = allQuestions[allQuestions.length - 1].question_number;
        questions.forEach((q: ExtractedQuestion) => {
          q.question_number += offset;
        });
      }

      allQuestions.push(...questions);
    } catch (error: any) {
      console.error(`Custom AI API error (chunk ${i + 1}):`, error);
      // Continue with next chunk instead of failing completely
      toast.error(`Gagal ekstrak chunk ${i + 1}: ${error.message}`);
    }
  }

  return allQuestions;
}

// NOTE: The `extractQuestionsWithGemini` function is unchanged and can still be used if needed.
// ... (Your Gemini function would go here if you keep it)

/**
 * Main function to extract questions from PDF
 */
export async function extractQuestionsFromPDF(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractionResult> {
  const errors: string[] = [];

  try {
    toast.info("Membaca PDF...");
    const text = await extractTextFromPDF(file);

    if (!text || text.trim().length < 100) {
      throw new Error("PDF tidak mengandung teks yang cukup untuk diekstrak.");
    }

    toast.info(
      "Mengekstrak soal dengan AI... Ini mungkin memakan waktu untuk PDF besar."
    );
    let questions: ExtractedQuestion[];

    // Updated to use the new provider name and function
    if (AI_PROVIDER === "custom_openai") {
      questions = await extractQuestionsWithCustomAI(text, onProgress);
    }
    // else if (AI_PROVIDER === "gemini") {
    //   questions = await extractQuestionsWithGemini(text);
    // }
    else {
      throw new Error("AI provider tidak valid.");
    }

    const validQuestions = questions.filter((q) => {
      if (!q.question_text || !q.options || q.options.length === 0) {
        errors.push(
          `Soal #${
            q.question_number || "tanpa nomor"
          }: Data tidak lengkap, dilewati.`
        );
        return false;
      }
      return true;
    });

    toast.success(
      `Berhasil mengekstrak ${validQuestions.length} soal dari PDF!`
    );

    return {
      success: true,
      questions: validQuestions,
      totalExtracted: validQuestions.length,
      errors,
    };
  } catch (error: any) {
    console.error("Error extracting questions:", error);
    toast.error(error.message || "Terjadi kesalahan saat mengekstrak.");
    return {
      success: false,
      questions: [],
      totalExtracted: 0,
      errors: [error.message],
    };
  }
}

/**
 * Check if AI service is configured
 */
export function isAIConfigured(): boolean {
  if (AI_PROVIDER === "custom_openai") {
    return !!API_KEY;
  }
  // else if (AI_PROVIDER === "gemini") {
  //   return !!GEMINI_API_KEY;
  // }
  return false;
}

/**
 * Get AI provider name
 */
export function getAIProvider(): string {
  // You can customize this name
  if (AI_PROVIDER === "custom_openai") {
    return "SumoPod AI";
  }
  // if (AI_PROVIDER === "gemini") {
  //   return "Google Gemini";
  // }
  return "AI Tidak Dikonfigurasi";
}
