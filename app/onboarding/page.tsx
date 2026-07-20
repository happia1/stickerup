import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-app flex-col justify-center px-6 py-10 text-center">
      <p className="text-display">StickerUp 시작하기</p>
      <p className="mt-3 text-body text-text-secondary">내 역할에 맞는 가입 방식을 선택해 주세요.</p>
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/onboarding/teacher" className="rounded-xl bg-brand-amber px-4 py-3.5 text-body font-bold text-surface-page">
          선생님으로 시작하기
        </Link>
        <Link href="/onboarding/student" className="rounded-xl bg-surface-card px-4 py-3.5 text-body font-bold text-text-primary">
          학생으로 시작하기
        </Link>
      </div>
      <Link href="/login" className="mt-5 text-caption text-text-secondary underline">
        이미 계정이 있나요? 로그인
      </Link>
    </main>
  );
}
