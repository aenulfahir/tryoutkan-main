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
      <DialogContent className="sm:max-w-md">
        {/* Animated Success Icon */}
        <div className="flex justify-center mb-4">
          <div className={cn("relative", "animate-in zoom-in-50 duration-500")}>
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative p-4 bg-green-100 dark:bg-green-950 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 animate-in zoom-in-50 duration-700" />
            </div>
          </div>
        </div>

        {/* Confetti Effect (CSS only) */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-confetti"
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
          <DialogTitle className="text-center text-2xl font-bold text-green-600 dark:text-green-400">
            Pembelian Berhasil!
          </DialogTitle>
          <DialogDescription className="text-center">
            Paket tryout Anda sudah siap digunakan
          </DialogDescription>
        </DialogHeader>

        {/* Purchase Details */}
        <div className="space-y-4 py-4">
          {/* Package Name */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Paket Tryout
                </p>
                <p className="font-semibold">{packageTitle}</p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Harga Paket</span>
              <span className="font-semibold">{formatPrice(price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo Tersisa</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatPrice(remainingBalance)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">Tanggal & Waktu</span>
              <span className="font-medium text-xs">
                {formatDate(purchaseDate)}
              </span>
            </div>
          </div>

          {/* Success Message */}
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-700 dark:text-green-300">
              Selamat! Anda dapat langsung memulai tryout sekarang.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={handleStartTryout} className="w-full" size="lg">
            <ArrowRight className="w-4 h-4 mr-2" />
            Mulai Tryout Sekarang
          </Button>
          <Button
            onClick={handleViewMyPackages}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Package className="w-4 h-4 mr-2" />
            Lihat Paket Saya
          </Button>
          {countdown > 0 && (
            <p className="text-xs text-center text-muted-foreground mt-2">
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
