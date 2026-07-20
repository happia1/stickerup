import clsx from "@/lib/clsx";
import { Avatar } from "./Avatar";
import type { RankingRow } from "@/lib/types";

interface PodiumStudent {
  id: string;
  name: string;
}

const MEDAL_LABEL: Record<string, string> = { gold: "1", silver: "2", bronze: "3" };
const MEDAL_BG: Record<string, string> = {
  gold: "bg-medal-gold",
  silver: "bg-medal-silver",
  bronze: "bg-medal-bronze",
};

export function Podium({
  rows,
  students,
  highlightStudentId,
  maxRows = 5,
}: {
  rows: RankingRow[];
  students: PodiumStudent[];
  highlightStudentId?: string;
  maxRows?: number;
}) {
  const findName = (id: string) => students.find((s) => s.id === id)?.name ?? "알 수 없음";
  const visibleRows = rows.slice(0, maxRows);

  return (
    <div>
      {rows.length === 0 ? (
        <p className="text-caption text-text-secondary text-center py-4">아직 랭킹 데이터가 없어요.</p>
      ) : (
        <div className="space-y-2">
          {visibleRows.map((row) => {
            const isMe = row.student_id === highlightStudentId;
            return (
              <div
                key={row.student_id}
                className={clsx(
                  "flex items-center gap-2.5 rounded-lg bg-surface-raised px-3 py-2.5",
                  isMe && "ring-2 ring-brand-amber"
                )}
              >
                <div
                  className={clsx(
                    "w-7 h-7 rounded-full text-micro font-extrabold flex items-center justify-center flex-shrink-0",
                    row.medal ? `${MEDAL_BG[row.medal]} text-black` : "bg-surface-card text-text-secondary"
                  )}
                >
                  {row.rank}
                </div>
                <Avatar name={findName(row.student_id)} size={32} />
                <p className="flex-1 text-body text-text-primary truncate">
                  {findName(row.student_id)}
                  {isMe ? " (나)" : ""}
                </p>
                <p className="text-body font-extrabold text-text-primary">{row.total_count}장</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
