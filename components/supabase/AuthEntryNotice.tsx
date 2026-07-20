"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AuthEntryNotice() {
  const [needsEntry, setNeedsEntry] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setNeedsEntry(!data.session);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!needsEntry) return null;

  return (
    <div className="mx-4 mt-3 rounded-xl bg-surface-raised px-3 py-2 text-caption text-text-secondary">
      <span>로그인하면 내 계정의 Supabase 데이터를 불러옵니다. </span>
      <Link href="/login" className="font-semibold text-brand-amber underline">로그인</Link>
      <span> 또는 </span>
      <Link href="/signup" className="font-semibold text-brand-amber underline">회원가입</Link>
    </div>
  );
}
