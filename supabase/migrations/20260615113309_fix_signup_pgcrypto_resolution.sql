-- Supabase installs pgcrypto in the extensions schema. Privileged functions
-- use an empty search path and explicitly resolve extension functions.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  generated_code text;
begin
  generated_code := upper(encode(extensions.gen_random_bytes(5), 'hex'));

  insert into public.profiles (id, full_name, member_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    generated_code
  )
  on conflict (id) do nothing;

  insert into public.wallets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.create_redemption_token(p_points integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_balance integer;
  v_raw_token text;
  v_token_hash text;
  v_expires_at timestamptz;
  v_token_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_points is null or p_points <= 0 then
    raise exception 'Invalid points amount';
  end if;

  select points_balance
  into v_balance
  from public.wallets
  where user_id = auth.uid()
  for update;

  if v_balance is null then
    raise exception 'Wallet not found';
  end if;

  if v_balance < p_points then
    raise exception 'Insufficient points';
  end if;

  v_raw_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_token_hash := encode(extensions.digest(v_raw_token, 'sha256'), 'hex');
  v_expires_at := now() + interval '5 minutes';

  insert into public.redemption_tokens (
    user_id,
    token_hash,
    points,
    expires_at
  )
  values (
    auth.uid(),
    v_token_hash,
    p_points,
    v_expires_at
  )
  returning id into v_token_id;

  insert into public.audit_logs (
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    auth.uid(),
    'create_redemption_token',
    'redemption_token',
    v_token_id::text,
    jsonb_build_object('points', p_points, 'expires_at', v_expires_at)
  );

  return jsonb_build_object(
    'token', v_raw_token,
    'token_id', v_token_id,
    'points', p_points,
    'expires_at', v_expires_at
  );
end;
$$;

create or replace function public.redeem_token(
  p_raw_token text,
  p_merchant_id uuid,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hash text;
  v_token record;
  v_balance integer;
  v_transaction_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_merchant_staff(p_merchant_id) then
    raise exception 'Not authorized as merchant staff';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) < 10 then
    raise exception 'Invalid idempotency key';
  end if;

  if exists (
    select 1
    from public.transactions
    where idempotency_key = p_idempotency_key
  ) then
    return jsonb_build_object('status', 'already_processed');
  end if;

  v_hash := encode(extensions.digest(p_raw_token, 'sha256'), 'hex');

  select *
  into v_token
  from public.redemption_tokens
  where token_hash = v_hash
  for update;

  if v_token.id is null then
    return jsonb_build_object('status', 'invalid_token');
  end if;

  if v_token.used_at is not null then
    return jsonb_build_object('status', 'already_used');
  end if;

  if v_token.expires_at < now() then
    return jsonb_build_object('status', 'expired');
  end if;

  if not exists (
    select 1
    from public.merchants
    where id = p_merchant_id
      and active = true
      and redeem_enabled = true
  ) then
    raise exception 'Merchant cannot redeem';
  end if;

  select points_balance
  into v_balance
  from public.wallets
  where user_id = v_token.user_id
  for update;

  if v_balance < v_token.points then
    return jsonb_build_object('status', 'insufficient_points');
  end if;

  update public.wallets
  set
    points_balance = points_balance - v_token.points,
    updated_at = now()
  where user_id = v_token.user_id;

  update public.redemption_tokens
  set
    used_at = now(),
    used_by_merchant_id = p_merchant_id
  where id = v_token.id;

  insert into public.transactions (
    user_id,
    merchant_id,
    type,
    points,
    status,
    description,
    idempotency_key
  )
  values (
    v_token.user_id,
    p_merchant_id,
    'redeem',
    v_token.points,
    'completed',
    'Points redeemed through QR token',
    p_idempotency_key
  )
  returning id into v_transaction_id;

  insert into public.audit_logs (
    actor_id,
    action,
    target_type,
    target_id,
    metadata
  )
  values (
    auth.uid(),
    'redeem_token',
    'transaction',
    v_transaction_id::text,
    jsonb_build_object(
      'redemption_token_id', v_token.id,
      'merchant_id', p_merchant_id,
      'points', v_token.points
    )
  );

  return jsonb_build_object(
    'status', 'success',
    'transaction_id', v_transaction_id,
    'points', v_token.points
  );
end;
$$;
