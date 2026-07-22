import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import { repairCatalogProductImages } from "@/lib/server/stable-product-image";

async function getContext(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return { error: NextResponse.json({ error: auth.error }, { status: 401 }) };
  const db = createSupabaseAdminClient();
  const result = await db.from("teachers").select("id, tenant_id, role, permissions").eq("id", auth.user.id).maybeSingle();
  if (!result.data) return { error: NextResponse.json({ error: "선생님 계정이 필요합니다." }, { status: 403 }) };
  if (result.data.role !== "owner" && result.data.permissions?.rewards !== true) return { error: NextResponse.json({ error: "상품 관리 권한이 필요합니다." }, { status: 403 }) };
  return { db, teacher: result.data };
}

export async function GET(request: Request) {
  const context = await getContext(request); if ("error" in context) return context.error;
  const [result, likes] = await Promise.all([
    context.db.from("product_catalog").select("*").eq("tenant_id", context.teacher.tenant_id),
    context.db.from("prize_product_likes").select("product_id").eq("tenant_id", context.teacher.tenant_id),
  ]);
  const likeError = likes.error?.code === "42P01" ? null : likes.error;
  if (result.error || likeError) return NextResponse.json({ error: (result.error ?? likeError)?.message }, { status: 400 });
  await repairCatalogProductImages(context.db, result.data ?? [], context.teacher.tenant_id);
  const products = (result.data ?? []).map((product) => ({ ...product, like_count: (likes.data ?? []).filter((like) => like.product_id === product.id).length })).sort((a, b) => b.like_count - a.like_count || a.title.localeCompare(b.title, "ko"));
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const context = await getContext(request); if ("error" in context) return context.error;
  const body = await request.json();
  if (!body.title?.trim()) return NextResponse.json({ error: "상품명이 필요합니다." }, { status: 400 });
  const result = await context.db.from("product_catalog").insert({ tenant_id: context.teacher.tenant_id, title: body.title.trim(), price_label: body.priceLabel?.trim() || null, category: body.category?.trim() || null, image_url: body.imageUrl?.trim() || null, purchase_url: body.purchaseUrl ?? null, description: body.description ?? null }).select("*").single();
  return result.error ? NextResponse.json({ error: result.error.message }, { status: 400 }) : NextResponse.json({ product: result.data });
}

export async function PATCH(request: Request) {
  const context = await getContext(request); if ("error" in context) return context.error;
  const body = await request.json();
  if (!body.productId || !body.title?.trim()) return NextResponse.json({ error: "상품 정보를 확인해 주세요." }, { status: 400 });
  const existing = await context.db.from("product_catalog").select("source_marketplace_product_id").eq("id", body.productId).eq("tenant_id", context.teacher.tenant_id).maybeSingle();
  if (existing.error) return NextResponse.json({ error: existing.error.message }, { status: 400 });
  if (!existing.data) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
  if (existing.data.source_marketplace_product_id) return NextResponse.json({ error: "개발자 연동 상품은 개발자 상품 관리에서만 수정할 수 있습니다." }, { status: 409 });
  const result = await context.db.from("product_catalog").update({ title: body.title.trim(), price_label: body.priceLabel?.trim() || null, category: body.category?.trim() || null, image_url: body.imageUrl?.trim() || null, purchase_url: body.purchaseUrl ?? null, description: body.description ?? null, updated_at: new Date().toISOString() }).eq("id", body.productId).eq("tenant_id", context.teacher.tenant_id).select("*").single();
  return result.error ? NextResponse.json({ error: result.error.message }, { status: 400 }) : NextResponse.json({ product: result.data });
}

export async function DELETE(request: Request) {
  const context = await getContext(request); if ("error" in context) return context.error;
  const body = await request.json();
  if (!body.productId) return NextResponse.json({ error: "상품을 확인해 주세요." }, { status: 400 });
  const result = await context.db.from("product_catalog").delete().eq("id", body.productId).eq("tenant_id", context.teacher.tenant_id);
  return result.error ? NextResponse.json({ error: result.error.message }, { status: 400 }) : NextResponse.json({ deletedProductId: body.productId });
}
