"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { campaignStatus, itemsForCampaign, claimsForItem } from "@/lib/store/selectors";
import { computePeriodBounds } from "@/lib/ranking";
import { Pill } from "@/components/ui/Pill";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast/provider";
import type { RewardCampaign, RewardItem } from "@/lib/types";

const STATUS_LABEL = { scheduled: "예정", active: "진행중", ended: "종료" } as const;

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageUploadField({ value, onChange }: { value: string | null; onChange: (dataUrl: string | null) => void }) {
  return (
    <div className="flex items-center gap-2">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="상품 이미지" className="w-10 h-10 rounded-lg object-cover border border-border" />
      ) : (
        <div className="w-10 h-10 rounded-lg border border-dashed border-border flex items-center justify-center text-text-muted">
          +
        </div>
      )}
      <label className="text-caption text-brand-amber cursor-pointer">
        {value ? "이미지 변경" : "이미지 등록"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const dataUrl = await readImageAsDataUrl(file);
            onChange(dataUrl);
          }}
        />
      </label>
      {value && (
        <button type="button" className="text-caption text-state-danger" onClick={() => onChange(null)}>
          제거
        </button>
      )}
    </div>
  );
}

function EditCampaignForm({ campaign, onClose }: { campaign: RewardCampaign; onClose: () => void }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const items = itemsForCampaign(state, campaign.id);
  const [distType, setDistType] = useState(campaign.target_distribution.type);
  const [distValue, setDistValue] = useState(campaign.target_distribution.value);
  const [periodStart, setPeriodStart] = useState(campaign.period_start);
  const [periodEnd, setPeriodEnd] = useState(campaign.period_end);
  const [itemDrafts, setItemDrafts] = useState<Record<string, { title: string; qty: number; imageUrl: string | null }>>(
    Object.fromEntries(items.map((i) => [i.id, { title: i.title, qty: i.qty, imageUrl: i.image_url }]))
  );

  return (
    <div className="bg-surface-page rounded-card p-4 mt-3">
      <p className="text-body font-bold mb-2.5">캠페인 수정</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-caption font-semibold text-text-secondary mb-1">대상 기준</label>
          <select
            className="w-full border border-border rounded-lg px-2.5 py-2 text-body"
            value={distType}
            onChange={(e) => setDistType(e.target.value as "count" | "ratio")}
          >
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
          <label className="block text-caption font-semibold text-text-secondary mb-1">시작일</label>
          <input type="date" className="w-full border border-border rounded-lg px-2.5 py-2 text-body" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
        </div>
        <div>
          <label className="block text-caption font-semibold text-text-secondary mb-1">종료일</label>
          <input type="date" className="w-full border border-border rounded-lg px-2.5 py-2 text-body" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
        </div>
      </div>

      <p className="text-caption font-semibold text-text-secondary mb-1.5">상품 목록</p>
      {items.map((i) => {
        const draft = itemDrafts[i.id];
        return (
          <div key={i.id} className="flex items-center gap-2 mb-2">
            <ImageUploadField value={draft.imageUrl} onChange={(url) => setItemDrafts((prev) => ({ ...prev, [i.id]: { ...prev[i.id], imageUrl: url } }))} />
            <input
              className="flex-1 border border-border rounded-lg px-2 py-1.5 text-body"
              value={draft.title}
              onChange={(e) => setItemDrafts((prev) => ({ ...prev, [i.id]: { ...prev[i.id], title: e.target.value } }))}
            />
            <input
              type="number"
              className="w-20 border border-border rounded-lg px-2 py-1.5 text-body"
              value={draft.qty}
              onChange={(e) => setItemDrafts((prev) => ({ ...prev, [i.id]: { ...prev[i.id], qty: Number(e.target.value) || 0 } }))}
            />
          </div>
        );
      })}

      <div className="flex gap-2 mt-3">
        <Button
          className="!text-caption !py-1.5"
          onClick={() => {
            dispatch({
              type: "UPDATE_REWARD_CAMPAIGN",
              campaignId: campaign.id,
              distributionType: distType,
              distributionValue: distValue,
              periodStart,
              periodEnd,
            });
            Object.entries(itemDrafts).forEach(([itemId, d]) => {
              dispatch({ type: "UPDATE_REWARD_ITEM", itemId, title: d.title, qty: d.qty, imageUrl: d.imageUrl });
            });
            showToast("캠페인이 수정되었어요.");
            onClose();
          }}
        >
          저장
        </Button>
        <Button variant="secondary" className="!text-caption !py-1.5" onClick={onClose}>
          취소
        </Button>
      </div>
    </div>
  );
}

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
  const [itemImageUrl, setItemImageUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const classIdForForm = scopeId === "__all__" ? null : scopeId;
  const unit =
    classIdForForm === null
      ? state.rankingPeriodConfigs.find((c) => c.class_id === null)?.unit ?? "month"
      : state.rankingPeriodConfigs.find((c) => c.class_id === classIdForForm)?.unit ?? "month";
  const customDays =
    (classIdForForm === null
      ? state.rankingPeriodConfigs.find((c) => c.class_id === null)?.custom_days
      : state.rankingPeriodConfigs.find((c) => c.class_id === classIdForForm)?.custom_days) ?? null;
  const bounds = computePeriodBounds(unit, undefined, customDays);

  return (
    <div>
      <h2 className="text-title mb-1">상품(리워드) 관리</h2>
      <p className="text-caption text-text-secondary mb-5">
        캠페인은 그룹의 랭킹 단위기간에 연동돼요. 주기가 끝나면 자동 종료되며, 다음 주기 보상은 다시 등록해야 해요.
      </p>

      {state.rewardCampaigns.map((c: RewardCampaign) => {
        const cls = c.class_id ? state.classes.find((x) => x.id === c.class_id) : null;
        const items = itemsForCampaign(state, c.id);
        const claimedTotal = items.reduce((sum, i: RewardItem) => sum + claimsForItem(state, i.id).length, 0);
        const qtyTotal = items.reduce((sum, i: RewardItem) => sum + i.qty, 0);
        const status = campaignStatus(c);
        return (
          <div key={c.id} className="bg-surface-page rounded-card p-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-body font-bold">{cls ? `${cls.name} 랭킹 보상` : "전체 랭킹 보상"}</h4>
              <span className="text-caption bg-surface-card border border-border rounded-lg px-2 py-0.5">
                {c.period_start} ~ {c.period_end}
              </span>
              <Pill tone={status === "active" ? "ok" : status === "ended" ? "danger" : "wait"}>{STATUS_LABEL[status]}</Pill>
              <button
                type="button"
                className="ml-auto flex items-center gap-1 text-caption text-brand-amber border border-border rounded-lg px-2 py-1"
                onClick={() => setEditingId(editingId === c.id ? null : c.id)}
              >
                ✎
                수정
              </button>
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
                        <td className="p-2 flex items-center gap-2">
                          {i.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={i.image_url} alt={i.title} className="w-7 h-7 rounded-md object-cover border border-border" />
                          )}
                          {i.title}
                        </td>
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
            {editingId === c.id && <EditCampaignForm campaign={c} onClose={() => setEditingId(null)} />}
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
          <div className="col-span-2">
            <label className="block text-caption font-semibold text-text-secondary mb-1">상품 이미지</label>
            <ImageUploadField value={itemImageUrl} onChange={setItemImageUrl} />
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
              itemImageUrl,
            });
            showToast("새 상품 캠페인이 등록되었어요.");
            setItemTitle("");
            setItemImageUrl(null);
          }}
        >
          캠페인 등록하기
        </Button>
      </div>
    </div>
  );
}
