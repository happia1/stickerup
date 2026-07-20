"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { useToast } from "@/lib/toast/provider";

export default function AdminApprovalsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [praiseCounts, setPraiseCounts] = useState<Record<string, number>>({});

  const pendingHomework = state.homeworkSubmissions.filter((h) => h.approval_status === "pending");
  const pendingPraise = state.praiseRequests.filter((p) => p.approval_status === "pending");

  return (
    <div>
      <h2 className="text-title mb-1">승인함</h2>
      <p className="text-caption text-text-secondary mb-5">
        학생이 신청한 숙제 인증과 칭찬 스티커 요청을 확인하고 승인/반려해요.
      </p>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="p-2.5">유형</th>
              <th className="p-2.5">학생</th>
              <th className="p-2.5">반</th>
              <th className="p-2.5">내용</th>
              <th className="p-2.5">신청일</th>
              <th className="p-2.5">처리</th>
            </tr>
          </thead>
          <tbody>
            {pendingHomework.map((h) => {
              const student = state.students.find((s) => s.id === h.student_id);
              const cls = state.classes.find((c) => c.id === h.class_id);
              const tierDef = state.homeworkPolicy.find((t) => t.tier === h.completion_tier);
              return (
                <tr key={h.id} className="border-b last:border-0 border-border">
                  <td className="p-2.5">숙제 인증</td>
                  <td className="p-2.5">{student?.name}</td>
                  <td className="p-2.5">{cls?.name}</td>
                  <td className="p-2.5">
                    {tierDef?.label} ({h.sticker_count}장)
                  </td>
                  <td className="p-2.5">{h.submitted_at.slice(0, 10)}</td>
                  <td className="p-2.5 flex gap-1.5">
                    <button
                      className="border border-state-success text-state-success rounded-lg px-2 py-1 text-caption"
                      onClick={() => {
                        dispatch({ type: "APPROVE_HOMEWORK", submissionId: h.id, approverId: state.currentUserId });
                        showToast("승인 완료 — 스티커가 지급되었어요.");
                      }}
                    >
                      승인
                    </button>
                    <button
                      className="border border-state-danger text-state-danger rounded-lg px-2 py-1 text-caption"
                      onClick={() => dispatch({ type: "REJECT_HOMEWORK", submissionId: h.id })}
                    >
                      반려
                    </button>
                  </td>
                </tr>
              );
            })}
            {pendingPraise.map((p) => {
              const student = state.students.find((s) => s.id === p.student_id);
              const cls = state.classes.find((c) => c.id === p.class_id);
              return (
                <tr key={p.id} className="border-b last:border-0 border-border">
                  <td className="p-2.5">칭찬 스티커</td>
                  <td className="p-2.5">{student?.name}</td>
                  <td className="p-2.5">{cls?.name ?? "-"}</td>
                  <td className="p-2.5">{p.reason}</td>
                  <td className="p-2.5">{p.requested_at.slice(0, 10)}</td>
                  <td className="p-2.5 flex items-center gap-1.5">
                    <input
                      type="number"
                      className="w-14 border border-border rounded-lg px-1.5 py-1 text-caption"
                      placeholder="2"
                      value={praiseCounts[p.id] ?? 2}
                      onChange={(e) => setPraiseCounts((prev) => ({ ...prev, [p.id]: Number(e.target.value) || 0 }))}
                    />
                    <button
                      className="border border-state-success text-state-success rounded-lg px-2 py-1 text-caption"
                      onClick={() => {
                        dispatch({
                          type: "APPROVE_PRAISE",
                          requestId: p.id,
                          approverId: state.currentUserId,
                          count: praiseCounts[p.id] ?? 2,
                        });
                        showToast("승인 완료 — 스티커가 지급되었어요.");
                      }}
                    >
                      승인
                    </button>
                    <button
                      className="border border-state-danger text-state-danger rounded-lg px-2 py-1 text-caption"
                      onClick={() => dispatch({ type: "REJECT_PRAISE", requestId: p.id })}
                    >
                      반려
                    </button>
                  </td>
                </tr>
              );
            })}
            {pendingHomework.length === 0 && pendingPraise.length === 0 && (
              <tr>
                <td className="p-2.5 text-center text-text-secondary" colSpan={6}>
                  대기 중인 요청이 없어요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
