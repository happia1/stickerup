// ?????類ㅼ벥: docs/DB_SCHEMA.md ?????뵠???닌듼쒐몴?域밸챶?嚥?獄쏆꼷???뺣뼄.
// Supabase ?怨뺣짗 ????????낅굶??supabase-js ?묒눖??野껉퀗??????놁몵嚥?域밸챶?嚥???沅??븍막 ????덈즲嚥?
// snake_case ?袁⑤굡筌뤿굞??DB?? ??덉뵬??띿쓺 ?醫???뺣뼄.

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
  profile_image_url?: string | null;
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

// ?곗뮇苑???덉젫 ?닌덉퍢?? ?온?귐딆쁽揶쎛 ?癒??嚥?苡??類ㅼ벥??????덈뮉 ??덉읅 揶쏅????(id???癒?? ?얜챷???.
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
  class_id: string | null; // null = ?袁⑷퍥(疫꼲嚥≪뮆苡?
  unit: RankingUnit;
  custom_days: number | null; // unit === "custom" ?????????筌욊낯????낆젾 雅뚯눊由???
  custom_start?: string | null;
  custom_end?: string | null;
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
  class_id: string | null; // null = ?袁⑷퍥 ????
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
  product_id?: string | null;
  rank_order?: number | null;
}

export interface ProductCatalogItem {
  id: string;
  tenant_id: string;
  source_marketplace_product_id?: string | null;
  title: string;
  image_url: string | null;
  purchase_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
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
  image_url?: string | null;
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
// ?곗뮇苑?/ ??덉젫 ?닌덉퍢 ?類ㅼ퐠 ???온?귐딆쁽揶쎛 ?온?귐딆쁽 ????쎈뼒???類ㅼ퐠 ??쇱젟)?癒?퐣
// ?닌덉퍢 ??已?甕곕뗄????살구/筌왖疫???쎈뼒????? ?癒??嚥?苡??곕떽?夷??륁젟夷?????????덈뼄.
// =========================================================
// =========================================================
// Attendance / homework tier configuration
// =========================================================
export interface TierConfig {
  tier: string;
  label: string;
  rangeText: string;
  count: number;
}

export const DEFAULT_ATTENDANCE_TIERS: TierConfig[] = [
  { tier: "on_time", label: "On time", rangeText: "Before class time", count: 5 },
  { tier: "within_10", label: "Within 10 min", rangeText: "0~10 min late", count: 4 },
  { tier: "within_30", label: "Within 30 min", rangeText: "10~30 min late", count: 3 },
  { tier: "within_60", label: "Within 1 hour", rangeText: "30~60 min late", count: 2 },
  { tier: "over_60", label: "Over 1 hour", rangeText: "Over 60 min late", count: 1 },
  { tier: "absent", label: "Absent", rangeText: "No check-in", count: 0 },
];

export const ATTENDANCE_TIERS = DEFAULT_ATTENDANCE_TIERS.map(({ tier, label, count }) => ({ tier, label, count }));

export type GradingMode = "manual" | "percent" | "quantile";

export const HOMEWORK_MODE_LABEL: Record<GradingMode, string> = {
  manual: "Manual",
  percent: "Percent",
  quantile: "Quantile",
};

export const HOMEWORK_MODE_PRESETS: Record<GradingMode, TierConfig[]> = {
  manual: [
    { tier: "complete", label: "Complete", rangeText: "100%", count: 5 },
    { tier: "half", label: "Half complete", rangeText: "50%", count: 3 },
    { tier: "none", label: "Incomplete", rangeText: "0%", count: 0 },
  ],
  percent: [
    { tier: "p90", label: "90%+", rangeText: "90~100%", count: 5 },
    { tier: "p70", label: "70~89%", rangeText: "70~89%", count: 4 },
    { tier: "p40", label: "40~69%", rangeText: "40~69%", count: 2 },
    { tier: "p0", label: "Under 40%", rangeText: "0~39%", count: 0 },
  ],
  quantile: [
    { tier: "q1", label: "Q1", rangeText: "Top 0~25%", count: 5 },
    { tier: "q2", label: "Q2", rangeText: "Top 25~50%", count: 3 },
    { tier: "q3", label: "Q3", rangeText: "Top 50~75%", count: 2 },
    { tier: "q4", label: "Q4", rangeText: "Top 75~100%", count: 0 },
  ],
};

export const DEFAULT_HOMEWORK_TIERS: TierConfig[] = HOMEWORK_MODE_PRESETS.manual;

export const RANKING_UNIT_LABEL: Record<RankingUnit, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
  quarter: "Quarterly",
  custom: "Custom",
};

export type StickerDenomination = "gold" | "silver" | "bronze" | null;

export function stickerDenomination(count: number): StickerDenomination {
  if (count >= 300) return "gold";
  if (count >= 200) return "silver";
  if (count >= 100) return "bronze";
  return null;
}
