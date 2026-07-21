"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRememberLoginPreference, getSupabaseBrowserClient, setRememberLoginPreference } from "@/lib/supabase/client";
import { getSupabaseBrowserConfigError } from "@/lib/supabase/config";
import { getAuthEmailForIdentifier } from "@/lib/auth/identifier";

type ProfileRole = "student" | "owner" | "assistant";
type LoginAccountType = "student" | "teacher";

export function LoginForm({ initialAccountType = null, redirectTo }: { initialAccountType?: LoginAccountType | null; redirectTo?: string } = {}) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [accountType, setAccountType] = useState<LoginAccountType | null>(initialAccountType);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [resumeSignupHref, setResumeSignupHref] = useState("/signup?resume=1");
  const [submitting, setSubmitting] = useState(false);
  const configError = getSupabaseBrowserConfigError();

  useEffect(() => {
    setRememberLogin(getRememberLoginPreference());

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    async function redirectIfAlreadySignedIn(client: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>) {
      const { data } = await client.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) return;

      try {
        const profileResponse = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });
        const profile = (await profileResponse.json()) as { role?: ProfileRole; onboarded?: boolean };
        if (!active || !profile.onboarded || !profile.role) return;
        router.replace(profile.role === "student" ? "/student/home" : redirectTo ?? "/admin/dashboard");
      } catch {
        // 로그인 화면은 그대로 유지한다. 수동 로그인 시 상세 오류를 표시한다.
      }
    }

    void redirectIfAlreadySignedIn(supabase);
    return () => {
      active = false;
    };
  }, [router, redirectTo]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accountType) {
      setMessage("학생 또는 선생님을 먼저 선택해 주세요.");
      return;
    }
    if (password.length < 6) {
      setMessage("비밀번호는 최소 6자 이상 입력해 주세요.");
      return;
    }
    setRememberLoginPreference(rememberLogin);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase 환경변수를 설정한 뒤 다시 시도해 주세요.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const signInResult = await supabase.auth.signInWithPassword({
        email: getAuthEmailForIdentifier(identifier),
        password,
      });
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

      const actualType: LoginAccountType = profile.role === "student" ? "student" : "teacher";
      if (actualType !== accountType) {
        await supabase.auth.signOut();
        setMessage(accountType === "student" ? "선생님 계정입니다. 선생님을 선택해 주세요." : "학생 계정입니다. 학생을 선택해 주세요.");
        return;
      }

      router.push(profile.role === "student" ? "/student/home" : redirectTo ?? "/admin/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로그인을 완료하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {configError && <p className="mt-4 text-caption text-text-secondary">Supabase 환경변수를 설정한 뒤 로그인해 주세요.</p>}
      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <fieldset>
          <legend className="mb-2 text-caption text-text-secondary">로그인 유형</legend>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={()=>{setAccountType("student");setMessage(null);}} className={`rounded-xl border px-3 py-3 text-body font-bold ${accountType==="student"?"border-brand-amber bg-brand-amber text-surface-page":"border-border bg-surface-raised text-text-secondary"}`}>학생</button>
            <button type="button" onClick={()=>{setAccountType("teacher");setMessage(null);}} className={`rounded-xl border px-3 py-3 text-body font-bold ${accountType==="teacher"?"border-brand-amber bg-brand-amber text-surface-page":"border-border bg-surface-raised text-text-secondary"}`}>선생님</button>
          </div>
        </fieldset>
        <label className="block text-caption text-text-secondary">한글 아이디 또는 이메일
          <input required type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
        </label>
        <label className="block text-caption text-text-secondary">비밀번호
          <div className="relative mt-1">
            <input required minLength={6} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl bg-surface-raised py-2.5 pl-3 pr-11 text-text-primary outline-none" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-text-secondary">
              <PasswordVisibilityIcon hidden={!showPassword} />
            </button>
          </div>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-caption text-text-secondary">
          <input type="checkbox" checked={rememberLogin} onChange={(event) => setRememberLogin(event.target.checked)} className="h-4 w-4 accent-brand-amber" />
          자동 로그인
        </label>
        {message && <p className="text-caption text-text-secondary">{message}</p>}
        <button disabled={submitting} className="w-full rounded-xl bg-brand-amber py-3 text-body font-bold text-surface-page disabled:opacity-60">
          {submitting ? "로그인 중..." : "로그인"}
        </button>
      </form>
      {!message?.startsWith("가입 정보") && <Link href="/signup" className="mt-4 block text-center text-caption text-text-secondary">아직 계정이 없나요? 회원가입</Link>}
      {message?.startsWith("가입 정보") && <Link href={resumeSignupHref} className="mt-4 block text-center text-caption text-brand-amber">회원가입 정보 이어서 입력하기</Link>}
      <div className="mt-4 border-t border-border pt-4 text-center"><Link href="/developer/login" className="text-caption text-text-muted">개발자 로그인</Link></div>
    </>
  );
}

function PasswordVisibilityIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden && <path d="M4 4 20 20" />}
    </svg>
  );
}
