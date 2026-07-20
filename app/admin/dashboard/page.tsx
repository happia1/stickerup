"use client";
import { useAppState } from "@/lib/store/provider";
import { pendingCounts } from "@/lib/store/selectors";
import { getRanking } from "@/lib/ranking";
import { KpiCard } from "@/components/layout/KpiCard";
import { DEMO_NOW } from "@/lib/demoClock";

export default function AdminDashboardPage() {
  const state = useAppState();
  const counts = pendingCounts(state);
  const cancelled = state.ledger.filter((l) => l.status === "rolled_back").length;
  const todayStr = DEMO_NOW.toISOString().slice(0, 10);
  const rows = getRanking({
    ledger: state.ledger,
    enrollments: state.enrollments,
    studentIds: state.students.map((s) => s.id),
    classId: null,
    periodStart: "2000-01-01",
    periodEnd: "2999-12-31",
  }).slice(0, 5);

  const medalLabel = { gold: "금", silver: "은", bronze: "동" } as const;

  return (
    <div>
      <h2 className="text-title mb-1">대시보드</h2>
      <p className="text-caption text-text-secondary mb-5">오늘({todayStr}) 현황 요약이에요.</p>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <KpiCard label="숙제 승인 대기" value={`${counts.homework}건`} />
        <KpiCard label="칭찬 승인 대기" value={`${counts.praise}건`} />
        <KpiCard label="반 승인 대기" value={`${counts.enrollment}건`} />
        <KpiCard label="누적 롤백(취소) 건" value={`${cancelled}건`} />
      </div>

      <p className="text-subtitle mb-2">전체 총 랭킹 TOP 5 (전체 기간)</p>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="p-2.5">순위</th>
              <th className="p-2.5">이름</th>
              <th className="p-2.5">소속 반</th>
              <th className="p-2.5">총 스티커</th>
              <th className="p-2.5">등급</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const student = state.students.find((s) => s.id === r.student_id);
              const classNames = state.classes
                .filter((c) => state.enrollments.some((e) => e.student_id === r.student_id && e.class_id === c.id && e.status === "approved"))
                .map((c) => c.name)
                .join(", ");
              return (
                <tr key={r.student_id} className="border-b last:border-0 border-border">
                  <td className="p-2.5">{r.rank}</td>
                  <td className="p-2.5">{student?.name}</td>
                  <td className="p-2.5">{classNames}</td>
                  <td className="p-2.5">{r.total_count}</td>
                  <td className="p-2.5">{r.medal ? medalLabel[r.medal] : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
