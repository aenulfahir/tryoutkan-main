import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { addQuestionsToPackage } from "@/services/apiService";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";

interface Question {
  question_number: number;
  question_text: string;
  subject: string;
  difficulty: string;
  correct_answer: string;
  explanation: string;
  points: number;
}

export default function TambahSoalPage() {
  const { tryout_package_id } = useParams<{ tryout_package_id: string }>();

  // Initialize with one empty question
  const [questions, setQuestions] = useState<Question[]>([
    {
      question_number: 1,
      question_text: "",
      subject: "",
      difficulty: "medium",
      correct_answer: "",
      explanation: "",
      points: 1,
    },
  ]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Handle input change for a specific question
  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string | number
  ) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setQuestions(updatedQuestions);
  };

  // Add new empty question
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      question_number: questions.length + 1,
      question_text: "",
      subject: "",
      difficulty: "medium",
      correct_answer: "",
      explanation: "",
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  // Remove question by index
  const handleRemoveQuestion = (index: number) => {
    if (questions.length === 1) {
      setFeedback({
        type: "error",
        message: "Minimal harus ada 1 soal",
      });
      return;
    }

    const updatedQuestions = questions.filter((_, i) => i !== index);
    // Re-number questions
    const renumbered = updatedQuestions.map((q, i) => ({
      ...q,
      question_number: i + 1,
    }));
    setQuestions(renumbered);
  };

  // Submit all questions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      // Validate all questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question_text.trim()) {
          throw new Error(`Soal nomor ${i + 1}: Teks pertanyaan harus diisi`);
        }
        if (!q.correct_answer.trim()) {
          throw new Error(`Soal nomor ${i + 1}: Jawaban benar harus diisi`);
        }
      }

      const data = {
        tryout_package_id,
        questions: questions.map((q) => ({
          ...q,
          points: parseInt(q.points.toString()),
        })),
      };

      const result = await addQuestionsToPackage(data);

      setFeedback({
        type: "success",
        message: `Berhasil menambahkan ${questions.length} soal ke paket tryout!`,
      });

      // Reset to one empty question
      setQuestions([
        {
          question_number: 1,
          question_text: "",
          subject: "",
          difficulty: "medium",
          correct_answer: "",
          explanation: "",
          points: 1,
        },
      ]);
    } catch (error: any) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "Gagal menambahkan soal",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/questions"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Daftar Soal
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tambah Soal ke Paket Tryout
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Package ID: <span className="font-mono">{tryout_package_id}</span>
          </p>
        </div>

        {/* Feedback Message */}
        {feedback.message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
              feedback.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <p
              className={`text-sm ${
                feedback.type === "success"
                  ? "text-green-800 dark:text-green-300"
                  : "text-red-800 dark:text-red-300"
              }`}
            >
              {feedback.message}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Soal #{question.question_number}
                  </h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teks Pertanyaan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={question.question_text}
                    onChange={(e) =>
                      handleQuestionChange(index, "question_text", e.target.value)
                    }
                    placeholder="Tulis pertanyaan di sini..."
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Subject & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mata Pelajaran
                    </label>
                    <input
                      type="text"
                      value={question.subject}
                      onChange={(e) =>
                        handleQuestionChange(index, "subject", e.target.value)
                      }
                      placeholder="Contoh: TWK, TIU, TKP"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tingkat Kesulitan
                    </label>
                    <select
                      value={question.difficulty}
                      onChange={(e) =>
                        handleQuestionChange(index, "difficulty", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="easy">Mudah</option>
                      <option value="medium">Sedang</option>
                      <option value="hard">Sulit</option>
                    </select>
                  </div>
                </div>

                {/* Correct Answer & Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jawaban Benar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={question.correct_answer}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          "correct_answer",
                          e.target.value
                        )
                      }
                      placeholder="Contoh: A, B, C, D, atau E"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Poin
                    </label>
                    <input
                      type="number"
                      value={question.points}
                      onChange={(e) =>
                        handleQuestionChange(index, "points", Number(e.target.value))
                      }
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pembahasan (opsional)
                  </label>
                  <textarea
                    value={question.explanation}
                    onChange={(e) =>
                      handleQuestionChange(index, "explanation", e.target.value)
                    }
                    placeholder="Penjelasan jawaban..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Button */}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tambah Soal Lagi
          </button>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan {questions.length} Soal...
                </>
              ) : (
                `Simpan Semua Soal (${questions.length})`
              )}
            </button>

            <Link
              to="/admin/questions"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

