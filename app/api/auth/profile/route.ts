import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

export async function GET(request: Request) {
  const requestUser = await getRequestUser(request);
  if (!requestUser.user) {
    return NextResponse.json({ error: requestUser.error }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const [studentResult, teacherResult] = await Promise.all([
    supabase.from("students").select("id").eq("id", requestUser.user.id).maybeSingle(),
    supabase.from("teachers").select("id, role").eq("id", requestUser.user.id).maybeSingle(),
  ]);

  if (studentResult.error || teacherResult.error) {
    return NextResponse.json({ error: "Unable to load your profile." }, { status: 400 });
  }

  if (studentResult.data) return NextResponse.json({ role: "student", onboarded: true });
  if (teacherResult.data) return NextResponse.json({ role: "teacher", onboarded: true });

  return NextResponse.json({ role: null, onboarded: false });
}
