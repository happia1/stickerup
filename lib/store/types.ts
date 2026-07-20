import type {
  Tenant, Teacher, InviteLink, Student, ClassRoom, Enrollment,
  StickerLedgerEntry, HomeworkSubmission, PraiseRequest,
  RankingPeriodConfig, RewardCampaign, RewardItem, RewardClaim, Notice,
  AttendanceTier, HomeworkTierConfig, RankingUnit, Role,
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
  notices: Notice[];
  homeworkPolicy: HomeworkTierConfig[];
}

export type Action =
  | { type: "SWITCH_USER"; userId: string; role: Role }
  | { type: "CHECK_IN"; studentId: string; classId: string; tier: AttendanceTier }
  | { type: "SUBMIT_HOMEWORK"; studentId: string; classId: string; tier: "complete" | "half" | "none" }
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
  | { type: "UPDATE_HOMEWORK_POLICY"; tier: "complete" | "half" | "none"; count: number }
  | { type: "ADD_NOTICE"; title: string; content: string; pinned: boolean; authorId: string }
  | { type: "TOGGLE_NOTICE_PIN"; noticeId: string }
  | { type: "DELETE_NOTICE"; noticeId: string }
  | { type: "SET_RANKING_UNIT"; classId: string | null; unit: RankingUnit }
  | { type: "ADD_REWARD_CAMPAIGN"; classId: string | null; periodStart: string; periodEnd: string; distributionType: "ratio" | "count"; distributionValue: number; itemTitle: string; itemQty: number }
  | { type: "CLAIM_REWARD"; itemId: string; studentId: string; rank: number }
  | { type: "ADD_TEACHER"; name: string; email: string; invitedBy: string }
  | { type: "REMOVE_TEACHER"; teacherId: string }
  | { type: "ADD_INVITE_LINK"; issuerTeacherId: string; token: string }
  | { type: "UPDATE_STUDENT_PROFILE"; studentId: string; name: string; age: number; profileImageUrl: string | null };
