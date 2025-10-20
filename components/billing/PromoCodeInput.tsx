import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Gift, CheckCircle, XCircle } from "lucide-react";
import { redeemVoucher, validatePromoCode } from "@/services/promoCodeService";
import { getUserBalance } from "@/services/billing";
import { toast } from "sonner";

interface PromoCodeInputProps {
  onBalanceUpdate?: () => void;
  className?: string;
}

export function PromoCodeInput({
  onBalanceUpdate,
  className,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error" | null;
    message: string;
    amount?: number;
    newBalance?: number;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    const validation = validatePromoCode(code);
    if (!validation.isValid) {
      setResult({
        type: "error",
        message: validation.message,
      });
      return;
    }

    setIsLoading(true);
    setResult({ type: null, message: "" });

    try {
      const redeemResult = await redeemVoucher(code);

      if (redeemResult.success) {
        setResult({
          type: "success",
          message: redeemResult.message,
          amount: redeemResult.amount_credited,
          newBalance: redeemResult.new_balance,
        });

        // Show success toast
        toast.success(
          `Berhasil redeem! Saldo ditambah Rp ${redeemResult.amount_credited.toLocaleString(
            "id-ID"
          )}`
        );

        // Refresh balance
        if (onBalanceUpdate) {
          onBalanceUpdate();
        } else {
          // Fallback: refresh balance directly
          await getUserBalance();
        }

        // Clear input
        setCode("");
      } else {
        setResult({
          type: "error",
          message: redeemResult.message,
        });

        // Show error toast
        toast.error(redeemResult.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tak terduga";
      setResult({
        type: "error",
        message: errorMessage,
      });

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCode(value);

    // Clear result when user starts typing
    if (result.type !== null) {
      setResult({ type: null, message: "" });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Redeem Kode Promo
        </CardTitle>
        <CardDescription>
          Masukkan kode promo untuk menambah saldo Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Masukkan kode promo"
              value={code}
              onChange={handleInputChange}
              disabled={isLoading}
              className="flex-1"
              maxLength={50}
            />
            <Button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redeem
                </>
              ) : (
                "Redeem"
              )}
            </Button>
          </div>

          {result.type && (
            <Alert
              className={
                result.type === "success"
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }
            >
              <div className="flex items-start gap-2">
                {result.type === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <AlertDescription
                  className={
                    result.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }
                >
                  {result.message}
                  {result.type === "success" && result.amount && (
                    <div className="mt-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        +Rp {result.amount.toLocaleString("id-ID")}
                      </Badge>
                      {result.newBalance && (
                        <p className="text-sm text-green-700 mt-1">
                          Saldo baru: Rp{" "}
                          {result.newBalance.toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>
              • Kode promo bersifat case-insensitive (tidak membedakan huruf
              besar/kecil)
            </p>
            <p>
              • Pastikan kode promo masih berlaku dan belum melebihi batas
              penggunaan
            </p>
            <p>
              • Saldo akan ditambahkan secara otomatis setelah redeem berhasil
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default PromoCodeInput;
