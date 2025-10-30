import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard,
  Download,
  Plus,
  Receipt,
  Loader2,
  Wallet,
  TrendingUp,
  TrendingDown,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  Gift,
  Tag,
} from "lucide-react";
import {
  getUserBalance,
  getUserTransactions,
  getUserPayments,
} from "@/services/billing";
import { Balance, Transaction, Payment } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { PromoCodeInput } from "@/components/billing/PromoCodeInput";

export default function Billing() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"transactions" | "payments">(
    "transactions"
  );

  // Top Up Modal States
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState("");

  // Redeem Modal States
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

  useEffect(() => {
    loadData();
    // REMOVED: Auto-update expired pending payments
    // Payment status should be updated by payment gateway webhook only
    // Frontend only reads the status from database
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("💳 Loading billing data...");

      const [balanceData, transactionsData, paymentsData] = await Promise.all([
        getUserBalance(),
        getUserTransactions(),
        getUserPayments(),
      ]);

      console.log("💰 Balance:", balanceData);
      console.log("📜 Transactions:", transactionsData);
      console.log("🧾 Payments:", paymentsData);

      setBalance(balanceData);
      setTransactions(transactionsData);
      setPayments(paymentsData);
    } catch (error) {
      console.error("❌ Error loading billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generateInvoiceNumber = (payment: Payment) => {
    if (payment.external_id) {
      return payment.external_id;
    }
    const date = new Date(payment.created_at);
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const idStr = payment.id.slice(0, 8).toUpperCase();
    return `INV-${dateStr}-${idStr}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return <CheckCircle className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "unpaid":
        return <span className="text-xs">⚠</span>;
      case "failed":
      case "expired":
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "unpaid":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "failed":
      case "expired":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const handleTopUpSubmit = async () => {
    const amount = parseInt(topUpAmount);

    if (!amount || amount <= 0) {
      setTopUpError("Masukkan jumlah yang valid");
      return;
    }

    setIsTopUpLoading(true);
    setTopUpError("");

    try {
      // Get Supabase session token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Session tidak ditemukan. Silakan login kembali.");
      }

      // Get API URL from environment variable
      // Use Edge Function if available, fallback to direct webhook
      const apiUrl =
        import.meta.env.VITE_TOPUP_FUNCTION_URL ||
        import.meta.env.VITE_N8N_WEBHOOK_URL;

      if (!apiUrl) {
        throw new Error("API URL tidak dikonfigurasi. Periksa file .env");
      }

      // TEMPORARY: Mock mode for testing UI (uncomment to enable)
      const MOCK_MODE = false; // Set to true untuk test UI tanpa n8n

      if (MOCK_MODE) {
        console.log("MOCK MODE: Simulating successful payment");
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay
        const mockInvoiceUrl = `https://payment-gateway.com/invoice/mock-${Date.now()}`;
        console.log("Mock redirect to:", mockInvoiceUrl);
        window.location.href = mockInvoiceUrl;
        return;
      }

      console.log("Calling API:", apiUrl);

      // Call API (Edge Function or direct webhook)
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ amount }),
      });

      // Parse response body
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error(
          `Server error: ${response.status} - Invalid JSON response`
        );
      }

      // Log for debugging
      console.log("API Response:", {
        status: response.status,
        statusText: response.statusText,
        data,
      });

      if (!response.ok) {
        // Show detailed error from API
        let errorMessage = `Server error: ${response.status}`;

        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        }

        // Log full error for debugging
        console.error("API Error Details:", {
          status: response.status,
          statusText: response.statusText,
          data: data,
          url: apiUrl,
        });

        throw new Error(errorMessage);
      }

      // Redirect to invoice URL
      if (data.invoice_url) {
        console.log("Redirecting to:", data.invoice_url);
        window.location.href = data.invoice_url;
      } else {
        console.error("No invoice_url in response:", data);
        throw new Error("Invoice URL tidak ditemukan dalam response");
      }
    } catch (error: any) {
      console.error("Top up error:", error);
      setTopUpError(error.message || "Terjadi kesalahan saat top up");
    } finally {
      setIsTopUpLoading(false);
    }
  };

  const handlePresetAmount = (amount: number) => {
    setTopUpAmount(amount.toString());
    setTopUpError("");
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Billing</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your balance and view transaction history
        </p>
      </div>

      {/* Current Balance - Mobile-First Design */}
      <Card className="mb-6 sm:mb-8">
        <CardContent className="p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <Wallet className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Balance
                </p>
                <h2 className="text-2xl sm:text-4xl font-bold">
                  {formatCurrency(balance?.balance || 0)}
                </h2>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <Button
                size="lg"
                onClick={() => setIsTopUpModalOpen(true)}
                className="w-full sm:w-auto min-h-[44px]"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">Top Up</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsRedeemModalOpen(true)}
                className="w-full sm:w-auto min-h-[44px]"
              >
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">Redeem</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats - Mobile-First */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground mb-1">Transactions</p>
              <p className="text-xl sm:text-2xl font-bold">
                {transactions.length}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground mb-1">Payments</p>
              <p className="text-xl sm:text-2xl font-bold">{payments.length}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
              <p className="text-sm font-semibold">
                {balance?.updated_at ? formatDate(balance.updated_at) : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Up Modal - Redesigned */}
      <Dialog open={isTopUpModalOpen} onOpenChange={setIsTopUpModalOpen}>
        <DialogContent className="sm:max-w-lg max-w-[95vw]">
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl">
                  Top Up Balance
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Pilih atau masukkan jumlah top up
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Balance Display */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground mb-1">
                Current Balance
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {formatCurrency(balance?.balance || 0)}
              </p>
            </div>

            {/* Preset Amount Cards - Mobile-First */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Quick Select
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[50000, 100000, 200000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handlePresetAmount(amount)}
                    disabled={isTopUpLoading}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 min-h-[44px] ${
                      parseInt(topUpAmount) === amount
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">Rp</div>
                    <div className="text-lg font-bold">
                      {(amount / 1000).toFixed(0)}K
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input - Mobile-First */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  Rp
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={topUpAmount}
                  onChange={(e) => {
                    setTopUpAmount(e.target.value);
                    setTopUpError("");
                  }}
                  disabled={isTopUpLoading}
                  className="text-base sm:text-lg pl-10 h-12 min-h-[44px]"
                  style={{ fontSize: "16px" }} // Prevent zoom on iOS
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum top up: Rp 10.000
              </p>
            </div>

            {/* Error Message */}
            {topUpError && (
              <div className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{topUpError}</span>
              </div>
            )}

            {/* Submit Button - Mobile-First */}
            <Button
              className="w-full h-12 text-base min-h-[44px]"
              size="lg"
              onClick={handleTopUpSubmit}
              disabled={
                isTopUpLoading || !topUpAmount || parseInt(topUpAmount) < 10000
              }
            >
              {isTopUpLoading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  <span className="text-sm sm:text-base">Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">Continue</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Redeem Modal */}
      <Dialog open={isRedeemModalOpen} onOpenChange={setIsRedeemModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Receipt className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl">
                  Redeem Kode Promo
                </DialogTitle>
                <DialogDescription>
                  Masukkan kode promo untuk menambah saldo Anda
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <PromoCodeInput onBalanceUpdate={loadData} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs - Mobile-First */}
      <div className="mb-6">
        <div className="flex space-x-1 border-b border-border overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors min-h-[44px] whitespace-nowrap ${
              activeTab === "transactions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-xs sm:text-sm">Transactions</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors min-h-[44px] whitespace-nowrap ${
              activeTab === "payments"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="text-xs sm:text-sm">Payments</span>
          </button>
        </div>
      </div>

      {/* Conditional Rendering based on Active Tab */}
      {activeTab === "transactions" ? (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                Transaction History
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                View all your credit transactions
              </p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <Card className="p-8 sm:p-12">
              <div className="text-center">
                <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  No transactions yet
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Your transaction history will appear here
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isTopUp = transaction.type === "topup";
                const isGift = transaction.type === "gift";
                const isPurchase =
                  transaction.type === "usage" && transaction.tryout_packages;
                // Check if it's a promo redemption by looking at the description or promo_code_usage
                const isPromoRedeem =
                  (isTopUp && transaction.promo_code_usage?.promo_codes) ||
                  (isTopUp && transaction.description?.includes("kode promo"));
                const isDirectTopUp = isTopUp && !isPromoRedeem;

                return (
                  <Card
                    key={transaction.id}
                    className={`hover:shadow-md transition-shadow ${
                      isPromoRedeem
                        ? "border-purple-200 dark:border-purple-800"
                        : isDirectTopUp
                        ? "border-green-200 dark:border-green-800"
                        : isGift
                        ? "border-yellow-200 dark:border-yellow-800"
                        : isPurchase
                        ? "border-blue-200 dark:border-blue-800"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        {/* Left: Icon + Description */}
                        <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
                          <div
                            className={`p-3 rounded-xl ${
                              isPromoRedeem
                                ? "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
                                : isDirectTopUp
                                ? "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30"
                                : isGift
                                ? "bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30"
                                : isPurchase
                                ? "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30"
                                : "bg-red-100 dark:bg-red-900/30"
                            }`}
                          >
                            {isPromoRedeem ? (
                              <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            ) : isDirectTopUp ? (
                              <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
                            ) : isGift ? (
                              <Gift className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            ) : isPurchase ? (
                              <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <ArrowUpRight className="w-6 h-6 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm sm:text-base">
                                {isPromoRedeem
                                  ? "Redeem Kode Promo"
                                  : isDirectTopUp
                                  ? "Top Up Langsung"
                                  : isGift
                                  ? "Gift Credit"
                                  : isPurchase
                                  ? "Pembelian Paket Tryout"
                                  : transaction.description || "Transaksi"}
                              </p>
                              {isPromoRedeem && (
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {
                                    transaction.promo_code_usage?.promo_codes
                                      ?.code
                                  }
                                </Badge>
                              )}
                            </div>

                            {/* Promo Code Detail */}
                            {isPromoRedeem && (
                              <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Gift className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                      <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                                        Kode Promo:{" "}
                                        {
                                          transaction.promo_code_usage
                                            ?.promo_codes?.code
                                        }
                                      </p>
                                    </div>
                                    {transaction.promo_code_usage?.promo_codes
                                      ?.description && (
                                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                        {
                                          transaction.promo_code_usage
                                            ?.promo_codes?.description
                                        }
                                      </p>
                                    )}
                                    <p className="text-xs text-purple-500 dark:text-purple-500 mt-2">
                                      Bonus saldo berhasil ditambahkan ke akun
                                      Anda
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Direct Top Up Detail */}
                            {isDirectTopUp && (
                              <div className="mt-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                        Top Up Saldo Langsung
                                      </p>
                                    </div>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                      Saldo berhasil ditambahkan ke akun Anda
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Gift Credit Detail */}
                            {isGift && (
                              <div className="mt-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Gift className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                        Gift Credit
                                      </p>
                                    </div>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                      {transaction.description ||
                                        "Gift credit dari admin"}
                                    </p>
                                    <p className="text-xs text-yellow-500 dark:text-yellow-500 mt-2">
                                      Saldo gift berhasil ditambahkan ke akun
                                      Anda
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Package Detail (if purchase) */}
                            {isPurchase && (
                              <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <ShoppingBag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                        {Array.isArray(
                                          transaction.tryout_packages
                                        )
                                          ? transaction.tryout_packages[0]
                                              ?.title || "Tryout Tanpa Judul"
                                          : transaction.tryout_packages
                                              ?.title || "Tryout Tanpa Judul"}
                                      </p>
                                    </div>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                      Pembelian paket tryout berhasil
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center space-x-3 mt-3">
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(transaction.created_at)}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  isPromoRedeem
                                    ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-400"
                                    : isDirectTopUp
                                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400"
                                    : isGift
                                    ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-400"
                                    : isPurchase
                                    ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-900/30 dark:to-cyan-900/30 dark:text-blue-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Success
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount */}
                        <div className="text-right">
                          <p
                            className={`text-xl font-bold ${
                              isPromoRedeem
                                ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
                                : isDirectTopUp
                                ? "text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600"
                                : isGift
                                ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600"
                                : isPurchase
                                ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600"
                                : transaction.amount > 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isPromoRedeem
                              ? "Bonus Saldo"
                              : isDirectTopUp
                              ? "Top Up"
                              : isGift
                              ? "Gift"
                              : isPurchase
                              ? "Pembelian"
                              : "Transaksi"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Payment History</h2>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                View all your payment records and invoices
              </p>
            </div>
          </div>

          {payments.length === 0 ? (
            <Card className="p-8 sm:p-12">
              <div className="text-center">
                <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                  <Receipt className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                  No payments yet
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Your payment history will appear here
                </p>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-muted-foreground">
                        DATE
                      </th>
                      <th className="text-left py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-muted-foreground">
                        AMOUNT
                      </th>
                      <th className="text-left py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-muted-foreground">
                        CREDITS
                      </th>
                      <th className="text-left py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-muted-foreground">
                        STATUS
                      </th>
                      <th className="text-right py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-semibold text-muted-foreground">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => {
                      const statusIcon = getStatusIcon(payment.status);
                      const statusColor = getStatusColor(payment.status);
                      const credits = payment.amount.toLocaleString("id-ID");

                      return (
                        <tr
                          key={payment.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                        >
                          <td className="py-2 sm:py-4 px-3 sm:px-6">
                            <p className="text-xs sm:text-sm font-medium">
                              {formatDate(payment.created_at)}
                            </p>
                          </td>
                          <td className="py-2 sm:py-4 px-3 sm:px-6">
                            <p className="text-xs sm:text-sm font-semibold">
                              {formatCurrency(payment.amount)}
                            </p>
                          </td>
                          <td className="py-2 sm:py-4 px-3 sm:px-6">
                            <p className="text-xs sm:text-sm font-medium text-primary">
                              {credits} credits
                            </p>
                          </td>
                          <td className="py-2 sm:py-4 px-3 sm:px-6">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                            >
                              {statusIcon}
                              {payment.status.charAt(0).toUpperCase() +
                                payment.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-2 sm:py-4 px-3 sm:px-6 text-right">
                            {payment.status.toLowerCase() === "paid" ||
                            payment.status.toLowerCase() === "completed" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  (window.location.href = `/dashboard/invoice/${payment.id}`)
                                }
                                className="min-h-[36px] min-w-[36px] p-2"
                              >
                                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm">
                                  Invoice
                                </span>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
