import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

// Vercel에서 이 경로가 정적 오류 페이지로 잘못 고정되는 것을 막고
// 로그인 요청마다 App Router 페이지를 정상 렌더링한다.
export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }: { searchParams?: { type?: string | string[]; next?: string | string[]; reauth?: string | string[]; reason?: string | string[] } }) {
  const next = typeof searchParams?.next === "string" ? searchParams.next : undefined;
  const redirectTo = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;
  const accountType = searchParams?.type === "teacher" ? "teacher" : searchParams?.type === "student" ? "student" : null;
  const forceReauth = searchParams?.reauth === "1";
  return (
    <main className="mx-auto min-h-screen max-w-app px-6 py-10">
      <Link href="/" className="text-caption text-text-secondary">&lt; 이전</Link>
      <div className="mt-8 rounded-card bg-surface-card p-5">
        <p className="text-display">로그인</p>
        {searchParams?.reason==="session_expired"&&<p className="mt-2 text-caption text-text-secondary">로그인 정보가 만료되어 안전하게 로그아웃됐습니다. 다시 로그인해 주세요.</p>}
        <LoginForm initialAccountType={accountType} redirectTo={redirectTo} forceReauth={forceReauth} />
      </div>
      <p className="mt-5 text-center text-micro text-text-muted">
        Copyright © 2026 Jeongwon Kim. All rights reserved.
      </p>
    </main>
  );
}
