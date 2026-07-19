"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import {
  featuredCampaignForStudent,
  itemsForCampaign,
  claimsForItem,
  getCampaignMeta,
  campaignStatus,
  ddayLabel,
  approvedClassesForStudent,
} from "@/lib/store/selectors";
import { RewardCard } from "@/components/ui/RewardCard";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Pill } from "@/components/ui/Pill";
import { useToast } from "@/lib/toast/provider";
import type { RewardCampaign } from "@/lib/types";

function claimLabel(meta: ReturnType<typeof getCampaignMeta>): { label: string; disabled: boolean } {
  if (meta.iHaveClaimed) return { label: "다른 상품 수령함", disabled: true };
  if (meta.status === "ended") return { label: "이벤트 종료", disabled: true };
  if (meta.status === "scheduled") return { label: "시작 전", disabled: true };
  if (!meta.iAmEligible) return { label: "자격 미달", disabled: true };
  if (!meta.isMyTurn) return { label: "순서 대기중", disabled: true };
  return { label: "선택하기", disabled: false };
}

export function RewardBlock() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const featured = featuredCampaignForStudent(state, state.currentUserId);

  const handleClaim = (campaign: RewardCampaign, itemId: string, itemTitle: string) => {
    const meta = getCampaignMeta(state, campaign, state.currentUserId);
    dispatch({ type: "CLAIM_REWARD", itemId, studentId: state.currentUserId, rank: meta.myRank ?? 0 });
    showToast(`"${itemTitle}" 선택 완료!`);
  };

  const renderCampaignItems = (campaign: RewardCampaign) => {
    const meta = getCampaignMeta(state, campaign, state.currentUserId);
    const items = itemsForCampaign(state, campaign.id);
    return (
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
        {items.map((item) => {
          const claimed = claimsForItem(state, item.id).length;
          const { label, disabled } = claimLabel(meta);
          return (
            <RewardCard
              key={item.id}
              title={item.title}
              qty={item.qty}
              claimed={claimed}
              buttonLabel={label}
              disabled={disabled}
              onClaim={() => handleClaim(campaign, item.id, item.title)}
            />
          );
        })}
      </div>
    );
  };

  const myClassIds = new Set(approvedClassesForStudent(state, state.currentUserId).map((c) => c.id));
  const allVisible = state.rewardCampaigns.filter((c) => c.class_id === null || myClassIds.has(c.class_id));

  return (
    <div className="bg-surface-card border border-border rounded-card p-4 mb-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-subtitle">{featured ? featured_name(featured, state) : "진행중인 이벤트 없음"}</h3>
        <Button variant="secondary" onClick={() => setSheetOpen(true)} className="!py-1.5 !px-2.5 !text-micro">
          다른 이벤트
        </Button>
      </div>
      {featured ? (
        <>
          <p className="text-caption text-text-muted mb-2">
            {campaignStatus(featured) === "scheduled"
              ? `${ddayLabel(featured.period_start)} 시작 예정`
              : `${ddayLabel(featured.period_end)} 마감`}
          </p>
          {renderCampaignItems(featured)}
        </>
      ) : (
        <p className="text-caption text-text-muted">진행중이거나 예정된 상품 이벤트가 없어요.</p>
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="전체 상품 이벤트">
        {allVisible.map((c) => (
          <div key={c.id} className="bg-surface-card border border-border rounded-card p-3 mb-3">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-body font-bold">{campaignLabel(c)}</p>
              <Pill tone={campaignStatus(c) === "active" ? "ok" : campaignStatus(c) === "ended" ? "danger" : "wait"}>
                {campaignStatus(c) === "active" ? ddayLabel(c.period_end) + " 마감" : campaignStatus(c) === "ended" ? "종료" : ddayLabel(c.period_start)}
              </Pill>
            </div>
            {campaignStatus(c) === "scheduled" ? (
              <p className="text-caption text-text-muted">이벤트 시작 전이에요.</p>
            ) : (
              renderCampaignItems(c)
            )}
          </div>
        ))}
      </BottomSheet>
    </div>
  );
}

function campaignLabel(c: RewardCampaign) {
  return `${c.period_start} ~ ${c.period_end} 이벤트`;
}

function featured_name(c: RewardCampaign, state: ReturnType<typeof useAppState>) {
  const cls = c.class_id ? state.classes.find((x) => x.id === c.class_id) : null;
  return cls ? `${cls.name} 랭킹 보상` : "전체 랭킹 보상";
}
