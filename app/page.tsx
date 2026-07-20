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
          href="/login"
          className="w-full py-3.5 rounded-xl bg-brand-amber text-surface-page font-bold text-center"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="w-full py-3.5 rounded-xl bg-surface-card text-text-primary font-bold text-center"
        >
          회원가입
        </Link>
      </div>
    </main>
  );
}
