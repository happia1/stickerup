import "server-only";
import { getSupabaseBrowserConfigError } from "./config";

export const missingServiceRoleKeyMessage = "서버 환경변수 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. Vercel 환경변수를 추가한 뒤 재배포해 주세요.";
export const invalidServiceRoleKeyMessage = "서버 환경변수 SUPABASE_SERVICE_ROLE_KEY가 올바르지 않거나 현재 Supabase 프로젝트와 일치하지 않습니다. Vercel 환경변수를 확인한 뒤 재배포해 주세요.";
export const databasePermissionMessage = "Supabase DB 권한이 부족합니다. SQL Editor에서 20260719_05_service_role_permissions.sql을 실행한 뒤 다시 시도해 주세요.";

export function getSupabaseServerConfigError(): string | null {
  const browserError = getSupabaseBrowserConfigError();
  if (browserError) return browserError;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return "SUPABASE_SERVICE_ROLE_KEY is not configured.";
  }

  return null;
}

export function getSupabaseServerConfigMessage(): string {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return "서버의 Supabase 연결 환경변수가 설정되지 않았습니다. Vercel의 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인한 뒤 재배포해 주세요.";
  }

  return missingServiceRoleKeyMessage;
}

export function isSupabaseServiceRoleKeyError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return message.includes("invalid api key")
    || message.includes("invalid jwt")
    || message.includes("invalid token")
    || message.includes("api key is invalid")
    || message.includes("unauthorized");
}

export function isSupabaseDatabasePermissionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return message.includes("permission denied for table")
    || message.includes("row-level security policy");
}
