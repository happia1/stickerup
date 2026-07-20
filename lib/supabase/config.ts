export function getSupabaseBrowserConfigError(): string | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return "NEXT_PUBLIC_SUPABASE_URL is not configured.";
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return "NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.";
  }

  return null;
}

export function isSupabaseBrowserConfigured(): boolean {
  return getSupabaseBrowserConfigError() === null;
}
