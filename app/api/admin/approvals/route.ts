import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import type { TeacherPermissions } from "@/lib/types";

export async function PATCH(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const db = createSupabaseAdminClient();
  const teacher = await db.from("teachers").select("id, tenant_id, role, permissions").eq("id", auth.user.id).maybeSingle();
  if (!teacher.data) return NextResponse.json({ error: "선생님 계정이 필요합니다." }, { status: 403 });
  const permissions = teacher.data.permissions as TeacherPermissions | null;
  if (teacher.data.role !== "owner" && permissions?.approvals === false) return NextResponse.json({ error: "승인 권한이 없습니다." }, { status: 403 });
  const body = await request.json() as { type?: "homework" | "praise"; requestId?: string; action?: "approve" | "reject"; count?: number };
  if (!body.type || !body.requestId || !body.action) return NextResponse.json({ error: "승인 요청 정보를 확인해주세요." }, { status: 400 });
  const table = body.type === "homework" ? "homework_submissions" : "praise_requests";
  const row = await db.from(table).select("*").eq("id", body.requestId).eq("tenant_id", teacher.data.tenant_id).eq("approval_status", "pending").maybeSingle();
  if (!row.data) return NextResponse.json({ error: "처리할 대기 요청을 찾을 수 없습니다." }, { status: 404 });
  if (body.action === "reject") {
    const rejected = await db.from(table).update({ approval_status: "rejected", approver_id: teacher.data.id, approved_at: new Date().toISOString() }).eq("id", body.requestId);
    if (rejected.error) return NextResponse.json({ error: rejected.error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }
  const count = body.type === "homework" ? row.data.sticker_count : Math.max(1, body.count ?? 2);
  let classId = row.data.class_id as string | null;
  if (!classId) {
    const defaultClass = await db.from("classes").select("id").eq("tenant_id", teacher.data.tenant_id).eq("is_default", true).maybeSingle();
    classId = defaultClass.data?.id ?? null;
  }
  if (!classId) return NextResponse.json({ error: "스티커를 지급할 기본반이 없습니다." }, { status: 400 });
  const approved = await db.from(table).update({ approval_status: "approved", approver_id: teacher.data.id, approved_at: new Date().toISOString(), ...(body.type === "praise" ? { sticker_count: count } : {}) }).eq("id", body.requestId);
  if (approved.error) return NextResponse.json({ error: approved.error.message }, { status: 400 });
  const ledger = await db.from("sticker_ledger").insert({ tenant_id: teacher.data.tenant_id, student_id: row.data.student_id, class_id: classId, source_type: body.type, source_id: body.requestId, count, status: "active", actor_teacher_id: teacher.data.id });
  if (ledger.error) return NextResponse.json({ error: ledger.error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
