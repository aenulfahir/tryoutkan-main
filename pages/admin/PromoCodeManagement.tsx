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
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-2 border-gray-400 font-bold">Non-aktif</Badge>;
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      return <Badge variant="destructive" className="bg-red-100 text-red-700 border-2 border-red-600 font-bold">Kadaluarsa</Badge>;
    }

    return <Badge className="bg-green-100 text-green-700 border-2 border-green-600 font-bold">Aktif</Badge>;
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
    <div className="p-4 sm:p-6 bg-white min-h-screen text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Manajemen Kode Promo
          </h1>
          <p className="text-sm sm:text-base text-gray-600 font-medium">
            Kelola kode promo untuk top-up saldo pengguna
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
          <Button
            variant="outline"
            onClick={loadStats}
            disabled={statsLoading}
            className="w-full sm:w-auto min-h-[44px] border-2 border-black font-bold hover:bg-gray-100"
          >
            {statsLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            <span className="text-sm sm:text-base">
              {showStats ? "Refresh Stats" : "Lihat Stats"}
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="w-full sm:w-auto min-h-[44px] border-2 border-black font-bold hover:bg-gray-100"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Export CSV</span>
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full sm:w-auto min-h-[44px] bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Buat Kode Promo</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Mobile-First */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 sm:mb-6">
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-bold text-gray-600">
                    Total Kode Promo
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-black">
                    {promoStats.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-bold text-gray-600">
                    Kode Aktif
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-black">
                    {promoStats.filter((s) => s.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-bold text-gray-600">
                    Total User
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-black">
                    {promoStats.reduce(
                      (sum, s) => sum + s.unique_users_count,
                      0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-bold text-gray-600">
                    Total Amount
                  </p>
                  <p className="text-xl sm:text-2xl font-black text-black">
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

      {/* Search and Filters - Mobile-First */}
      <Card className="mb-4 sm:mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Cari kode promo atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm min-h-[44px] border-2 border-black font-medium focus-visible:ring-0"
              style={{ fontSize: "16px" }} // Prevent zoom on iOS
            />
          </div>
        </CardContent>
      </Card>

      {/* Promo Codes Table - Mobile-First */}
      <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="bg-black text-white border-b-2 border-black">
          <CardTitle className="text-sm sm:text-base font-black">
            Daftar Kode Promo
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-gray-300 font-medium">
            Kelola semua kode promo yang tersedia di platform
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mr-2" />
              <span className="text-sm sm:text-base font-bold">Loading...</span>
            </div>
          ) : filteredPromoCodes.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-black mb-2">
                {searchTerm
                  ? "Tidak ada hasil pencarian"
                  : "Belum ada kode promo"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-4">
                {searchTerm
                  ? "Coba kata kunci pencarian lain"
                  : "Buat kode promo pertama untuk memulai"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="min-h-[44px] bg-black text-white font-bold border-2 border-black hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="text-sm sm:text-base">Buat Kode Promo</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-black bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-xs sm:text-sm font-black text-black">Kode</TableHead>
                    <TableHead className="text-xs sm:text-sm font-black text-black">
                      Deskripsi
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm font-black text-black">Amount</TableHead>
                    <TableHead className="text-xs sm:text-sm font-black text-black">Usage</TableHead>
                    <TableHead className="text-xs sm:text-sm font-black text-black">
                      Kadaluarsa
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm font-black text-black">Status</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm font-black text-black">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromoCodes.map((promo) => (
                    <TableRow key={promo.id} className="border-b-2 border-gray-100 hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono bg-black text-white px-2 py-1 rounded border-2 border-black text-xs sm:text-sm font-bold">
                            {promo.code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate font-medium text-gray-700">
                          {promo.description || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-black">
                        {formatCurrency(promo.topup_amount)}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs sm:text-sm font-medium">
                          <div>{promo.current_usage}</div>
                          {promo.max_usage && (
                            <div className="text-gray-500">
                              / {promo.max_usage}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs sm:text-sm font-medium text-gray-600">
                          {formatDate(promo.expires_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(promo.is_active, promo.expires_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="min-h-[36px] min-w-[36px] sm:min-h-[44px] sm:min-w-[44px] hover:bg-gray-200"
                            >
                              <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-2 border-black font-medium">
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(promo)}
                              className="focus:bg-gray-100 focus:text-black cursor-pointer"
                            >
                              {promo.is_active ? (
                                <>
                                  <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                  <span className="text-xs sm:text-sm font-bold">
                                    Non-aktifkan
                                  </span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                  <span className="text-xs sm:text-sm font-bold">
                                    Aktifkan
                                  </span>
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-200" />
                            <DropdownMenuItem
                              className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                              onClick={() => handleDeletePromo(promo)}
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                              <span className="text-xs sm:text-sm font-bold">Hapus</span>
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
