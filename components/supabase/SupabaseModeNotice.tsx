"use client";

import Link from "next/link";
import { getSupabaseBrowserConfigError } from "@/lib/supabase/config";

export function SupabaseModeNotice() {
  const configError = getSupabaseBrowserConfigError();
  if (!configError) return null;

  return (
    <div className="mb-3 rounded-xl bg-surface-raised px-3 py-2 text-caption text-text-secondary">
      <p>Supabase 환경변수가 설정되지 않아 데모 데이터로 실행 중입니다.</p>
      <Link href="/auth" className="mt-1 inline-block font-semibold text-brand-amber underline">
        .env.local 설정 후 로그인 연결하기
      </Link>
    </div>
  );
}
