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
        className="max-w-md mx-auto border-2 border-black bg-white"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <AlertTriangle className="w-8 h-8 text-black animate-pulse" />
          </div>
          <DialogTitle className="text-xl font-black text-black">
            Peringatan Refresh Halaman
          </DialogTitle>
          <DialogDescription className="text-base mt-2 text-gray-600 font-medium">
            Apakah Anda yakin ingin memuat ulang halaman?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Info Cards */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Save className="w-5 h-5 text-black flex-shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-black">
                  Progress Tersimpan
                </p>
                <p className="text-gray-600 font-medium">
                  Jawaban Anda sudah otomatis tersimpan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Clock className="w-5 h-5 text-black flex-shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-black">
                  Timer Tetap Berjalan
                </p>
                <p className="text-gray-600 font-medium">
                  Waktu tryout akan terus dihitung
                </p>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-black border-dashed">
            <p className="text-sm text-gray-600 font-medium mb-2">
              Halaman akan otomatis dimuat ulang dalam:
            </p>
            <div
              className={cn(
                "text-3xl font-black tabular-nums",
                countdown <= 3 ? "text-red-600 animate-pulse" : "text-black"
              )}
            >
              {countdown}
            </div>
            <p className="text-xs text-gray-500 font-bold mt-1">detik</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-2 border-black font-bold hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="flex-1 bg-black text-white hover:bg-gray-800 border-2 border-black font-bold"
            >
              Ya, Muat Ulang
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
