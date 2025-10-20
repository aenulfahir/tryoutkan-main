import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Payment } from "@/types/database";
import { Loader2, CheckCircle, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import "@/styles/invoice-print.css";

export default function Invoice() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadInvoiceData();
  }, [paymentId]);

  const loadInvoiceData = async () => {
    try {
      // Get user info
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setUserEmail(user.email || "");
      setUserName(user.user_metadata?.name || "User");

      // Get payment data
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setPayment(data);
    } catch (error) {
      console.error("Error loading invoice:", error);
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
      month: "2-digit",
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
      timeZone: "Asia/Jakarta",
    });
  };

  const generateInvoiceNumber = (payment: Payment) => {
    const date = new Date(payment.created_at);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const id = payment.id.slice(0, 8).toUpperCase();
    return `TRYOUTKAN-${year}${month}${day}-${id}`;
  };

  const calculateCredits = (amount: number) => {
    // 1 credit = Rp 1
    return amount.toLocaleString("id-ID");
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          label: "COMPLETED",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          icon: <CheckCircle className="w-3 h-3" />,
        };
      case "pending":
        return {
          label: "PENDING",
          className:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
        };
      case "unpaid":
        return {
          label: "UNPAID",
          className:
            "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
          icon: <span className="text-xs">⚠</span>,
        };
      case "failed":
        return {
          label: "FAILED",
          className:
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
          icon: <span className="text-xs">✕</span>,
        };
      default:
        return {
          label: status.toUpperCase(),
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
          icon: null,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Invoice not found</p>
          <Button
            onClick={() => navigate("/dashboard/billing")}
            className="mt-4"
          >
            Back to Billing
          </Button>
        </div>
      </div>
    );
  }

  const invoiceNumber = generateInvoiceNumber(payment);
  const credits = calculateCredits(payment.amount);
  const statusBadge = getStatusBadge(payment.status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 print:bg-white py-8">
      {/* Invoice Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 invoice-container">
        {/* Action Buttons - Hidden when printing */}
        <div className="print:hidden flex justify-end gap-2 mb-6">
          <Button
            onClick={() => navigate("/dashboard/billing")}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handlePrint} size="lg">
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 sm:p-12 print:shadow-none print:rounded-none print:bg-white print:text-black">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                TryoutKan
              </h1>
              <p className="text-sm text-muted-foreground">
                Platform Tryout Online
              </p>
              <p className="text-sm text-muted-foreground">
                support@tryoutkan.com
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-muted-foreground mb-1">
                Invoice
              </p>
              <p className="text-lg font-bold">{invoiceNumber}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {formatDateTime(payment.created_at)} WIB
              </p>
            </div>
          </div>

          {/* From & To */}
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                From:
              </p>
              <p className="font-semibold">TryoutKan</p>
              <p className="text-sm text-muted-foreground">
                Platform Tryout Online Terpercaya
              </p>
              <p className="text-sm text-muted-foreground">
                support@tryoutkan.com
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                To:
              </p>
              <p className="font-semibold">{userName}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="mb-12">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-sm font-semibold text-muted-foreground">
                    Description
                  </th>
                  <th className="text-center py-3 text-sm font-semibold text-muted-foreground">
                    Credits
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-center py-3 text-sm font-semibold text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4">
                    <p className="font-medium">Credit Purchase</p>
                    <p className="text-sm text-muted-foreground">
                      Top up saldo untuk pembelian paket tryout
                    </p>
                  </td>
                  <td className="text-center py-4">
                    <p className="font-semibold text-primary">
                      {credits} credits
                    </p>
                  </td>
                  <td className="text-right py-4">
                    <p className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </p>
                  </td>
                  <td className="text-center py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}
                    >
                      {statusBadge.icon}
                      {statusBadge.label}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mb-12">
            <div className="w-64">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">Rp 0</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-200 dark:border-gray-700">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-muted-foreground mb-2">
              Thank you for using TryoutKan!
            </p>
            <p className="text-xs text-muted-foreground">
              Payment Reference: {payment.external_id || invoiceNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
