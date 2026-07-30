import { NextResponse } from "next/server";
import { getActiveInvitePreview } from "@/lib/repositories/onboarding";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerConfigError } from "@/lib/supabase/server-config";

export async function GET(
  _request: Request,
  { params }: { params: { inviteCode: string } }
) {
  const configError = getSupabaseServerConfigError();
  if (configError) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  try {
    const inviteCode = decodeURIComponent(params.inviteCode).trim();
    if (!inviteCode) {
      return NextResponse.json(
        { error: "초대 링크 정보가 없습니다.", code: "INVITE_CODE_MISSING" },
        { status: 400 }
      );
    }

    const invite = await getActiveInvitePreview(createSupabaseAdminClient(), inviteCode);
    if (!invite) {
      return NextResponse.json(
        { error: "유효하지 않거나 만료된 초대 링크입니다.", code: "INVITE_INVALID_OR_EXPIRED" },
        { status: 404 }
      );
    }
    return NextResponse.json({ invite });
  } catch (error) {
    console.error("Unable to load invite preview", error);
    return NextResponse.json(
      { error: "초대 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.", code: "INVITE_LOOKUP_FAILED" },
      { status: 500 }
    );
  }
}
