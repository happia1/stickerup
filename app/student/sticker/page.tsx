"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChipTabs } from "@/components/ui/Tabs";
import { AttendanceSection } from "@/components/student/AttendanceSection";
import { HomeworkSection } from "@/components/student/HomeworkSection";
import { PraiseSection } from "@/components/student/PraiseSection";

type SubTab = "attend" | "homework" | "praise";

function StickerPageInner() {
  const params = useSearchParams();
  const initial = (params.get("tab") as SubTab) || "attend";
  const [tab, setTab] = useState<SubTab>(initial);

  return (
    <div>
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
