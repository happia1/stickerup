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

export async function POST(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  if (!isDeveloperUser(auth.user)) return NextResponse.json({ error: "개발자 계정만 접근할 수 있습니다." }, { status: 403 });
  const body = await request.json();
  let target: URL;
  try { target = new URL(body.url); } catch { return NextResponse.json({ error: "올바른 상품 링크를 입력해 주세요." }, { status: 400 }); }
  if (!['http:', 'https:'].includes(target.protocol) || isUnsafeHost(target.hostname)) return NextResponse.json({ error: "외부 웹 상품 링크만 사용할 수 있습니다." }, { status: 400 });
  try {
    const response = await fetch(target, { redirect: "follow", signal: AbortSignal.timeout(8000), headers: { "User-Agent": "Mozilla/5.0 (compatible; StickerUp/1.0; +https://stickerup.vercel.app)" } });
    if (!response.ok) throw new Error("상품 페이지를 열 수 없습니다.");
    const finalUrl = new URL(response.url);
    if (isUnsafeHost(finalUrl.hostname)) throw new Error("허용되지 않는 주소입니다.");
    const html = (await response.text()).slice(0, 2_000_000);
    const title = decode(meta(html, "og:title") ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? null);
    const description = decode(meta(html, "og:description") ?? meta(html, "description"));
    const rawImage = decode(meta(html, "og:image") ?? meta(html, "twitter:image"));
    const imageUrl = rawImage ? new URL(rawImage, finalUrl).toString() : null;
    return NextResponse.json({ title, description, imageUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "상품 정보를 불러오지 못했습니다. 이미지를 직접 등록해 주세요." }, { status: 400 });
  }
}
