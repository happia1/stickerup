export const ALL_AFFILIATES = "전체";

export function productAffiliateLabel(url?: string | null): string {
  if (!url) return "직접 등록";

  const normalized = url.toLowerCase();
  if (normalized.includes("temu")) return "TEMU";

  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("coupang.com") || host.includes("coupa.ng")) return "쿠팡";
    if (host.includes("temu.com")) return "TEMU";
  } catch {
    return "기타 제휴";
  }

  return "기타 제휴";
}

export function productAffiliateOptions(products: Array<{ purchase_url?: string | null }>): string[] {
  const available = new Set(products.map((product) => productAffiliateLabel(product.purchase_url)));
  const preferredOrder = ["쿠팡", "TEMU", "기타 제휴", "직접 등록"];
  return [ALL_AFFILIATES, ...preferredOrder.filter((label) => available.has(label))];
}
