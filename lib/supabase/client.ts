import { createClient } from "@supabase/supabase-js";
import { getSupabaseBrowserConfigError, getSupabaseProjectUrl } from "./config";

const rememberLoginKey = "stickerup:remember-login";
let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null;

export function getRememberLoginPreference(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(rememberLoginKey) !== "false";
}

export function setRememberLoginPreference(rememberLogin: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(rememberLoginKey, String(rememberLogin));
}

function getAuthStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return getRememberLoginPreference() ? window.localStorage : window.sessionStorage;
}

export function createSupabaseBrowserClient() {
  const supabaseUrl = getSupabaseProjectUrl();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const configError = getSupabaseBrowserConfigError();

  if (configError || !supabaseUrl || !supabaseAnonKey) {
    throw new Error(configError ?? "Supabase browser client is not configured.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storage: getAuthStorage(),
    },
  });
}

export function getSupabaseBrowserClient() {
  if (getSupabaseBrowserConfigError()) return null;
  if (!browserClient) browserClient = createSupabaseBrowserClient();
  return browserClient;
}
