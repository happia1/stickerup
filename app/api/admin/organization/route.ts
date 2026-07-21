import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

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
