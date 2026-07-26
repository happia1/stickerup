import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

const BUCKET = "profile-images";
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const db = createSupabaseAdminClient();
  const teacher = await db.from("teachers").select("id").eq("id", auth.user.id).maybeSingle();
  if (!teacher.data) return NextResponse.json({ error: "관리자 계정이 필요합니다." }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "프로필 사진을 선택해 주세요." }, { status: 400 });
  const extension = ALLOWED_TYPES.get(file.type);
  if (!extension) return NextResponse.json({ error: "JPG, PNG 또는 WEBP 이미지만 등록할 수 있습니다." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "프로필 사진은 5MB 이하로 등록해 주세요." }, { status: 400 });

  const bucket = await db.storage.getBucket(BUCKET);
  if (bucket.error) {
    const created = await db.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 5 * 1024 * 1024, allowedMimeTypes: [...ALLOWED_TYPES.keys()] });
    if (created.error && !created.error.message.toLowerCase().includes("already exists")) return NextResponse.json({ error: created.error.message }, { status: 400 });
  }

  const path = `${auth.user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const uploaded = await db.storage.from(BUCKET).upload(path, await file.arrayBuffer(), { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (uploaded.error) return NextResponse.json({ error: uploaded.error.message }, { status: 400 });
  const { data } = db.storage.from(BUCKET).getPublicUrl(uploaded.data.path);
  return NextResponse.json({ imageUrl: data.publicUrl });
}
