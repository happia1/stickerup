// 타입 정의: docs/DB_SCHEMA.md 의 테이블 구조를 그대로 반영한다.
// Supabase 연동 시 이 타입들을 supabase-js 쿼리 결과 타입으로 그대로 재사용할 수 있도록
// snake_case 필드명을 DB와 동일하게 유지한다.

export type Role = "owner" | "assistant" | "student";

export type RankingUnit = "day" | "week" | "month" | "quarter";

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
}

export interface InviteLink {
  id: string;
  tenant_id: string;
  issuer_teacher_id: string;
  token: string;
  status: "active" | "expired" | "revoked";
  expires_at: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  tenant_id: string;
  invited_by_teacher_id: string | null;
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

export type AttendanceTier =
  | "on_time"
  | "within_10"
  | "within_30"
  | "within_60"
  | "over_60"
  | "absent";

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

export type HomeworkTier = "complete" | "half" | "none";
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

// 5단계 출석 지급 기준 (전역 고정값, 정책 화면에서 읽기 전용으로만 노출)
export const ATTENDANCE_TIERS: { tier: AttendanceTier; label: string; count: number }[] = [
  { tier: "on_time", label: "정시 이전", count: 5 },
  { tier: "within_10", label: "정시 후 10분 이내", count: 4 },
  { tier: "within_30", label: "정시 후 30분 이내", count: 3 },
  { tier: "within_60", label: "정시 후 1시간 이내", count: 2 },
  { tier: "over_60", label: "정시 후 1시간 초과", count: 1 },
  { tier: "absent", label: "결석", count: 0 },
];

// 숙제 완료율 3단계 (지급 수는 관리자가 조정 가능한 정책값)
export interface HomeworkTierConfig {
  tier: HomeworkTier;
  label: string;
  count: number;
}

export const DEFAULT_HOMEWORK_TIERS: HomeworkTierConfig[] = [
  { tier: "complete", label: "완료", count: 5 },
  { tier: "half", label: "절반 완료", count: 3 },
  { tier: "none", label: "미완료", count: 0 },
];

export const RANKING_UNIT_LABEL: Record<RankingUnit, string> = {
  day: "일 단위",
  week: "주 단위",
  month: "월 단위",
  quarter: "분기 단위",
};
