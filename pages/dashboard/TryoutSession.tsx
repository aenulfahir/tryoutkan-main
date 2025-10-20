import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuestionCard } from "@/components/tryout/QuestionCard";
import { Timer } from "@/components/tryout/Timer";
import { QuestionNavigation } from "@/components/tryout/QuestionNavigation";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Question,
  UserTryoutSession,
  TryoutSection,
} from "@/types/tryout";
import {
  getTryoutSession,
  getQuestions,
  submitAnswer,
  getSessionAnswers,
  calculateTryoutResult,
  updateTryoutSession,
} from "@/services/tryout";

// Section info type
interface SectionInfo {
  id: string;
  name: string;
  startIndex: number;
  endIndex: number;
  totalQuestions: number;
}

export default function TryoutSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<UserTryoutSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sections, setSections] = useState<SectionInfo[]>([]);
  const [sectionsData, setSectionsData] = useState<TryoutSection[]>([]); // Store raw section data
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [timeUpDialog, setTimeUpDialog] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  async function loadSession() {
    try {
      setLoading(true);

      if (!sessionId) return;

      // Load session
      const sessionData = await getTryoutSession(sessionId);
      setSession(sessionData);

      // Check if already completed
      if (sessionData.status === "completed") {
        navigate(`/dashboard/results/${sessionId}`);
        return;
      }

      // Load questions
      const questionsData = await getQuestions(sessionData.tryout_package_id);
      setQuestions(questionsData);

      // Load sections
      const { data: sectionsData } = await supabase
        .from("tryout_sections")
        .select("*")
        .eq("tryout_package_id", sessionData.tryout_package_id)
        .order("section_order");

      // Store raw section data
      setSectionsData(sectionsData || []);

      // Build section info with question ranges
      if (sectionsData) {
        const sectionInfos: SectionInfo[] = [];
        let currentStartIndex = 0;

        sectionsData.forEach((section) => {
          const sectionQuestions = questionsData.filter(
            (q) => q.section_id === section.id
          );
          const totalQuestions = sectionQuestions.length;

          if (totalQuestions > 0) {
            sectionInfos.push({
              id: section.id,
              name: section.section_name,
              startIndex: currentStartIndex,
              endIndex: currentStartIndex + totalQuestions - 1,
              totalQuestions: totalQuestions,
            });
            currentStartIndex += totalQuestions;
          }
        });

        setSections(sectionInfos);
        console.log("📚 Sections loaded:", sectionInfos);
      }

      // Load existing answers
      const answersData = await getSessionAnswers(sessionId);
      const answersMap: Record<string, string> = {};
      answersData.forEach((answer) => {
        if (answer.selected_option) {
          answersMap[answer.question_id] = answer.selected_option;
        }
      });
      setAnswers(answersMap);
    } catch (error) {
      console.error("Error loading session:", error);
      toast.error("Gagal Memuat Tryout", {
        description: "Terjadi kesalahan saat memuat tryout. Silakan coba lagi.",
      });
      navigate("/dashboard/tryout");
    } finally {
      setLoading(false);
    }
  }

  const handleSelectOption = useCallback(
    async (optionKey: string) => {
      const currentQuestion = questions[currentIndex];
      if (!currentQuestion || !sessionId) return;

      // Update local state
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: optionKey,
      }));

      // Save to database
      try {
        await submitAnswer(sessionId, currentQuestion.id, optionKey, 0);
      } catch (error) {
        console.error("Error saving answer:", error);
      }
    },
    [currentIndex, questions, sessionId]
  );

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowNavigation(false);
  };

  const toggleFlag = () => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const handleTimeUp = useCallback(() => {
    setTimeUpDialog(true);
  }, []);

  const handleSubmit = async () => {
    if (!sessionId) return;

    try {
      setSubmitting(true);

      // Calculate result
      const result = await calculateTryoutResult(sessionId);

      if (!result.success) {
        throw new Error(result.message || "Gagal menghitung hasil");
      }

      // Navigate to results
      toast.success("Tryout Selesai!", {
        description: "Hasil Anda sedang dihitung...",
        duration: 2000,
      });

      setTimeout(() => {
        navigate(`/dashboard/results/${sessionId}`);
      }, 500);
    } catch (error: any) {
      console.error("Error submitting tryout:", error);
      toast.error("Gagal Submit Tryout", {
        description:
          error.message ||
          "Terjadi kesalahan saat submit tryout. Silakan coba lagi.",
      });
    } finally {
      setSubmitting(false);
      setSubmitDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Tryout tidak ditemukan</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  // Get current section
  const currentSection = sections.find(
    (s) => currentIndex >= s.startIndex && currentIndex <= s.endIndex
  );

  // Get section progress
  const getSectionProgress = (section: SectionInfo) => {
    const sectionQuestions = questions.slice(
      section.startIndex,
      section.endIndex + 1
    );
    const sectionAnswered = sectionQuestions.filter(
      (q) => answers[q.id]
    ).length;
    return { answered: sectionAnswered, total: section.totalQuestions };
  };

  // Calculate total duration from sections or fallback to package duration
  const getTotalDuration = () => {
    if (sectionsData.length > 0) {
      // Calculate total duration from sections
      const totalFromSections = sectionsData.reduce((total, section) => {
        return total + (section.duration_minutes || 0);
      }, 0);

      return totalFromSections > 0
        ? totalFromSections
        : session.tryout_packages?.duration_minutes || 60;
    }
    return session.tryout_packages?.duration_minutes || 60;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg lg:text-xl font-bold truncate">
                {session.tryout_packages?.title}
              </h1>
              <div className="flex items-center gap-2 text-xs lg:text-sm text-muted-foreground">
                <span>
                  Soal {currentIndex + 1} dari {questions.length}
                </span>
                {currentSection && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline font-medium text-primary">
                      {currentSection.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Timer & Submit */}
            <div className="flex items-center gap-2 lg:gap-4">
              <Timer
                durationMinutes={getTotalDuration()}
                onTimeUp={handleTimeUp}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setSubmitDialog(true)}
                className="whitespace-nowrap"
              >
                <Send className="w-4 h-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">Submit</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Area - Left/Main */}
          <div className="lg:col-span-2 space-y-4">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              selectedOption={answers[currentQuestion.id] || null}
              onSelectOption={handleSelectOption}
            />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                size="lg"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Sebelumnya
              </Button>

              <Button
                variant="outline"
                onClick={toggleFlag}
                size="lg"
                className={cn(
                  flaggedQuestions.has(currentQuestion.id) &&
                    "bg-yellow-100 border-yellow-500 dark:bg-yellow-950"
                )}
              >
                <Flag
                  className={cn(
                    "w-4 h-4 mr-2",
                    flaggedQuestions.has(currentQuestion.id) &&
                      "fill-yellow-500 text-yellow-600"
                  )}
                />
                {flaggedQuestions.has(currentQuestion.id)
                  ? "Batal Tandai"
                  : "Tandai untuk Review"}
              </Button>

              <Button
                variant="default"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                size="lg"
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Navigation Grid - Right Sidebar */}
          <div className="lg:col-span-1">
            <QuestionNavigation
              totalQuestions={questions.length}
              currentQuestion={currentIndex}
              answeredQuestions={
                new Set(
                  Object.keys(answers).map((id) => {
                    return questions.findIndex((q) => q.id === id);
                  })
                )
              }
              flaggedQuestions={
                new Set(
                  Array.from(flaggedQuestions).map((id) => {
                    return questions.findIndex((q) => q.id === id);
                  })
                )
              }
              onNavigate={(index) => setCurrentIndex(index)}
              sections={sections.map((s) => ({
                name: s.name,
                startIndex: s.startIndex,
                endIndex: s.endIndex,
              }))}
            />
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={submitDialog} onOpenChange={setSubmitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Konfirmasi Submit Tryout
            </DialogTitle>
            <DialogDescription>
              Pastikan Anda sudah menjawab semua soal sebelum submit
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Stats */}
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Soal:
                </span>
                <span className="font-semibold">{questions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Sudah Dijawab:
                </span>
                <span className="font-semibold text-green-600">
                  {answeredCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Belum Dijawab:
                </span>
                <span
                  className={cn(
                    "font-semibold",
                    unansweredCount > 0 ? "text-orange-600" : "text-green-600"
                  )}
                >
                  {unansweredCount}
                </span>
              </div>
              {flaggedQuestions.size > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Ditandai untuk Review:
                  </span>
                  <span className="font-semibold text-yellow-600">
                    {flaggedQuestions.size}
                  </span>
                </div>
              )}
            </div>

            {/* Warning */}
            {unansweredCount > 0 && (
              <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                  ⚠️ Anda masih memiliki {unansweredCount} soal yang belum
                  dijawab!
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  Soal yang tidak dijawab akan dianggap salah.
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              Setelah submit, Anda tidak dapat mengubah jawaban lagi. Yakin
              ingin submit sekarang?
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubmitDialog(false)}
              disabled={submitting}
            >
              Batal, lanjut mengerjakan
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ya, Submit Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Old Navigation Dialog - Remove this section */}
      <Dialog open={showNavigation} onOpenChange={setShowNavigation}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Navigasi Soal (Deprecated)</DialogTitle>
            <DialogDescription>
              Gunakan sidebar navigasi di sebelah kanan
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 text-center text-muted-foreground">
            <p>Navigation grid sekarang ada di sidebar kanan</p>
            <Button onClick={() => setShowNavigation(false)} className="mt-4">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Time Up Dialog - Keep existing */}
      <Dialog open={timeUpDialog} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Waktu Habis!
            </DialogTitle>
            <DialogDescription>
              Waktu tryout telah habis. Jawaban Anda akan otomatis disubmit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
