// supabase/migrations/20260719_02_functions_triggers.sql 의
// compute_period_bounds() / get_ranking() 함수를 TypeScript로 포팅한 것.
// Supabase 연동 시에는 이 파일 대신 RPC(get_ranking, compute_period_bounds)를
// 호출하도록 교체하면 된다 (인터페이스는 동일하게 유지).

import type { RankingUnit, RankingRow, StickerLedgerEntry, Enrollment } from "./types";
import { DEMO_NOW } from "./demoClock";
import { koreaDateKey } from "./korea-date";

export interface PeriodBounds {
  period_start: string; // YYYY-MM-DD
  period_end: string; // YYYY-MM-DD
}

function toDateOnly(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function koreaCalendarDate(value: Date): Date {
  const [year, month, day] = koreaDateKey(value).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function startOfWeekMonday(d: Date): Date {
  const day = d.getUTCDay(); // 0 = Sun ... 6 = Sat
  const diff = (day === 0 ? -6 : 1) - day; // Monday 기준
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diff);
  return monday;
}

/** SQL compute_period_bounds(unit, ref_date) 포팅.
 *  unit === "custom" 인 경우 customDays(관리자가 직접 입력한 일수)만큼의
 *  최근 기간(오늘 포함, 거슬러 올라가는 구간)을 사용한다. */
export function computePeriodBounds(
  unit: RankingUnit,
  refDate: Date = DEMO_NOW,
  customDays: number | null = null,
  customStart: string | null = null,
  customEnd: string | null = null
): PeriodBounds {
  const ref = koreaCalendarDate(refDate);

  switch (unit) {
    case "day": {
      const s = toDateOnly(ref);
      return { period_start: s, period_end: s };
    }
    case "week": {
      const monday = startOfWeekMonday(ref);
      const sunday = new Date(monday);
      sunday.setUTCDate(monday.getUTCDate() + 6);
      return { period_start: toDateOnly(monday), period_end: toDateOnly(sunday) };
    }
    case "quarter": {
      const quarterStartMonth = Math.floor(ref.getUTCMonth() / 3) * 3;
      const start = new Date(Date.UTC(ref.getUTCFullYear(), quarterStartMonth, 1));
      const end = new Date(Date.UTC(ref.getUTCFullYear(), quarterStartMonth + 3, 0));
      return { period_start: toDateOnly(start), period_end: toDateOnly(end) };
    }
    case "custom": {
      if (customStart && customEnd && customStart <= customEnd) {
        return { period_start: customStart, period_end: customEnd };
      }
      const days = customDays && customDays > 0 ? customDays : 7;
      const start = new Date(ref);
      start.setUTCDate(ref.getUTCDate() - (days - 1));
      return { period_start: toDateOnly(start), period_end: toDateOnly(ref) };
    }
    case "month":
    default: {
      const start = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1));
      const end = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + 1, 0));
      return { period_start: toDateOnly(start), period_end: toDateOnly(end) };
    }
  }
}

interface GetRankingArgs {
  ledger: StickerLedgerEntry[];
  enrollments: Enrollment[];
  studentIds: string[]; // 테넌트 소속 전체 학생 id
  classId: string | null; // null = 전체(글로벌) 랭킹
  periodStart: string;
  periodEnd: string;
}

/** SQL get_ranking() 포팅: 1등=금, 2등=은, 3등=동 고정, 비율 없음.
 *  동점 처리 기본 정책: 총합이 같으면 해당 기간 내 가장 이른 활동 시각(first_activity_at)이
 *  빠른 학생이 상위 (PRD 4.8 / Open Questions 참고, 추후 정책 확정 시 정렬 기준만 교체). */
export function getRanking({
  ledger,
  enrollments,
  studentIds,
  classId,
  periodStart,
  periodEnd,
}: GetRankingArgs): RankingRow[] {
  const scopedStudentIds =
    classId === null
      ? studentIds
      : studentIds.filter((sid) =>
          enrollments.some(
            (e) => e.student_id === sid && e.class_id === classId && e.status === "approved"
          )
        );

  const totals = scopedStudentIds.map((studentId) => {
    const relevant = ledger.filter((l) => {
      if (l.student_id !== studentId || l.status !== "active") return false;
      if (classId !== null && l.class_id !== classId) return false;
      const day = koreaDateKey(l.created_at);
      return day >= periodStart && day <= periodEnd;
    });
    const total_count = relevant.reduce((sum, l) => sum + l.count, 0);
    const first_activity_at =
      relevant.length > 0
        ? relevant.reduce((min, l) => (l.created_at < min ? l.created_at : min), relevant[0].created_at)
        : null;
    return { student_id: studentId, total_count, first_activity_at };
  });

  const sorted = [...totals].sort((a, b) => {
    if (b.total_count !== a.total_count) return b.total_count - a.total_count;
    if (a.first_activity_at === null) return 1;
    if (b.first_activity_at === null) return -1;
    return a.first_activity_at < b.first_activity_at ? -1 : 1;
  });

  return sorted.map((row, idx) => {
    const rank = idx + 1;
    const medal = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : null;
    return { ...row, rank, medal };
  });
}
