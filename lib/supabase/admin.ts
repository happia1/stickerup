import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerConfigError } from "./server-config";

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const configError = getSupabaseServerConfigError();

  if (configError || !supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(configError ?? "Supabase admin client is not configured.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
