"use client";

import { useState } from "react";
import { useAppDispatch, useAppState } from "@/lib/store/provider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast/provider";
import { submitStudentAction } from "@/lib/student-action-client";
import { koreaDateKey } from "@/lib/korea-date";

export function AttendanceSection() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const regularClass = state.classes.find((item) => item.is_default);
  const checkedEntry = state.ledger.find((entry) =>
    entry.student_id === state.currentUserId &&
    entry.source_type === "attendance" &&
    entry.status === "active" &&
    koreaDateKey(entry.created_at) === koreaDateKey()
  );

  return (
    <Card>
      <div className="mb-3 flex min-w-0 items-center gap-2">
        <h3 className="shrink-0 text-subtitle">출석 체크</h3>
        <p className="min-w-0 text-micro text-text-secondary">반과 관계없이 하루에 한 번 체크해요.</p>
      </div>
      {checkedEntry ? (
        <div className="rounded-xl bg-state-successBg p-5 text-center">
          <p className="text-subtitle text-state-success">오늘 출석 체크 완료</p>
          <p className="mt-1 text-body text-text-primary">스티커 {checkedEntry.count}장이 지급됐어요.</p>
        </div>
      ) : (
        <Button
          fullWidth
          disabled={!regularClass || submitting}
          onClick={async () => {
            if (!regularClass) return showToast("기본 소속 반 정보를 찾을 수 없어요.");
            try {
              setSubmitting(true);
              await submitStudentAction({ action: "attendance", tier: "on_time" });
              dispatch({ type: "CHECK_IN", studentId: state.currentUserId, classId: regularClass.id, tier: "on_time" });
              showToast("오늘 출석 체크가 완료됐어요.");
            } catch (error) {
              showToast(error instanceof Error ? error.message : "출석을 저장하지 못했어요.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? "처리 중..." : "출석 체크하기"}
        </Button>
      )}
    </Card>
  );
}
