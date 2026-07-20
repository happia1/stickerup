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
    const invite = await getActiveInvitePreview(createSupabaseAdminClient(), params.inviteCode);
    if (!invite) {
      return NextResponse.json({ error: "This invite link is invalid or expired." }, { status: 404 });
    }
    return NextResponse.json({ invite });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load invite link.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
