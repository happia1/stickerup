import { Trophy } from "lucide-react";
import clsx from "@/lib/clsx";
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

/** 랭킹을 1~N위까지 균일한 리스트 형태로 보여준다. 1~3위는 순위 숫자 대신
 *  금/은/동 트로피 아이콘으로 표시해 구분한다. */
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
  const visible = rows.slice(0, maxRows);

  return (
    <div className="bg-surface-raised rounded-card p-3">
      {visible.length === 0 ? (
        <p className="text-caption text-text-secondary text-center py-4">아직 랭킹 데이터가 없어요.</p>
      ) : (
        visible.map((row, idx) => {
          const isMe = row.student_id === highlightStudentId;
          return (
            <div
              key={row.student_id}
              className={clsx(
                "flex items-center gap-2.5 py-2",
                idx > 0 && "border-t border-surface-card",
                isMe && "bg-surface-card rounded-lg px-2"
              )}
            >
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                {row.medal ? (
                  <Trophy
                    aria-label={row.medal === "gold" ? "1등" : row.medal === "silver" ? "2등" : "3등"}
                    className={MEDAL_ICON_CLASS[row.medal]}
                    size={18}
                    fill="currentColor"
                    strokeWidth={1.5}
                  />
                ) : (
                  <span className="text-text-primary text-micro">{row.rank}</span>
                )}
              </div>
              <Avatar name={findName(row.student_id)} size={32} />
              <p className="flex-1 text-body font-normal text-text-primary truncate">
                {findName(row.student_id)}
                {isMe ? " (나)" : ""}
              </p>
              <StickerCount value={row.total_count} className="text-body font-normal text-brand-amber" />
            </div>
          );
        })
      )}
    </div>
  );
}
