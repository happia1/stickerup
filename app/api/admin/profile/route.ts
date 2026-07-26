import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

export async function PATCH(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await request.json() as { name?: string; profileImageUrl?: string | null };
  const name = body.name?.trim();
  if (!name) return NextResponse.json({ error: "이름을 입력해 주세요." }, { status: 400 });
  if (body.profileImageUrl && !/^https?:\/\//i.test(body.profileImageUrl)) return NextResponse.json({ error: "프로필 이미지를 다시 등록해 주세요." }, { status: 400 });

  const db = createSupabaseAdminClient();
  const updated = await db.from("teachers").update({ name, profile_image_url: body.profileImageUrl ?? null }).eq("id", auth.user.id).select("id, name, profile_image_url").maybeSingle();
  if (updated.error) return NextResponse.json({ error: updated.error.message }, { status: 400 });
  if (!updated.data) return NextResponse.json({ error: "수정할 관리자 프로필을 찾지 못했습니다." }, { status: 404 });

  return NextResponse.json({ teacher: updated.data });
}

export async function DELETE(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const db = createSupabaseAdminClient();
  const teacher = await db.from("teachers").select("id").eq("id", auth.user.id).maybeSingle();
  if (teacher.error) return NextResponse.json({ error: teacher.error.message }, { status: 400 });
  if (!teacher.data) return NextResponse.json({ error: "삭제할 관리자 프로필을 찾지 못했습니다." }, { status: 404 });

  const deleted = await db.auth.admin.deleteUser(auth.user.id);
  if (deleted.error) return NextResponse.json({ error: deleted.error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
