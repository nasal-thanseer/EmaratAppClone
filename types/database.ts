export type TransactionType = "earn" | "redeem" | "bonus" | "adjustment";

export interface Profile {
  id: string;
  full_name: string;
  member_code: string;
  tier: string;
  created_at: string;
}

export interface Wallet {
  user_id: string;
  points_balance: number;
  lifetime_points: number;
  updated_at: string;
}

export interface Merchant {
  id: string;
  name: string;
  category: string | null;
  earn_rate: number;
  redeem_enabled: boolean;
  active: boolean;
  created_at: string;
}

export interface RewardTransaction {
  id: string;
  user_id: string;
  merchant_id: string | null;
  type: TransactionType;
  points: number;
  amount_aed: number | null;
  status: string;
  description: string | null;
  idempotency_key: string | null;
  created_at: string;
  merchant?: Pick<Merchant, "name"> | null;
}

export interface RedemptionToken {
  token: string;
  token_id: string;
  points: number;
  expires_at: string;
}

export interface MerchantContext {
  merchant_id: string;
  merchant_name: string;
  role: "owner" | "manager" | "cashier" | "admin";
}

export interface PointsRpcResult {
  status: "success" | "already_processed" | "invalid_token" | "already_used" | "expired" | "insufficient_points";
  transaction_id?: string;
  points?: number;
}

export interface MemberSnapshot {
  profile: Profile;
  wallet: Wallet;
}
