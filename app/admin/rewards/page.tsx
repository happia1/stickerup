"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppState } from "@/lib/store/provider";
import { campaignStatus, itemsForCampaign } from "@/lib/store/selectors";
import { computePeriodBounds } from "@/lib/ranking";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { useToast } from "@/lib/toast/provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadProductImage } from "@/lib/client/upload-product-image";
import type { ProductCatalogItem, RewardCampaign } from "@/lib/types";

/* eslint-disable @next/next/no-img-element, react-hooks/exhaustive-deps */

type EventStatusFilter = "scheduled" | "active" | "ended";

const STATUS_LABEL: Record<EventStatusFilter, string> = {
  scheduled: "다가오는 이벤트",
  active: "진행중",
  ended: "완료",
};

function ImageUploadField({ value, onChange }: { value: string | null; onChange: (dataUrl: string | null) => void }) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  return (
    <div className="flex items-center gap-2">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src="/images/placeholder-product.svg";}} alt="상품 이미지" className="h-10 w-10 rounded-lg border border-border object-cover" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-border text-text-muted">+</div>
      )}
      <label className="cursor-pointer text-caption text-brand-amber">
        {uploading ? "업로드 중..." : value ? "이미지 변경" : "이미지 등록"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={uploading}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setUploading(true);
            try { onChange(await uploadProductImage(file)); }
            catch (error) { toast(error instanceof Error ? error.message : "이미지를 등록하지 못했습니다."); }
            finally { setUploading(false); }
          }}
        />
      </label>
      {value && !uploading && (
        <button type="button" className="text-caption text-state-danger" onClick={() => onChange(null)}>
          제거
        </button>
      )}
    </div>
  );
}

function eventTitle(campaign: RewardCampaign, state: ReturnType<typeof useAppState>) {
  if (campaign.title?.trim()) return campaign.title;
  const cls = campaign.class_id ? state.classes.find((c) => c.id === campaign.class_id) : null;
  return cls ? `${cls.name} 랭킹 보상` : "기본 랭킹 보상";
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

function ProductCatalog() {
  const state = useAppState(); const dispatch = useAppDispatch(); const toast = useToast();
  const [editing, setEditing] = useState<ProductCatalogItem | null>(null); const [title,setTitle]=useState(""); const [purchaseUrl,setPurchaseUrl]=useState(""); const [description,setDescription]=useState(""); const [imageUrl,setImageUrl]=useState<string|null>(null);
  const reset=()=>{setEditing(null);setTitle("");setPurchaseUrl("");setDescription("");setImageUrl(null);};
  const getAccessToken=async()=>{const client=getSupabaseBrowserClient();const {data}=await client!.auth.getSession();return data.session?.access_token;};
  const loadProducts=async()=>{const access=await getAccessToken();if(!access)return;const response=await fetch("/api/admin/products",{headers:{Authorization:`Bearer ${access}`}});const payload=await response.json();if(response.ok)dispatch({type:"SET_PRODUCT_CATALOG",products:payload.products});};
  useEffect(()=>{void loadProducts();},[]);
  const edit=(product:ProductCatalogItem)=>{setEditing(product);setTitle(product.title);setPurchaseUrl(product.purchase_url??"");setDescription(product.description??"");setImageUrl(product.image_url);};
  const save=async()=>{if(!title.trim()){toast("상품명을 입력해 주세요.");return;} const normalizedUrl=purchaseUrl.trim()||null; if(normalizedUrl&&!/^https?:\/\//i.test(normalizedUrl)){toast("구매 링크는 http:// 또는 https://로 시작해야 해요.");return;} const access=await getAccessToken();if(access){const response=await fetch("/api/admin/products",{method:editing?"PATCH":"POST",headers:{Authorization:`Bearer ${access}`,"Content-Type":"application/json"},body:JSON.stringify({productId:editing?.id,title:title.trim(),imageUrl,purchaseUrl:normalizedUrl,description:description.trim()||null})});const payload=await response.json();if(!response.ok){toast(payload.error??"상품을 저장하지 못했어요.");return;}await loadProducts();}else if(editing){dispatch({type:"UPDATE_CATALOG_PRODUCT",productId:editing.id,title:title.trim(),imageUrl,purchaseUrl:normalizedUrl,description:description.trim()||null});}else{dispatch({type:"ADD_CATALOG_PRODUCT",title:title.trim(),imageUrl,purchaseUrl:normalizedUrl,description:description.trim()||null});}toast(editing?"상품을 수정했어요.":"상품을 보관함에 추가했어요.");reset();};
  const remove=async(productId:string)=>{const access=await getAccessToken();if(access){const response=await fetch("/api/admin/products",{method:"DELETE",headers:{Authorization:`Bearer ${access}`,"Content-Type":"application/json"},body:JSON.stringify({productId})});if(!response.ok){const payload=await response.json();toast(payload.error??"상품을 삭제하지 못했어요.");return;}await loadProducts();}else dispatch({type:"DELETE_CATALOG_PRODUCT",productId});toast("상품을 삭제했어요.");};
  return <section className="mb-6 rounded-card bg-surface-page p-5"><div className="mb-4"><h3 className="text-subtitle">상품 카탈로그</h3><p className="mt-1 text-caption text-text-secondary">상품을 한 번 등록하고 여러 이벤트의 순위 상품으로 재사용하세요.</p></div>
    <div className="mb-4 grid gap-2 lg:grid-cols-3">{state.productCatalog.length===0&&<p className="rounded-xl bg-surface-card p-5 text-caption text-text-secondary lg:col-span-3">등록된 상품이 없습니다.</p>}{state.productCatalog.map(product=><div key={product.id} className="rounded-xl border border-border bg-surface-card p-3"><div className="flex gap-3">{product.image_url?<img src={product.image_url} alt={product.title} className="h-14 w-14 rounded-lg object-cover"/>:<div className="h-14 w-14 rounded-lg bg-surface-raised"/>}<div className="min-w-0 flex-1"><p className="font-bold">{product.title}</p><p className="truncate text-caption text-text-secondary">{product.description||"설명 없음"}</p></div></div><div className="mt-3 flex gap-2">{product.purchase_url&&<a href={product.purchase_url} target="_blank" rel="noreferrer" className="rounded-lg bg-brand-amber px-2.5 py-1.5 text-caption font-bold text-surface-page">구매 바로가기</a>}<button className="rounded-lg border border-border px-2.5 py-1.5 text-caption" onClick={()=>edit(product)}>수정</button><button className="text-caption text-state-danger" onClick={()=>void remove(product.id)}>삭제</button></div></div>)}</div>
    <div className="rounded-xl bg-surface-card p-4"><p className="mb-3 font-bold">{editing?"상품 수정":"새 상품 등록"}</p><div className="grid gap-3 sm:grid-cols-2"><label className="text-caption text-text-secondary">상품명<input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-2.5 py-2"/></label><label className="text-caption text-text-secondary">구매 링크<input type="url" value={purchaseUrl} onChange={e=>setPurchaseUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-lg border border-border px-2.5 py-2"/></label><label className="text-caption text-text-secondary sm:col-span-2">설명<input value={description} onChange={e=>setDescription(e.target.value)} className="mt-1 w-full rounded-lg border border-border px-2.5 py-2"/></label><div className="sm:col-span-2"><ImageUploadField value={imageUrl} onChange={setImageUrl}/></div></div><div className="mt-3 flex gap-2"><Button onClick={save}>{editing?"수정 저장":"상품 추가"}</Button>{editing&&<Button variant="secondary" onClick={reset}>취소</Button>}</div></div>
  </section>;
}

function EditEventForm({ campaign, onClose }: { campaign: RewardCampaign; onClose: () => void }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const items = itemsForCampaign(state, campaign.id);
  const [distType, setDistType] = useState(campaign.target_distribution.type);
  const [title, setTitle] = useState(campaign.title ?? "");
  const [eventDescription, setEventDescription] = useState(campaign.description ?? "");
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
        <label className="col-span-2 block text-caption font-semibold text-text-secondary">이벤트명<input className="mt-1 w-full rounded-lg border border-border px-2.5 py-2 text-body" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className="col-span-2 block text-caption font-semibold text-text-secondary">이벤트 설명<textarea className="mt-1 min-h-20 w-full rounded-lg border border-border px-2.5 py-2 text-body" value={eventDescription} onChange={(event) => setEventDescription(event.target.value)} /></label>
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
            dispatch({ type: "UPDATE_REWARD_CAMPAIGN", campaignId: campaign.id, title, description: eventDescription, distributionType: distType, distributionValue: distValue, periodStart, periodEnd });
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

  if (editingId === campaign.id) return <EditEventForm campaign={campaign} onClose={() => setEditingId(null)} />;

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

      <div className="mb-3">
        <div className="rounded-xl bg-surface-card p-3">
          <p className="text-caption text-text-secondary">보상 대상</p>
          <p className="text-body font-bold">{distributionLabel(campaign)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full table-fixed text-body">
          <colgroup><col className="w-10 sm:w-16"/><col/></colgroup>
          <thead>
            <tr className="border-b border-border text-left text-caption text-text-secondary">
              <th className="px-1.5 py-2 sm:p-2.5">순위</th>
              <th className="px-1.5 py-2 sm:p-2.5">상품명</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={2} className="p-5 text-center text-caption text-text-secondary">등록된 상품이 없습니다.</td></tr>
            ) : items.map((item) => {
              return (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-1.5 py-2 font-bold text-brand-amber sm:p-2.5">{item.rank_order ? `${item.rank_order}등` : "-"}</td>
                  <td className="min-w-0 px-1.5 py-2 sm:p-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                    {item.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.title} className="h-8 w-8 shrink-0 rounded-md border border-border object-cover" />
                    )}
                    <span className="min-w-0 truncate">{item.title}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </section>
  );
}

export default function AdminRewardsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();

  const defaultClass = state.classes.find((c) => c.is_default);
  const groupClasses = state.classes.filter((c) => !c.is_default && c.status === "active");
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>("active");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [scopeId, setScopeId] = useState<string>("__default__");
  const [distType, setDistType] = useState<"count" | "ratio">("count");
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [distValue, setDistValue] = useState(3);
  const [prizes, setPrizes] = useState<Array<{ rank: number; productId: string; qty: number }>>([{rank:1,productId:"",qty:1},{rank:2,productId:"",qty:1},{rank:3,productId:"",qty:1}]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [catalogRefreshing, setCatalogRefreshing] = useState(false);
  const [catalogError, setCatalogError] = useState(false);

  const refreshCatalog = useCallback(async (showFailure = false) => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setCatalogRefreshing(true);
    try {
      const { data } = await client.auth.getSession();
      if (!data.session) return;
      const response = await fetch("/api/admin/products", { headers: { Authorization: `Bearer ${data.session.access_token}` }, cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "경품 목록을 불러오지 못했습니다.");
      dispatch({ type: "SET_PRODUCT_CATALOG", products: payload.products ?? [] });
      try { localStorage.setItem(`stickerup:product-catalog:${state.currentUserId}`, JSON.stringify(payload.products ?? [])); } catch { /* storage can be unavailable */ }
      setCatalogError(false);
    } catch (error) {
      setCatalogError(true);
      if (showFailure) showToast(error instanceof Error ? error.message : "경품 목록을 불러오지 못했습니다.");
    } finally { setCatalogRefreshing(false); }
  }, [dispatch, showToast, state.currentUserId]);

  useEffect(() => {
    void refreshCatalog(false);
    const timer = window.setInterval(() => void refreshCatalog(false), 60_000);
    const refreshWhenVisible = () => { if (document.visibilityState === "visible") void refreshCatalog(false); };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refreshWhenVisible); };
  }, [refreshCatalog]);

  const eventsByStatus = useMemo(() => {
    const grouped: Record<EventStatusFilter, RewardCampaign[]> = { scheduled: [], active: [], ended: [] };
    state.rewardCampaigns.forEach((campaign) => grouped[campaignStatus(campaign) as EventStatusFilter].push(campaign));
    Object.values(grouped).forEach((events) => events.sort((a, b) => a.period_start.localeCompare(b.period_start)));
    return grouped;
  }, [state.rewardCampaigns]);

  const visibleEvents = eventsByStatus[statusFilter];
  const selectedEvent = visibleEvents.find((event) => event.id === selectedEventId) ?? null;

  useEffect(() => {
    setSelectedEventId(null);
    setEditingId(null);
  }, [statusFilter, visibleEvents]);

  const classIdForForm = scopeId === "__all__" ? null : scopeId === "__default__" ? defaultClass?.id ?? null : scopeId;
  const config = state.rankingPeriodConfigs.find((c) => c.class_id === classIdForForm);
  const bounds = computePeriodBounds(config?.unit ?? "month", undefined, config?.custom_days ?? null, config?.custom_start ?? null, config?.custom_end ?? null);

  return (
    <div>
      <h2 className="mb-1 text-title">이벤트/상품 관리</h2>
      <p className="mb-5 text-caption text-text-secondary">이벤트는 그룹의 랭킹 단위기간과 연결돼요. 주기가 끝나면 완료로 분류되고, 다음 주기 보상은 새 이벤트로 등록해요.</p>
      <div className="mb-5 grid max-w-md grid-cols-2 rounded-xl bg-surface-raised p-1"><button type="button" className="rounded-lg bg-brand-amber px-4 py-2.5 font-bold text-surface-page">이벤트 리스트</button><Link href="/admin/products" className="rounded-lg px-4 py-2.5 text-center font-bold text-text-secondary">경품 리스트 관리</Link></div>

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
          <div className="grid gap-2">
            {visibleEvents.map((event) => {
              const items = itemsForCampaign(state, event.id);
              const selected = selectedEvent?.id === event.id;
              return (
                <article
                  key={event.id}
                  className={selected ? "overflow-hidden rounded-xl border border-brand-amber bg-surface-card" : "overflow-hidden rounded-xl border border-border bg-surface-card"}
                >
                  <button type="button" aria-expanded={selected} onClick={() => setSelectedEventId(selected ? null : event.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <p className="min-w-0 flex-1 text-body font-bold">{eventTitle(event, state)} <span className="ml-2 text-caption font-normal text-text-secondary">{event.period_start} ~ {event.period_end}</span></p>
                    <span className="text-caption text-text-muted">{eventScopeLabel(event, state)} · 상품 {items.length}개 · {distributionLabel(event)}</span>
                    <span className={`text-lg text-text-secondary transition-transform ${selected ? "rotate-180" : ""}`} aria-hidden="true">⌄</span>
                  </button>
                  {selected && <div className="border-t border-border p-4"><EventDetail campaign={event} editingId={editingId} setEditingId={setEditingId} /></div>}
                </article>
              );
            })}
          </div>
        )}
        <div className="mt-4 flex justify-end"><button type="button" onClick={()=>setCreateOpen(true)} className="inline-flex items-center gap-1 rounded-lg bg-brand-amber px-3 py-2 text-caption font-bold text-surface-page"><span className="text-lg leading-none">＋</span> 이벤트 생성</button></div>
      </section>

      {createOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true" onClick={()=>setCreateOpen(false)}><section className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-card bg-surface-page p-5" onClick={event=>event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="text-subtitle">이벤트 생성</h4>
          <button type="button" onClick={()=>setCreateOpen(false)} aria-label="닫기" className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised text-xl text-text-secondary">×</button>
        </div>
        <label className="mb-1 block text-caption font-semibold text-text-secondary">이벤트명</label>
        <input value={eventName} onChange={(event) => setEventName(event.target.value)} placeholder="예: 7월 출석왕 이벤트" className="mb-3 w-full rounded-lg border border-border px-2.5 py-2 text-body" />
        <label className="mb-1 block text-caption font-semibold text-text-secondary">이벤트 설명</label><textarea value={eventDescription} onChange={(event) => setEventDescription(event.target.value)} placeholder="학생에게 보여줄 이벤트 설명" className="mb-3 min-h-20 w-full rounded-lg border border-border px-2.5 py-2 text-body" />
        <label className="mb-1 block text-caption font-semibold text-text-secondary">적용 그룹</label>
        <select className="mb-3 w-full rounded-lg border border-border px-2.5 py-2 text-body" value={scopeId} onChange={(event) => setScopeId(event.target.value)}>
          <option value="__default__">기본반 (상시)</option>
          <option value="__all__">전체 학생</option>
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
          <div className="col-span-2"><div className="mb-2 flex items-center justify-between gap-2"><p className="text-caption font-semibold text-text-secondary">순위별 상품</p><button type="button" disabled={catalogRefreshing} onClick={()=>void refreshCatalog(true)} className="text-micro font-bold text-brand-amber disabled:opacity-50">{catalogRefreshing?"갱신 중...":"경품 목록 새로고침"}</button></div>{prizes.map((prize,index)=><div key={prize.rank} className="mb-2 grid grid-cols-[36px_minmax(0,1fr)_52px_24px] items-center gap-1 sm:grid-cols-[64px_minmax(0,1fr)_80px_32px] sm:gap-2"><b className="text-micro sm:text-caption">{prize.rank}등</b><select value={prize.productId} onChange={e=>setPrizes(current=>current.map((item,i)=>i===index?{...item,productId:e.target.value}:item))} className="min-w-0 w-full rounded-lg border border-border px-1.5 py-2 text-caption sm:px-2.5 sm:text-body"><option value="">{state.productCatalog.length?"상품 선택":catalogRefreshing?"상품 불러오는 중...":catalogError?"불러오기 실패 — 새로고침해 주세요":"등록된 경품이 없습니다"}</option>{state.productCatalog.map(product=><option key={product.id} value={product.id}>{product.title}</option>)}</select><input aria-label={`${prize.rank}등 수량`} type="number" min="1" value={prize.qty} onChange={e=>setPrizes(current=>current.map((item,i)=>i===index?{...item,qty:Math.max(1,Number(e.target.value)||1)}:item))} className="min-w-0 w-full rounded-lg border border-border px-1 py-2 text-caption sm:px-2 sm:text-body"/><button type="button" className="w-6 text-state-danger sm:w-8" onClick={()=>setPrizes(current=>current.filter((_,i)=>i!==index).map((item,i)=>({...item,rank:i+1})))}>×</button></div>)}<button type="button" className="text-caption text-brand-amber" onClick={()=>setPrizes(current=>[...current,{rank:current.length+1,productId:"",qty:1}])}>+ 다음 순위 상품 추가</button></div>
        </div>
        <div className="flex justify-end">
        <Button
          onClick={() => {
            const selectedPrizes = prizes.filter((prize) => prize.productId);
            if (!selectedPrizes.length) {
              showToast("순위별 상품을 하나 이상 선택해 주세요.");
              return;
            }
            if (!eventName.trim()) { showToast("이벤트명을 입력해 주세요."); return; }
            dispatch({ type: "ADD_REWARD_CAMPAIGN", title: eventName.trim(), description: eventDescription.trim(), classId: classIdForForm, periodStart: bounds.period_start, periodEnd: bounds.period_end, distributionType: distType, distributionValue: distValue, prizes: selectedPrizes });
            showToast("이벤트가 생성되었어요.");
            setStatusFilter("active");
            setPrizes([{rank:1,productId:"",qty:1},{rank:2,productId:"",qty:1},{rank:3,productId:"",qty:1}]);
            setEventName("");
            setEventDescription("");
            setCreateOpen(false);
          }}
        >
          이벤트 등록하기
        </Button>
        </div>
      </section></div>}
    </div>
  );
}
