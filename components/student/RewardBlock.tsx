"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast/provider";
import type { RewardCampaign } from "@/lib/types";
import type { StudentHomeData } from "@/lib/data/student-home.types";
import type { AppState } from "@/lib/store/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function claimLabel(meta: ReturnType<typeof getCampaignMeta>): { label: string; disabled: boolean } {
  if (meta.iHaveClaimed) return { label: "상품 선택 완료", disabled: true };
  if (meta.status === "active") return { label: "랭킹 집계 중", disabled: true };
  if (meta.status === "scheduled") return { label: "시작 전", disabled: true };
  if (!meta.iAmEligible) return { label: "자격 미달", disabled: true };
  if (!meta.isMyTurn) return { label: "순서 대기 중", disabled: true };
  return { label: "선택하기", disabled: false };
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
  const featured = featuredCampaignForStudent(state, state.currentUserId);

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
      <div className="mb-1 flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-subtitle">{featured ? campaignTitle(featured, state) : "진행 중인 이벤트 없음"}</h3>
        <Button variant="secondary" onClick={() => setSheetOpen(true)} className="shrink-0 !px-2.5 !py-1.5 !text-micro">
          다른 이벤트
        </Button>
      </div>
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
      {sheetOpen&&<div className="fixed inset-0 z-50 overflow-y-auto bg-surface-page p-4"><div className="mx-auto max-w-app"><button onClick={()=>setSheetOpen(false)} className="mb-5 flex items-center gap-2 text-body font-bold"><span aria-hidden="true">←</span> 돌아가기</button><h2 className="mb-4 text-title">전체 이벤트</h2><div className="space-y-2">{allVisible.map(campaign=>{const expanded=expandedId===campaign.id;const cls=campaign.class_id?state.classes.find(item=>item.id===campaign.class_id)?.name:"전체";const remaining=campaignStatus(campaign)==="active"?`${ddayLabel(campaign.period_end)} 마감`:campaignStatus(campaign)==="ended"?"종료":`${ddayLabel(campaign.period_start)} 시작`;return <article key={campaign.id} className="rounded-card border border-border bg-surface-card"><button onClick={()=>setExpandedId(expanded?null:campaign.id)} className="flex w-full items-center gap-3 p-4 text-left"><span className="min-w-0 flex-1 font-bold">{campaignTitle(campaign,state)}</span><span className="text-caption text-text-secondary">{cls}</span><span className="text-caption text-text-muted">{remaining}</span><span className={expanded?"rotate-180":""}>⌄</span></button>{expanded&&<div className="border-t border-border p-4">{campaignStatus(campaign)==="scheduled"?<p className="text-caption text-text-muted">이벤트 시작 전이에요.</p>:renderCampaignItems(campaign)}<p className="mt-3 text-caption text-text-secondary">{campaignDescription(campaign,state)}</p></div>}</article>})}</div></div></div>}
    </div>
  );
}
