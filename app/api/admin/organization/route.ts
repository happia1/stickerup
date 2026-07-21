import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import { DEFAULT_TEACHER_PERMISSIONS, type TeacherPermissionKey } from "@/lib/types";

const permissionKeys: TeacherPermissionKey[] = ["notices", "sticker_policy", "classes", "students", "approvals", "sticker_audit", "ranking", "rewards"];

async function getTeacher(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return { error: NextResponse.json({ error: auth.error }, { status: 401 }) };
  const db = createSupabaseAdminClient();
  const result = await db.from("teachers").select("id, tenant_id, role").eq("id", auth.user.id).maybeSingle();
  if (result.error || !result.data) return { error: NextResponse.json({ error: "선생님 계정이 필요합니다." }, { status: 403 }) };
  return { db, teacher: result.data };
}

export async function GET(request: Request) {
  const context = await getTeacher(request); if ("error" in context) return context.error;
  const [teachers, invites] = await Promise.all([
    context.db.from("teachers").select("id, tenant_id, role, name, email, invited_by, created_at, permissions").eq("tenant_id", context.teacher.tenant_id).order("created_at"),
    context.db.from("invite_links").select("*").eq("tenant_id", context.teacher.tenant_id).order("created_at", { ascending: false }),
  ]);
  if (teachers.error || invites.error) return NextResponse.json({ error: teachers.error?.message ?? invites.error?.message }, { status: 400 });
  return NextResponse.json({ teachers: teachers.data, inviteLinks: invites.data, currentTeacherId: context.teacher.id });
}

export async function POST(request: Request) {
  const context = await getTeacher(request); if ("error" in context) return context.error;
  const body = await request.json() as { inviteeRole?: "student" | "teacher" };
  if (body.inviteeRole !== "student" && body.inviteeRole !== "teacher") return NextResponse.json({ error: "초대 대상을 확인해주세요." }, { status: 400 });
  if (body.inviteeRole === "teacher" && context.teacher.role !== "owner") return NextResponse.json({ error: "원장만 선생님을 초대할 수 있습니다." }, { status: 403 });
  const token = `${body.inviteeRole}-${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const result = await context.db.from("invite_links").insert({ tenant_id: context.teacher.tenant_id, issuer_teacher_id: context.teacher.id, token, invitee_role: body.inviteeRole, status: "active" }).select("*").single();
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  return NextResponse.json({ inviteLink: result.data });
}

export async function PATCH(request: Request) {
  const context = await getTeacher(request); if ("error" in context) return context.error;
  if (context.teacher.role !== "owner") return NextResponse.json({ error: "관리자만 선생님 권한을 수정할 수 있습니다." }, { status: 403 });
  const body = await request.json() as { teacherId?: string; permission?: TeacherPermissionKey; enabled?: boolean };
  if (!body.teacherId || !body.permission || !permissionKeys.includes(body.permission) || typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "변경할 권한 정보를 확인해주세요." }, { status: 400 });
  }
  const target = await context.db.from("teachers").select("id, role, permissions").eq("id", body.teacherId).eq("tenant_id", context.teacher.tenant_id).maybeSingle();
  if (target.error) return NextResponse.json({ error: target.error.message }, { status: 400 });
  if (!target.data) return NextResponse.json({ error: "선생님을 찾을 수 없습니다." }, { status: 404 });
  if (target.data.role === "owner") return NextResponse.json({ error: "관리자 권한은 변경할 수 없습니다." }, { status: 400 });
  const permissions = { ...DEFAULT_TEACHER_PERMISSIONS, ...(target.data.permissions ?? {}), [body.permission]: body.enabled };
  const result = await context.db.from("teachers").update({ permissions }).eq("id", target.data.id).eq("tenant_id", context.teacher.tenant_id).select("permissions").single();
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  return NextResponse.json({ teacherId: target.data.id, permissions: result.data.permissions });
}

export async function DELETE(request: Request) {
  const context = await getTeacher(request); if ("error" in context) return context.error;
  const body = await request.json() as { inviteLinkId?: string };
  if (!body.inviteLinkId) return NextResponse.json({ error: "삭제할 초대 링크를 확인해주세요." }, { status: 400 });

  const invite = await context.db
    .from("invite_links")
    .select("id, invitee_role")
    .eq("id", body.inviteLinkId)
    .eq("tenant_id", context.teacher.tenant_id)
    .maybeSingle();
  if (invite.error) return NextResponse.json({ error: invite.error.message }, { status: 400 });
  if (!invite.data) return NextResponse.json({ error: "초대 링크를 찾을 수 없습니다." }, { status: 404 });
  if (invite.data.invitee_role === "teacher" && context.teacher.role !== "owner") {
    return NextResponse.json({ error: "관리자만 선생님 초대 링크를 삭제할 수 있습니다." }, { status: 403 });
  }

  const result = await context.db
    .from("invite_links")
    .delete()
    .eq("id", invite.data.id)
    .eq("tenant_id", context.teacher.tenant_id);
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  return NextResponse.json({ deletedInviteLinkId: invite.data.id });
}
