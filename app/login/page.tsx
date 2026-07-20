"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfigError } from "@/lib/supabase/config";

type ProfileRole = "student" | "owner" | "assistant";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [resumeSignupHref, setResumeSignupHref] = useState("/signup?resume=1");
  const [submitting, setSubmitting] = useState(false);
  const configError = getSupabaseBrowserConfigError();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase 환경변수를 설정한 뒤 다시 시도해 주세요.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const signInResult = await supabase.auth.signInWithPassword({ email, password });
      if (signInResult.error) throw signInResult.error;

      const profileResponse = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${signInResult.data.session.access_token}` },
      });
      const profile = (await profileResponse.json()) as { role?: ProfileRole; onboarded?: boolean; error?: string };
      if (!profileResponse.ok) throw new Error(profile.error ?? "계정 정보를 확인하지 못했습니다.");
      if (!profile.onboarded || !profile.role) {
        const inviteCode = signInResult.data.user.user_metadata.invite_code;
        if (typeof inviteCode === "string" && inviteCode) {
          setResumeSignupHref(`/signup?resume=1&invite=${encodeURIComponent(inviteCode)}`);
        }
        setMessage("가입 정보가 아직 완성되지 않았습니다. 회원가입 화면에서 정보를 확인해 주세요.");
        return;
      }
      const isTeacherAccount = profile.role === "owner" || profile.role === "assistant";
      const destination = isTeacherAccount ? "/admin/dashboard" : "/student/home";
      router.push(destination);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로그인을 완료하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-app px-6 py-10">
      <Link href="/" className="text-caption text-text-secondary underline">StickerUp으로 돌아가기</Link>
      <div className="mt-8 rounded-card bg-surface-card p-5">
        <p className="text-display">로그인</p>
        <p className="mt-2 text-body text-text-secondary">계정 정보를 입력하면 역할에 맞는 화면으로 이동합니다.</p>
        {configError && <p className="mt-4 text-caption text-text-secondary">Supabase 환경변수를 설정한 뒤 로그인해 주세요.</p>}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block text-caption text-text-secondary">아이디 또는 이메일
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
          </label>
          <label className="block text-caption text-text-secondary">비밀번호
            <input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
          </label>
          {message && <p className="text-caption text-text-secondary">{message}</p>}
          <button disabled={submitting} className="w-full rounded-xl bg-brand-amber py-3 text-body font-bold text-surface-page disabled:opacity-60">
            {submitting ? "로그인 중..." : "로그인"}
          </button>
        </form>
        {!message?.startsWith("가입 정보") && <Link href="/signup" className="mt-4 block text-center text-caption text-text-secondary underline">아직 계정이 없나요? 회원가입</Link>}
        {message?.startsWith("가입 정보") && <Link href={resumeSignupHref} className="mt-4 block text-center text-caption text-brand-amber underline">회원가입 정보 이어서 입력하기</Link>}
      </div>
    </main>
  );
}
