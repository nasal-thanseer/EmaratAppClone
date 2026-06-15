# Supabase Contract

The live Supabase project owns the deployed schema and RLS policies. The mobile and web clients use only the public project URL and publishable key.

Required authenticated tables:

- `profiles`
- `wallets`
- `merchants`
- `merchant_staff`
- `transactions`
- `redemption_tokens`

Required authenticated RPCs:

- `create_redemption_token(p_points integer)`
- `earn_points(p_member_code text, p_merchant_id uuid, p_amount_aed numeric, p_idempotency_key text)`
- `redeem_token(p_raw_token text, p_merchant_id uuid, p_idempotency_key text)`

Wallet updates and transaction inserts must remain inside these database functions. The client must never receive a Supabase secret or `service_role` key.

Export the deployed schema into a new reviewed migration before using this repository to provision another environment. Do not infer production policies from client code.
