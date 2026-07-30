"use client";

import { useMemo, useState } from "react";
import { useAppDispatch, useAppState } from "@/lib/store/provider";
import { useToast } from "@/lib/toast/provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { koreaDateKey } from "@/lib/korea-date";
import type { AppState } from "@/lib/store/types";

type RequestType = "attendance" | "homework" | "praise";
type RequestEdit = { tier: string; count: string };
type PersistedRequestEdit = { tier: string; count: number };

export default function AdminApprovalsPanel({ embedded = false }: { embedded?: boolean }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [edits, setEdits] = useState<Record<string, RequestEdit>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [directOpen, setDirectOpen] = useState(false);
  const [directType, setDirectType] = useState<"attendance" | "homework">("attendance");
  const [directStudentId, setDirectStudentId] = useState("");
  const [directClassId, setDirectClassId] = useState("");
  const [directDate, setDirectDate] = useState(koreaDateKey());
  const [directTier, setDirectTier] = useState(state.attendancePolicy[0]?.tier ?? "on_time");
  const [directCount, setDirectCount] = useState(String(state.attendancePolicy[0]?.count ?? 5));

  const pendingAttendance = state.attendanceRecords.filter((item) => item.approval_status === "pending");
  const pendingHomework = state.homeworkSubmissions.filter((item) => item.approval_status === "pending");
  const pendingPraise = state.praiseRequests.filter((item) => item.approval_status === "pending");
  const directClasses = useMemo(() => {
    const approvedClassIds = new Set(state.enrollments.filter((item) => item.student_id === directStudentId && item.status === "approved").map((item) => item.class_id));
    return state.classes.filter((item) => !item.is_default && item.status === "active" && approvedClassIds.has(item.id));
  }, [directStudentId, state.classes, state.enrollments]);

  async function accessToken() {
    const client = getSupabaseBrowserClient();
    const { data } = await client!.auth.getSession();
    if (!data.session) throw new Error("로그인이 필요합니다.");
    return data.session.access_token;
  }

  async function refreshState(token: string) {
    const response = await fetch("/api/app-state", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const payload = await response.json() as { state?: Partial<AppState> & Pick<AppState, "currentUserId" | "currentUserRole" | "tenant">; error?: string };
    if (!response.ok || !payload.state) throw new Error(payload.error ?? "최신 정보를 불러오지 못했습니다.");
    dispatch({ type: "HYDRATE_APP_STATE", state: payload.state });
  }

  async function persist(type: RequestType, requestId: string, action: "approve" | "reject", edit?: PersistedRequestEdit) {
    const token = await accessToken();
    const response = await fetch("/api/admin/approvals", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ type, requestId, action, tier: edit?.tier, count: edit?.count }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "승인 요청을 처리하지 못했습니다.");
    await refreshState(token);
  }

  async function handleRequest(type: RequestType, requestId: string, action: "approve" | "reject", edit?: RequestEdit) {
    const parsedCount = edit ? Number(edit.count) : undefined;
    if (action === "approve" && (edit?.count.trim() === "" || !Number.isFinite(parsedCount) || parsedCount! < 0 || parsedCount! > 100)) {
      showToast("지급할 스티커 수를 0~100 사이로 입력해 주세요.");
      return;
    }
    try {
      setProcessingId(requestId);
      await persist(type, requestId, action, edit ? { tier: edit.tier, count: parsedCount! } : undefined);
      showToast(action === "approve" ? "승인 완료 — 수정한 내용으로 스티커가 지급되었어요." : "요청을 반려했어요. 학생은 다시 신청할 수 있어요.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "요청을 처리하지 못했습니다.");
    } finally {
      setProcessingId(null);
    }
  }

  function updateDirectType(type: "attendance" | "homework") {
    const policy = type === "attendance" ? state.attendancePolicy : state.homeworkPolicy;
    setDirectType(type);
    setDirectTier(policy[0]?.tier ?? "");
    setDirectCount(String(policy[0]?.count ?? 0));
    if (type === "attendance") setDirectClassId("");
  }

  async function createDirectRecord() {
    if (!directStudentId) return showToast("학생을 선택해 주세요.");
    if (directType === "homework" && !directClassId) return showToast("과제 반을 선택해 주세요.");
    const parsedCount = Number(directCount);
    if (directCount.trim() === "" || !Number.isFinite(parsedCount) || parsedCount < 0 || parsedCount > 100) {
      return showToast("지급할 스티커 수를 0~100 사이로 입력해 주세요.");
    }
    try {
      setProcessingId("direct");
      const token = await accessToken();
      const response = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: directType, studentId: directStudentId, classId: directClassId || undefined, checkDate: directDate, tier: directTier, count: parsedCount }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "직접 등록하지 못했습니다.");
      await refreshState(token);
      setDirectOpen(false);
      showToast("선생님이 직접 등록하고 스티커를 지급했어요.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "직접 등록하지 못했습니다.");
    } finally {
      setProcessingId(null);
    }
  }

  const rows = [
    ...pendingAttendance.map((request) => ({ type: "attendance" as const, request })),
    ...pendingHomework.map((request) => ({ type: "homework" as const, request })),
    ...pendingPraise.map((request) => ({ type: "praise" as const, request })),
  ];

  return (
    <div>
      <div className={`mb-5 flex items-start gap-3 ${embedded ? "justify-end" : "justify-between"}`}>
        {!embedded && <div>
          <h2 className="mb-1 text-title">승인함</h2>
          <p className="text-caption text-text-secondary">신청 내용을 수정해 승인하거나 반려할 수 있어요. 반려된 출석·과제는 학생이 다시 신청할 수 있습니다.</p>
        </div>}
        <button type="button" onClick={() => setDirectOpen((value) => !value)} className="shrink-0 rounded-lg bg-brand-amber px-3 py-2 text-caption font-bold text-surface-page">+ 직접 등록</button>
      </div>

      {directOpen && (
        <section className="mb-5 rounded-xl border border-brand-amber/40 bg-surface-card p-4">
          <h3 className="mb-3 text-subtitle">학생 출결·과제 직접 등록</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-caption text-text-secondary">유형
              <select value={directType} onChange={(event) => updateDirectType(event.target.value as "attendance" | "homework")} className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body"><option value="attendance">출석</option><option value="homework">과제</option></select>
            </label>
            <label className="text-caption text-text-secondary">학생
              <select value={directStudentId} onChange={(event) => { setDirectStudentId(event.target.value); setDirectClassId(""); }} className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body"><option value="">학생 선택</option>{state.students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select>
            </label>
            <label className="text-caption text-text-secondary">날짜
              <input type="date" max={koreaDateKey()} value={directDate} onChange={(event) => setDirectDate(event.target.value)} className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body" />
            </label>
            {directType === "homework" && <label className="text-caption text-text-secondary">특강반
              <select value={directClassId} onChange={(event) => setDirectClassId(event.target.value)} className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body"><option value="">반 선택</option>{directClasses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            </label>}
            <label className="text-caption text-text-secondary">{directType === "attendance" ? "출석 기준" : "과제 완료율"}
              <select value={directTier} onChange={(event) => { const policy = directType === "attendance" ? state.attendancePolicy : state.homeworkPolicy; const selected = policy.find((item) => item.tier === event.target.value); setDirectTier(event.target.value); if (selected) setDirectCount(String(selected.count)); }} className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body">{(directType === "attendance" ? state.attendancePolicy : state.homeworkPolicy).map((item) => <option key={item.tier} value={item.tier}>{item.label}</option>)}</select>
            </label>
            <label className="text-caption text-text-secondary">지급 스티커
              <input type="number" min={0} max={100} value={directCount} onChange={(event) => setDirectCount(event.target.value)} className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body" />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setDirectOpen(false)} className="rounded-lg border border-border px-3 py-2 text-caption">취소</button><button type="button" disabled={processingId === "direct"} onClick={() => void createDirectRecord()} className="rounded-lg bg-brand-amber px-3 py-2 text-caption font-bold text-surface-page disabled:opacity-50">등록 및 지급</button></div>
        </section>
      )}

      <div className="space-y-2">
        {rows.map(({ type, request }) => {
          const student = state.students.find((item) => item.id === request.student_id);
          const cls = state.classes.find((item) => item.id === request.class_id);
          const currentTier = type === "attendance" ? request.tier : type === "homework" ? request.completion_tier : "";
          const currentCount = request.sticker_count ?? (type === "praise" ? 2 : 0);
          const edit = edits[request.id] ?? { tier: currentTier, count: String(currentCount) };
          const policy = type === "attendance" ? state.attendancePolicy : state.homeworkPolicy;
          const requestDate = type === "attendance" ? request.check_date ?? request.checked_at.slice(0, 10) : type === "homework" ? request.check_date ?? request.submitted_at.slice(0, 10) : request.requested_at.slice(0, 10);
          return (
            <article key={`${type}-${request.id}`} className="rounded-xl border border-border bg-surface-card p-3">
              <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="rounded-full bg-surface-raised px-2 py-1 text-caption font-bold">{type === "attendance" ? "출석" : type === "homework" ? "과제" : "칭찬"}</span>
                <strong className="text-body">{student?.name ?? "학생 정보 없음"}</strong>
                <span className="text-caption text-text-secondary">{cls?.name ?? "반 공통"} · {requestDate}</span>
              </div>
              {type === "praise" ? <p className="mb-3 whitespace-pre-wrap text-body">{request.reason}</p> : null}
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7rem]">
                {type !== "praise" && <label className="min-w-36 flex-1 text-caption text-text-secondary">{type === "attendance" ? "출석 기준" : "과제 완료율"}
                  <select value={edit.tier} onChange={(event) => { const selected = policy.find((item) => item.tier === event.target.value); setEdits((prev) => ({ ...prev, [request.id]: { tier: event.target.value, count: selected ? String(selected.count) : edit.count } })); }} className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-body">{policy.map((item) => <option key={item.tier} value={item.tier}>{item.label}</option>)}</select>
                </label>}
                <label className={`text-caption text-text-secondary ${type === "praise" ? "sm:col-span-2" : ""}`}>지급 스티커
                  <input type="number" min={0} max={100} value={edit.count} onChange={(event) => setEdits((prev) => ({ ...prev, [request.id]: { tier: edit.tier, count: event.target.value } }))} className="mt-1 w-full rounded-lg border border-border px-2 py-1.5 text-body" />
                </label>
                <div className="mt-1 flex gap-2 sm:col-span-2">
                  <button type="button" disabled={processingId === request.id} onClick={() => void handleRequest(type, request.id, "approve", edit)} className="min-h-10 flex-1 rounded-lg bg-state-success px-3 py-2 text-caption font-bold text-white disabled:opacity-50">{processingId === request.id ? "처리 중..." : "수정 수량으로 승인·지급"}</button>
                  <button type="button" disabled={processingId === request.id} onClick={() => void handleRequest(type, request.id, "reject")} className="min-h-10 rounded-lg border border-state-danger px-4 py-2 text-caption text-state-danger disabled:opacity-50">반려</button>
                </div>
              </div>
            </article>
          );
        })}
        {rows.length === 0 && <div className="rounded-xl border border-border p-8 text-center text-body text-text-secondary">대기 중인 요청이 없어요.</div>}
      </div>
    </div>
  );
}
