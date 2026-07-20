"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChipTabs } from "@/components/ui/Tabs";
import { WeekDatePicker } from "@/components/student/WeekDatePicker";
import { AttendanceSection } from "@/components/student/AttendanceSection";
import { HomeworkSection } from "@/components/student/HomeworkSection";
import { PraiseSection } from "@/components/student/PraiseSection";
import { useAppState } from "@/lib/store/provider";
import { dailyBreakdown, activeDatesForStudent } from "@/lib/store/selectors";
import { DEMO_NOW } from "@/lib/demoClock";

type SubTab = "attend" | "homework" | "praise";

const DOW_LABEL = ["일", "월", "화", "수", "목", "금", "토"];

function toDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dailyLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW_LABEL[d.getDay()]})`;
}

function DailyBreakdownCard({ date }: { date: string }) {
  const state = useAppState();
  const b = dailyBreakdown(state, state.currentUserId, date);

  const rows = [
    { label: "출석", value: b.attendance },
    { label: "숙제", value: b.homework },
    { label: "칭찬", value: b.praise },
  ];

  return (
    <div className="bg-surface-card rounded-card p-4 mb-3.5">
      <p className="text-caption text-text-secondary mb-1">{dailyLabel(date)} 받은 스티커</p>
      <p className="text-display font-normal text-brand-amber mb-3">{b.total}장</p>
      <div className="grid grid-cols-3 gap-2">
        {rows.map((r) => (
          <div key={r.label} className="bg-surface-raised rounded-lg py-2.5 text-center">
            <p className="text-caption text-text-secondary mb-0.5">{r.label}</p>
            <p className="text-subtitle font-normal text-text-primary">{r.value}장</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StickerPageInner() {
  const params = useSearchParams();
  const initial = (params.get("tab") as SubTab) || "attend";
  const [tab, setTab] = useState<SubTab>(initial);
  const state = useAppState();
  const [selectedDate, setSelectedDate] = useState(toDateOnly(DEMO_NOW));
  const activeDates = activeDatesForStudent(state, state.currentUserId);

  return (
    <div>
      <WeekDatePicker value={selectedDate} onChange={setSelectedDate} today={DEMO_NOW} activeDates={activeDates} />
      <DailyBreakdownCard date={selectedDate} />

      <ChipTabs
        options={[
          { value: "attend", label: "출석" },
          { value: "homework", label: "숙제" },
          { value: "praise", label: "칭찬" },
        ]}
        value={tab}
        onChange={(v) => setTab(v as SubTab)}
      />
      {tab === "attend" && <AttendanceSection />}
      {tab === "homework" && <HomeworkSection />}
      {tab === "praise" && <PraiseSection />}
    </div>
  );
}

export default function StickerPage() {
  return (
    <Suspense fallback={null}>
      <StickerPageInner />
    </Suspense>
  );
}
