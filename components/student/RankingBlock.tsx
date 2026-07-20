"use client";
import { useState } from "react";
import { useAppState } from "@/lib/store/provider";
import {
  approvedClassesForStudent,
  defaultRankingScopeForStudent,
  rankingForScope,
  rankingPeriodLabel,
} from "@/lib/store/selectors";
import { getRanking } from "@/lib/ranking";
import { RANKING_UNIT_LABEL } from "@/lib/types";
import { Podium } from "@/components/ui/Podium";
import { ChipTabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import type { StudentHomeData } from "@/lib/data/student-home.types";
import type { AppState } from "@/lib/store/types";

const ALL_TIME_START = "2000-01-01";
const ALL_TIME_END = "2999-12-31";

export function RankingBlock({ data }: { data?: StudentHomeData }) {
  const mockState = useAppState();
  const state: AppState = data
    ? {
        ...mockState,
        currentUserId: data.student.id,
        students: data.students,
        classes: data.classes,
        enrollments: data.enrollments,
        ledger: data.stickerLedger,
        rankingPeriodConfigs: data.rankingPeriodConfigs,
      }
    : mockState;
  const studentId = state.currentUserId;
  const myClasses = approvedClassesForStudent(state, studentId).filter((c) => !c.is_default);
  const defaultScope = defaultRankingScopeForStudent(state, studentId);
  const [scope, setScope] = useState<string | null>(defaultScope);
  const [sheetOpen, setSheetOpen] = useState(false);

  const scopeOptions = [
    ...myClasses.map((c) => ({ value: c.id, label: c.name })),
    { value: "__all__", label: "전체" },
  ];

  const effectiveScope = scope === "__all__" ? null : scope;
  const rows = rankingForScope(state, effectiveScope);
  const period = rankingPeriodLabel(state, effectiveScope);

  return (
    <div className="bg-surface-card rounded-card p-4 mb-3.5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-subtitle">랭킹 TOP 5</h3>
        <Button variant="secondary" onClick={() => setSheetOpen(true)} className="!py-1.5 !px-2.5 !text-micro">
          전체보기
        </Button>
      </div>
      {scopeOptions.length > 1 && (
        <ChipTabs
          options={scopeOptions}
          value={scope === null ? "__all__" : scope}
          onChange={(v) => setScope(v === "__all__" ? "__all__" : v)}
        />
      )}
      <p className="text-micro text-text-muted mb-2">
        {RANKING_UNIT_LABEL[period.unit]} · {period.start} ~ {period.end}
      </p>
      <Podium rows={rows} students={state.students} highlightStudentId={studentId} maxRows={5} />

      <FullRankingSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        initialScope={effectiveScope}
        scopeOptions={scopeOptions}
        state={state}
      />
    </div>
  );
}

function FullRankingSheet({
  open,
  onClose,
  initialScope,
  scopeOptions,
  state,
}: {
  open: boolean;
  onClose: () => void;
  initialScope: string | null;
  scopeOptions: { value: string; label: string }[];
  state: AppState;
}) {
  const [scope, setScope] = useState<string | null>(initialScope);
  const [periodMode, setPeriodMode] = useState<"exposure" | "all" | "custom">("exposure");
  const [customStart, setCustomStart] = useState("2026-07-01");
  const [customEnd, setCustomEnd] = useState("2026-07-19");

  const effectiveScope = scope === "__all__" ? null : scope;
  const exposurePeriod = rankingPeriodLabel(state, effectiveScope);

  let start = exposurePeriod.start;
  let end = exposurePeriod.end;
  if (periodMode === "all") {
    start = ALL_TIME_START;
    end = ALL_TIME_END;
  } else if (periodMode === "custom") {
    start = customStart;
    end = customEnd;
  }

  const rows = getRanking({
    ledger: state.ledger,
    enrollments: state.enrollments,
    studentIds: state.students.map((s) => s.id),
    classId: effectiveScope,
    periodStart: start,
    periodEnd: end,
  });

  return (
    <BottomSheet open={open} onClose={onClose} title="전체 랭킹">
      <ChipTabs options={scopeOptions} value={scope === null ? "__all__" : (scope ?? "__all__")} onChange={(v) => setScope(v === "__all__" ? "__all__" : v)} />
      <ChipTabs
        options={[
          { value: "exposure", label: "기본 노출기간" },
          { value: "all", label: "전체 기간" },
          { value: "custom", label: "직접 지정" },
        ]}
        value={periodMode}
        onChange={(v) => setPeriodMode(v as typeof periodMode)}
      />
      {periodMode === "custom" ? (
        <div className="flex gap-2 mb-3">
          <div className="flex-1">
            <label className="block text-caption text-text-secondary mb-1">시작일</label>
            <input type="date" className="w-full border border-border rounded-lg px-2 py-1.5 text-body" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="block text-caption text-text-secondary mb-1">종료일</label>
            <input type="date" className="w-full border border-border rounded-lg px-2 py-1.5 text-body" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </div>
        </div>
      ) : (
        <p className="text-caption text-text-muted mb-3">{periodMode === "all" ? "전체 기간 기준" : `${start} ~ ${end}`}</p>
      )}
      <Podium rows={rows} students={state.students} highlightStudentId={state.currentUserId} maxRows={rows.length} />
    </BottomSheet>
  );
}
