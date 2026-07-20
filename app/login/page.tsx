"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfigError } from "@/lib/supabase/config";

type AccountType = "student" | "teacher";
type ProfileRole = "student" | "owner" | "assistant";

export default function LoginPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
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
      const isTeacherAccount = profile.role === "owner" || profile.role === "assistant";
      const actualAccountType: AccountType = isTeacherAccount ? "teacher" : "student";
      const destination = isTeacherAccount ? "/admin/dashboard" : "/student/home";

      if (accountType !== actualAccountType) {
        const selectedLabel = accountType === "student" ? "학생" : "선생님";
        const actualLabel = actualAccountType === "student" ? "학생" : "선생님";
        setMessage(`${selectedLabel} 계정으로 선택했지만 ${actualLabel} 계정으로 확인되었습니다. 올바른 화면으로 이동합니다.`);
        window.setTimeout(() => router.push(destination), 1200);
        return;
      }

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
        <p className="mt-2 text-body text-text-secondary">선택한 계정 유형을 확인한 뒤 로그인해 주세요.</p>
        {configError && <p className="mt-4 text-caption text-text-secondary">Supabase 환경변수를 설정한 뒤 로그인해 주세요.</p>}
        <div className="mt-5 grid grid-cols-2 rounded-xl bg-surface-raised p-1" role="tablist" aria-label="계정 유형 선택">
          <button
            type="button"
            role="tab"
            aria-selected={accountType === "student"}
            onClick={() => setAccountType("student")}
            className={`rounded-lg px-3 py-2 text-caption font-bold transition-colors ${accountType === "student" ? "bg-surface-card text-text-primary" : "text-text-secondary"}`}
          >
            학생 계정
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={accountType === "teacher"}
            onClick={() => setAccountType("teacher")}
            className={`rounded-lg px-3 py-2 text-caption font-bold transition-colors ${accountType === "teacher" ? "bg-surface-card text-text-primary" : "text-text-secondary"}`}
          >
            선생님 계정
          </button>
        </div>
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
