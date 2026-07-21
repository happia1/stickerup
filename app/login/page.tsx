import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage({ searchParams }: { searchParams?: { type?: string; next?: string } }) {
  const redirectTo = searchParams?.next?.startsWith("/") && !searchParams.next.startsWith("//") ? searchParams.next : undefined;
  return (
    <main className="mx-auto min-h-screen max-w-app px-6 py-10">
      <Link href="/" className="text-caption text-text-secondary">&lt; 이전</Link>
      <div className="mt-8 rounded-card bg-surface-card p-5">
        <p className="text-display">로그인</p>
        <LoginForm initialAccountType={searchParams?.type === "teacher" ? "teacher" : null} redirectTo={redirectTo} />
      </div>
    </main>
  );
}
