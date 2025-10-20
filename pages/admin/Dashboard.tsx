import { useEffect, useState } from "react";
import { Users, BookOpen, DollarSign, TrendingUp, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  totalTryouts: number;
  totalRevenue: number;
  activeUsers: number;
  totalQuestions: number;
  pendingPayments: number;
  completedSessions: number;
  averageScore: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTryouts: 0,
    totalRevenue: 0,
    activeUsers: 0,
    totalQuestions: 0,
    pendingPayments: 0,
    completedSessions: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [revenueTrendData, setRevenueTrendData] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardStats();
    loadChartData();
    loadCategoryDistribution();
  }, []);

  async function loadDashboardStats() {
    try {
      setLoading(true);

      // Get total users
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get total tryout packages
      const { count: tryoutsCount } = await supabase
        .from("tryout_packages")
        .select("*", { count: "exact", head: true });

      // Get total revenue from user_tryout_purchases (active purchases)
      const { data: purchasesData } = await supabase
        .from("user_tryout_purchases")
        .select("purchase_price")
        .eq("is_active", true);

      const totalRevenue =
        purchasesData?.reduce(
          (sum, purchase) => sum + (purchase.purchase_price || 0),
          0
        ) || 0;

      // Get active users (users who have sessions in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get unique users from sessions
      const { data: sessionsData } = await supabase
        .from("user_tryout_sessions")
        .select("user_id")
        .gte("created_at", thirtyDaysAgo.toISOString());

      const uniqueActiveUsers = new Set(
        sessionsData?.map((s) => s.user_id) || []
      ).size;

      // Get total questions
      const { count: questionsCount } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true });

      // Get pending payments (using user_tryout_purchases with is_active=false)
      const { count: pendingCount } = await supabase
        .from("user_tryout_purchases")
        .select("*", { count: "exact", head: true })
        .eq("is_active", false);

      // Get completed sessions
      const { count: completedCount } = await supabase
        .from("user_tryout_sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed");

      // Get average score
      const { data: resultsData } = await supabase
        .from("tryout_results")
        .select("score");

      const avgScore =
        resultsData && resultsData.length > 0
          ? resultsData.reduce((sum, r) => sum + (r.score || 0), 0) /
            resultsData.length
          : 0;

      setStats({
        totalUsers: usersCount || 0,
        totalTryouts: tryoutsCount || 0,
        totalRevenue: totalRevenue,
        activeUsers: uniqueActiveUsers,
        totalQuestions: questionsCount || 0,
        pendingPayments: pendingCount || 0,
        completedSessions: completedCount || 0,
        averageScore: Math.round(avgScore * 100) / 100,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadChartData() {
    try {
      // Get user growth data (last 6 months)
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("created_at")
        .order("created_at", { ascending: true });

      // Group by month
      const monthlyUsers: { [key: string]: number } = {};
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];

      // Get last 6 months
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
        last6Months.push(monthKey);
        monthlyUsers[monthKey] = 0;
      }

      // Count users per month
      profilesData?.forEach((profile) => {
        const date = new Date(profile.created_at);
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
        if (monthlyUsers[monthKey] !== undefined) {
          monthlyUsers[monthKey]++;
        }
      });

      // Convert to cumulative
      let cumulative = 0;
      const userGrowth = last6Months.map((monthKey) => {
        cumulative += monthlyUsers[monthKey];
        return {
          month: monthKey.split(" ")[0],
          users: cumulative,
        };
      });

      setUserGrowthData(userGrowth);

      // Get revenue trend data (last 6 months)
      const { data: purchasesData } = await supabase
        .from("user_tryout_purchases")
        .select("purchased_at, purchase_price")
        .eq("is_active", true)
        .order("purchased_at", { ascending: true });

      const monthlyRevenue: { [key: string]: number } = {};
      last6Months.forEach((month) => {
        monthlyRevenue[month] = 0;
      });

      purchasesData?.forEach((purchase) => {
        const date = new Date(purchase.purchased_at);
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
        if (monthlyRevenue[monthKey] !== undefined) {
          monthlyRevenue[monthKey] += purchase.purchase_price || 0;
        }
      });

      const revenueTrend = last6Months.map((monthKey) => ({
        month: monthKey.split(" ")[0],
        revenue: monthlyRevenue[monthKey],
      }));

      setRevenueTrendData(revenueTrend);
    } catch (error) {
      console.error("Error loading chart data:", error);
    }
  }

  async function loadCategoryDistribution() {
    try {
      // Get tryout packages by category
      const { data: packagesData } = await supabase
        .from("tryout_packages")
        .select("category")
        .eq("is_active", true);

      // Count packages by category
      const categoryCount: { [key: string]: number } = {};
      packagesData?.forEach((pkg) => {
        categoryCount[pkg.category] = (categoryCount[pkg.category] || 0) + 1;
      });

      // Convert to chart format
      const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
      const distribution = Object.entries(categoryCount).map(
        ([category, count], index) => ({
          name: category.replace("_", " "),
          value: count,
          color: COLORS[index % COLORS.length],
        })
      );

      setCategoryDistribution(distribution);
    } catch (error) {
      console.error("Error loading category distribution:", error);
    }
  }

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      description: `${stats.activeUsers} active (30 days)`,
    },
    {
      title: "Total Tryouts",
      value: stats.totalTryouts,
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      description: `${stats.totalQuestions} total questions`,
    },
    {
      title: "Total Revenue",
      value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      description: `${stats.pendingPayments} inactive purchases`,
    },
    {
      title: "Completed Sessions",
      value: stats.completedSessions,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      description: `Avg score: ${stats.averageScore}`,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Selamat datang di Admin Dashboard TryoutKan
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pertumbuhan User</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tren Pendapatan</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  `Rp ${value.toLocaleString("id-ID")}`
                }
              />
              <Legend />
              <Bar dataKey="revenue" fill="#eab308" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
