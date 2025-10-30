import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TryoutCard } from "@/components/tryout/TryoutCard";
import { TryoutDetailModal } from "@/components/tryout/TryoutDetailModal";
import { PurchaseSuccessModal } from "@/components/PurchaseSuccessModal";
import {
  Search,
  Loader2,
  Package,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { TryoutPackage, UserTryoutPurchase } from "@/types/tryout";
import {
  getTryoutPackages,
  purchaseTryoutPackage,
  createTryoutSession,
  getUserPurchases,
} from "@/services/tryout";

export default function Tryout() {
  const navigate = useNavigate();
  const [tryouts, setTryouts] = useState<TryoutPackage[]>([]);
  const [purchases, setPurchases] = useState<Map<string, UserTryoutPurchase>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"available" | "purchased">(
    "available"
  );

  // Detail modal state
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    tryout: TryoutPackage | null;
    loading: boolean;
  }>({
    open: false,
    tryout: null,
    loading: false,
  });

  // Success modal state
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    packageTitle: string;
    price: number;
    remainingBalance: number;
    purchaseDate: string;
    packageId: string;
  }>({
    open: false,
    packageTitle: "",
    price: 0,
    remainingBalance: 0,
    purchaseDate: "",
    packageId: "",
  });

  const [balance, setBalance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [purchasingPackageId, setPurchasingPackageId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUserId(user.id);

      // Get balance
      const { data: balanceData } = await supabase
        .from("balances")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      setBalance(balanceData?.balance || 0);

      // Get tryouts
      const tryoutsData = await getTryoutPackages();
      setTryouts(tryoutsData);

      // Get purchases
      const purchasesData = await getUserPurchases(user.id);
      console.log("📦 Purchases loaded:", purchasesData);

      // FIX: Use tryout_package_id instead of package_id
      const purchaseMap = new Map(
        purchasesData.map((p) => [p.tryout_package_id, p])
      );
      console.log("🗺️ Purchase Map:", Array.from(purchaseMap.keys()));

      setPurchases(purchaseMap);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Gagal memuat data. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (tryout: TryoutPackage) => {
    setDetailModal({
      open: true,
      tryout,
      loading: false,
    });
  };

  const handlePurchase = async () => {
    if (!detailModal.tryout) return;

    const tryout = detailModal.tryout;
    const price = tryout.is_free ? 0 : tryout.price;

    // Check balance
    if (price > balance) {
      const shortfall = price - balance;
      toast.error("Saldo Tidak Cukup!", {
        description: `Anda memerlukan ${formatPrice(
          shortfall
        )} lagi untuk membeli paket ini.`,
      });
      return;
    }

    try {
      setDetailModal((prev) => ({ ...prev, loading: true }));

      const result = await purchaseTryoutPackage(tryout.id, userId);
      console.log("💰 Purchase result:", result);

      if (result.success) {
        // Update balance
        setBalance(result.new_balance || 0);

        // Reload purchases to get the new purchase data
        const purchasesData = await getUserPurchases(userId);
        const purchaseMap = new Map(
          purchasesData.map((p) => [p.tryout_package_id, p])
        );
        setPurchases(purchaseMap);

        console.log("✅ Purchases reloaded after purchase:", {
          purchaseId: result.purchase_id,
          mapSize: purchaseMap.size,
        });

        // Close detail modal
        setDetailModal({ open: false, tryout: null, loading: false });

        // Show success modal with animation
        setSuccessModal({
          open: true,
          packageTitle: tryout.title,
          price: price,
          remainingBalance: result.new_balance || 0,
          purchaseDate: new Date().toISOString(),
          packageId: tryout.id,
        });

        // Switch to purchased tab after modal closes
        setTimeout(() => {
          setActiveTab("purchased");
        }, 500);
      } else {
        toast.error("Pembelian Gagal", {
          description:
            result.message || "Terjadi kesalahan saat membeli paket.",
        });
      }
    } catch (err: any) {
      console.error("Purchase error:", err);
      toast.error("Pembelian Gagal", {
        description: err.message || "Terjadi kesalahan saat membeli paket.",
      });
    } finally {
      setDetailModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Handle direct purchase from card (without opening detail modal)
  const handleDirectPurchase = async (tryout: TryoutPackage) => {
    const price = tryout.is_free ? 0 : tryout.price;

    // Check balance
    if (price > balance) {
      const shortfall = price - balance;
      toast.error("Saldo Tidak Cukup!", {
        description: `Anda memerlukan ${formatPrice(
          shortfall
        )} lagi untuk membeli paket ini.`,
      });
      return;
    }

    try {
      setPurchasingPackageId(tryout.id);

      const result = await purchaseTryoutPackage(tryout.id, userId);
      console.log("💰 Purchase result:", result);

      if (result.success) {
        // Update balance
        setBalance(result.new_balance || 0);

        // Update purchases - reload to get latest data
        const purchasesData = await getUserPurchases(userId);
        const purchaseMap = new Map(
          purchasesData.map((p) => [p.tryout_package_id, p])
        );
        setPurchases(purchaseMap);

        // Show success modal with animation
        setSuccessModal({
          open: true,
          packageTitle: tryout.title,
          price: price,
          remainingBalance: result.new_balance || 0,
          purchaseDate: new Date().toISOString(),
          packageId: tryout.id,
        });

        // Switch to purchased tab after modal closes
        setTimeout(() => {
          setActiveTab("purchased");
        }, 500);
      } else {
        toast.error("Pembelian Gagal", {
          description:
            result.message || "Terjadi kesalahan saat membeli paket.",
        });
      }
    } catch (err: any) {
      console.error("Purchase error:", err);
      toast.error("Pembelian Gagal", {
        description: err.message || "Terjadi kesalahan saat membeli paket.",
      });
    } finally {
      setPurchasingPackageId(null);
    }
  };

  const handleStart = async () => {
    if (!detailModal.tryout) return;

    const tryout = detailModal.tryout;

    console.log("🚀 Starting tryout:", {
      tryoutId: tryout.id,
      tryoutTitle: tryout.title,
      isFree: tryout.is_free,
      purchasesMapSize: purchases.size,
      purchasesKeys: Array.from(purchases.keys()),
    });

    // For free tryouts, auto-purchase if not already purchased
    let purchase = purchases.get(tryout.id);

    if (!purchase && tryout.is_free) {
      console.log("🆓 Free tryout - auto-purchasing...");
      try {
        const result = await purchaseTryoutPackage(tryout.id, userId);
        if (result.success) {
          // Reload purchases to get the new purchase data
          const purchasesData = await getUserPurchases(userId);
          const purchaseMap = new Map(
            purchasesData.map((p) => [p.tryout_package_id, p])
          );
          setPurchases(purchaseMap);
          purchase = purchaseMap.get(tryout.id);
          console.log("✅ Free tryout auto-purchased:", purchase);
        }
      } catch (error) {
        console.error("Error auto-purchasing free tryout:", error);
      }
    }

    console.log("🔍 Purchase lookup result:", purchase);

    if (!purchase) {
      console.error("❌ Purchase not found for tryout:", tryout.id);
      toast.error("Akses Ditolak", {
        description:
          "Anda belum membeli paket ini. Silakan beli terlebih dahulu.",
      });
      return;
    }

    try {
      setDetailModal((prev) => ({ ...prev, loading: true }));

      console.log("Creating session with:", {
        userId,
        packageId: tryout.id,
        purchaseId: purchase.id,
      });

      const session = await createTryoutSession(userId, tryout.id, purchase.id);

      console.log("Session created:", session);

      toast.success("Tryout Dimulai!", {
        description: "Anda akan diarahkan ke halaman tryout...",
        duration: 2000,
      });

      // Small delay to show toast
      setTimeout(() => {
        // Navigate to execution page
        navigate(`/dashboard/tryout/${session.id}`);
      }, 500);
    } catch (err: any) {
      console.error("Start error:", err);
      toast.error("Gagal Memulai Tryout", {
        description:
          err.message ||
          "Terjadi kesalahan saat memulai tryout. Silakan coba lagi.",
      });
      setDetailModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Filter tryouts
  const filteredTryouts = tryouts.filter((tryout) => {
    const matchesSearch =
      tryout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tryout.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || tryout.category === categoryFilter;
    const matchesDifficulty =
      difficultyFilter === "all" || tryout.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Separate available and purchased
  const availableTryouts = filteredTryouts.filter((t) => !purchases.has(t.id));
  const purchasedTryouts = filteredTryouts.filter((t) => purchases.has(t.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black p-8 text-white shadow-2xl mb-8">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-4xl font-bold mb-2 tracking-tight">
                Paket Tryout
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl">
                Pilih paket tryout yang sesuai dengan kebutuhan Anda
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="text-sm text-gray-300">
                  Total Paket: {tryouts.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="text-sm text-gray-300">
                  Saldo: {formatPrice(balance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
            Filter Pencarian
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari paket tryout..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 focus:border-black focus:ring-black"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-black focus:ring-black">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="CPNS">🏛️ CPNS</SelectItem>
                <SelectItem value="BUMN_TKD">🏢 BUMN TKD</SelectItem>
                <SelectItem value="BUMN_AKHLAK">⭐ BUMN AKHLAK</SelectItem>
                <SelectItem value="BUMN_TBI">🌐 BUMN TBI</SelectItem>
                <SelectItem value="STAN">🎓 STAN</SelectItem>
                <SelectItem value="PLN">⚡ PLN</SelectItem>
                <SelectItem value="OTHER">📝 Lainnya</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-black focus:ring-black">
                <SelectValue placeholder="Tingkat Kesulitan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tingkat</SelectItem>
                <SelectItem value="easy">Mudah</SelectItem>
                <SelectItem value="medium">Sedang</SelectItem>
                <SelectItem value="hard">Sulit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1 rounded-xl mb-8">
          <TabsTrigger
            value="available"
            className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md rounded-lg transition-all"
          >
            <Package className="w-4 h-4" />
            <span>Paket Tersedia ({availableTryouts.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="purchased"
            className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md rounded-lg transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Paket Anda ({purchasedTryouts.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-0">
          {availableTryouts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
              <Package className="w-20 h-20 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Tidak ada paket tersedia
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Coba ubah filter pencarian Anda untuk menemukan paket yang
                sesuai
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {availableTryouts.map((tryout) => (
                <TryoutCard
                  key={tryout.id}
                  tryout={tryout}
                  isPurchased={false}
                  onViewDetail={() => handleViewDetail(tryout)}
                  onPurchase={() => handleDirectPurchase(tryout)}
                  purchaseLoading={purchasingPackageId === tryout.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchased" className="mt-0">
          {purchasedTryouts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
              <ShoppingBag className="w-20 h-20 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Belum ada paket dibeli
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Beli paket tryout untuk mulai berlatih dan meningkatkan
                kemampuan Anda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {purchasedTryouts.map((tryout) => (
                <TryoutCard
                  key={tryout.id}
                  tryout={tryout}
                  isPurchased={true}
                  onViewDetail={() => handleViewDetail(tryout)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <TryoutDetailModal
        tryout={detailModal.tryout}
        isPurchased={
          detailModal.tryout ? purchases.has(detailModal.tryout.id) : false
        }
        open={detailModal.open}
        onOpenChange={(open) =>
          setDetailModal({ open, tryout: null, loading: false })
        }
        onPurchase={handlePurchase}
        onStart={handleStart}
        loading={detailModal.loading}
      />

      {/* Purchase Success Modal */}
      <PurchaseSuccessModal
        open={successModal.open}
        onOpenChange={(open) => setSuccessModal((prev) => ({ ...prev, open }))}
        packageTitle={successModal.packageTitle}
        price={successModal.price}
        remainingBalance={successModal.remainingBalance}
        purchaseDate={successModal.purchaseDate}
        packageId={successModal.packageId}
      />
    </div>
  );
}
