"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfigError } from "@/lib/supabase/config";

type AuthMode = "sign-in" | "sign-up";
type SignupRole = "student" | "teacher";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [role, setRole] = useState<SignupRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const configError = getSupabaseBrowserConfigError();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage(".env.local에 Supabase URL과 anon key를 입력하면 로그인 기능이 연결됩니다. 현재는 데모 모드입니다.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      if (mode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { signup_role: role } },
        });
        if (error) throw error;

        if (data.session) {
          router.push("/onboarding");
        } else {
          setMessage("가입 확인 메일을 보냈습니다. 메일 인증 후 다시 로그인해 온보딩을 완료해 주세요.");
        }
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const response = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const profile = (await response.json()) as { role?: SignupRole; onboarded?: boolean };
      if (!response.ok || !profile.onboarded) {
        router.push("/onboarding");
        return;
      }
      router.push(profile.role === "teacher" ? "/admin/dashboard" : "/student/home");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "인증을 완료하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-app mx-auto min-h-screen px-6 py-10">
      <Link href="/" className="text-caption text-text-secondary underline">StickerUp 데모로 돌아가기</Link>
      <div className="mt-8 rounded-card bg-surface-card p-5">
        <p className="text-display">{mode === "sign-in" ? "로그인" : "회원가입"}</p>
        <p className="mt-2 text-body text-text-secondary">
          {mode === "sign-in" ? "계정 유형에 맞는 화면으로 이동합니다." : "선생님 또는 학생 계정을 선택해 가입을 시작하세요."}
        </p>

        {configError && (
          <div className="mt-4 rounded-xl bg-surface-raised p-3 text-caption text-text-secondary">
            <p>Supabase 환경변수가 아직 설정되지 않았습니다.</p>
            <p className="mt-1">`.env.local`에 URL과 anon key를 입력한 뒤 개발 서버를 다시 시작해 주세요.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          {mode === "sign-up" && (
            <div className="grid grid-cols-2 gap-2">
              {(["student", "teacher"] as SignupRole[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`rounded-xl px-3 py-2 text-body font-semibold ${role === option ? "bg-brand-amber text-surface-page" : "bg-surface-raised text-text-secondary"}`}
                >
                  {option === "student" ? "학생" : "선생님"}
                </button>
              ))}
            </div>
          )}
          <label className="block text-caption text-text-secondary">
            이메일
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none"
            />
          </label>
          <label className="block text-caption text-text-secondary">
            비밀번호
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none"
            />
          </label>
          {message && <p className="text-caption text-text-secondary">{message}</p>}
          <button disabled={submitting} className="w-full rounded-xl bg-brand-amber py-3 text-body font-bold text-surface-page disabled:opacity-60">
            {submitting ? "처리 중..." : mode === "sign-in" ? "로그인" : "가입하고 온보딩 시작"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
            setMessage(null);
          }}
          className="mt-4 w-full text-caption text-text-secondary underline"
        >
          {mode === "sign-in" ? "계정이 없나요? 회원가입" : "이미 계정이 있나요? 로그인"}
        </button>
      </div>
    </main>
  );
}
