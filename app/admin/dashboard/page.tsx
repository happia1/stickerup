"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/store/provider";
import { pendingCounts, rankingPeriodLabel } from "@/lib/store/selectors";
import { getRanking } from "@/lib/ranking";
import { KpiCard } from "@/components/layout/KpiCard";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { DEMO_NOW } from "@/lib/demoClock";
import type { RankingRow } from "@/lib/types";

type RankingScope = {
  id: string;
  label: string;
  classId: string | null;
  periodStart: string;
  periodEnd: string;
  description: string;
};

const ALL_TIME_START = "2000-01-01";
const ALL_TIME_END = "2999-12-31";
const medalLabel = { gold: "금", silver: "은", bronze: "동" } as const;

export default function AdminDashboardPage() {
  const state = useAppState();
  const counts = pendingCounts(state);
  const cancelled = state.ledger.filter((l) => l.status === "rolled_back").length;
  const todayStr = DEMO_NOW.toISOString().slice(0, 10);
  const [scopeId, setScopeId] = useState("all-time");
  const [sheetOpen, setSheetOpen] = useState(false);

  const scopes = useMemo<RankingScope[]>(() => {
    const globalPeriod = rankingPeriodLabel(state, null);
    const groupScopes = state.classes
      .filter((c) => c.status === "active")
      .map((c) => {
        const period = rankingPeriodLabel(state, c.id);
        return {
          id: `class-${c.id}`,
          label: `${c.name} 랭킹`,
          classId: c.id,
          periodStart: period.start,
          periodEnd: period.end,
          description: `${period.start} ~ ${period.end}`,
        };
      });

    return [
      {
        id: "all-time",
        label: "전체 기간",
        classId: null,
        periodStart: ALL_TIME_START,
        periodEnd: ALL_TIME_END,
        description: "누적 전체 랭킹",
      },
      {
        id: "global-period",
        label: "전체 랭킹",
        classId: null,
        periodStart: globalPeriod.start,
        periodEnd: globalPeriod.end,
        description: `${globalPeriod.start} ~ ${globalPeriod.end}`,
      },
      ...groupScopes,
    ];
  }, [state]);

  const selectedScope = scopes.find((scope) => scope.id === scopeId) ?? scopes[0];
  const rows = getRanking({
    ledger: state.ledger,
    enrollments: state.enrollments,
    studentIds: state.students.map((s) => s.id),
    classId: selectedScope.classId,
    periodStart: selectedScope.periodStart,
    periodEnd: selectedScope.periodEnd,
  });
  const topRows = rows.slice(0, 5);

  return (
    <div>
      <h2 className="mb-1 text-title">대시보드</h2>
      <p className="mb-5 text-caption text-text-secondary">오늘({todayStr}) 운영 현황을 확인해요.</p>

      <div className="mb-6 grid grid-cols-4 gap-3">
        <KpiCard label="숙제 승인 대기" value={`${counts.homework}건`} />
        <KpiCard label="칭찬 승인 대기" value={`${counts.praise}건`} />
        <KpiCard label="반 승인 대기" value={`${counts.enrollment}건`} />
        <KpiCard label="누적 롤백" value={`${cancelled}건`} />
      </div>

      <section className="rounded-card bg-surface-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-subtitle">랭킹 TOP 5</p>
            <p className="text-caption text-text-secondary">{selectedScope.label} · {selectedScope.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/ranking-settings" className="rounded-xl bg-surface-raised px-3 py-2 text-caption text-text-primary">
              랭킹 노출 설정
            </Link>
            <Button variant="secondary" onClick={() => setSheetOpen(true)} className="!px-3 !py-2 !text-caption">
              전체 보기
            </Button>
          </div>
        </div>

        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {scopes.map((scope) => (
            <button
              key={scope.id}
              type="button"
              onClick={() => setScopeId(scope.id)}
              className={
                scope.id === selectedScope.id
                  ? "shrink-0 rounded-full bg-brand-amber px-3 py-2 text-caption font-bold text-surface-page"
                  : "shrink-0 rounded-full bg-surface-raised px-3 py-2 text-caption text-text-secondary"
              }
            >
              {scope.label}
            </button>
          ))}
        </div>

        <RankingTable rows={topRows} state={state} emptyText="아직 랭킹 데이터가 없습니다." />
      </section>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={`${selectedScope.label} 전체 리스트`}>
        <p className="mb-3 text-caption text-text-secondary">{selectedScope.description}</p>
        <RankingTable rows={rows} state={state} emptyText="표시할 학생 랭킹이 없습니다." />
      </BottomSheet>
    </div>
  );
}

function RankingTable({ rows, state, emptyText }: { rows: RankingRow[]; state: ReturnType<typeof useAppState>; emptyText: string }) {
  if (rows.length === 0) {
    return <p className="rounded-xl bg-surface-raised p-5 text-center text-caption text-text-secondary">{emptyText}</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl bg-surface-raised">
      <table className="w-full text-body">
        <thead>
          <tr className="border-b border-border text-left text-caption text-text-secondary">
            <th className="p-2.5">순위</th>
            <th className="p-2.5">이름</th>
            <th className="p-2.5">소속 반</th>
            <th className="p-2.5">스티커</th>
            <th className="p-2.5">메달</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const student = state.students.find((s) => s.id === row.student_id);
            const classNames = state.classes
              .filter((c) => state.enrollments.some((e) => e.student_id === row.student_id && e.class_id === c.id && e.status === "approved"))
              .map((c) => c.name)
              .join(", ");

            return (
              <tr key={row.student_id} className="border-b border-border last:border-0">
                <td className="p-2.5">{row.rank}</td>
                <td className="p-2.5">{student?.name ?? "-"}</td>
                <td className="p-2.5 text-text-secondary">{classNames || "-"}</td>
                <td className="p-2.5">{row.total_count}</td>
                <td className="p-2.5">{row.medal ? medalLabel[row.medal] : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
