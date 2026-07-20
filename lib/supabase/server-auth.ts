import "server-only";
import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "./admin";
import { getSupabaseServerConfigError } from "./server-config";

export type RequestUserResult =
  | { user: User; error: null }
  | { user: null; error: string };

export async function getRequestUser(request: Request): Promise<RequestUserResult> {
  const configError = getSupabaseServerConfigError();
  if (configError) return { user: null, error: configError };

  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!accessToken) {
    return { user: null, error: "Sign in is required." };
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    return { user: null, error: "Your session is no longer valid. Please sign in again." };
  }

  return { user: data.user, error: null };
}
