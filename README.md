# Nawa Rewards MVP

An original Expo React Native loyalty app inspired by common premium rewards patterns. The attached reference screenshots informed broad layout and navigation only; this project uses a new name, visual identity, palette, components, and placeholder content.

## Included

- Email/password authentication with Supabase Auth
- Secure native session persistence with Expo Secure Store
- Home dashboard, rewards card, tier, points, AED equivalent, and member number
- Static earn QR containing the authenticated member's `member_code`
- One-time redemption QR creation with a live five-minute expiry
- Transaction history, partner search, rewards rates, menu, and profile
- Camera-based merchant scanner workspace
- Fail-closed production configuration, with an explicit opt-in local demo mode
- PostgreSQL schema, RLS policies, signup trigger, seed merchants, and atomic RPCs
- Idempotency keys, audit logs, row locking, role checks, and non-negative wallet constraints

## Run locally

Prerequisites: Node.js 20+ and npm.

```bash
npm install
printf 'EXPO_PUBLIC_SUPABASE_URL=your-project-url\nEXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key\nEXPO_PUBLIC_ENABLE_DEMO_MODE=false\n' > .env
npm start
```

The app blocks authentication when Supabase is not configured. For UI-only local preview, explicitly set `EXPO_PUBLIC_ENABLE_DEMO_MODE=true`; never set that variable in preview or production EAS environments.

For native camera and Secure Store behavior, use an Android device/emulator or Expo development build. Web uses browser storage because Secure Store is native-only.

## Supabase setup

1. Create a Supabase project.
2. Apply the project schema, RLS policies, signup trigger, and RPC functions.
3. Add the project URL and publishable key to `.env`:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
EXPO_PUBLIC_ENABLE_DEMO_MODE=false
```

4. Restart Expo after changing environment variables.

For merchant users, add an assignment from the Supabase dashboard or a protected Admin API/server process:

1. Create the user through Supabase Auth.
2. Insert the user's profile ID and merchant ID into `public.merchant_staff`.

The scanner reads only assignments visible through the user's RLS policy. Every earn and redemption RPC verifies the assignment again in PostgreSQL.

## Security flow

### Earn

The QR payload is the authenticated member's static `profiles.member_code`. Merchant staff scan that code and enter the verified purchase amount. The app calls `earn_points` with `p_member_code`, `p_merchant_id`, `p_amount_aed`, and a cryptographic `p_idempotency_key`.

PostgreSQL verifies that the authenticated user belongs to the supplied merchant, calculates points from the stored merchant rate, updates the wallet, records the transaction, and writes an audit log. The client never calculates or submits a point award.

### Redeem

The member requests a point amount through `create_redemption_token` using `{ p_points }`. PostgreSQL checks the authenticated wallet and stores only the SHA-256 hash of a random token. The raw token is returned once and expires after five minutes. `redeem_token` receives `p_raw_token`, `p_merchant_id`, and `p_idempotency_key`; it validates staff permissions, expiry, single use, balance, and idempotency while holding row locks, then atomically deducts points, consumes the token, records the transaction, and audits the action.

Clients never update wallets or insert transactions directly. Profile and wallet reads are explicitly filtered to the authenticated user, while transaction and merchant-assignment access remains constrained by RLS.

Wallet data is held in memory only for display. It is not cached to AsyncStorage/Secure Store and is never optimistically modified by the mobile app.

## Android builds

The Android application ID is `com.nawarewards.app`. Change it before the first store release if your organization requires a different permanent ID.

Configure EAS and public environment variables, then run:

```bash
npx eas-cli login
npx eas-cli build:configure
npm run build:android:preview
npm run build:android:production
```

The preview profile creates an APK. Production creates an auto-incremented Android App Bundle. Camera audio recording is disabled and only the camera permission is requested.

## Vercel web deployment

The web app uses Expo Router static output. Vercel runs `npm run build:web` and publishes `dist`.

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Import the repository into Vercel.
3. Add these variables to the Vercel project for Production and Preview:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
EXPO_PUBLIC_ENABLE_DEMO_MODE=false
```

4. Deploy. No SPA rewrite is required because Expo generates a static HTML file for every route.

In Supabase Authentication > URL Configuration, set:

```text
Site URL
https://emarat-app-clone.vercel.app

Redirect URLs
https://emarat-app-clone.vercel.app/auth/callback
http://localhost:*/auth/callback
nawarewards://auth/callback
```

Add intentionally shared Vercel preview callback URLs separately when preview
authentication is required. Do not use a broad production wildcard.

## Project map

```text
app/                    Expo Router screens
components/             Reusable UI components
constants/              Theme and demo fixtures
lib/                    Supabase client and secure storage
providers/              Auth state
services/               Typed Supabase/RPC calls
types/                  Database models
supabase/               Live backend contract and deployment notes
```

## Remaining production work

- Add API gateway/Edge Function IP and device-level rate limits in addition to the database actor limits.
- Add CAPTCHA, staff invitations, abuse monitoring, and tested account-recovery deep links.
- Add observability and automated database/RPC integration tests against a staging project.
- Review AED conversion rules, refund/reversal workflows, retention, privacy, and financial/legal requirements with stakeholders.

## Verification

```bash
npm run typecheck
npm run check
npm run web
```
