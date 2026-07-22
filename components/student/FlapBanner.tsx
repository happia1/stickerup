"use client";
import { useEffect, useState } from "react";
import { useAppState } from "@/lib/store/provider";
import { Pill } from "@/components/ui/Pill";
import { fmtDate } from "@/lib/format";
import type { Notice } from "@/lib/types";

export function FlapBanner({ notices: noticesFromData }: { notices?: Notice[] }) {
  const state = useAppState();
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [open, setOpen] = useState(false);
  const notices = noticesFromData ?? state.notices;

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
        className="bg-surface-raised text-text-primary rounded-2xl px-3.5 py-3.5 mb-3.5 flex min-h-14 items-center gap-2 cursor-pointer"
      >
        <span className="bg-brand-amber text-surface-page text-micro font-extrabold px-1.5 py-0.5 rounded-md flex-shrink-0">공지</span>
        <div className="h-6 flex-1 overflow-hidden">
          <span key={animKey} className="animate-flap block overflow-hidden text-ellipsis whitespace-nowrap text-body font-semibold leading-6">
            {notices[index % notices.length].title}
          </span>
        </div>
        <span className="opacity-70 text-caption flex-shrink-0">›</span>
      </div>

      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="공지사항" onClick={() => setOpen(false)}>
        <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-card bg-surface-page p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-subtitle">공지사항</h2><button type="button" aria-label="닫기" className="text-xl text-text-secondary" onClick={() => setOpen(false)}>×</button></div>
          {sorted.map((n) => (
          <div key={n.id} className="bg-surface-card border border-border rounded-card p-3 mb-2">
            <div className="flex justify-between gap-2">
              <p className="text-body font-bold">{n.title}</p>
              {n.pinned && <Pill tone="wait">고정</Pill>}
            </div>
            <p className="text-caption text-text-muted my-1">{fmtDate(n.created_at)}</p>
            {n.image_url && <img src={n.image_url} alt={`${n.title} 첨부 이미지`} className="mb-3 aspect-square w-full rounded-xl bg-surface-raised object-cover" />}
            <p className="whitespace-pre-wrap break-words text-body leading-relaxed">{n.content}</p>
          </div>
          ))}
        </div>
      </div>}
    </>
  );
}
