import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, ArrowRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface PurchaseSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageTitle: string;
  price: number;
  remainingBalance: number;
  purchaseDate: string;
  packageId: string;
}

export function PurchaseSuccessModal({
  open,
  onOpenChange,
  packageTitle,
  price,
  remainingBalance,
  purchaseDate,
  packageId,
}: PurchaseSuccessModalProps) {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      setCountdown(5);

      // Countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto close after 5 seconds
      const autoCloseTimer = setTimeout(() => {
        onOpenChange(false);
      }, 5000);

      return () => {
        clearInterval(timer);
        clearTimeout(autoCloseTimer);
        setShowConfetti(false);
      };
    }
  }, [open, onOpenChange]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(date);
  };

  const handleStartTryout = async () => {
    onOpenChange(false);
    // Navigate to create session and start tryout
    navigate(`/dashboard/tryout`);
    // Trigger start tryout for this package
    // This will be handled by the parent component
  };

  const handleViewMyPackages = () => {
    onOpenChange(false);
    navigate("/dashboard/tryout");
    // Parent component should switch to "Paket Saya" tab
  };

  // Don't render if not open or missing required data
  if (!open || !packageTitle) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-gray-200">
        {/* Header with gradient accent */}
        <div className="h-2 bg-gradient-to-r from-gray-900 to-black"></div>

        {/* Animated Success Icon */}
        <div className="flex justify-center mb-6 mt-4">
          <div className={cn("relative", "animate-in zoom-in-50 duration-500")}>
            <div className="absolute inset-0 bg-black/10 rounded-full blur-xl animate-pulse" />
            <div className="relative p-4 bg-gray-100 rounded-full">
              <CheckCircle className="w-16 h-16 text-black animate-in zoom-in-50 duration-700" />
            </div>
          </div>
        </div>

        {/* Confetti Effect (CSS only) - Black and white theme */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-br from-gray-400 to-gray-800 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-10px",
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            Pembelian Berhasil!
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Paket tryout Anda sudah siap digunakan
          </DialogDescription>
        </DialogHeader>

        {/* Purchase Details */}
        <div className="space-y-4 py-4">
          {/* Package Name */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1 font-medium">
                  Paket Tryout
                </p>
                <p className="font-semibold text-gray-900">{packageTitle}</p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-600">Harga Paket</span>
              <span className="font-semibold text-gray-900">
                {formatPrice(price)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo Tersisa</span>
              <span className="font-semibold text-green-700">
                {formatPrice(remainingBalance)}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-gray-600">Tanggal & Waktu</span>
              <span className="font-medium text-xs text-gray-700">
                {formatDate(purchaseDate)}
              </span>
            </div>
          </div>

          {/* Success Message */}
          <div className="flex items-center gap-3 p-4 bg-gray-900 text-white rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
            <p className="text-sm font-medium">
              Selamat! Anda dapat langsung memulai tryout sekarang.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3 pt-4">
          <Button
            onClick={handleStartTryout}
            className="w-full bg-black text-white hover:bg-gray-800 transition-colors"
            size="lg"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Mulai Tryout Sekarang
          </Button>
          <Button
            onClick={handleViewMyPackages}
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-50 transition-colors"
            size="lg"
          >
            <Package className="w-4 h-4 mr-2" />
            Lihat Paket Saya
          </Button>
          {countdown > 0 && (
            <p className="text-xs text-center text-gray-500 mt-2">
              Menutup otomatis dalam {countdown} detik...
            </p>
          )}
        </DialogFooter>
      </DialogContent>

      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </Dialog>
  );
}
