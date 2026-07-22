import type { AppState } from "./types";
import { DEMO_NOW } from "@/lib/demoClock";
import { getRanking, computePeriodBounds } from "@/lib/ranking";
import type { ClassRoom, RankingRow, RewardCampaign, RewardItem, RankingUnit } from "@/lib/types";

export function getStudentById(state: AppState, id: string) {
  return state.students.find((s) => s.id === id) ?? null;
}

export function getTeacherById(state: AppState, id: string) {
  return state.teachers.find((t) => t.id === id) ?? null;
}

export function getClassById(state: AppState, id: string): ClassRoom | null {
  return state.classes.find((c) => c.id === id) ?? null;
}

export function getDefaultClass(state: AppState): ClassRoom | null {
  return state.classes.find((c) => c.is_default) ?? null;
}

/** 학생이 승인된 상태로 소속된 반 목록 (기본반 포함) */
export function approvedClassesForStudent(state: AppState, studentId: string): ClassRoom[] {
  const classIds = state.enrollments
    .filter((e) => e.student_id === studentId && e.status === "approved")
    .map((e) => e.class_id);
  return state.classes.filter((c) => classIds.includes(c.id));
}

/** 학생의 승인 대기중인 반 신청 목록 */
export function pendingEnrollmentsForStudent(state: AppState, studentId: string) {
  return state.enrollments.filter((e) => e.student_id === studentId && e.status === "pending");
}

export function totalStickers(
  state: AppState,
  studentId: string,
  opts: { classId?: string | null; start?: string | null; end?: string | null } = {}
): number {
  return state.ledger
    .filter((l) => {
      if (l.student_id !== studentId || l.status !== "active") return false;
      if (opts.classId && l.class_id !== opts.classId) return false;
      if (opts.start && l.created_at.slice(0, 10) < opts.start) return false;
      if (opts.end && l.created_at.slice(0, 10) > opts.end) return false;
      return true;
    })
    .reduce((sum, l) => sum + l.count, 0);
}

function rankingUnitFor(state: AppState, classId: string | null): { unit: RankingUnit; customDays: number | null; customStart: string | null; customEnd: string | null } {
  const config = state.rankingPeriodConfigs.find((c) => c.class_id === classId);
  return { unit: config?.unit ?? "month", customDays: config?.custom_days ?? null, customStart: config?.custom_start ?? null, customEnd: config?.custom_end ?? null };
}

/** 특정 스코프(전체=null 또는 classId)의 현재 주기 랭킹을 계산한다. */
export function rankingForScope(state: AppState, classId: string | null): RankingRow[] {
  const { unit, customDays, customStart, customEnd } = rankingUnitFor(state, classId);
  const { period_start, period_end } = computePeriodBounds(unit, undefined, customDays, customStart, customEnd);
  return getRanking({
    ledger: state.ledger,
    enrollments: state.enrollments,
    studentIds: state.students.map((s) => s.id),
    classId,
    periodStart: period_start,
    periodEnd: period_end,
  });
}

export function rankingPeriodLabel(state: AppState, classId: string | null): { unit: RankingUnit; start: string; end: string } {
  const { unit, customDays, customStart, customEnd } = rankingUnitFor(state, classId);
  const { period_start, period_end } = computePeriodBounds(unit, undefined, customDays, customStart, customEnd);
  return { unit, start: period_start, end: period_end };
}

/** 그룹 우선 노출: 학생이 소속된 특강반(기본반 제외) 중 가장 먼저 승인된 반을 기본값으로,
 *  없으면 전체(null) 랭킹을 기본값으로 반환한다. (PRD 4.9) */
export function defaultRankingScopeForStudent(state: AppState, studentId: string): string | null {
  const nonDefault = state.enrollments
    .filter((e) => e.student_id === studentId && e.status === "approved")
    .map((e) => ({ e, cls: getClassById(state, e.class_id) }))
    .filter((x) => x.cls && !x.cls.is_default)
    .sort((a, b) => (a.e.approved_at ?? "").localeCompare(b.e.approved_at ?? ""));
  return nonDefault.length > 0 ? nonDefault[0].e.class_id : null;
}

export function campaignStatus(campaign: RewardCampaign, ref: Date = DEMO_NOW): "scheduled" | "active" | "ended" {
  const start = new Date(`${campaign.period_start}T00:00:00`);
  const end = new Date(`${campaign.period_end}T23:59:59`);
  if (ref < start) return "scheduled";
  if (ref > end) return "ended";
  return "active";
}

export interface CampaignMeta {
  status: "scheduled" | "active" | "ended";
  rows: RankingRow[];
  eligibleCount: number;
  myRank: number | null;
  iAmEligible: boolean;
  iHaveClaimed: boolean;
  isMyTurn: boolean;
}

/** 순차 선택(드래프트) 자격/차례 계산 — 목업의 getCampaignMeta 로직 포팅 */
export function getCampaignMeta(state: AppState, campaign: RewardCampaign, studentId: string): CampaignMeta {
  const status = campaignStatus(campaign);
  const rows = getRanking({
    ledger: state.ledger,
    enrollments: state.enrollments,
    studentIds: state.students.map((s) => s.id),
    classId: campaign.class_id,
    periodStart: campaign.period_start,
    periodEnd: campaign.period_end,
  });
  const dist = campaign.target_distribution;
  const eligibleCount =
    dist.type === "count" ? Math.min(dist.value, rows.length) : Math.max(1, Math.round(rows.length * dist.value));

  const items = state.rewardItems.filter((i) => i.campaign_id === campaign.id);
  const claimedStudentIds = new Set(
    state.rewardClaims.filter((c) => items.some((i) => i.id === c.item_id)).map((c) => c.student_id)
  );

  const myRow = rows.find((r) => r.student_id === studentId);
  const myRank = myRow ? myRow.rank : null;

  let nextTurnId: string | null = null;
  for (const r of rows) {
    if (r.rank <= eligibleCount && !claimedStudentIds.has(r.student_id)) {
      nextTurnId = r.student_id;
      break;
    }
  }

  const iAmEligible = !!(myRank && myRank <= eligibleCount);
  const iHaveClaimed = claimedStudentIds.has(studentId);
  const isMyTurn = status === "ended" && iAmEligible && !iHaveClaimed && nextTurnId === studentId;

  return { status, rows, eligibleCount, myRank, iAmEligible, iHaveClaimed, isMyTurn };
}

export function itemsForCampaign(state: AppState, campaignId: string): RewardItem[] {
  return state.rewardItems.filter((i) => i.campaign_id === campaignId);
}

export function claimsForItem(state: AppState, itemId: string) {
  return state.rewardClaims.filter((c) => c.item_id === itemId);
}

/** 학생 홈에 노출할 대표 이벤트: 학생이 접근 가능한 스코프(소속 반 + 전체) 중
 *  진행중인 이벤트을 우선, 없으면 예정 이벤트을 반환한다. */
export function featuredCampaignForStudent(state: AppState, studentId: string): RewardCampaign | null {
  const myClassIds = new Set(approvedClassesForStudent(state, studentId).map((c) => c.id));
  const visible = state.rewardCampaigns.filter((c) => c.class_id === null || myClassIds.has(c.class_id));
  const claimable = visible.find((c) => campaignStatus(c) === "ended" && !getCampaignMeta(state, c, studentId).iHaveClaimed);
  if (claimable) return claimable;
  const active = visible.find((c) => campaignStatus(c) === "active");
  return active ?? visible.find((c) => campaignStatus(c) === "scheduled") ?? null;
}

export function ddayLabel(dateStr: string, ref: Date = DEMO_NOW): string {
  const target = new Date(`${dateStr}T00:00:00`);
  const diffMs = target.getTime() - new Date(ref.toDateString()).getTime();
  const diff = Math.round(diffMs / 86400000);
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "D-DAY";
  return "종료";
}

/** 관리자 승인함: 전체 승인 대기 항목 개수 */
export function pendingCounts(state: AppState) {
  return {
    homework: 0,
    praise: state.praiseRequests.filter((p) => p.approval_status === "pending").length,
    enrollment: state.enrollments.filter((e) => e.status === "pending").length,
  };
}

export interface DailyBreakdown {
  date: string;
  attendance: number;
  homework: number;
  praise: number;
  total: number;
}

export function dailyBreakdown(state: AppState, studentId: string, date: string): DailyBreakdown {
  const entries = state.ledger.filter(
    (l) => l.student_id === studentId && l.status === "active" && l.created_at.slice(0, 10) === date
  );
  const sumByType = (type: "attendance" | "homework" | "praise") =>
    entries.filter((l) => l.source_type === type).reduce((sum, l) => sum + l.count, 0);
  const attendance = sumByType("attendance");
  const homework = sumByType("homework");
  const praise = sumByType("praise");
  return { date, attendance, homework, praise, total: attendance + homework + praise };
}

export function activeDatesForStudent(state: AppState, studentId: string): Set<string> {
  return new Set(
    state.ledger
      .filter((l) => l.student_id === studentId && l.status === "active")
      .map((l) => l.created_at.slice(0, 10))
  );
}
