import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreDistributionChart } from "@/components/charts/ScoreDistributionChart";
import { PerformanceRadarChart } from "@/components/charts/PerformanceRadarChart";
import { QuestionCard } from "@/components/tryout/QuestionCard";
import {
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  MinusCircle,
  TrendingUp,
  Award,
  Loader2,
  Home,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TryoutResult, Question, UserAnswer } from "@/types/tryout";
import {
  getTryoutResult,
  getQuestions,
  getSessionAnswers,
} from "@/services/tryout";

export default function ResultDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<TryoutResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      loadResults();
    }
  }, [sessionId]);

  async function loadResults() {
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
      console.error("Error loading results:", error);
      alert("Terjadi kesalahan saat memuat hasil");
      navigate("/dashboard/tryout");
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
        <p>Hasil tidak ditemukan</p>
      </div>
    );
  }

  const isPassed = result.passed || result.percentage >= 65;
  const answersMap = new Map(answers.map((a) => [a.question_id, a]));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hasil Tryout</h1>
          <p className="text-muted-foreground mt-1">
            {Array.isArray(result.tryout_packages)
              ? result.tryout_packages[0]?.title || "Tryout Tanpa Judul"
              : result.tryout_packages?.title || "Tryout Tanpa Judul"}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/dashboard/tryout")}>
          <Home className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </div>

      {/* Pass/Fail Banner */}
      <Card
        className={cn(
          "border-2",
          isPassed
            ? "bg-green-50 border-green-500 dark:bg-green-950"
            : "bg-red-50 border-red-500 dark:bg-red-950"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isPassed ? (
                <Trophy className="w-12 h-12 text-green-600 dark:text-green-400" />
              ) : (
                <Target className="w-12 h-12 text-red-600 dark:text-red-400" />
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  {isPassed ? "Selamat! Anda Lulus" : "Belum Lulus"}
                </h2>
                <p className="text-muted-foreground">
                  {isPassed
                    ? "Anda telah melampaui passing grade"
                    : "Terus berlatih untuk hasil yang lebih baik"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">
                {result.percentage.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Skor: {result.total_score.toFixed(0)} /{" "}
                {result.max_score.toFixed(0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Benar</p>
                <p className="text-2xl font-bold">{result.correct_answers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salah</p>
                <p className="text-2xl font-bold">{result.wrong_answers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <MinusCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tidak Dijawab</p>
                <p className="text-2xl font-bold">{result.unanswered}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ranking</p>
                <p className="text-2xl font-bold">
                  #{result.rank_position || "-"}
                </p>
                {result.percentile && (
                  <p className="text-xs text-muted-foreground">
                    Top {(100 - result.percentile).toFixed(0)}%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {result.section_results && result.section_results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Skor per Bagian</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreDistributionChart sectionResults={result.section_results} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analisis Performa</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceRadarChart sectionResults={result.section_results} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section Details */}
      {result.section_results && result.section_results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detail per Bagian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.section_results.map((section) => (
                <div
                  key={section.id}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{section.section_name}</h4>
                    <Badge
                      variant={
                        section.percentage >= 65 ? "default" : "secondary"
                      }
                    >
                      {section.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Benar</p>
                      <p className="font-semibold text-green-600">
                        {section.correct_answers}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Salah</p>
                      <p className="font-semibold text-red-600">
                        {section.wrong_answers}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tidak Dijawab</p>
                      <p className="font-semibold text-gray-600">
                        {section.unanswered}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Review Soal & Pembahasan</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wrong" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="wrong">
                Salah ({result.wrong_answers})
              </TabsTrigger>
              <TabsTrigger value="correct">
                Benar ({result.correct_answers})
              </TabsTrigger>
              <TabsTrigger value="all">Semua ({questions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="wrong" className="space-y-6 mt-6">
              {questions
                .filter((q) => {
                  const answer = answersMap.get(q.id);
                  return answer && answer.is_correct === false;
                })
                .map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    questionNumber={q.question_number}
                    selectedOption={
                      answersMap.get(q.id)?.selected_option || null
                    }
                    onSelectOption={() => {}}
                    showExplanation={true}
                  />
                ))}
              {questions.filter((q) => {
                const answer = answersMap.get(q.id);
                return answer && answer.is_correct === false;
              }).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Tidak ada jawaban yang salah
                </p>
              )}
            </TabsContent>

            <TabsContent value="correct" className="space-y-6 mt-6">
              {questions
                .filter((q) => {
                  const answer = answersMap.get(q.id);
                  return answer && answer.is_correct === true;
                })
                .map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    questionNumber={q.question_number}
                    selectedOption={
                      answersMap.get(q.id)?.selected_option || null
                    }
                    onSelectOption={() => {}}
                    showExplanation={true}
                  />
                ))}
            </TabsContent>

            <TabsContent value="all" className="space-y-6 mt-6">
              {questions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  questionNumber={q.question_number}
                  selectedOption={answersMap.get(q.id)?.selected_option || null}
                  onSelectOption={() => {}}
                  showExplanation={true}
                />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/ranking")}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Lihat Ranking
        </Button>
        <Button onClick={() => navigate("/dashboard/tryout")}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Coba Tryout Lain
        </Button>
      </div>
    </div>
  );
}
