"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/store/provider";
import { getTeacherById, pendingCounts } from "@/lib/store/selectors";
import { fmtDate } from "@/lib/format";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-3v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2-2 .1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H4v-3h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-2 .1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V4h3v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2 2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v3h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

function NotificationModal({open,title,onClose,children}:{open:boolean;title:string;onClose:()=>void;children:React.ReactNode}){if(!open)return null;return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" onClick={onClose}><div className="max-h-[75vh] w-full max-w-md overflow-y-auto rounded-card bg-surface-page p-5 shadow-xl" onClick={event=>event.stopPropagation()}><div className="mb-4 flex items-center justify-between"><h2 className="text-subtitle">{title}</h2><button aria-label="닫기" onClick={onClose} className="text-xl text-text-secondary">×</button></div>{children}</div></div>}

export function StudentTopBar() {
  const state = useAppState();
  const [notifOpen, setNotifOpen] = useState(false);

  const notifItems = [
    ...state.notices.map((notice) => ({ text: `새 공지: ${notice.title}`, date: notice.created_at })),
    ...state.classes
      .filter((cls) => !cls.is_default && cls.status === "active")
      .map((cls) => ({ text: `새 특강반이 개설됐어요: ${cls.name}`, date: cls.created_at })),
    ...state.praiseRequests
      .filter((p) => p.student_id === state.currentUserId && p.approval_status !== "pending")
      .map((p) => ({ text: `칭찬 스티커 요청이 ${p.approval_status === "approved" ? "승인" : "반려"}되었어요.`, date: p.requested_at })),
    ...state.ledger
      .filter((l) => l.student_id === state.currentUserId && l.status === "rolled_back")
      .map((l) => ({ text: `스티커 지급이 취소되었어요: ${l.rollback_reason ?? ""}`, date: l.rollback_at ?? l.created_at })),
  ].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  return (
    <div className="flex items-center justify-between bg-surface-page px-4 py-3">
      <span className="text-subtitle font-extrabold">StickerUp</span>
      <div className="flex items-center gap-3.5">
        <button aria-label="알림" className="text-text-primary" onClick={() => setNotifOpen(true)}><BellIcon /></button>
        <Link href="/student/settings" aria-label="설정" className="text-text-primary"><SettingsIcon /></Link>
      </div>
      <NotificationModal open={notifOpen} onClose={() => setNotifOpen(false)} title="알림">
        {notifItems.length === 0 ? <p className="py-8 text-center text-caption text-text-muted">새 알림이 없습니다.</p> : notifItems.map((item, idx) => (
          <div key={idx} className="mb-2 rounded-card border border-border bg-surface-card p-3">
            <p className="text-body">{item.text}</p>
            <p className="mt-1 text-caption text-text-muted">{fmtDate(item.date)}</p>
          </div>
        ))}
      </NotificationModal>
    </div>
  );
}

export function AdminTopBar() {
  const state = useAppState();
  const [notifOpen, setNotifOpen] = useState(false);
  const [remoteConnectionCount, setRemoteConnectionCount] = useState<number | null>(null);
  const counts = pendingCounts(state);
  const me = getTeacherById(state, state.currentUserId);
  const connectionCount = remoteConnectionCount ?? counts.enrollment;
  const totalPending = counts.praise + connectionCount;
  const notifItems = [
    { label: "칭찬 승인 대기", count: counts.praise, href: "/admin/approvals" },
    { label: "연결 대기중인 학생", count: connectionCount, href: "/admin/students" },
  ];

  useEffect(() => {
    let active = true;
    async function loadPendingConnections() {
      const client = getSupabaseBrowserClient();
      const { data } = await client!.auth.getSession();
      if (!data.session) return;
      const response = await fetch("/api/admin/students", { headers: { Authorization: `Bearer ${data.session.access_token}` } });
      if (!response.ok) return;
      const payload = await response.json() as { pendingConnectionCount?: number };
      if (active) setRemoteConnectionCount(payload.pendingConnectionCount ?? 0);
    }
    void loadPendingConnections();
    return () => { active = false; };
  }, [notifOpen]);

  return (
    <div className="flex items-center justify-between bg-surface-page px-6 py-3">
      <span className="text-subtitle font-extrabold">StickerUp Admin</span>
      <div className="flex items-center gap-4 text-caption text-text-secondary">
        <span>승인 대기 {totalPending}건</span>
        <span className="font-bold text-text-primary">{me?.name ?? "관리자"}</span>
        <button aria-label="관리자 알림" className="relative text-text-primary" onClick={() => setNotifOpen(true)}>
          <BellIcon />
          {totalPending > 0 && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-brand-amber" />}
        </button>
        <Link href="/admin/settings" aria-label="관리자 설정" className="text-text-primary"><SettingsIcon /></Link>
      </div>

      <NotificationModal open={notifOpen} onClose={() => setNotifOpen(false)} title="관리자 알림">
        {totalPending === 0 ? <p className="text-caption text-text-muted">확인할 승인 대기 항목이 없습니다.</p> : notifItems.map((item) => (
          <Link key={item.label} href={item.href} onClick={() => setNotifOpen(false)} className="mb-2 flex items-center justify-between rounded-card border border-border bg-surface-card p-3">
            <span className="text-body">{item.label}</span>
            <span className="text-body font-bold text-brand-amber">{item.count}건</span>
          </Link>
        ))}
      </NotificationModal>
    </div>
  );
}
