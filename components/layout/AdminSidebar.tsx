"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "@/lib/clsx";

const NAV = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/notices", label: "공지사항 게시판" },
  { href: "/admin/policy", label: "스티커 정책 설정" },
  { href: "/admin/classes", label: "반 관리" },
  { href: "/admin/students", label: "학생 관리" },
  { href: "/admin/approvals", label: "승인함" },
  { href: "/admin/logs", label: "스티커 로그 · 감사" },
  { href: "/admin/ranking-settings", label: "랭킹 노출 설정" },
  { href: "/admin/rewards", label: "이벤트/상품 관리" },
  { href: "/admin/org", label: "조직 관리" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 z-30 w-full flex-shrink-0 border-b border-border bg-surface-raised text-text-secondary md:h-screen md:w-[180px] md:border-b-0 md:border-r lg:w-[210px]">
      <div className="hidden px-4 pb-3 pt-5 text-body font-extrabold text-text-primary md:block">🛠 관리자</div>
      <nav aria-label="관리자 메뉴" className="scrollbar-none flex gap-1 overflow-x-auto px-3 py-2 md:block md:overflow-y-auto md:px-3 md:py-0">
      {NAV.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-caption md:mb-0.5 md:block md:w-full md:py-2.5 md:text-body",
              active ? "bg-surface-card text-text-primary font-bold" : "text-text-secondary"
            )}
          >
            {item.label}
          </Link>
        );
      })}
      </nav>
    </aside>
  );
}
