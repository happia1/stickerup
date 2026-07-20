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
    const data = await getStudentHomeData(createSupabaseAdminClient(), requestUser.user.id);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load student home data.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
