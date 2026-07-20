import Link from "next/link";

export default function StudentOnboardingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-app flex-col justify-center px-6 py-10 text-center">
      <p className="text-display">학생 가입</p>
      <p className="mt-3 text-body text-text-secondary">선생님에게 초대 링크를 받아 가입해주세요.</p>
      <p className="mt-2 text-caption text-text-muted">학원 코드 입력 기능은 다음 단계에서 추가될 예정입니다.</p>
      <Link href="/login" className="mt-8 rounded-xl bg-surface-card px-4 py-3.5 text-body font-bold text-text-primary">
        이미 계정이 있나요? 로그인
      </Link>
      <Link href="/onboarding" className="mt-5 text-caption text-text-secondary underline">가입 방식 선택으로 돌아가기</Link>
    </main>
  );
}
