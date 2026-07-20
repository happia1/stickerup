import { createClient } from "@supabase/supabase-js";
import { getSupabaseBrowserConfigError } from "./config";

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configError = getSupabaseBrowserConfigError();

  if (configError || !supabaseUrl || !supabaseAnonKey) {
    throw new Error(configError ?? "Supabase browser client is not configured.");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function getSupabaseBrowserClient() {
  if (getSupabaseBrowserConfigError()) return null;
  return createSupabaseBrowserClient();
}
