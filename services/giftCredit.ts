import { supabase } from "@/lib/supabase";

export interface GiftCreditResponse {
  success: boolean;
  message: string;
  transaction_id?: string;
  new_balance?: number;
  amount_gifted?: number;
  user_name?: string;
}

export async function giftCreditsToUser(
  userId: string,
  amount: number,
  description?: string
): Promise<GiftCreditResponse> {
  try {
    const { data, error } = await supabase.rpc("gift_credits_to_user", {
      p_user_id: userId,
      p_amount: amount,
      p_description: description || "Gift credits from admin",
    });

    if (error) {
      console.error("Error gifting credits:", error);
      return {
        success: false,
        message: error.message || "Failed to gift credits",
      };
    }

    return data as GiftCreditResponse;
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    };
  }
}
