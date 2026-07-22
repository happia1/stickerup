import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

async function context(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return { error: NextResponse.json({ error: auth.error }, { status: 401 }) };
  const db = createSupabaseAdminClient();
  const teacher = await db.from("teachers").select("id, tenant_id, role, permissions").eq("id", auth.user.id).maybeSingle();
  if (!teacher.data) return { error: NextResponse.json({ error: "선생님 계정이 필요합니다." }, { status: 403 }) };
  return { db, teacher: teacher.data };
}

export async function GET(request: Request) {
  const ctx = await context(request); if ("error" in ctx) return ctx.error;
  const [products, favorites, saved, banners] = await Promise.all([
    ctx.db.from("marketplace_products").select("*").eq("is_active", true).order("sort_order").order("created_at", { ascending: false }),
    ctx.db.from("marketplace_product_favorites").select("product_id").eq("teacher_id", ctx.teacher.id),
    ctx.db.from("product_catalog").select("source_marketplace_product_id").eq("tenant_id", ctx.teacher.tenant_id).not("source_marketplace_product_id", "is", null),
    ctx.db.from("marketplace_banners").select("*").eq("is_active", true).order("sort_order").order("created_at", { ascending: false }),
  ]);
  const error = products.error ?? favorites.error ?? saved.error ?? banners.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ products: products.data, banners: banners.data ?? [], favoriteIds: favorites.data?.map((row) => row.product_id) ?? [], savedIds: saved.data?.map((row) => row.source_marketplace_product_id) ?? [] });
}

export async function POST(request: Request) {
  const ctx = await context(request); if ("error" in ctx) return ctx.error;
  const body = await request.json();
  const product = await ctx.db.from("marketplace_products").select("*").eq("id", body.productId).eq("is_active", true).maybeSingle();
  if (!product.data) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
  if (body.action === "favorite") {
    const existing = await ctx.db.from("marketplace_product_favorites").select("product_id").eq("product_id", body.productId).eq("teacher_id", ctx.teacher.id).maybeSingle();
    const result = existing.data
      ? await ctx.db.from("marketplace_product_favorites").delete().eq("product_id", body.productId).eq("teacher_id", ctx.teacher.id)
      : await ctx.db.from("marketplace_product_favorites").insert({ product_id: body.productId, teacher_id: ctx.teacher.id });
    return result.error ? NextResponse.json({ error: result.error.message }, { status: 400 }) : NextResponse.json({ favorite: !existing.data });
  }
  if (body.action === "save") {
    const result = await ctx.db.from("product_catalog").upsert({ tenant_id: ctx.teacher.tenant_id, source_marketplace_product_id: product.data.id, title: product.data.title, price_label: product.data.price_label, category: product.data.category, image_url: product.data.prize_image_url ?? product.data.image_url, purchase_url: product.data.purchase_url, description: product.data.description, updated_at: new Date().toISOString() }, { onConflict: "tenant_id,source_marketplace_product_id" }).select("*").single();
    return result.error ? NextResponse.json({ error: result.error.message }, { status: 400 }) : NextResponse.json({ product: result.data });
  }
  return NextResponse.json({ error: "지원하지 않는 요청입니다." }, { status: 400 });
}
