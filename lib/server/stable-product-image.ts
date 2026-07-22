import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "product-images";
type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

export function isStableProductImage(url: string | null) { return Boolean(url?.includes(`/storage/v1/object/public/${BUCKET}/`)); }
export function cleanProductImage(url?: string | null) { const value = url?.trim(); return value || null; }
export function preferredProductImage(prizeUrl?: string | null, purchaseImageUrl?: string | null) { return cleanProductImage(prizeUrl) || cleanProductImage(purchaseImageUrl); }

export async function stableProductImage(db: AdminClient, imageUrl: string | null, pathPrefix: string) {
  if (!imageUrl || isStableProductImage(imageUrl)) return imageUrl;
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return imageUrl;
    const contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
    const extensions: Record<string,string> = { "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp", "image/gif":"gif", "image/avif":"avif" };
    const extension = extensions[contentType];
    if (!extension) return imageUrl;
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 8 * 1024 * 1024) return imageUrl;
    const bucket = await db.storage.getBucket(BUCKET);
    if (bucket.error) await db.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 8 * 1024 * 1024, allowedMimeTypes: Object.keys(extensions) });
    const path = `${pathPrefix}.${extension}`;
    const uploaded = await db.storage.from(BUCKET).upload(path, bytes, { contentType, cacheControl: "31536000", upsert: true });
    if (uploaded.error) return imageUrl;
    return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  } catch { return imageUrl; }
}

export async function repairCatalogProductImages(db: AdminClient, products: Array<{id:string;image_url:string|null;source_marketplace_product_id?:string|null}>, tenantId: string) {
  const sourceIds = Array.from(new Set(products.map((product) => product.source_marketplace_product_id).filter((id): id is string => Boolean(id))));
  const sourceResult = sourceIds.length ? await db.from("marketplace_products").select("id, image_url, prize_image_url").in("id", sourceIds) : { data: [], error: null };
  const sourceById = new Map((sourceResult.data ?? []).map((source) => [source.id, source]));
  await Promise.all(products.map(async (product) => {
    const source = product.source_marketplace_product_id ? sourceById.get(product.source_marketplace_product_id) : null;
    const candidate = cleanProductImage(product.image_url) || preferredProductImage(source?.prize_image_url, source?.image_url);
    const stableUrl = await stableProductImage(db, candidate, `catalog/${tenantId}/${product.source_marketplace_product_id ?? product.id}`);
    if (stableUrl !== product.image_url) {
      product.image_url = stableUrl;
      await db.from("product_catalog").update({ image_url: stableUrl, updated_at: new Date().toISOString() }).eq("id", product.id).eq("tenant_id", tenantId);
    }
  }));
  return products;
}

export async function syncCatalogProductsToRewardItems(
  db: AdminClient,
  products: Array<{ id: string; title: string; image_url: string | null; purchase_url?: string | null }>
) {
  const results = await Promise.all(products.map((product) => db.from("reward_items").update({
    title: product.title,
    image_url: cleanProductImage(product.image_url),
    link_url: product.purchase_url?.trim() || null,
  }).eq("product_id", product.id)));
  return results.find((result) => result.error)?.error ?? null;
}
