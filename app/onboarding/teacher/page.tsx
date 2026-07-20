"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfigError } from "@/lib/supabase/config";

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const [academyName, setAcademyName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const configError = getSupabaseBrowserConfigError();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase 환경변수를 설정하면 선생님 계정을 만들 수 있습니다. 현재는 데모 모드입니다.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const sessionResult = await supabase.auth.getSession();
      let accessToken = sessionResult.data.session?.access_token;
      if (!accessToken) {
        const signUpResult = await supabase.auth.signUp({
          email,
          password,
          options: { data: { signup_role: "teacher", academy_name: academyName, display_name: teacherName } },
        });
        if (signUpResult.error) throw signUpResult.error;
        if (!signUpResult.data.session) {
          setMessage("가입 확인 메일을 보냈습니다. 메일 인증 후 로그인하면 계정 설정을 이어갈 수 있습니다.");
          return;
        }
        accessToken = signUpResult.data.session.access_token;
      }

      const response = await fetch("/api/onboarding/teacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ academyName, teacherName }),
      });
      const payload = (await response.json()) as { redirectTo?: string; error?: string };
      if (!response.ok || !payload.redirectTo) {
        throw new Error(payload.error ?? "선생님 계정 설정을 완료하지 못했습니다.");
      }
      router.push(payload.redirectTo);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "선생님 가입을 완료하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-app px-6 py-10">
      <Link href="/onboarding" className="text-caption text-text-secondary underline">가입 방식 선택으로 돌아가기</Link>
      <div className="mt-8 rounded-card bg-surface-card p-5">
        <p className="text-display">선생님 계정 만들기</p>
        <p className="mt-2 text-body text-text-secondary">학원을 만들고 기본 반과 초대 링크를 자동으로 준비합니다.</p>
        {configError && <p className="mt-4 text-caption text-text-secondary">`.env.local` 값이 비어 있어 현재는 데모 모드입니다.</p>}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block text-caption text-text-secondary">학원 이름
            <input required value={academyName} onChange={(event) => setAcademyName(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
          </label>
          <label className="block text-caption text-text-secondary">선생님 이름
            <input required value={teacherName} onChange={(event) => setTeacherName(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
          </label>
          <label className="block text-caption text-text-secondary">이메일
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
          </label>
          <label className="block text-caption text-text-secondary">비밀번호
            <input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
          </label>
          {message && <p className="text-caption text-text-secondary">{message}</p>}
          <button disabled={submitting} className="w-full rounded-xl bg-brand-amber py-3 text-body font-bold text-surface-page disabled:opacity-60">
            {submitting ? "가입 처리 중..." : "선생님 계정 만들기"}
          </button>
        </form>
      </div>
    </main>
  );
}
