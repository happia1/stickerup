"use client";
import { useRef, useState } from "react";
import clsx from "@/lib/clsx";

const DOW_LABEL = ["일", "월", "화", "수", "목", "금", "토"];

function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeekSunday(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

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

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });

  const todayStr = toDateOnly(today);
  const monthLabel = `${days[3].getMonth() + 1}월`;

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (delta > 40) setWeekOffset((week) => week - 1);
    if (delta < -40) setWeekOffset((week) => week + 1);
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
            className="w-8 h-8 rounded-full text-text-secondary"
            onClick={() => setWeekOffset((week) => week - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="다음 주"
            className="w-8 h-8 rounded-full text-text-secondary"
            onClick={() => setWeekOffset((week) => week + 1)}
          >
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {days.map((date, index) => {
          const dateStr = toDateOnly(date);
          const selected = dateStr === value;
          const isToday = dateStr === todayStr;
          const hasActivity = activeDates?.has(dateStr);

          return (
            <button key={dateStr} type="button" onClick={() => onChange(dateStr)} className="flex flex-col items-center gap-1 py-1">
              <span className={clsx("text-micro", index === 0 ? "text-state-danger" : "text-text-muted")}>{DOW_LABEL[index]}</span>
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
                {date.getDate()}
              </span>
              <span className={clsx("w-1 h-1 rounded-full", hasActivity ? "bg-brand-amber" : "bg-transparent")} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
