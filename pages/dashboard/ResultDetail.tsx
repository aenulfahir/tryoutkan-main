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
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-black font-bold">Hasil tidak ditemukan</p>
      </div>
    );
  }

  const isPassed = result.passed || result.percentage >= 65;

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-black tracking-tight">
              Hasil Tryout
            </h1>
            <p className="text-lg text-gray-600 mt-2 font-medium">
              {Array.isArray(result.tryout_packages)
                ? result.tryout_packages[0]?.title || "Tryout Tanpa Judul"
                : result.tryout_packages?.title || "Tryout Tanpa Judul"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/tryout")}
            className="bg-white border-2 border-black text-black font-bold hover:bg-gray-100"
          >
            <Home className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>

        {/* Pass/Fail Banner */}
        <Card
          className={cn(
            "mb-8 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden",
            isPassed
              ? "bg-green-50 border-green-600"
              : "bg-red-50 border-red-600"
          )}
        >
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-6 mb-6 md:mb-0">
                <div
                  className={cn(
                    "p-4 rounded-full border-2",
                    isPassed
                      ? "bg-green-100 border-green-600"
                      : "bg-red-100 border-red-600"
                  )}
                >
                  {isPassed ? (
                    <Trophy className="w-16 h-16 text-green-600" />
                  ) : (
                    <Target className="w-16 h-16 text-red-600" />
                  )}
                </div>
                <div>
                  <h2 className={cn("text-3xl font-black", isPassed ? "text-green-800" : "text-red-800")}>
                    {isPassed ? "Selamat! Anda Lulus" : "Belum Lulus"}
                  </h2>
                  <p className={cn("mt-1 font-medium", isPassed ? "text-green-700" : "text-red-700")}>
                    {isPassed
                      ? "Anda telah melampaui passing grade"
                      : "Terus berlatih untuk hasil yang lebih baik"}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className={cn("text-5xl font-black", isPassed ? "text-green-800" : "text-red-800")}>
                  {result.percentage.toFixed(1)}%
                </p>
                <p className={cn("text-lg font-bold", isPassed ? "text-green-700" : "text-red-700")}>
                  Skor: {result.total_score.toFixed(0)} /{" "}
                  {result.max_score.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg border-2 border-green-600">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold">
                    Benar
                  </p>
                  <p className="text-3xl font-black text-black">
                    {result.correct_answers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg border-2 border-red-600">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold">
                    Salah
                  </p>
                  <p className="text-3xl font-black text-black">
                    {result.wrong_answers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg border-2 border-gray-400">
                  <MinusCircle className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold">
                    Tidak Dijawab
                  </p>
                  <p className="text-3xl font-black text-black">
                    {result.unanswered}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-black rounded-lg border-2 border-black">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-bold">
                    Ranking
                  </p>
                  <p className="text-3xl font-black text-black">
                    #{result.rank_position || "-"}
                  </p>
                  {result.percentile && (
                    <p className="text-xs text-gray-500 font-medium">
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
              <Card className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="border-b-2 border-gray-100">
                  <CardTitle className="text-xl font-black text-black">
                    Distribusi Skor per Bagian
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ScoreDistributionChart
                    sectionResults={result.section_results}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader className="border-b-2 border-gray-100">
                  <CardTitle className="text-xl font-black text-black">
                    Analisis Performa
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <PerformanceRadarChart
                    sectionResults={result.section_results}
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="border-b-2 border-gray-100">
                <CardTitle className="text-xl font-black text-black">
                  Detail per Bagian
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {result.section_results.map((section) => (
                    <div
                      key={section.id}
                      className="p-4 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-black text-lg">
                          {section.section_name}
                        </h4>
                        <Badge
                          variant={
                            section.percentage >= 65 ? "default" : "secondary"
                          }
                          className={cn(
                            "text-sm font-bold border-2",
                            section.percentage >= 65
                              ? "bg-green-100 text-green-700 border-green-600"
                              : "bg-red-100 text-red-700 border-red-600"
                          )}
                        >
                          {section.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 font-medium">
                            Benar
                          </p>
                          <p className="font-black text-green-600 text-lg">
                            {section.correct_answers}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">
                            Salah
                          </p>
                          <p className="font-black text-red-600 text-lg">
                            {section.wrong_answers}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">
                            Kosong
                          </p>
                          <p className="font-black text-gray-400 text-lg">
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
        <Card className="bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8 border-2 border-black">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-black mb-2">
                  Review Soal & Pembahasan
                </h3>
                <p className="text-gray-300 font-medium">
                  Pelajari kembali soal-soal yang telah dikerjakan beserta
                  pembahasannya
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => navigate(`/dashboard/review/${sessionId}`)}
                className="bg-white text-black hover:bg-gray-200 font-black px-8 py-6 text-lg border-2 border-white"
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
            className="bg-white border-2 border-black text-black font-bold hover:bg-gray-100 px-6 py-6 w-full sm:w-auto"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Lihat Ranking
          </Button>
          <Button
            onClick={() => navigate("/dashboard/tryout")}
            className="bg-black hover:bg-gray-800 text-white px-6 py-6 font-bold border-2 border-black w-full sm:w-auto"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Coba Tryout Lain
          </Button>
        </div>
      </div>
    </div>
  );
}
