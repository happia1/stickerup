"use client";
import { useState } from "react";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { HOMEWORK_MODE_LABEL, HOMEWORK_MODE_PRESETS } from "@/lib/types";
import type { GradingMode, TierConfig } from "@/lib/types";
import { TierEditor } from "@/components/admin/TierEditor";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/toast/provider";

export default function AdminPolicyPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const showToast = useToast();
  const [mode, setMode] = useState<GradingMode>(state.homeworkGradingMode);
  const [homeworkKey, setHomeworkKey] = useState(0); // 프리셋 적용 시 TierEditor 초기화용

  return (
    <div>
      <h2 className="text-title mb-1">스티커 정책 설정</h2>
      <p className="text-caption text-text-secondary mb-5">
        출석·숙제 구간의 이름, 범위, 지급 스티커 수를 자유롭게 조정할 수 있어요. 수정 후 반드시 &ldquo;수정완료&rdquo;를 눌러야 반영돼요.
      </p>

      <p className="text-subtitle mb-2">출석 구간별 지급 수</p>
      <p className="text-caption text-text-secondary mb-2">
        반마다 조정 가능한 값은 정규 출석 시각뿐이에요(반 관리 탭에서 설정). 아래 구간·지급 수는 전체 반 공통이에요.
      </p>
      <div className="mb-6">
        <TierEditor
          tiers={state.attendancePolicy}
          savedLabel="현재 저장된 출석 정책"
          onSave={(tiers) => {
            dispatch({ type: "SET_ATTENDANCE_POLICY", tiers });
            showToast("출석 정책이 반영되었어요.");
          }}
        />
      </div>

      <p className="text-subtitle mb-2">숙제 완료율별 지급 수</p>
      <p className="text-caption text-text-secondary mb-2">
        완료율 구간을 어떤 방식으로 나눌지 먼저 선택하고, 필요하면 구간을 자유롭게 추가·삭제·수정하세요.
      </p>
      <div className="flex items-center gap-2.5 mb-3">
        <select
          className="border border-border rounded-lg px-2.5 py-2 text-body"
          value={mode}
          onChange={(e) => setMode(e.target.value as GradingMode)}
        >
          {Object.entries(HOMEWORK_MODE_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          className="!text-caption !py-1.5"
          onClick={() => {
            dispatch({ type: "SET_HOMEWORK_POLICY", tiers: HOMEWORK_MODE_PRESETS[mode].map((t: TierConfig) => ({ ...t })), mode });
            setHomeworkKey((k) => k + 1);
            showToast(`${HOMEWORK_MODE_LABEL[mode]} 기본 구성을 불러왔어요. 필요하면 수정 후 다시 저장하세요.`);
          }}
        >
          이 방식의 기본 구성 불러오기
        </Button>
      </div>
      <TierEditor
        key={homeworkKey}
        tiers={state.homeworkPolicy}
        savedLabel="현재 저장된 숙제 정책"
        onSave={(tiers) => {
          dispatch({ type: "SET_HOMEWORK_POLICY", tiers, mode });
          showToast("숙제 정책이 반영되었어요.");
        }}
      />
    </div>
  );
}
