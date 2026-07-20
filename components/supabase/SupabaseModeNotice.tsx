"use client";
import { getSupabaseBrowserConfigError } from "@/lib/supabase/config";

export function SupabaseModeNotice() {
  const configError = getSupabaseBrowserConfigError();
  if (!configError || process.env.NODE_ENV !== "development") return null;

  return (
    <div className="mb-3 rounded-xl bg-surface-raised px-3 py-2 text-caption text-text-secondary">
      <p>Supabase 환경변수가 설정되지 않았습니다. 로컬 설정을 완료하면 계정 및 최신 데이터 기능이 활성화됩니다.</p>
    </div>
  );
}
