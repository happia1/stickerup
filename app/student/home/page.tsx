"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/store/provider";
import { approvedClassesForStudent, getStudentById } from "@/lib/store/selectors";
import { Avatar } from "@/components/ui/Avatar";
import { FlapBanner } from "@/components/student/FlapBanner";
import { RankingBlock } from "@/components/student/RankingBlock";
import { RewardBlock } from "@/components/student/RewardBlock";
import { SupabaseModeNotice } from "@/components/supabase/SupabaseModeNotice";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { StudentHomeData } from "@/lib/data/student-home.types";
import { TeacherConnectionCard } from "@/components/student/TeacherConnectionCard";

export default function StudentHomePage() {
  const state = useAppState();
  const [remoteData, setRemoteData] = useState<StudentHomeData | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const mockStudent = getStudentById(state, state.currentUserId);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;

    let active = true;
    async function loadStudentHome(supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>) {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        if (active) setConnectionMessage("로그인하면 최신 정보를 불러옵니다.");
        return;
      }

      try {
        const response = await fetch("/api/student/home", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const payload = (await response.json()) as { data?: StudentHomeData; error?: string };
        if (!response.ok || !payload.data) {
          throw new Error(payload.error ?? "학생 홈 데이터를 불러오지 못했습니다.");
        }
        if (active) setRemoteData(payload.data);
      } catch (error) {
        if (active) {
          setConnectionMessage(error instanceof Error ? error.message : "학생 홈 데이터를 불러오지 못했습니다.");
        }
      }
    }

    void loadStudentHome(client);
    return () => {
      active = false;
    };
  }, []);

  const me = remoteData?.student ?? mockStudent;
  if (!me) {
    return (
      <div>
        <SupabaseModeNotice />
        {connectionMessage && <p className="mb-3 text-caption text-text-muted">{connectionMessage}</p>}
        <div className="bg-surface-card rounded-card p-5 text-center">
          <p className="text-subtitle mb-2">학생 정보를 불러오지 못했습니다.</p>
          <p className="text-caption text-text-secondary mb-4">다시 로그인하거나 가입 상태를 확인해 주세요.</p>
          <Link href="/login" className="inline-flex rounded-xl bg-brand-amber px-4 py-2 text-caption font-bold text-surface-page">
            로그인으로 이동
          </Link>
        </div>
      </div>
    );
  }

  const classes = remoteData?.classes ?? approvedClassesForStudent(state, me.id);

  return (
    <div>
      <SupabaseModeNotice />
      {!me.invited_by_teacher_id && <TeacherConnectionCard />}
      {connectionMessage && <p className="mb-3 text-caption text-text-muted">{connectionMessage}</p>}
      <FlapBanner notices={remoteData?.notices} />
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
          스티커 받기
        </Link>
      </div>
      <RankingBlock data={remoteData ?? undefined} />
      <RewardBlock data={remoteData ?? undefined} />
    </div>
  );
}
