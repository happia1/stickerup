import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getSupabaseServerConfigError,
  getSupabaseServerConfigMessage,
  databasePermissionMessage,
  invalidServiceRoleKeyMessage,
  isSupabaseDatabasePermissionError,
  isSupabaseServiceRoleKeyError,
  missingServiceRoleKeyMessage,
} from "@/lib/supabase/server-config";

export async function GET() {
  if (getSupabaseServerConfigError()) {
    return NextResponse.json({ error: getSupabaseServerConfigMessage(), code: "SUPABASE_SERVER_CONFIG_MISSING" }, { status: 503 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error: authError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (authError) throw authError;

    const { error: databaseError } = await admin.from("students").select("id").limit(1);
    if (databaseError) throw databaseError;
    return NextResponse.json({ ready: true });
  } catch (error) {
    return NextResponse.json({
      error: isSupabaseServiceRoleKeyError(error)
        ? invalidServiceRoleKeyMessage
        : isSupabaseDatabasePermissionError(error)
        ? databasePermissionMessage
        : "Supabase 관리자 연결을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      code: isSupabaseDatabasePermissionError(error) ? "SUPABASE_DATABASE_PERMISSION_DENIED" : "SUPABASE_SERVICE_ROLE_KEY_INVALID",
    }, { status: 503 });
  }
}
