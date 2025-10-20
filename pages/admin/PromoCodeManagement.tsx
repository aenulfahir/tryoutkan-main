import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Gift,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllPromoCodes,
  getPromoCodeStats,
  updatePromoCodeStatus,
  deletePromoCode,
  PromoCode,
  PromoCodeStats,
} from "@/services/promoCodeService";
import { PromoCodeForm } from "@/components/admin/PromoCodeForm";

export default function PromoCodeManagement() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [promoStats, setPromoStats] = useState<PromoCodeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    setLoading(true);
    try {
      const data = await getAllPromoCodes();
      setPromoCodes(data);
    } catch (error) {
      toast.error("Gagal memuat data kode promo");
      console.error("Error loading promo codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const stats = await getPromoCodeStats();
      setPromoStats(stats);
      setShowStats(true);
    } catch (error) {
      toast.error("Gagal memuat statistik kode promo");
      console.error("Error loading promo stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleToggleStatus = async (promo: PromoCode) => {
    try {
      const result = await updatePromoCodeStatus(promo.id, !promo.is_active);
      if (result.success) {
        toast.success(result.message);
        loadPromoCodes();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Gagal mengubah status kode promo");
      console.error("Error updating promo status:", error);
    }
  };

  const handleDeletePromo = async (promo: PromoCode) => {
    if (
      !confirm(`Apakah Anda yakin ingin menghapus kode promo "${promo.code}"?`)
    ) {
      return;
    }

    try {
      const result = await deletePromoCode(promo.id);
      if (result.success) {
        toast.success(result.message);
        loadPromoCodes();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Gagal menghapus kode promo");
      console.error("Error deleting promo code:", error);
    }
  };

  const handleCreateSuccess = () => {
    loadPromoCodes();
    setIsCreateModalOpen(false);
  };

  const filteredPromoCodes = promoCodes.filter(
    (promo) =>
      promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (promo.description &&
        promo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (isActive: boolean, expiresAt: string | null) => {
    if (!isActive) {
      return <Badge variant="secondary">Non-aktif</Badge>;
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      return <Badge variant="destructive">Kadaluarsa</Badge>;
    }

    return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
  };

  const exportToCSV = () => {
    const headers = [
      "Kode",
      "Deskripsi",
      "Amount",
      "Max Usage",
      "Current Usage",
      "Per User Limit",
      "Expires At",
      "Status",
      "Created At",
    ];

    const csvData = promoCodes.map((promo) => [
      promo.code,
      promo.description || "",
      promo.topup_amount.toString(),
      promo.max_usage?.toString() || "Unlimited",
      promo.current_usage.toString(),
      promo.per_user_limit.toString(),
      formatDate(promo.expires_at),
      promo.is_active ? "Aktif" : "Non-aktif",
      formatDate(promo.created_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `promo_codes_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Data berhasil diekspor");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Kode Promo</h1>
          <p className="text-muted-foreground">
            Kelola kode promo untuk top-up saldo pengguna
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadStats} disabled={statsLoading}>
            {statsLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {showStats ? "Refresh Stats" : "Lihat Stats"}
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Kode Promo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Gift className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Kode Promo
                  </p>
                  <p className="text-2xl font-bold">{promoStats.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Kode Aktif
                  </p>
                  <p className="text-2xl font-bold">
                    {promoStats.filter((s) => s.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total User
                  </p>
                  <p className="text-2xl font-bold">
                    {promoStats.reduce(
                      (sum, s) => sum + s.unique_users_count,
                      0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      promoStats.reduce(
                        (sum, s) => sum + s.total_amount_credited,
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode promo atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Promo Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kode Promo</CardTitle>
          <CardDescription>
            Kelola semua kode promo yang tersedia di platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Loading...</span>
            </div>
          ) : filteredPromoCodes.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm
                  ? "Tidak ada hasil pencarian"
                  : "Belum ada kode promo"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Coba kata kunci pencarian lain"
                  : "Buat kode promo pertama untuk memulai"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Kode Promo
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Kadaluarsa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromoCodes.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                            {promo.code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {promo.description || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(promo.topup_amount)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{promo.current_usage}</div>
                          {promo.max_usage && (
                            <div className="text-muted-foreground">
                              / {promo.max_usage}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(promo.expires_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(promo.is_active, promo.expires_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(promo)}
                            >
                              {promo.is_active ? (
                                <>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Non-aktifkan
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Aktifkan
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeletePromo(promo)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <PromoCodeForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
