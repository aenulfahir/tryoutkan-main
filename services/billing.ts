import { supabase } from "@/lib/supabase";
import { Balance, Transaction, Payment } from "@/types/database";

export async function getUserBalance(): Promise<Balance | null> {
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("No user found for balance");
    return null;
  }

  const { data, error } = await supabase
    .from("balances")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching balance:", error);
    return null;
  }

  return data;
}

// REMOVED: Auto-update expired pending payments
// Payment status should be updated by payment gateway webhook, not by frontend
// Frontend should only READ the status from database

export async function getUserTransactions(): Promise<Transaction[]> {
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("No user found for transactions");
    return [];
  }

  console.log("🔍 Fetching transactions for user:", user.id);

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      tryout_packages (
        id,
        title
      ),
      promo_code_usage!left(
        promo_codes(
          id,
          code,
          description
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching transactions:", error);
    return [];
  }

  console.log("✅ Transactions fetched:", data?.length || 0, "records");
  console.log("📊 Transaction data:", data);

  return data || [];
}

export async function getUserPayments(): Promise<Payment[]> {
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("No user found for payments");
    return [];
  }

  console.log("💳 Fetching payments for user:", user.id);

  // Fetch all payments - status should reflect what's in database
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching payments:", error);
    return [];
  }

  console.log("✅ Payments fetched:", data?.length || 0, "records");
  console.log("📊 Payment data:", data);

  return data || [];
}

export async function createPurchaseNotification(
  userId: string,
  packageId: string,
  purchasePrice: number
): Promise<boolean> {
  try {
    // Get user details
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return false;
    }

    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from("tryout_packages")
      .select("title")
      .eq("id", packageId)
      .single();

    if (packageError) {
      console.error("Error fetching package data:", packageError);
      return false;
    }

    // Create notification
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        type: "purchase",
        title: "Pembelian Paket Tryout Baru",
        message: `${userData.name} telah membeli paket "${packageData.title}"`,
        data: {
          user_id: userId,
          user_name: userData.name,
          package_id: packageId,
          package_title: packageData.title,
          purchase_price: purchasePrice,
          purchased_at: new Date().toISOString(),
        },
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error creating purchase notification:", error);
    return false;
  }
}
