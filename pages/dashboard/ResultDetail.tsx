import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreDistributionChart } from "@/components/charts/ScoreDistributionChart";
import { PerformanceRadarChart } from "@/components/charts/PerformanceRadarChart";
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
  BookOpen,
  ArrowRight,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TryoutResult } from "@/types/tryout";
import { getTryoutResult } from "@/services/tryout";

export default function ResultDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<TryoutResult | null>(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Hasil Tryout
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              {Array.isArray(result.tryout_packages)
                ? result.tryout_packages[0]?.title || "Tryout Tanpa Judul"
                : result.tryout_packages?.title || "Tryout Tanpa Judul"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/tryout")}
            className="bg-white dark:bg-gray-800"
          >
            <Home className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>

        {/* Pass/Fail Banner */}
        <Card
          className={cn(
            "mb-8 border-2 shadow-lg overflow-hidden",
            isPassed
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 dark:from-green-900/20 dark:to-emerald-900/20"
              : "bg-gradient-to-r from-red-50 to-pink-50 border-red-500 dark:from-red-900/20 dark:to-pink-900/20"
          )}
        >
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-6 mb-6 md:mb-0">
                <div
                  className={cn(
                    "p-4 rounded-full",
                    isPassed
                      ? "bg-green-100 dark:bg-green-800"
                      : "bg-red-100 dark:bg-red-800"
                  )}
                >
                  {isPassed ? (
                    <Trophy className="w-16 h-16 text-green-600 dark:text-green-400" />
                  ) : (
                    <Target className="w-16 h-16 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {isPassed ? "Selamat! Anda Lulus" : "Belum Lulus"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {isPassed
                      ? "Anda telah melampaui passing grade"
                      : "Terus berlatih untuk hasil yang lebih baik"}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-900 dark:text-white">
                  {result.percentage.toFixed(1)}%
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Skor: {result.total_score.toFixed(0)} /{" "}
                  {result.max_score.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
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

          <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
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

          <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
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

          <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ranking
                  </p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    #{result.rank_position || "-"}
                  </p>
                  {result.percentile && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Top {(100 - result.percentile).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Section Details */}
        {result.section_results && result.section_results.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="space-y-8">
              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    Distribusi Skor per Bagian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreDistributionChart
                    sectionResults={result.section_results}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    Analisis Performa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceRadarChart
                    sectionResults={result.section_results}
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white dark:bg-gray-800 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Detail per Bagian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.section_results.map((section) => (
                    <div
                      key={section.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {section.section_name}
                        </h4>
                        <Badge
                          variant={
                            section.percentage >= 65 ? "default" : "secondary"
                          }
                          className="text-sm"
                        >
                          {section.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Benar
                          </p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {section.correct_answers}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Salah
                          </p>
                          <p className="font-semibold text-red-600 dark:text-red-400">
                            {section.wrong_answers}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">
                            Tidak Dijawab
                          </p>
                          <p className="font-semibold text-gray-600 dark:text-gray-400">
                            {section.unanswered}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Review Button Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-bold mb-2">
                  Review Soal & Pembahasan
                </h3>
                <p className="text-blue-100">
                  Pelajari kembali soal-soal yang telah dikerjakan beserta
                  pembahasannya
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => navigate(`/dashboard/review/${sessionId}`)}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Review Soal
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/ranking")}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-3"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Lihat Ranking
          </Button>
          <Button
            onClick={() => navigate("/dashboard/tryout")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Coba Tryout Lain
          </Button>
        </div>
      </div>
    </div>
  );
}
