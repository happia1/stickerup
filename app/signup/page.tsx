"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfigError } from "@/lib/supabase/config";
import { getAuthEmailForIdentifier, isUsernameLoginIdentifier, normalizeLoginIdentifier } from "@/lib/auth/identifier";

type SignupType = "student" | "teacher";

interface InvitePreview {
  academyName: string;
  teacherName: string;
  inviteeRole: "student" | "teacher";
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="mx-auto flex min-h-screen max-w-app items-center justify-center px-6 text-body text-text-secondary">회원가입 화면을 준비하고 있습니다.</main>}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("invite")?.trim() || null;
  const typeParam = searchParams.get("type");
  const [signupType, setSignupType] = useState<SignupType>(typeParam === "teacher" ? "teacher" : "student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(Boolean(inviteCode));
  const [existingSession, setExistingSession] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const configError = getSupabaseBrowserConfigError();

  useEffect(() => {
    if (typeParam === "student" || typeParam === "teacher") setSignupType(typeParam);
  }, [typeParam]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;
    if (inviteCode) {
      setExistingSession(false);
      setIdentifier("");
      setPassword("");
      void supabase.auth.signOut({ scope: "local" });
      return () => {
        active = false;
      };
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (!active || !data.session) return;
      const metadata = data.session.user.user_metadata;
      setExistingSession(true);
      setIdentifier(
        typeof metadata.login_identifier === "string"
          ? metadata.login_identifier
          : data.session.user.email ?? ""
      );
      if (metadata.signup_role === "student" || metadata.signup_role === "teacher") setSignupType(metadata.signup_role);
      if (typeof metadata.display_name === "string") setName(metadata.display_name);
      if (typeof metadata.academy_name === "string") setAcademyName(metadata.academy_name);
      if (typeof metadata.age === "number") setAge(String(metadata.age));
    });
    return () => {
      active = false;
    };
  }, [inviteCode]);

  useEffect(() => {
    if (!inviteCode) {
      setLoadingInvite(false);
      return;
    }

    let active = true;
    setLoadingInvite(true);
    void fetch(`/api/invites/${encodeURIComponent(inviteCode)}`)
      .then(async (response) => {
        const payload = (await response.json()) as { invite?: InvitePreview; error?: string };
        if (!response.ok || !payload.invite) throw new Error(payload.error ?? "초대 링크를 확인하지 못했습니다.");
        if (active) {
          setInvite(payload.invite);
          setSignupType(payload.invite.inviteeRole);
          setAcademyName(payload.invite.academyName);
        }
      })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : "유효하지 않은 초대 링크입니다.");
      })
      .finally(() => {
        if (active) setLoadingInvite(false);
      });

    return () => {
      active = false;
    };
  }, [inviteCode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase 환경변수를 설정한 뒤 다시 시도해 주세요.");
      return;
    }
    if (signupType === "student" && (!Number.isInteger(Number(age)) || Number(age) < 1 || Number(age) > 100)) {
      setMessage("학생 나이는 1부터 100 사이로 입력해 주세요.");
      return;
    }
    if (!existingSession && password.length < 6) {
      setMessage("비밀번호는 최소 6자 이상 입력해 주세요.");
      return;
    }
    if (inviteCode && !invite) {
      setMessage("유효한 초대 링크를 확인한 뒤 가입해 주세요.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const normalizedIdentifier = normalizeLoginIdentifier(identifier);
      const isUsernameSignup = isUsernameLoginIdentifier(normalizedIdentifier);
      const authEmail = getAuthEmailForIdentifier(normalizedIdentifier);
      const sessionResult = await supabase.auth.getSession();
      let accessToken = sessionResult.data.session?.access_token;
      if (!accessToken && !isUsernameSignup) {
        const adminStatusResponse = await fetch("/api/auth/admin-status", { cache: "no-store" });
        const adminStatus = (await adminStatusResponse.json()) as { error?: string };
        if (!adminStatusResponse.ok) throw new Error(adminStatus.error ?? "Supabase 관리자 연결을 확인하지 못했습니다.");
        const signUpResult = await supabase.auth.signUp({
          email: authEmail,
          password,
          options: {
            data: {
              signup_role: signupType,
              display_name: name,
              academy_name: academyName,
              age: signupType === "student" ? Number(age) : null,
              invite_code: inviteCode,
              login_identifier: normalizedIdentifier,
            },
          },
        });
        if (signUpResult.error) throw signUpResult.error;
        if (!signUpResult.data.session) {
          setMessage("가입 확인 메일을 보냈습니다. 메일 인증 후 로그인하면 회원가입 정보를 이어서 입력할 수 있습니다.");
          return;
        }
        accessToken = signUpResult.data.session.access_token;
      }

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: accessToken ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        } : { "Content-Type": "application/json" },
        body: JSON.stringify({
          signupType,
          name,
          age: signupType === "student" ? Number(age) : null,
          academyName,
          inviteCode,
          identifier: isUsernameSignup ? normalizedIdentifier : undefined,
          password: isUsernameSignup ? password : undefined,
        }),
      });
      const payload = (await response.json()) as { redirectTo?: string; enrollmentStatus?: "approved" | "pending"; error?: string };
      if (!response.ok || !payload.redirectTo) throw new Error(payload.error ?? "회원가입을 완료하지 못했습니다.");
      const redirectTo = payload.redirectTo;

      if (!accessToken && isUsernameSignup) {
        const signInResult = await supabase.auth.signInWithPassword({ email: authEmail, password });
        if (signInResult.error) throw signInResult.error;
      }

      if (payload.enrollmentStatus === "pending") {
        setMessage("회원가입이 완료되었습니다. 반 소속은 선생님의 승인 또는 반 신청이 필요할 수 있어요.");
        setRedirecting(true);
        window.setTimeout(() => router.push(redirectTo), 1200);
        return;
      }
      router.push(redirectTo);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "회원가입을 완료하지 못했습니다.";
      setMessage(
        errorMessage.includes("Password should be at least")
          ? "Supabase Auth 비밀번호는 최소 6자 이상이어야 합니다."
          : errorMessage.includes("Invalid path specified in request URL")
          ? "Supabase 가입 요청을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요."
          : errorMessage
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = !submitting && !redirecting && !loadingInvite && (!inviteCode || Boolean(invite));

  return (
    <main className="mx-auto min-h-screen max-w-app px-6 py-10">
      <Link href="/" className="text-caption text-text-secondary">&lt; 이전</Link>
      <div className="mt-8 rounded-card bg-surface-card p-5">
        <p className="text-display">회원가입</p>
        <p className="mt-2 text-body text-text-secondary">계정 유형과 기본 정보를 입력해 주세요.</p>
        {configError && <p className="mt-4 text-caption text-text-secondary">Supabase 환경변수를 설정한 뒤 회원가입을 진행해 주세요.</p>}
        {inviteCode && loadingInvite && <p className="mt-4 text-caption text-text-secondary">초대 링크를 확인하고 있습니다.</p>}
        {invite && <p className="mt-4 text-caption text-text-secondary">{invite.academyName} · {invite.teacherName} 선생님 초대</p>}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <fieldset>
            <legend className="text-caption text-text-secondary">가입 유형</legend>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <label className={`rounded-xl px-3 py-2.5 text-center text-caption font-bold ${signupType === "student" ? "bg-brand-amber text-surface-page" : "bg-surface-raised text-text-secondary"}`}>
                <input className="sr-only" type="radio" name="signupType" value="student" checked={signupType === "student"} onChange={() => setSignupType("student")} disabled={Boolean(inviteCode)} />
                학생
              </label>
              <label className={`rounded-xl px-3 py-2.5 text-center text-caption font-bold ${signupType === "teacher" ? "bg-brand-amber text-surface-page" : "bg-surface-raised text-text-secondary"}`}>
                <input className="sr-only" type="radio" name="signupType" value="teacher" checked={signupType === "teacher"} onChange={() => setSignupType("teacher")} disabled={Boolean(inviteCode)} />
                선생님
              </label>
            </div>
          </fieldset>
          <label className="block text-caption text-text-secondary">이름
            <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
          </label>
          {signupType === "student" && <label className="block text-caption text-text-secondary">나이
            <input required min="1" max="100" type="number" value={age} onChange={(event) => setAge(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
          </label>}
          <label className="block text-caption text-text-secondary">학원 이름
            <input required value={academyName} readOnly={Boolean(invite)} onChange={(event) => setAcademyName(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none read-only:cursor-not-allowed read-only:text-text-secondary" />
          </label>
          <label className="block text-caption text-text-secondary">내 한글 아이디 또는 이메일
            <input required={!existingSession} disabled={existingSession} type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="사용할 아이디를 직접 입력하세요" autoComplete="username" className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none disabled:opacity-60" />
          </label>
          <label className="block text-caption text-text-secondary">비밀번호
            <div className="relative mt-1">
              <input required={!existingSession} disabled={existingSession} minLength={6} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="최소 6자 이상 입력" className="w-full rounded-xl bg-surface-raised py-2.5 pl-3 pr-11 text-text-primary outline-none disabled:opacity-60" />
              <button type="button" disabled={existingSession} onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-text-secondary disabled:opacity-60">
                <PasswordVisibilityIcon hidden={!showPassword} />
              </button>
            </div>
          </label>
          {existingSession && <p className="text-caption text-text-secondary">인증된 계정입니다. 가입 정보를 확인한 뒤 완료해 주세요.</p>}
          {message && <p className="text-caption text-text-secondary">{message}</p>}
          <button disabled={!canSubmit} className="w-full rounded-xl bg-brand-amber py-3 text-body font-bold text-surface-page disabled:opacity-60">
            {redirecting ? "이동 중..." : submitting ? "가입 처리 중..." : "회원가입"}
          </button>
        </form>
        <Link href="/login" className="mt-4 block text-center text-caption text-text-secondary">이미 계정이 있나요? 로그인</Link>
      </div>
    </main>
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
