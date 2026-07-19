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
          <div
            className={clsx(
              "rounded-full text-white font-extrabold flex items-center justify-center mb-1.5",
              MEDAL_BG[row.medal],
              size === "lg" ? "w-7 h-7 text-caption" : "w-6 h-6 text-micro"
            )}
          >
            {MEDAL_LABEL[row.medal]}
          </div>
        )}
        <Avatar name={findName(row.student_id)} size={size === "lg" ? 56 : 44} />
        <p className="text-subtitle text-text-primary mt-2 truncate max-w-full">
          {findName(row.student_id)}
          {isMe ? " (나)" : ""}
        </p>
        <p className="text-body font-extrabold text-brand-amber">{row.total_count}장</p>
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
                <div className="w-6 h-6 rounded-full bg-surface-card text-text-secondary text-micro flex items-center justify-center flex-shrink-0">
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
        </>
      )}
    </div>
  );
}
