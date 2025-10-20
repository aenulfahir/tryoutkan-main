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
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  TrendingUp,
  Award,
  ArrowRight,
  BarChart3,
  Wallet,
  Trophy,
  Target,
} from "lucide-react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface UserStats {
  total_tryouts_completed: number;
  average_score: number;
  best_score: number;
  worst_score: number;
  total_correct_answers: number;
  total_wrong_answers: number;
  total_unanswered: number;
  last_tryout_at: string | null;
}

interface RecentSession {
  id: string;
  tryout_packages:
    | {
        title: string;
      }
    | {
        title: string;
      }[]
    | null;
  completed_at: string;
  percentage: number;
  status: string;
  total_score: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [availablePackages, setAvailablePackages] = useState<number>(0);
  const [bestRanking, setBestRanking] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      console.log("📊 Loading dashboard data for user:", user?.id);

      // Load user statistics
      const { data: statsData, error: statsError } = await supabase
        .from("user_statistics")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (statsError && statsError.code !== "PGRST116") {
        console.error("Stats error:", statsError);
      } else {
        setStats(statsData);
        console.log("📈 Stats loaded:", statsData);
      }

      // Load recent sessions (5 terakhir)
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("user_tryout_sessions")
        .select(
          `
          id,
          completed_at,
          percentage,
          status,
          total_score,
          tryout_packages (title)
        `
        )
        .eq("user_id", user?.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(5);

      if (sessionsError) {
        console.error("Sessions error:", sessionsError);
      } else {
        setRecentSessions(sessionsData || []);
        console.log("📝 Recent sessions loaded:", sessionsData);
      }

      // Load balance
      const { data: balanceData, error: balanceError } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", user?.id)
        .single();

      if (balanceError && balanceError.code !== "PGRST116") {
        console.error("Balance error:", balanceError);
      } else {
        setBalance(balanceData?.balance || 0);
        console.log("💰 Balance loaded:", balanceData?.balance);
      }

      // Load available packages count
      const { count, error: packagesError } = await supabase
        .from("tryout_packages")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (packagesError) {
        console.error("Packages error:", packagesError);
      } else {
        setAvailablePackages(count || 0);
        console.log("📦 Available packages:", count);
      }

      // Load best ranking
      const { data: rankingData, error: rankingError } = await supabase
        .from("rankings")
        .select("rank_position")
        .eq("user_id", user?.id)
        .order("rank_position", { ascending: true })
        .limit(1)
        .single();

      if (rankingError && rankingError.code !== "PGRST116") {
        console.error("Ranking error:", rankingError);
      } else {
        setBestRanking(rankingData?.rank_position || null);
        console.log("🏆 Best ranking:", rankingData?.rank_position);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Gagal Memuat Dashboard", {
        description: "Terjadi kesalahan saat memuat data dashboard.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Chart options for progress
  const progressChartOptions: Highcharts.Options = {
    chart: {
      type: "line",
      height: 300,
    },
    title: {
      text: "Progress Skor",
      style: { fontSize: "16px", fontWeight: "600" },
    },
    xAxis: {
      categories: recentSessions
        .slice()
        .reverse()
        .map((s) => formatDate(s.completed_at)),
      title: { text: "Tryout" },
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
        data: recentSessions
          .slice()
          .reverse()
          .map((s) => s.percentage),
        color: "#10b981",
      },
    ],
    credits: { enabled: false },
    legend: { enabled: false },
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali! Berikut adalah ringkasan aktivitas belajarmu.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Total Tryout */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Tryout
                </p>
                <h3 className="text-3xl font-bold mb-1">
                  {stats?.total_tryouts_completed || 0}
                </h3>
                <p className="text-xs text-muted-foreground">Tryout selesai</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-500">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rata-rata Skor */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Rata-rata Skor
                </p>
                <h3 className="text-3xl font-bold mb-1">
                  {stats?.average_score?.toFixed(1) || "0.0"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Dari {stats?.total_tryouts_completed || 0} tryout
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-950 text-green-500">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skor Terbaik */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Skor Terbaik
                </p>
                <h3 className="text-3xl font-bold mb-1">
                  {stats?.best_score?.toFixed(1) || "0.0"}
                </h3>
                <p className="text-xs text-muted-foreground">Personal best</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-950 text-yellow-500">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ranking Terbaik */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Ranking Terbaik
                </p>
                <h3 className="text-3xl font-bold mb-1">
                  {bestRanking ? `#${bestRanking}` : "-"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {bestRanking ? "Posisi terbaik" : "Belum ada ranking"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-500">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tryouts & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Chart */}
          {recentSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Progress Skor</CardTitle>
                <CardDescription>
                  Grafik perkembangan skor dari {recentSessions.length} tryout
                  terakhir
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={progressChartOptions}
                />
              </CardContent>
            </Card>
          )}

          {/* Recent Tryouts List */}
          <Card>
            <CardHeader>
              <CardTitle>Tryout Terbaru</CardTitle>
              <CardDescription>
                Hasil tryout yang baru saja kamu selesaikan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Belum Ada Tryout
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Mulai tryout pertamamu sekarang!
                  </p>
                  <Button onClick={() => navigate("/dashboard/tryout")}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Mulai Tryout
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {recentSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
                        onClick={() =>
                          navigate(`/dashboard/results/${session.id}`)
                        }
                      >
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">
                            {Array.isArray(session.tryout_packages)
                              ? session.tryout_packages[0]?.title ||
                                "Tryout Tanpa Judul"
                              : session.tryout_packages?.title ||
                                "Tryout Tanpa Judul"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(session.completed_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {session.percentage.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Skor
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate("/dashboard/history")}
                  >
                    Lihat Semua Tryout
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Quick Actions & Info */}
        <div className="space-y-6">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Saldo Anda
                  </p>
                  <h3 className="text-3xl font-bold">
                    Rp {balance.toLocaleString("id-ID")}
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-primary/20">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate("/dashboard/billing")}
              >
                Top Up Saldo
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
              <CardDescription>Mulai aktivitas belajarmu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start"
                  size="lg"
                  onClick={() => navigate("/dashboard/tryout")}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Mulai Tryout Baru
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                  onClick={() => navigate("/dashboard/results")}
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Lihat Analisis
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="lg"
                  onClick={() => navigate("/dashboard/ranking")}
                >
                  <Award className="w-5 h-5 mr-2" />
                  Ranking Nasional
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Paket Tersedia
                  </span>
                  <span className="font-semibold">{availablePackages}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Jawaban Benar
                  </span>
                  <span className="font-semibold text-green-600">
                    {stats?.total_correct_answers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Jawaban Salah
                  </span>
                  <span className="font-semibold text-red-600">
                    {stats?.total_wrong_answers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Tidak Dijawab
                  </span>
                  <span className="font-semibold text-gray-600">
                    {stats?.total_unanswered || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                <span className="mr-2">💡</span>
                Tips Hari Ini
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Konsistensi adalah kunci! Coba selesaikan minimal 1 tryout
                setiap hari untuk hasil maksimal.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
