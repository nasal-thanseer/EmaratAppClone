import { DEMO_MEMBER, DEMO_MERCHANTS, DEMO_TRANSACTIONS } from "@/constants/mockData";
import { AppError, toAppError } from "@/lib/errors";
import { isDemoMode, requireSupabase } from "@/lib/supabase";
import NetInfo from "@react-native-community/netinfo";
import { randomUUID } from "expo-crypto";
import { MemberSnapshot, Merchant, MerchantContext, PointsRpcResult, RedemptionToken, RewardTransaction } from "@/types/database";

async function ensureOnline() {
  if (isDemoMode) return;
  const state = await NetInfo.fetch();
  if (state.isConnected === false || state.isInternetReachable === false) {
    throw new AppError("You appear to be offline. Reconnect and try again.", "offline");
  }
}

async function getAuthenticatedUserId() {
  const { data, error } = await requireSupabase().auth.getUser();
  if (error) throw toAppError(error);
  if (!data.user) throw new AppError("Authentication required", "auth");
  return data.user.id;
}

export async function getMemberSnapshot(): Promise<MemberSnapshot> {
  if (isDemoMode) return DEMO_MEMBER;
  await ensureOnline();
  const client = requireSupabase();
  const userId = await getAuthenticatedUserId();
  const [{ data: profile, error: profileError }, { data: wallet, error: walletError }] = await Promise.all([
    client.from("profiles").select("id, full_name, member_code, tier, created_at").eq("id", userId).single(),
    client.from("wallets").select("user_id, points_balance, lifetime_points, updated_at").eq("user_id", userId).single()
  ]);
  if (profileError || walletError) throw toAppError(profileError ?? walletError);
  return {
    profile: {
      ...profile,
      full_name: profile.full_name?.trim() || "Nawa Member"
    },
    wallet
  };
}

export async function getTransactions(limit = 50): Promise<RewardTransaction[]> {
  if (isDemoMode) return DEMO_TRANSACTIONS;
  await ensureOnline();
  const userId = await getAuthenticatedUserId();
  const { data, error } = await requireSupabase()
    .from("transactions")
    .select("id, user_id, merchant_id, type, points, amount_aed, status, description, idempotency_key, created_at, merchant:merchants(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 100));
  if (error) throw toAppError(error);
  return (data ?? []).map((item) => ({
    ...item,
    merchant: Array.isArray(item.merchant) ? item.merchant[0] ?? null : item.merchant
  })) as RewardTransaction[];
}

export async function getMerchants(): Promise<Merchant[]> {
  if (isDemoMode) return DEMO_MERCHANTS;
  await ensureOnline();
  const { data, error } = await requireSupabase()
    .from("merchants")
    .select("id, name, category, earn_rate, redeem_enabled, active, created_at")
    .eq("active", true)
    .order("name")
    .limit(100);
  if (error) throw toAppError(error);
  return data ?? [];
}

export async function createRedemptionToken(points: number): Promise<RedemptionToken> {
  if (isDemoMode) {
    return {
      token: `demo_${randomUUID()}`,
      token_id: randomUUID(),
      points,
      expires_at: new Date(Date.now() + 5 * 60_000).toISOString()
    };
  }
  await ensureOnline();
  const { data, error } = await requireSupabase().rpc("create_redemption_token", { p_points: points });
  if (error) throw toAppError(error);
  const result = data as RedemptionToken | null;
  if (!result?.token || !result?.token_id || !result?.expires_at || result.points !== points) {
    throw new AppError("The server returned an invalid redemption token.", "server");
  }
  return result;
}

export async function getMerchantContexts(): Promise<MerchantContext[]> {
  if (isDemoMode) return [{ merchant_id: DEMO_MERCHANTS[0].id, merchant_name: DEMO_MERCHANTS[0].name, role: "cashier" }];
  await ensureOnline();
  const { data, error } = await requireSupabase()
    .from("merchant_staff")
    .select("merchant_id, role, merchant:merchants!inner(id, name, active)")
    .eq("merchant.active", true);
  if (error) throw toAppError(error);
  const contexts = (data ?? []).flatMap((assignment) => {
    const merchant = Array.isArray(assignment.merchant) ? assignment.merchant[0] : assignment.merchant;
    if (!merchant?.id) return [];
    return [{
      merchant_id: assignment.merchant_id,
      merchant_name: merchant.name,
      role: assignment.role
    } as MerchantContext];
  });
  if (contexts.length === 0) throw new AppError("No active merchant assignment was found.", "auth");
  return contexts;
}

export async function earnPoints(memberCode: string, merchantId: string, amountAed: number): Promise<PointsRpcResult> {
  if (isDemoMode) return { status: "success", points: Math.floor(amountAed * DEMO_MERCHANTS[0].earn_rate) };
  await ensureOnline();
  const { data, error } = await requireSupabase().rpc("earn_points", {
    p_member_code: memberCode.trim().toUpperCase(),
    p_merchant_id: merchantId,
    p_amount_aed: amountAed,
    p_idempotency_key: randomUUID()
  });
  if (error) throw toAppError(error);
  return data as PointsRpcResult;
}

export async function redeemToken(rawToken: string, merchantId: string): Promise<PointsRpcResult> {
  if (isDemoMode) return { status: "success" };
  await ensureOnline();
  const { data, error } = await requireSupabase().rpc("redeem_token", {
    p_raw_token: rawToken,
    p_merchant_id: merchantId,
    p_idempotency_key: randomUUID()
  });
  if (error) throw toAppError(error);
  return data as PointsRpcResult;
}
