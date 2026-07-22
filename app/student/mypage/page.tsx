"use client";
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

export default function StudentMyPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const me = getStudentById(state, state.currentUserId);
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(me?.name ?? "");
  const [age, setAge] = useState(String(me?.age ?? ""));
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [requesting, setRequesting] = useState(false);
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

  return (
    <div id="class-enrollment">
      <Card>
        <div className="flex items-center gap-3">
          <Avatar name={editingProfile ? name || me.name : me.name} size={56} />
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
                  setAge(String(me.age ?? ""));
                  setEditingProfile((value) => !value);
                }}
              >
                ✎
              </button>
            </div>
            {editingProfile ? (
              <input
                type="number"
                className="mt-2 w-24 bg-surface-raised rounded-lg px-2.5 py-1.5 text-caption text-text-primary"
                value={age}
                onChange={(event) => setAge(event.target.value)}
                aria-label="나이"
              />
            ) : (
              <p className="text-caption text-text-secondary truncate">{approved.map((cls) => cls.name).join(" · ")}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-display text-brand-amber">{activeTotal}</p>
            <p className="text-caption text-text-muted">보유 스티커</p>
          </div>
        </div>
        {editingProfile && (
          <div className="flex gap-2 mt-3">
            <Button
              className="!py-2 !text-caption"
              onClick={() => {
                dispatch({ type: "UPDATE_STUDENT_PROFILE", studentId: me.id, name, age: Number(age) || 0, profileImageUrl: me.profile_image_url });
                showToast("프로필이 저장되었어요.");
                setEditingProfile(false);
              }}
            >
              저장
            </Button>
            <Button
              variant="secondary"
              className="!py-2 !text-caption"
              onClick={() => {
                setName(me.name);
                setAge(String(me.age ?? ""));
                setEditingProfile(false);
              }}
            >
              취소
            </Button>
            <Button variant="secondary" className="!py-2 !text-caption" onClick={() => showToast("사진 업로드는 Supabase Storage 연동 후 지원돼요.")}>
              사진 변경
            </Button>
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
            <div>
              <p className="text-body">{cls.name}</p>
              <p className="text-caption text-text-muted">정규 출석 {cls.attendance_time}</p>
            </div>
            <Pill tone="ok">승인됨</Pill>
          </div>
        ))}
        {pending.map((enrollment) => {
          const cls = getClassById(state, enrollment.class_id);
          return (
            <div key={enrollment.id} className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-body">{cls?.name}</p>
                <p className="text-caption text-text-muted">{fmtDateTime(enrollment.requested_at)} 요청</p>
              </div>
              <Pill tone="wait">승인대기</Pill>
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
                showToast(`${selectedClassIds.length}개 특강반에 등록했고 기본 반으로 설정했어요.`);
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
