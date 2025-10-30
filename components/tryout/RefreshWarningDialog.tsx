import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefreshWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RefreshWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: RefreshWarningDialogProps) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!open) {
      setCountdown(10);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onConfirm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, onConfirm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md mx-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400 animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-bold text-orange-600 dark:text-orange-400">
            Peringatan Refresh Halaman
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            Apakah Anda yakin ingin memuat ulang halaman?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Info Cards */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Save className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Progress Tersimpan
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  Jawaban Anda sudah otomatis tersimpan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <Clock className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200">
                  Timer Tetap Berjalan
                </p>
                <p className="text-red-600 dark:text-red-400">
                  Waktu tryout akan terus dihitung
                </p>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Halaman akan otomatis dimuat ulang dalam:
            </p>
            <div
              className={cn(
                "text-3xl font-bold tabular-nums",
                countdown <= 3 ? "text-red-600 animate-pulse" : "text-primary"
              )}
            >
              {countdown}
            </div>
            <p className="text-xs text-muted-foreground mt-1">detik</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Batal, Lanjut Mengerjakan
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="flex-1"
            >
              Ya, Muat Ulang Halaman
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
