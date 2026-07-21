"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function StudentConnectionContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setMessage("연결 링크 정보가 없습니다.");
      setLoading(false);
      return;
    }

    fetch(`/api/student-connections/${encodeURIComponent(token)}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error);
        setName(payload.request.students?.name ?? "학생");
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "연결 요청을 확인하지 못했습니다."))
      .finally(() => setLoading(false));
  }, [token]);

  async function approve() {
    try {
      setLoading(true);
      const client = getSupabaseBrowserClient();
      const { data } = await client!.auth.getSession();
      if (!data.session) throw new Error("선생님 계정으로 로그인한 뒤 다시 링크를 열어주세요.");
      const response = await fetch(`/api/student-connections/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setMessage(`${name} 학생을 등록했어요.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "학생을 등록하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-5">
      <div className="w-full rounded-card bg-surface-card p-6 text-center">
        <h1 className="text-title">학생 연결 요청</h1>
        <p className="my-4 text-text-secondary">{name ? `${name} 학생을 내 조직에 등록할까요?` : loading ? "요청을 확인하고 있어요." : message}</p>
        {name && <button disabled={loading} onClick={approve} className="w-full rounded-xl bg-brand-amber py-3 font-bold text-surface-page disabled:opacity-60">학생 등록하기</button>}
        <Link href="/login" className="mt-4 block text-caption text-text-secondary">선생님 로그인</Link>
        {name && message && <p className="mt-3 text-caption text-text-secondary">{message}</p>}
      </div>
    </main>
  );
}

export default function StudentConnectionPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center p-5"><p className="text-caption text-text-secondary">요청을 확인하고 있어요.</p></main>}><StudentConnectionContent /></Suspense>;
}
