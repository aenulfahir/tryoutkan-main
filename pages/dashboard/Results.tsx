import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  BarChart3,
  CheckCircle,
  XCircle,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface TryoutResultItem {
  id: string;
  user_tryout_session_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  rank_position: number | null;
  percentile: number | null;
  passed: boolean;
  created_at: string;
  tryout_packages:
    | {
        title: string;
        category: string;
      }
    | {
        title: string;
        category: string;
      }[]
    | null;
}

export default function Results() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState<TryoutResultItem[]>([]);
  const [filteredResults, setFilteredResults] = useState<TryoutResultItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Filters & Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc");

  // Stats
  const [stats, setStats] = useState({
    totalTryouts: 0,
    averageScore: 0,
    bestScore: 0,
    passRate: 0,
  });

  useEffect(() => {
    loadResults();
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [results, searchQuery, categoryFilter, statusFilter, sortBy]);

  async function loadResults() {
    if (!user) return;

    try {
      setLoading(true);

      // Load all results for user
      const { data, error } = await supabase
        .from("tryout_results")
        .select(
          `
          id,
          user_tryout_session_id,
          total_score,
          max_score,
          percentage,
          correct_answers,
          wrong_answers,
          unanswered,
          rank_position,
          percentile,
          passed,
          created_at,
          tryout_packages (
            title,
            category
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setResults(data || []);

      // Calculate stats
      if (data && data.length > 0) {
        const totalTryouts = data.length;
        const averageScore =
          data.reduce((sum, r) => sum + r.percentage, 0) / totalTryouts;
        const bestScore = Math.max(...data.map((r) => r.percentage));
        const passedCount = data.filter((r) => r.passed).length;
        const passRate = (passedCount / totalTryouts) * 100;

        setStats({
          totalTryouts,
          averageScore,
          bestScore,
          passRate,
        });
      }
    } catch (error) {
      console.error("Error loading results:", error);
      toast.error("Gagal memuat hasil tryout");
    } finally {
      setLoading(false);
    }
  }

  function applyFiltersAndSort() {
    let filtered = [...results];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((r) => {
        const title = Array.isArray(r.tryout_packages)
          ? r.tryout_packages[0]?.title
          : r.tryout_packages?.title;
        return title?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((r) => {
        const category = Array.isArray(r.tryout_packages)
          ? r.tryout_packages[0]?.category
          : r.tryout_packages?.category;
        return category === categoryFilter;
      });
    }

    // Status filter
    if (statusFilter === "passed") {
      filtered = filtered.filter((r) => r.passed);
    } else if (statusFilter === "failed") {
      filtered = filtered.filter((r) => !r.passed);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date_desc":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "date_asc":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "score_desc":
          return b.percentage - a.percentage;
        case "score_asc":
          return a.percentage - b.percentage;
        default:
          return 0;
      }
    });

    setFilteredResults(filtered);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan yang lalu`;
    return `${Math.floor(diffDays / 365)} tahun yang lalu`;
  }

  // Chart data
  const progressChartOptions: Highcharts.Options = {
    chart: { type: "line", height: 300 },
    title: { text: "" },
    xAxis: {
      categories: results
        .slice(0, 10)
        .reverse()
        .map((r) => formatDate(r.created_at)),
    },
    yAxis: {
      title: { text: "Skor (%)" },
      min: 0,
      max: 100,
    },
    series: [
      {
        name: "Skor",
        type: "line",
        data: results
          .slice(0, 10)
          .reverse()
          .map((r) => r.percentage),
        color: "#10b981",
      },
    ],
    legend: { enabled: false },
    credits: { enabled: false },
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Target className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Belum Ada Hasil</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Anda belum menyelesaikan tryout apapun. Mulai tryout pertama Anda
            sekarang!
          </p>
          <Button onClick={() => navigate("/dashboard/tryout")}>
            <Trophy className="w-4 h-4 mr-2" />
            Mulai Tryout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Hasil & Analisis
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Lihat semua hasil tryout dan analisis performa Anda
        </p>
      </div>

      {/* Stats Cards - Mobile-First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Total Tryout
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mb-1">
                  {stats.totalTryouts}
                </h3>
                <p className="text-xs text-muted-foreground">Tryout selesai</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-500">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Rata-rata Skor
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mb-1">
                  {stats.averageScore.toFixed(1)}
                </h3>
                <p className="text-xs text-muted-foreground">Dari 100</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-950 text-green-500">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Skor Terbaik
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mb-1">
                  {stats.bestScore.toFixed(1)}
                </h3>
                <p className="text-xs text-muted-foreground">Personal best</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-950 text-yellow-500">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                  Tingkat Kelulusan
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold mb-1">
                  {stats.passRate.toFixed(0)}%
                </h3>
                <p className="text-xs text-muted-foreground">Pass rate</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-500">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart - Mobile-First */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              Progress Skor
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Grafik perkembangan skor dari {Math.min(results.length, 10)}{" "}
              tryout terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <HighchartsReact
                highcharts={Highcharts}
                options={{
                  ...progressChartOptions,
                  chart: {
                    ...progressChartOptions.chart,
                    height: 250, // Reduced height for mobile
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters & Search - Mobile-First */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari tryout..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 min-h-[44px]"
                style={{ fontSize: "16px" }} // Prevent zoom on iOS
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="CPNS">CPNS</SelectItem>
                <SelectItem value="BUMN_TKD">BUMN TKD</SelectItem>
                <SelectItem value="BUMN_AKHLAK">BUMN AKHLAK</SelectItem>
                <SelectItem value="BUMN_TBI">BUMN TBI</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="passed">Lulus</SelectItem>
                <SelectItem value="failed">Tidak Lulus</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Terbaru</SelectItem>
                <SelectItem value="date_asc">Terlama</SelectItem>
                <SelectItem value="score_desc">Skor Tertinggi</SelectItem>
                <SelectItem value="score_asc">Skor Terendah</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results List - Mobile-First */}
      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <Card>
            <CardContent className="py-8 sm:py-12">
              <div className="text-center">
                <Filter className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Tidak Ada Hasil
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Tidak ada hasil yang sesuai dengan filter Anda
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredResults.map((result) => (
            <Card
              key={result.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                navigate(`/dashboard/results/${result.user_tryout_session_id}`)
              }
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold">
                        {Array.isArray(result.tryout_packages)
                          ? result.tryout_packages[0]?.title ||
                            "Tryout Tanpa Judul"
                          : result.tryout_packages?.title ||
                            "Tryout Tanpa Judul"}
                      </h3>
                      <Badge
                        variant={result.passed ? "default" : "secondary"}
                        className={cn(
                          result.passed
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        )}
                      >
                        {result.passed ? "Lulus" : "Tidak Lulus"}
                      </Badge>
                      <Badge variant="outline">
                        {Array.isArray(result.tryout_packages)
                          ? result.tryout_packages[0]?.category ||
                            "Tidak Berkategori"
                          : result.tryout_packages?.category ||
                            "Tidak Berkategori"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        {formatDate(result.created_at)}
                      </div>
                      {result.rank_position && (
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">
                            Ranking #{result.rank_position}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        <span className="font-medium">
                          {result.correct_answers}
                        </span>
                        <span className="text-muted-foreground">Benar</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                        <span className="font-medium">
                          {result.wrong_answers}
                        </span>
                        <span className="text-muted-foreground">Salah</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                        <span className="font-medium">{result.unanswered}</span>
                        <span className="text-muted-foreground">Kosong</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score */}
                  <div className="text-right ml-0 sm:ml-6">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={cn(
                          "text-2xl sm:text-4xl font-bold",
                          result.passed ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {result.percentage.toFixed(1)}
                      </div>
                      <div className="text-muted-foreground">%</div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {result.total_score.toFixed(0)} /{" "}
                      {result.max_score.toFixed(0)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/dashboard/results/${result.user_tryout_session_id}`
                        );
                      }}
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="text-xs sm:text-sm">Detail</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Footer - Mobile-First */}
      {filteredResults.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <p className="text-center text-xs sm:text-sm text-muted-foreground">
              Menampilkan {filteredResults.length} dari {results.length} hasil
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
