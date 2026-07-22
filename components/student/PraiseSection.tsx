"use client";

import { useState } from "react";
import { useAppDispatch, useAppState } from "@/lib/store/provider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { Pill } from "@/components/ui/Pill";
import { fmtDate } from "@/lib/format";
import { useToast } from "@/lib/toast/provider";
import { submitStudentAction } from "@/lib/student-action-client";
import { koreaDateKey } from "@/lib/korea-date";

export function PraiseSection() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const myRequests = state.praiseRequests.filter((item) => item.student_id === state.currentUserId);
  const requestedToday = myRequests.some((item) => koreaDateKey(item.requested_at) === koreaDateKey() && item.approval_status !== "rejected");

  return <div>
    <Card>
      <div className="mb-3 flex min-w-0 items-center gap-2"><h3 className="shrink-0 text-subtitle">칭찬 스티커 요청</h3><p className="text-micro text-text-secondary">반과 관계없이 하루 한 번 요청할 수 있어요.</p></div>
      {requestedToday ? <p className="rounded-xl bg-state-successBg p-4 text-center text-body font-bold text-state-success">오늘 칭찬 요청을 보냈어요.</p> : <>
        <label className="mb-1 block text-caption font-semibold text-text-secondary">칭찬받은 이유</label>
        <textarea className="mb-3.5 min-h-[64px] w-full rounded-lg border border-border px-2.5 py-2 text-body" placeholder="칭찬받은 내용을 적어주세요." value={reason} onChange={(event) => setReason(event.target.value)} />
        <Button fullWidth disabled={submitting || !reason.trim()} onClick={async()=>{const requestReason=reason.trim();try{setSubmitting(true);await submitStudentAction({action:"praise",reason:requestReason});dispatch({type:"SUBMIT_PRAISE",studentId:state.currentUserId,classId:null,reason:requestReason});setReason("");showToast("칭찬 스티커 요청을 보냈어요.");}catch(error){showToast(error instanceof Error?error.message:"요청을 보내지 못했어요.");}finally{setSubmitting(false);}}}>{submitting?"처리 중...":"스티커 요청하기"}</Button>
      </>}
    </Card>
    <Card><Accordion label={`내 요청 이력 (${myRequests.length})`}>{myRequests.length===0?<p className="text-caption text-text-muted">요청 이력이 없어요.</p>:myRequests.map((item)=><div key={item.id} className="border-b border-border py-1.5 last:border-0"><div className="flex justify-between gap-2"><p className="text-body font-semibold">{item.reason}</p><Pill tone={item.approval_status==="pending"?"wait":item.approval_status==="approved"?"ok":"danger"}>{item.approval_status==="pending"?"대기":item.approval_status==="approved"?"승인":"반려"}</Pill></div><p className="text-caption text-text-muted">{fmtDate(item.requested_at)}</p></div>)}</Accordion></Card>
  </div>;
}
