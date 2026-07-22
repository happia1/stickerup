import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import { isDeveloperUser } from "@/lib/developer-auth";

const BUCKET = "product-images";
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

export async function POST(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error ?? "로그인이 필요합니다." }, { status: 401 });
  const db = createSupabaseAdminClient();
  if (!isDeveloperUser(auth.user)) {
    const teacher = await db.from("teachers").select("id").eq("id", auth.user.id).maybeSingle();
    if (!teacher.data) return NextResponse.json({ error: "이미지를 등록할 권한이 없습니다." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "이미지 파일을 선택해 주세요." }, { status: 400 });
  const extension = ALLOWED_TYPES.get(file.type);
  if (!extension) return NextResponse.json({ error: "JPG, PNG, WEBP 또는 GIF 이미지만 등록할 수 있습니다." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "이미지는 8MB 이하로 등록해 주세요." }, { status: 400 });

  const bucket = await db.storage.getBucket(BUCKET);
  if (bucket.error) {
    const created = await db.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 8 * 1024 * 1024, allowedMimeTypes: [...ALLOWED_TYPES.keys()] });
    if (created.error && !created.error.message.toLowerCase().includes("already exists")) return NextResponse.json({ error: created.error.message }, { status: 400 });
  } else if (!bucket.data.public) {
    const updated = await db.storage.updateBucket(BUCKET, { public: true, fileSizeLimit: 8 * 1024 * 1024, allowedMimeTypes: [...ALLOWED_TYPES.keys()] });
    if (updated.error) return NextResponse.json({ error: updated.error.message }, { status: 400 });
  }

  const path = `${auth.user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const uploaded = await db.storage.from(BUCKET).upload(path, await file.arrayBuffer(), { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (uploaded.error) return NextResponse.json({ error: uploaded.error.message }, { status: 400 });
  const { data } = db.storage.from(BUCKET).getPublicUrl(uploaded.data.path);
  return NextResponse.json({ imageUrl: data.publicUrl });
}
