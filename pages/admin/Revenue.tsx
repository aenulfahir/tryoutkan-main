import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/admin/DataTable";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  totalTransactions: number;
  conversionRate: number;
}

interface Transaction {
  id: string;
  created_at: string;
  user_name: string;
  user_email: string;
  package_title: string;
  amount: number;
  status: string;
}

export default function AdminRevenue() {
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    totalTransactions: 0,
    conversionRate: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueByCategory, setRevenueByCategory] = useState<any[]>([]);
  const [monthlyComparison, setMonthlyComparison] = useState<any[]>([]);

  useEffect(() => {
    loadRevenueData();
    loadRevenueByCategory();
    loadMonthlyComparison();
  }, []);

  async function loadRevenueData() {
    try {
      setLoading(true);

      // Try to get data from revenue table first (if it exists)
      let revenueData = null;
      let revenueError = null;

      try {
        const { data, error } = await supabase
          .from("revenue")
          .select(
            "*, user:profiles(id, name, email), package:tryout_packages(id, title, price)"
          )
          .order("created_at", { ascending: false });

        if (!error) {
          revenueData = data;
        }
      } catch (e) {
        console.log("Revenue table might not exist, falling back to purchases");
      }

      if (revenueData && revenueData.length > 0) {
        // Use revenue table data
        const completedRevenue = revenueData.filter(
          (r) => r.payment_status === "completed"
        );
        const totalRevenue = completedRevenue.reduce(
          (sum, r) => sum + (Number(r.amount) || 0),
          0
        );

        // Monthly revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyRevenue = completedRevenue
          .filter((r) => new Date(r.created_at) >= thirtyDaysAgo)
          .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

        // Daily revenue (today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyRevenue = completedRevenue
          .filter((r) => new Date(r.created_at) >= today)
          .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

        setStats({
          totalRevenue,
          monthlyRevenue,
          dailyRevenue,
          totalTransactions: completedRevenue.length,
          conversionRate: 100, // All revenue records are completed transactions
        });

        // Format transactions
        const formattedTransactions = revenueData.slice(0, 50).map((r: any) => {
          return {
            id: r.id,
            created_at: r.created_at,
            user_name: r.user?.name || "Unknown",
            user_email: r.user?.email || "",
            package_title: r.package?.title || "",
            amount: Number(r.amount) || 0,
            status: r.payment_status || "completed",
          };
        });

        setTransactions(formattedTransactions);
      } else {
        // Fallback to user_tryout_purchases table
        const { data: payments, error } = await supabase
          .from("user_tryout_purchases")
          .select("*")
          .order("purchased_at", { ascending: false });

        if (error) throw error;

        if (!payments || payments.length === 0) {
          setStats({
            totalRevenue: 0,
            monthlyRevenue: 0,
            dailyRevenue: 0,
            totalTransactions: 0,
            conversionRate: 0,
          });
          setTransactions([]);
          return;
        }

        // Get unique user IDs and package IDs
        const userIds = [...new Set(payments.map((p) => p.user_id))];
        const packageIds = [
          ...new Set(payments.map((p) => p.tryout_package_id)),
        ];

        // Fetch users data
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id, name, email")
          .in("id", userIds);

        if (usersError) throw usersError;

        // Fetch packages data
        const { data: packagesData, error: packagesError } = await supabase
          .from("tryout_packages")
          .select("id, title, price")
          .in("id", packageIds);

        if (packagesError) throw packagesError;

        // Create lookup maps
        const usersMap = new Map(usersData?.map((u) => [u.id, u]) || []);
        const packagesMap = new Map(packagesData?.map((p) => [p.id, p]) || []);

        // Calculate stats
        // Filter active purchases
        const paidPayments = payments?.filter((p) => p.is_active) || [];
        const totalRevenue = paidPayments.reduce(
          (sum, p) => sum + (Number(p.purchase_price) || 0),
          0
        );

        // Monthly revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyPayments = paidPayments.filter(
          (p) => new Date(p.purchased_at) >= thirtyDaysAgo
        );
        const monthlyRevenue = monthlyPayments.reduce(
          (sum, p) => sum + (Number(p.purchase_price) || 0),
          0
        );

        // Daily revenue (today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyPayments = paidPayments.filter(
          (p) => new Date(p.purchased_at) >= today
        );
        const dailyRevenue = dailyPayments.reduce(
          (sum, p) => sum + (Number(p.purchase_price) || 0),
          0
        );

        // Conversion rate
        const totalPayments = payments?.length || 0;
        const conversionRate =
          totalPayments > 0 ? (paidPayments.length / totalPayments) * 100 : 0;

        setStats({
          totalRevenue,
          monthlyRevenue,
          dailyRevenue,
          totalTransactions: paidPayments.length,
          conversionRate,
        });

        // Format transactions
        const formattedTransactions = payments.slice(0, 50).map((p: any) => {
          const user = usersMap.get(p.user_id);
          const pkg = packagesMap.get(p.tryout_package_id);

          return {
            id: p.id,
            created_at: p.purchased_at,
            user_name: user?.name || "Unknown",
            user_email: user?.email || "",
            package_title: pkg?.title || "",
            amount: Number(p.purchase_price) || 0,
            status: p.is_active ? "paid" : "inactive",
          };
        });

        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Error loading revenue data:", error);
      toast.error("Gagal memuat data pendapatan");
    } finally {
      setLoading(false);
    }
  }

  async function loadRevenueByCategory() {
    try {
      // Get revenue by category
      const { data: categoryData } = await supabase
        .from("revenue")
        .select(
          `
          amount,
          package:tryout_packages!inner(category)
        `
        )
        .eq("payment_status", "completed");

      if (categoryData && categoryData.length > 0) {
        // Group by category
        const categoryRevenue: { [key: string]: number } = {};
        categoryData.forEach((item: any) => {
          const category = item.package?.category || "Unknown";
          categoryRevenue[category] =
            (categoryRevenue[category] || 0) + (Number(item.amount) || 0);
        });

        // Convert to chart format
        const COLORS = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"];
        const chartData = Object.entries(categoryRevenue).map(
          ([category, revenue], index) => ({
            name: category.replace("_", " "),
            value: revenue,
            color: COLORS[index % COLORS.length],
          })
        );

        setRevenueByCategory(chartData);
      }
    } catch (error) {
      console.error("Error loading revenue by category:", error);
    }
  }

  async function loadMonthlyComparison() {
    try {
      // Get last 6 months of revenue
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: monthlyData } = await supabase
        .from("revenue")
        .select("created_at, amount")
        .eq("payment_status", "completed")
        .gte("created_at", sixMonthsAgo.toISOString())
        .order("created_at", { ascending: true });

      if (monthlyData && monthlyData.length > 0) {
        // Group by month
        const monthlyRevenue: { [key: string]: number } = {};
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

        // Initialize last 6 months
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
          last6Months.push(monthKey);
          monthlyRevenue[monthKey] = 0;
        }

        // Sum revenue by month
        monthlyData.forEach((item: any) => {
          const date = new Date(item.created_at);
          const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
          if (monthlyRevenue[monthKey] !== undefined) {
            monthlyRevenue[monthKey] += Number(item.amount) || 0;
          }
        });

        // Convert to chart format
        const chartData = last6Months.map((month) => ({
          month: month.split(" ")[0],
          revenue: monthlyRevenue[month],
        }));

        setMonthlyComparison(chartData);
      }
    } catch (error) {
      console.error("Error loading monthly comparison:", error);
    }
  }

  const statsCards = [
    {
      title: "Total Revenue",
      value: `Rp ${stats.totalRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-black",
      bgColor: "bg-white border-2 border-black",
    },
    {
      title: "Revenue Bulan Ini",
      value: `Rp ${stats.monthlyRevenue.toLocaleString("id-ID")}`,
      icon: TrendingUp,
      color: "text-black",
      bgColor: "bg-white border-2 border-black",
    },
    {
      title: "Revenue Hari Ini",
      value: `Rp ${stats.dailyRevenue.toLocaleString("id-ID")}`,
      icon: CreditCard,
      color: "text-black",
      bgColor: "bg-white border-2 border-black",
    },
    {
      title: "Total Transaksi",
      value: stats.totalTransactions,
      icon: Users,
      color: "text-black",
      bgColor: "bg-white border-2 border-black",
      description: `Conversion: ${stats.conversionRate.toFixed(1)}%`,
    },
  ];

  const columns = [
    {
      key: "created_at",
      label: "Tanggal",
      render: (item: Transaction) => (
        <span className="text-sm font-medium text-gray-600">
          {new Date(item.created_at).toLocaleDateString("id-ID")}
        </span>
      ),
    },
    {
      key: "user",
      label: "User",
      render: (item: Transaction) => (
        <div>
          <p className="font-bold text-black">{item.user_name}</p>
          <p className="text-sm text-gray-600 font-medium">{item.user_email}</p>
        </div>
      ),
    },
    {
      key: "package_title",
      label: "Paket",
      render: (item: Transaction) => (
        <span className="font-medium text-black">{item.package_title}</span>
      ),
    },
    {
      key: "amount",
      label: "Jumlah",
      render: (item: Transaction) => (
        <span className="font-black text-black">
          Rp {item.amount.toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: Transaction) => (
        <Badge
          variant={
            item.status === "paid" || item.status === "completed"
              ? "default"
              : item.status === "pending"
                ? "secondary"
                : "destructive"
          }
          className={`font-bold border-2 border-black ${item.status === "paid" || item.status === "completed"
              ? "bg-green-100 text-green-700 border-green-600"
              : item.status === "pending"
                ? "bg-yellow-100 text-yellow-700 border-yellow-600"
                : "bg-red-100 text-red-700 border-red-600"
            }`}
        >
          {item.status === "completed" ? "paid" : item.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8 bg-white min-h-screen text-black">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Pendapatan</h1>
        <p className="text-gray-600 font-medium mt-1">
          Revenue analytics dan transaction management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black">{stat.value}</div>
                {stat.description && (
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    {stat.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category Chart */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="font-black">Pendapatan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) =>
                    `${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#000000"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `Rp ${value.toLocaleString("id-ID")}`
                  }
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #000', borderRadius: '8px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Comparison Chart */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="font-black">Perbandingan Pendapatan Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#000000" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#000000" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value: number) =>
                    `Rp ${value.toLocaleString("id-ID")}`
                  }
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #000', borderRadius: '8px', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#000000"
                  fill="#000000"
                  fillOpacity={0.1}
                  name="Revenue"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle className="font-black">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={transactions}
            columns={columns}
            searchable
            searchPlaceholder="Cari transaksi..."
            loading={loading}
            emptyMessage="Belum ada transaksi"
          />
        </CardContent>
      </Card>
    </div>
  );
}
