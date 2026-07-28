"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminApprovalsPanel from "@/components/admin/AdminApprovalsPanel";
import AdminStickerLogsPanel from "@/components/admin/AdminStickerLogsPanel";
import { useAppLoading, useAppState } from "@/lib/store/provider";

type StickerTab = "approvals" | "history";

export default function AdminStickersPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const state = useAppState();
  const loading = useAppLoading();
  const router = useRouter();
  const teacher = state.teachers.find((item) => item.id === state.currentUserId);
  const canApprove = teacher?.role === "owner" || teacher?.permissions?.approvals !== false;
  const canAudit = teacher?.role === "owner" || teacher?.permissions?.sticker_audit === true;
  const requestedTab: StickerTab = searchParams?.tab === "history" ? "history" : "approvals";
  const [tab, setTab] = useState<StickerTab>(requestedTab);
  const pendingCount = state.attendanceRecords.filter((item) => item.approval_status === "pending").length
    + state.homeworkSubmissions.filter((item) => item.approval_status === "pending").length
    + state.praiseRequests.filter((item) => item.approval_status === "pending").length;

  useEffect(() => {
    if (loading) return;
    if (tab === "approvals" && !canApprove && canAudit) setTab("history");
    if (tab === "history" && !canAudit && canApprove) setTab("approvals");
  }, [canApprove, canAudit, loading, tab]);

  function changeTab(nextTab: StickerTab) {
    setTab(nextTab);
    router.replace(`/admin/stickers?tab=${nextTab}`, { scroll: false });
  }

  if (loading) return <div className="rounded-xl bg-surface-card p-8 text-center text-body text-text-secondary">스티커 관리 정보를 불러오는 중...</div>;

  return (
    <div>
      <h2 className="mb-1 text-title">스티커 관리</h2>
      <p className="mb-4 text-caption text-text-secondary">승인 대기 요청을 처리하고 완료된 지급·수정·반려 이력을 관리해요.</p>
      <div className={`mb-5 grid gap-2 rounded-xl bg-surface-raised p-1 ${canApprove && canAudit ? "grid-cols-2" : "grid-cols-1"}`}>
        {canApprove && <button type="button" onClick={() => changeTab("approvals")} className={tab === "approvals" ? "rounded-lg bg-surface-card px-3 py-2.5 text-body font-bold text-text-primary" : "rounded-lg px-3 py-2.5 text-body text-text-secondary"}>승인 대기{pendingCount > 0 && <span className="ml-1.5 rounded-full bg-brand-amber px-1.5 py-0.5 text-micro font-bold text-surface-page">{pendingCount}</span>}</button>}
        {canAudit && <button type="button" onClick={() => changeTab("history")} className={tab === "history" ? "rounded-lg bg-surface-card px-3 py-2.5 text-body font-bold text-text-primary" : "rounded-lg px-3 py-2.5 text-body text-text-secondary"}>처리 이력</button>}
      </div>
      {!canApprove && !canAudit ? <div className="rounded-xl border border-border p-8 text-center text-body text-text-secondary">스티커 관리 권한이 없습니다.</div> : tab === "approvals" && canApprove ? <AdminApprovalsPanel embedded /> : canAudit ? <AdminStickerLogsPanel embedded /> : null}
    </div>
  );
}
