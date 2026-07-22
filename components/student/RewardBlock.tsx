"use client";

import { useMemo, useState } from "react";
import { useAppState } from "@/lib/store/provider";
import { campaignStatus } from "@/lib/store/selectors";
import { getRanking } from "@/lib/ranking";
import type { StudentHomeData } from "@/lib/data/student-home.types";
import type { AppState } from "@/lib/store/types";
import type { RewardCampaign } from "@/lib/types";

function title(campaign: RewardCampaign, state: AppState) {
  if (campaign.title?.trim()) return campaign.title;
  const className = campaign.class_id ? state.classes.find((item) => item.id === campaign.class_id)?.name : null;
  return className ? `${className} 랭킹 이벤트` : "전체 랭킹 이벤트";
}

export function RewardBlock({ data }: { data?: StudentHomeData }) {
  const mockState = useAppState();
  const state: AppState = useMemo(() => data ? {
    ...mockState,
    currentUserId: data.student.id,
    students: data.students,
    classes: data.classes,
    enrollments: data.enrollments,
    ledger: data.stickerLedger,
    rewardCampaigns: data.rewardCampaigns,
  } : mockState, [data, mockState]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const myClassIds = new Set(state.enrollments.filter((item) => item.student_id === state.currentUserId && item.status === "approved").map((item) => item.class_id));
  const events = state.rewardCampaigns
    .filter((campaign) => campaign.class_id === null || myClassIds.has(campaign.class_id))
    .sort((a, b) => b.period_end.localeCompare(a.period_end));

  return <section className="mb-3.5 rounded-card bg-surface-card p-4">
    <div className="mb-3"><h3 className="text-subtitle">이벤트 리스트</h3><p className="mt-1 text-caption text-text-secondary">진행 중인 이벤트와 종료된 랭킹 결과를 확인해요.</p></div>
    <div className="space-y-2">
      {events.map((campaign) => {
        const status = campaignStatus(campaign);
        const expanded = expandedId === campaign.id;
        const className = campaign.class_id ? state.classes.find((item) => item.id === campaign.class_id)?.name ?? "특강반" : "전체";
        const rows = status === "ended" ? getRanking({ ledger: state.ledger, enrollments: state.enrollments, studentIds: state.students.map((item) => item.id), classId: campaign.class_id, periodStart: campaign.period_start, periodEnd: campaign.period_end }) : [];
        return <article key={campaign.id} className="overflow-hidden rounded-xl border border-border bg-surface-page">
          <button type="button" onClick={() => setExpandedId(expanded ? null : campaign.id)} className="flex w-full items-center gap-2 p-3 text-left">
            <span className="min-w-0 flex-1"><span className="block truncate text-body font-bold">{title(campaign, state)}</span><span className="text-micro text-text-muted">{campaign.period_start} ~ {campaign.period_end} · {className}</span></span>
            <span className="shrink-0 text-micro text-text-secondary">{status === "ended" ? "종료" : status === "active" ? "진행중" : "예정"}</span>
            <span className={expanded ? "rotate-180" : ""}>⌄</span>
          </button>
          {expanded && <div className="border-t border-border p-3">
            {campaign.description && <p className="mb-3 whitespace-pre-wrap text-caption text-text-secondary">{campaign.description}</p>}
            {status === "ended" ? <div className="overflow-hidden rounded-lg border border-border"><table className="w-full text-body"><thead><tr className="border-b border-border text-left text-caption text-text-secondary"><th className="p-2">순위</th><th className="p-2">학생</th><th className="p-2 text-right">스티커</th></tr></thead><tbody>{rows.map((row)=><tr key={row.student_id} className="border-b border-border last:border-0"><td className="p-2 font-bold text-brand-amber">{row.rank}등</td><td className="p-2">{state.students.find((item)=>item.id===row.student_id)?.name??"-"}</td><td className="p-2 text-right">{row.total_count}장</td></tr>)}</tbody></table>{rows.length===0&&<p className="p-4 text-center text-caption text-text-muted">집계된 랭킹이 없어요.</p>}</div> : <p className="text-caption text-text-muted">이벤트가 끝나면 이곳에서 최종 순위를 확인할 수 있어요.</p>}
          </div>}
        </article>;
      })}
      {events.length === 0 && <p className="py-6 text-center text-caption text-text-muted">표시할 이벤트가 없어요.</p>}
    </div>
  </section>;
}
