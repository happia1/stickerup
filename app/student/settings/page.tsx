"use client";
import { useState } from "react";
import { useAppDispatch, useAppState } from "@/lib/store/provider";
import { getStudentById } from "@/lib/store/selectors";
import { STUDENT_IDS } from "@/lib/mock/data";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/lib/toast/provider";
import clsx from "@/lib/clsx";

export default function StudentSettingsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [notifications, setNotifications] = useState(true);

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
          <span className={clsx("w-11 h-6 rounded-full relative transition-colors", notifications ? "bg-brand-amber" : "bg-surface-raised")}>
            <span className={clsx("absolute top-0.5 w-5 h-5 rounded-full bg-surface-page transition-transform", notifications ? "translate-x-[22px]" : "translate-x-0.5")} />
          </span>
        </button>
      </Card>

      <Card>
        <h2 className="text-subtitle mb-2">계정 전환</h2>
        <select
          className="w-full border border-border rounded-lg px-2.5 py-2 text-body"
          value={state.currentUserId}
          onChange={(event) => dispatch({ type: "SWITCH_USER", userId: event.target.value, role: "student" })}
        >
          {Object.values(STUDENT_IDS).map((id) => {
            const student = getStudentById(state, id);
            return (
              <option key={id} value={id}>
                {student?.name}
              </option>
            );
          })}
        </select>
      </Card>
    </div>
  );
}
