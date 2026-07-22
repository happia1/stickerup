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
  let target: URL;
  try { target = new URL(body.url); } catch { return NextResponse.json({ error: "올바른 상품 링크를 입력해 주세요." }, { status: 400 }); }
  if (!['http:', 'https:'].includes(target.protocol) || isUnsafeHost(target.hostname)) return NextResponse.json({ error: "외부 웹 상품 링크만 사용할 수 있습니다." }, { status: 400 });
  try {
    const response = await fetch(target, { redirect: "follow", signal: AbortSignal.timeout(12000), headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36", "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8", "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.7", "Cache-Control": "no-cache" } });
    if (!response.ok) throw new Error("상품 페이지를 열 수 없습니다.");
    const finalUrl = new URL(response.url);
    if (isUnsafeHost(finalUrl.hostname)) throw new Error("허용되지 않는 주소입니다.");
    const html = (await response.text()).slice(0, 2_000_000);
    const structured = jsonLdProduct(html);
    const rawTitle = decode(meta(html, "og:title") ?? structured.title ?? embeddedJsonValue(html, ["productName", "itemName"]) ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? null);
    const title = rawTitle && !/(access denied|captcha|robot check|페이지를 찾을 수 없습니다)/i.test(rawTitle) ? rawTitle.trim() : null;
    const description = decode(meta(html, "og:description") ?? structured.description ?? meta(html, "description"));
    const priceAmount = decode(meta(html, "product:price:amount") ?? meta(html, "og:price:amount") ?? structured.price ?? embeddedJsonValue(html, ["finalPrice", "salePrice", "discountPrice", "priceValue", "price"]) ?? null);
    const priceCurrency = decode(meta(html, "product:price:currency") ?? meta(html, "og:price:currency") ?? structured.currency);
    const rawImage = decode(meta(html, "og:image") ?? meta(html, "twitter:image") ?? structured.image ?? embeddedJsonValue(html, ["imageUrl", "productImage", "thumbnailUrl"]));
    const imageUrl = rawImage ? new URL(rawImage, finalUrl).toString() : null;
    const numericPrice = priceAmount ? Number(priceAmount.replace(/[^0-9.]/g, "")) : NaN;
    const basePriceLabel = Number.isFinite(numericPrice) ? `${numericPrice.toLocaleString("ko-KR")}${priceCurrency === "KRW" || !priceCurrency ? "원" : ` ${priceCurrency}`}` : priceAmount;
    const quantity = quantityFromText(`${title ?? ""} ${description ?? ""}`);
    const unitPriceLabel = Number.isFinite(numericPrice) && quantity ? `개당 ${Math.round(numericPrice / quantity).toLocaleString("ko-KR")}원` : null;
    const priceLabel = basePriceLabel ? `${basePriceLabel}${unitPriceLabel ? ` (${unitPriceLabel})` : ""}` : null;
    const found = [title && "상품명", priceLabel && "가격", imageUrl && "이미지", description && "설명"].filter(Boolean);
    if (!found.length) return NextResponse.json({ error: "이 쇼핑몰이 상품 정보를 외부에 제공하지 않아 자동입력할 수 없습니다. 상품명과 가격을 직접 입력해 주세요." }, { status: 422 });
    return NextResponse.json({ title, description, imageUrl, priceLabel, unitPriceLabel, quantity, found });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "상품 정보를 불러오지 못했습니다. 이미지를 직접 등록해 주세요." }, { status: 400 });
  }
}
