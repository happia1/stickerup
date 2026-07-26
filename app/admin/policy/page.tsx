"use client";

import { useAppState } from "@/lib/store/provider";
import type { TierConfig } from "@/lib/types";

function PolicyTable({ tiers }: { tiers: TierConfig[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full table-fixed text-body">
        <thead>
          <tr className="border-b border-border text-left text-caption text-text-secondary">
            <th className="p-2.5">구간</th>
            <th className="p-2.5">기준</th>
            <th className="w-20 p-2.5 text-right">지급</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier) => (
            <tr key={tier.tier} className="border-b border-border last:border-0">
              <td className="p-2.5 font-semibold">{tier.label}</td>
              <td className="p-2.5 text-text-secondary">{tier.rangeText}</td>
              <td className="p-2.5 text-right font-bold text-brand-amber">{tier.count}점</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPolicyPage() {
  const state = useAppState();

  return (
    <div>
      <h2 className="mb-1 text-title">스티커 정책 설정</h2>
      <p className="mb-5 text-caption text-text-secondary">
        출석은 학생당 하루 한 번, 과제는 승인된 특강반마다 하루 한 번 지급돼요.
      </p>

      <section className="mb-6 rounded-card bg-surface-page p-4">
        <h3 className="mb-1 text-subtitle">출석 지급 기준 설정</h3>
        <p className="mb-3 text-caption text-text-secondary">학생이 선택한 출석 구간에 따라 점수가 자동 지급돼요.</p>
        <PolicyTable tiers={state.attendancePolicy} />
      </section>

      <section className="rounded-card bg-surface-page p-4">
        <h3 className="mb-1 text-subtitle">과제율별 지급 수 설정</h3>
        <p className="mb-3 text-caption text-text-secondary">과제 완료율 구간에 따라 점수가 자동 지급돼요.</p>
        <PolicyTable tiers={state.homeworkPolicy} />
      </section>
    </div>
  );
}
