"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfigError } from "@/lib/supabase/config";

interface InvitePreview {
  academyName: string;
  teacherName: string;
}

export default function JoinInvitePage({ params }: { params: { inviteCode: string } }) {
  const router = useRouter();
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const configError = getSupabaseBrowserConfigError();

  useEffect(() => {
    let active = true;
    async function loadInvite() {
      try {
        const response = await fetch(`/api/invites/${encodeURIComponent(params.inviteCode)}`);
        const payload = (await response.json()) as { invite?: InvitePreview; error?: string };
        if (!response.ok || !payload.invite) throw new Error(payload.error ?? "초대 링크를 확인하지 못했습니다.");
        if (active) setInvite(payload.invite);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "유효하지 않은 초대 링크입니다.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadInvite();
    return () => {
      active = false;
    };
  }, [params.inviteCode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase 환경변수를 설정하면 학생 가입을 진행할 수 있습니다. 현재는 데모 모드입니다.");
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
          options: { data: { signup_role: "student", invite_code: params.inviteCode, display_name: studentName } },
        });
        if (signUpResult.error) throw signUpResult.error;
        if (!signUpResult.data.session) {
          setMessage("가입 확인 메일을 보냈습니다. 메일 인증 후 로그인하면 가입을 이어갈 수 있습니다.");
          return;
        }
        accessToken = signUpResult.data.session.access_token;
      }

      const response = await fetch("/api/onboarding/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ inviteCode: params.inviteCode, studentName, age: Number(age) }),
      });
      const payload = (await response.json()) as { redirectTo?: string; error?: string };
      if (!response.ok || !payload.redirectTo) {
        throw new Error(payload.error ?? "학생 가입을 완료하지 못했습니다.");
      }
      router.push(payload.redirectTo);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "학생 가입을 완료하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className="mx-auto flex min-h-screen max-w-app items-center justify-center px-6 text-body text-text-secondary">초대 링크를 확인하고 있습니다.</main>;
  }

  if (!invite) {
    return (
      <main className="mx-auto flex min-h-screen max-w-app flex-col justify-center px-6 text-center">
        <p className="text-display">유효하지 않은 초대 링크입니다.</p>
        <p className="mt-3 text-body text-text-secondary">링크가 만료되었거나 더 이상 사용할 수 없습니다. 선생님에게 새 초대 링크를 요청해주세요.</p>
        {message && <p className="mt-3 text-caption text-text-muted">{message}</p>}
        <Link href="/onboarding/student" className="mt-7 text-caption text-text-secondary underline">학생 가입 안내로 이동</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-app px-6 py-10">
      <div className="rounded-card bg-surface-card p-5">
        <p className="text-display">학생 계정 만들기</p>
        <p className="mt-3 text-body text-text-secondary">{invite.academyName} · {invite.teacherName} 선생님 초대</p>
        {configError && <p className="mt-4 text-caption text-text-secondary">`.env.local` 값이 비어 있어 현재는 데모 모드입니다.</p>}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block text-caption text-text-secondary">학생 이름
            <input required value={studentName} onChange={(event) => setStudentName(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
          </label>
          <label className="block text-caption text-text-secondary">나이
            <input required min="1" max="100" type="number" value={age} onChange={(event) => setAge(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
          </label>
          <label className="block text-caption text-text-secondary">이메일
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
          </label>
          <label className="block text-caption text-text-secondary">비밀번호
            <input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
          </label>
          {message && <p className="text-caption text-text-secondary">{message}</p>}
          <button disabled={submitting} className="w-full rounded-xl bg-brand-amber py-3 text-body font-bold text-surface-page disabled:opacity-60">
            {submitting ? "가입 처리 중..." : "학생 계정 만들기"}
          </button>
        </form>
      </div>
    </main>
  );
}
