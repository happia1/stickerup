export function getSupabaseProjectUrl(): string | null {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getSupabaseBrowserConfigError(): string | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return "NEXT_PUBLIC_SUPABASE_URL is not configured.";
  }

  if (!getSupabaseProjectUrl()) {
    return "NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase project URL.";
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.";
  }

  return null;
}

export function isSupabaseBrowserConfigured(): boolean {
  return getSupabaseBrowserConfigError() === null;
}
