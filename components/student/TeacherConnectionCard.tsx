"use client";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function TeacherConnectionCard() {
  const [url, setUrl] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  const createLink = async () => {
    setLoading(true); setMessage("");
    try { const client = getSupabaseBrowserClient(); const { data } = await client!.auth.getSession(); const response = await fetch("/api/student/connection-link", { method: "POST", headers: { Authorization: `Bearer ${data.session?.access_token}` } }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setUrl(`${window.location.origin}/connect/student?token=${encodeURIComponent(payload.token)}`); } catch (error) { setMessage(error instanceof Error ? error.message : "연결 링크를 만들지 못했어요."); } finally { setLoading(false); }
  };
  const copy = async () => { await navigator.clipboard.writeText(url); setMessage("링크를 복사했어요. 선생님께 보내주세요."); };
  return <div className="mb-4 rounded-card border border-brand-amber/40 bg-surface-card p-5"><p className="text-subtitle">선생님 연결이 필요합니다</p><p className="mt-1 text-caption text-text-secondary">연결 링크를 선생님께 보내면 선생님이 학생 등록을 승인할 수 있어요.</p>{url ? <div className="mt-4 flex items-center gap-2"><span className="min-w-0 flex-1 break-all rounded-lg bg-surface-raised p-2 text-caption">{url}</span><button onClick={copy} className="rounded-lg bg-brand-amber px-3 py-2 text-caption font-bold text-surface-page">복사</button></div> : <button disabled={loading} onClick={createLink} className="mt-4 rounded-xl bg-brand-amber px-4 py-2.5 text-body font-bold text-surface-page disabled:opacity-60">{loading ? "발급 중..." : "선생님 연결하기"}</button>}{message && <p className="mt-2 text-caption text-text-secondary">{message}</p>}</div>;
}
