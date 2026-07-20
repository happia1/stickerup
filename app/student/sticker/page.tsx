"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AttendanceSection } from "@/components/student/AttendanceSection";
import { HomeworkSection } from "@/components/student/HomeworkSection";
import { PraiseSection } from "@/components/student/PraiseSection";
import { WeekDatePicker } from "@/components/student/WeekDatePicker";
import { ChipTabs } from "@/components/ui/Tabs";
import { activeDatesForStudent, dailyBreakdown } from "@/lib/store/selectors";
import { useAppState } from "@/lib/store/provider";
import { DEMO_NOW } from "@/lib/demoClock";

type SubTab = "attend" | "homework" | "praise";

const DOW_LABEL = ["일", "월", "화", "수", "목", "금", "토"];

function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dailyLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${DOW_LABEL[date.getDay()]})`;
}

function DailyBreakdownCard({ date }: { date: string }) {
  const state = useAppState();
  const breakdown = dailyBreakdown(state, state.currentUserId, date);
  const rows = [
    { label: "출석", value: breakdown.attendance },
    { label: "숙제", value: breakdown.homework },
    { label: "칭찬", value: breakdown.praise },
  ];

  return (
    <div className="bg-surface-card rounded-card p-4 mb-3.5">
      <p className="text-caption text-text-secondary mb-1">{dailyLabel(date)} 받은 스티커</p>
      <p className="text-display text-brand-amber mb-3">{breakdown.total}장</p>
      <div className="grid grid-cols-3 gap-2">
        {rows.map((row) => (
          <div key={row.label} className="bg-surface-raised rounded-lg py-2.5 text-center">
            <p className="text-caption text-text-secondary mb-0.5">{row.label}</p>
            <p className="text-subtitle text-text-primary">{row.value}장</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentStickerInner() {
  const params = useSearchParams();
  const initial = (params.get("tab") as SubTab) || "attend";
  const [tab, setTab] = useState<SubTab>(initial);
  const [selectedDate, setSelectedDate] = useState(toDateOnly(DEMO_NOW));
  const state = useAppState();
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
        onChange={(value) => setTab(value as SubTab)}
      />
      {tab === "attend" && <AttendanceSection />}
      {tab === "homework" && <HomeworkSection />}
      {tab === "praise" && <PraiseSection />}
    </div>
  );
}

export default function StudentStickerPage() {
  return (
    <Suspense fallback={null}>
      <StudentStickerInner />
    </Suspense>
  );
}
