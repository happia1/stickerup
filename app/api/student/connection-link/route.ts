import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

export async function POST(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  const student = await supabase
    .from("students")
    .select("id, invited_by_teacher_id")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (student.error || !student.data) {
    return NextResponse.json({ error: "학생 계정을 확인하지 못했습니다." }, { status: 403 });
  }
  if (student.data.invited_by_teacher_id) {
    return NextResponse.json({ error: "이미 선생님과 연결된 학생입니다." }, { status: 409 });
  }

  const existing = await supabase
    .from("student_connection_requests")
    .select("token, expires_at")
    .eq("student_id", auth.user.id)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing.error) {
    return NextResponse.json({ error: "기존 연결 요청을 확인하지 못했습니다." }, { status: 400 });
  }
  if (existing.data) {
    return NextResponse.json({ token: existing.data.token, expiresAt: existing.data.expires_at, reused: true });
  }

  const token = `connect-${randomUUID().replaceAll("-", "").slice(0, 16)}`;
  const result = await supabase
    .from("student_connection_requests")
    .insert({ student_id: auth.user.id, token })
    .select("token, expires_at")
    .single();
  if (result.error) return NextResponse.json({ error: "연결 링크를 발급하지 못했습니다." }, { status: 400 });
  return NextResponse.json({ token: result.data.token, expiresAt: result.data.expires_at, reused: false });
}
