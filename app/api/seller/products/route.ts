import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import { isDeveloperUser } from "@/lib/developer-auth";
import { preferredProductImage, stableProductImage, syncCatalogProductsToRewardItems } from "@/lib/server/stable-product-image";

async function context(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return { error: NextResponse.json({ error: auth.error }, { status: 401 }) };
  if (!isDeveloperUser(auth.user)) return { error: NextResponse.json({ error: "개발자 계정만 접근할 수 있습니다." }, { status: 403 }) };
  return { db: createSupabaseAdminClient() };
}

export async function GET(request: Request) {
  const ctx = await context(request); if ("error" in ctx) return ctx.error;
  const result = await ctx.db.from("marketplace_products").select("*").order("sort_order").order("created_at", { ascending: false });
  return result.error ? NextResponse.json({ error: result.error.message }, { status: 400 }) : NextResponse.json({ products: result.data });
}

export async function POST(request: Request) {
  const ctx = await context(request); if ("error" in ctx) return ctx.error;
  const body = await request.json();
  if (!body.title?.trim() || !/^https?:\/\//i.test(body.purchaseUrl ?? "")) return NextResponse.json({ error: "상품명과 올바른 구매 링크가 필요합니다." }, { status: 400 });
  const result = await ctx.db.from("marketplace_products").insert({ title: body.title.trim(), price_label: body.priceLabel?.trim() || null, image_url: body.imageUrl?.trim() || null, prize_image_url: body.prizeImageUrl?.trim() || null, purchase_url: body.purchaseUrl.trim(), description: body.description?.trim() || null, category: body.category?.trim() || null, is_active: body.isActive !== false, sort_order: Number(body.sortOrder) || 0 }).select("*").single();
  return result.error ? NextResponse.json({ error: result.error.message }, { status: 400 }) : NextResponse.json({ product: result.data });
}

export async function PATCH(request: Request) {
  const ctx = await context(request); if ("error" in ctx) return ctx.error;
  const body = await request.json();
  if (!body.productId || !body.title?.trim() || !/^https?:\/\//i.test(body.purchaseUrl ?? "")) return NextResponse.json({ error: "상품 정보를 확인해 주세요." }, { status: 400 });
  const result = await ctx.db.from("marketplace_products").update({ title: body.title.trim(), price_label: body.priceLabel?.trim() || null, image_url: body.imageUrl?.trim() || null, prize_image_url: body.prizeImageUrl?.trim() || null, purchase_url: body.purchaseUrl.trim(), description: body.description?.trim() || null, category: body.category?.trim() || null, is_active: body.isActive !== false, sort_order: Number(body.sortOrder) || 0, updated_at: new Date().toISOString() }).eq("id", body.productId).select("*").single();
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  const linked = await ctx.db.from("product_catalog").select("id, tenant_id").eq("source_marketplace_product_id", result.data.id);
  if (linked.error) return NextResponse.json({ error: linked.error.message }, { status: 400 });
  const syncedProducts = [];
  const imageRevision = Date.now();
  for (const catalog of linked.data ?? []) {
    const imageUrl = await stableProductImage(ctx.db, preferredProductImage(result.data.prize_image_url, result.data.image_url), `catalog/${catalog.tenant_id}/${result.data.id}-${imageRevision}`);
    const updated = await ctx.db.from("product_catalog").update({ title: result.data.title, price_label: result.data.price_label, category: result.data.category, image_url: imageUrl, purchase_url: result.data.purchase_url, description: result.data.description, updated_at: new Date().toISOString() }).eq("id", catalog.id).select("id, title, image_url, purchase_url").single();
    if (updated.error) return NextResponse.json({ error: updated.error.message }, { status: 400 });
    syncedProducts.push(updated.data);
  }
  const syncError = await syncCatalogProductsToRewardItems(ctx.db, syncedProducts);
  if (syncError) return NextResponse.json({ error: syncError.message }, { status: 400 });
  return NextResponse.json({ product: result.data });
}

export async function DELETE(request: Request) {
  const ctx = await context(request); if ("error" in ctx) return ctx.error;
  const { productId } = await request.json();
  if (!productId) return NextResponse.json({ error: "상품을 확인해 주세요." }, { status: 400 });
  const result = await ctx.db.from("marketplace_products").delete().eq("id", productId);
  return result.error ? NextResponse.json({ error: result.error.message }, { status: 400 }) : NextResponse.json({ deletedProductId: productId });
}
