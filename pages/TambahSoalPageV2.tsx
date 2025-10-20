import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { saveQuestionsToSupabase } from "@/services/questionService";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { ConfigurationStep } from "@/components/question/ConfigurationStep";
import { QuestionFormStep } from "@/components/question/QuestionFormStep";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Copy,
  Eye,
  Save,
} from "lucide-react";
import { toast } from "sonner";

// Step 1: Configuration
interface QuestionConfig {
  category: string;
  subject: string;
  customSubject: string;
  totalQuestions: number;
  answerType: "yes-no" | "abcde" | "custom";
  customOptionsCount: number;
  defaultPoints: number;
  differentPoints: boolean;
  hasTimePerQuestion: boolean;
  hasDifficulty: boolean;
}

// Step 2: Question
interface QuestionData {
  question_number: number;
  question_text: string;
  subject: string;
  difficulty: string;
  options: { label: string; text: string }[];
  correct_answer: string;
  explanation: string;
  points: number;
  time_limit?: number;
}

export default function TambahSoalPageV2() {
  const { tryout_package_id } = useParams<{ tryout_package_id: string }>();
  const navigate = useNavigate();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [existingQuestionsCount, setExistingQuestionsCount] = useState(0);
  const [tryoutPackage, setTryoutPackage] = useState<any>(null);
  const [questionBreakdown, setQuestionBreakdown] = useState<{
    TWK: number;
    TIU: number;
    TKP: number;
    [key: string]: number;
  }>({ TWK: 0, TIU: 0, TKP: 0 });

  // Step 1: Configuration
  const [config, setConfig] = useState<QuestionConfig>({
    category: "CPNS",
    subject: "TWK",
    customSubject: "",
    totalQuestions: 10,
    answerType: "abcde",
    customOptionsCount: 4,
    defaultPoints: 1,
    differentPoints: false,
    hasTimePerQuestion: false,
    hasDifficulty: true,
  });

  // Step 2: Questions
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [autoSaving, setAutoSaving] = useState(false);

  // Load tryout package and existing questions
  useEffect(() => {
    loadTryoutPackage();
    loadExistingQuestions();
  }, [tryout_package_id]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (currentStep === 2 && questions.length > 0) {
      const interval = setInterval(() => {
        handleAutoSave();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [questions, currentStep]);

  async function loadTryoutPackage() {
    try {
      const { data, error } = await supabase
        .from("tryout_packages")
        .select("*")
        .eq("id", tryout_package_id)
        .single();

      if (error) throw error;
      setTryoutPackage(data);

      // Set category from package
      if (data?.category) {
        setConfig((prev) => ({ ...prev, category: data.category }));
      }
    } catch (error) {
      console.error("Error loading tryout package:", error);
      toast.error("Gagal memuat data tryout package");
    }
  }

  async function loadExistingQuestions() {
    try {
      // Get count
      const { count, error: countError } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("tryout_package_id", tryout_package_id);

      if (countError) throw countError;
      setExistingQuestionsCount(count || 0);

      // Get breakdown by subject
      const { data, error } = await supabase
        .from("questions")
        .select("subject")
        .eq("tryout_package_id", tryout_package_id);

      if (error) throw error;

      // Count by subject
      const breakdown: { [key: string]: number } = {
        TWK: 0,
        TIU: 0,
        TKP: 0,
      };

      data?.forEach((q) => {
        if (q.subject in breakdown) {
          breakdown[q.subject]++;
        } else {
          breakdown[q.subject] = 1;
        }
      });

      setQuestionBreakdown(breakdown as typeof questionBreakdown);
    } catch (error) {
      console.error("Error loading existing questions:", error);
    }
  }

  function handleConfigChange(field: keyof QuestionConfig, value: any) {
    setConfig((prev) => ({ ...prev, [field]: value }));
  }

  function handleNextStep() {
    // Validate config
    if (config.totalQuestions < 1) {
      toast.error("Jumlah soal minimal 1");
      return;
    }

    // Initialize questions based on config
    const newQuestions: QuestionData[] = [];
    const startNumber = existingQuestionsCount + 1;

    // Generate option labels based on answer type
    let optionLabels: string[] = [];
    if (config.answerType === "yes-no") {
      optionLabels = ["Ya", "Tidak"];
    } else if (config.answerType === "abcde") {
      optionLabels = ["A", "B", "C", "D", "E"];
    } else {
      optionLabels = Array.from({ length: config.customOptionsCount }, (_, i) =>
        String.fromCharCode(65 + i)
      );
    }

    for (let i = 0; i < config.totalQuestions; i++) {
      newQuestions.push({
        question_number: startNumber + i,
        question_text: "",
        subject:
          config.subject === "custom" ? config.customSubject : config.subject,
        difficulty: "medium",
        options: optionLabels.map((label) => ({ label, text: "" })),
        correct_answer: optionLabels[0],
        explanation: "",
        points: config.defaultPoints,
        time_limit: config.hasTimePerQuestion ? 60 : undefined,
      });
    }

    setQuestions(newQuestions);
    setCurrentStep(2);
  }

  function handlePreviousStep() {
    setCurrentStep(1);
  }

  function handleQuestionChange(
    index: number,
    field: keyof QuestionData,
    value: any
  ) {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function handleOptionChange(
    questionIndex: number,
    optionIndex: number,
    text: string
  ) {
    setQuestions((prev) => {
      const updated = [...prev];
      const options = [...updated[questionIndex].options];
      options[optionIndex] = { ...options[optionIndex], text };
      updated[questionIndex] = { ...updated[questionIndex], options };
      return updated;
    });
  }

  function handleAddQuestion() {
    const lastQuestion = questions[questions.length - 1];
    const newQuestion: QuestionData = {
      ...lastQuestion,
      question_number: lastQuestion.question_number + 1,
      question_text: "",
      options: lastQuestion.options.map((opt) => ({ ...opt, text: "" })),
      explanation: "",
    };
    setQuestions([...questions, newQuestion]);
  }

  function handleRemoveQuestion(index: number) {
    if (questions.length === 1) {
      toast.error("Minimal harus ada 1 soal");
      return;
    }

    const updated = questions.filter((_, i) => i !== index);
    // Re-number questions
    const renumbered = updated.map((q, i) => ({
      ...q,
      question_number: existingQuestionsCount + 1 + i,
    }));
    setQuestions(renumbered);
  }

  function handleDuplicateQuestion(index: number) {
    const question = questions[index];
    const duplicated: QuestionData = {
      ...question,
      question_number: questions.length + existingQuestionsCount + 1,
    };
    setQuestions([...questions, duplicated]);
    toast.success("Soal berhasil diduplikat");
  }

  async function handleAutoSave() {
    setAutoSaving(true);
    // Simulate auto-save (you can implement actual save to localStorage or draft table)
    setTimeout(() => {
      setAutoSaving(false);
      console.log("Auto-saved at", new Date().toLocaleTimeString());
    }, 1000);
  }

  async function handleSubmit() {
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
        // Validate at least one option has text
        const hasOptions = q.options.some((opt) => opt.text.trim());
        if (!hasOptions) {
          throw new Error(`Soal nomor ${i + 1}: Minimal 1 pilihan harus diisi`);
        }
      }

      // Save directly to Supabase (no n8n webhook)
      const result = await saveQuestionsToSupabase(
        tryout_package_id!,
        questions
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      setFeedback({
        type: "success",
        message: result.message,
      });

      toast.success(result.message);

      // Navigate back to question list after 2 seconds
      setTimeout(() => {
        navigate(`/admin/questions?package=${tryout_package_id}`);
      }, 2000);
    } catch (error: any) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "Gagal menambahkan soal",
      });
      toast.error(error.message || "Gagal menambahkan soal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/admin/questions?package=${tryout_package_id}`}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Daftar Soal
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tambah Soal ke Paket Tryout
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Package ID:{" "}
                <span className="font-mono">{tryout_package_id}</span>
              </p>
              {existingQuestionsCount > 0 && (
                <Badge variant="secondary" className="mt-2">
                  Sudah ada {existingQuestionsCount} soal
                </Badge>
              )}
            </div>
            {autoSaving && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div
              className={`flex items-center gap-2 ${
                currentStep === 1
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 1
                    ? "bg-blue-600 text-white"
                    : currentStep > 1
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : "1"}
              </div>
              <span className="font-medium">Konfigurasi</span>
            </div>
            <div className="w-24 h-1 bg-gray-300 dark:bg-gray-600" />
            <div
              className={`flex items-center gap-2 ${
                currentStep === 2
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="font-medium">Buat Soal</span>
            </div>
          </div>
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

        {/* Step Content */}
        {currentStep === 1 ? (
          <ConfigurationStep
            config={config}
            onChange={handleConfigChange}
            onNext={handleNextStep}
            existingCount={existingQuestionsCount}
            tryoutPackage={tryoutPackage}
            questionBreakdown={questionBreakdown}
          />
        ) : (
          <QuestionFormStep
            questions={questions}
            config={config}
            onQuestionChange={handleQuestionChange}
            onOptionChange={handleOptionChange}
            onAddQuestion={handleAddQuestion}
            onRemoveQuestion={handleRemoveQuestion}
            onDuplicateQuestion={handleDuplicateQuestion}
            onPrevious={handlePreviousStep}
            onSubmit={handleSubmit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
