import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/supabase/server-auth";
import { isDeveloperUser } from "@/lib/developer-auth";

function isUnsafeHost(hostname: string) {
  const host = hostname.toLowerCase();
  return host === "localhost" || host === "::1" || host.endsWith(".local") || /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^169\.254\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
}

function meta(html: string, key: string) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, "i"),
  ];
  return patterns.map((pattern) => html.match(pattern)?.[1]).find(Boolean) ?? null;
}

function decode(value: string | null) {
  return value?.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">") ?? null;
}

function inputUrl(value: unknown) {
  const text = String(value ?? "").trim();
  const iframeSrc = text.match(/<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
  return iframeSrc ?? text;
}

function redirectProductData(url: URL) {
  const title = url.searchParams.get("title") ?? url.searchParams.get("productDescription");
  const image = url.searchParams.get("image") ?? url.searchParams.get("productImage");
  const purchaseUrl = url.searchParams.get("link") ?? url.searchParams.get("linkUrl");
  return { title, image, purchaseUrl };
}

function jsonLdProduct(html: string): { title: string | null; description: string | null; image: string | null; price: string | null; currency: string | null } {
  const empty = { title: null, description: null, image: null, price: null, currency: null };
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(match[1]);
      const nodes = Array.isArray(data) ? data : data?.['@graph'] ?? [data];
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const type = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
        if (!type.some((value: unknown) => String(value).toLowerCase() === "product")) continue;
        const offer = Array.isArray(node?.offers) ? node.offers[0] : node?.offers;
        const price = offer?.price ?? offer?.lowPrice ?? node?.price;
        const image = Array.isArray(node.image) ? node.image[0] : typeof node.image === "object" ? node.image?.url : node.image;
        return { title: node.name ? String(node.name) : null, description: node.description ? String(node.description) : null, image: image ? String(image) : null, price: price != null ? String(price) : null, currency: offer?.priceCurrency ? String(offer.priceCurrency) : null };
      }
    } catch { /* malformed third-party metadata */ }
  }
  return empty;
}

function embeddedJsonValue(html: string, keys: string[]): string | null {
  for (const key of keys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = html.match(new RegExp(`["']${escaped}["']\\s*:\\s*(?:["']([^"']+)["']|([0-9][0-9,.]*))`, "i"));
    const value = match?.[1] ?? match?.[2];
    if (value) {
      try { return JSON.parse(`"${value.replace(/"/g, '\\"')}"`); } catch { return value; }
    }
  }
  return null;
}

function quantityFromText(value: string | null) {
  if (!value) return null;
  const multiplied = value.match(/(\d{1,4})\s*(?:개입|개|매|팩|봉|병|캔|포|정|롤)\s*(?:x|×|\*)\s*(\d{1,3})/i);
  if (multiplied) {
    const quantity = Number(multiplied[1]) * Number(multiplied[2]);
    if (Number.isFinite(quantity) && quantity > 1) return quantity;
  }
  const matches = [...value.matchAll(/(?:총\s*)?(\d{1,4})\s*(?:개입|개|매|팩|봉|병|캔|포|정|롤)(?:\s|$|[,)])/g)];
  const quantity = Math.max(0, ...matches.map((match) => Number(match[1])));
  return Number.isFinite(quantity) && quantity > 1 ? quantity : null;
}

export async function POST(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  if (!isDeveloperUser(auth.user)) return NextResponse.json({ error: "개발자 계정만 접근할 수 있습니다." }, { status: 403 });
  const body = await request.json();
  const iframeInput = /<iframe\b/i.test(String(body.url ?? ""));
  let target: URL;
  try { target = new URL(inputUrl(body.url)); } catch { return NextResponse.json({ error: "올바른 상품 링크 또는 쿠팡 iframe 태그를 입력해 주세요." }, { status: 400 }); }
  if (!['http:', 'https:'].includes(target.protocol) || isUnsafeHost(target.hostname)) return NextResponse.json({ error: "외부 웹 상품 링크만 사용할 수 있습니다." }, { status: 400 });
  try {
    const headers = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36", "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8", "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.7", "Cache-Control": "no-cache", "Referer": "https://stickerup.vercel.app/" };
    let currentUrl = target;
    let response: Response | null = null;
    let redirectData = redirectProductData(currentUrl);
    for (let step = 0; step < 6; step += 1) {
      response = await fetch(currentUrl, { redirect: "manual", signal: AbortSignal.timeout(12000), headers });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get("location");
      if (!location) break;
      const nextUrl = new URL(location, currentUrl);
      if (isUnsafeHost(nextUrl.hostname)) throw new Error("허용되지 않는 주소입니다.");
      const nextData = redirectProductData(nextUrl);
      redirectData = {
        title: redirectData.title ?? nextData.title,
        image: nextData.image ?? redirectData.image,
        purchaseUrl: redirectData.purchaseUrl ?? nextData.purchaseUrl,
      };
      currentUrl = nextUrl;
    }
    if (!response) throw new Error("상품 페이지를 열 수 없습니다.");
    if (!response.ok) {
      const isCoupang = /(^|\.)coupang\.com$|(^|\.)coupa\.ng$/i.test(target.hostname);
      throw new Error(isCoupang ? iframeInput ? "쿠팡이 이 iframe의 상품정보 자동 조회를 차단했습니다. 상품 정보를 직접 확인해 주세요." : "쿠팡 일반 상품 링크는 외부 조회가 차단될 수 있습니다. 쿠팡 파트너스 iframe 태그를 붙여넣어 주세요." : "상품 페이지를 열 수 없습니다.");
    }
    const finalUrl = currentUrl;
    if (isUnsafeHost(finalUrl.hostname)) throw new Error("허용되지 않는 주소입니다.");
    const html = (await response.text()).slice(0, 2_000_000);
    const structured = jsonLdProduct(html);
    const isTemu = finalUrl.hostname.toLowerCase().includes("temu.com") || target.hostname.toLowerCase().includes("temu.com");
    const embeddedTitle = isTemu ? null : embeddedJsonValue(html, ["productName", "itemName"]);
    const rawTitle = decode(redirectData.title ?? meta(html, "og:title") ?? structured.title ?? embeddedTitle ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? null);
    const title = rawTitle && !/(access denied|captcha|robot check|페이지를 찾을 수 없습니다|^temu\s*[|:-]|shop like a billionaire)/i.test(rawTitle) ? rawTitle.trim() : null;
    const description = decode(meta(html, "og:description") ?? structured.description ?? meta(html, "description"));
    const embeddedPrice = isTemu ? null : embeddedJsonValue(html, ["finalPrice", "salePrice", "discountPrice", "priceValue", "price"]);
    const priceAmount = decode(meta(html, "product:price:amount") ?? meta(html, "og:price:amount") ?? structured.price ?? embeddedPrice ?? null);
    const priceCurrency = decode(meta(html, "product:price:currency") ?? meta(html, "og:price:currency") ?? structured.currency);
    const embeddedImage = isTemu ? null : embeddedJsonValue(html, ["imageUrl", "productImage", "thumbnailUrl"]);
    const rawImage = decode(redirectData.image ?? meta(html, "og:image") ?? meta(html, "twitter:image") ?? structured.image ?? embeddedImage);
    const imageUrl = rawImage ? new URL(rawImage, finalUrl).toString() : null;
    const numericPrice = priceAmount ? Number(priceAmount.replace(/[^0-9.]/g, "")) : NaN;
    const basePriceLabel = Number.isFinite(numericPrice) ? `${numericPrice.toLocaleString("ko-KR")}${priceCurrency === "KRW" || !priceCurrency ? "원" : ` ${priceCurrency}`}` : priceAmount;
    const quantity = quantityFromText(`${title ?? ""} ${description ?? ""}`);
    const unitPriceLabel = Number.isFinite(numericPrice) && quantity ? `개당 ${Math.round(numericPrice / quantity).toLocaleString("ko-KR")}원` : null;
    const priceLabel = basePriceLabel ? `${basePriceLabel}${unitPriceLabel ? ` (${unitPriceLabel})` : ""}` : null;
    const found = [title && "상품명", priceLabel && "가격", imageUrl && "이미지", description && "설명"].filter(Boolean);
    if (!found.length) return NextResponse.json({ error: "이 쇼핑몰이 상품 정보를 외부에 제공하지 않아 자동입력할 수 없습니다. 상품명과 가격을 직접 입력해 주세요." }, { status: 422 });
    const normalizedPurchaseUrl = redirectData.purchaseUrl && /^https?:\/\//i.test(redirectData.purchaseUrl) ? redirectData.purchaseUrl : target.toString();
    const notice = redirectData.title && !priceLabel ? "쿠팡 제휴 iframe은 상품명과 이미지는 제공하지만 가격은 제공하지 않아 가격을 직접 입력해야 합니다." : null;
    return NextResponse.json({ title, description, imageUrl, priceLabel, unitPriceLabel, quantity, found, purchaseUrl: normalizedPurchaseUrl, notice });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "상품 정보를 불러오지 못했습니다. 이미지를 직접 등록해 주세요." }, { status: 400 });
  }
}
