import { MemberSnapshot, Merchant, RewardTransaction } from "@/types/database";

export const DEMO_MEMBER: MemberSnapshot = {
  profile: {
    id: "demo-user",
    full_name: "Maya Al Noor",
    member_code: "NW-4827-5914",
    tier: "Dune",
    created_at: "2026-01-12T08:00:00Z"
  },
  wallet: {
    user_id: "demo-user",
    points_balance: 2840,
    lifetime_points: 7200,
    updated_at: "2026-06-13T09:00:00Z"
  }
};

export const DEMO_MERCHANTS: Merchant[] = [
  { id: "1", name: "Drift Coffee", category: "Cafe", earn_rate: 2, redeem_enabled: true, active: true, created_at: "" },
  { id: "2", name: "Palm Pantry", category: "Groceries", earn_rate: 1.5, redeem_enabled: true, active: true, created_at: "" },
  { id: "3", name: "Orbit Auto Care", category: "Automotive", earn_rate: 3, redeem_enabled: true, active: true, created_at: "" },
  { id: "4", name: "Saffron Table", category: "Dining", earn_rate: 2, redeem_enabled: false, active: true, created_at: "" },
  { id: "5", name: "Tide Fitness", category: "Wellness", earn_rate: 1, redeem_enabled: true, active: true, created_at: "" }
];

export const DEMO_TRANSACTIONS: RewardTransaction[] = [
  { id: "t1", user_id: "demo-user", merchant_id: "1", type: "earn", points: 90, amount_aed: 45, status: "completed", description: "Morning coffee", idempotency_key: null, created_at: "2026-06-12T07:41:00Z", merchant: { name: "Drift Coffee" } },
  { id: "t2", user_id: "demo-user", merchant_id: null, type: "bonus", points: 250, amount_aed: null, status: "completed", description: "Welcome bonus", idempotency_key: null, created_at: "2026-06-10T12:15:00Z", merchant: null },
  { id: "t3", user_id: "demo-user", merchant_id: "3", type: "redeem", points: 600, amount_aed: 6, status: "completed", description: "Car wash reward", idempotency_key: null, created_at: "2026-06-06T16:20:00Z", merchant: { name: "Orbit Auto Care" } },
  { id: "t4", user_id: "demo-user", merchant_id: "2", type: "earn", points: 180, amount_aed: 120, status: "completed", description: "Weekly shop", idempotency_key: null, created_at: "2026-06-02T18:03:00Z", merchant: { name: "Palm Pantry" } }
];
