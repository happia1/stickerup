"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { approvedClassesForStudent } from "@/lib/store/selectors";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { Pill } from "@/components/ui/Pill";
import { fmtDate } from "@/lib/format";
import { useToast } from "@/lib/toast/provider";
import { submitStudentAction } from "@/lib/student-action-client";
import { usePreferredClass } from "@/lib/preferred-class";

export function PraiseSection() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const myRequests = state.praiseRequests.filter((p) => p.student_id === state.currentUserId);
  const myClasses = approvedClassesForStudent(state, state.currentUserId);
  const [classId,setClassId] = usePreferredClass(state.currentUserId, myClasses);

  return (
    <div>
      <Card>
        <h3 className="text-subtitle mb-1">칭찬 스티커 요청</h3>
        <p className="text-caption text-text-secondary mb-3">
          칭찬 받은 사유와 함께 스티커를 요청할 수 있어요.
        </p>
        <label className="mb-1 block text-caption font-semibold text-text-secondary">요청할 반</label><select value={classId} onChange={event=>setClassId(event.target.value)} className="mb-3 w-full rounded-lg border border-border px-2.5 py-2 text-body">{myClasses.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <label className="block text-caption font-semibold text-text-secondary mb-1">사유</label>
        <textarea
          className="w-full border border-border rounded-lg px-2.5 py-2 text-body mb-3.5 min-h-[64px]"
          placeholder="예: 어려운 문제 친구에게 설명해줌"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button
          fullWidth
          disabled={submitting}
          onClick={async () => {
            const requestReason = reason.trim() || "칭찬 스티커 요청";
            try {
              setSubmitting(true);
              await submitStudentAction({ action: "praise", classId: classId || null, reason: requestReason });
              dispatch({ type: "SUBMIT_PRAISE", studentId: state.currentUserId, classId: classId || null, reason: requestReason });
              setReason("");
              showToast("칭찬 스티커 요청을 보냈어요.");
            } catch (error) { showToast(error instanceof Error ? error.message : "요청을 보내지 못했습니다."); }
            finally { setSubmitting(false); }
          }}
        >
          스티커 주세요 🙌
        </Button>
      </Card>

      <Card>
        <Accordion label={`내 요청 내역 (${myRequests.length})`}>
          {myRequests.length === 0 ? (
            <p className="text-caption text-text-muted">요청 내역이 없어요.</p>
          ) : (
            myRequests.map((p) => (
              <div key={p.id} className="py-1.5 border-b border-border last:border-0">
                <div className="flex justify-between gap-2">
                  <p className="text-body font-semibold">{p.reason}</p>
                  <Pill tone={p.approval_status === "pending" ? "wait" : p.approval_status === "approved" ? "ok" : "danger"}>
                    {p.approval_status === "pending" ? "대기" : p.approval_status === "approved" ? "승인" : "반려"}
                  </Pill>
                </div>
                <p className="text-caption text-text-muted">{fmtDate(p.requested_at)}</p>
              </div>
            ))
          )}
        </Accordion>
      </Card>
    </div>
  );
}
