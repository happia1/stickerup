import { NextResponse } from "next/server";
import { completeStudentOnboarding } from "@/lib/repositories/onboarding";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

export async function POST(request: Request) {
  const requestUser = await getRequestUser(request);
  if (!requestUser.user) {
    return NextResponse.json({ error: requestUser.error }, { status: 401 });
  }

  const payload = (await request.json()) as { inviteCode?: string; studentName?: string; birthDate?: string; academyName?: string };
  const inviteCode = payload.inviteCode?.trim() || null;
  const studentName = payload.studentName?.trim();
  const academyName = payload.academyName?.trim();
  const birthDate = payload.birthDate?.trim();
  if (!studentName || !academyName || !birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return NextResponse.json({ error: "학원 이름, 학생 이름과 올바른 생년월일이 필요합니다." }, { status: 400 });
  }

  try {
    const result = await completeStudentOnboarding(createSupabaseAdminClient(), {
      userId: requestUser.user.id,
      inviteCode,
      studentName,
      birthDate,
      academyName,
    });
    return NextResponse.json({ redirectTo: "/student/home", enrollmentStatus: result.enrollmentStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete student onboarding.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
