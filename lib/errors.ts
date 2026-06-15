import { AuthError, PostgrestError } from "@supabase/supabase-js";

export type AppErrorCode = "auth" | "configuration" | "offline" | "timeout" | "validation" | "server" | "unknown";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: AppErrorCode,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toAppError(error: unknown, fallback = "Something went wrong. Please try again."): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof AuthError) return new AppError(authMessage(error.message), "auth", error);
  if (isPostgrestError(error)) return new AppError(rpcMessage(error.message), "server", error);
  if (error instanceof Error) {
    if (error.name === "AbortError" || /timeout/i.test(error.message)) {
      return new AppError("The request timed out. Check your connection and try again.", "timeout", error);
    }
    if (/network|fetch|offline|internet/i.test(error.message)) {
      return new AppError("You appear to be offline. Reconnect and try again.", "offline", error);
    }
  }
  return new AppError(fallback, "unknown", error);
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return Boolean(error && typeof error === "object" && "code" in error && "message" in error);
}

function authMessage(message: string) {
  if (/invalid login credentials/i.test(message)) return "Email or password is incorrect.";
  if (/email not confirmed/i.test(message)) return "Confirm your email before signing in.";
  if (/user already registered/i.test(message)) return "An account already exists for this email.";
  if (/email address.*invalid|invalid email/i.test(message)) return "Enter a valid, deliverable email address.";
  if (/database error saving new user/i.test(message)) return "Account setup is temporarily unavailable. Please try again shortly.";
  if (/password/i.test(message)) return "The password does not meet the security requirements.";
  return "Authentication could not be completed. Please try again.";
}

function rpcMessage(message: string) {
  const safeMessages = [
    "Authentication required",
    "Not authenticated",
    "Invalid points amount",
    "Minimum redemption is 100 points",
    "Insufficient points",
    "Wallet not found",
    "Merchant role required",
    "Merchant assignment required",
    "Not authorized as merchant staff",
    "Invalid purchase amount",
    "Invalid idempotency key",
    "Member not found",
    "Merchant unavailable",
    "Merchant not active",
    "Merchant cannot redeem",
    "Purchase does not earn a full point",
    "Calculated points must be greater than zero",
    "Redemption token not found",
    "Redemption token already used",
    "Redemption token expired",
    "Earn token not found",
    "Earn token already used",
    "Earn token expired"
  ];
  return safeMessages.find((safe) => message.includes(safe)) ?? "The secure server operation could not be completed.";
}
