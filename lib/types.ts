// 타입 정의: docs/DB_SCHEMA.md 의 테이블 구조를 그대로 반영한다.
// Supabase 연동 시 이 타입들을 supabase-js 쿼리 결과 타입으로 그대로 재사용할 수 있도록
// snake_case 필드명을 DB와 동일하게 유지한다.

export type Role = "owner" | "assistant" | "student";
export type TeacherPermissionKey = "notices" | "sticker_policy" | "classes" | "students" | "approvals" | "sticker_audit" | "ranking" | "rewards";
export type TeacherPermissions = Record<TeacherPermissionKey, boolean>;
export const DEFAULT_TEACHER_PERMISSIONS: TeacherPermissions = { notices: true, sticker_policy: true, classes: true, students: true, approvals: true, sticker_audit: false, ranking: true, rewards: false };

export type RankingUnit = "day" | "week" | "month" | "quarter" | "custom";

export interface Tenant {
  id: string;
  name: string;
  owner_teacher_id: string | null;
  created_at: string;
}

export interface Teacher {
  id: string;
  tenant_id: string;
  role: "owner" | "assistant";
  name: string;
  email: string;
  invited_by: string | null;
  created_at: string;
  permissions?: TeacherPermissions;
}

export interface InviteLink {
  id: string;
  tenant_id: string;
  issuer_teacher_id: string;
  token: string;
  status: "active" | "expired" | "revoked";
  expires_at: string | null;
  created_at: string;
  invitee_role?: "student" | "teacher";
}

export interface Student {
  id: string;
  tenant_id: string;
  invited_by_teacher_id: string | null;
  invite_link_id: string | null;
  name: string;
  age: number | null;
  profile_image_url: string | null;
  account_status: "active" | "inactive";
  created_at: string;
}

export interface ClassRoom {
  id: string;
  tenant_id: string;
  name: string;
  attendance_time: string; // "HH:mm"
  is_default: boolean;
  special_start: string | null;
  special_end: string | null;
  ranking_unit: RankingUnit;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

export type EnrollmentStatus = "pending" | "approved" | "rejected";

export interface Enrollment {
  id: string;
  tenant_id: string;
  student_id: string;
  class_id: string;
  status: EnrollmentStatus;
  requested_at: string;
  approved_at: string | null;
  approver_id: string | null;
}

// 출석/숙제 구간은 관리자가 자유롭게 정의할 수 있는 동적 값이다 (id는 자유 문자열).
export type AttendanceTier = string;

export interface AttendanceRecord {
  id: string;
  tenant_id: string;
  student_id: string;
  class_id: string;
  checked_at: string;
  tier: AttendanceTier;
  sticker_count: number;
  created_at: string;
}

export type HomeworkTier = string;
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface HomeworkSubmission {
  id: string;
  tenant_id: string;
  student_id: string;
  class_id: string;
  completion_tier: HomeworkTier;
  sticker_count: number;
  approval_status: ApprovalStatus;
  approver_id: string | null;
  submitted_at: string;
  approved_at: string | null;
}

export interface PraiseRequest {
  id: string;
  tenant_id: string;
  student_id: string;
  class_id: string | null;
  category: string | null;
  reason: string;
  sticker_count: number | null;
  approval_status: ApprovalStatus;
  approver_id: string | null;
  requested_at: string;
  approved_at: string | null;
}

export type LedgerSourceType = "attendance" | "homework" | "praise";
export type LedgerStatus = "active" | "rolled_back";

export interface StickerLedgerEntry {
  id: string;
  tenant_id: string;
  student_id: string;
  class_id: string;
  source_type: LedgerSourceType;
  source_id: string;
  count: number;
  status: LedgerStatus;
  actor_teacher_id: string | null;
  rollback_reason: string | null;
  rollback_at: string | null;
  created_at: string;
}

export interface RankingPeriodConfig {
  id: string;
  tenant_id: string;
  class_id: string | null; // null = 전체(글로벌)
  unit: RankingUnit;
  custom_days: number | null; // unit === "custom" 일 때 사용할 직접 입력 주기(일)
  updated_at: string;
}

export type RewardCampaignStatus = "scheduled" | "active" | "ended";

export interface RewardTargetDistribution {
  type: "ratio" | "count";
  value: number;
}

export interface RewardCampaign {
  id: string;
  tenant_id: string;
  class_id: string | null; // null = 전체 대상
  period_start: string;
  period_end: string;
  target_distribution: RewardTargetDistribution;
  status: RewardCampaignStatus;
  created_at: string;
}

export interface RewardItem {
  id: string;
  tenant_id: string;
  campaign_id: string;
  title: string;
  image_url: string | null;
  link_url: string | null;
  qty: number;
}

export interface RewardClaim {
  id: string;
  tenant_id: string;
  item_id: string;
  student_id: string;
  rank_at_claim: number | null;
  claimed_at: string;
}

export interface Notice {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  pinned: boolean;
  author_teacher_id: string | null;
  created_at: string;
}

export type Medal = "gold" | "silver" | "bronze" | null;

export interface RankingRow {
  student_id: string;
  total_count: number;
  first_activity_at: string | null;
  rank: number;
  medal: Medal;
}

// =========================================================
// 출석 / 숙제 구간 정책 — 관리자가 관리자 앱(스티커 정책 설정)에서
// 구간 이름/범위 설명/지급 스티커 수를 자유롭게 추가·수정·삭제할 수 있다.
// =========================================================
export interface TierConfig {
  tier: string; // 구간 고유 id (자유 문자열)
  label: string; // 구간 이름
  rangeText: string; // 구간 범위 설명 (자유 텍스트: "정시 후 0~10분", "80~100%", "1분위" 등)
  count: number; // 지급 스티커 수
}

// 5단계 출석 지급 기준 초기값 (관리자가 스티커 정책 설정에서 자유롭게 수정 가능)
export const DEFAULT_ATTENDANCE_TIERS: TierConfig[] = [
  { tier: "on_time", label: "정시 이전", rangeText: "지각 없음", count: 5 },
  { tier: "within_10", label: "10분 이내", rangeText: "정시 후 0~10분", count: 4 },
  { tier: "within_30", label: "30분 이내", rangeText: "정시 후 10~30분", count: 3 },
  { tier: "within_60", label: "1시간 이내", rangeText: "정시 후 30~60분", count: 2 },
  { tier: "over_60", label: "1시간 초과", rangeText: "정시 후 60분 초과", count: 1 },
  { tier: "absent", label: "결석", rangeText: "미출석", count: 0 },
];

export const ATTENDANCE_TIERS = DEFAULT_ATTENDANCE_TIERS.map(({ tier, label, count }) => ({
  tier,
  label,
  count,
}));

// 숙제 완료율 구간을 정의하는 방식 — 선생님이 상황에 맞게 선택할 수 있다.
export type GradingMode = "manual" | "percent" | "quantile";

export const HOMEWORK_MODE_LABEL: Record<GradingMode, string> = {
  manual: "수동 지정(현재처럼)",
  percent: "완료율 퍼센트(%) 구간",
  quantile: "분위(순위 비율) 구간",
};

// 모드를 바꿀 때 불러올 수 있는 기본 구성 — 불러온 뒤에도 자유롭게 추가/수정/삭제 가능하다.
export const HOMEWORK_MODE_PRESETS: Record<GradingMode, TierConfig[]> = {
  manual: [
    { tier: "complete", label: "완료", rangeText: "100%", count: 5 },
    { tier: "half", label: "절반 완료", rangeText: "50%", count: 3 },
    { tier: "none", label: "미완료", rangeText: "0%", count: 0 },
  ],
  percent: [
    { tier: "p90", label: "90% 이상", rangeText: "90~100%", count: 5 },
    { tier: "p70", label: "70~89%", rangeText: "70~89%", count: 4 },
    { tier: "p40", label: "40~69%", rangeText: "40~69%", count: 2 },
    { tier: "p0", label: "40% 미만", rangeText: "0~39%", count: 0 },
  ],
  quantile: [
    { tier: "q1", label: "1분위 (상위 25%)", rangeText: "상위 0~25%", count: 5 },
    { tier: "q2", label: "2분위", rangeText: "상위 25~50%", count: 3 },
    { tier: "q3", label: "3분위", rangeText: "상위 50~75%", count: 2 },
    { tier: "q4", label: "4분위 (하위 25%)", rangeText: "상위 75~100%", count: 0 },
  ],
};

export const DEFAULT_HOMEWORK_TIERS: TierConfig[] = HOMEWORK_MODE_PRESETS.manual;

export const RANKING_UNIT_LABEL: Record<RankingUnit, string> = {
  day: "일 단위",
  week: "주 단위",
  month: "월 단위",
  quarter: "분기 단위",
  custom: "사용자 설정 기간",
};

// 스티커 보유량이 세 자릿수로 넘어갈 때 보기 좋게 치환할 단위 아이콘 기준.
// 100장부터 동색, 200장부터 은색, 300장부터 금색 스티커 아이콘을 함께 보여준다.
export type StickerDenomination = "gold" | "silver" | "bronze" | null;

export function stickerDenomination(count: number): StickerDenomination {
  if (count >= 300) return "gold";
  if (count >= 200) return "silver";
  if (count >= 100) return "bronze";
  return null;
}
