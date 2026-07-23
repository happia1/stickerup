"use client";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { computePeriodBounds } from "@/lib/ranking";
import { RANKING_UNIT_LABEL } from "@/lib/types";
import type { RankingUnit } from "@/lib/types";

function UnitSelect({ value, onChange, includeAll = false }: { value: RankingUnit; onChange: (u: RankingUnit) => void; includeAll?: boolean }) {
  return (
    <select
      className="border border-border rounded-lg px-2.5 py-1.5 text-body"
      value={value}
      onChange={(e) => onChange(e.target.value as RankingUnit)}
    >
      {Object.entries(RANKING_UNIT_LABEL).filter(([v]) => includeAll || v !== "all").map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}

function CustomRangeInput({ start, end, onChange }: { start: string; end: string; onChange: (start: string, end: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input type="date" aria-label="랭킹 시작일" className="border border-border rounded-lg px-2 py-1.5 text-body" value={start} max={end || undefined} onChange={(e) => onChange(e.target.value, end)} />
      <span className="text-caption text-text-secondary">~</span>
      <input type="date" aria-label="랭킹 종료일" className="border border-border rounded-lg px-2 py-1.5 text-body" value={end} min={start || undefined} onChange={(e) => onChange(start, e.target.value)} />
    </div>
  );
}

export default function AdminRankingSettingsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const globalConfig = state.rankingPeriodConfigs.find((c) => c.class_id === null);
  const globalUnit = globalConfig?.unit ?? "month";
  const globalCustomDays = globalConfig?.custom_days ?? null;
  const globalBounds = computePeriodBounds(globalUnit, undefined, globalCustomDays, globalConfig?.custom_start ?? null, globalConfig?.custom_end ?? null);

  const groupClasses = state.classes.filter((c) => !c.is_default && c.status === "active");
  const defaultClass = state.classes.find((c) => c.is_default);

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
            includeAll
            value={globalUnit}
            onChange={(u) => dispatch({ type: "SET_RANKING_UNIT", classId: null, unit: u, customStart: u === "custom" ? globalBounds.period_start : null, customEnd: u === "custom" ? globalBounds.period_end : null })}
          />
          {globalUnit === "custom" && (
            <CustomRangeInput
              start={globalConfig?.custom_start ?? globalBounds.period_start}
              end={globalConfig?.custom_end ?? globalBounds.period_end}
              onChange={(start, end) => dispatch({ type: "SET_RANKING_UNIT", classId: null, unit: "custom", customStart: start, customEnd: end })}
            />
          )}
          <span className="text-caption text-text-secondary">
            현재 주기: {globalUnit === "all" ? `처음부터 ~ ${globalBounds.period_end}` : `${globalBounds.period_start} ~ ${globalBounds.period_end}`}
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
              const bounds = computePeriodBounds(unit, undefined, customDays, config?.custom_start ?? null, config?.custom_end ?? null);
              return (
                <tr key={c.id} className="border-b last:border-0 border-border">
                  <td className="p-2.5 font-semibold">{c.name}</td>
                  <td className="p-2.5">
                    <UnitSelect
                      value={unit}
                      onChange={(u) => dispatch({ type: "SET_RANKING_UNIT", classId: c.id, unit: u, customStart: u === "custom" ? bounds.period_start : null, customEnd: u === "custom" ? bounds.period_end : null })}
                    />
                  </td>
                  <td className="p-2.5">
                    {unit === "custom" ? (
                      <CustomRangeInput
                        start={config?.custom_start ?? bounds.period_start}
                        end={config?.custom_end ?? bounds.period_end}
                        onChange={(start, end) => dispatch({ type: "SET_RANKING_UNIT", classId: c.id, unit: "custom", customStart: start, customEnd: end })}
                      />
                    ) : (
                      <span className="text-caption text-text-muted">사용자 설정 기간 선택 시 날짜 입력</span>
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

      <section className="mt-6 rounded-card border border-border bg-surface-page p-5">
        <h3 className="text-subtitle">랭킹 집계 공식</h3>
        <p className="mt-1 text-caption text-text-secondary">
          선택한 단위기간 안의 활성 스티커 기록을 아래 기준으로 합산해요.
        </p>

        <div className="mt-4 space-y-2 text-body">
          <div className="grid gap-1 rounded-lg bg-surface-raised p-3 sm:grid-cols-[110px_1fr] sm:items-center">
            <strong>전체 랭킹</strong>
            <span>하루 1회 출석 + 모든 특강반 과제 + 모든 칭찬</span>
          </div>
          <div className="grid gap-1 rounded-lg bg-surface-raised p-3 sm:grid-cols-[110px_1fr] sm:items-center">
            <strong>{defaultClass?.name ?? "기본반"} 랭킹</strong>
            <span>하루 1회 출석 + 모든 칭찬</span>
          </div>
          <div className="grid gap-1 rounded-lg bg-surface-raised p-3 sm:grid-cols-[110px_1fr] sm:items-center">
            <strong>특강반 랭킹</strong>
            <span>하루 1회 출석 + 해당 특강반 과제 + 모든 칭찬</span>
          </div>
        </div>

        <p className="mt-3 text-caption leading-relaxed text-text-secondary">
          출석은 소속 반 수와 관계없이 한국 날짜 기준 하루의 첫 활성 기록 한 건만 집계하며, 취소·롤백된 기록은 제외해요.
        </p>
      </section>
    </div>
  );
}
