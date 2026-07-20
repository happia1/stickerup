import type {
  ClassRoom,
  Enrollment,
  Notice,
  RankingPeriodConfig,
  RewardCampaign,
  RewardClaim,
  RewardItem,
  StickerLedgerEntry,
  Student,
} from "@/lib/types";

export interface StudentHomeData {
  student: Student;
  students: Student[];
  classes: ClassRoom[];
  enrollments: Enrollment[];
  stickerLedger: StickerLedgerEntry[];
  notices: Notice[];
  rankingPeriodConfigs: RankingPeriodConfig[];
  rewardCampaigns: RewardCampaign[];
  rewardItems: RewardItem[];
  rewardClaims: RewardClaim[];
}
