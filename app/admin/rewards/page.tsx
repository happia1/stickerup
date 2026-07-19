"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { campaignStatus, itemsForCampaign, claimsForItem } from "@/lib/store/selectors";
import { computePeriodBounds } from "@/lib/ranking";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast/provider";

const STATUS_LABEL = { scheduled: "예정", active: "진행중", ended: "종료" } as const;

export default function AdminRewardsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const groupClasses = state.classes.filter((c) => !c.is_default && c.status === "active");
  const [scopeId, setScopeId] = useState<string>("__all__");
  const [distType, setDistType] = useState<"count" | "ratio">("count");
  const [distValue, setDistValue] = useState(3);
  const [itemTitle, setItemTitle] = useState("");
  const [itemQty, setItemQty] = useState(5);

  const classIdForForm = scopeId === "__all__" ? null : scopeId;
  const unit =
    classIdForForm === null
      ? state.rankingPeriodConfigs.find((c) => c.class_id === null)?.unit ?? "month"
      : state.rankingPeriodConfigs.find((c) => c.class_id === classIdForForm)?.unit ?? "month";
  const bounds = computePeriodBounds(unit);

  return (
    <div>
      <h2 className="text-title mb-1">상품(리워드) 관리</h2>
      <p className="text-caption text-text-secondary mb-5">
        캠페인은 그룹의 랭킹 단위기간에 연동돼요. 주기가 끝나면 자동 종료되며, 다음 주기 보상은 다시 등록해야 해요.
      </p>

      {state.rewardCampaigns.map((c) => {
        const cls = c.class_id ? state.classes.find((x) => x.id === c.class_id) : null;
        const items = itemsForCampaign(state, c.id);
        const claimedTotal = items.reduce((sum, i) => sum + claimsForItem(state, i.id).length, 0);
        const qtyTotal = items.reduce((sum, i) => sum + i.qty, 0);
        const status = campaignStatus(c);
        return (
          <div key={c.id} className="bg-surface-page rounded-card p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-body font-bold">{cls ? `${cls.name} 랭킹 보상` : "전체 랭킹 보상"}</h4>
              <span className="text-caption bg-surface-card border border-border rounded-lg px-2 py-0.5">
                {c.period_start} ~ {c.period_end}
              </span>
              <Pill tone={status === "active" ? "ok" : status === "ended" ? "danger" : "wait"}>{STATUS_LABEL[status]}</Pill>
            </div>
            <div className="border border-border rounded-xl overflow-hidden mb-2">
              <table className="w-full text-body">
                <thead>
                  <tr className="text-caption text-text-secondary text-left border-b border-border">
                    <th className="p-2">상품</th>
                    <th className="p-2">수량</th>
                    <th className="p-2">선택 완료</th>
                    <th className="p-2">남은 수량</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => {
                    const claims = claimsForItem(state, i.id);
                    return (
                      <tr key={i.id} className="border-b last:border-0 border-border">
                        <td className="p-2">{i.title}</td>
                        <td className="p-2">{i.qty}</td>
                        <td className="p-2">{claims.map((cl) => state.students.find((s) => s.id === cl.student_id)?.name).join(", ") || "-"}</td>
                        <td className="p-2">{i.qty - claims.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-caption text-text-muted">
              전체 진행률: {claimedTotal}/{qtyTotal} 선택 완료
            </p>
          </div>
        );
      })}

      <div className="bg-surface-page rounded-card p-5 max-w-lg">
        <h4 className="text-body font-bold mb-3">새 상품 캠페인 등록</h4>
        <label className="block text-caption font-semibold text-text-secondary mb-1">적용 그룹</label>
        <select className="w-full border border-border rounded-lg px-2.5 py-2 text-body mb-3" value={scopeId} onChange={(e) => setScopeId(e.target.value)}>
          <option value="__all__">전체(글로벌)</option>
          {groupClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-caption text-text-muted mb-3">
          해당 그룹의 현재 랭킹 주기: {bounds.period_start} ~ {bounds.period_end} (랭킹 노출 설정에서 변경 가능)
        </p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-caption font-semibold text-text-secondary mb-1">대상 기준</label>
            <select className="w-full border border-border rounded-lg px-2.5 py-2 text-body" value={distType} onChange={(e) => setDistType(e.target.value as "count" | "ratio")}>
              <option value="count">상위 인원 수</option>
              <option value="ratio">상위 비율(%)</option>
            </select>
          </div>
          <div>
            <label className="block text-caption font-semibold text-text-secondary mb-1">{distType === "count" ? "인원 수" : "비율(%)"}</label>
            <input
              type="number"
              className="w-full border border-border rounded-lg px-2.5 py-2 text-body"
              value={distType === "count" ? distValue : Math.round(distValue * 100)}
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                setDistValue(distType === "count" ? v : v / 100);
              }}
            />
          </div>
          <div>
            <label className="block text-caption font-semibold text-text-secondary mb-1">상품명</label>
            <input className="w-full border border-border rounded-lg px-2.5 py-2 text-body" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder="예: 문화상품권 1만원" />
          </div>
          <div>
            <label className="block text-caption font-semibold text-text-secondary mb-1">수량</label>
            <input type="number" className="w-full border border-border rounded-lg px-2.5 py-2 text-body" value={itemQty} onChange={(e) => setItemQty(Number(e.target.value) || 0)} />
          </div>
        </div>
        <Button
          onClick={() => {
            if (!itemTitle.trim()) {
              showToast("상품명을 입력해주세요.");
              return;
            }
            dispatch({
              type: "ADD_REWARD_CAMPAIGN",
              classId: classIdForForm,
              periodStart: bounds.period_start,
              periodEnd: bounds.period_end,
              distributionType: distType,
              distributionValue: distValue,
              itemTitle,
              itemQty,
            });
            showToast("새 상품 캠페인이 등록되었어요.");
            setItemTitle("");
          }}
        >
          캠페인 등록하기
        </Button>
      </div>
    </div>
  );
}
