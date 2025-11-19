import { useState } from "react";
import { toast } from "sonner";
import { giftCreditsToUser } from "@/services/giftCredit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Gift } from "lucide-react";

interface GiftCreditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  userName: string | null;
  onSuccess: () => void;
}

export function GiftCreditDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onSuccess,
}: GiftCreditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "Gift credits from admin",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User ID is required");
      return;
    }

    const amount = parseInt(formData.amount);

    if (!amount || amount <= 0) {
      toast.error("Masukkan jumlah yang valid (lebih dari 0)");
      return;
    }

    if (amount > 10000000) {
      toast.error("Maksimal gift adalah Rp 10.000.000");
      return;
    }

    try {
      setLoading(true);

      // Call the gift credits service
      const result = await giftCreditsToUser(
        userId,
        amount,
        formData.description
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success(
        `Berhasil memberikan gift sebesar Rp ${amount.toLocaleString(
          "id-ID"
        )} kepada ${userName}`
      );

      // Reset form
      setFormData({
        amount: "",
        description: "Gift credits from admin",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error gifting credits:", error);
      toast.error("Gagal memberikan gift: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-black text-white border-2 border-black rounded-lg">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="font-black text-xl">Gift Credit ke User</DialogTitle>
              <DialogDescription className="font-medium text-gray-600">
                Berikan credit/gift kepada {userName || "user ini"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Info Display */}
          <div className="bg-gray-50 border-2 border-black p-3 rounded-lg">
            <p className="text-sm font-bold text-gray-600">User:</p>
            <p className="text-lg font-black text-black">
              {userName || "Unknown User"}
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-bold">
              Jumlah Gift (Rp) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black font-bold">
                Rp
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                disabled={loading}
                className="pl-10 border-2 border-black font-black focus-visible:ring-0"
                min="1"
                max="10000000"
                required
              />
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Minimal: Rp 1.000, Maksimal: Rp 10.000.000
            </p>
          </div>

          {/* Preset Amount Buttons */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">Quick Amount</Label>
            <div className="grid grid-cols-3 gap-2">
              {[10000, 25000, 50000, 100000, 250000, 500000].map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({ ...formData, amount: amount.toString() })
                  }
                  disabled={loading}
                  className="h-10 border-2 border-black font-bold hover:bg-gray-100"
                >
                  Rp {(amount / 1000).toFixed(0)}K
                </Button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-bold">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              placeholder="Masukkan deskripsi untuk gift ini"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={loading}
              rows={3}
              maxLength={200}
              className="border-2 border-black font-medium focus-visible:ring-0"
            />
            <p className="text-xs text-gray-500 font-medium">
              {formData.description.length}/200 karakter
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-2 border-black font-bold hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-black text-white hover:bg-gray-800 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Gift Credit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
