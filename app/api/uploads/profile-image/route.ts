import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/supabase/server-auth";

export async function POST(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  return NextResponse.json(
    { error: "관리자 프로필 사진 등록은 지원하지 않습니다." },
    { status: 410 },
  );
}
