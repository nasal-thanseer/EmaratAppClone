-- Restrict privileged functions to the roles that actually need them.
revoke execute on function public.create_redemption_token(integer) from public, anon;
revoke execute on function public.earn_points(text, uuid, numeric, text) from public, anon;
revoke execute on function public.redeem_token(text, uuid, text) from public, anon;
revoke execute on function public.is_merchant_staff(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

grant execute on function public.create_redemption_token(integer) to authenticated;
grant execute on function public.earn_points(text, uuid, numeric, text) to authenticated;
grant execute on function public.redeem_token(text, uuid, text) to authenticated;

-- Avoid repeated auth.uid() evaluation for every candidate row.
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists "Users can update own profile name" on public.profiles;
create policy "Users can update own profile name"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Users can view own wallet" on public.wallets;
create policy "Users can view own wallet"
on public.wallets
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Merchant staff can view own merchant assignment" on public.merchant_staff;
create policy "Merchant staff can view own merchant assignment"
on public.merchant_staff
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Users and merchant staff can view relevant transactions" on public.transactions;
create policy "Users and merchant staff can view relevant transactions"
on public.transactions
for select
to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.merchant_staff ms
    where ms.user_id = (select auth.uid())
      and ms.merchant_id = transactions.merchant_id
  )
);

drop policy if exists "Users can view own redemption tokens" on public.redemption_tokens;
create policy "Users can view own redemption tokens"
on public.redemption_tokens
for select
to authenticated
using (user_id = (select auth.uid()));

-- Index foreign keys used by RLS checks and common list queries.
create index if not exists merchant_staff_merchant_id_idx
  on public.merchant_staff (merchant_id);

create index if not exists redemption_tokens_user_id_idx
  on public.redemption_tokens (user_id);

create index if not exists redemption_tokens_used_by_merchant_id_idx
  on public.redemption_tokens (used_by_merchant_id);

create index if not exists transactions_merchant_id_idx
  on public.transactions (merchant_id);

create index if not exists transactions_user_id_created_at_idx
  on public.transactions (user_id, created_at desc);
