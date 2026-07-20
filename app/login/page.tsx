"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfigError } from "@/lib/supabase/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const configError = getSupabaseBrowserConfigError();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase 환경변수를 설정하면 로그인할 수 있습니다. 현재는 데모 화면을 이용할 수 있습니다.");
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
      const profile = (await profileResponse.json()) as { role?: "teacher" | "student"; onboarded?: boolean; error?: string };
      if (!profileResponse.ok) throw new Error(profile.error ?? "계정 정보를 확인하지 못했습니다.");
      if (!profile.onboarded || !profile.role) {
        const signupRole = signInResult.data.user.user_metadata.signup_role;
        const inviteCode = signInResult.data.user.user_metadata.invite_code;
        if (signupRole === "teacher") {
          router.push("/onboarding/teacher");
        } else if (signupRole === "student" && typeof inviteCode === "string") {
          router.push(`/join/${encodeURIComponent(inviteCode)}`);
        } else {
          router.push("/onboarding");
        }
        return;
      }
      router.push(profile.role === "teacher" ? "/admin/dashboard" : "/student/home");
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
        <p className="mt-2 text-body text-text-secondary">계정 역할에 맞는 화면으로 이동합니다.</p>
        {configError && <p className="mt-4 text-caption text-text-secondary">`.env.local` 값이 비어 있어 현재는 데모 모드입니다.</p>}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block text-caption text-text-secondary">이메일
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
        <Link href="/onboarding" className="mt-4 block text-center text-caption text-text-secondary underline">처음이신가요? 가입 시작하기</Link>
      </div>
    </main>
  );
}
