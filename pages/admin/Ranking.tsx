import { useState, useEffect } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/admin/DataTable";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface RankingData {
  rank: number;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  tryout_title: string;
  score: number;
  percentile: number;
}

export default function AdminRanking() {
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [tryouts, setTryouts] = useState<any[]>([]);
  const [selectedTryout, setSelectedTryout] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTryouts();
  }, []);

  useEffect(() => {
    loadRankings();
  }, [selectedTryout]);

  async function loadTryouts() {
    try {
      const { data, error } = await supabase
        .from("tryout_packages")
        .select("id, title")
        .order("title");

      if (error) throw error;
      setTryouts(data || []);
    } catch (error) {
      console.error("Error loading tryouts:", error);
    }
  }

  async function loadRankings() {
    try {
      setLoading(true);

      // First, get rankings data
      let rankingsQuery = supabase
        .from("rankings")
        .select("*")
        .order("rank_position", { ascending: true });

      if (selectedTryout !== "all") {
        rankingsQuery = rankingsQuery.eq("tryout_package_id", selectedTryout);
      }

      const { data: rankingsData, error: rankingsError } = await rankingsQuery;

      if (rankingsError) throw rankingsError;

      if (!rankingsData || rankingsData.length === 0) {
        setRankings([]);
        return;
      }

      // Get unique user IDs and tryout package IDs
      const userIds = [...new Set(rankingsData.map((r) => r.user_id))];
      const tryoutIds = [
        ...new Set(rankingsData.map((r) => r.tryout_package_id)),
      ];

      // Fetch users data
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, name, email, phone, avatar_url")
        .in("id", userIds);

      if (usersError) throw usersError;

      // Fetch tryout packages data
      const { data: tryoutsData, error: tryoutsError } = await supabase
        .from("tryout_packages")
        .select("id, title")
        .in("id", tryoutIds);

      if (tryoutsError) throw tryoutsError;

      // Create lookup maps
      const usersMap = new Map(usersData?.map((u) => [u.id, u]) || []);
      const tryoutsMap = new Map(tryoutsData?.map((t) => [t.id, t]) || []);

      // Format data
      const formattedData = rankingsData.map((item) => {
        const user = usersMap.get(item.user_id);
        const tryout = tryoutsMap.get(item.tryout_package_id);

        return {
          rank: item.rank_position,
          user_id: item.user_id,
          name: user?.name || "Unknown",
          email: user?.email || "",
          phone: user?.phone || "",
          avatar_url: user?.avatar_url || "",
          tryout_title: tryout?.title || "",
          score: item.score,
          percentile: item.percentile,
        };
      });

      setRankings(formattedData);
    } catch (error: any) {
      console.error("Error loading rankings:", error);
      toast.error(
        "Gagal memuat ranking: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  }

  const handleExportExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        rankings.map((r) => ({
          Rank: r.rank,
          Name: r.name,
          Email: r.email,
          Phone: r.phone,
          Tryout: r.tryout_title,
          Score: r.score,
          Percentile: r.percentile + "%",
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rankings");
      XLSX.writeFile(workbook, `rankings-${Date.now()}.xlsx`);
      toast.success("Excel berhasil diexport!");
    } catch (error) {
      toast.error("Gagal export Excel");
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Ranking Tryout", 14, 15);

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

      autoTable(doc, {
        head: [["Rank", "Name", "Email", "Tryout", "Score", "Percentile"]],
        body: rankings.map((r) => [
          r.rank,
          r.name,
          r.email,
          r.tryout_title,
          r.score,
          r.percentile + "%",
        ]),
        startY: 28,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save(`rankings-${Date.now()}.pdf`);
      toast.success("PDF berhasil diexport!");
    } catch (error) {
      toast.error("Gagal export PDF");
    }
  };

  const columns = [
    {
      key: "rank",
      label: "Rank",
      render: (item: RankingData) => (
        <div className="flex items-center space-x-2">
          <Badge variant={item.rank <= 3 ? "default" : "outline"}>
            #{item.rank}
          </Badge>
        </div>
      ),
    },
    {
      key: "user",
      label: "User",
      render: (item: RankingData) => (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={item.avatar_url} />
            <AvatarFallback>
              {item.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "tryout_title",
      label: "Tryout",
      render: (item: RankingData) => (
        <span className="text-sm">{item.tryout_title}</span>
      ),
    },
    {
      key: "score",
      label: "Score",
      render: (item: RankingData) => (
        <span className="font-bold text-lg">{item.score}</span>
      ),
    },
    {
      key: "percentile",
      label: "Percentile",
      render: (item: RankingData) => (
        <Badge variant="secondary">{item.percentile}%</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ranking</h1>
          <p className="text-muted-foreground mt-1">
            View dan export ranking data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={selectedTryout} onValueChange={setSelectedTryout}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter Tryout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tryout</SelectItem>
            {tryouts.map((tryout) => (
              <SelectItem key={tryout.id} value={tryout.id}>
                {tryout.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={rankings}
        columns={columns}
        searchable
        searchPlaceholder="Cari user..."
        loading={loading}
        emptyMessage="Belum ada data ranking"
      />
    </div>
  );
}
