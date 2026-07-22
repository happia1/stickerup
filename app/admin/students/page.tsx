"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast/provider";
import type { AdminStudentRow, AdminStudentsData } from "@/lib/data/admin-students.types";

const STATUS_LABEL = { pending: "연결 대기", connected: "연결됨", unconnected: "미연결" } as const;

export default function AdminStudentsPage() {
  const toast = useToast();
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [focusedStudentId, setFocusedStudentId] = useState("");
  const [canDeleteStudents, setCanDeleteStudents] = useState(false);

  async function token() {
    const client = getSupabaseBrowserClient();
    const { data } = await client!.auth.getSession();
    return data.session?.access_token;
  }

  async function load() {
    try {
      const accessToken = await token();
      if (!accessToken) throw new Error("로그인이 필요합니다.");
      const response = await fetch("/api/admin/students", { headers: { Authorization: `Bearer ${accessToken}` } });
      const payload = await response.json() as AdminStudentsData & { error?: string };
      if (!response.ok) throw new Error(payload.error);
      setStudents(payload.students);
      setCanDeleteStudents(payload.canDeleteStudents);
    } catch (error) {
      toast(error instanceof Error ? error.message : "학생 목록을 불러오지 못했습니다.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setFocusedStudentId(new URLSearchParams(window.location.search).get("student") ?? ""); }, []);
  useEffect(() => { if (focusedStudentId && students.length) document.getElementById(`student-${focusedStudentId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [focusedStudentId, students]);

  async function updateConnection(student: AdminStudentRow, action: "approve" | "disconnect" | "revoke_pending" | "delete" | "remove_class", classId?: string) {
    if (action === "disconnect" && !window.confirm(`${student.name} 학생과의 선생님 연결을 해지할까요? 반 승인 상태는 유지됩니다.`)) return;
    if (action === "revoke_pending" && !window.confirm(`${student.name} 학생의 연결 대기를 해지할까요?`)) return;
    if (action === "delete" && !window.confirm(`${student.name} 학생 계정과 모든 데이터를 완전히 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) return;
    try {
      setProcessingId(student.id);
      const accessToken = await token();
      if (!accessToken) throw new Error("로그인이 필요합니다.");
      const response = await fetch("/api/admin/students", { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ studentId: student.id, classId, action }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      toast(action === "approve" ? `${student.name} 학생의 연결을 승인했어요.` : action === "delete" ? `${student.name} 학생을 삭제했어요.` : `${student.name} 학생의 연결 상태를 해지했어요.`);
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : "연결 상태를 변경하지 못했습니다.");
    } finally { setProcessingId(null); }
  }

  return (
    <div>
      <h2 className="text-title mb-1">학생 관리</h2>
      <p className="text-caption text-text-secondary mb-5">앱으로 가입한 학생의 연결 요청을 승인하고 연결 상태를 관리해요.</p>
      <p className="text-subtitle mb-2">학생 목록</p>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-body">
          <thead><tr className="text-caption text-text-secondary text-left border-b border-border"><th className="p-2.5">이름</th><th className="p-2.5">나이</th><th className="p-2.5">소속 반</th><th className="p-2.5">총 스티커</th><th className="p-2.5">연결 상태</th><th className="p-2.5">처리</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-5 text-center text-text-secondary">불러오는 중...</td></tr>}
            {!loading && !students.length && <tr><td colSpan={6} className="p-5 text-center text-text-secondary">등록된 학생이 없습니다.</td></tr>}
            {students.map((student) => <tr id={`student-${student.id}`} key={student.id} className={`border-b last:border-0 border-border ${student.connectionStatus === "pending" ? "bg-state-warningBg/40" : ""} ${focusedStudentId === student.id ? "outline outline-2 outline-brand-amber outline-offset-[-2px]" : ""}`}>
              <td className="p-2.5 font-semibold">{student.name}{student.connectionStatus === "pending" && <span className="ml-2 rounded-full bg-brand-amber px-2 py-0.5 text-caption text-surface-page">대기</span>}</td>
              <td className="p-2.5">{student.age ?? "-"}</td><td className="p-2.5"><div className="flex flex-wrap gap-1">{student.classMemberships.length ? student.classMemberships.map((membership)=><span key={membership.classId} className="inline-flex items-center gap-1 rounded-full bg-surface-raised px-2 py-1 text-caption">{membership.className}{!membership.isDefault&&<button type="button" aria-label={`${membership.className} 소속 해지`} className="text-state-danger" onClick={()=>{if(window.confirm(`${student.name} 학생의 ${membership.className} 소속을 해지할까요?`))void updateConnection(student,"remove_class",membership.classId);}}>×</button>}</span>) : "-"}</div></td><td className="p-2.5">{student.totalStickers}</td><td className="p-2.5">{STATUS_LABEL[student.connectionStatus]}</td>
              <td className="p-2.5"><div className="flex flex-wrap items-center gap-1.5">{student.connectionStatus === "connected" ? <button disabled={processingId === student.id} className="rounded-lg border border-state-danger px-2.5 py-1 text-caption text-state-danger disabled:opacity-50" onClick={() => updateConnection(student, "disconnect")}>연결 해지</button> : student.connectionStatus === "pending" ? <><button disabled={processingId === student.id} className="rounded-lg border border-state-success px-2.5 py-1 text-caption text-state-success disabled:opacity-50" onClick={() => updateConnection(student, "approve")}>연결 승인</button><button disabled={processingId === student.id} className="rounded-lg border border-border px-2.5 py-1 text-caption text-text-secondary disabled:opacity-50" onClick={() => updateConnection(student, "revoke_pending")}>대기 해지</button></> : <span className="text-caption text-text-muted">연결 요청 대기</span>}{canDeleteStudents && <button disabled={processingId === student.id} className="rounded-lg px-2.5 py-1 text-caption text-state-danger disabled:opacity-50" onClick={() => updateConnection(student, "delete")}>삭제</button>}</div></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
