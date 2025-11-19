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
import { motion, Variants } from "framer-motion";

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
      type: "area",
      height: 300,
      backgroundColor: "transparent",
      style: {
        fontFamily: "inherit",
      },
    },
    title: {
      text: "",
    },
    xAxis: {
      categories: recentSessions
        .slice()
        .reverse()
        .map((s) => formatDate(s.completed_at)),
      title: { text: undefined },
      labels: {
        style: { color: "#666" },
      },
      lineColor: "#000",
      tickColor: "#000",
    },
    yAxis: {
      title: { text: undefined },
      min: 0,
      max: 100,
      gridLineColor: "#e5e5e5",
      labels: {
        style: { color: "#666" },
      },
    },
    series: [
      {
        name: "Skor",
        type: "area",
        data: recentSessions
          .slice()
          .reverse()
          .map((s) => s.percentage),
        color: "#000000",
        fillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, "rgba(0, 0, 0, 0.1)"],
            [1, "rgba(0, 0, 0, 0)"],
          ],
        },
        marker: {
          fillColor: "#fff",
          lineWidth: 2,
          lineColor: "#000",
          radius: 4,
        },
      },
    ],
    credits: { enabled: false },
    legend: { enabled: false },
    tooltip: {
      backgroundColor: "#000",
      style: {
        color: "#fff",
      },
      borderRadius: 4,
      borderWidth: 0,
    },
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 md:p-8 space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-black tracking-tight mb-2">Dashboard</h1>
        <p className="text-gray-500">
          Selamat datang kembali! Berikut adalah ringkasan aktivitas belajarmu.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tryout */}
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Total Tryout
                  </p>
                  <h3 className="text-4xl font-black mb-1">
                    {stats?.total_tryouts_completed || 0}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Tryout selesai</p>
                </div>
                <div className="p-3 rounded-lg bg-black text-white">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rata-rata Skor */}
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Rata-rata Skor
                  </p>
                  <h3 className="text-4xl font-black mb-1">
                    {stats?.average_score?.toFixed(1) || "0.0"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Dari {stats?.total_tryouts_completed || 0} tryout
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-black text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skor Terbaik */}
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Skor Terbaik
                  </p>
                  <h3 className="text-4xl font-black mb-1">
                    {stats?.best_score?.toFixed(1) || "0.0"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Personal best</p>
                </div>
                <div className="p-3 rounded-lg bg-black text-white">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ranking Terbaik */}
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    Ranking Terbaik
                  </p>
                  <h3 className="text-4xl font-black mb-1">
                    {bestRanking ? `#${bestRanking}` : "-"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {bestRanking ? "Posisi terbaik" : "Belum ada ranking"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-black text-white">
                  <Award className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tryouts & Chart */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Chart */}
          {recentSessions.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardHeader>
                  <CardTitle className="font-black text-xl">Progress Skor</CardTitle>
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
            </motion.div>
          )}

          {/* Recent Tryouts List */}
          <motion.div variants={itemVariants}>
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="font-black text-xl">Tryout Terbaru</CardTitle>
                <CardDescription>
                  Hasil tryout yang baru saja kamu selesaikan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold mb-2">
                      Belum Ada Tryout
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Mulai tryout pertamamu sekarang!
                    </p>
                    <Button
                      onClick={() => navigate("/dashboard/tryout")}
                      className="bg-black text-white hover:bg-gray-800 font-bold"
                    >
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
                          className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100 hover:border-black transition-colors cursor-pointer group"
                          onClick={() =>
                            navigate(`/dashboard/results/${session.id}`)
                          }
                        >
                          <div className="flex-1">
                            <h4 className="font-bold mb-1 group-hover:text-black transition-colors">
                              {Array.isArray(session.tryout_packages)
                                ? session.tryout_packages[0]?.title ||
                                "Tryout Tanpa Judul"
                                : session.tryout_packages?.title ||
                                "Tryout Tanpa Judul"}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {formatDate(session.completed_at)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="text-2xl font-black">
                                {session.percentage.toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-500 font-bold uppercase">
                                Skor
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-6 border-2 border-black hover:bg-gray-100 font-bold"
                      onClick={() => navigate("/dashboard/history")}
                    >
                      Lihat Semua Tryout
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar - Quick Actions & Info */}
        <div className="space-y-8">
          {/* Balance Card */}
          <motion.div variants={itemVariants}>
            <Card className="bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1 font-medium">
                      Saldo Anda
                    </p>
                    <h3 className="text-3xl font-black">
                      Rp {balance.toLocaleString("id-ID")}
                    </h3>
                  </div>
                  <div className="p-3 rounded-lg bg-white/10">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                </div>
                <Button
                  className="w-full bg-white text-black hover:bg-gray-200 font-bold"
                  onClick={() => navigate("/dashboard/billing")}
                >
                  Top Up Saldo
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="font-black text-xl">Aksi Cepat</CardTitle>
                <CardDescription>Mulai aktivitas belajarmu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start bg-black text-white hover:bg-gray-800 font-bold"
                    size="lg"
                    onClick={() => navigate("/dashboard/tryout")}
                  >
                    <BookOpen className="w-5 h-5 mr-3" />
                    Mulai Tryout Baru
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-2 border-gray-200 hover:border-black font-bold"
                    size="lg"
                    onClick={() => navigate("/dashboard/results")}
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    Lihat Analisis
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-2 border-gray-200 hover:border-black font-bold"
                    size="lg"
                    onClick={() => navigate("/dashboard/ranking")}
                  >
                    <Award className="w-5 h-5 mr-3" />
                    Ranking Nasional
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Summary */}
          <motion.div variants={itemVariants}>
            <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader>
                <CardTitle className="font-black text-xl">Ringkasan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">
                      Paket Tersedia
                    </span>
                    <span className="font-black text-lg">{availablePackages}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">
                      Jawaban Benar
                    </span>
                    <span className="font-black text-lg text-green-600">
                      {stats?.total_correct_answers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">
                      Jawaban Salah
                    </span>
                    <span className="font-black text-lg text-red-600">
                      {stats?.total_wrong_answers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">
                      Tidak Dijawab
                    </span>
                    <span className="font-black text-lg text-gray-400">
                      {stats?.total_unanswered || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips Card */}
          <motion.div variants={itemVariants}>
            <Card className="bg-gray-50 border-2 border-black border-dashed">
              <CardContent className="pt-6">
                <h4 className="font-black text-black mb-2 flex items-center">
                  <span className="mr-2 text-xl">💡</span>
                  Tips Hari Ini
                </h4>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  Konsistensi adalah kunci! Coba selesaikan minimal 1 tryout
                  setiap hari untuk hasil maksimal.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
