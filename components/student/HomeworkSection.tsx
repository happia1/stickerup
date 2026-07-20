"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { approvedClassesForStudent } from "@/lib/store/selectors";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { fmtDate } from "@/lib/format";
import { useToast } from "@/lib/toast/provider";
import clsx from "@/lib/clsx";

export function HomeworkSection() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const myClasses = approvedClassesForStudent(state, state.currentUserId);
  const [classId, setClassId] = useState(myClasses[0]?.id ?? "");
  const [tier, setTier] = useState<string>(state.homeworkPolicy[0]?.tier ?? "");

  const myHomeworks = state.homeworkSubmissions.filter((h) => h.student_id === state.currentUserId);

  return (
    <div>
      <Card>
        <h3 className="text-subtitle mb-1">숙제 인증 신청</h3>
        <p className="text-caption text-text-secondary mb-3">
          완료율을 선택해 신청하면 관리자가 확인 후 승인해야 스티커가 지급돼요.
        </p>
        <label className="block text-caption font-semibold text-text-secondary mb-1">신청할 반</label>
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
        <label className="block text-caption font-semibold text-text-secondary mb-1">완료율 선택</label>
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
              <br />
              <span className="text-micro text-text-muted">{t.rangeText}</span>
              <br />({t.count}장)
            </button>
          ))}
        </div>
        <Button
          fullWidth
          disabled={!classId}
          onClick={() => {
            dispatch({ type: "SUBMIT_HOMEWORK", studentId: state.currentUserId, classId, tier });
            showToast("숙제 인증 신청 완료 — 관리자 승인을 기다려주세요.");
          }}
        >
          인증 신청하기
        </Button>
      </Card>

      <Card>
        <h3 className="text-subtitle mb-2">내 신청 내역</h3>
        {myHomeworks.length === 0 ? (
          <p className="text-caption text-text-muted">신청 내역이 없어요.</p>
        ) : (
          myHomeworks.map((h) => {
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
                  {h.approval_status === "pending" ? "승인대기" : h.approval_status === "approved" ? "승인됨" : "반려됨"}
                </Pill>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
