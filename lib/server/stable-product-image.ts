import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "product-images";
type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

export function isStableProductImage(url: string | null) { return Boolean(url?.includes(`/storage/v1/object/public/${BUCKET}/`)); }

export async function stableProductImage(db: AdminClient, imageUrl: string | null, pathPrefix: string) {
  if (!imageUrl || isStableProductImage(imageUrl)) return imageUrl;
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return imageUrl;
    const contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
    const extensions: Record<string,string> = { "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp", "image/gif":"gif" };
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
