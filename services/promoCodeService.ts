import { supabase } from "@/lib/supabase";

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  type: string;
  topup_amount: number;
  max_usage: number | null;
  current_usage: number;
  per_user_limit: number;
  min_purchase: number;
  expires_at: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeUsage {
  id: string;
  promo_code_id: string;
  user_id: string;
  transaction_id: string | null;
  amount: number;
  used_at: string;
}

export interface PromoCodeStats {
  promo_code_id: string;
  code: string;
  description: string | null;
  topup_amount: number;
  max_usage: number | null;
  current_usage: number;
  per_user_limit: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  unique_users_count: number;
  total_amount_credited: number;
}

export interface RedeemResult {
  success: boolean;
  message: string;
  amount_credited: number;
  new_balance: number;
  transaction_id: string | null;
  promo_code_id: string | null;
}

export interface CreatePromoCodeResult {
  success: boolean;
  message: string;
  promo_code_id: string | null;
}

/**
 * Redeem a promo code to top up user balance
 */
export async function redeemVoucher(code: string): Promise<RedeemResult> {
  try {
    const { data, error } = await supabase.rpc("redeem_promo_code", {
      p_code: code,
      p_user_id: null, // Let the function use auth.uid()
    });

    if (error) {
      console.error("Error redeeming promo code:", error);
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat redeem kode promo",
        amount_credited: 0,
        new_balance: 0,
        transaction_id: null,
        promo_code_id: null,
      };
    }

    if (data && data.length > 0) {
      return data[0] as RedeemResult;
    }

    return {
      success: false,
      message: "Tidak ada respons dari server",
      amount_credited: 0,
      new_balance: 0,
      transaction_id: null,
      promo_code_id: null,
    };
  } catch (error) {
    console.error("Unexpected error redeeming promo code:", error);
    return {
      success: false,
      message: "Terjadi kesalahan tak terduga",
      amount_credited: 0,
      new_balance: 0,
      transaction_id: null,
      promo_code_id: null,
    };
  }
}

/**
 * Create a new promo code (admin only)
 */
export async function createPromoCode(
  code: string,
  description: string | null,
  topupAmount: number,
  maxUsage: number | null = null,
  perUserLimit: number = 1,
  expiresAt: Date | null = null
): Promise<CreatePromoCodeResult> {
  try {
    const { data, error } = await supabase.rpc("create_promo_code", {
      p_code: code,
      p_description: description,
      p_topup_amount: topupAmount,
      p_max_usage: maxUsage,
      p_per_user_limit: perUserLimit,
      p_expires_at: expiresAt?.toISOString() || null,
      p_created_by: null, // Let the function use auth.uid()
    });

    if (error) {
      console.error("Error creating promo code:", error);
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat membuat kode promo",
        promo_code_id: null,
      };
    }

    if (data && data.length > 0) {
      return data[0] as CreatePromoCodeResult;
    }

    return {
      success: false,
      message: "Tidak ada respons dari server",
      promo_code_id: null,
    };
  } catch (error) {
    console.error("Unexpected error creating promo code:", error);
    return {
      success: false,
      message: "Terjadi kesalahan tak terduga",
      promo_code_id: null,
    };
  }
}

/**
 * Get promo code statistics (admin only)
 */
export async function getPromoCodeStats(): Promise<PromoCodeStats[]> {
  try {
    const { data, error } = await supabase.rpc("get_promo_code_stats");

    if (error) {
      console.error("Error fetching promo code stats:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching promo code stats:", error);
    return [];
  }
}

/**
 * Get all promo codes (admin only)
 */
export async function getAllPromoCodes(): Promise<PromoCode[]> {
  try {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching promo codes:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching promo codes:", error);
    return [];
  }
}

/**
 * Get user's promo code usage history
 */
export async function getUserPromoUsage(): Promise<PromoCodeUsage[]> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("promo_code_usage")
      .select(
        `
        *,
        promo_codes (
          code,
          description
        )
      `
      )
      .eq("user_id", user.id)
      .order("used_at", { ascending: false });

    if (error) {
      console.error("Error fetching user promo usage:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching user promo usage:", error);
    return [];
  }
}

/**
 * Update promo code status (admin only)
 */
export async function updatePromoCodeStatus(
  promoCodeId: string,
  isActive: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from("promo_codes")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", promoCodeId);

    if (error) {
      console.error("Error updating promo code status:", error);
      return {
        success: false,
        message:
          error.message || "Terjadi kesalahan saat update status kode promo",
      };
    }

    return {
      success: true,
      message: `Kode promo berhasil ${
        isActive ? "diaktifkan" : "dinonaktifkan"
      }`,
    };
  } catch (error) {
    console.error("Unexpected error updating promo code status:", error);
    return {
      success: false,
      message: "Terjadi kesalahan tak terduga",
    };
  }
}

/**
 * Delete promo code (admin only)
 */
export async function deletePromoCode(
  promoCodeId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from("promo_codes")
      .delete()
      .eq("id", promoCodeId);

    if (error) {
      console.error("Error deleting promo code:", error);
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat menghapus kode promo",
      };
    }

    return {
      success: true,
      message: "Kode promo berhasil dihapus",
    };
  } catch (error) {
    console.error("Unexpected error deleting promo code:", error);
    return {
      success: false,
      message: "Terjadi kesalahan tak terduga",
    };
  }
}

/**
 * Generate random promo code
 */
export function generatePromoCode(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate promo code format
 */
export function validatePromoCode(code: string): {
  isValid: boolean;
  message: string;
} {
  if (!code || code.trim() === "") {
    return { isValid: false, message: "Kode promo tidak boleh kosong" };
  }

  const trimmedCode = code.trim().toUpperCase();

  if (trimmedCode.length < 3) {
    return { isValid: false, message: "Kode promo minimal 3 karakter" };
  }

  if (trimmedCode.length > 50) {
    return { isValid: false, message: "Kode promo maksimal 50 karakter" };
  }

  if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
    return {
      isValid: false,
      message: "Kode promo hanya boleh mengandung huruf dan angka",
    };
  }

  return { isValid: true, message: "" };
}
