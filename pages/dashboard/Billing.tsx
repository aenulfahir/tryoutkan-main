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
  Plus,
  Receipt,
  Loader2,
  Wallet,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
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
import { getCurrentUserProfile, Profile } from "@/services/profile";
import { generatePaymentInvoice } from "@/lib/pdfGenerator";

export default function Billing() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"transactions" | "payments">(
    "transactions"
  );
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  // Top Up Modal States
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState("");

  // Redeem Modal States
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("💳 Loading billing data...");

      const [balanceData, transactionsData, paymentsData, profileData] = await Promise.all([
        getUserBalance(),
        getUserTransactions(),
        getUserPayments(),
        getCurrentUserProfile(),
      ]);

      setBalance(balanceData);
      setTransactions(transactionsData);
      setPayments(paymentsData);
      setUserProfile(profileData);
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
        return "bg-green-100 text-green-700 border-green-600";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-600";
      case "unpaid":
        return "bg-orange-100 text-orange-700 border-orange-600";
      case "failed":
      case "expired":
        return "bg-red-100 text-red-700 border-red-600";
      default:
        return "bg-gray-100 text-gray-700 border-gray-600";
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
      const apiUrl =
        import.meta.env.VITE_TOPUP_FUNCTION_URL ||
        import.meta.env.VITE_N8N_WEBHOOK_URL;

      if (!apiUrl) {
        throw new Error("API URL tidak dikonfigurasi. Periksa file .env");
      }

      // Call API
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

      if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;

        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        }

        throw new Error(errorMessage);
      }

      // Redirect to invoice URL in new tab and update UI
      if (data.invoice_url) {
        window.open(data.invoice_url, "_blank");
        setIsTopUpModalOpen(false);
        setActiveTab("payments");
        loadData(); // Trigger loading state and refresh data
      } else {
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
      <div className="p-8 flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-black" />
          <p className="text-gray-600 font-medium">Loading billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-white min-h-screen text-black">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">Billing</h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">
          Manage your balance and view transaction history
        </p>
      </div>

      {/* Current Balance - Mobile-First Design */}
      <Card className="mb-6 sm:mb-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-black text-white rounded-xl border-2 border-black">
                <Wallet className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold mb-1">
                  Total Balance
                </p>
                <h2 className="text-2xl sm:text-4xl font-black">
                  {formatCurrency(balance?.balance || 0)}
                </h2>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <Button
                size="lg"
                onClick={() => setIsTopUpModalOpen(true)}
                className="w-full sm:w-auto min-h-[44px] bg-black text-white hover:bg-gray-800 border-2 border-black font-bold"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">Top Up</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsRedeemModalOpen(true)}
                className="w-full sm:w-auto min-h-[44px] border-2 border-black font-bold hover:bg-gray-100"
              >
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">Redeem</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats - Mobile-First */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t-2 border-gray-100">
            <div className="text-center sm:text-left">
              <p className="text-xs text-gray-600 font-bold mb-1">Transactions</p>
              <p className="text-xl sm:text-2xl font-black">
                {transactions.length}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-gray-600 font-bold mb-1">Payments</p>
              <p className="text-xl sm:text-2xl font-black">{payments.length}</p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-gray-600 font-bold mb-1">Last Updated</p>
              <p className="text-sm font-bold">
                {balance?.updated_at ? formatDate(balance.updated_at) : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Up Modal - Redesigned */}
      <Dialog open={isTopUpModalOpen} onOpenChange={setIsTopUpModalOpen}>
        <DialogContent className="sm:max-w-lg max-w-[95vw] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden gap-0">
          <div className="p-6 bg-black text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-black text-white">
                  Top Up Balance
                </DialogTitle>
                <DialogDescription className="text-white/80 font-medium">
                  Secure payment via Xendit
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 bg-white">
            {/* Current Balance Display */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-black border-dashed flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                  Current Balance
                </p>
                <p className="text-2xl font-black text-black">
                  {formatCurrency(balance?.balance || 0)}
                </p>
              </div>
              <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Preset Amount Cards - Mobile-First */}
            <div>
              <label className="text-sm font-bold mb-3 block flex items-center justify-between">
                <span>Quick Select</span>
                <span className="text-xs text-gray-500 font-normal">Instant processing</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[50000, 100000, 200000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handlePresetAmount(amount)}
                    disabled={isTopUpLoading}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 min-h-[80px] flex flex-col items-center justify-center ${parseInt(topUpAmount) === amount
                      ? "border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] translate-x-[-2px] translate-y-[-2px]"
                      : "border-gray-200 bg-white text-black hover:border-black hover:bg-gray-50"
                      } disabled:opacity-50 disabled:cursor-not-allowed group`}
                  >
                    {amount === 100000 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-black shadow-sm z-10">
                        POPULAR
                      </div>
                    )}
                    <div className={`text-xs mb-1 font-bold ${parseInt(topUpAmount) === amount ? "text-gray-300" : "text-gray-400"}`}>IDR</div>
                    <div className="text-lg font-black">
                      {(amount / 1000).toFixed(0)}K
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input - Mobile-First */}
            <div className="space-y-2">
              <label className="text-sm font-bold">Custom Amount</label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold group-focus-within:text-black transition-colors">
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
                  className="text-base sm:text-lg pl-10 h-14 min-h-[44px] border-2 border-gray-200 focus:border-black font-bold focus-visible:ring-0 focus-visible:ring-offset-0 transition-all rounded-xl"
                  style={{ fontSize: "16px" }} // Prevent zoom on iOS
                />
              </div>
              <p className="text-xs text-gray-500 font-medium flex items-center">
                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                Minimum top up: Rp 10.000
              </p>
            </div>

            {/* Error Message */}
            {topUpError && (
              <div className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border-2 border-red-600 font-bold animate-in fade-in slide-in-from-top-2">
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{topUpError}</span>
              </div>
            )}

            {/* Submit Button - Mobile-First */}
            <Button
              className="w-full h-14 text-base min-h-[44px] bg-black text-white hover:bg-gray-800 border-2 border-black font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-y-[4px] active:translate-x-[4px]"
              size="lg"
              onClick={handleTopUpSubmit}
              disabled={
                isTopUpLoading || !topUpAmount || parseInt(topUpAmount) < 10000
              }
            >
              {isTopUpLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span className="text-base">Processing Payment...</span>
                </>
              ) : (
                <>
                  <span className="text-base mr-2">Continue to Payment</span>
                  <ArrowUpRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                Secure Payment Processing
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Redeem Modal */}
      <Dialog open={isRedeemModalOpen} onOpenChange={setIsRedeemModalOpen}>
        <DialogContent className="sm:max-w-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-black text-white rounded-lg border-2 border-black">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black">
                  Redeem Kode Promo
                </DialogTitle>
                <DialogDescription className="font-medium text-gray-600">
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
        <div className="flex space-x-1 border-b-2 border-gray-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`px-3 sm:px-4 py-2 text-sm font-bold border-b-2 transition-colors min-h-[44px] whitespace-nowrap -mb-[2px] ${activeTab === "transactions"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-black"
              }`}
          >
            <span className="text-xs sm:text-sm">Transactions</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`px-3 sm:px-4 py-2 text-sm font-bold border-b-2 transition-colors min-h-[44px] whitespace-nowrap -mb-[2px] ${activeTab === "payments"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-black"
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
              <h2 className="text-xl sm:text-2xl font-black">
                Transaction History
              </h2>
              <p className="text-gray-600 font-medium text-xs sm:text-sm mt-1">
                View all your credit transactions
              </p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <Card className="p-8 sm:p-12 border-2 border-black border-dashed bg-gray-50">
              <div className="text-center">
                <div className="inline-flex p-4 bg-white border-2 border-black rounded-full mb-4">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                </div>
                <p className="text-sm sm:text-base font-bold text-black">
                  No transactions yet
                </p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
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
                const isPromoRedeem =
                  (isTopUp && transaction.promo_code_usage?.promo_codes) ||
                  (isTopUp && transaction.description?.includes("kode promo"));
                const isDirectTopUp = isTopUp && !isPromoRedeem;

                return (
                  <Card
                    key={transaction.id}
                    className={`hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black group`}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        {/* Left: Icon + Description */}
                        <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
                          <div
                            className={`p-3 rounded-xl border-2 border-black bg-white text-black`}
                          >
                            {isPromoRedeem ? (
                              <Gift className="w-6 h-6" />
                            ) : isDirectTopUp ? (
                              <Wallet className="w-6 h-6" />
                            ) : isGift ? (
                              <Gift className="w-6 h-6" />
                            ) : isPurchase ? (
                              <ShoppingBag className="w-6 h-6" />
                            ) : (
                              <ArrowUpRight className="w-6 h-6" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-black text-sm sm:text-base text-black">
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
                                <Badge className="bg-black text-white border-2 border-black text-xs font-bold">
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
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg border-2 border-black border-dashed">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Gift className="w-4 h-4 text-black" />
                                      <p className="text-sm font-bold text-black">
                                        Kode Promo:{" "}
                                        {
                                          transaction.promo_code_usage
                                            ?.promo_codes?.code
                                        }
                                      </p>
                                    </div>
                                    {transaction.promo_code_usage?.promo_codes
                                      ?.description && (
                                        <p className="text-xs text-gray-600 font-medium mt-1">
                                          {
                                            transaction.promo_code_usage
                                              ?.promo_codes?.description
                                          }
                                        </p>
                                      )}
                                    <p className="text-xs text-gray-500 font-medium mt-2">
                                      Bonus saldo berhasil ditambahkan ke akun
                                      Anda
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Direct Top Up Detail */}
                            {isDirectTopUp && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg border-2 border-black border-dashed">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Wallet className="w-4 h-4 text-black" />
                                      <p className="text-sm font-bold text-black">
                                        Top Up Saldo Langsung
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-600 font-medium mt-1">
                                      Saldo berhasil ditambahkan ke akun Anda
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Gift Credit Detail */}
                            {isGift && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg border-2 border-black border-dashed">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Gift className="w-4 h-4 text-black" />
                                      <p className="text-sm font-bold text-black">
                                        Gift Credit
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-600 font-medium mt-1">
                                      {transaction.description ||
                                        "Gift credit dari admin"}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium mt-2">
                                      Saldo gift berhasil ditambahkan ke akun
                                      Anda
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Package Detail (if purchase) */}
                            {isPurchase && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg border-2 border-black border-dashed">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <ShoppingBag className="w-4 h-4 text-black" />
                                      <p className="text-sm font-bold text-black">
                                        {Array.isArray(
                                          transaction.tryout_packages
                                        )
                                          ? transaction.tryout_packages[0]
                                            ?.title || "Tryout Tanpa Judul"
                                          : transaction.tryout_packages
                                            ?.title || "Tryout Tanpa Judul"}
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-600 font-medium mt-1">
                                      Pembelian paket tryout berhasil
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center space-x-3 mt-3">
                              <span className="text-xs text-gray-500 font-medium">
                                {formatDateTime(transaction.created_at)}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border-2 ${isPromoRedeem
                                  ? "bg-purple-100 text-purple-700 border-purple-600"
                                  : isDirectTopUp
                                    ? "bg-green-100 text-green-700 border-green-600"
                                    : isGift
                                      ? "bg-yellow-100 text-yellow-700 border-yellow-600"
                                      : isPurchase
                                        ? "bg-blue-100 text-blue-700 border-blue-600"
                                        : "bg-red-100 text-red-700 border-red-600"
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
                            className={`text-xl font-black ${transaction.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                              }`}
                          >
                            {transaction.amount > 0 ? "+" : ""}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-500 font-bold mt-1">
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
              <h2 className="text-xl sm:text-2xl font-black">Payment History</h2>
              <p className="text-gray-600 font-medium text-xs sm:text-sm mt-1">
                View all your top up payments
              </p>
            </div>
          </div>

          {payments.length === 0 ? (
            <Card className="p-8 sm:p-12 border-2 border-black border-dashed bg-gray-50">
              <div className="text-center">
                <div className="inline-flex p-4 bg-white border-2 border-black rounded-full mb-4">
                  <Receipt className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                </div>
                <p className="text-sm sm:text-base font-bold text-black">
                  No payments yet
                </p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                  Your payment history will appear here
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <Card
                  key={payment.id}
                  className="hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black group"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white border-2 border-black rounded-xl text-black">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-sm sm:text-base text-black">
                            Top Up Balance
                          </p>
                          <p className="text-xs text-gray-500 font-bold">
                            {generateInvoiceNumber(payment)}
                          </p>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-xs text-gray-500 font-medium">
                              {formatDateTime(payment.created_at)}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`flex items-center space-x-1 border-2 font-bold ${getStatusColor(
                                payment.status
                              )}`}
                            >
                              {getStatusIcon(payment.status)}
                              <span className="capitalize ml-1">
                                {payment.status}
                              </span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-black">
                          {formatCurrency(payment.amount)}
                        </p>
                        {payment.invoice_url &&
                          (payment.status as string).toUpperCase() === "PENDING" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 w-full border-2 border-black font-bold"
                              onClick={() => window.open(payment.invoice_url!, "_blank")}
                            >
                              Bayar Sekarang
                            </Button>
                          )}

                        {((payment.status as string).toUpperCase() === "PAID" || (payment.status as string).toUpperCase() === "COMPLETED") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full border-2 border-black font-bold hover:bg-gray-100"
                            onClick={() => generatePaymentInvoice(payment, userProfile)}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Download Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )
      }
    </div >
  );
}
