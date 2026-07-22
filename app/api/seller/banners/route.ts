import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import { isDeveloperUser } from "@/lib/developer-auth";

async function context(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return { error: NextResponse.json({ error: auth.error }, { status: 401 }) };
  if (!isDeveloperUser(auth.user)) {
    return { error: NextResponse.json({ error: "개발자 계정만 접근할 수 있습니다." }, { status: 403 }) };
  }
  return { db: createSupabaseAdminClient() };
}

export async function GET(request: Request) {
  const ctx = await context(request);
  if ("error" in ctx) return ctx.error;
  const result = await ctx.db.from("marketplace_banners").select("*").order("sort_order").order("created_at", { ascending: false });
  return result.error
    ? NextResponse.json({ error: result.error.message }, { status: 400 })
    : NextResponse.json({ banners: result.data });
}

export async function POST(request: Request) {
  const ctx = await context(request);
  if ("error" in ctx) return ctx.error;
  const body = await request.json();
  if (!/^https?:\/\//i.test(body.linkUrl ?? "")) {
    return NextResponse.json({ error: "올바른 배너 링크가 필요합니다." }, { status: 400 });
  }
  let title = body.title?.trim() || "프로모션";
  let imageUrl = body.imageUrl?.trim() || null;
  if (!imageUrl) {
    try {
      const preview = await fetch(body.linkUrl, { redirect: "follow", signal: AbortSignal.timeout(7000), headers: { "User-Agent": "Mozilla/5.0 (compatible; StickerUp/1.0)" } });
      const html = (await preview.text()).slice(0, 1_000_000);
      const image = html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1] ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i)?.[1];
      const pageTitle = html.match(/<meta[^>]+(?:property|name)=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1];
      if (image) imageUrl = new URL(image, preview.url).toString();
      if (!body.title?.trim() && pageTitle) title = pageTitle;
    } catch { /* 미리보기가 차단되면 링크 제목 카드로 표시 */ }
  }
  const result = await ctx.db.from("marketplace_banners").insert({
    title,
    image_url: imageUrl,
    link_url: body.linkUrl.trim(),
    is_active: true,
    sort_order: Number(body.sortOrder) || 0,
  }).select("*").single();
  return result.error
    ? NextResponse.json({ error: result.error.message }, { status: 400 })
    : NextResponse.json({ banner: result.data });
}

export async function DELETE(request: Request) {
  const ctx = await context(request);
  if ("error" in ctx) return ctx.error;
  const { bannerId } = await request.json();
  const result = await ctx.db.from("marketplace_banners").delete().eq("id", bannerId);
  return result.error
    ? NextResponse.json({ error: result.error.message }, { status: 400 })
    : NextResponse.json({ ok: true });
}
