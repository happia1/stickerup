import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-app flex-col justify-center px-6 py-10 text-center">
      <p className="text-display">계정 만들기</p>
      <p className="mt-3 text-body text-text-secondary">계정 유형에 맞는 가입 방식을 선택해 주세요.</p>
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/onboarding/teacher" className="rounded-xl bg-brand-amber px-4 py-3.5 text-body font-bold text-surface-page">
          선생님으로 가입
        </Link>
        <Link href="/onboarding/student" className="rounded-xl bg-surface-card px-4 py-3.5 text-body font-bold text-text-primary">
          학생으로 가입
        </Link>
      </div>
      <p className="mt-4 text-caption text-text-secondary">학생 계정은 선생님에게 받은 초대 링크가 있어야 만들 수 있습니다.</p>
      <Link href="/login" className="mt-5 text-caption text-text-secondary underline">
        이미 계정이 있나요? 로그인하기
      </Link>
    </main>
  );
}
