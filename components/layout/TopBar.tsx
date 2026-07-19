"use client";
import { useState } from "react";
import Link from "next/link";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { useAppState } from "@/lib/store/provider";
import { getTeacherById, pendingCounts } from "@/lib/store/selectors";
import { fmtDate } from "@/lib/format";

export function StudentTopBar() {
  const state = useAppState();
  const [notifOpen, setNotifOpen] = useState(false);

  const notifItems = [
    ...state.homeworkSubmissions
      .filter((h) => h.student_id === state.currentUserId && h.approval_status !== "pending")
      .map((h) => ({ text: `숙제 인증 요청이 ${h.approval_status === "approved" ? "승인" : "반려"}되었어요.`, date: h.submitted_at })),
    ...state.praiseRequests
      .filter((p) => p.student_id === state.currentUserId && p.approval_status !== "pending")
      .map((p) => ({ text: `칭찬 스티커 요청이 ${p.approval_status === "approved" ? "승인" : "반려"}되었어요.`, date: p.requested_at })),
    ...state.ledger
      .filter((l) => l.student_id === state.currentUserId && l.status === "rolled_back")
      .map((l) => ({ text: `스티커 지급이 취소(롤백)되었어요: ${l.rollback_reason ?? ""}`, date: l.rollback_at ?? l.created_at })),
  ].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  return (
    <div className="bg-surface-card border-b border-border px-4 py-3 flex items-center justify-between">
      <span className="font-extrabold text-subtitle">🏅 StickerUp</span>
      <div className="flex gap-3.5 items-center">
        <button aria-label="알림" className="text-lg" onClick={() => setNotifOpen(true)}>🔔</button>
        <Link href="/student/settings" aria-label="설정" className="text-lg">⚙️</Link>
      </div>

      <BottomSheet open={notifOpen} onClose={() => setNotifOpen(false)} title="알림">
        {notifItems.length === 0 ? (
          <p className="text-caption text-text-muted">새로운 알림이 없어요.</p>
        ) : (
          notifItems.map((item, idx) => (
            <div key={idx} className="bg-surface-card border border-border rounded-card p-3 mb-2">
              <p className="text-body">{item.text}</p>
              <p className="text-caption text-text-muted mt-1">{fmtDate(item.date)}</p>
            </div>
          ))
        )}
      </BottomSheet>
    </div>
  );
}

export function AdminTopBar() {
  const state = useAppState();
  const counts = pendingCounts(state);
  const me = getTeacherById(state, state.currentUserId);
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface-card">
      <span className="font-extrabold text-subtitle">🛠 StickerUp Admin</span>
      <div className="flex items-center gap-4 text-caption text-text-secondary">
        <span>승인 대기 {counts.homework + counts.praise + counts.enrollment}건</span>
        <span className="font-bold text-text-primary">{me?.name ?? "관리자"}</span>
      </div>
    </div>
  );
}
