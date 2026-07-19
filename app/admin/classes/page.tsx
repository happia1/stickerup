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
  const [attendanceTime, setAttendanceTime] = useState("19:00");
  const [specialStart, setSpecialStart] = useState("");
  const [specialEnd, setSpecialEnd] = useState("");
  const [rankingUnit, setRankingUnit] = useState<RankingUnit>("month");

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-title">반 관리</h2>
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? "닫기" : "+ 반 추가"}</Button>
      </div>
      <p className="text-caption text-text-secondary mb-5">
        기본반은 상시 운영, 특강반은 운영 기간이 끝나면 자동 해제돼요.
      </p>

      {showForm && (
        <div className="bg-surface-page rounded-card p-5 mb-6 max-w-lg">
          <h4 className="text-body font-bold mb-3">새 반 추가</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-caption font-semibold text-text-secondary mb-1">반 이름</label>
              <input className="w-full border border-border rounded-lg px-2.5 py-2 text-body" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 물리 특강반" />
            </div>
            <div>
              <label className="block text-caption font-semibold text-text-secondary mb-1">정규 출석 시각</label>
              <input type="time" className="w-full border border-border rounded-lg px-2.5 py-2 text-body" value={attendanceTime} onChange={(e) => setAttendanceTime(e.target.value)} />
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
                {Object.entries(RANKING_UNIT_LABEL).map(([v, l]) => (
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
                attendanceTime,
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

      <div className="border border-border rounded-xl overflow-hidden mb-6">
        <table className="w-full text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="p-2.5">반</th>
              <th className="p-2.5">정규 출석 시각</th>
              <th className="p-2.5">특강 기간</th>
              <th className="p-2.5">랭킹 단위</th>
              <th className="p-2.5">소속 학생 수</th>
              <th className="p-2.5">상태</th>
            </tr>
          </thead>
          <tbody>
            {state.classes.map((c) => {
              const studentCount = state.enrollments.filter((e) => e.class_id === c.id && e.status === "approved").length;
              const config = state.rankingPeriodConfigs.find((r) => r.class_id === c.id);
              return (
                <tr key={c.id} className="border-b last:border-0 border-border">
                  <td className="p-2.5 font-semibold">{c.name}</td>
                  <td className="p-2.5">
                    <input
                      type="time"
                      className="border border-border rounded-lg px-2 py-1 text-body"
                      value={c.attendance_time}
                      onChange={(e) => dispatch({ type: "UPDATE_CLASS_ATTENDANCE_TIME", classId: c.id, attendanceTime: e.target.value })}
                    />
                  </td>
                  <td className="p-2.5">{c.special_start ? `${c.special_start} ~ ${c.special_end}` : "상시"}</td>
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
