"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "@/lib/clsx";

const TABS = [
  { href: "/student/home", label: "홈", icon: "home" },
  { href: "/student/sticker", label: "스티커", icon: "sticker" },
  { href: "/student/mypage", label: "마이", icon: "profile" },
];

function NavIcon({ name }: { name: string }) {
  if (name === "home") return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2"><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>;
  if (name === "sticker") return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2"><path d="M5 3h10l4 4v10a4 4 0 0 1-4 4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5"/><path d="m8 14 2 2 5-5"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>;
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 flex h-16 border-t border-border bg-surface-page/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "flex flex-1 flex-col items-center justify-center gap-1 text-micro leading-none text-center transition-colors",
              active ? "text-brand-amber font-bold" : "text-text-muted"
            )}
          >
            <NavIcon name={tab.icon} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
