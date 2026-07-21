import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

export async function POST(request: Request) {
  const auth = await getRequestUser(request); if (!auth.user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const supabase = createSupabaseAdminClient(); const token = `connect-${randomUUID().replaceAll("-", "").slice(0, 16)}`;
  const result = await supabase.from("student_connection_requests").insert({ student_id: auth.user.id, token }).select("token").single();
  if (result.error) return NextResponse.json({ error: "연결 링크를 발급하지 못했습니다." }, { status: 400 });
  return NextResponse.json({ token: result.data.token });
}
