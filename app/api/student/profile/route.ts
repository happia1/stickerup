import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

export async function DELETE(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

  const db = createSupabaseAdminClient();
  const student = await db.from("students").select("id").eq("id", auth.user.id).maybeSingle();
  if (student.error) return NextResponse.json({ error: student.error.message }, { status: 400 });
  if (!student.data) return NextResponse.json({ error: "삭제할 학생 프로필을 찾지 못했습니다." }, { status: 404 });

  const deleted = await db.auth.admin.deleteUser(auth.user.id);
  if (deleted.error) return NextResponse.json({ error: deleted.error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
