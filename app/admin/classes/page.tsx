"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { RANKING_UNIT_LABEL } from "@/lib/types";
import type { RankingUnit } from "@/lib/types";
import { useToast } from "@/lib/toast/provider";

export default function AdminClassesPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [specialStart, setSpecialStart] = useState("");
  const [specialEnd, setSpecialEnd] = useState("");
  const [rankingUnit, setRankingUnit] = useState<RankingUnit>("month");
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [editingStart, setEditingStart] = useState("");
  const [editingEnd, setEditingEnd] = useState("");
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const defaultClass = state.classes.find((cls) => cls.is_default);
  const specialClasses = state.classes.filter((cls) => !cls.is_default);

  function beginPeriodEdit(classId: string, start: string | null, end: string | null) {
    setEditingPeriodId(classId);
    setEditingStart(start ?? "");
    setEditingEnd(end ?? "");
  }

  function savePeriod(classId: string) {
    if (!editingStart || !editingEnd) {
      showToast("특강 시작일과 종료일을 모두 입력해주세요.");
      return;
    }
    if (editingStart > editingEnd) {
      showToast("특강 종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }
    dispatch({ type: "UPDATE_CLASS_SPECIAL_PERIOD", classId, specialStart: editingStart, specialEnd: editingEnd });
    setEditingPeriodId(null);
    showToast("특강 기간을 수정했어요.");
  }

  function saveClassName(classId: string) {
    const nextName = editingName.trim();
    if (!nextName) return showToast("반 이름을 입력해 주세요.");
    dispatch({ type: "UPDATE_CLASS_NAME", classId, name: nextName });
    setEditingNameId(null);
    setEditingName("");
    showToast("반 이름을 수정했어요.");
  }

  return (
    <div className="classes-page">
      <div className="classes-page-header flex items-center justify-between mb-1">
        <h2 className="text-title">반 관리</h2>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "닫기" : "+ 특강반 추가"}</Button>
      </div>
      <p className="text-caption text-text-secondary mb-5">
        모든 학생은 기본 소속 반에 들어가며, 학생은 여러 특강반에 동시에 소속될 수 있어요.
      </p>

      <section className="mb-6 rounded-card border border-border bg-surface-page p-5">
        <h3 className="text-subtitle">기본 소속 반 설정</h3>
        <p className="mb-4 mt-1 text-caption text-text-secondary">관리자가 이름을 정하지 않으면 기본반으로 표시되며 운영 기간은 상시입니다.</p>
        {defaultClass ? (
          <div className="grid items-end gap-4 sm:grid-cols-2">
            <div>
              <p className="text-caption text-text-secondary">반 이름</p>
              {editingNameId === defaultClass.id ? (
                <div className="mt-2 flex items-center gap-1">
                  <input autoFocus value={editingName} onChange={(event) => setEditingName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveClassName(defaultClass.id); if (event.key === "Escape") setEditingNameId(null); }} aria-label="기본 소속 반 이름 수정" className="min-w-0 flex-1 rounded-lg border border-border px-2 py-1 text-body" />
                  <button type="button" onClick={() => saveClassName(defaultClass.id)} className="rounded-lg border border-state-success px-2 py-1 text-caption text-state-success">저장</button>
                  <button type="button" onClick={() => setEditingNameId(null)} className="px-1 py-1 text-caption text-text-muted">취소</button>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2"><p className="font-bold">{defaultClass.name}</p><button type="button" onClick={() => { setEditingNameId(defaultClass.id); setEditingName(defaultClass.name); }} className="rounded-lg border border-border px-2 py-1 text-caption text-text-secondary">이름 수정</button></div>
              )}
            </div>
            <div><p className="text-caption text-text-secondary">운영 기간</p><p className="mt-2 font-bold text-state-success">상시</p></div>
          </div>
        ) : <p className="text-caption text-state-danger">기본 소속 반이 없습니다. 데이터베이스 설정을 확인해 주세요.</p>}
      </section>

      {showForm && (
        <div className="bg-surface-page rounded-card p-5 mb-6 max-w-lg">
          <h4 className="text-body font-bold mb-3">새 특강반 추가</h4>
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-caption font-semibold text-text-secondary mb-1">반 이름</label>
              <input className="w-full border border-border rounded-lg px-2.5 py-2 text-body" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 물리 특강반" />
            </div>
            <div>
              <label className="block text-caption font-semibold text-text-secondary mb-1">특강 시작일 (선택)</label>
              <input type="date" className="w-full border border-border rounded-lg px-2.5 py-2 text-body" value={specialStart} onChange={(e) => setSpecialStart(e.target.value)} />
            </div>
            <div>
              <label className="block text-caption font-semibold text-text-secondary mb-1">특강 종료일 (선택)</label>
              <input type="date" className="w-full border border-border rounded-lg px-2.5 py-2 text-body" value={specialEnd} onChange={(e) => setSpecialEnd(e.target.value)} />
            </div>
            <div>
              <label className="block text-caption font-semibold text-text-secondary mb-1">랭킹 단위기간</label>
              <select className="w-full border border-border rounded-lg px-2.5 py-2 text-body" value={rankingUnit} onChange={(e) => setRankingUnit(e.target.value as RankingUnit)}>
                {Object.entries(RANKING_UNIT_LABEL).filter(([v]) => v !== "all").map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button
            onClick={() => {
              if (!name.trim()) {
                showToast("반 이름을 입력해주세요.");
                return;
              }
              dispatch({
                type: "ADD_CLASS",
                name,
                specialStart: specialStart || null,
                specialEnd: specialEnd || null,
                rankingUnit,
              });
              showToast(`"${name}" 반이 추가되었어요.`);
              setName("");
              setSpecialStart("");
              setSpecialEnd("");
              setShowForm(false);
            }}
          >
            반 추가하기
          </Button>
        </div>
      )}

      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-subtitle">특강반 목록</h3>
        <Button onClick={() => setShowForm((value) => !value)}>{showForm ? "닫기" : "+ 특강반 추가"}</Button>
      </div>
      <div className="mb-6 overflow-x-auto rounded-xl border border-border">
        <table className="min-w-[620px] table-fixed text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="w-44 p-2.5">반</th>
              <th className="w-72 p-2.5">특강 기간</th>
              <th className="w-24 p-2.5">랭킹 단위</th>
              <th className="w-24 p-2.5">소속 학생 수</th>
              <th className="w-20 p-2.5">상태</th>
            </tr>
          </thead>
          <tbody>
            {specialClasses.map((c) => {
              const studentCount = state.enrollments.filter((e) => e.class_id === c.id && e.status === "approved").length;
              const config = state.rankingPeriodConfigs.find((r) => r.class_id === c.id);
              return (
                <tr key={c.id} className="border-b last:border-0 border-border">
                  <td className="p-2.5 font-semibold">{editingNameId===c.id?<div className="flex items-center gap-1"><input autoFocus value={editingName} onChange={event=>setEditingName(event.target.value)} onKeyDown={event=>{if(event.key==="Enter")saveClassName(c.id);if(event.key==="Escape")setEditingNameId(null);}} aria-label={`${c.name} 이름 수정`} className="min-w-0 flex-1 rounded-lg border border-border px-2 py-1 text-body"/><button type="button" onClick={()=>saveClassName(c.id)} className="rounded-lg border border-state-success px-2 py-1 text-caption text-state-success">저장</button><button type="button" onClick={()=>setEditingNameId(null)} className="px-1 py-1 text-caption text-text-muted">취소</button></div>:<div className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate">{c.name}</span><button type="button" onClick={()=>{setEditingNameId(c.id);setEditingName(c.name);}} className="shrink-0 rounded-lg border border-border px-2 py-1 text-caption text-text-secondary">수정</button></div>}</td>
                  <td className="p-2.5">
                    {c.is_default ? (
                      "상시"
                    ) : editingPeriodId === c.id ? (
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <input type="date" aria-label={`${c.name} 특강 시작일`} className="min-w-0 flex-1 rounded-lg border border-border px-2 py-1 text-caption" value={editingStart} max={editingEnd || undefined} onChange={(e) => setEditingStart(e.target.value)} />
                        <span className="text-text-secondary">~</span>
                        <input type="date" aria-label={`${c.name} 특강 종료일`} className="min-w-0 flex-1 rounded-lg border border-border px-2 py-1 text-caption" value={editingEnd} min={editingStart || undefined} onChange={(e) => setEditingEnd(e.target.value)} />
                        <button type="button" className="rounded-lg border border-state-success px-2 py-1 text-caption text-state-success" onClick={() => savePeriod(c.id)}>저장</button>
                        <button type="button" className="rounded-lg border border-border px-2 py-1 text-caption text-text-secondary" onClick={() => setEditingPeriodId(null)}>취소</button>
                      </div>
                    ) : (
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="min-w-0 flex-1 whitespace-nowrap">{c.special_start && c.special_end ? `${c.special_start} ~ ${c.special_end}` : "기간 미설정"}</span>
                        <button type="button" className="rounded-lg border border-border px-2 py-1 text-caption text-text-secondary hover:text-text-primary" onClick={() => beginPeriodEdit(c.id, c.special_start, c.special_end)}>수정</button>
                      </div>
                    )}
                  </td>
                  <td className="p-2.5">{RANKING_UNIT_LABEL[config?.unit ?? c.ranking_unit]}</td>
                  <td className="p-2.5">{studentCount}명</td>
                  <td className="p-2.5">
                    <Pill tone={c.status === "active" ? "ok" : "neutral"}>{c.status === "active" ? "운영중" : "종료"}</Pill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-subtitle mb-2">반별 승인 대기 신청자</p>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="p-2.5">학생</th>
              <th className="p-2.5">신청 반</th>
              <th className="p-2.5">신청일</th>
              <th className="p-2.5">처리</th>
            </tr>
          </thead>
          <tbody>
            {state.enrollments
              .filter((e) => e.status === "pending")
              .map((e) => {
                const student = state.students.find((s) => s.id === e.student_id);
                const cls = state.classes.find((c) => c.id === e.class_id);
                return (
                  <tr key={e.id} className="border-b last:border-0 border-border">
                    <td className="p-2.5">{student?.name}</td>
                    <td className="p-2.5">{cls?.name}</td>
                    <td className="p-2.5">{e.requested_at.slice(0, 10)}</td>
                    <td className="p-2.5 flex gap-1.5">
                      <button
                        className="border border-state-success text-state-success rounded-lg px-2 py-1 text-caption"
                        onClick={() => dispatch({ type: "APPROVE_ENROLLMENT", enrollmentId: e.id, approverId: state.currentUserId })}
                      >
                        승인
                      </button>
                      <button
                        className="border border-state-danger text-state-danger rounded-lg px-2 py-1 text-caption"
                        onClick={() => dispatch({ type: "REJECT_ENROLLMENT", enrollmentId: e.id })}
                      >
                        반려
                      </button>
                    </td>
                  </tr>
                );
              })}
            {state.enrollments.filter((e) => e.status === "pending").length === 0 && (
              <tr>
                <td className="p-2.5 text-center text-text-secondary" colSpan={4}>
                  대기 중인 신청이 없어요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
