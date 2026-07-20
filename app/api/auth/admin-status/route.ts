import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getSupabaseServerConfigError,
  getSupabaseServerConfigMessage,
  invalidServiceRoleKeyMessage,
  isSupabaseServiceRoleKeyError,
  missingServiceRoleKeyMessage,
} from "@/lib/supabase/server-config";

export async function GET() {
  if (getSupabaseServerConfigError()) {
    return NextResponse.json({ error: getSupabaseServerConfigMessage(), code: "SUPABASE_SERVER_CONFIG_MISSING" }, { status: 503 });
  }

  try {
    const { error } = await createSupabaseAdminClient().auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) throw error;
    return NextResponse.json({ ready: true });
  } catch (error) {
    return NextResponse.json({
      error: isSupabaseServiceRoleKeyError(error) ? invalidServiceRoleKeyMessage : "Supabase 관리자 연결을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      code: "SUPABASE_SERVICE_ROLE_KEY_INVALID",
    }, { status: 503 });
  }
}
