"use client";
import { useAppState, useAppDispatch } from "@/lib/store/provider";
import { ATTENDANCE_TIERS } from "@/lib/types";

export default function AdminPolicyPage() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div>
      <h2 className="text-title mb-1">스티커 정책 설정</h2>
      <p className="text-caption text-text-secondary mb-5">
        출석 지급 기준은 전역 고정값이며, 반마다 조정 가능한 값은 정규 출석 시각뿐이에요(반 관리 탭에서 설정).
      </p>

      <p className="text-subtitle mb-2">출석 구간별 지급 수 (읽기 전용, 전역 고정)</p>
      <div className="border border-border rounded-xl overflow-hidden mb-6">
        <table className="w-full text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="p-2.5">구간</th>
              <th className="p-2.5">지급 스티커</th>
            </tr>
          </thead>
          <tbody>
            {ATTENDANCE_TIERS.map((t) => (
              <tr key={t.tier} className="border-b last:border-0 border-border">
                <td className="p-2.5">{t.label}</td>
                <td className="p-2.5 font-bold">{t.count}장</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-subtitle mb-2">숙제 완료율별 지급 수 (3단계, 수정 가능)</p>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="p-2.5">완료 단계</th>
              <th className="p-2.5">지급 스티커</th>
            </tr>
          </thead>
          <tbody>
            {state.homeworkPolicy.map((t) => (
              <tr key={t.tier} className="border-b last:border-0 border-border">
                <td className="p-2.5">
                  {t.label} ({t.tier === "complete" ? "100%" : t.tier === "half" ? "50%" : "0%"})
                </td>
                <td className="p-2.5">
                  <input
                    type="number"
                    className="w-20 border border-border rounded-lg px-2 py-1 text-body"
                    value={t.count}
                    onChange={(e) =>
                      dispatch({ type: "UPDATE_HOMEWORK_POLICY", tier: t.tier, count: Number(e.target.value) || 0 })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
