import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuestionCard } from "@/components/tryout/QuestionCard";
import { QuestionNavigation } from "@/components/tryout/QuestionNavigation";
import { YoutubeEmbed } from "@/components/ui/YoutubeEmbed";
import {
  ArrowLeft,
  ArrowRight as ChevronRightIcon,
  BookOpen,
  CheckCircle,
  XCircle,
  MinusCircle,
  Loader2,
  Home,
  Filter,
  Eye,
  EyeOff,
  Play,
  ChevronLeft,
  ChevronRight,
  List,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question, UserAnswer, TryoutResult } from "@/types/tryout";
import {
  getTryoutResult,
  getQuestions,
  getSessionAnswers,
} from "@/services/tryout";

export default function ReviewQuestions() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<TryoutResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);
  const [showOnlyCorrect, setShowOnlyCorrect] = useState(false);
  const [showOnlyUnanswered, setShowOnlyUnanswered] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadReviewData();
    }
  }, [sessionId]);

  async function loadReviewData() {
    try {
      setLoading(true);

      if (!sessionId) return;

      // Load result
      const resultData = await getTryoutResult(sessionId);
      setResult(resultData);

      // Load questions
      const questionsData = await getQuestions(resultData.tryout_package_id);
      setQuestions(questionsData);

      // Load answers
      const answersData = await getSessionAnswers(sessionId);
      setAnswers(answersData);
    } catch (error) {
      console.error("Error loading review data:", error);
      alert("Terjadi kesalahan saat memuat data review");
      navigate(`/dashboard/results/${sessionId}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Data tidak ditemukan</p>
      </div>
    );
  }

  const answersMap = new Map(answers.map((a) => [a.question_id, a]));

  // Filter questions based on selected filters
  const filteredQuestions = questions.filter((q) => {
    const answer = answersMap.get(q.id);

    if (showOnlyWrong && (!answer || answer.is_correct !== false)) return false;
    if (showOnlyCorrect && (!answer || answer.is_correct !== true))
      return false;
    if (showOnlyUnanswered && answer) return false;

    return true;
  });

  const wrongQuestions = questions.filter((q) => {
    const answer = answersMap.get(q.id);
    return answer && answer.is_correct === false;
  });

  const correctQuestions = questions.filter((q) => {
    const answer = answersMap.get(q.id);
    return answer && answer.is_correct === true;
  });

  const unansweredQuestions = questions.filter((q) => {
    return !answersMap.has(q.id);
  });

  const clearFilters = () => {
    setShowOnlyWrong(false);
    setShowOnlyCorrect(false);
    setShowOnlyUnanswered(false);
    setCurrentIndex(0); // Reset to first question when clearing filters
  };

  const hasActiveFilter =
    showOnlyWrong || showOnlyCorrect || showOnlyUnanswered;

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
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

  const currentQuestion = filteredQuestions[currentIndex];
  const currentAnswer = currentQuestion
    ? answersMap.get(currentQuestion.id)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/results/${sessionId}`)}
              className="bg-white dark:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Hasil
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Review Soal & Pembahasan
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {Array.isArray(result.tryout_packages)
                  ? result.tryout_packages[0]?.title || "Tryout Tanpa Judul"
                  : result.tryout_packages?.title || "Tryout Tanpa Judul"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/tryout")}
            className="bg-white dark:bg-gray-800"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Benar
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {result.correct_answers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Salah
                  </p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {result.wrong_answers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <MinusCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tidak Dijawab
                  </p>
                  <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                    {result.unanswered}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <Card className="bg-white dark:bg-gray-800 shadow-md mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter Soal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={showOnlyWrong ? "default" : "outline"}
                onClick={() => {
                  setShowOnlyWrong(!showOnlyWrong);
                  setShowOnlyCorrect(false);
                  setShowOnlyUnanswered(false);
                  setCurrentIndex(0);
                }}
                className={cn(
                  "flex items-center",
                  showOnlyWrong && "bg-red-600 hover:bg-red-700 text-white"
                )}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Salah ({wrongQuestions.length})
              </Button>
              <Button
                variant={showOnlyCorrect ? "default" : "outline"}
                onClick={() => {
                  setShowOnlyCorrect(!showOnlyCorrect);
                  setShowOnlyWrong(false);
                  setShowOnlyUnanswered(false);
                  setCurrentIndex(0);
                }}
                className={cn(
                  "flex items-center",
                  showOnlyCorrect &&
                    "bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Benar ({correctQuestions.length})
              </Button>
              <Button
                variant={showOnlyUnanswered ? "default" : "outline"}
                onClick={() => {
                  setShowOnlyUnanswered(!showOnlyUnanswered);
                  setShowOnlyWrong(false);
                  setShowOnlyCorrect(false);
                  setCurrentIndex(0);
                }}
                className={cn(
                  "flex items-center",
                  showOnlyUnanswered &&
                    "bg-gray-600 hover:bg-gray-700 text-white"
                )}
              >
                <MinusCircle className="w-4 h-4 mr-2" />
                Tidak Dijawab ({unansweredQuestions.length})
              </Button>
              {hasActiveFilter && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center"
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hapus Filter
                </Button>
              )}
            </div>
            {hasActiveFilter && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Menampilkan {filteredQuestions.length} dari {questions.length}{" "}
                  soal
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {filteredQuestions.length > 0 ? (
          <>
            {/* Question Progress */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Soal {currentIndex + 1} dari {filteredQuestions.length}
                  </span>
                  {currentAnswer && (
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          currentAnswer.is_correct === true
                            ? "default"
                            : currentAnswer.is_correct === false
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {currentAnswer.is_correct === true
                          ? "Benar"
                          : currentAnswer.is_correct === false
                          ? "Salah"
                          : "Tidak Dijawab"}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Jawaban Anda: {currentAnswer.selected_option}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNavigation(!showNavigation)}
                  className="lg:hidden"
                >
                  <List className="w-4 h-4 mr-2" />
                  Navigasi
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Question Area - Left/Main */}
              <div className="lg:col-span-3">
                {currentQuestion && (
                  <Card className="bg-white dark:bg-gray-800 shadow-md">
                    <CardContent className="p-6">
                      <QuestionCard
                        question={currentQuestion}
                        questionNumber={currentQuestion.question_number}
                        selectedOption={currentAnswer?.selected_option || null}
                        onSelectOption={() => {}}
                        showExplanation={true}
                      />

                      {/* Video Pembahasan Section */}
                      {currentQuestion.explanation_video_url && (
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                            <Play className="w-5 h-5 mr-2" />
                            Video Pembahasan
                          </h4>

                          {/* Check if it's a YouTube URL or direct video URL */}
                          {currentQuestion.explanation_video_url.includes(
                            "youtube.com"
                          ) ||
                          currentQuestion.explanation_video_url.includes(
                            "youtu.be"
                          ) ? (
                            <YoutubeEmbed
                              videoId={currentQuestion.explanation_video_url}
                              title={`Video pembahasan untuk soal ${currentQuestion.question_number}`}
                              className="w-full"
                            />
                          ) : (
                            <div className="aspect-video bg-black rounded-lg overflow-hidden">
                              <video
                                controls
                                className="w-full h-full"
                                poster={currentQuestion.image_url || undefined}
                              >
                                <source
                                  src={currentQuestion.explanation_video_url}
                                  type="video/mp4"
                                />
                                Browser Anda tidak mendukung video tag.
                              </video>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="min-h-[44px] px-6"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Sebelumnya
                  </Button>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentIndex + 1} / {filteredQuestions.length}
                  </div>

                  <Button
                    variant="default"
                    onClick={handleNext}
                    disabled={currentIndex === filteredQuestions.length - 1}
                    className="min-h-[44px] px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    Selanjutnya
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Navigation Grid - Right Sidebar (Hidden on Mobile) */}
              <div className="hidden lg:block lg:col-span-1">
                <QuestionNavigation
                  totalQuestions={filteredQuestions.length}
                  currentQuestion={currentIndex}
                  answeredQuestions={
                    new Set(
                      filteredQuestions
                        .map((q, idx) => {
                          const answer = answersMap.get(q.id);
                          return answer ? idx : -1;
                        })
                        .filter((idx) => idx >= 0)
                    )
                  }
                  flaggedQuestions={new Set()}
                  onNavigate={handleGoToQuestion}
                  sections={[]}
                />
              </div>
            </div>

            {/* Mobile Navigation Dialog */}
            {showNavigation && (
              <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-semibold">Navigasi Soal</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNavigation(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from(
                        { length: filteredQuestions.length },
                        (_, i) => {
                          const answer = answersMap.get(
                            filteredQuestions[i].id
                          );
                          const isAnswered = !!answer;
                          const isCorrect = answer?.is_correct === true;
                          const isWrong = answer?.is_correct === false;

                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleGoToQuestion(i)}
                              className={cn(
                                "aspect-square rounded-md font-semibold text-sm transition-all relative",
                                "hover:scale-105 active:scale-95",
                                "border-2 min-h-[44px] min-w-[44px]",
                                currentIndex === i
                                  ? "bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300 ring-offset-2"
                                  : isCorrect
                                  ? "bg-green-500 text-white border-green-600"
                                  : isWrong
                                  ? "bg-red-500 text-white border-red-600"
                                  : isAnswered
                                  ? "bg-gray-500 text-white border-gray-600"
                                  : "bg-gray-200 text-gray-700 border-gray-300"
                              )}
                            >
                              {filteredQuestions[i].question_number}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Tidak ada soal yang sesuai dengan filter
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Coba hapus filter untuk melihat semua soal
              </p>
              <Button onClick={clearFilters}>
                <Eye className="w-4 h-4 mr-2" />
                Tampilkan Semua Soal
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-center mt-12 space-x-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/dashboard/results/${sessionId}`)}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-3"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Hasil
          </Button>
          <Button
            onClick={() => navigate("/dashboard/tryout")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
          >
            <Home className="w-5 h-5 mr-2" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
