import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  createPromoCode,
  generatePromoCode,
  validatePromoCode,
} from "@/services/promoCodeService";
import { toast } from "sonner";

interface PromoCodeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: {
    id: string;
    code: string;
    description: string | null;
    topup_amount: number;
    max_usage: number | null;
    per_user_limit: number;
    expires_at: string | null;
    is_active: boolean;
  };
}

export function PromoCodeForm({
  isOpen,
  onClose,
  onSuccess,
  editData,
}: PromoCodeFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    topup_amount: "",
    max_usage: "",
    per_user_limit: "1",
    has_expiry: false,
    expires_at: undefined as Date | undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          code: editData.code,
          description: editData.description || "",
          topup_amount: editData.topup_amount.toString(),
          max_usage: editData.max_usage?.toString() || "",
          per_user_limit: editData.per_user_limit.toString(),
          has_expiry: editData.expires_at !== null,
          expires_at: editData.expires_at
            ? new Date(editData.expires_at)
            : undefined,
        });
      } else {
        setFormData({
          code: generatePromoCode(8),
          description: "",
          topup_amount: "",
          max_usage: "",
          per_user_limit: "1",
          has_expiry: false,
          expires_at: undefined,
        });
      }
      setErrors({});
    }
  }, [isOpen, editData]);

  const handleInputChange = (
    field: string,
    value: string | boolean | Date | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const generateNewCode = () => {
    const newCode = generatePromoCode(8);
    setFormData((prev) => ({ ...prev, code: newCode }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate code
    if (!formData.code.trim()) {
      newErrors.code = "Kode promo tidak boleh kosong";
    } else {
      const codeValidation = validatePromoCode(formData.code);
      if (!codeValidation.isValid) {
        newErrors.code = codeValidation.message;
      }
    }

    // Validate amount
    if (!formData.topup_amount || parseInt(formData.topup_amount) <= 0) {
      newErrors.topup_amount = "Amount harus lebih dari 0";
    }

    // Validate max usage
    if (formData.max_usage && parseInt(formData.max_usage) <= 0) {
      newErrors.max_usage = "Max usage harus lebih dari 0";
    }

    // Validate per user limit
    if (!formData.per_user_limit || parseInt(formData.per_user_limit) <= 0) {
      newErrors.per_user_limit = "Per user limit harus lebih dari 0";
    }

    // Validate expiry date
    if (formData.has_expiry && !formData.expires_at) {
      newErrors.expires_at = "Tanggal expiry harus dipilih";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await createPromoCode(
        formData.code,
        formData.description || null,
        parseInt(formData.topup_amount),
        formData.max_usage ? parseInt(formData.max_usage) : null,
        parseInt(formData.per_user_limit),
        formData.expires_at || null
      );

      if (result.success) {
        toast.success("Kode promo berhasil dibuat");
        onSuccess();
        onClose();
      } else {
        toast.error(result.message);
        if (result.message.toLowerCase().includes("sudah ada")) {
          setErrors({ code: result.message });
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tak terduga";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Kode Promo" : "Buat Kode Promo Baru"}
          </DialogTitle>
          <DialogDescription>
            {editData
              ? "Edit detail kode promo yang sudah ada"
              : "Buat kode promo baru untuk top-up saldo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Kode Promo */}
          <div className="space-y-2">
            <Label htmlFor="code">Kode Promo</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  handleInputChange("code", e.target.value.toUpperCase())
                }
                placeholder="Masukkan kode promo"
                disabled={isLoading}
                className={errors.code ? "border-red-500" : ""}
                maxLength={50}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateNewCode}
                disabled={isLoading}
              >
                Generate
              </Button>
            </div>
            {errors.code && (
              <p className="text-sm text-red-500">{errors.code}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Deskripsi kode promo"
              disabled={isLoading}
              rows={2}
            />
          </div>

          {/* Amount Top-up */}
          <div className="space-y-2">
            <Label htmlFor="topup_amount">Amount Top-up (Rp)</Label>
            <Input
              id="topup_amount"
              type="number"
              value={formData.topup_amount}
              onChange={(e) =>
                handleInputChange("topup_amount", e.target.value)
              }
              placeholder="Masukkan amount"
              disabled={isLoading}
              className={errors.topup_amount ? "border-red-500" : ""}
              min={1000}
              step={1000}
            />
            {errors.topup_amount && (
              <p className="text-sm text-red-500">{errors.topup_amount}</p>
            )}
          </div>

          {/* Max Usage */}
          <div className="space-y-2">
            <Label htmlFor="max_usage">Max Usage (Opsional)</Label>
            <Input
              id="max_usage"
              type="number"
              value={formData.max_usage}
              onChange={(e) => handleInputChange("max_usage", e.target.value)}
              placeholder="Kosongkan untuk unlimited"
              disabled={isLoading}
              className={errors.max_usage ? "border-red-500" : ""}
              min={1}
            />
            {errors.max_usage && (
              <p className="text-sm text-red-500">{errors.max_usage}</p>
            )}
            <p className="text-xs text-gray-500">
              Kosongkan jika kode promo bisa digunakan tanpa batas
            </p>
          </div>

          {/* Per User Limit */}
          <div className="space-y-2">
            <Label htmlFor="per_user_limit">Per User Limit</Label>
            <Input
              id="per_user_limit"
              type="number"
              value={formData.per_user_limit}
              onChange={(e) =>
                handleInputChange("per_user_limit", e.target.value)
              }
              placeholder="Jumlah maksimal per user"
              disabled={isLoading}
              className={errors.per_user_limit ? "border-red-500" : ""}
              min={1}
            />
            {errors.per_user_limit && (
              <p className="text-sm text-red-500">{errors.per_user_limit}</p>
            )}
            <p className="text-xs text-gray-500">
              Jumlah maksimal satu user bisa menggunakan kode ini
            </p>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_expiry"
                checked={formData.has_expiry}
                onCheckedChange={(checked) =>
                  handleInputChange("has_expiry", checked)
                }
                disabled={isLoading}
              />
              <Label htmlFor="has_expiry">Tanggal Kadaluarsa</Label>
            </div>

            {formData.has_expiry && (
              <Input
                type="datetime-local"
                value={
                  formData.expires_at
                    ? new Date(
                        formData.expires_at.getTime() -
                          formData.expires_at.getTimezoneOffset() * 60000
                      )
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) => {
                  const date = e.target.value
                    ? new Date(e.target.value)
                    : undefined;
                  handleInputChange("expires_at", date);
                }}
                disabled={isLoading}
                className={errors.expires_at ? "border-red-500" : ""}
                min={new Date().toISOString().slice(0, 16)}
              />
            )}

            {errors.expires_at && (
              <p className="text-sm text-red-500">{errors.expires_at}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : editData ? "Update" : "Buat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PromoCodeForm;
