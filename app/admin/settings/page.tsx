"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAppDispatch, useAppState } from "@/lib/store/provider";
import { getTeacherById } from "@/lib/store/selectors";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast/provider";
import { AppFooter } from "@/components/layout/AppFooter";

export default function AdminSettingsPage() {
  const router = useRouter();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const me = getTeacherById(state, state.currentUserId);
  const loadedTeacherId = me?.id;
  const loadedTeacherName = me?.name;
  const [name, setName] = useState(me?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loadedTeacherId || !loadedTeacherName) return;
    setName(loadedTeacherName);
  }, [loadedTeacherId, loadedTeacherName]);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    showToast("로그아웃했습니다.");
    router.replace("/");
  }

  async function handleDeleteProfile() {
    if (deleting) return;
    const confirmed = window.confirm("관리자 프로필을 삭제하면 해당 계정으로 다시 로그인할 수 없습니다. 학원과 학생 데이터는 유지됩니다. 정말 삭제할까요?");
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
      const response = await fetch("/api/admin/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error ?? "관리자 프로필을 삭제하지 못했습니다.");
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "관리자 프로필을 삭제하지 못했습니다.");
      setDeleting(false);
    }
  }

  async function handleSaveProfile() {
    const nextName = name.trim() || me?.name;
    if (!me || !nextName || saving) return;
    const supabase = getSupabaseBrowserClient();
    const session = (await supabase?.auth.getSession())?.data.session;
    if (!session) return showToast("로그인 상태를 확인한 뒤 다시 시도해 주세요.");

    try {
      setSaving(true);
      const response = await fetch("/api/admin/profile", { method: "PATCH", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: nextName }) });
      const payload = await response.json().catch(() => null) as { teacher?: { name: string }; error?: string } | null;
      if (!response.ok || !payload?.teacher) throw new Error(payload?.error ?? "프로필을 저장하지 못했습니다.");
      dispatch({ type: "UPDATE_TEACHER_PROFILE", teacherId: me.id, name: payload.teacher.name, profileImageUrl: null });
      showToast("프로필이 저장되었습니다.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "프로필을 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (!me) {
    return (
      <Card>
        <h2 className="mb-2 text-subtitle">관리자 설정</h2>
        <p className="mb-4 text-caption text-text-secondary">관리자 프로필을 불러오지 못했습니다. 다시 로그인해 주세요.</p>
        <Button onClick={handleLogout}>로그아웃</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-xl">
      <h2 className="mb-1 text-title">설정</h2>
      <p className="mb-5 text-caption text-text-secondary">관리자 프로필과 계정 상태를 관리해요.</p>

      <Card>
        <h3 className="mb-4 text-subtitle">내 프로필</h3>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-state-warningBg text-title font-extrabold text-brand-amber">
            {(name || me.name).slice(0, 1)}
          </div>
          <p className="text-caption text-text-muted">관리자 프로필은 이름으로 표시됩니다.</p>
        </div>

        <label className="mb-3 block text-caption font-semibold text-text-secondary">
          이름
          <input
            className="mt-1 w-full rounded-xl bg-surface-raised px-3 py-2.5 text-body text-text-primary outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <div className="mb-4 rounded-xl bg-surface-raised p-3 text-caption text-text-secondary">
          <p>역할: <b className="text-text-primary">{me.role === "owner" ? "관리자" : "보조 선생님"}</b></p>
          <p>학원: <b className="text-text-primary">{state.tenant.name}</b></p>
        </div>
        <Button
          disabled={saving}
          onClick={handleSaveProfile}
        >
          {saving ? "저장 중..." : "프로필 저장"}
        </Button>
      </Card>

      <Card>
        <h3 className="mb-2 text-subtitle">계정</h3>
        <Button variant="secondary" onClick={handleLogout}>로그아웃</Button>
        <button
          type="button"
          disabled={deleting}
          onClick={handleDeleteProfile}
          className="mt-2 block px-1 py-1 text-left text-micro text-text-muted hover:text-state-danger disabled:opacity-50"
        >
          {deleting ? "프로필 삭제 중..." : "프로필 삭제하기"}
        </button>
      </Card>
      <AppFooter initialName={me.name} />
    </div>
  );
}
