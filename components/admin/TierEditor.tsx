"use client";
import { useState } from "react";
import type { TierConfig } from "@/lib/types";
import { Button } from "@/components/ui/Button";

function uidLocal(): string {
  return `t-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function TierEditor({
  tiers,
  onSave,
  savedLabel = "저장된 값",
}: {
  tiers: TierConfig[];
  onSave: (tiers: TierConfig[]) => void;
  savedLabel?: string;
}) {
  const [draft, setDraft] = useState<TierConfig[]>(() => tiers.map((t) => ({ ...t })));
  const [dirty, setDirty] = useState(false);

  const sync = (next: TierConfig[]) => {
    setDraft(next);
    setDirty(true);
  };

  const updateField = (idx: number, field: keyof TierConfig, value: string | number) => {
    sync(draft.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  const step = (idx: number, delta: number) => {
    sync(draft.map((t, i) => (i === idx ? { ...t, count: Math.max(0, t.count + delta) } : t)));
  };

  const remove = (idx: number) => {
    sync(draft.filter((_, i) => i !== idx));
  };

  const add = () => {
    sync([...draft, { tier: uidLocal(), label: "새 구간", rangeText: "", count: 0 }]);
  };

  return (
    <div>
      <div className="border border-border rounded-xl overflow-hidden mb-2.5">
        <table className="w-full text-body">
          <thead>
            <tr className="text-caption text-text-secondary text-left border-b border-border">
              <th className="p-2.5">구간 이름</th>
              <th className="p-2.5">구간 범위</th>
              <th className="p-2.5">지급 스티커</th>
              <th className="p-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {draft.map((t, idx) => (
              <tr key={t.tier} className="border-b last:border-0 border-border">
                <td className="p-2.5">
                  <input
                    className="w-full border border-border rounded-lg px-2 py-1 text-body"
                    value={t.label}
                    onChange={(e) => updateField(idx, "label", e.target.value)}
                  />
                </td>
                <td className="p-2.5">
                  <input
                    className="w-full border border-border rounded-lg px-2 py-1 text-body"
                    value={t.rangeText}
                    placeholder="예: 정시 후 0~10분, 80~100%"
                    onChange={(e) => updateField(idx, "rangeText", e.target.value)}
                  />
                </td>
                <td className="p-2.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="감소"
                      className="w-7 h-7 flex items-center justify-center border border-border rounded-lg text-text-secondary"
                      onClick={() => step(idx, -1)}
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold">{t.count}</span>
                    <button
                      type="button"
                      aria-label="증가"
                      className="w-7 h-7 flex items-center justify-center border border-border rounded-lg text-text-secondary"
                      onClick={() => step(idx, 1)}
                    >
                      +
                    </button>
                    <span className="text-caption text-text-muted">장</span>
                  </div>
                </td>
                <td className="p-2.5">
                  <button
                    type="button"
                    aria-label="구간 삭제"
                    className="w-7 h-7 flex items-center justify-center text-state-danger"
                    onClick={() => remove(idx)}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2.5">
        <Button variant="secondary" className="!text-caption !py-1.5" onClick={add}>
          + 구간 추가
        </Button>
        <Button
          className="!text-caption !py-1.5"
          disabled={!dirty}
          onClick={() => {
            onSave(draft);
            setDirty(false);
          }}
        >
          수정완료
        </Button>
        {!dirty && <span className="text-caption text-text-muted">{savedLabel}과 동일해요.</span>}
      </div>
    </div>
  );
}
