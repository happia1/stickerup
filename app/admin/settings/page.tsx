"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAppDispatch, useAppState } from "@/lib/store/provider";
import { getTeacherById } from "@/lib/store/selectors";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast/provider";

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const me = getTeacherById(state, state.currentUserId);
  const [name, setName] = useState(me?.name ?? "");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(me?.profile_image_url ?? null);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    showToast("로그아웃했습니다.");
    router.replace("/");
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
        <div className="mb-4 flex items-center gap-4">
          {profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profileImageUrl} alt="프로필 사진" className="h-20 w-20 rounded-full border border-border object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-state-warningBg text-display font-extrabold text-brand-amber">
              {(name || me.name).slice(0, 1)}
            </div>
          )}
          <div>
            <label className="inline-flex cursor-pointer rounded-xl bg-surface-raised px-3 py-2 text-caption text-brand-amber">
              사진 추가
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setProfileImageUrl(await readImageAsDataUrl(file));
                }}
              />
            </label>
            {profileImageUrl && (
              <button type="button" className="ml-2 text-caption text-state-danger" onClick={() => setProfileImageUrl(null)}>
                제거
              </button>
            )}
            <p className="mt-2 text-caption text-text-muted">현재는 앱 내 미리보기로 저장돼요. 추후 Supabase Storage와 연결합니다.</p>
          </div>
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
          <p>이메일: <b className="text-text-primary">{me.email}</b></p>
        </div>
        <Button
          onClick={() => {
            dispatch({ type: "UPDATE_TEACHER_PROFILE", teacherId: me.id, name: name.trim() || me.name, profileImageUrl });
            showToast("프로필이 저장되었습니다.");
          }}
        >
          프로필 저장
        </Button>
      </Card>

      <Card>
        <h3 className="mb-2 text-subtitle">계정</h3>
        <Button variant="secondary" onClick={handleLogout}>로그아웃</Button>
      </Card>
    </div>
  );
}
