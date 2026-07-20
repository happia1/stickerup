import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

type OnboardingRole = "teacher" | "student";

interface OnboardingPayload {
  role: OnboardingRole;
  name: string;
  academyName?: string;
  accessCode?: string;
  classId?: string;
  age?: number | null;
}

function isOnboardingRole(value: unknown): value is OnboardingRole {
  return value === "teacher" || value === "student";
}

export async function POST(request: Request) {
  const requestUser = await getRequestUser(request);
  if (!requestUser.user) {
    return NextResponse.json({ error: requestUser.error }, { status: 401 });
  }

  const payload = (await request.json()) as OnboardingPayload;
  const name = payload.name?.trim();
  if (!isOnboardingRole(payload.role) || !name) {
    return NextResponse.json({ error: "Role and name are required." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const [existingStudent, existingTeacher] = await Promise.all([
    supabase.from("students").select("id").eq("id", requestUser.user.id).maybeSingle(),
    supabase.from("teachers").select("id").eq("id", requestUser.user.id).maybeSingle(),
  ]);

  if (existingStudent.data || existingTeacher.data) {
    return NextResponse.json({ error: "Onboarding is already complete." }, { status: 409 });
  }

  if (payload.role === "teacher") {
    const academyName = payload.academyName?.trim();
    if (!academyName) {
      return NextResponse.json({ error: "Academy name is required for a teacher account." }, { status: 400 });
    }

    const tenantResult = await supabase
      .from("tenants")
      .insert({ name: academyName })
      .select("id")
      .single();
    if (tenantResult.error || !tenantResult.data) {
      return NextResponse.json({ error: tenantResult.error?.message ?? "Unable to create academy." }, { status: 400 });
    }

    const teacherResult = await supabase.from("teachers").insert({
      id: requestUser.user.id,
      tenant_id: tenantResult.data.id,
      role: "owner",
      name,
      email: requestUser.user.email ?? "",
      invited_by: null,
    });
    if (teacherResult.error) {
      return NextResponse.json({ error: teacherResult.error.message }, { status: 400 });
    }

    await supabase.from("tenants").update({ owner_teacher_id: requestUser.user.id }).eq("id", tenantResult.data.id);
    return NextResponse.json({ role: "teacher", redirectTo: "/admin/dashboard" });
  }

  const accessCode = payload.accessCode?.trim();
  if (!accessCode) {
    return NextResponse.json({ error: "An invite link or academy code is required." }, { status: 400 });
  }

  const inviteResult = await supabase
    .from("invite_links")
    .select("tenant_id, issuer_teacher_id, expires_at")
    .eq("token", accessCode)
    .eq("status", "active")
    .maybeSingle();
  if (inviteResult.error || !inviteResult.data) {
    return NextResponse.json({ error: "The invite link or academy code is invalid." }, { status: 400 });
  }

  if (inviteResult.data.expires_at && new Date(inviteResult.data.expires_at) < new Date()) {
    return NextResponse.json({ error: "The invite link or academy code has expired." }, { status: 400 });
  }

  if (payload.classId) {
    const classResult = await supabase
      .from("classes")
      .select("id")
      .eq("id", payload.classId)
      .eq("tenant_id", inviteResult.data.tenant_id)
      .eq("status", "active")
      .maybeSingle();
    if (classResult.error || !classResult.data) {
      return NextResponse.json({ error: "The selected class is not available for this academy." }, { status: 400 });
    }
  }

  const studentResult = await supabase.from("students").insert({
    id: requestUser.user.id,
    tenant_id: inviteResult.data.tenant_id,
    invited_by_teacher_id: inviteResult.data.issuer_teacher_id,
    name,
    age: payload.age ?? null,
  });
  if (studentResult.error) {
    return NextResponse.json({ error: studentResult.error.message }, { status: 400 });
  }

  if (payload.classId) {
    const enrollmentResult = await supabase.from("enrollments").upsert(
      {
        tenant_id: inviteResult.data.tenant_id,
        student_id: requestUser.user.id,
        class_id: payload.classId,
        status: "pending",
      },
      { onConflict: "student_id,class_id", ignoreDuplicates: true }
    );
    if (enrollmentResult.error) {
      return NextResponse.json({ error: enrollmentResult.error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ role: "student", redirectTo: "/student/home" });
}
