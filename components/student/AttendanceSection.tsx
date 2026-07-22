"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { approvedClassesForStudent, getClassById } from "@/lib/store/selectors";
import { ATTENDANCE_TIERS } from "@/lib/types";
import type { AttendanceTier } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { useToast } from "@/lib/toast/provider";
import clsx from "@/lib/clsx";
import { submitStudentAction } from "@/lib/student-action-client";
import { koreaDateKey } from "@/lib/korea-date";
import { usePreferredClass } from "@/lib/preferred-class";

const DEMO_SCENARIOS: { tier: AttendanceTier; label: string }[] = [
  { tier: "on_time", label: "정시 이전" },
  { tier: "within_10", label: "10분 이내" },
  { tier: "within_30", label: "30분 이내" },
  { tier: "within_60", label: "1시간 이내" },
  { tier: "over_60", label: "1시간 초과" },
];

function formatAttendanceTime(value: string): string {
  return value.slice(0, 5);
}

export function AttendanceSection() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const myClasses = approvedClassesForStudent(state, state.currentUserId);
  const [classId, setClassId] = usePreferredClass(state.currentUserId, myClasses);
  const [scenario, setScenario] = useState<AttendanceTier>("on_time");
  const [submitting, setSubmitting] = useState(false);

  const selectedClass = getClassById(state, classId);
  const checkedEntry = state.ledger.find((entry) => entry.student_id === state.currentUserId && entry.class_id === classId && entry.source_type === "attendance" && entry.status === "active" && koreaDateKey(entry.created_at) === koreaDateKey());
  const checkedToday = Boolean(checkedEntry);

  return (
    <div>
      <Card>
        <div className="mb-3 flex min-w-0 items-center gap-2"><h3 className="shrink-0 text-subtitle">출석 체크</h3><p className="min-w-0 truncate text-micro text-text-secondary">오늘 출석한 시간을 입력해 주세요.</p></div>
        <label className="block text-caption font-semibold text-text-secondary mb-1">체크할 반 선택</label>
        <select
          className="w-full border border-border rounded-lg px-2.5 py-2 text-body mb-3"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          {myClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (정규 {formatAttendanceTime(c.attendance_time)})
            </option>
          ))}
        </select>
        {checkedToday ? <div className="rounded-xl bg-state-successBg p-5 text-center"><p className="text-subtitle text-state-success">오늘 출석 체크 완료</p><p className="mt-1 text-body text-text-primary">스티커 {checkedEntry?.count ?? 0}장이 지급됐어요.</p></div> : <><div className="grid grid-cols-3 gap-2 mb-3.5">
          {DEMO_SCENARIOS.map((s) => (
            <button
              key={s.tier}
              type="button"
              onClick={() => setScenario(s.tier)}
              className={clsx(
                "border rounded-lg px-1 py-2 text-caption text-center",
                scenario === s.tier ? "border-brand-amber bg-state-warningBg text-brand-amber font-bold" : "border-border"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <Button
          fullWidth
          disabled={!classId || submitting}
          onClick={async () => {
            try { setSubmitting(true); await submitStudentAction({ action: "attendance", classId, tier: scenario }); dispatch({ type: "CHECK_IN", studentId: state.currentUserId, classId, tier: scenario }); const tierDef = ATTENDANCE_TIERS.find((t) => t.tier === scenario); showToast(`${selectedClass?.name} 출석 완료 — ${tierDef?.label}, ${tierDef?.count}장 지급!`); }
            catch (error) { showToast(error instanceof Error ? error.message : "출석을 저장하지 못했습니다."); }
            finally { setSubmitting(false); }
          }}
        >
          체크하기
        </Button>
        </>}
      </Card>

      <Card>
        <Accordion label="출석 기준 안내">
          {ATTENDANCE_TIERS.map((t) => (
            <p key={t.tier} className="text-caption text-text-secondary mb-1">
              {t.label} → <b>{t.count}장</b>
            </p>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}
