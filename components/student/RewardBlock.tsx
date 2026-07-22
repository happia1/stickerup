"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import {
  featuredCampaignForStudent,
  itemsForCampaign,
  getCampaignMeta,
  campaignStatus,
  ddayLabel,
  approvedClassesForStudent,
} from "@/lib/store/selectors";
import { RewardCard } from "@/components/ui/RewardCard";
import { useToast } from "@/lib/toast/provider";
import type { RewardCampaign } from "@/lib/types";
import type { StudentHomeData } from "@/lib/data/student-home.types";
import type { AppState } from "@/lib/store/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function claimLabel(meta: ReturnType<typeof getCampaignMeta>): { label: string | null; disabled: boolean } {
  if (meta.status !== "ended") return { label: null, disabled: true };
  if (meta.iHaveClaimed) return { label: "경품 선택 완료", disabled: true };
  if (!meta.iAmEligible) return { label: "다음 기회", disabled: true };
  if (!meta.isMyTurn) return { label: "선택 순서 대기", disabled: true };
  return { label: "경품 고르기", disabled: false };
}

function campaignTitle(campaign: RewardCampaign, state: AppState) {
  if (campaign.title?.trim()) return campaign.title;
  const cls = campaign.class_id ? state.classes.find((item) => item.id === campaign.class_id) : null;
  return cls ? `${cls.name} 랭킹 보상` : "전체 랭킹 보상";
}

function campaignDescription(campaign: RewardCampaign, state: AppState) {
  if(campaign.description?.trim())return campaign.description;
  const cls = campaign.class_id ? state.classes.find((item) => item.id === campaign.class_id) : null;
  const scope = cls ? cls.name : "전체 학생";
  return `${scope} 랭킹 결과에 따라 원하는 보상을 선택할 수 있어요.`;
}

export function RewardBlock({ data }: { data?: StudentHomeData }) {
  const mockState = useAppState();
  const state: AppState = data
    ? {
        ...mockState,
        currentUserId: data.student.id,
        classes: data.classes,
        enrollments: data.enrollments,
        ledger: data.stickerLedger,
        rewardCampaigns: data.rewardCampaigns,
        rewardItems: data.rewardItems,
        rewardClaims: data.rewardClaims,
      }
    : mockState;
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expandedId,setExpandedId]=useState<string|null>(null);
  const [fullTab,setFullTab]=useState<"events"|"prizes">("events");
  const [prizes,setPrizes]=useState<Array<{id:string;title:string;image_url:string|null;description:string|null;like_count:number;liked_by_me:boolean}>>([]);
  const [prizesLoading,setPrizesLoading]=useState(true);
  const featured = featuredCampaignForStudent(state, state.currentUserId);
  useEffect(()=>{let active=true;void getSupabaseBrowserClient()?.auth.getSession().then(async({data})=>{if(!data.session){if(active)setPrizesLoading(false);return;}try{const response=await fetch("/api/student/prize-preferences",{headers:{Authorization:`Bearer ${data.session.access_token}`},cache:"no-store"});const payload=await response.json();if(active&&response.ok)setPrizes(payload.products);}finally{if(active)setPrizesLoading(false);}});return()=>{active=false;};},[]);
  const toggleLike=async(productId:string)=>{const session=await getSupabaseBrowserClient()?.auth.getSession();const token=session?.data.session?.access_token;if(!token)return;const response=await fetch("/api/student/prize-preferences",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({productId})});if(!response.ok)return showToast("받고 싶은 경품을 저장하지 못했어요.");setPrizes(current=>current.map(item=>item.id===productId?{...item,liked_by_me:!item.liked_by_me,like_count:item.like_count+(item.liked_by_me?-1:1)}:item).sort((a,b)=>b.like_count-a.like_count||a.title.localeCompare(b.title,"ko")));};
  const openFullView=(tab:"events"|"prizes")=>{setFullTab(tab);setSheetOpen(true);};

  const handleClaim = async (campaign: RewardCampaign, itemId: string, itemTitle: string) => {
    const meta = getCampaignMeta(state, campaign, state.currentUserId);
    const session = await getSupabaseBrowserClient()?.auth.getSession();
    const token = session?.data.session?.access_token;
    if (!token) return showToast("로그인이 필요합니다.");
    const response = await fetch("/api/student/reward-claims", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    const payload = await response.json();
    if (!response.ok) return showToast(payload.error ?? "상품을 선택하지 못했습니다.");
    dispatch({ type: "CLAIM_REWARD", itemId, studentId: state.currentUserId, rank: meta.myRank ?? 0 });
    showToast(`"${itemTitle}" 선택 완료!`);
  };

  const renderCampaignItems = (campaign: RewardCampaign) => {
    const meta = getCampaignMeta(state, campaign, state.currentUserId);
    const items = itemsForCampaign(state, campaign.id);
    const { label, disabled } = claimLabel(meta);
    return (
      <div className="-mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth px-1 pb-2 scrollbar-none overscroll-x-contain">
        {items.map((item) => (
          <RewardCard
            key={item.id}
            title={item.title}
            buttonLabel={label}
            disabled={disabled}
            onClaim={() => void handleClaim(campaign, item.id, item.title)}
            imageUrl={item.image_url}
          />
        ))}
      </div>
    );
  };

  const myClassIds = new Set(approvedClassesForStudent(state, state.currentUserId).map((item) => item.id));
  const allVisible = state.rewardCampaigns.filter((campaign) => campaign.class_id === null || myClassIds.has(campaign.class_id));

  return (
    <div className="mb-3.5 overflow-hidden rounded-card bg-surface-card p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-subtitle">{featured ? campaignTitle(featured, state) : "진행 중인 이벤트 없음"}</h3>
      </div>
      <div className="mb-3 grid grid-cols-2 gap-2"><button type="button" onClick={()=>openFullView("events")} className="rounded-lg border border-border px-3 py-2 text-caption font-bold text-text-primary">전체 이벤트</button><button type="button" onClick={()=>openFullView("prizes")} className="rounded-lg bg-brand-amber px-3 py-2 text-caption font-bold text-surface-page">이벤트 경품</button></div>
      {featured ? (
        <>
          <p className="mb-3 text-micro text-text-muted">
            {campaignStatus(featured) === "scheduled"
              ? `${ddayLabel(featured.period_start)} 시작 예정`
              : `${ddayLabel(featured.period_end)} 마감`}
          </p>
          {renderCampaignItems(featured)}
          <p className="mt-2 text-caption text-text-secondary">{campaignDescription(featured, state)}</p>
        </>
      ) : (
        <p className="text-caption text-text-muted">진행 중이거나 예정된 보상 이벤트가 없어요.</p>
      )}
      {sheetOpen&&<div className="fixed inset-0 z-50 overflow-y-auto bg-surface-page p-4"><div className="mx-auto max-w-app"><button onClick={()=>setSheetOpen(false)} className="mb-5 flex items-center gap-2 text-body font-bold"><span aria-hidden="true">←</span> 돌아가기</button><div className="mb-5 grid grid-cols-2 rounded-xl bg-surface-raised p-1"><button onClick={()=>setFullTab("events")} className={`rounded-lg py-2.5 font-bold ${fullTab==="events"?"bg-brand-amber text-surface-page":"text-text-secondary"}`}>전체 이벤트</button><button onClick={()=>setFullTab("prizes")} className={`rounded-lg py-2.5 font-bold ${fullTab==="prizes"?"bg-brand-amber text-surface-page":"text-text-secondary"}`}>이벤트 경품</button></div>{fullTab==="events"?<div className="space-y-2">{allVisible.map(campaign=>{const expanded=expandedId===campaign.id;const cls=campaign.class_id?state.classes.find(item=>item.id===campaign.class_id)?.name:"전체";const remaining=campaignStatus(campaign)==="active"?`${ddayLabel(campaign.period_end)} 마감`:campaignStatus(campaign)==="ended"?"종료":`${ddayLabel(campaign.period_start)} 시작`;return <article key={campaign.id} className="rounded-card border border-border bg-surface-card"><button onClick={()=>setExpandedId(expanded?null:campaign.id)} className="flex w-full items-center gap-3 p-4 text-left"><span className="min-w-0 flex-1 font-bold">{campaignTitle(campaign,state)}</span><span className="text-caption text-text-secondary">{cls}</span><span className="text-caption text-text-muted">{remaining}</span><span className={expanded?"rotate-180":""}>⌄</span></button>{expanded&&<div className="border-t border-border p-4">{campaignStatus(campaign)==="scheduled"?<p className="text-caption text-text-muted">이벤트 시작 전이에요.</p>:renderCampaignItems(campaign)}<p className="mt-3 text-caption text-text-secondary">{campaignDescription(campaign,state)}</p></div>}</article>})}</div>:<section><h2 className="mb-1 text-title">이벤트 경품</h2><p className="mb-4 text-caption text-text-secondary">받고 싶은 경품에 `받고 싶다`를 눌러주세요.</p>{prizesLoading?<div className="grid grid-cols-2 gap-3">{[0,1,2,3].map(item=><div key={item} className="aspect-[3/4] animate-pulse rounded-card bg-surface-raised"/>)}</div>:<><div className="grid grid-cols-2 gap-3">{prizes.map((prize,index)=><article key={prize.id} className="relative overflow-hidden rounded-card border border-border bg-surface-card"><span className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-caption font-bold text-white">{index+1}</span><img src={prize.image_url??"/images/placeholder-product.svg"} alt={prize.title} className="aspect-square w-full object-cover"/><div className="p-3"><p className="line-clamp-2 text-caption font-bold">{prize.title}</p><button onClick={()=>void toggleLike(prize.id)} className={`mt-3 flex w-full items-center justify-center gap-1 rounded-lg border py-2 text-caption font-bold ${prize.liked_by_me?"border-state-danger bg-state-danger/10 text-state-danger":"border-border"}`}><span>{prize.liked_by_me?"♥":"♡"}</span> {prize.liked_by_me?"받고 싶어요":"받고 싶다"} · {prize.like_count}</button></div></article>)}</div>{!prizes.length&&<p className="py-10 text-center text-caption text-text-muted">등록된 이벤트 경품이 없습니다.</p>}</>}</section>}</div></div>}
    </div>
  );
}
