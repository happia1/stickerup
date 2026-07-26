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
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);
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

      {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="공지사항" onClick={() => { setOpen(false); setExpandedNoticeId(null); }}>
        <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-card bg-surface-page p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-subtitle">공지사항</h2><button type="button" aria-label="닫기" className="text-xl text-text-secondary" onClick={() => { setOpen(false); setExpandedNoticeId(null); }}>×</button></div>
          <div className="space-y-2">
            {sorted.map((notice) => {
              const expanded = expandedNoticeId === notice.id;
              return (
                <article key={notice.id} className="overflow-hidden rounded-card border border-border bg-surface-card">
                  <button type="button" aria-expanded={expanded} onClick={() => setExpandedNoticeId(expanded ? null : notice.id)} className="flex w-full items-center gap-3 p-3 text-left">
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2"><span className="truncate text-body font-bold">{notice.title}</span>{notice.pinned && <Pill tone="wait">고정</Pill>}</span>
                      <span className="mt-1 block text-caption text-text-muted">{fmtDate(notice.created_at)}</span>
                    </span>
                    <span aria-hidden="true" className={`shrink-0 text-caption text-text-secondary transition-transform ${expanded ? "rotate-180" : ""}`}>⌄</span>
                  </button>
                  {expanded && (
                    <div className="border-t border-border p-3">
                      {notice.image_url && <img src={notice.image_url} alt={`${notice.title} 첨부 이미지`} className="mb-3 aspect-square w-full rounded-xl bg-surface-raised object-cover" />}
                      <p className="whitespace-pre-wrap break-words text-body leading-relaxed">{notice.content}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>}
    </>
  );
}
