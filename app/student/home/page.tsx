"use client";
import Link from "next/link";
import { useAppState } from "@/lib/store/provider";
import { getStudentById, totalStickers, approvedClassesForStudent } from "@/lib/store/selectors";
import { Avatar } from "@/components/ui/Avatar";
import { FlapBanner } from "@/components/student/FlapBanner";
import { RankingBlock } from "@/components/student/RankingBlock";
import { RewardBlock } from "@/components/student/RewardBlock";

export default function StudentHomePage() {
  const state = useAppState();
  const me = getStudentById(state, state.currentUserId);
  if (!me) return null;

  const total = totalStickers(state, me.id);
  const classes = approvedClassesForStudent(state, me.id);

  return (
    <div>
      <FlapBanner />

      <div className="bg-surface-card border border-border rounded-card p-4 mb-3.5 flex items-center gap-3">
        <Avatar name={me.name} size={44} />
        <div>
          <p className="text-subtitle">{me.name}</p>
          <p className="text-caption text-text-secondary">{classes.map((c) => c.name).join(" · ")}</p>
        </div>
      </div>

      <RankingBlock />

      <div className="bg-surface-card border border-border rounded-card p-4 mb-3.5 flex items-center justify-between">
        <div>
          <p className="text-caption text-text-secondary">보유 총 스티커</p>
          <p className="text-display text-brand-amberDark">{total}장</p>
        </div>
        <Link
          href="/student/sticker?tab=attend"
          className="px-3.5 py-2.5 rounded-xl bg-brand-amber text-white font-bold text-body"
        >
          체크 하러가기
        </Link>
      </div>

      <RewardBlock />
    </div>
  );
}
