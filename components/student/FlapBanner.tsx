"use client";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "@/lib/store/provider";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Pill } from "@/components/ui/Pill";
import { fmtDate } from "@/lib/format";

export function FlapBanner() {
  const state = useAppState();
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [open, setOpen] = useState(false);
  const notices = state.notices;

  useEffect(() => {
    if (notices.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % notices.length);
      setAnimKey((k) => k + 1);
    }, 3200);
    return () => clearInterval(timer);
  }, [notices.length]);

  const sorted = [...notices].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.created_at.localeCompare(a.created_at)
  );

  if (notices.length === 0) return null;

  return (
    <>
      <div
        role="button"
        onClick={() => setOpen(true)}
        className="bg-surface-raised text-black rounded-2xl px-3.5 py-3 mb-3.5 flex items-center gap-2 cursor-pointer"
      >
        <span className="bg-brand-amber text-black text-micro font-extrabold px-1.5 py-0.5 rounded-md flex-shrink-0">공지</span>
        <div className="flex-1 overflow-hidden h-4">
          <span key={animKey} className="animate-flap block text-body font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
            {notices[index % notices.length].title}
          </span>
        </div>
        <span className="opacity-70 text-caption flex-shrink-0">›</span>
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="공지사항">
        {sorted.map((n) => (
          <div key={n.id} className="bg-surface-card border border-border rounded-card p-3 mb-2">
            <div className="flex justify-between gap-2">
              <p className="text-body font-bold">{n.title}</p>
              {n.pinned && <Pill tone="wait">고정</Pill>}
            </div>
            <p className="text-caption text-text-muted my-1">{fmtDate(n.created_at)}</p>
            <p className="text-body leading-relaxed">{n.content}</p>
          </div>
        ))}
      </BottomSheet>
    </>
  );
}
