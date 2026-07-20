"use client";
import Link from "next/link";
import { useAppState } from "@/lib/store/provider";
import { getStudentById, approvedClassesForStudent } from "@/lib/store/selectors";
import { Avatar } from "@/components/ui/Avatar";
import { FlapBanner } from "@/components/student/FlapBanner";
import { RankingBlock } from "@/components/student/RankingBlock";
import { RewardBlock } from "@/components/student/RewardBlock";

export default function StudentHomePage() {
  const state = useAppState();
  const me = getStudentById(state, state.currentUserId);
  if (!me) return null;

  const classes = approvedClassesForStudent(state, me.id);

  return (
    <div>
      <FlapBanner />

      <div className="bg-surface-card rounded-card p-4 mb-3.5 flex items-center gap-3">
        <Avatar name={me.name} size={44} />
        <div className="flex-1 min-w-0">
          <p className="text-subtitle">{me.name}</p>
          <p className="text-caption text-text-secondary truncate">{classes.map((c) => c.name).join(" · ")}</p>
        </div>
        <Link
          href="/student/sticker?tab=attend"
          className="px-3 py-2 rounded-xl bg-brand-amber text-surface-page font-bold text-caption flex-shrink-0"
        >
          체크 하러가기
        </Link>
      </div>

      <RankingBlock />

      <RewardBlock />
    </div>
  );
}
