"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { getStudentById, getTeacherById, approvedClassesForStudent, pendingEnrollmentsForStudent } from "@/lib/store/selectors";
import { STUDENT_IDS } from "@/lib/mock/data";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { useToast } from "@/lib/toast/provider";
import clsx from "@/lib/clsx";

export default function SettingsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const me = getStudentById(state, state.currentUserId);
  const teacher = me ? getTeacherById(state, me.invited_by_teacher_id ?? "") : null;

  const [name, setName] = useState(me?.name ?? "");
  const [age, setAge] = useState(String(me?.age ?? ""));
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

  if (!me) return null;

  const approvedIds = new Set(approvedClassesForStudent(state, me.id).map((c) => c.id));
  const pendingIds = new Set(pendingEnrollmentsForStudent(state, me.id).map((e) => e.class_id));
  const requestableClasses = state.classes.filter(
    (c) => c.status === "active" && !c.is_default && !approvedIds.has(c.id) && !pendingIds.has(c.id)
  );

  const toggleClass = (classId: string) => {
    setSelectedClassIds((prev) => (prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]));
  };

  return (
    <div>
      <Card>
        <h3 className="text-subtitle mb-2">학원 정보</h3>
        <p className="text-body">
          소속 학원: <b>{state.tenant.name}</b>
        </p>
        <p className="text-body mt-1">
          담당 선생님: <b>{teacher?.name ?? "-"}</b>
        </p>
      </Card>

      <Card>
        <h3 className="text-subtitle mb-3">프로필 설정</h3>
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={name || me.name} size={56} />
          <Button variant="secondary" onClick={() => showToast("사진 업로드는 Supabase Storage 연동 후 지원돼요.")}>
            사진 변경
          </Button>
        </div>
        <label className="block text-caption font-semibold text-text-secondary mb-1">이름</label>
        <input className="w-full border border-border rounded-lg px-2.5 py-2 text-body mb-3" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="block text-caption font-semibold text-text-secondary mb-1">나이</label>
        <input
          type="number"
          className="w-full border border-border rounded-lg px-2.5 py-2 text-body mb-3.5"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <Button
          fullWidth
          onClick={() => {
            dispatch({ type: "UPDATE_STUDENT_PROFILE", studentId: me.id, name, age: Number(age) || 0, profileImageUrl: me.profile_image_url });
            showToast("프로필이 저장되었어요.");
          }}
        >
          저장하기
        </Button>
      </Card>

      <Card>
        <h3 className="text-subtitle mb-1">소속 반 신청하기</h3>
        <p className="text-caption text-text-secondary mb-3">
          원하는 반을 선택한 뒤 승인요청하기를 누르면, 관리자 승인 후 소속돼요.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-3.5">
          {requestableClasses.length === 0 ? (
            <p className="text-caption text-text-muted col-span-2">신청 가능한 반이 없어요.</p>
          ) : (
            requestableClasses.map((c) => {
              const selected = selectedClassIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleClass(c.id)}
                  className={clsx(
                    "border rounded-lg px-2.5 py-2.5 text-body text-center",
                    selected ? "border-brand-amber bg-state-warningBg text-brand-amberDark font-bold" : "border-border"
                  )}
                >
                  {c.name}
                </button>
              );
            })
          )}
        </div>
        <Button
          fullWidth
          disabled={selectedClassIds.length === 0}
          onClick={() => {
            dispatch({ type: "REQUEST_ENROLLMENT", studentId: me.id, classIds: selectedClassIds });
            showToast(`${selectedClassIds.length}개 반에 승인요청을 보냈어요.`);
            setSelectedClassIds([]);
          }}
        >
          승인요청하기
        </Button>

        {pendingEnrollmentsForStudent(state, me.id).length > 0 && (
          <div className="mt-3.5">
            {pendingEnrollmentsForStudent(state, me.id).map((e) => {
              const cls = state.classes.find((c) => c.id === e.class_id);
              return (
                <div key={e.id} className="flex items-center justify-between py-1">
                  <p className="text-body">{cls?.name}</p>
                  <Pill tone="wait">승인대기</Pill>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-subtitle mb-2">데모 계정 전환 (테스트용)</h3>
        <select
          className="w-full border border-border rounded-lg px-2.5 py-2 text-body"
          value={state.currentUserId}
          onChange={(e) => dispatch({ type: "SWITCH_USER", userId: e.target.value, role: "student" })}
        >
          {Object.values(STUDENT_IDS).map((id) => {
            const s = getStudentById(state, id);
            return (
              <option key={id} value={id}>
                {s?.name}
              </option>
            );
          })}
        </select>
      </Card>
    </div>
  );
}
