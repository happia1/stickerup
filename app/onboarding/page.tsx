"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSupabaseBrowserConfigError } from "@/lib/supabase/config";

type OnboardingRole = "student" | "teacher";

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<OnboardingRole>("student");
  const [name, setName] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [classId, setClassId] = useState("");
  const [age, setAge] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const configError = getSupabaseBrowserConfigError();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase 환경변수가 비어 있어 온보딩을 저장할 수 없습니다. 데모 모드를 계속 이용할 수 있습니다.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      router.push("/auth");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          role,
          name,
          academyName,
          accessCode,
          classId: classId || undefined,
          age: age ? Number(age) : null,
        }),
      });
      const payload = (await response.json()) as { redirectTo?: string; error?: string };
      if (!response.ok || !payload.redirectTo) {
        throw new Error(payload.error ?? "온보딩을 완료하지 못했습니다.");
      }
      router.push(payload.redirectTo);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "온보딩을 완료하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-app mx-auto min-h-screen px-6 py-10">
      <Link href="/" className="text-caption text-text-secondary underline">StickerUp 데모로 돌아가기</Link>
      <div className="mt-8 rounded-card bg-surface-card p-5">
        <p className="text-display">계정 설정</p>
        <p className="mt-2 text-body text-text-secondary">역할과 소속 정보를 입력하면 계정을 연결합니다.</p>
        {configError && <p className="mt-4 text-caption text-text-secondary">`.env.local` 설정 전에는 데모 데이터로만 실행됩니다.</p>}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(["student", "teacher"] as OnboardingRole[]).map((option) => (
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
          <label className="block text-caption text-text-secondary">
            이름
            <input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
          </label>

          {role === "teacher" ? (
            <label className="block text-caption text-text-secondary">
              학원 이름
              <input required value={academyName} onChange={(event) => setAcademyName(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
            </label>
          ) : (
            <>
              <label className="block text-caption text-text-secondary">
                초대 링크 또는 학원 코드
                <input required value={accessCode} onChange={(event) => setAccessCode(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
              </label>
              <label className="block text-caption text-text-secondary">
                나이 (선택)
                <input min="1" max="120" type="number" value={age} onChange={(event) => setAge(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
              </label>
              <label className="block text-caption text-text-secondary">
                반 ID (선택)
                <input value={classId} onChange={(event) => setClassId(event.target.value)} className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-text-primary outline-none" />
                <span className="mt-1 block text-micro">반 선택 UI는 다음 단계에서 연결합니다. 입력하면 해당 반에 승인 대기 상태로 연결됩니다.</span>
              </label>
            </>
          )}

          {message && <p className="text-caption text-text-secondary">{message}</p>}
          <button disabled={submitting} className="w-full rounded-xl bg-brand-amber py-3 text-body font-bold text-surface-page disabled:opacity-60">
            {submitting ? "저장 중..." : "계정 설정 완료"}
          </button>
        </form>
      </div>
    </main>
  );
}
