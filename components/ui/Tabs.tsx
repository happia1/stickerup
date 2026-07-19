"use client";
import clsx from "@/lib/clsx";

export interface TabOption {
  value: string;
  label: string;
}

/** 필터/스코프 전환용 알약형(pill) 칩 탭 — 디자인가이드 9절 */
export function ChipTabs({
  options,
  value,
  onChange,
}: {
  options: TabOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-none">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            "px-3 py-1.5 rounded-full text-caption whitespace-nowrap border",
            value === opt.value
              ? "bg-text-primary text-white border-text-primary"
              : "bg-surface-card text-text-secondary border-border"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/** 콘텐츠 카테고리 전환용 언더라인 탭 — 디자인가이드 9절 */
export function UnderlineTabs({
  options,
  value,
  onChange,
}: {
  options: TabOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex border-b border-border mb-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            "px-3 py-2 text-body -mb-px border-b-2",
            value === opt.value
              ? "border-text-primary text-text-primary font-bold"
              : "border-transparent text-text-muted"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
