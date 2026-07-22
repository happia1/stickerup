"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { PageSkeleton } from "@/components/ui/PageSkeleton";

export default function StudentHomePage() {
  const router = useRouter();
  const state = useAppState();
  const [remoteData, setRemoteData] = useState<StudentHomeData | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [classPromptDismissed,setClassPromptDismissed]=useState(false);
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
        if (active) setLoading(false);
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${accessToken}` };
        const [profileResponse, response] = await Promise.all([
          fetch("/api/auth/profile", { headers, cache: "no-store" }),
          fetch("/api/student/home", { headers, cache: "no-store" }),
        ]);
        const profile = await profileResponse.json() as { role?: "student" | "owner" | "assistant" | null; onboarded?: boolean; error?: string };
        if (!profileResponse.ok) throw new Error(profile.error ?? "계정 정보를 확인하지 못했습니다.");
        if (profile.role === "owner" || profile.role === "assistant") {
          router.replace("/admin/dashboard");
          return;
        }
        if (profile.role !== "student") {
          throw new Error("학생 가입 정보가 없습니다. 학생 계정으로 다시 로그인해 주세요.");
        }

        const payload = (await response.json()) as { data?: StudentHomeData; error?: string };
        if (!response.ok || !payload.data) {
          throw new Error(payload.error ?? "학생 홈 데이터를 불러오지 못했습니다.");
        }
        if (active) setRemoteData(payload.data);
      } catch (error) {
        if (active) {
          setConnectionMessage(error instanceof Error ? error.message : "학생 홈 데이터를 불러오지 못했습니다.");
        }
      } finally { if (active) setLoading(false); }
    }

    void loadStudentHome(client);
    return () => {
      active = false;
    };
  }, [router]);

  const me = remoteData?.student ?? mockStudent;
  if (loading) return <PageSkeleton />;
  if (!me) {
    return (
      <div>
        <SupabaseModeNotice />
        {connectionMessage && <p className="mb-3 text-caption text-text-muted">{connectionMessage}</p>}
        <div className="bg-surface-card rounded-card p-5 text-center">
          <p className="text-subtitle mb-2">학생 정보를 불러오지 못했습니다.</p>
          <p className="text-caption text-text-secondary mb-4">다시 로그인하거나 가입 상태를 확인해 주세요.</p>
          <Link href="/login?reauth=1&type=student" className="inline-flex rounded-xl bg-brand-amber px-4 py-2 text-caption font-bold text-surface-page">
            로그인으로 이동
          </Link>
        </div>
      </div>
    );
  }

  const classes = remoteData?.classes ?? approvedClassesForStudent(state, me.id);
  const allClasses=remoteData?.classes??state.classes;const hasSpecial=classes.some(item=>!item.is_default);const availableSpecial=allClasses.some(item=>!item.is_default&&item.status==="active");const showClassPrompt=availableSpecial&&!hasSpecial&&!classPromptDismissed;

  return (
    <div>
      {showClassPrompt&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-sm rounded-card bg-surface-card p-6 text-center"><h2 className="text-subtitle">현재 등록된 특강반을 설정해 주세요</h2><p className="mt-2 text-caption text-text-secondary">특강반을 선택하면 출석·숙제·칭찬의 기본 반으로 사용됩니다.</p><Link href="/student/mypage#class-enrollment" className="mt-5 block rounded-xl bg-brand-amber py-3 font-bold text-surface-page">마이페이지에서 특강반 선택</Link><button onClick={()=>setClassPromptDismissed(true)} className="mt-3 text-caption text-text-muted">나중에 하기</button></div></div>}
      <SupabaseModeNotice />
      {!me.invited_by_teacher_id && <TeacherConnectionCard />}
      {connectionMessage && <p className="mb-3 text-caption text-text-muted">{connectionMessage}</p>}
      <FlapBanner notices={remoteData?.notices} />
      <div className="bg-surface-card rounded-card p-4 mb-3.5 flex items-center gap-3">
        <Avatar name={me.name} size={44} imageUrl={me.profile_image_url} />
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
