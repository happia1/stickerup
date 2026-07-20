"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";
import clsx from "@/lib/clsx";

const NAV = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/notices", label: "공지사항 게시판" },
  { href: "/admin/policy", label: "스티커 정책 설정" },
  { href: "/admin/classes", label: "반 관리" },
  { href: "/admin/students", label: "학생 관리" },
  { href: "/admin/approvals", label: "승인함" },
  { href: "/admin/logs", label: "스티커 로그" },
  { href: "/admin/ranking-settings", label: "랭킹 노출 설정" },
  { href: "/admin/rewards", label: "상품(리워드) 관리" },
  { href: "/admin/org", label: "조직 관리" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <div className="w-[210px] flex-shrink-0 bg-surface-raised text-text-secondary p-3">
      <div className="text-text-primary font-extrabold text-body px-2.5 py-2 mb-3 flex items-center gap-1.5">
        <Wrench size={16} />
        관리자
      </div>
      {NAV.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "block px-3 py-2.5 rounded-lg text-body mb-0.5",
              active ? "bg-surface-card text-text-primary font-bold" : "text-text-secondary"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
