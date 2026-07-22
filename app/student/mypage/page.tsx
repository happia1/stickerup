"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useAppDispatch, useAppState } from "@/lib/store/provider";
import {
  approvedClassesForStudent,
  getClassById,
  getStudentById,
  getTeacherById,
  pendingEnrollmentsForStudent,
  totalStickers,
} from "@/lib/store/selectors";
import { fmtDateTime } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { useToast } from "@/lib/toast/provider";
import clsx from "@/lib/clsx";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { setPreferredClass } from "@/lib/preferred-class";
import { koreaDateKey } from "@/lib/korea-date";

function birthdayLabel(value?: string | null) {
  if (!value) return "생일 미입력";
  const [, month, day] = value.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
}

function resizeProfileImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("사진을 불러오지 못했어요."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("사용할 수 없는 이미지예요."));
      image.onload = () => {
        const size = Math.min(image.naturalWidth, image.naturalHeight);
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("사진을 처리하지 못했어요."));
        context.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 512, 512);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function StudentMyPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const me = getStudentById(state, state.currentUserId);
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(me?.name ?? "");
  const [birthDate, setBirthDate] = useState(me?.birth_date ?? "");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(me?.profile_image_url ?? null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [requesting, setRequesting] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  if (!me) return null;

  const approved = approvedClassesForStudent(state, me.id);
  const pending = pendingEnrollmentsForStudent(state, me.id);
  const teacher = getTeacherById(state, me.invited_by_teacher_id ?? "");
  const approvedIds = new Set(approved.map((cls) => cls.id));
  const pendingIds = new Set(pending.map((enrollment) => enrollment.class_id));
  const requestableClasses = state.classes.filter(
    (cls) => cls.status === "active" && !cls.is_default && !approvedIds.has(cls.id) && !pendingIds.has(cls.id)
  );
  const activeTotal = totalStickers(state, me.id);
  const toggleClass = (classId: string) => {
    setSelectedClassIds((prev) => (prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]));
  };
  const postStudentAction = async (body: Record<string, unknown>) => {
    const client = getSupabaseBrowserClient();
    const { data } = await client!.auth.getSession();
    if (!data.session) throw new Error("로그인 정보를 확인하지 못했어요. 다시 로그인해 주세요.");
    const response = await fetch("/api/student/actions", { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "요청을 처리하지 못했어요.");
    return payload;
  };
  const selectProfileImage = async (file?: File) => {
    if (!file) return;
    try { setProfileImageUrl(await resizeProfileImage(file)); }
    catch (error) { showToast(error instanceof Error ? error.message : "사진을 처리하지 못했어요."); }
  };

  return (
    <div id="class-enrollment">
      <Card>
        <div className="flex items-center gap-3">
          <Avatar name={editingProfile ? name || me.name : me.name} size={56} imageUrl={editingProfile ? profileImageUrl : me.profile_image_url} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {editingProfile ? (
                <input
                  className="min-w-0 flex-1 bg-surface-raised rounded-lg px-2.5 py-1.5 text-subtitle text-text-primary"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-label="이름"
                />
              ) : (
                <h2 className="text-subtitle truncate">{me.name}</h2>
              )}
              <button
                type="button"
                aria-label="프로필 설정"
                className="w-7 h-7 rounded-full bg-surface-raised text-text-secondary text-caption flex items-center justify-center flex-shrink-0"
                onClick={() => {
                  setName(me.name);
                  setBirthDate(me.birth_date ?? "");
                  setProfileImageUrl(me.profile_image_url ?? null);
                  setEditingProfile((value) => !value);
                }}
              >
                <span className="inline-block -scale-x-100" aria-hidden="true">✎</span>
              </button>
            </div>
            {editingProfile ? (
              <input
                type="date"
                max={koreaDateKey()}
                className="mt-2 w-full max-w-44 bg-surface-raised rounded-lg px-2.5 py-1.5 text-caption text-text-primary"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                aria-label="생년월일"
              />
            ) : (
              <p className="text-caption text-text-secondary truncate"><span className="font-bold text-brand-amber">{birthdayLabel(me.birth_date)}</span>{approved.length ? ` · ${approved.map((cls) => cls.name).join(" · ")}` : ""}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-display text-brand-amber">{activeTotal}</p>
            <p className="text-caption text-text-muted">보유 스티커</p>
          </div>
        </div>
        {editingProfile && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer rounded-lg bg-surface-raised px-3 py-2 text-caption font-bold text-brand-amber">
                앨범에서 선택
                <input type="file" accept="image/*" className="hidden" onChange={(event) => { void selectProfileImage(event.target.files?.[0]); event.target.value = ""; }} />
              </label>
              <label className="cursor-pointer rounded-lg bg-surface-raised px-3 py-2 text-caption font-bold text-brand-amber">
                카메라로 촬영
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => { void selectProfileImage(event.target.files?.[0]); event.target.value = ""; }} />
              </label>
              {profileImageUrl && <button type="button" className="px-2 text-caption text-state-danger" onClick={() => setProfileImageUrl(null)}>사진 삭제</button>}
            </div>
            <div className="flex gap-2">
            <Button
              className="!py-2 !text-caption"
              disabled={savingProfile}
              onClick={async () => {
                try {
                  setSavingProfile(true);
                  const nextName = name.trim() || me.name;
                  await postStudentAction({ action: "profile", name: nextName, birthDate: birthDate || null, profileImageUrl });
                  dispatch({ type: "UPDATE_STUDENT_PROFILE", studentId: me.id, name: nextName, birthDate: birthDate || null, profileImageUrl });
                  showToast("프로필이 저장되었어요.");
                  setEditingProfile(false);
                } catch (error) {
                  showToast(error instanceof Error ? error.message : "프로필을 저장하지 못했어요.");
                } finally { setSavingProfile(false); }
              }}
            >
              {savingProfile ? "저장 중..." : "저장"}
            </Button>
            <Button
              variant="secondary"
              className="!py-2 !text-caption"
              onClick={() => {
                setName(me.name);
                setBirthDate(me.birth_date ?? "");
                setProfileImageUrl(me.profile_image_url ?? null);
                setEditingProfile(false);
              }}
            >
              취소
            </Button>
            </div>
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-caption text-text-secondary">
            소속 학원: <b className="text-text-primary">{state.tenant.name}</b>
          </p>
          <p className="text-caption text-text-secondary mt-1">
            담당 선생님: <b className="text-text-primary">{teacher?.name ?? "-"}</b>
          </p>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-subtitle">소속 반 현황</h3>
        </div>
        {approved.length === 0 && pending.length === 0 && (
          <p className="text-caption text-text-muted">아직 소속된 반이 없어요.</p>
        )}
        {approved.map((cls) => (
          <div key={cls.id} className="flex items-center justify-between py-1.5">
            <p className="min-w-0 truncate text-body">{cls.name} <span className="text-caption text-text-muted">· {cls.is_default ? "정규반" : "특강반"}</span></p>
            <Pill tone="ok">승인됨</Pill>
          </div>
        ))}
        {pending.map((enrollment) => {
          const cls = getClassById(state, enrollment.class_id);
          return (
            <div key={enrollment.id} className="flex items-center justify-between gap-3 py-1.5">
              <div>
                <p className="text-body">{cls?.name}</p>
                <p className="text-caption text-text-muted">{fmtDateTime(enrollment.requested_at)} 요청</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Pill tone="wait">승인대기</Pill>
                <button
                  type="button"
                  disabled={withdrawingId === enrollment.id}
                  className="rounded-lg border border-border px-2.5 py-1.5 text-caption font-bold text-state-danger disabled:opacity-50"
                  onClick={async () => {
                    try {
                      setWithdrawingId(enrollment.id);
                      await postStudentAction({ action: "withdraw-enrollment", enrollmentId: enrollment.id });
                      dispatch({ type: "WITHDRAW_ENROLLMENT", enrollmentId: enrollment.id });
                      showToast("반 승인 신청을 취소했어요.");
                    } catch (error) {
                      showToast(error instanceof Error ? error.message : "승인 신청을 취소하지 못했어요.");
                    } finally { setWithdrawingId(null); }
                  }}
                >
                  {withdrawingId === enrollment.id ? "취소 중" : "신청 취소"}
                </button>
              </div>
            </div>
          );
        })}

        <div className="mt-4 pt-3 border-t border-border">
          <h4 className="text-body font-bold mb-1">소속 반 신청하기</h4>
          <p className="text-caption text-text-secondary mb-3">원하는 특강반을 선택하면 관리자에게 승인 요청이 전달돼요.</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {requestableClasses.length === 0 ? (
              <p className="text-caption text-text-muted col-span-2">신청 가능한 반이 없어요.</p>
            ) : (
              requestableClasses.map((cls) => {
                const selected = selectedClassIds.includes(cls.id);
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => toggleClass(cls.id)}
                    className={clsx(
                      "min-h-11 rounded-lg px-2.5 py-2.5 text-body text-center",
                      selected ? "bg-state-warningBg text-brand-amber font-bold ring-2 ring-brand-amber" : "bg-surface-raised text-text-primary"
                    )}
                  >
                    {cls.name}
                  </button>
                );
              })
            )}
          </div>
          <Button
            fullWidth
            disabled={selectedClassIds.length === 0 || requesting}
            onClick={async () => {
              setRequesting(true);
              try {
                const client = getSupabaseBrowserClient();
                const { data } = await client!.auth.getSession();
                if (data.session) {
                  const response = await fetch("/api/student/actions", { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ action: "enrollment", classIds: selectedClassIds }) });
                  const payload = await response.json();
                  if (!response.ok) throw new Error(payload.error ?? "승인요청을 보내지 못했어요.");
                }
                dispatch({ type: "REQUEST_ENROLLMENT", studentId: me.id, classIds: selectedClassIds });
                setPreferredClass(me.id, selectedClassIds[0]);
                showToast(`${selectedClassIds.length}개 특강반에 등록했어요.`);
                setSelectedClassIds([]);
              } catch (error) {
                showToast(error instanceof Error ? error.message : "승인요청을 보내지 못했어요.");
              } finally {
                setRequesting(false);
              }
            }}
          >
            {requesting ? "요청 중..." : "승인요청하기"}
          </Button>
        </div>
      </Card>

    </div>
  );
}
