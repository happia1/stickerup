"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { approvedClassesForStudent, getClassById } from "@/lib/store/selectors";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { useToast } from "@/lib/toast/provider";
import clsx from "@/lib/clsx";

export function AttendanceSection() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const myClasses = approvedClassesForStudent(state, state.currentUserId);
  const [classId, setClassId] = useState(myClasses[0]?.id ?? "");
  const scenarios = state.attendancePolicy;
  const [scenario, setScenario] = useState<string>(scenarios[0]?.tier ?? "");

  const selectedClass = getClassById(state, classId);

  return (
    <div>
      <Card>
        <h3 className="text-subtitle mb-1">출석 체크</h3>
        <p className="text-caption text-text-secondary mb-3">
          반마다 정규 출석 인정 시각이 다르게 설정되어 있어요. 지급 기준은 모든 반 공통이에요.
        </p>
        <label className="block text-caption font-semibold text-text-secondary mb-1">체크할 반 선택</label>
        <select
          className="w-full border border-border rounded-lg px-2.5 py-2 text-body mb-3"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          {myClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} (정규 {c.attendance_time})
            </option>
          ))}
        </select>
        <label className="block text-caption font-semibold text-text-secondary mb-1">데모: 접속 시각 시나리오</label>
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          {scenarios.map((s) => (
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
          disabled={!classId}
          onClick={() => {
            dispatch({ type: "CHECK_IN", studentId: state.currentUserId, classId, tier: scenario });
            const tierDef = state.attendancePolicy.find((t) => t.tier === scenario);
            showToast(`${selectedClass?.name} 출석 완료 — ${tierDef?.label}, ${tierDef?.count}장 지급!`);
          }}
        >
          출석 체크 버튼 누르기
        </Button>
      </Card>

      <Card>
        <Accordion label="출석 기준 안내">
          {state.attendancePolicy.map((t) => (
            <p key={t.tier} className="text-caption text-text-secondary mb-1">
              {t.label} ({t.rangeText}) → <b>{t.count}장</b>
            </p>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}
