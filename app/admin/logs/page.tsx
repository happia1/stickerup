"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { Pill } from "@/components/ui/Pill";
import { fmtDateTime } from "@/lib/format";
import { useToast } from "@/lib/toast/provider";

const TYPE_LABEL = { attendance: "출석", homework: "숙제", praise: "칭찬" } as const;

export default function AdminLogsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [studentFilter, setStudentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reasonDrafts, setReasonDrafts] = useState<Record<string, string>>({});

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
              return (
                <tr key={l.id} className="border-b last:border-0 border-border align-top">
                  <td className="p-2.5">{student?.name}</td>
                  <td className="p-2.5">{cls?.name}</td>
                  <td className="p-2.5">
                    {TYPE_LABEL[l.source_type]}
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
                      <div className="flex gap-1">
                        <input
                          className="w-28 border border-border rounded-lg px-1.5 py-1 text-caption"
                          placeholder="취소 사유"
                          value={reasonDrafts[l.id] ?? ""}
                          onChange={(e) => setReasonDrafts((prev) => ({ ...prev, [l.id]: e.target.value }))}
                        />
                        <button
                          className="border border-state-danger text-state-danger rounded-lg px-2 py-1 text-caption"
                          onClick={() => {
                            const reason = reasonDrafts[l.id]?.trim() || "부정 지급 확인";
                            dispatch({ type: "ROLLBACK_LEDGER", ledgerId: l.id, reason });
                            showToast("해당 지급 건이 롤백되었어요.");
                          }}
                        >
                          롤백
                        </button>
                      </div>
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
