"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { getStudentById } from "@/lib/store/selectors";
import { STUDENT_IDS } from "@/lib/mock/data";
import { Card } from "@/components/ui/Card";
import { Moon, Sun, Bell } from "lucide-react";
import { useToast } from "@/lib/toast/provider";
import clsx from "@/lib/clsx";

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-text-secondary flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="text-body">{label}</p>
        {description && <p className="text-caption text-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          "w-11 h-6 rounded-full flex-shrink-0 relative transition-colors",
          checked ? "bg-brand-amber" : "bg-surface-raised"
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 w-5 h-5 rounded-full bg-surface-page transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div>
      <Card>
        <h3 className="text-subtitle mb-1">환경설정</h3>
        <p className="text-caption text-text-secondary mb-2">
          앱 화면과 알림 관련 설정이에요. 학원 정보·프로필·소속 반은 마이페이지에서 관리할 수 있어요.
        </p>
        <ToggleRow
          icon={darkMode ? <Moon size={18} /> : <Sun size={18} />}
          label="다크 모드"
          description={darkMode ? "" : "라이트 모드는 다음 업데이트에서 지원 예정이에요."}
          checked={darkMode}
          onChange={(v) => {
            setDarkMode(v);
            if (!v) showToast("라이트 모드는 준비 중이에요. 곧 지원할게요!");
          }}
        />
        <ToggleRow
          icon={<Bell size={18} />}
          label="알림 받기"
          description="숙제·칭찬 승인, 스티커 롤백 알림을 받아요."
          checked={notifications}
          onChange={(v) => {
            setNotifications(v);
            showToast(v ? "알림을 켰어요." : "알림을 껐어요.");
          }}
        />
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
