import "server-only";
import { getSupabaseBrowserConfigError } from "./config";

export function getSupabaseServerConfigError(): string | null {
  const browserError = getSupabaseBrowserConfigError();
  if (browserError) return browserError;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return "SUPABASE_SERVICE_ROLE_KEY is not configured.";
  }

  return null;
}
