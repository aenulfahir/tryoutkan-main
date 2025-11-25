import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
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
  Send,
  Loader2,
  AlertTriangle,
  List,
  ArrowUpDown,
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
  const [submitDialog, setSubmitDialog] = useState(false);
  const [timeUpDialog, setTimeUpDialog] = useState(false);
  const [showJumpDialog, setShowJumpDialog] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0); // Track elapsed time from database
  const [showRefreshWarning, setShowRefreshWarning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBackWarning, setShowBackWarning] = useState(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  // Add beforeunload event listener to show confirmation dialog
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show confirmation if session is active and not navigating away intentionally
      if (
        session &&
        session.status === "in_progress" &&
        !showRefreshWarning &&
        !showBackWarning &&
        !isNavigatingAway &&
        !submitting
      ) {
        // Standard message (most browsers ignore this and show their own generic message)
        const message = "Perubahan yang belum disimpan mungkin akan hilang.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session, showRefreshWarning, showBackWarning, isNavigatingAway, submitting]);

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
        if (session && session.status === "in_progress" && !isRefreshing && !submitting) {
          e.preventDefault();
          setShowRefreshWarning(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [session, isRefreshing, submitting]);

  const handleRefreshConfirm = () => {
    setIsRefreshing(true);
    setShowRefreshWarning(false);
    // Remove the beforeunload listener temporarily to allow refresh
    window.onbeforeunload = null;
    window.location.reload();
  };

  const handleRefreshCancel = () => {
    setShowRefreshWarning(false);
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // Prevent default back navigation if session is active
      if (session && session.status === "in_progress" && !isNavigatingAway && !submitting) {
        // Prevent the navigation
        e.preventDefault();

        // Push state again to maintain the current URL and history state
        // This effectively "cancels" the back button action in the browser history
        window.history.pushState(null, "", window.location.href);

        // Show warning dialog
        setShowBackWarning(true);
      }
    };

    // Push initial state to enable popstate detection
    // We need at least one history entry to "go back" to
    if (session && session.status === "in_progress") {
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [session, isNavigatingAway, submitting]);

  const handleBackConfirm = async () => {
    setIsNavigatingAway(true);
    setShowBackWarning(false);

    // Auto-submit the tryout before navigating
    try {
      setSubmitting(true);
      toast.info("Menyimpan Progress...", {
        description: "Hasil tryout akan disubmit otomatis",
        duration: 2000,
      });

      if (sessionId) {
        await calculateTryoutResult(sessionId);
      }

      // Navigate back after submission
      // We use replace to avoid adding to history stack
      setTimeout(() => {
        navigate("/dashboard/tryout", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Error auto-submitting:", error);
      // Still allow navigation even if submit fails
      setTimeout(() => {
        navigate("/dashboard/tryout", { replace: true });
      }, 1000);
    }
  };

  const handleBackCancel = () => {
    setShowBackWarning(false);
    // Re-push state to maintain protection just in case
    window.history.pushState(null, "", window.location.href);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!session || questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-black font-bold">Tryout tidak ditemukan</p>
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
    <div className="min-h-screen bg-white text-black">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white border-b-2 border-black shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-black truncate text-black">
                {session.tryout_packages?.title}
              </h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 font-medium">
                <span>
                  Soal {currentIndex + 1} dari {questions.length}
                </span>
                {currentSection && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline font-bold text-black">
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
                className="whitespace-nowrap min-h-[44px] px-3 sm:px-4 bg-black text-white hover:bg-gray-800 border-2 border-black font-bold"
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
            <div className="flex flex-col xs:flex-row items-center justify-between gap-2 xs:gap-4 pt-4 border-t-2 border-gray-100">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                size="lg"
                className="w-full xs:w-auto min-h-[44px] border-2 border-black font-bold hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Sebelumnya</span>
                <span className="xs:hidden">Prev</span>
              </Button>

              <Button
                variant="outline"
                onClick={toggleFlag}
                size="lg"
                className={cn(
                  "w-full xs:w-auto min-h-[44px] border-2 font-bold transition-all",
                  flaggedQuestions.has(currentQuestion.id)
                    ? "bg-yellow-50 border-yellow-500 text-yellow-700 hover:bg-yellow-100"
                    : "border-black hover:bg-gray-100"
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
                    : "Tandai Ragu"}
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
                className="w-full xs:w-auto min-h-[44px] bg-black text-white hover:bg-gray-800 border-2 border-black font-bold"
              >
                <span className="hidden xs:inline">Selanjutnya</span>
                <span className="xs:inline xs:hidden">Next</span>
                <ChevronRight className="w-4 h-4 ml-2 hidden xs:inline" />
              </Button>
            </div>

            {/* Mobile Quick Jump */}
            <div className="lg:hidden mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-black">
                  <List className="w-4 h-4" />
                  <span>Loncat ke Soal:</span>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Tekan nomor untuk navigasi
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
                        "aspect-square rounded-lg font-bold text-sm transition-all relative",
                        "hover:scale-105 active:scale-95",
                        "border-2 min-h-[44px] min-w-[44px]",
                        currentIndex === i
                          ? "bg-black text-white border-black"
                          : answeredQuestions.has(i)
                            ? "bg-white text-black border-black"
                            : "bg-white text-gray-400 border-gray-200"
                      )}
                    >
                      {i + 1}
                    </button>
                  )
                )}
              </div>
              {questions.length > 10 && (
                <div className="mt-3 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowJumpDialog(true)}
                    className="text-xs border-2 border-black font-bold hover:bg-gray-100"
                  >
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                    Lihat Semua Soal ({questions.length})
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
        <DialogContent className="max-w-md border-2 border-black bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black text-xl">
              <AlertTriangle className="w-5 h-5 text-black" />
              Konfirmasi Submit
            </DialogTitle>
            <DialogDescription className="text-gray-600 font-medium">
              Pastikan Anda sudah yakin dengan jawaban Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Stats */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 border-2 border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">
                  Total Soal:
                </span>
                <span className="font-black">{questions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">
                  Sudah Dijawab:
                </span>
                <span className="font-black text-black">
                  {answeredCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">
                  Belum Dijawab:
                </span>
                <span
                  className={cn(
                    "font-black",
                    unansweredCount > 0 ? "text-red-600" : "text-black"
                  )}
                >
                  {unansweredCount}
                </span>
              </div>
              {flaggedQuestions.size > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">
                    Ditandai Ragu:
                  </span>
                  <span className="font-black text-yellow-600">
                    {flaggedQuestions.size}
                  </span>
                </div>
              )}
            </div>

            {/* Warning */}
            {unansweredCount > 0 && (
              <div className="bg-red-50 border-2 border-red-100 rounded-xl p-4">
                <p className="text-sm text-red-800 font-bold">
                  ⚠️ Peringatan: {unansweredCount} soal belum dijawab!
                </p>
                <p className="text-xs text-red-600 mt-1 font-medium">
                  Soal kosong akan dianggap salah.
                </p>
              </div>
            )}

            <p className="text-sm text-gray-600 font-medium">
              Apakah Anda yakin ingin mengakhiri tryout ini sekarang?
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setSubmitDialog(false)}
              disabled={submitting}
              className="border-2 border-black font-bold hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ya, Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Up Dialog */}
      <Dialog open={timeUpDialog} onOpenChange={() => { }}>
        <DialogContent
          className="max-w-md border-2 border-black bg-white"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black text-xl">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Waktu Habis!
            </DialogTitle>
            <DialogDescription className="text-gray-600 font-medium">
              Waktu pengerjaan telah berakhir. Jawaban Anda akan otomatis disubmit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-black text-white hover:bg-gray-800 w-full font-bold"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Proses Hasil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Jump Dialog for Mobile */}
      <Dialog open={showJumpDialog} onOpenChange={setShowJumpDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto border-2 border-black bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black text-xl">
              <List className="w-5 h-5" />
              Navigasi Soal
            </DialogTitle>
            <DialogDescription className="text-gray-600 font-medium">
              Pilih nomor soal yang ingin dituju
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-5 gap-3 p-2">
            {Array.from({ length: questions.length }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleJumpToQuestion(i)}
                className={cn(
                  "aspect-square rounded-lg font-bold text-sm transition-all relative",
                  "hover:scale-105 active:scale-95",
                  "border-2 min-h-[44px] min-w-[44px]",
                  currentIndex === i
                    ? "bg-black text-white border-black"
                    : answeredQuestions.has(i)
                      ? "bg-white text-black border-black"
                      : "bg-white text-gray-400 border-gray-200"
                )}
              >
                {i + 1}
                {answeredQuestions.has(i) && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full" />
                )}
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowJumpDialog(false)}
              className="w-full border-2 border-black font-bold"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refresh Warning Dialog */}
      <RefreshWarningDialog
        open={showRefreshWarning}
        onConfirm={handleRefreshConfirm}
        onCancel={handleRefreshCancel}
      />

      {/* Back Button Warning Dialog */}
      <Dialog open={showBackWarning} onOpenChange={setShowBackWarning}>
        <DialogContent
          className="max-w-md border-2 border-black bg-white"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black text-xl">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Keluar dari Tryout?
            </DialogTitle>
            <DialogDescription className="text-gray-600 font-medium">
              Anda mencoba keluar dari sesi tryout yang sedang berlangsung.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 border-2 border-yellow-100 rounded-xl p-4">
              <p className="text-sm text-yellow-800 font-bold">
                ⚠️ Peringatan
              </p>
              <p className="text-xs text-yellow-700 mt-2 font-medium">
                Jika Anda keluar sekarang, tryout akan otomatis disubmit dengan jawaban yang sudah Anda isi.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 border-2 border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">
                  Sudah Dijawab:
                </span>
                <span className="font-black text-black">
                  {Object.keys(answers).length} dari {questions.length}
                </span>
              </div>
              {questions.length - Object.keys(answers).length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">
                    Belum Dijawab:
                  </span>
                  <span className="font-black text-red-600">
                    {questions.length - Object.keys(answers).length}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 font-medium">
              Apakah Anda yakin ingin keluar dan submit tryout sekarang?
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleBackCancel}
              className="border-2 border-black font-bold hover:bg-gray-100"
            >
              Lanjut Tryout
            </Button>
            <Button
              variant="destructive"
              onClick={handleBackConfirm}
              className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold"
            >
              Ya, Keluar & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
