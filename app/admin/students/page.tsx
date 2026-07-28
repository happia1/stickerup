"use client";
/* eslint-disable @next/next/no-img-element */

import { Fragment, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast/provider";
import type { AdminStudentRow, AdminStudentsData } from "@/lib/data/admin-students.types";

const todayMonthDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit" }).format(new Date()).slice(0, 5);
function isBirthday(value: string | null) { return Boolean(value && value.slice(5) === todayMonthDay); }
function compactBirthDate(value: string | null) { return value ? value.slice(2).replaceAll("-", ".") : "-"; }

export default function AdminStudentsPage() {
  const toast = useToast();
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [focusedStudentId, setFocusedStudentId] = useState("");
  const [canDeleteStudents, setCanDeleteStudents] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [classFilter, setClassFilter] = useState("all");
  const [classPickerStudentId, setClassPickerStudentId] = useState<string | null>(null);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const classFilters = Array.from(new Map(students.flatMap((student) => student.classMemberships.filter((membership) => !membership.isDefault)).map((membership) => [membership.classId, membership])).values());
  const visibleStudents = classFilter === "all" ? students : students.filter((student) => student.classMemberships.some((membership) => membership.classId === classFilter));
  const classPickerStudent = students.find((student) => student.id === classPickerStudentId);
  const classesToAdd = availableClasses.filter((classRoom) => !classPickerStudent?.classMemberships.some((membership) => membership.classId === classRoom.id));

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
      setAvailableClasses(payload.availableClasses);
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

  async function addClasses() {
    if (!classPickerStudent || !selectedClassIds.length) return toast("추가할 특강반을 선택해 주세요.");
    try {
      setProcessingId(classPickerStudent.id);
      const accessToken = await token();
      if (!accessToken) throw new Error("로그인이 필요합니다.");
      const response = await fetch("/api/admin/students", { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ studentId: classPickerStudent.id, classIds: selectedClassIds, action: "add_classes" }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      toast(`${classPickerStudent.name} 학생을 선택한 특강반에 추가했어요.`);
      setClassPickerStudentId(null);
      setSelectedClassIds([]);
      await load();
    } catch (error) {
      toast(error instanceof Error ? error.message : "소속반을 추가하지 못했습니다.");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div>
      <h2 className="text-title mb-1">학생 관리</h2>
      <p className="text-caption text-text-secondary mb-5">앱으로 가입한 학생의 연결 요청을 승인하고 연결 상태를 관리해요.</p>
      <p className="text-subtitle mb-2">학생 목록</p>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        <button type="button" onClick={() => setClassFilter("all")} className={classFilter === "all" ? "shrink-0 rounded-full bg-brand-amber px-3 py-1.5 text-caption font-bold text-surface-page" : "shrink-0 rounded-full bg-surface-raised px-3 py-1.5 text-caption text-text-secondary"}>전체</button>
        {classFilters.map((membership) => <button key={membership.classId} type="button" onClick={() => setClassFilter(membership.classId)} className={classFilter === membership.classId ? "shrink-0 rounded-full bg-brand-amber px-3 py-1.5 text-caption font-bold text-surface-page" : "shrink-0 rounded-full bg-surface-raised px-3 py-1.5 text-caption text-text-secondary"}>{membership.className}</button>)}
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full table-fixed text-micro sm:text-body">
          <colgroup><col className="w-[14%]"/><col className="w-[20%]"/><col className="w-[27%]"/><col className="w-[11%]"/><col className="w-[28%]"/></colgroup>
          <thead><tr className="border-b border-border text-left text-micro text-text-secondary sm:text-caption"><th className="p-1.5 sm:p-2.5">이름</th><th className="p-1.5 sm:p-2.5">생년월일</th><th className="p-1.5 sm:p-2.5">소속반</th><th className="p-1.5 text-center sm:p-2.5">스티커</th><th className="p-1.5 sm:p-2.5">처리</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-5 text-center text-text-secondary">불러오는 중...</td></tr>}
            {!loading && !visibleStudents.length && <tr><td colSpan={5} className="p-5 text-center text-text-secondary">{students.length ? "선택한 소속반의 학생이 없습니다." : "등록된 학생이 없습니다."}</td></tr>}
            {visibleStudents.map((student) => <Fragment key={student.id}><tr id={`student-${student.id}`} className={`border-b border-border ${student.connectionStatus === "pending" ? "bg-state-warningBg/40" : ""} ${focusedStudentId === student.id ? "outline outline-2 outline-brand-amber outline-offset-[-2px]" : ""}`}>
              <td className="break-keep p-1.5 font-semibold sm:p-2.5"><button type="button" onClick={()=>setExpandedStudentId(current=>current===student.id?null:student.id)} className="text-left">{student.name}</button>{isBirthday(student.birthDate)&&<span className="mt-1 block text-micro text-brand-amber">🎂</span>}</td>
              <td className="whitespace-nowrap p-1.5 sm:p-2.5"><span className="sm:hidden">{compactBirthDate(student.birthDate)}</span><span className="hidden sm:inline">{student.birthDate ?? "-"}</span></td><td className="p-1.5 sm:p-2.5"><div className="flex flex-col items-start gap-1">{student.classMemberships.filter((membership) => !membership.isDefault).map((membership)=><span key={membership.classId} title={membership.className} className="flex w-full min-w-0 items-center gap-1 rounded-full bg-surface-raised px-1.5 py-1 text-micro sm:px-2 sm:text-caption"><span className="min-w-0 truncate">{membership.className}</span><button type="button" aria-label={`${membership.className} 소속 해지`} className="shrink-0 text-state-danger" onClick={()=>{if(window.confirm(`${student.name} 학생의 ${membership.className} 소속을 해지할까요?`))void updateConnection(student,"remove_class",membership.classId);}}>×</button></span>)}<button type="button" aria-label={`${student.name} 학생 소속반 추가`} title="소속반 추가" className="flex h-6 w-6 items-center justify-center rounded-full border border-brand-amber text-body font-bold text-brand-amber" onClick={() => { setClassPickerStudentId(student.id); setSelectedClassIds([]); }}>+</button></div></td><td className="p-1 text-center font-semibold sm:p-2.5">{student.totalStickers}</td>
              <td className="p-1.5 sm:p-2.5"><div className="flex flex-wrap items-center gap-1">{student.connectionStatus === "connected" ? <button disabled={processingId === student.id} className="rounded-md border border-state-danger px-1.5 py-1 text-micro text-state-danger disabled:opacity-50 sm:rounded-lg sm:px-2.5 sm:text-caption" onClick={() => updateConnection(student, "disconnect")}>연결 해지</button> : student.connectionStatus === "pending" ? <><span className="text-micro font-semibold text-brand-amber sm:text-caption">연결중</span><button disabled={processingId === student.id} className="rounded-md border border-state-success px-1.5 py-1 text-micro text-state-success disabled:opacity-50 sm:rounded-lg sm:text-caption" onClick={() => updateConnection(student, "approve")}>승인</button><button disabled={processingId === student.id} className="rounded-md border border-border px-1.5 py-1 text-micro text-text-secondary disabled:opacity-50 sm:rounded-lg sm:text-caption" onClick={() => updateConnection(student, "revoke_pending")}>해지</button></> : <span className="text-micro text-text-muted sm:text-caption">미연결</span>}{canDeleteStudents && <button disabled={processingId === student.id} className="px-1 py-1 text-micro text-state-danger disabled:opacity-50 sm:px-2.5 sm:text-caption" onClick={() => updateConnection(student, "delete")}>삭제</button>}</div></td>
            </tr>{expandedStudentId===student.id&&<tr className="border-b border-border bg-surface-raised/50"><td colSpan={5} className="p-3 sm:p-4"><p className="mb-2 text-caption font-bold">받고 싶은 선물</p>{student.wantedPrizes.length?<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{student.wantedPrizes.map(prize=><div key={prize.id} className="flex items-center gap-2 rounded-lg bg-surface-page p-2"><img src={prize.imageUrl??"/images/placeholder-product.svg"} onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src="/images/placeholder-product.svg";}} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover"/><span className="line-clamp-2 text-caption">{prize.title}</span></div>)}</div>:<p className="text-caption text-text-muted">아직 받고 싶다고 선택한 선물이 없습니다.</p>}</td></tr>}</Fragment>)}
          </tbody>
        </table>
      </div>
      {classPickerStudent && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => { setClassPickerStudentId(null); setSelectedClassIds([]); }}>
        <section role="dialog" aria-modal="true" aria-label={`${classPickerStudent.name} 학생 소속반 추가`} className="w-full max-w-md rounded-2xl border border-border bg-surface-card p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
          <h3 className="text-subtitle">{classPickerStudent.name} 학생 소속반 추가</h3>
          <p className="mt-1 text-caption text-text-secondary">추가할 특강반을 모두 선택해 주세요. 기본 정규반은 자동 소속됩니다.</p>
          <div className="my-4 max-h-72 space-y-2 overflow-y-auto">
            {classesToAdd.map((classRoom) => {
              const selected = selectedClassIds.includes(classRoom.id);
              return <button key={classRoom.id} type="button" onClick={() => setSelectedClassIds((current) => selected ? current.filter((id) => id !== classRoom.id) : [...current, classRoom.id])} className={selected ? "flex w-full items-center justify-between rounded-xl border border-brand-amber bg-brand-amber/10 p-3 text-left text-body font-bold" : "flex w-full items-center justify-between rounded-xl border border-border p-3 text-left text-body"}><span>{classRoom.name}</span><span aria-hidden="true">{selected ? "✓" : ""}</span></button>;
            })}
            {!classesToAdd.length && <p className="rounded-xl bg-surface-raised p-4 text-center text-body text-text-secondary">추가할 수 있는 특강반이 없습니다.</p>}
          </div>
          <div className="flex justify-end gap-2"><button type="button" className="rounded-lg border border-border px-4 py-2 text-body" onClick={() => { setClassPickerStudentId(null); setSelectedClassIds([]); }}>취소</button><button type="button" disabled={!selectedClassIds.length || processingId === classPickerStudent.id} className="rounded-lg bg-brand-amber px-4 py-2 text-body font-bold text-surface-page disabled:opacity-50" onClick={() => void addClasses()}>추가하기</button></div>
        </section>
      </div>}
    </div>
  );
}
