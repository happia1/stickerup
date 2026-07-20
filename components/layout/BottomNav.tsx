"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "@/lib/clsx";

const TABS = [
  { href: "/student/home", label: "홈" },
  { href: "/student/sticker", label: "스티커" },
  { href: "/student/mypage", label: "마이" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="flex h-14 bg-surface-page">
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "flex-1 flex items-center justify-center text-caption leading-none text-center",
              active ? "text-brand-amber font-bold" : "text-text-muted"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
