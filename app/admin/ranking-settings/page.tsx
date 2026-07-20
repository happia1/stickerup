"use client";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { computePeriodBounds } from "@/lib/ranking";
import { RANKING_UNIT_LABEL } from "@/lib/types";
import type { RankingUnit } from "@/lib/types";

function UnitSelect({ value, onChange }: { value: RankingUnit; onChange: (u: RankingUnit) => void }) {
  return (
    <select
      className="border border-border rounded-lg px-2.5 py-1.5 text-body"
      value={value}
      onChange={(e) => onChange(e.target.value as RankingUnit)}
    >
      {Object.entries(RANKING_UNIT_LABEL).map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}

function CustomDaysInput({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={1}
        className="w-16 border border-border rounded-lg px-2 py-1.5 text-body"
        value={value ?? 7}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
      />
      <span className="text-caption text-text-secondary">일 주기로 직접 입력</span>
    </div>
  );
}

export default function AdminRankingSettingsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const globalConfig = state.rankingPeriodConfigs.find((c) => c.class_id === null);
  const globalUnit = globalConfig?.unit ?? "month";
  const globalCustomDays = globalConfig?.custom_days ?? null;
  const globalBounds = computePeriodBounds(globalUnit, undefined, globalCustomDays);

  const groupClasses = state.classes.filter((c) => !c.is_default && c.status === "active");

  return (
    <div>
      <h2 className="text-title mb-1">랭킹 노출 설정</h2>
      <p className="text-caption text-text-secondary mb-5">
        학생 화면의 기본 노출 기간을 설정해요. 기본값은 당일이 속한 달(이번 달)이에요.
      </p>

      <div className="bg-surface-page rounded-card p-5 max-w-lg mb-6">
        <h4 className="text-body font-bold mb-3">전체(글로벌) 랭킹 기본 단위기간</h4>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <UnitSelect
            value={globalUnit}
            onChange={(u) => dispatch({ type: "SET_RANKING_UNIT", classId: null, unit: u, customDays: u === "custom" ? globalCustomDays ?? 7 : null })}
          />
          {globalUnit === "custom" && (
            <CustomDaysInput
              value={globalCustomDays}
              onChange={(n) => dispatch({ type: "SET_RANKING_UNIT", classId: null, unit: "custom", customDays: n })}
            />
          )}
          <span className="text-caption text-text-secondary">
            현재 주기: {globalBounds.period_start} ~ {globalBounds.period_end}
          </span>
        </div>
      </div>

      <div className="bg-state-warningBg text-state-warningText rounded-card p-4 mb-6 text-body">
        학생이 하나 이상의 특강반(그룹)에 소속된 경우, 홈 화면 랭킹은 전체 랭킹이 아니라{" "}
        <b>가장 먼저 승인된 그룹의 랭킹을 기본으로 우선 노출</b>해요. 그룹이 없는 학생은 전체 랭킹이 기본 노출돼요.
      </div>

      <p className="text-subtitle mb-2">그룹별 랭킹 단위기간 설정하기</p>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="p-2.5">반(그룹)</th>
              <th className="p-2.5">단위기간</th>
              <th className="p-2.5">직접 입력(일)</th>
              <th className="p-2.5">현재 주기</th>
            </tr>
          </thead>
          <tbody>
            {groupClasses.map((c) => {
              const config = state.rankingPeriodConfigs.find((r) => r.class_id === c.id);
              const unit = config?.unit ?? c.ranking_unit;
              const customDays = config?.custom_days ?? null;
              const bounds = computePeriodBounds(unit, undefined, customDays);
              return (
                <tr key={c.id} className="border-b last:border-0 border-border">
                  <td className="p-2.5 font-semibold">{c.name}</td>
                  <td className="p-2.5">
                    <UnitSelect
                      value={unit}
                      onChange={(u) => dispatch({ type: "SET_RANKING_UNIT", classId: c.id, unit: u, customDays: u === "custom" ? customDays ?? 7 : null })}
                    />
                  </td>
                  <td className="p-2.5">
                    {unit === "custom" ? (
                      <CustomDaysInput
                        value={customDays}
                        onChange={(n) => dispatch({ type: "SET_RANKING_UNIT", classId: c.id, unit: "custom", customDays: n })}
                      />
                    ) : (
                      <span className="text-caption text-text-muted">사용자 설정 기간 선택 시 입력</span>
                    )}
                  </td>
                  <td className="p-2.5 text-caption text-text-secondary">
                    {bounds.period_start} ~ {bounds.period_end}
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
