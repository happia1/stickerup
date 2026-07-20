import Link from "next/link";
import { SupabaseModeNotice } from "@/components/supabase/SupabaseModeNotice";

export default function Home() {
  return (
    <main className="max-w-app mx-auto min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="w-full text-left"><SupabaseModeNotice /></div>
      <div>
        <p className="text-display">StickerUp</p>
        <p className="text-body text-text-secondary mt-2">
          학원 출석 · 숙제 · 칭찬 스티커 랭킹 앱
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        <Link
          href="/auth"
          className="w-full py-3.5 rounded-xl bg-surface-card text-text-primary font-bold text-center"
        >
          로그인 / 회원가입
        </Link>
        <Link
          href="/student/home"
          className="w-full py-3.5 rounded-xl bg-brand-amber text-white font-bold text-center"
        >
          학생 앱으로 들어가기
        </Link>
        <Link
          href="/admin/dashboard"
          className="w-full py-3.5 rounded-xl bg-surface-card border border-border text-text-primary font-bold text-center"
        >
          선생님 앱으로 들어가기
        </Link>
        <Link
          href="/onboarding"
          className="text-caption text-text-muted underline mt-2"
        >
          온보딩 화면 미리보기
        </Link>
      </div>
    </main>
  );
}
