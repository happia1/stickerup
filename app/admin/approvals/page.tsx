"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { useToast } from "@/lib/toast/provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminApprovalsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [praiseCounts, setPraiseCounts] = useState<Record<string, number>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function persist(type: "homework" | "praise", requestId: string, action: "approve" | "reject", count?: number) {
    const client = getSupabaseBrowserClient();
    const { data } = await client!.auth.getSession();
    if (!data.session) throw new Error("로그인이 필요합니다.");
    const response = await fetch("/api/admin/approvals", { method: "PATCH", headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ type, requestId, action, count }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "승인 요청을 처리하지 못했습니다.");
  }

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
                      disabled={processingId === h.id}
                      onClick={async () => {
                        try { setProcessingId(h.id); await persist("homework", h.id, "approve"); dispatch({ type: "APPROVE_HOMEWORK", submissionId: h.id, approverId: state.currentUserId }); showToast("승인 완료 — 스티커가 지급되었어요."); }
                        catch (error) { showToast(error instanceof Error ? error.message : "승인하지 못했습니다."); }
                        finally { setProcessingId(null); }
                      }}
                    >
                      승인
                    </button>
                    <button
                      className="border border-state-danger text-state-danger rounded-lg px-2 py-1 text-caption"
                      disabled={processingId === h.id}
                      onClick={async () => { try { setProcessingId(h.id); await persist("homework", h.id, "reject"); dispatch({ type: "REJECT_HOMEWORK", submissionId: h.id }); } catch (error) { showToast(error instanceof Error ? error.message : "반려하지 못했습니다."); } finally { setProcessingId(null); } }}
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
                      disabled={processingId === p.id}
                      onClick={async () => {
                        const count = praiseCounts[p.id] ?? 2;
                        try { setProcessingId(p.id); await persist("praise", p.id, "approve", count); dispatch({
                          type: "APPROVE_PRAISE",
                          requestId: p.id,
                          approverId: state.currentUserId,
                          count,
                        }); showToast("승인 완료 — 스티커가 지급되었어요."); }
                        catch (error) { showToast(error instanceof Error ? error.message : "승인하지 못했습니다."); }
                        finally { setProcessingId(null); }
                      }}
                    >
                      승인
                    </button>
                    <button
                      className="border border-state-danger text-state-danger rounded-lg px-2 py-1 text-caption"
                      disabled={processingId === p.id}
                      onClick={async () => { try { setProcessingId(p.id); await persist("praise", p.id, "reject"); dispatch({ type: "REJECT_PRAISE", requestId: p.id }); } catch (error) { showToast(error instanceof Error ? error.message : "반려하지 못했습니다."); } finally { setProcessingId(null); } }}
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
