import { NextResponse } from "next/server";
import { completeStudentOnboarding, completeTeacherOnboarding } from "@/lib/repositories/onboarding";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

type SignupType = "student" | "teacher";

export async function POST(request: Request) {
  const requestUser = await getRequestUser(request);
  if (!requestUser.user?.email) {
    return NextResponse.json({ error: requestUser.error ?? "A signed-in user is required." }, { status: 401 });
  }

  const payload = (await request.json()) as {
    signupType?: SignupType;
    name?: string;
    age?: number | null;
    academyName?: string;
    inviteCode?: string | null;
  };
  const signupType = payload.signupType;
  const name = payload.name?.trim();
  const academyName = payload.academyName?.trim();
  const age = payload.age ?? null;

  if (!signupType || !name || !academyName) {
    return NextResponse.json({ error: "Signup type, name, and academy name are required." }, { status: 400 });
  }

  try {
    if (signupType === "teacher") {
      const result = await completeTeacherOnboarding(createSupabaseAdminClient(), {
        userId: requestUser.user.id,
        email: requestUser.user.email,
        academyName,
        teacherName: name,
      });
      return NextResponse.json({ redirectTo: "/admin/dashboard", inviteCode: result.inviteCode });
    }

    if (age === null || !Number.isInteger(age) || age < 1 || age > 100) {
      return NextResponse.json({ error: "A valid age is required for student signup." }, { status: 400 });
    }
    const result = await completeStudentOnboarding(createSupabaseAdminClient(), {
      userId: requestUser.user.id,
      studentName: name,
      age,
      academyName,
      inviteCode: payload.inviteCode,
    });
    return NextResponse.json({ redirectTo: "/student/home", enrollmentStatus: result.enrollmentStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete signup.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
