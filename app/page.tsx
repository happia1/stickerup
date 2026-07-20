import { SupabaseModeNotice } from "@/components/supabase/SupabaseModeNotice";
import { LoginForm } from "@/components/auth/LoginForm";

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
      <div className="w-full rounded-card bg-surface-card p-5 text-left">
        <p className="text-display">로그인</p>
        <LoginForm />
      </div>
    </main>
  );
}
