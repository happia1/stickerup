"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Tag, User } from "lucide-react";
import clsx from "@/lib/clsx";

const TABS = [
  { href: "/student/home", Icon: Home, label: "홈" },
  { href: "/student/sticker", Icon: Tag, label: "스티커" },
  { href: "/student/mypage", Icon: User, label: "마이" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <div className="flex bg-surface-card border-t border-border">
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        const Icon = tab.Icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-caption",
              active ? "text-brand-amber font-bold" : "text-text-muted"
            )}
          >
            <Icon size={19} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
