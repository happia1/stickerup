import { NextResponse } from "next/server";
import { getStudentHomeData } from "@/lib/data/student-home";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

export async function GET(request: Request) {
  const requestUser = await getRequestUser(request);
  if (!requestUser.user) {
    return NextResponse.json({ error: requestUser.error }, { status: 401 });
  }

  try {
    const db = createSupabaseAdminClient();
    const student = await db.from("students").select("invited_by_teacher_id").eq("id", requestUser.user.id).maybeSingle();
    if (student.error || !student.data) {
      return NextResponse.json({ error: "학생 계정을 확인하지 못했습니다." }, { status: 403 });
    }
    if (!student.data.invited_by_teacher_id) {
      return NextResponse.json({ error: "선생님과 연결한 뒤 이용할 수 있습니다.", code: "TEACHER_CONNECTION_REQUIRED" }, { status: 403 });
    }
    const data = await getStudentHomeData(db, requestUser.user.id);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load student home data.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
