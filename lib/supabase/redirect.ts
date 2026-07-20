function normalizeOrigin(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getBrowserAppOrigin(): string | null {
  if (typeof window !== "undefined") {
    const browserOrigin = normalizeOrigin(window.location.origin);
    if (browserOrigin) return browserOrigin;
  }

  return normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL)
    ?? normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
}

export function getEmailRedirectUrl(path = "/login"): string | null {
  const origin = getBrowserAppOrigin();
  if (!origin) return null;

  return new URL(path, origin).toString();
}
