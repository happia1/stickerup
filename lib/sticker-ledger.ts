import type { StickerLedgerEntry } from "@/lib/types";
import { koreaDateKey } from "@/lib/korea-date";

type LedgerForTotal = Pick<StickerLedgerEntry, "student_id" | "source_type" | "status" | "created_at">;

/**
 * 출석은 과거 반별 기록이 남아 있어도 학생별 한국 날짜 기준 첫 활성 기록 한 건만 집계한다.
 * 과제와 칭찬은 지급된 활성 원장 기록을 그대로 유지한다.
 */
export function effectiveActiveLedger<T extends LedgerForTotal>(entries: readonly T[]): T[] {
  const attendanceKeys = new Set<string>();
  return entries
    .filter((entry) => entry.status === "active")
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .filter((entry) => {
      if (entry.source_type !== "attendance") return true;
      const key = `${entry.student_id}:${koreaDateKey(entry.created_at)}`;
      if (attendanceKeys.has(key)) return false;
      attendanceKeys.add(key);
      return true;
    });
}
