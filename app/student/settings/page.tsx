"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast/provider";
import clsx from "@/lib/clsx";
import { AppFooter } from "@/components/layout/AppFooter";
import { useAppState } from "@/lib/store/provider";
import { getStudentById } from "@/lib/store/selectors";

export default function StudentSettingsPage() {
  const router = useRouter();
  const showToast = useToast();
  const state = useAppState();
  const me = getStudentById(state, state.currentUserId);
  const [notifications, setNotifications] = useState(true);
  const [deleting, setDeleting] = useState(false);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    showToast("로그아웃했습니다.");
    router.replace("/");
  }

  async function handleDeleteProfile() {
    if (deleting) return;
    const confirmed = window.confirm("프로필을 삭제하면 스티커, 반 소속, 활동 기록을 복구할 수 없습니다. 정말 삭제할까요?");
    if (!confirmed) return;

    const supabase = getSupabaseBrowserClient();
    const session = (await supabase?.auth.getSession())?.data.session;
    if (!supabase || !session) {
      showToast("로그인 상태를 확인한 뒤 다시 시도해 주세요.");
      router.replace("/");
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch("/api/student/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error ?? "프로필을 삭제하지 못했습니다.");
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "프로필을 삭제하지 못했습니다.");
      setDeleting(false);
    }
  }

  return (
    <div>
      <Card>
        <h2 className="text-subtitle mb-2">환경설정</h2>
        <button
          type="button"
          role="switch"
          aria-checked={notifications}
          onClick={() => {
            setNotifications((value) => !value);
            showToast(notifications ? "알림을 껐어요." : "알림을 켰어요.");
          }}
          className="w-full flex items-center justify-between py-2.5"
        >
          <span>
            <span className="block text-body text-left">알림 받기</span>
            <span className="block text-caption text-text-muted text-left">숙제·칭찬 승인, 스티커 롤백 알림</span>
          </span>
          <span className={clsx("relative h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors", notifications ? "bg-brand-amber" : "bg-surface-raised")}>
            <span className={clsx("absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface-page transition-transform", notifications ? "translate-x-5" : "translate-x-0")} />
          </span>
        </button>
      </Card>

      <Card>
        <h2 className="text-subtitle mb-2">계정</h2>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl bg-surface-raised px-3 py-3 text-left text-body text-text-primary"
        >
          로그아웃
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={handleDeleteProfile}
          className="mt-2 block w-full px-1 py-1 text-left text-micro text-text-muted hover:text-state-danger disabled:opacity-50"
        >
          {deleting ? "프로필 삭제 중..." : "프로필 삭제하기"}
        </button>
      </Card>
      <AppFooter initialName={me?.name ?? ""} />
    </div>
  );
}
