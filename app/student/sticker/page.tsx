"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AttendanceSection } from "@/components/student/AttendanceSection";
import { HomeworkSection } from "@/components/student/HomeworkSection";
import { PraiseSection } from "@/components/student/PraiseSection";
import { WeekDatePicker } from "@/components/student/WeekDatePicker";
import { ChipTabs } from "@/components/ui/Tabs";
import { Accordion } from "@/components/ui/Accordion";
import { Card } from "@/components/ui/Card";
import { activeDatesForStudent, dailyBreakdown, getClassById, totalStickers } from "@/lib/store/selectors";
import { useAppState } from "@/lib/store/provider";
import { DEMO_NOW } from "@/lib/demoClock";
import { fmtDateTime } from "@/lib/format";

type SubTab = "attend" | "homework" | "praise";

const DOW_LABEL = ["일", "월", "화", "수", "목", "금", "토"];
const LOG_PAGE_SIZE = 20;
const TYPE_LABEL = { attendance: "출석", homework: "숙제", praise: "칭찬" } as const;

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
  const allTimeTotal = totalStickers(state, state.currentUserId);
  const rows = [
    { label: "출석", value: breakdown.attendance },
    { label: "숙제", value: breakdown.homework },
    { label: "칭찬", value: breakdown.praise },
  ];

  return (
    <div className="bg-surface-card rounded-card p-4 mb-3.5">
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div><p className="text-caption text-text-secondary">{dailyLabel(date)} 받은 스티커</p><p className="text-display text-brand-amber">{breakdown.total}장</p></div>
        <div className="border-l border-border pl-3"><p className="text-caption text-text-secondary">전체 스티커</p><p className="text-display text-text-primary">{allTimeTotal}장</p></div>
      </div>
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
  const logs = state.ledger.filter((entry) => entry.student_id === state.currentUserId).sort((a, b) => b.created_at.localeCompare(a.created_at));

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
      <Card>
        <Accordion label={`내 스티커 이력 (${logs.length})`}>
          {logs.length === 0 ? <p className="text-caption text-text-muted">스티커 이력이 없어요.</p> : logs.slice(0, LOG_PAGE_SIZE).map((entry) => {
            const cls = getClassById(state, entry.class_id);
            return <div key={entry.id} className="flex items-center justify-between border-b border-border py-1.5 last:border-0"><div><p className="text-body">{cls?.name} · {TYPE_LABEL[entry.source_type]}</p><p className="text-caption text-text-muted">{fmtDateTime(entry.created_at)}</p></div><p className="text-body font-bold text-brand-amber">{entry.status === "rolled_back" ? "취소" : entry.count > 0 ? `+${entry.count}장` : "0장"}</p></div>;
          })}
          {logs.length > LOG_PAGE_SIZE && <p className="pt-3 text-center text-caption text-text-muted">최근 {LOG_PAGE_SIZE}건만 표시 중</p>}
        </Accordion>
      </Card>
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
