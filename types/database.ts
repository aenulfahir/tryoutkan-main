export interface Balance {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: "topup" | "usage";
  amount: number;
  description: string | null;
  tryout_package_id: string | null;
  created_at: string;
  tryout_packages?: {
    id: string;
    title: string;
  } | null;
  promo_code_usage?: {
    promo_codes?: {
      id: string;
      code: string;
      description: string | null;
    } | null;
  } | null;
}

export interface Payment {
  id: string;
  user_id: string;
  invoice_url: string | null;
  status: "pending" | "paid" | "expired";
  external_id: string | null;
  amount: number;
  created_at: string;
  updated_at: string;
}
