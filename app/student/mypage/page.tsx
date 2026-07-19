"use client";
import { useAppState } from "@/lib/store/provider";
import { approvedClassesForStudent, pendingEnrollmentsForStudent, getClassById } from "@/lib/store/selectors";
import { Card } from "@/components/ui/Card";
import { Accordion } from "@/components/ui/Accordion";
import { Pill } from "@/components/ui/Pill";
import { fmtDate, fmtDateTime } from "@/lib/format";

export default function MyPage() {
  const state = useAppState();
  const approved = approvedClassesForStudent(state, state.currentUserId);
  const pending = pendingEnrollmentsForStudent(state, state.currentUserId);

  const logs = state.ledger
    .filter((l) => l.student_id === state.currentUserId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 30);

  const typeLabel = { attendance: "출석", homework: "숙제", praise: "칭찬" } as const;

  return (
    <div>
      <Card>
        <h3 className="text-subtitle mb-2">소속 반 현황</h3>
        {approved.map((c) => (
          <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
            <p className="text-body">{c.name}</p>
            <Pill tone="ok">승인됨</Pill>
          </div>
        ))}
        {pending.map((e) => {
          const cls = getClassById(state, e.class_id);
          return (
            <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <p className="text-body">{cls?.name}</p>
              <Pill tone="wait">승인대기</Pill>
            </div>
          );
        })}
        <p className="text-caption text-text-muted mt-2">반 신청은 설정 화면에서 할 수 있어요.</p>
      </Card>

      <Card>
        <Accordion label="내 스티커 이력">
          {logs.map((l) => {
            const cls = getClassById(state, l.class_id);
            return (
              <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div>
                  <p className="text-body font-semibold">
                    {cls?.name} · {typeLabel[l.source_type]}
                  </p>
                  <p className="text-caption text-text-muted">{fmtDateTime(l.created_at)}</p>
                </div>
                <p className="text-body font-extrabold">
                  {l.status === "rolled_back" ? "취소" : l.count > 0 ? `+${l.count}장` : "0장"}
                </p>
              </div>
            );
          })}
        </Accordion>
      </Card>
    </div>
  );
}
