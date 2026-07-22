"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { itemsForCampaign, getCampaignMeta, campaignStatus, ddayLabel, approvedClassesForStudent } from "@/lib/store/selectors";
import { RewardCard } from "@/components/ui/RewardCard";
import { useToast } from "@/lib/toast/provider";
import type { RewardCampaign } from "@/lib/types";
import type { StudentHomeData } from "@/lib/data/student-home.types";
import type { AppState } from "@/lib/store/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const PRODUCT_PLACEHOLDER = "/images/placeholder-product.svg";
const EVENT_PAGE_SIZE = 3;
const PRIZE_PAGE_SIZE = 6;

function usePlaceholderOnError(event: React.SyntheticEvent<HTMLImageElement>) { event.currentTarget.onerror = null; event.currentTarget.src = PRODUCT_PLACEHOLDER; }
function claimLabel(meta: ReturnType<typeof getCampaignMeta>): { label: string | null; disabled: boolean } {
  if (meta.status !== "ended") return { label: null, disabled: true };
  if (meta.iHaveClaimed) return { label: "경품 선택 완료", disabled: true };
  if (!meta.iAmEligible) return { label: "다음 기회", disabled: true };
  if (!meta.isMyTurn) return { label: "선택 순서 대기", disabled: true };
  return { label: "경품 고르기", disabled: false };
}
function campaignTitle(campaign: RewardCampaign, state: AppState) { if (campaign.title?.trim()) return campaign.title; const cls = campaign.class_id ? state.classes.find((item) => item.id === campaign.class_id) : null; return cls ? `${cls.name} 랭킹 보상` : "전체 랭킹 보상"; }
function campaignDescription(campaign: RewardCampaign, state: AppState) { if (campaign.description?.trim()) return campaign.description; const cls = campaign.class_id ? state.classes.find((item) => item.id === campaign.class_id) : null; return `${cls ? cls.name : "전체 학생"} 랭킹 결과에 따라 원하는 보상을 선택할 수 있어요.`; }

export function RewardBlock({ data }: { data?: StudentHomeData }) {
  const mockState = useAppState();
  const state: AppState = data ? { ...mockState, currentUserId: data.student.id, classes: data.classes, enrollments: data.enrollments, ledger: data.stickerLedger, rewardCampaigns: data.rewardCampaigns, rewardItems: data.rewardItems, rewardClaims: data.rewardClaims } : mockState;
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const myClassIds = useMemo(() => new Set(approvedClassesForStudent(state, state.currentUserId).map((item) => item.id)), [state]);
  const eligibleEvents = useMemo(() => state.rewardCampaigns.filter((campaign) => campaign.class_id === null || myClassIds.has(campaign.class_id)), [state.rewardCampaigns, myClassIds]);
  const otherEvents = useMemo(() => state.rewardCampaigns.filter((campaign) => campaign.class_id !== null && !myClassIds.has(campaign.class_id)), [state.rewardCampaigns, myClassIds]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const initializedExpansion = useRef(false);
  const [fullTab, setFullTab] = useState<"events" | "prizes">("events");
  const [showOtherEvents, setShowOtherEvents] = useState(false);
  const [eventPage, setEventPage] = useState(0);
  const [prizePage, setPrizePage] = useState(0);
  const [prizeView, setPrizeView] = useState<"card" | "list">("card");
  const [prizes, setPrizes] = useState<Array<{id:string;title:string;image_url:string|null;description:string|null;like_count:number;liked_by_me:boolean}>>([]);
  const [prizesLoading, setPrizesLoading] = useState(true);

  useEffect(() => { if (!initializedExpansion.current && eligibleEvents[0]) { initializedExpansion.current = true; setExpandedId(eligibleEvents[0].id); } }, [eligibleEvents]);
  useEffect(() => { let active = true; void getSupabaseBrowserClient()?.auth.getSession().then(async ({ data: auth }) => { if (!auth.session) { if (active) setPrizesLoading(false); return; } try { const response = await fetch("/api/student/prize-preferences", { headers: { Authorization: `Bearer ${auth.session.access_token}` }, cache: "no-store" }); const payload = await response.json(); if (active && response.ok) setPrizes(payload.products); } finally { if (active) setPrizesLoading(false); } }); return () => { active = false; }; }, []);

  const toggleLike = async (productId: string) => { const session = await getSupabaseBrowserClient()?.auth.getSession(); const token = session?.data.session?.access_token; if (!token) return; const response = await fetch("/api/student/prize-preferences", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ productId }) }); if (!response.ok) return showToast("받고 싶은 경품을 저장하지 못했어요."); setPrizes((current) => current.map((item) => item.id === productId ? { ...item, liked_by_me: !item.liked_by_me, like_count: item.like_count + (item.liked_by_me ? -1 : 1) } : item).sort((a, b) => b.like_count - a.like_count || a.title.localeCompare(b.title, "ko"))); };
  const handleClaim = async (campaign: RewardCampaign, itemId: string, itemTitle: string) => { const meta = getCampaignMeta(state, campaign, state.currentUserId); const session = await getSupabaseBrowserClient()?.auth.getSession(); const token = session?.data.session?.access_token; if (!token) return showToast("로그인이 필요합니다."); const response = await fetch("/api/student/reward-claims", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ itemId }) }); const payload = await response.json(); if (!response.ok) return showToast(payload.error ?? "상품을 선택하지 못했습니다."); dispatch({ type: "CLAIM_REWARD", itemId, studentId: state.currentUserId, rank: meta.myRank ?? 0 }); showToast(`“${itemTitle}” 선택 완료!`); };
  const renderCampaignItems = (campaign: RewardCampaign) => { const meta = getCampaignMeta(state, campaign, state.currentUserId); const { label, disabled } = claimLabel(meta); return <div className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-2 scrollbar-none">{itemsForCampaign(state, campaign.id).map((item) => <RewardCard key={item.id} title={item.title} buttonLabel={label} disabled={disabled} onClaim={() => void handleClaim(campaign, item.id, item.title)} imageUrl={item.image_url}/>)}</div>; };

  const shownEvents = showOtherEvents ? otherEvents : eligibleEvents;
  const eventPageCount = Math.max(1, Math.ceil(shownEvents.length / EVENT_PAGE_SIZE));
  const pagedEvents = shownEvents.slice(eventPage * EVENT_PAGE_SIZE, (eventPage + 1) * EVENT_PAGE_SIZE);
  const prizePageCount = Math.max(1, Math.ceil(prizes.length / PRIZE_PAGE_SIZE));
  const pagedPrizes = prizes.slice(prizePage * PRIZE_PAGE_SIZE, (prizePage + 1) * PRIZE_PAGE_SIZE);

  return <div className="mb-3.5 overflow-hidden rounded-card bg-surface-card p-4">
    <h3 className="mb-3 text-subtitle">이벤트</h3>
    <div className="mb-4 grid grid-cols-2 rounded-xl bg-surface-raised p-1"><button type="button" onClick={() => setFullTab("events")} className={`rounded-lg py-2.5 text-caption font-bold ${fullTab === "events" ? "bg-brand-amber text-surface-page" : "text-text-secondary"}`}>전체 이벤트</button><button type="button" onClick={() => setFullTab("prizes")} className={`rounded-lg py-2.5 text-caption font-bold ${fullTab === "prizes" ? "bg-brand-amber text-surface-page" : "text-text-secondary"}`}>이벤트 경품</button></div>
    {fullTab === "events" ? <section>
      {showOtherEvents && <button type="button" onClick={() => { setShowOtherEvents(false); setEventPage(0); }} className="mb-2 text-micro text-text-secondary">← 내 이벤트로 돌아가기</button>}
      <div className="space-y-2">{pagedEvents.map((campaign) => { const expanded = expandedId === campaign.id; const cls = campaign.class_id ? state.classes.find((item) => item.id === campaign.class_id)?.name : "전체"; const remaining = campaignStatus(campaign) === "active" ? `${ddayLabel(campaign.period_end)} 마감` : campaignStatus(campaign) === "ended" ? "종료" : `${ddayLabel(campaign.period_start)} 시작`; return <article key={campaign.id} className="rounded-xl border border-border bg-surface-page"><button type="button" onClick={() => setExpandedId(expanded ? null : campaign.id)} className="flex w-full items-center gap-2 p-3 text-left"><span className="min-w-0 flex-1 truncate text-caption font-bold">{campaignTitle(campaign, state)}</span><span className="shrink-0 text-micro text-text-secondary">{cls}</span><span className="shrink-0 text-micro text-text-muted">{remaining}</span><span className={expanded ? "rotate-180" : ""}>⌄</span></button>{expanded && <div className="border-t border-border p-3">{campaignStatus(campaign) === "scheduled" ? <p className="text-caption text-text-muted">이벤트 시작 전이에요.</p> : renderCampaignItems(campaign)}<p className="mt-3 whitespace-pre-wrap text-caption text-text-secondary">{campaignDescription(campaign, state)}</p></div>}</article>; })}{!shownEvents.length && <p className="py-6 text-center text-caption text-text-muted">표시할 이벤트가 없습니다.</p>}</div>
      {eventPageCount > 1 && <div className="mt-3 flex items-center justify-center gap-3"><button disabled={eventPage === 0} onClick={() => setEventPage((page) => page - 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-30">‹</button><span className="text-micro">{eventPage + 1} / {eventPageCount}</span><button disabled={eventPage === eventPageCount - 1} onClick={() => setEventPage((page) => page + 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-30">›</button></div>}
      {!showOtherEvents && otherEvents.length > 0 && <div className="mt-4 border-t border-border pt-3 text-right"><p className="mb-1 text-micro text-text-muted">다른 이벤트 둘러보기</p><button type="button" onClick={() => { setShowOtherEvents(true); setEventPage(0); setExpandedId(null); }} className="text-caption font-bold text-brand-amber">다른 이벤트 더보기 →</button></div>}
    </section> : <section>
      <div className="mb-3 flex items-center justify-between gap-2"><p className="text-caption text-text-secondary">받고 싶은 경품에 ‘받고 싶다’를 눌러주세요.</p><div className="flex shrink-0 rounded-lg bg-surface-raised p-0.5"><button onClick={() => setPrizeView("card")} className={`rounded-md px-2 py-1 text-micro ${prizeView === "card" ? "bg-surface-page font-bold" : "text-text-muted"}`}>카드</button><button onClick={() => setPrizeView("list")} className={`rounded-md px-2 py-1 text-micro ${prizeView === "list" ? "bg-surface-page font-bold" : "text-text-muted"}`}>목록</button></div></div>
      {prizesLoading ? <div className="grid grid-cols-3 gap-2">{Array.from({ length: 6 }, (_, item) => <div key={item} className="aspect-[3/4] animate-pulse rounded-xl bg-surface-raised"/>)}</div> : <>{prizeView === "card" ? <div className="grid grid-cols-3 gap-2">{pagedPrizes.map((prize, index) => <article key={prize.id} className="relative overflow-hidden rounded-xl border border-border bg-surface-page"><span className="absolute left-1.5 top-1.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/70 px-1 text-micro font-bold text-white">{prizePage * PRIZE_PAGE_SIZE + index + 1}</span><img src={prize.image_url ?? PRODUCT_PLACEHOLDER} onError={usePlaceholderOnError} alt={prize.title} className="aspect-square w-full object-cover"/><div className="p-2"><p className="line-clamp-2 min-h-8 text-micro font-bold">{prize.title}</p><button onClick={() => void toggleLike(prize.id)} className={`mt-2 w-full rounded-md border px-1 py-1.5 text-micro font-bold ${prize.liked_by_me ? "border-state-danger bg-state-danger/10 text-state-danger" : "border-border"}`}>{prize.liked_by_me ? "받고 싶어요" : "받고 싶다"} · {prize.like_count}</button></div></article>)}</div> : <div className="space-y-2">{pagedPrizes.map((prize, index) => <article key={prize.id} className="flex items-center gap-2 rounded-xl border border-border bg-surface-page p-2"><span className="w-5 shrink-0 text-center text-micro font-bold">{prizePage * PRIZE_PAGE_SIZE + index + 1}</span><img src={prize.image_url ?? PRODUCT_PLACEHOLDER} onError={usePlaceholderOnError} alt={prize.title} className="h-14 w-14 shrink-0 rounded-lg object-cover"/><p className="line-clamp-2 min-w-0 flex-1 text-caption font-bold">{prize.title}</p><button onClick={() => void toggleLike(prize.id)} className={`shrink-0 rounded-lg border px-2 py-2 text-micro font-bold ${prize.liked_by_me ? "border-state-danger text-state-danger" : "border-border"}`}>♥ {prize.like_count}</button></article>)}</div>}{!prizes.length && <p className="py-8 text-center text-caption text-text-muted">등록된 이벤트 경품이 없습니다.</p>}{prizePageCount > 1 && <div className="mt-3 flex items-center justify-center gap-3"><button disabled={prizePage === 0} onClick={() => setPrizePage((page) => page - 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-30">‹</button><span className="text-micro">{prizePage + 1} / {prizePageCount}</span><button disabled={prizePage === prizePageCount - 1} onClick={() => setPrizePage((page) => page + 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-30">›</button></div>}</>}
    </section>}
  </div>;
}
