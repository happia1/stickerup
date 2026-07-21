"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppState } from "@/lib/store/provider";
import { campaignStatus, claimsForItem, itemsForCampaign } from "@/lib/store/selectors";
import { computePeriodBounds } from "@/lib/ranking";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { useToast } from "@/lib/toast/provider";
import type { RewardCampaign, RewardItem } from "@/lib/types";

type EventStatusFilter = "scheduled" | "active" | "ended";

const STATUS_LABEL: Record<EventStatusFilter, string> = {
  scheduled: "다가오는 이벤트",
  active: "진행중",
  ended: "완료",
};

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
        <img src={value} alt="상품 이미지" className="h-10 w-10 rounded-lg border border-border object-cover" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-border text-text-muted">+</div>
      )}
      <label className="cursor-pointer text-caption text-brand-amber">
        {value ? "이미지 변경" : "이미지 등록"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            onChange(await readImageAsDataUrl(file));
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

function eventTitle(campaign: RewardCampaign, state: ReturnType<typeof useAppState>) {
  const cls = campaign.class_id ? state.classes.find((c) => c.id === campaign.class_id) : null;
  return cls ? `${cls.name} 랭킹 보상` : "전체 랭킹 보상";
}

function eventScopeLabel(campaign: RewardCampaign, state: ReturnType<typeof useAppState>) {
  if (!campaign.class_id) return "전체";
  return state.classes.find((c) => c.id === campaign.class_id)?.name ?? "알 수 없는 그룹";
}

function distributionLabel(campaign: RewardCampaign) {
  const dist = campaign.target_distribution;
  if (dist.type === "count") return `상위 ${dist.value}명`;
  return `상위 ${Math.round(dist.value * 100)}%`;
}

function EditEventForm({ campaign, onClose }: { campaign: RewardCampaign; onClose: () => void }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const items = itemsForCampaign(state, campaign.id);
  const [distType, setDistType] = useState(campaign.target_distribution.type);
  const [distValue, setDistValue] = useState(campaign.target_distribution.value);
  const [periodStart, setPeriodStart] = useState(campaign.period_start);
  const [periodEnd, setPeriodEnd] = useState(campaign.period_end);
  const [itemDrafts, setItemDrafts] = useState<Record<string, { title: string; qty: number; imageUrl: string | null }>>(
    Object.fromEntries(items.map((item) => [item.id, { title: item.title, qty: item.qty, imageUrl: item.image_url }]))
  );

  return (
    <div className="mt-4 rounded-card bg-surface-page p-4">
      <p className="mb-3 text-body font-bold">이벤트 수정</p>
      <div className="mb-3 grid grid-cols-2 gap-3">
        <label className="block text-caption font-semibold text-text-secondary">
          대상 기준
          <select
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body"
            value={distType}
            onChange={(event) => setDistType(event.target.value as "count" | "ratio")}
          >
            <option value="count">상위 인원 수</option>
            <option value="ratio">상위 비율(%)</option>
          </select>
        </label>
        <label className="block text-caption font-semibold text-text-secondary">
          {distType === "count" ? "인원 수" : "비율(%)"}
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body"
            value={distType === "count" ? distValue : Math.round(distValue * 100)}
            onChange={(event) => {
              const value = Number(event.target.value) || 0;
              setDistValue(distType === "count" ? value : value / 100);
            }}
          />
        </label>
        <label className="block text-caption font-semibold text-text-secondary">
          시작일
          <input type="date" className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} />
        </label>
        <label className="block text-caption font-semibold text-text-secondary">
          종료일
          <input type="date" className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
        </label>
      </div>

      <p className="mb-2 text-caption font-semibold text-text-secondary">상품 목록</p>
      {items.map((item) => {
        const draft = itemDrafts[item.id];
        return (
          <div key={item.id} className="mb-2 flex items-center gap-2">
            <ImageUploadField value={draft.imageUrl} onChange={(url) => setItemDrafts((prev) => ({ ...prev, [item.id]: { ...prev[item.id], imageUrl: url } }))} />
            <input className="flex-1 rounded-lg border border-border px-2 py-1.5 text-body" value={draft.title} onChange={(event) => setItemDrafts((prev) => ({ ...prev, [item.id]: { ...prev[item.id], title: event.target.value } }))} />
            <input type="number" className="w-20 rounded-lg border border-border px-2 py-1.5 text-body" value={draft.qty} onChange={(event) => setItemDrafts((prev) => ({ ...prev, [item.id]: { ...prev[item.id], qty: Number(event.target.value) || 0 } }))} />
          </div>
        );
      })}

      <div className="mt-3 flex gap-2">
        <Button
          className="!py-1.5 !text-caption"
          onClick={() => {
            dispatch({ type: "UPDATE_REWARD_CAMPAIGN", campaignId: campaign.id, distributionType: distType, distributionValue: distValue, periodStart, periodEnd });
            Object.entries(itemDrafts).forEach(([itemId, draft]) => dispatch({ type: "UPDATE_REWARD_ITEM", itemId, title: draft.title, qty: draft.qty, imageUrl: draft.imageUrl }));
            showToast("이벤트가 수정되었어요.");
            onClose();
          }}
        >
          저장
        </Button>
        <Button variant="secondary" className="!py-1.5 !text-caption" onClick={onClose}>
          취소
        </Button>
      </div>
    </div>
  );
}

function EventDetail({ campaign, editingId, setEditingId }: { campaign: RewardCampaign; editingId: string | null; setEditingId: (id: string | null) => void }) {
  const state = useAppState();
  const items = itemsForCampaign(state, campaign.id);
  const status = campaignStatus(campaign) as EventStatusFilter;
  const claimedTotal = items.reduce((sum, item) => sum + claimsForItem(state, item.id).length, 0);
  const qtyTotal = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <section className="rounded-card bg-surface-page p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-subtitle">{eventTitle(campaign, state)}</h3>
          <p className="mt-1 text-caption text-text-secondary">
            {campaign.period_start} ~ {campaign.period_end} · {eventScopeLabel(campaign, state)} · {distributionLabel(campaign)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone={status === "active" ? "ok" : status === "ended" ? "danger" : "wait"}>{STATUS_LABEL[status]}</Pill>
          <button type="button" className="rounded-lg border border-border px-2.5 py-1.5 text-caption text-brand-amber" onClick={() => setEditingId(editingId === campaign.id ? null : campaign.id)}>
            수정
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-surface-card p-3">
          <p className="text-caption text-text-secondary">보상 대상</p>
          <p className="text-body font-bold">{distributionLabel(campaign)}</p>
        </div>
        <div className="rounded-xl bg-surface-card p-3">
          <p className="text-caption text-text-secondary">총 상품 수량</p>
          <p className="text-body font-bold">{qtyTotal}개</p>
        </div>
        <div className="rounded-xl bg-surface-card p-3">
          <p className="text-caption text-text-secondary">선택 완료</p>
          <p className="text-body font-bold">{claimedTotal}개</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-body">
          <thead>
            <tr className="border-b border-border text-left text-caption text-text-secondary">
              <th className="p-2.5">상품</th>
              <th className="p-2.5">수량</th>
              <th className="p-2.5">선택 완료</th>
              <th className="p-2.5">남은 수량</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} className="p-5 text-center text-caption text-text-secondary">등록된 상품이 없습니다.</td></tr>
            ) : items.map((item) => {
              const claims = claimsForItem(state, item.id);
              return (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="flex items-center gap-2 p-2.5">
                    {item.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.title} className="h-8 w-8 rounded-md border border-border object-cover" />
                    )}
                    {item.title}
                  </td>
                  <td className="p-2.5">{item.qty}</td>
                  <td className="p-2.5">{claims.map((claim) => state.students.find((student) => student.id === claim.student_id)?.name).filter(Boolean).join(", ") || "-"}</td>
                  <td className="p-2.5">{item.qty - claims.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingId === campaign.id && <EditEventForm campaign={campaign} onClose={() => setEditingId(null)} />}
    </section>
  );
}

export default function AdminRewardsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const groupClasses = state.classes.filter((c) => !c.is_default && c.status === "active");
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>("active");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [scopeId, setScopeId] = useState<string>("__all__");
  const [distType, setDistType] = useState<"count" | "ratio">("count");
  const [distValue, setDistValue] = useState(3);
  const [itemTitle, setItemTitle] = useState("");
  const [itemQty, setItemQty] = useState(5);
  const [itemImageUrl, setItemImageUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const eventsByStatus = useMemo(() => {
    const grouped: Record<EventStatusFilter, RewardCampaign[]> = { scheduled: [], active: [], ended: [] };
    state.rewardCampaigns.forEach((campaign) => grouped[campaignStatus(campaign) as EventStatusFilter].push(campaign));
    Object.values(grouped).forEach((events) => events.sort((a, b) => a.period_start.localeCompare(b.period_start)));
    return grouped;
  }, [state.rewardCampaigns]);

  const visibleEvents = eventsByStatus[statusFilter];
  const selectedEvent = visibleEvents.find((event) => event.id === selectedEventId) ?? visibleEvents[0] ?? null;

  useEffect(() => {
    setSelectedEventId(visibleEvents[0]?.id ?? null);
    setEditingId(null);
  }, [statusFilter, visibleEvents]);

  const classIdForForm = scopeId === "__all__" ? null : scopeId;
  const config = state.rankingPeriodConfigs.find((c) => c.class_id === classIdForForm);
  const bounds = computePeriodBounds(config?.unit ?? "month", undefined, config?.custom_days ?? null);

  return (
    <div>
      <h2 className="mb-1 text-title">이벤트/상품 관리</h2>
      <p className="mb-5 text-caption text-text-secondary">이벤트는 그룹의 랭킹 단위기간과 연결돼요. 주기가 끝나면 완료로 분류되고, 다음 주기 보상은 새 이벤트로 등록해요.</p>

      <section className="mb-6 rounded-card bg-surface-page p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-subtitle">이벤트 리스트</h3>
          <div className="flex gap-2">
            {Object.entries(STATUS_LABEL).map(([status, label]) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status as EventStatusFilter)}
                className={statusFilter === status ? "rounded-full bg-brand-amber px-3 py-2 text-caption font-bold text-surface-page" : "rounded-full bg-surface-card px-3 py-2 text-caption text-text-secondary"}
              >
                {label} {eventsByStatus[status as EventStatusFilter].length}
              </button>
            ))}
          </div>
        </div>

        {visibleEvents.length === 0 ? (
          <p className="rounded-xl bg-surface-card p-5 text-center text-caption text-text-secondary">해당 상태의 이벤트가 없습니다.</p>
        ) : (
          <div className="grid gap-2 lg:grid-cols-3">
            {visibleEvents.map((event) => {
              const items = itemsForCampaign(state, event.id);
              const selected = selectedEvent?.id === event.id;
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEventId(event.id)}
                  className={selected ? "rounded-xl border border-brand-amber bg-surface-card p-3 text-left" : "rounded-xl border border-border bg-surface-card p-3 text-left"}
                >
                  <p className="text-body font-bold">{eventTitle(event, state)}</p>
                  <p className="mt-1 text-caption text-text-secondary">{event.period_start} ~ {event.period_end}</p>
                  <p className="mt-1 text-caption text-text-muted">{eventScopeLabel(event, state)} · 상품 {items.length}개 · {distributionLabel(event)}</p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedEvent && <EventDetail campaign={selectedEvent} editingId={editingId} setEditingId={setEditingId} />}

      <section className="mt-6 max-w-lg rounded-card bg-surface-page p-5">
        <h4 className="mb-3 text-body font-bold">새 상품 이벤트 등록</h4>
        <label className="mb-1 block text-caption font-semibold text-text-secondary">적용 그룹</label>
        <select className="mb-3 w-full rounded-lg border border-border px-2.5 py-2 text-body" value={scopeId} onChange={(event) => setScopeId(event.target.value)}>
          <option value="__all__">전체</option>
          {groupClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <p className="mb-3 text-caption text-text-muted">현재 랭킹 주기: {bounds.period_start} ~ {bounds.period_end}</p>

        <div className="mb-3 grid grid-cols-2 gap-3">
          <label className="block text-caption font-semibold text-text-secondary">
            대상 기준
            <select className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body" value={distType} onChange={(event) => setDistType(event.target.value as "count" | "ratio")}>
              <option value="count">상위 인원 수</option>
              <option value="ratio">상위 비율(%)</option>
            </select>
          </label>
          <label className="block text-caption font-semibold text-text-secondary">
            {distType === "count" ? "인원 수" : "비율(%)"}
            <input type="number" className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body" value={distType === "count" ? distValue : Math.round(distValue * 100)} onChange={(event) => { const value = Number(event.target.value) || 0; setDistValue(distType === "count" ? value : value / 100); }} />
          </label>
          <label className="block text-caption font-semibold text-text-secondary">
            상품명
            <input className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body" value={itemTitle} onChange={(event) => setItemTitle(event.target.value)} placeholder="예: 문화상품권 1만원" />
          </label>
          <label className="block text-caption font-semibold text-text-secondary">
            수량
            <input type="number" className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body" value={itemQty} onChange={(event) => setItemQty(Number(event.target.value) || 0)} />
          </label>
          <div className="col-span-2">
            <label className="mb-1 block text-caption font-semibold text-text-secondary">상품 이미지</label>
            <ImageUploadField value={itemImageUrl} onChange={setItemImageUrl} />
          </div>
        </div>
        <Button
          onClick={() => {
            if (!itemTitle.trim()) {
              showToast("상품명을 입력해 주세요.");
              return;
            }
            dispatch({ type: "ADD_REWARD_CAMPAIGN", classId: classIdForForm, periodStart: bounds.period_start, periodEnd: bounds.period_end, distributionType: distType, distributionValue: distValue, itemTitle, itemQty, itemImageUrl });
            showToast("새 상품 이벤트가 등록되었어요.");
            setStatusFilter("active");
            setItemTitle("");
            setItemImageUrl(null);
          }}
        >
          이벤트 등록하기
        </Button>
      </section>
    </div>
  );
}
