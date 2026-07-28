"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { Pill } from "@/components/ui/Pill";
import { fmtDateTime } from "@/lib/format";
import { useToast } from "@/lib/toast/provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AppState } from "@/lib/store/types";

const TYPE_LABEL = { attendance: "출석", homework: "숙제", praise: "칭찬" } as const;

export default function AdminLogsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [studentFilter, setStudentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonDrafts, setReasonDrafts] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCount, setEditCount] = useState(0);
  const [editReason, setEditReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function persistLedger(action: "adjust" | "rollback", ledgerId: string, reason: string, count?: number) {
    const client = getSupabaseBrowserClient();
    const { data } = await client!.auth.getSession();
    if (!data.session) throw new Error("로그인이 필요합니다.");
    const response = await fetch("/api/admin/sticker-logs", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action, ledgerId, reason, count }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "스티커 기록을 변경하지 못했습니다.");
    const stateResponse = await fetch("/api/app-state", { headers: { Authorization: `Bearer ${data.session.access_token}` }, cache: "no-store" });
    const statePayload = await stateResponse.json() as { state?: Partial<AppState> & Pick<AppState, "currentUserId" | "currentUserRole" | "tenant">; error?: string };
    if (!stateResponse.ok || !statePayload.state) throw new Error(statePayload.error ?? "변경된 스티커 정보를 불러오지 못했습니다.");
    dispatch({ type: "HYDRATE_APP_STATE", state: statePayload.state });
  }

  async function adjustLedger(ledgerId: string) {
    if (!editReason.trim()) return showToast("수정 사유를 입력해 주세요.");
    try {
      setProcessingId(ledgerId);
      await persistLedger("adjust", ledgerId, editReason.trim(), editCount);
      setEditingId(null);
      setEditReason("");
      showToast("기존 지급 이력을 보존하고 수정된 스티커 수를 반영했어요.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "스티커 지급 수를 수정하지 못했습니다.");
    } finally {
      setProcessingId(null);
    }
  }

  async function rollbackLedger(ledgerId: string) {
    const reason = reasonDrafts[ledgerId]?.trim() || "관리자 지급 취소";
    try {
      setProcessingId(ledgerId);
      await persistLedger("rollback", ledgerId, reason);
      showToast("해당 지급 건을 롤백했어요.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "스티커 지급을 롤백하지 못했습니다.");
    } finally {
      setProcessingId(null);
    }
  }

  let rows = [...state.ledger].sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (studentFilter !== "all") rows = rows.filter((l) => l.student_id === studentFilter);
  if (typeFilter !== "all") rows = rows.filter((l) => l.source_type === typeFilter);
  if (statusFilter !== "all") rows = rows.filter((l) => l.status === statusFilter);
  rows = rows.slice(0, 80);

  return (
    <div>
      <h2 className="text-title mb-1">스티커 로그</h2>
      <p className="text-caption text-text-secondary mb-5">
        모든 지급 내역을 확인하고, 부정 지급이 확인되면 롤백(취소)할 수 있어요.
      </p>

      <div className="flex gap-3 mb-4 max-w-xl">
        <select className="flex-1 border border-border rounded-lg px-2.5 py-2 text-body" value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)}>
          <option value="all">전체 학생</option>
          {state.students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select className="flex-1 border border-border rounded-lg px-2.5 py-2 text-body" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">전체 유형</option>
          <option value="attendance">출석</option>
          <option value="homework">숙제</option>
          <option value="praise">칭찬</option>
        </select>
        <select className="flex-1 border border-border rounded-lg px-2.5 py-2 text-body" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">전체 상태</option>
          <option value="active">정상</option>
          <option value="rolled_back">취소됨</option>
        </select>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="p-2.5">학생</th>
              <th className="p-2.5">반</th>
              <th className="p-2.5">유형</th>
              <th className="p-2.5">지급 수</th>
              <th className="p-2.5">일시</th>
              <th className="p-2.5">상태</th>
              <th className="p-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const student = state.students.find((s) => s.id === l.student_id);
              const cls = state.classes.find((c) => c.id === l.class_id);
              const isCorrected = l.status === "active" && state.ledger.some((entry) => entry.id !== l.id && entry.source_type === l.source_type && entry.source_id === l.source_id && entry.status === "rolled_back" && entry.rollback_reason?.startsWith("지급 수정:"));
              return (
                <tr key={l.id} className="border-b last:border-0 border-border align-top">
                  <td className="p-2.5">{student?.name}</td>
                  <td className="p-2.5">{cls?.name}</td>
                  <td className="p-2.5">
                    {TYPE_LABEL[l.source_type]}
                    {isCorrected && <p className="mt-0.5 text-caption text-brand-amber">수정 지급</p>}
                    {l.status === "rolled_back" && (
                      <p className="text-caption text-text-muted mt-0.5">사유: {l.rollback_reason}</p>
                    )}
                  </td>
                  <td className="p-2.5">{l.count}</td>
                  <td className="p-2.5">{fmtDateTime(l.created_at)}</td>
                  <td className="p-2.5">
                    <Pill tone={l.status === "active" ? "ok" : "danger"}>{l.status === "active" ? "정상" : "취소됨"}</Pill>
                  </td>
                  <td className="p-2.5">
                    {l.status === "active" && (
                      editingId === l.id ? (
                        <div className="flex min-w-56 flex-wrap gap-1">
                          <input type="number" min={0} max={100} aria-label="변경할 스티커 수" className="w-20 rounded-lg border border-border px-1.5 py-1 text-caption" value={editCount} onChange={(event) => setEditCount(Number(event.target.value) || 0)} />
                          <input className="min-w-32 flex-1 rounded-lg border border-border px-1.5 py-1 text-caption" placeholder="수정 사유" value={editReason} onChange={(event) => setEditReason(event.target.value)} />
                          <button disabled={processingId === l.id} className="rounded-lg border border-state-success px-2 py-1 text-caption text-state-success disabled:opacity-50" onClick={() => void adjustLedger(l.id)}>저장</button>
                          <button disabled={processingId === l.id} className="rounded-lg border border-border px-2 py-1 text-caption text-text-secondary disabled:opacity-50" onClick={() => { setEditingId(null); setEditReason(""); }}>취소</button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          <button className="rounded-lg border border-brand-amber px-2 py-1 text-caption text-brand-amber" onClick={() => { setEditingId(l.id); setEditCount(l.count); setEditReason(""); }}>지급 수정</button>
                          <input className="w-28 rounded-lg border border-border px-1.5 py-1 text-caption" placeholder="취소 사유" value={reasonDrafts[l.id] ?? ""} onChange={(event) => setReasonDrafts((prev) => ({ ...prev, [l.id]: event.target.value }))} />
                          <button disabled={processingId === l.id} className="rounded-lg border border-state-danger px-2 py-1 text-caption text-state-danger disabled:opacity-50" onClick={() => void rollbackLedger(l.id)}>롤백</button>
                        </div>
                      )
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
