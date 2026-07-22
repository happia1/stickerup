"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { approvedClassesForStudent } from "@/lib/store/selectors";
import type { HomeworkTier } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { fmtDate } from "@/lib/format";
import { useToast } from "@/lib/toast/provider";
import clsx from "@/lib/clsx";
import { submitStudentAction } from "@/lib/student-action-client";
import { koreaDateKey } from "@/lib/korea-date";
import { Accordion } from "@/components/ui/Accordion";
import { usePreferredClass } from "@/lib/preferred-class";

export function HomeworkSection() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const myClasses = approvedClassesForStudent(state, state.currentUserId);
  const [classId, setClassId] = usePreferredClass(state.currentUserId, myClasses);
  const [tier, setTier] = useState<HomeworkTier>("complete");
  const [submitting, setSubmitting] = useState(false);

  const myHomeworks = state.homeworkSubmissions.filter((h) => h.student_id === state.currentUserId);
  const checkedHomework = myHomeworks.find((homework) => homework.class_id === classId && homework.approval_status === "approved" && koreaDateKey(homework.submitted_at) === koreaDateKey());
  const checkedToday = Boolean(checkedHomework);

  return (
    <div>
      <Card>
        <h3 className="text-subtitle mb-1">과제 체크</h3>
        <p className="text-caption text-text-secondary mb-3">
          과제 완료율을 선택해 주세요.
        </p>
        <label className="block text-caption font-semibold text-text-secondary mb-1">체크할 반</label>
        <select
          className="w-full border border-border rounded-lg px-2.5 py-2 text-body mb-3"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          {myClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {checkedToday ? <div className="rounded-xl bg-state-successBg p-5 text-center"><p className="text-subtitle text-state-success">오늘 과제 체크 완료</p><p className="mt-1 text-body text-text-primary">스티커 {checkedHomework?.sticker_count ?? 0}장이 지급됐어요.</p><p className="mt-2 text-caption text-text-secondary">이 반의 과제는 내일 다시 체크할 수 있어요.</p></div> : <><label className="block text-caption font-semibold text-text-secondary mb-1">완료율 선택</label>
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          {state.homeworkPolicy.map((t) => (
            <button
              key={t.tier}
              type="button"
              onClick={() => setTier(t.tier)}
              className={clsx(
                "border rounded-lg px-1 py-2 text-caption text-center",
                tier === t.tier ? "border-brand-amber bg-state-warningBg text-brand-amber font-bold" : "border-border"
              )}
            >
              {t.label}
              <br />({t.count}장)
            </button>
          ))}
        </div>
        <Button
          fullWidth
          disabled={!classId || submitting}
          onClick={async () => {
            try { setSubmitting(true); await submitStudentAction({ action: "homework", classId, tier }); dispatch({ type: "SUBMIT_HOMEWORK", studentId: state.currentUserId, classId, tier }); const tierDef = state.homeworkPolicy.find((item) => item.tier === tier); showToast(`과제 체크 완료 — 스티커 ${tierDef?.count ?? 0}장 지급!`); }
            catch (error) { showToast(error instanceof Error ? error.message : "과제 체크를 저장하지 못했습니다."); }
            finally { setSubmitting(false); }
          }}
        >
          체크하기
        </Button>
        </>}
      </Card>

      <Card>
        <Accordion label={`내 과제 체크 내역 (${myHomeworks.length})`} defaultOpen={false}>
          {myHomeworks.length === 0 ? (
            <p className="text-caption text-text-muted">과제 체크 내역이 없어요.</p>
          ) : myHomeworks.map((h) => {
            const cls = state.classes.find((c) => c.id === h.class_id);
            const tierDef = state.homeworkPolicy.find((t) => t.tier === h.completion_tier);
            return (
              <div key={h.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div>
                  <p className="text-body font-semibold">
                    {cls?.name} · {tierDef?.label}
                  </p>
                  <p className="text-caption text-text-muted">{fmtDate(h.submitted_at)}</p>
                </div>
                <Pill tone={h.approval_status === "pending" ? "wait" : h.approval_status === "approved" ? "ok" : "danger"}>
                  {h.approval_status === "pending" ? "처리중" : h.approval_status === "approved" ? "지급완료" : "취소됨"}
                </Pill>
              </div>
            );
          })}
        </Accordion>
      </Card>
    </div>
  );
}
