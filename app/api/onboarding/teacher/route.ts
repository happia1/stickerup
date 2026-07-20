import { NextResponse } from "next/server";
import { completeTeacherOnboarding } from "@/lib/repositories/onboarding";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

export async function POST(request: Request) {
  const requestUser = await getRequestUser(request);
  if (!requestUser.user) {
    return NextResponse.json({ error: requestUser.error }, { status: 401 });
  }

  const payload = (await request.json()) as { academyName?: string; teacherName?: string };
  const academyName = payload.academyName?.trim();
  const teacherName = payload.teacherName?.trim();
  if (!academyName || !teacherName || !requestUser.user.email) {
    return NextResponse.json({ error: "Academy name, teacher name, and email are required." }, { status: 400 });
  }

  try {
    const result = await completeTeacherOnboarding(createSupabaseAdminClient(), {
      userId: requestUser.user.id,
      email: requestUser.user.email,
      academyName,
      teacherName,
    });
    return NextResponse.json({ redirectTo: "/admin/dashboard", inviteCode: result.inviteCode });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete teacher onboarding.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
