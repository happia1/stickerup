// Mock/demo data has been removed from normal app flows.
// Keep only empty exports so legacy components compile until they are fully replaced by Supabase queries.

import type {
  Tenant,
  Teacher,
  InviteLink,
  Student,
  ClassRoom,
  Enrollment,
  StickerLedgerEntry,
  HomeworkSubmission,
  PraiseRequest,
  RankingPeriodConfig,
  RewardCampaign,
  RewardItem,
  RewardClaim,
  Notice,
} from "@/lib/types";

export const TENANT_ID = "";
export const OWNER_ID = "";
export const ASSISTANT_ID = "";
export const DEFAULT_CLASS_ID = "";
export const ALGEBRA_CLASS_ID = "";
export const SUNEUNG_CLASS_ID = "";

export const STUDENT_IDS = {
  s1: "",
  s2: "",
  s3: "",
  s4: "",
  s5: "",
};

export const seedTenant: Tenant = {
  id: "",
  name: "",
  owner_teacher_id: null,
  created_at: "1970-01-01T00:00:00.000Z",
};

export const seedTeachers: Teacher[] = [];
export const seedInviteLinks: InviteLink[] = [];
export const seedStudents: Student[] = [];
export const seedClasses: ClassRoom[] = [];
export const seedEnrollments: Enrollment[] = [];
export const seedLedger: StickerLedgerEntry[] = [];
export const seedHomeworkSubmissions: HomeworkSubmission[] = [];
export const seedPraiseRequests: PraiseRequest[] = [];
export const seedRankingPeriodConfigs: RankingPeriodConfig[] = [];
export const seedRewardCampaigns: RewardCampaign[] = [];
export const seedRewardItems: RewardItem[] = [];
export const seedRewardClaims: RewardClaim[] = [];
export const seedNotices: Notice[] = [];
