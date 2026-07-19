"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { getDefaultClass } from "@/lib/store/selectors";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { Pill } from "@/components/ui/Pill";
import { fmtDate } from "@/lib/format";
import { useToast } from "@/lib/toast/provider";

export function PraiseSection() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [reason, setReason] = useState("");

  const myRequests = state.praiseRequests.filter((p) => p.student_id === state.currentUserId);
  const defaultClass = getDefaultClass(state);

  return (
    <div>
      <Card>
        <h3 className="text-subtitle mb-1">칭찬 스티커 요청</h3>
        <p className="text-caption text-text-secondary mb-3">
          정형화되지 않은 칭찬받을 행동은 사유를 적어 요청하면, 관리자가 확인 후 스티커를 지급해요.
        </p>
        <label className="block text-caption font-semibold text-text-secondary mb-1">사유</label>
        <textarea
          className="w-full border border-border rounded-lg px-2.5 py-2 text-body mb-3.5 min-h-[64px]"
          placeholder="예: 어려운 문제 친구에게 설명해줌"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button
          fullWidth
          onClick={() => {
            dispatch({
              type: "SUBMIT_PRAISE",
              studentId: state.currentUserId,
              classId: defaultClass?.id ?? null,
              reason: reason.trim() || "칭찬 스티커 요청",
            });
            setReason("");
            showToast("칭찬 스티커 요청을 보냈어요.");
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
