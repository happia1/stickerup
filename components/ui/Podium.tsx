import clsx from "@/lib/clsx";
import { Trophy } from "lucide-react";
import { Avatar } from "./Avatar";
import { StickerCount } from "./StickerCount";
import type { RankingRow } from "@/lib/types";

interface PodiumStudent {
  id: string;
  name: string;
}

const MEDAL_ICON_CLASS: Record<string, string> = {
  gold: "text-medal-gold",
  silver: "text-medal-silver",
  bronze: "text-medal-bronze",
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
  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3, maxRows);
  const gold = top3.find((r) => r.medal === "gold");
  const silver = top3.find((r) => r.medal === "silver");
  const bronze = top3.find((r) => r.medal === "bronze");

  const podiumCard = (row: RankingRow | undefined, size: "lg" | "sm") => {
    if (!row) return <div />;
    const isMe = row.student_id === highlightStudentId;
    return (
      <div
        className={clsx(
          "bg-surface-card rounded-card flex flex-col items-center text-center px-2",
          size === "lg" ? "py-4 -mt-3" : "py-3",
          isMe && "ring-2 ring-brand-amber"
        )}
      >
        {row.medal && (
          <Trophy
            aria-label={row.medal === "gold" ? "1등" : row.medal === "silver" ? "2등" : "3등"}
            className={clsx("mb-1.5", MEDAL_ICON_CLASS[row.medal])}
            size={size === "lg" ? 26 : 20}
            fill="currentColor"
            strokeWidth={1.5}
          />
        )}
        <Avatar name={findName(row.student_id)} size={size === "lg" ? 56 : 44} />
        <p className="text-subtitle font-normal text-text-primary mt-2 truncate max-w-full">
          {findName(row.student_id)}
          {isMe ? " (나)" : ""}
        </p>
        <StickerCount value={row.total_count} className="text-body font-normal text-brand-amber" />
      </div>
    );
  };

  return (
    <div className="bg-surface-raised rounded-card p-4">
      {rows.length === 0 ? (
        <p className="text-caption text-text-secondary text-center py-4">아직 랭킹 데이터가 없어요.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 items-end mb-2">
            {podiumCard(silver, "sm")}
            {podiumCard(gold, "lg")}
            {podiumCard(bronze, "sm")}
          </div>
          {rest.map((row) => {
            const isMe = row.student_id === highlightStudentId;
            return (
              <div
                key={row.student_id}
                className={clsx(
                  "flex items-center gap-2.5 py-2 border-t border-border",
                  isMe && "bg-surface-card rounded-lg px-2"
                )}
              >
                <div className="w-6 h-6 rounded-full bg-surface-card text-text-primary text-micro flex items-center justify-center flex-shrink-0">
                  {row.rank}
                </div>
                <Avatar name={findName(row.student_id)} size={32} />
                <p className="flex-1 text-body font-normal text-text-primary truncate">
                  {findName(row.student_id)}
                  {isMe ? " (나)" : ""}
                </p>
                <StickerCount value={row.total_count} className="text-body font-normal text-text-primary" />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
