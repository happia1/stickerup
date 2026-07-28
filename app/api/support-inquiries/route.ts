import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import { isDeveloperUser } from "@/lib/developer-auth";

const VALID_STATUSES = new Set(["received", "reviewing", "completed"]);

export async function GET(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  if (!isDeveloperUser(auth.user)) {
    return NextResponse.json({ error: "개발자 계정만 문의 목록을 볼 수 있습니다." }, { status: 403 });
  }
  const db = createSupabaseAdminClient();
  const result = await db.from("support_inquiries").select("*").order("created_at", { ascending: false });
  return result.error
    ? NextResponse.json({ error: result.error.message }, { status: 400 })
    : NextResponse.json({ inquiries: result.data });
}

export async function POST(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: "로그인 후 문의해 주세요." }, { status: 401 });
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!name || !contact || !content) {
    return NextResponse.json({ error: "성함, 연락처, 문의 내용을 모두 입력해 주세요." }, { status: 400 });
  }
  if (name.length > 50 || contact.length > 100 || content.length > 2000) {
    return NextResponse.json({ error: "입력 가능한 글자 수를 초과했습니다." }, { status: 400 });
  }
  const db = createSupabaseAdminClient();
  const result = await db.from("support_inquiries").insert({
    user_id: auth.user.id,
    name,
    contact,
    content,
  }).select("id, status, created_at").single();
  if (result.error) {
    const migrationMissing = result.error.message.includes("support_inquiries");
    return NextResponse.json({
      error: migrationMissing
        ? "문의 접수 기능 준비가 필요합니다. 관리자에게 알려 주세요."
        : result.error.message,
    }, { status: 400 });
  }
  return NextResponse.json({ inquiry: result.data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  if (!isDeveloperUser(auth.user)) {
    return NextResponse.json({ error: "개발자 계정만 문의 상태를 변경할 수 있습니다." }, { status: 403 });
  }
  const body = await request.json();
  if (!body.inquiryId || !VALID_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "문의와 처리 상태를 확인해 주세요." }, { status: 400 });
  }
  const db = createSupabaseAdminClient();
  const result = await db.from("support_inquiries").update({
    status: body.status,
    updated_at: new Date().toISOString(),
  }).eq("id", body.inquiryId).select("*").single();
  return result.error
    ? NextResponse.json({ error: result.error.message }, { status: 400 })
    : NextResponse.json({ inquiry: result.data });
}
