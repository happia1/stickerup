import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface InvitePreview {
  inviteId: string;
  tenantId: string;
  teacherId: string;
  academyName: string;
  teacherName: string;
}

export interface TeacherOnboardingInput {
  userId: string;
  email: string;
  academyName: string;
  teacherName: string;
}

export interface StudentOnboardingInput {
  userId: string;
  studentName: string;
  age: number | null;
  academyName: string;
  inviteCode?: string | null;
}

function fail(error: { message: string } | null, fallback: string): never {
  throw new Error(error?.message ?? fallback);
}

async function ensureProfileIsNew(supabase: SupabaseClient, userId: string) {
  const [studentResult, teacherResult] = await Promise.all([
    supabase.from("students").select("id").eq("id", userId).maybeSingle(),
    supabase.from("teachers").select("id").eq("id", userId).maybeSingle(),
  ]);

  if (studentResult.error) fail(studentResult.error, "Unable to check student profile.");
  if (teacherResult.error) fail(teacherResult.error, "Unable to check teacher profile.");
  if (studentResult.data || teacherResult.data) {
    throw new Error("Onboarding is already complete for this account.");
  }
}

async function getDefaultClassId(supabase: SupabaseClient, tenantId: string): Promise<string> {
  const classResult = await supabase
    .from("classes")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("is_default", true)
    .maybeSingle();
  if (classResult.error) fail(classResult.error, "Unable to find the default class.");
  if (classResult.data) return classResult.data.id;

  const fallbackClass = await supabase
    .from("classes")
    .insert({ tenant_id: tenantId, name: "기본반", is_default: true, ranking_unit: "month" })
    .select("id")
    .single();
  if (fallbackClass.error || !fallbackClass.data) fail(fallbackClass.error, "Unable to create the default class.");
  return fallbackClass.data.id;
}

export async function getActiveInvitePreview(
  supabase: SupabaseClient,
  inviteCode: string
): Promise<InvitePreview | null> {
  const inviteResult = await supabase
    .from("invite_links")
    .select("id, tenant_id, issuer_teacher_id, expires_at")
    .eq("token", inviteCode)
    .eq("status", "active")
    .maybeSingle();

  if (inviteResult.error) fail(inviteResult.error, "Unable to load invite link.");
  if (!inviteResult.data) return null;
  if (inviteResult.data.expires_at && new Date(inviteResult.data.expires_at) < new Date()) return null;

  const [tenantResult, teacherResult] = await Promise.all([
    supabase.from("tenants").select("name").eq("id", inviteResult.data.tenant_id).maybeSingle(),
    supabase.from("teachers").select("name").eq("id", inviteResult.data.issuer_teacher_id).maybeSingle(),
  ]);
  if (tenantResult.error) fail(tenantResult.error, "Unable to load academy.");
  if (teacherResult.error) fail(teacherResult.error, "Unable to load teacher.");
  if (!tenantResult.data || !teacherResult.data) return null;

  return {
    inviteId: inviteResult.data.id,
    tenantId: inviteResult.data.tenant_id,
    teacherId: inviteResult.data.issuer_teacher_id,
    academyName: tenantResult.data.name,
    teacherName: teacherResult.data.name,
  };
}

export async function completeTeacherOnboarding(
  supabase: SupabaseClient,
  input: TeacherOnboardingInput
) {
  await ensureProfileIsNew(supabase, input.userId);

  const tenantResult = await supabase
    .from("tenants")
    .insert({ name: input.academyName })
    .select("id")
    .single();
  if (tenantResult.error || !tenantResult.data) fail(tenantResult.error, "Unable to create academy.");

  const teacherResult = await supabase.from("teachers").insert({
    id: input.userId,
    tenant_id: tenantResult.data.id,
    role: "owner",
    name: input.teacherName,
    email: input.email,
    invited_by: null,
  });
  if (teacherResult.error) fail(teacherResult.error, "Unable to create teacher profile.");

  const ownerResult = await supabase
    .from("tenants")
    .update({ owner_teacher_id: input.userId })
    .eq("id", tenantResult.data.id);
  if (ownerResult.error) fail(ownerResult.error, "Unable to assign academy owner.");

  await getDefaultClassId(supabase, tenantResult.data.id);
  const rankingResult = await supabase.from("ranking_period_config").insert({
    tenant_id: tenantResult.data.id,
    class_id: null,
    unit: "month",
  });
  if (rankingResult.error) fail(rankingResult.error, "Unable to create ranking defaults.");

  const inviteCode = `stickerup-${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const inviteResult = await supabase.from("invite_links").insert({
    tenant_id: tenantResult.data.id,
    issuer_teacher_id: input.userId,
    token: inviteCode,
    status: "active",
  });
  if (inviteResult.error) fail(inviteResult.error, "Unable to create the default invite link.");

  return { tenantId: tenantResult.data.id, inviteCode };
}

export async function completeStudentOnboarding(
  supabase: SupabaseClient,
  input: StudentOnboardingInput
) {
  await ensureProfileIsNew(supabase, input.userId);
  const inviteCode = input.inviteCode?.trim();
  const invite = inviteCode ? await getActiveInvitePreview(supabase, inviteCode) : null;
  if (inviteCode && !invite) throw new Error("This invite link is invalid or expired.");

  let tenantId: string;
  let teacherId: string | null = null;
  let inviteId: string | null = null;

  if (invite) {
    tenantId = invite.tenantId;
    teacherId = invite.teacherId;
    inviteId = invite.inviteId;
  } else {
    const academyName = input.academyName.trim();
    if (!academyName) throw new Error("Academy name is required for student signup.");

    const tenantResult = await supabase
      .from("tenants")
      .select("id")
      .eq("name", academyName)
      .limit(1)
      .maybeSingle();
    if (tenantResult.error) fail(tenantResult.error, "Unable to find academy.");
    if (!tenantResult.data) throw new Error("Academy was not found. Please check the academy name or ask your teacher for an invite link.");
    tenantId = tenantResult.data.id;
  }

  const studentResult = await supabase.from("students").insert({
    id: input.userId,
    tenant_id: tenantId,
    invited_by_teacher_id: teacherId,
    invite_link_id: inviteId,
    name: input.studentName,
    age: input.age,
  });
  if (studentResult.error) fail(studentResult.error, "Unable to create student profile.");

  const defaultClassId = await getDefaultClassId(supabase, tenantId);
  const enrollmentResult = await supabase.from("enrollments").upsert(
    {
      tenant_id: tenantId,
      student_id: input.userId,
      class_id: defaultClassId,
      status: invite ? "approved" : "pending",
      approved_at: invite ? new Date().toISOString() : null,
      approver_id: teacherId,
    },
    { onConflict: "student_id,class_id" }
  );
  if (enrollmentResult.error) fail(enrollmentResult.error, "Unable to enroll the student in the default class.");

  return { tenantId, classId: defaultClassId, enrollmentStatus: invite ? "approved" : "pending" };
}
