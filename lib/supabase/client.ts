import { createClient } from "@supabase/supabase-js";
import { getSupabaseBrowserConfigError, getSupabaseProjectUrl } from "./config";

const rememberLoginKey = "stickerup:remember-login";
let browserClient: ReturnType<typeof createSupabaseBrowserClient> | null = null;

function isSupabaseAuthStorageKey(key: string): boolean {
  return key.startsWith("sb-") && key.includes("-auth-token");
}

export function getRememberLoginPreference(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(rememberLoginKey) !== "false";
}

export function setRememberLoginPreference(rememberLogin: boolean) {
  if (typeof window === "undefined") return;
  const previousPreference = getRememberLoginPreference();
  if (previousPreference !== rememberLogin) {
    const source = previousPreference ? window.localStorage : window.sessionStorage;
    const destination = rememberLogin ? window.localStorage : window.sessionStorage;
    const authKeys = Array.from({ length: source.length }, (_, index) => source.key(index))
      .filter((key): key is string => Boolean(key && isSupabaseAuthStorageKey(key)));

    for (const key of authKeys) {
      const value = source.getItem(key);
      if (value !== null) destination.setItem(key, value);
      source.removeItem(key);
    }
  }
  window.localStorage.setItem(rememberLoginKey, String(rememberLogin));
}

function getAuthStorage() {
  if (typeof window === "undefined") return undefined;
  const preferredStorage = () => getRememberLoginPreference() ? window.localStorage : window.sessionStorage;
  const fallbackStorage = () => getRememberLoginPreference() ? window.sessionStorage : window.localStorage;

  return {
    getItem(key: string) {
      const preferred = preferredStorage();
      const value = preferred.getItem(key);
      if (value !== null) return value;

      // 이전 버전에서 반대 저장소에 남은 인증 세션도 한 번은 복구한다.
      const fallbackValue = fallbackStorage().getItem(key);
      if (fallbackValue !== null && isSupabaseAuthStorageKey(key)) {
        preferred.setItem(key, fallbackValue);
        fallbackStorage().removeItem(key);
      }
      return fallbackValue;
    },
    setItem(key: string, value: string) {
      preferredStorage().setItem(key, value);
      if (isSupabaseAuthStorageKey(key)) fallbackStorage().removeItem(key);
    },
    removeItem(key: string) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    },
  };
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
      autoRefreshToken: true,
      storage: getAuthStorage(),
    },
  });
}

export function getSupabaseBrowserClient() {
  if (getSupabaseBrowserConfigError()) return null;
  if (!browserClient) browserClient = createSupabaseBrowserClient();
  return browserClient;
}
