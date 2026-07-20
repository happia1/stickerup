"use client";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { totalStickers } from "@/lib/store/selectors";
import { Pill } from "@/components/ui/Pill";

export default function AdminStudentsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div>
      <h2 className="text-title mb-1">학생 관리</h2>
      <p className="text-caption text-text-secondary mb-5">
        학생별 반 소속 현황과 반 승인 대기 요청을 확인·처리해요.
      </p>

      <p className="text-subtitle mb-2">학생 목록</p>
      <div className="border border-border rounded-xl overflow-hidden mb-6">
        <table className="w-full text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="p-2.5">이름</th>
              <th className="p-2.5">나이</th>
              <th className="p-2.5">소속 반</th>
              <th className="p-2.5">총 스티커</th>
            </tr>
          </thead>
          <tbody>
            {state.students.map((s) => {
              const classNames = state.classes
                .filter((c) => state.enrollments.some((e) => e.student_id === s.id && e.class_id === c.id && e.status === "approved"))
                .map((c) => c.name)
                .join(", ");
              return (
                <tr key={s.id} className="border-b last:border-0 border-border">
                  <td className="p-2.5 font-semibold">{s.name}</td>
                  <td className="p-2.5">{s.age}</td>
                  <td className="p-2.5">{classNames}</td>
                  <td className="p-2.5">{totalStickers(state, s.id)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-subtitle mb-2">반 승인 대기 요청</p>
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
