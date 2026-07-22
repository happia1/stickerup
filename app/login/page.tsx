import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage({ searchParams }: { searchParams?: { type?: string | string[]; next?: string | string[]; reauth?: string | string[] } }) {
  const next = typeof searchParams?.next === "string" ? searchParams.next : undefined;
  const redirectTo = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;
  const accountType = searchParams?.type === "teacher" ? "teacher" : searchParams?.type === "student" ? "student" : null;
  const forceReauth = searchParams?.reauth === "1";
  return (
    <main className="mx-auto min-h-screen max-w-app px-6 py-10">
      <Link href="/" className="text-caption text-text-secondary">&lt; 이전</Link>
      <div className="mt-8 rounded-card bg-surface-card p-5">
        <p className="text-display">로그인</p>
        <LoginForm initialAccountType={accountType} redirectTo={redirectTo} forceReauth={forceReauth} />
      </div>
    </main>
  );
}
