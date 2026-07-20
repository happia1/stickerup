"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import {
  getStudentById,
  getTeacherById,
  approvedClassesForStudent,
  pendingEnrollmentsForStudent,
  getClassById,
} from "@/lib/store/selectors";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { fmtDateTime } from "@/lib/format";
import { useToast } from "@/lib/toast/provider";
import clsx from "@/lib/clsx";

const LOG_PAGE_SIZE = 5;
const TYPE_LABEL = { attendance: "출석", homework: "숙제", praise: "칭찬" } as const;

export default function MyPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const me = getStudentById(state, state.currentUserId);
  const teacher = me ? getTeacherById(state, me.invited_by_teacher_id ?? "") : null;

  const [name, setName] = useState(me?.name ?? "");
  const [age, setAge] = useState(String(me?.age ?? ""));
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [visibleLogCount, setVisibleLogCount] = useState(LOG_PAGE_SIZE);

  if (!me) return null;

  const approved = approvedClassesForStudent(state, me.id);
  const pending = pendingEnrollmentsForStudent(state, me.id);
  const approvedIds = new Set(approved.map((c) => c.id));
  const pendingIds = new Set(pending.map((e) => e.class_id));
  const requestableClasses = state.classes.filter(
    (c) => c.status === "active" && !c.is_default && !approvedIds.has(c.id) && !pendingIds.has(c.id)
  );

  const toggleClass = (classId: string) => {
    setSelectedClassIds((prev) => (prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]));
  };

  const logs = state.ledger
    .filter((l) => l.student_id === state.currentUserId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div>
      <Card>
        <h3 className="text-subtitle mb-3">프로필</h3>
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
        <h3 className="text-subtitle mb-2">학원 정보</h3>
        <p className="text-body">
          소속 학원: <b>{state.tenant.name}</b>
        </p>
        <p className="text-body mt-1">
          담당 선생님: <b>{teacher?.name ?? "-"}</b>
        </p>
      </Card>

      <Card>
        <h3 className="text-subtitle mb-2">소속 반</h3>
        {approved.length === 0 && pending.length === 0 && (
          <p className="text-caption text-text-muted mb-2">아직 소속된 반이 없어요.</p>
        )}
        {approved.map((c) => (
          <div key={c.id} className="flex items-center justify-between py-1.5">
            <p className="text-body">{c.name}</p>
            <Pill tone="ok">승인됨</Pill>
          </div>
        ))}
        {pending.map((e) => {
          const cls = getClassById(state, e.class_id);
          return (
            <div key={e.id} className="flex items-center justify-between py-1.5">
              <p className="text-body">{cls?.name}</p>
              <Pill tone="wait">승인대기</Pill>
            </div>
          );
        })}

        <p className="text-caption font-semibold text-text-secondary mt-3 mb-2">반 추가 신청하기</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
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
                    selected ? "border-brand-amber bg-state-warningBg text-brand-amber font-bold" : "border-border"
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
      </Card>

      <Card>
        <h3 className="text-subtitle mb-2">내 스티커 이력</h3>
        {logs.length === 0 ? (
          <p className="text-caption text-text-muted">스티커 이력이 없어요.</p>
        ) : (
          <>
            {logs.slice(0, visibleLogCount).map((l) => {
              const cls = getClassById(state, l.class_id);
              return (
                <div key={l.id} className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-body font-normal">
                      {cls?.name} · {TYPE_LABEL[l.source_type]}
                    </p>
                    <p className="text-caption text-text-muted">{fmtDateTime(l.created_at)}</p>
                  </div>
                  <p className="text-body font-normal">
                    {l.status === "rolled_back" ? "취소" : l.count > 0 ? `+${l.count}장` : "0장"}
                  </p>
                </div>
              );
            })}
            {visibleLogCount < logs.length && (
              <Button
                variant="secondary"
                fullWidth
                className="mt-2 !text-caption !py-2"
                onClick={() => setVisibleLogCount((n) => n + 10)}
              >
                더보기 ({logs.length - visibleLogCount}건 더 있음)
              </Button>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
