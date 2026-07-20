import { NextResponse } from "next/server";
import { completeStudentOnboarding } from "@/lib/repositories/onboarding";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

export async function POST(request: Request) {
  const requestUser = await getRequestUser(request);
  if (!requestUser.user) {
    return NextResponse.json({ error: requestUser.error }, { status: 401 });
  }

  const payload = (await request.json()) as { inviteCode?: string; studentName?: string; age?: number | null };
  const inviteCode = payload.inviteCode?.trim();
  const studentName = payload.studentName?.trim();
  const age = payload.age ?? null;
  if (!inviteCode || !studentName || (age !== null && (!Number.isInteger(age) || age < 1 || age > 100))) {
    return NextResponse.json({ error: "Invite code, student name, and a valid age are required." }, { status: 400 });
  }

  try {
    await completeStudentOnboarding(createSupabaseAdminClient(), {
      userId: requestUser.user.id,
      inviteCode,
      studentName,
      age,
    });
    return NextResponse.json({ redirectTo: "/student/home" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete student onboarding.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
