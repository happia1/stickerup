"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "@/lib/clsx";

const DOW_LABEL = ["일", "월", "화", "수", "목", "금", "토"];

function toDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeekSunday(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

/** 주간 스와이프 날짜 선택기 — 일~토 7일을 한 줄로 보여주고 좌우로 주 단위 이동한다.
 *  activeDates에 포함된 날짜는 아래에 작은 점으로 활동 표시를 한다. */
export function WeekDatePicker({
  value,
  onChange,
  today,
  activeDates,
}: {
  value: string;
  onChange: (date: string) => void;
  today: Date;
  activeDates?: Set<string>;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const baseWeekStart = startOfWeekSunday(today);
  const weekStart = new Date(baseWeekStart);
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const monthLabel = `${days[3].getMonth() + 1}월`;
  const todayStr = toDateOnly(today);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 40) setWeekOffset((w) => w - 1);
    else if (delta < -40) setWeekOffset((w) => w + 1);
    touchStartX.current = null;
  };

  return (
    <div className="bg-surface-card rounded-card p-3.5 mb-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-subtitle">{monthLabel}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="이전 주"
            className="w-7 h-7 flex items-center justify-center text-text-secondary"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label="다음 주"
            className="w-7 h-7 flex items-center justify-center text-text-secondary"
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {days.map((d, i) => {
          const dateStr = toDateOnly(d);
          const selected = dateStr === value;
          const isToday = dateStr === todayStr;
          const hasActivity = activeDates?.has(dateStr);
          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onChange(dateStr)}
              className="flex flex-col items-center gap-1 py-1"
            >
              <span className={clsx("text-micro", i === 0 ? "text-state-danger" : "text-text-muted")}>{DOW_LABEL[i]}</span>
              <span
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center text-body",
                  selected
                    ? "bg-brand-amber text-surface-page font-bold"
                    : isToday
                    ? "border border-brand-amber text-text-primary"
                    : "text-text-primary"
                )}
              >
                {d.getDate()}
              </span>
              <span className={clsx("w-1 h-1 rounded-full", hasActivity ? "bg-brand-amber" : "bg-transparent")} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
