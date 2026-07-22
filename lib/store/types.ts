import type {
  Tenant, Teacher, InviteLink, Student, ClassRoom, Enrollment,
  StickerLedgerEntry, HomeworkSubmission, PraiseRequest,
  RankingPeriodConfig, RewardCampaign, RewardItem, RewardClaim, ProductCatalogItem, Notice,
  TierConfig, GradingMode, RankingUnit, Role, TeacherPermissionKey,
} from "@/lib/types";

export interface AppState {
  currentUserId: string;
  currentUserRole: Role;
  tenant: Tenant;
  teachers: Teacher[];
  inviteLinks: InviteLink[];
  students: Student[];
  classes: ClassRoom[];
  enrollments: Enrollment[];
  ledger: StickerLedgerEntry[];
  homeworkSubmissions: HomeworkSubmission[];
  praiseRequests: PraiseRequest[];
  rankingPeriodConfigs: RankingPeriodConfig[];
  rewardCampaigns: RewardCampaign[];
  rewardItems: RewardItem[];
  rewardClaims: RewardClaim[];
  productCatalog: ProductCatalogItem[];
  notices: Notice[];
  attendancePolicy: TierConfig[];
  homeworkPolicy: TierConfig[];
  homeworkGradingMode: GradingMode;
}

export type Action =
  | { type: "HYDRATE_APP_STATE"; state: Partial<AppState> & Pick<AppState, "currentUserId" | "currentUserRole" | "tenant"> }
  | { type: "SWITCH_USER"; userId: string; role: Role }
  | { type: "CHECK_IN"; studentId: string; classId: string; tier: string }
  | { type: "SUBMIT_HOMEWORK"; studentId: string; classId: string; tier: string }
  | { type: "APPROVE_HOMEWORK"; submissionId: string; approverId: string }
  | { type: "REJECT_HOMEWORK"; submissionId: string }
  | { type: "SUBMIT_PRAISE"; studentId: string; classId: string | null; reason: string }
  | { type: "APPROVE_PRAISE"; requestId: string; approverId: string; count: number }
  | { type: "REJECT_PRAISE"; requestId: string }
  | { type: "ROLLBACK_LEDGER"; ledgerId: string; reason: string }
  | { type: "REQUEST_ENROLLMENT"; studentId: string; classIds: string[] }
  | { type: "APPROVE_ENROLLMENT"; enrollmentId: string; approverId: string }
  | { type: "REJECT_ENROLLMENT"; enrollmentId: string }
  | { type: "WITHDRAW_ENROLLMENT"; enrollmentId: string }
  | { type: "ADD_CLASS"; name: string; attendanceTime: string; specialStart: string | null; specialEnd: string | null; rankingUnit: RankingUnit }
  | { type: "UPDATE_CLASS_ATTENDANCE_TIME"; classId: string; attendanceTime: string }
  | { type: "UPDATE_CLASS_SPECIAL_PERIOD"; classId: string; specialStart: string; specialEnd: string }
  | { type: "SET_ATTENDANCE_POLICY"; tiers: TierConfig[] }
  | { type: "SET_HOMEWORK_POLICY"; tiers: TierConfig[]; mode: GradingMode }
  | { type: "ADD_NOTICE"; title: string; content: string; imageUrl: string | null; pinned: boolean; authorId: string }
  | { type: "UPDATE_NOTICE"; noticeId: string; title: string; content: string; imageUrl: string | null; pinned: boolean }
  | { type: "SET_NOTICE_PIN"; noticeId: string; pinned: boolean }
  | { type: "DELETE_NOTICE"; noticeId: string }
  | { type: "SET_RANKING_UNIT"; classId: string | null; unit: RankingUnit; customDays?: number | null; customStart?: string | null; customEnd?: string | null }
  | { type: "ADD_REWARD_CAMPAIGN"; title: string; description: string; classId: string | null; periodStart: string; periodEnd: string; distributionType: "ratio" | "count"; distributionValue: number; prizes: Array<{ rank: number; productId: string; qty: number }> }
  | { type: "UPDATE_REWARD_CAMPAIGN"; campaignId: string; title: string; description: string; distributionType: "ratio" | "count"; distributionValue: number; periodStart: string; periodEnd: string }
  | { type: "UPDATE_REWARD_ITEM"; itemId: string; title: string; qty: number; imageUrl: string | null }
  | { type: "ADD_CATALOG_PRODUCT"; title: string; imageUrl: string | null; purchaseUrl: string | null; description: string | null }
  | { type: "UPDATE_CATALOG_PRODUCT"; productId: string; title: string; imageUrl: string | null; purchaseUrl: string | null; description: string | null }
  | { type: "DELETE_CATALOG_PRODUCT"; productId: string }
  | { type: "SET_PRODUCT_CATALOG"; products: ProductCatalogItem[] }
  | { type: "CLAIM_REWARD"; itemId: string; studentId: string; rank: number }
  | { type: "ADD_TEACHER"; name: string; email: string; invitedBy: string }
  | { type: "REMOVE_TEACHER"; teacherId: string }
  | { type: "SET_TEACHER_PERMISSION"; teacherId: string; permission: TeacherPermissionKey; enabled: boolean }
  | { type: "UPDATE_TEACHER_PROFILE"; teacherId: string; name: string; profileImageUrl: string | null }
  | { type: "ADD_INVITE_LINK"; issuerTeacherId: string; token: string; inviteeRole: "student" | "teacher" }
  | { type: "UPDATE_STUDENT_PROFILE"; studentId: string; name: string; birthDate: string | null; profileImageUrl: string | null };
