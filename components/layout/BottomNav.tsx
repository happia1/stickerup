"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "@/lib/clsx";

const TABS = [
  { href: "/student/home", icon: "🏠", label: "홈" },
  { href: "/student/sticker", icon: "🏷️", label: "스티커" },
  { href: "/student/mypage", icon: "👤", label: "마이" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="flex bg-surface-card border-t border-border">
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-caption",
              active ? "text-brand-amber font-bold" : "text-text-muted"
            )}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
