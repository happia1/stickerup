import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const db = createSupabaseAdminClient();
  const connection = await db.from("student_connection_requests").select("status, expires_at, students(name)").eq("token", params.token).maybeSingle();
  if (connection.error || !connection.data) return NextResponse.json({ error: "유효하지 않은 연결 링크입니다." }, { status: 404 });
  return NextResponse.json({ request: connection.data });
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: "선생님 로그인이 필요합니다." }, { status: 401 });
  const db = createSupabaseAdminClient();
  const teacher = await db.from("teachers").select("id, tenant_id").eq("id", auth.user.id).maybeSingle();
  if (!teacher.data) return NextResponse.json({ error: "선생님 계정만 등록할 수 있습니다." }, { status: 403 });
  const connection = await db.from("student_connection_requests").select("id, student_id, status, expires_at").eq("token", params.token).maybeSingle();
  if (!connection.data || connection.data.status !== "pending" || new Date(connection.data.expires_at) < new Date()) {
    return NextResponse.json({ error: "만료되었거나 처리된 링크입니다." }, { status: 400 });
  }
  const student = await db.from("students").update({ tenant_id: teacher.data.tenant_id, invited_by_teacher_id: teacher.data.id }).eq("id", connection.data.student_id);
  if (student.error) return NextResponse.json({ error: "학생을 등록하지 못했습니다." }, { status: 400 });

  const defaultClass = await db.from("classes").select("id").eq("tenant_id", teacher.data.tenant_id).eq("is_default", true).maybeSingle();
  if (defaultClass.data) {
    const enrollment = await db.from("enrollments").upsert({ tenant_id: teacher.data.tenant_id, student_id: connection.data.student_id, class_id: defaultClass.data.id, status: "approved", approved_at: new Date().toISOString(), approver_id: teacher.data.id }, { onConflict: "student_id,class_id" });
    if (enrollment.error) return NextResponse.json({ error: "학생의 기본반 등록을 완료하지 못했습니다." }, { status: 400 });
  }
  const approved = await db.from("student_connection_requests").update({ status: "approved", approved_by: teacher.data.id, approved_at: new Date().toISOString() }).eq("id", connection.data.id);
  if (approved.error) return NextResponse.json({ error: "연결 요청 상태를 변경하지 못했습니다." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
