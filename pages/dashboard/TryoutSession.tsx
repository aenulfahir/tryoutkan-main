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
import { RefreshWarningDialog } from "@/components/tryout/RefreshWarningDialog";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  Loader2,
  AlertTriangle,
  List,
  ArrowUpDown,
  ArrowLeft as ChevronLeftIcon,
  ArrowRight as ChevronRightIcon,
  Bookmark,
  BookmarkCheck,
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
import {
  useSwipeNavigation,
  useKeyboardNavigation,
} from "@/hooks/useSwipeNavigation";

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
  const [showJumpDialog, setShowJumpDialog] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0); // Track elapsed time from database
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  // Add beforeunload event listener to show confirmation dialog
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show confirmation if session is active and not completed and not already showing custom dialog
      if (session && session.status === "in_progress" && !showRefreshWarning) {
        const message =
          "Apakah Anda yakin ingin meninggalkan halaman ini? Progress tryout Anda akan tersimpan, namun timer akan terus berjalan.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session, showRefreshWarning]);

  // Handle keyboard shortcuts for refresh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for F5 or Ctrl+R / Cmd+R
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r") ||
        (e.metaKey && e.key === "r")
      ) {
        // Only show custom dialog if session is active and not completed
        if (session && session.status === "in_progress" && !isRefreshing) {
          e.preventDefault();
          setShowRefreshWarning(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [session, isRefreshing]);

  const handleRefreshConfirm = () => {
    setIsRefreshing(true);
    setShowRefreshWarning(false);
    // Remove the beforeunload listener temporarily to allow refresh
    window.removeEventListener("beforeunload", () => {});
    window.location.reload();
  };

  const handleRefreshCancel = () => {
    setShowRefreshWarning(false);
  };

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

      // Calculate elapsed time if session is in progress
      let elapsedSeconds = 0;
      if (sessionData.status === "in_progress" && sessionData.started_at) {
        const startTime = new Date(sessionData.started_at).getTime();
        const currentTime = Date.now();
        elapsedSeconds = Math.floor((currentTime - startTime) / 1000);

        // Also consider time_spent_seconds from database
        elapsedSeconds = Math.max(
          elapsedSeconds,
          sessionData.time_spent_seconds || 0
        );
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

      // Store elapsed time for timer initialization
      if (elapsedSeconds > 0) {
        console.log("⏱️ Elapsed time loaded:", elapsedSeconds, "seconds");
        setElapsedSeconds(elapsedSeconds);
      }
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

  const handleJumpToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowJumpDialog(false);
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

  // Mobile swipe navigation
  useSwipeNavigation({
    onSwipeLeft: () => {
      if (currentIndex < questions.length - 1) {
        handleNext();
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        handlePrevious();
      }
    },
    threshold: 50,
    preventDefault: false, // Allow normal scrolling, only prevent for horizontal swipes
  });

  // Keyboard navigation
  useKeyboardNavigation(
    handlePrevious,
    handleNext,
    toggleFlag,
    handleSubmit,
    handleGoToQuestion,
    questions.length
  );

  // Quick jump navigation for mobile
  // useQuickJumpNavigation(questions.length, handleJumpToQuestion);
  // Commented out because hook is not defined yet
  // Will be implemented when needed

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

  // Create answeredQuestions set for mobile quick jump
  const answeredQuestions = new Set(
    Object.keys(answers).map((id) => {
      return questions.findIndex((q) => q.id === id);
    })
  );

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
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold truncate">
                {session.tryout_packages?.title}
              </h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
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
            <div className="flex items-center gap-2 sm:gap-4">
              <Timer
                durationMinutes={getTotalDuration()}
                onTimeUp={handleTimeUp}
                sessionId={sessionId}
                initialElapsed={elapsedSeconds}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setSubmitDialog(true)}
                className="whitespace-nowrap min-h-[44px] px-3 sm:px-4"
              >
                <Send className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline sm:inline">Submit</span>
                <span className="xs:hidden">Selesai</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Question Area - Left/Main */}
          <div className="lg:col-span-2 space-y-4">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              selectedOption={answers[currentQuestion.id] || null}
              onSelectOption={handleSelectOption}
            />

            {/* Navigation Buttons */}
            <div className="flex flex-col xs:flex-row items-center justify-between gap-2 xs:gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                size="lg"
                className="w-full xs:w-auto min-h-[44px]"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">←</span>
                <span className="xs:hidden">←</span>
              </Button>

              <Button
                variant="outline"
                onClick={toggleFlag}
                size="lg"
                className={cn(
                  "w-full xs:w-auto min-h-[44px]",
                  flaggedQuestions.has(currentQuestion.id) &&
                    "bg-yellow-100 border-yellow-500 dark:bg-yellow-950"
                )}
              >
                {flaggedQuestions.has(currentQuestion.id) ? (
                  <BookmarkCheck className="w-4 h-4 mr-2 text-yellow-600" />
                ) : (
                  <Bookmark className="w-4 h-4 mr-2" />
                )}
                <span className="hidden xs:inline">
                  {flaggedQuestions.has(currentQuestion.id)
                    ? "Batal Tandai"
                    : "Tandai"}
                </span>
                <span className="xs:hidden">
                  {flaggedQuestions.has(currentQuestion.id) ? "★" : "☆"}
                </span>
              </Button>

              <Button
                variant="default"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                size="lg"
                className="w-full xs:w-auto min-h-[44px]"
              >
                <span className="hidden xs:inline">→</span>
                <span className="xs:inline">→</span>
                <ChevronRightIcon className="w-4 h-4 ml-2 hidden xs:inline" />
              </Button>
            </div>

            {/* Mobile Quick Jump */}
            <div className="lg:hidden mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <List className="w-4 h-4" />
                  <span>Loncat ke Soal:</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Tekan 1-9 untuk soal 1-9, atau 0 untuk soal 10
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {Array.from(
                  { length: Math.min(10, questions.length) },
                  (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentIndex(i)}
                      className={cn(
                        "aspect-square rounded-md font-semibold text-sm transition-all relative",
                        "hover:scale-105 active:scale-95",
                        "border-2 min-h-[44px] min-w-[44px]",
                        currentIndex === i
                          ? "bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300 ring-offset-2"
                          : answeredQuestions.has(i)
                          ? "bg-green-500 text-white border-green-600"
                          : "bg-gray-200 text-gray-700 border-gray-300"
                      )}
                    >
                      {i + 1}
                    </button>
                  )
                )}
              </div>
              {questions.length > 10 && (
                <div className="mt-2 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowJumpDialog(true)}
                    className="text-xs"
                  >
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                    Soal 11-{questions.length}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Grid - Right Sidebar (Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-1">
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

      {/* Jump Dialog for Mobile */}
      <Dialog open={showJumpDialog} onOpenChange={setShowJumpDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <List className="w-5 h-5" />
              Loncat ke Soal
            </DialogTitle>
            <DialogDescription>
              Pilih nomor soal yang ingin dituju
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-5 gap-3 p-4">
            {Array.from({ length: questions.length }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleJumpToQuestion(i)}
                className={cn(
                  "aspect-square rounded-lg font-semibold text-sm transition-all relative",
                  "hover:scale-105 active:scale-95",
                  "border-2 min-h-[44px] min-w-[44px]",
                  currentIndex === i
                    ? "bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300 ring-offset-2"
                    : answeredQuestions.has(i)
                    ? "bg-green-500 text-white border-green-600"
                    : "bg-gray-200 text-gray-700 border-gray-300"
                )}
              >
                {i + 1}
                {answeredQuestions.has(i) && (
                  <div className="absolute top-0 right-0 w-2 h-2 bg-green-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowJumpDialog(false)}
              className="w-full"
            >
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Refresh Warning Dialog */}
      <RefreshWarningDialog
        open={showRefreshWarning}
        onOpenChange={setShowRefreshWarning}
        onConfirm={handleRefreshConfirm}
        onCancel={handleRefreshCancel}
      />
    </div>
  );
}
