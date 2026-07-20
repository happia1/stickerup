import Link from "next/link";
import { Trophy, GraduationCap, Wrench } from "lucide-react";

export default function Home() {
  return (
    <main className="max-w-app mx-auto min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center">
      <div>
        <p className="text-display flex items-center justify-center gap-2">
          <Trophy size={28} className="text-brand-amber" />
          StickerUp
        </p>
        <p className="text-body text-text-secondary mt-2">
          학원 출석 · 숙제 · 칭찬 스티커 랭킹 앱 (데모 모드 · Supabase 연동 전)
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        <Link
          href="/student/home"
          className="w-full py-3.5 rounded-xl bg-brand-amber text-surface-page font-bold text-center flex items-center justify-center gap-1.5"
        >
          <GraduationCap size={18} />
          학생 앱으로 들어가기
        </Link>
        <Link
          href="/admin/dashboard"
          className="w-full py-3.5 rounded-xl bg-surface-card border border-border text-text-primary font-bold text-center flex items-center justify-center gap-1.5"
        >
          <Wrench size={18} />
          관리자 앱으로 들어가기
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
