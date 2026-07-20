// 로컬 개발용 시드 데이터. supabase/migrations/20260719_04_seed_dev.sql 의 내용과
// 최대한 동일한 구조/값으로 맞췄다. Supabase 연동 시 이 파일은 더 이상 쓰이지 않고
// 실제 쿼리 결과로 대체된다.

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

export const TENANT_ID = "aaaaaaaa-0000-0000-0000-000000000001";
export const OWNER_ID = "11111111-1111-1111-1111-111111111111";
export const ASSISTANT_ID = "22222222-2222-2222-2222-222222222222";
export const DEFAULT_CLASS_ID = "bbbbbbbb-0000-0000-0000-000000000000";
export const ALGEBRA_CLASS_ID = "bbbbbbbb-0000-0000-0000-000000000001";
export const SUNEUNG_CLASS_ID = "bbbbbbbb-0000-0000-0000-000000000002";

export const STUDENT_IDS = {
  s1: "33333333-3333-3333-3333-333333333331",
  s2: "33333333-3333-3333-3333-333333333332",
  s3: "33333333-3333-3333-3333-333333333333",
  s4: "33333333-3333-3333-3333-333333333334",
  s5: "33333333-3333-3333-3333-333333333335",
};

const now = () => new Date().toISOString();

export const seedTenant: Tenant = {
  id: TENANT_ID,
  name: "해피 수학학원",
  owner_teacher_id: OWNER_ID,
  created_at: "2026-06-01T00:00:00Z",
};

export const seedTeachers: Teacher[] = [
  {
    id: OWNER_ID,
    tenant_id: TENANT_ID,
    role: "owner",
    name: "김원장",
    email: "owner@stickerup.dev",
    invited_by: null,
    created_at: "2026-06-01T00:00:00Z",
  },
  {
    id: ASSISTANT_ID,
    tenant_id: TENANT_ID,
    role: "assistant",
    name: "박조교",
    email: "assistant@stickerup.dev",
    invited_by: OWNER_ID,
    created_at: "2026-06-02T00:00:00Z",
  },
];

export const seedInviteLinks: InviteLink[] = [
  {
    id: "dddddddd-0000-0000-0000-000000000001",
    tenant_id: TENANT_ID,
    issuer_teacher_id: OWNER_ID,
    token: "happy-math-2026",
    status: "active",
    expires_at: null,
    created_at: "2026-06-02T00:00:00Z",
  },
];

export const seedStudents: Student[] = [
  { id: STUDENT_IDS.s1, tenant_id: TENANT_ID, invited_by_teacher_id: OWNER_ID, invite_link_id: seedInviteLinks[0].id, name: "김민준", age: 16, profile_image_url: null, account_status: "active", created_at: "2026-06-03T00:00:00Z" },
  { id: STUDENT_IDS.s2, tenant_id: TENANT_ID, invited_by_teacher_id: OWNER_ID, invite_link_id: seedInviteLinks[0].id, name: "이서연", age: 17, profile_image_url: null, account_status: "active", created_at: "2026-06-03T00:00:00Z" },
  { id: STUDENT_IDS.s3, tenant_id: TENANT_ID, invited_by_teacher_id: ASSISTANT_ID, invite_link_id: seedInviteLinks[0].id, name: "박도윤", age: 15, profile_image_url: null, account_status: "active", created_at: "2026-06-04T00:00:00Z" },
  { id: STUDENT_IDS.s4, tenant_id: TENANT_ID, invited_by_teacher_id: ASSISTANT_ID, invite_link_id: seedInviteLinks[0].id, name: "최지우", age: 16, profile_image_url: null, account_status: "active", created_at: "2026-06-04T00:00:00Z" },
  { id: STUDENT_IDS.s5, tenant_id: TENANT_ID, invited_by_teacher_id: ASSISTANT_ID, invite_link_id: seedInviteLinks[0].id, name: "정하은", age: 17, profile_image_url: null, account_status: "active", created_at: "2026-06-05T00:00:00Z" },
];

export const seedClasses: ClassRoom[] = [
  {
    id: DEFAULT_CLASS_ID,
    tenant_id: TENANT_ID,
    name: "기본반",
    attendance_time: "15:00",
    is_default: true,
    special_start: null,
    special_end: null,
    ranking_unit: "month",
    status: "active",
    created_at: "2026-06-01T00:00:00Z",
    updated_at: "2026-06-01T00:00:00Z",
  },
  {
    id: ALGEBRA_CLASS_ID,
    tenant_id: TENANT_ID,
    name: "대수반",
    attendance_time: "19:00",
    is_default: false,
    special_start: "2026-07-01",
    special_end: "2026-08-31",
    ranking_unit: "week",
    status: "active",
    created_at: "2026-06-10T00:00:00Z",
    updated_at: "2026-06-10T00:00:00Z",
  },
  {
    id: SUNEUNG_CLASS_ID,
    tenant_id: TENANT_ID,
    name: "수능특강반",
    attendance_time: "09:00",
    is_default: false,
    special_start: "2026-07-01",
    special_end: "2026-09-30",
    ranking_unit: "month",
    status: "active",
    created_at: "2026-06-10T00:00:00Z",
    updated_at: "2026-06-10T00:00:00Z",
  },
];

export const seedEnrollments: Enrollment[] = [
  { id: "e0000001", tenant_id: TENANT_ID, student_id: STUDENT_IDS.s1, class_id: DEFAULT_CLASS_ID, status: "approved", requested_at: now(), approved_at: now(), approver_id: null },
  { id: "e0000002", tenant_id: TENANT_ID, student_id: STUDENT_IDS.s2, class_id: DEFAULT_CLASS_ID, status: "approved", requested_at: now(), approved_at: now(), approver_id: null },
  { id: "e0000003", tenant_id: TENANT_ID, student_id: STUDENT_IDS.s3, class_id: DEFAULT_CLASS_ID, status: "approved", requested_at: now(), approved_at: now(), approver_id: null },
  { id: "e0000004", tenant_id: TENANT_ID, student_id: STUDENT_IDS.s4, class_id: DEFAULT_CLASS_ID, status: "approved", requested_at: now(), approved_at: now(), approver_id: null },
  { id: "e0000005", tenant_id: TENANT_ID, student_id: STUDENT_IDS.s5, class_id: DEFAULT_CLASS_ID, status: "approved", requested_at: now(), approved_at: now(), approver_id: null },
  { id: "e0000006", tenant_id: TENANT_ID, student_id: STUDENT_IDS.s1, class_id: ALGEBRA_CLASS_ID, status: "approved", requested_at: "2026-07-02T00:00:00Z", approved_at: "2026-07-02T09:00:00Z", approver_id: OWNER_ID },
  { id: "e0000007", tenant_id: TENANT_ID, student_id: STUDENT_IDS.s2, class_id: ALGEBRA_CLASS_ID, status: "approved", requested_at: "2026-07-02T00:00:00Z", approved_at: "2026-07-02T09:00:00Z", approver_id: OWNER_ID },
  { id: "e0000008", tenant_id: TENANT_ID, student_id: STUDENT_IDS.s4, class_id: SUNEUNG_CLASS_ID, status: "approved", requested_at: "2026-07-02T00:00:00Z", approved_at: "2026-07-02T09:00:00Z", approver_id: ASSISTANT_ID },
  { id: "e0000009", tenant_id: TENANT_ID, student_id: STUDENT_IDS.s3, class_id: ALGEBRA_CLASS_ID, status: "pending", requested_at: "2026-07-18T20:00:00Z", approved_at: null, approver_id: null },
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function buildLedgerSeed(): StickerLedgerEntry[] {
  const rng = seededRandom(42);
  const entries: StickerLedgerEntry[] = [];
  let idc = 1;
  const days: string[] = [];
  for (let d = 1; d <= 18; d++) days.push(`2026-07-${String(d).padStart(2, "0")}`);

  const classesByStudent: Record<string, string[]> = {
    [STUDENT_IDS.s1]: [DEFAULT_CLASS_ID, ALGEBRA_CLASS_ID],
    [STUDENT_IDS.s2]: [DEFAULT_CLASS_ID, ALGEBRA_CLASS_ID],
    [STUDENT_IDS.s3]: [DEFAULT_CLASS_ID],
    [STUDENT_IDS.s4]: [DEFAULT_CLASS_ID, SUNEUNG_CLASS_ID],
    [STUDENT_IDS.s5]: [DEFAULT_CLASS_ID],
  };
  const attendanceTimeByClass: Record<string, string> = {
    [DEFAULT_CLASS_ID]: "15:00",
    [ALGEBRA_CLASS_ID]: "19:00",
    [SUNEUNG_CLASS_ID]: "09:00",
  };
  const attendanceTiers = [
    { tier: "on_time" as const, count: 5, label: "정시 이전" },
    { tier: "within_10" as const, count: 4, label: "10분 이내" },
    { tier: "within_30" as const, count: 3, label: "30분 이내" },
    { tier: "within_60" as const, count: 2, label: "1시간 이내" },
  ];
  const homeworkTiers = [
    { tier: "complete" as const, count: 5, label: "완료" },
    { tier: "half" as const, count: 3, label: "절반 완료" },
    { tier: "none" as const, count: 0, label: "미완료" },
  ];

  Object.entries(classesByStudent).forEach(([studentId, classIds]) => {
    classIds.forEach((classId) => {
      days.forEach((day) => {
        if (rng() < 0.85) {
          const r = rng();
          const tier = r < 0.55 ? attendanceTiers[0] : r < 0.75 ? attendanceTiers[1] : r < 0.9 ? attendanceTiers[2] : attendanceTiers[3];
          entries.push({
            id: `L${idc++}`,
            tenant_id: TENANT_ID,
            student_id: studentId,
            class_id: classId,
            source_type: "attendance",
            source_id: `att-${idc}`,
            count: tier.count,
            status: "active",
            actor_teacher_id: null,
            rollback_reason: null,
            rollback_at: null,
            created_at: `${day}T${attendanceTimeByClass[classId]}:00Z`,
          });
        }
        if (rng() < 0.8) {
          const r2 = rng();
          const tier = r2 < 0.5 ? homeworkTiers[0] : r2 < 0.8 ? homeworkTiers[1] : homeworkTiers[2];
          entries.push({
            id: `L${idc++}`,
            tenant_id: TENANT_ID,
            student_id: studentId,
            class_id: classId,
            source_type: "homework",
            source_id: `hw-${idc}`,
            count: tier.count,
            status: "active",
            actor_teacher_id: OWNER_ID,
            rollback_reason: null,
            rollback_at: null,
            created_at: `${day}T21:00:00Z`,
          });
        }
      });
    });
    if (rng() < 0.7) {
      entries.push({
        id: `L${idc++}`,
        tenant_id: TENANT_ID,
        student_id: studentId,
        class_id: DEFAULT_CLASS_ID,
        source_type: "praise",
        source_id: `pr-${idc}`,
        count: 1 + Math.floor(rng() * 3),
        status: "active",
        actor_teacher_id: ASSISTANT_ID,
        rollback_reason: null,
        rollback_at: null,
        created_at: `2026-07-${String(3 + Math.floor(rng() * 10)).padStart(2, "0")}T14:00:00Z`,
      });
    }
  });

  // 롤백 감사 로그 예시
  entries.push({
    id: `L${idc++}`,
    tenant_id: TENANT_ID,
    student_id: STUDENT_IDS.s2,
    class_id: ALGEBRA_CLASS_ID,
    source_type: "praise",
    source_id: "pr-rollback-demo",
    count: 5,
    status: "rolled_back",
    actor_teacher_id: OWNER_ID,
    rollback_reason: "동일 사유로 중복 지급 확인되어 취소",
    rollback_at: "2026-07-11T09:00:00Z",
    created_at: "2026-07-10T15:00:00Z",
  });

  return entries;
}

export const seedLedger: StickerLedgerEntry[] = buildLedgerSeed();

export const seedHomeworkSubmissions: HomeworkSubmission[] = [
  {
    id: "hw-pending-1",
    tenant_id: TENANT_ID,
    student_id: STUDENT_IDS.s1,
    class_id: ALGEBRA_CLASS_ID,
    completion_tier: "half",
    sticker_count: 3,
    approval_status: "pending",
    approver_id: null,
    submitted_at: "2026-07-19T20:50:00Z",
    approved_at: null,
  },
  {
    id: "hw-pending-2",
    tenant_id: TENANT_ID,
    student_id: STUDENT_IDS.s4,
    class_id: SUNEUNG_CLASS_ID,
    completion_tier: "complete",
    sticker_count: 5,
    approval_status: "pending",
    approver_id: null,
    submitted_at: "2026-07-19T21:10:00Z",
    approved_at: null,
  },
];

export const seedPraiseRequests: PraiseRequest[] = [
  {
    id: "pr-pending-1",
    tenant_id: TENANT_ID,
    student_id: STUDENT_IDS.s3,
    class_id: DEFAULT_CLASS_ID,
    category: null,
    reason: "친구 숙제 도와줌",
    sticker_count: null,
    approval_status: "pending",
    approver_id: null,
    requested_at: "2026-07-19T18:20:00Z",
    approved_at: null,
  },
];

export const seedRankingPeriodConfigs: RankingPeriodConfig[] = [
  { id: "rpc-global", tenant_id: TENANT_ID, class_id: null, unit: "month", custom_days: null, updated_at: now() },
  { id: "rpc-algebra", tenant_id: TENANT_ID, class_id: ALGEBRA_CLASS_ID, unit: "week", custom_days: null, updated_at: now() },
  { id: "rpc-suneung", tenant_id: TENANT_ID, class_id: SUNEUNG_CLASS_ID, unit: "month", custom_days: null, updated_at: now() },
];

export const seedRewardCampaigns: RewardCampaign[] = [
  {
    id: "camp-algebra-week",
    tenant_id: TENANT_ID,
    class_id: ALGEBRA_CLASS_ID,
    period_start: "2026-07-13",
    period_end: "2026-07-19",
    target_distribution: { type: "count", value: 3 },
    status: "active",
    created_at: "2026-07-13T00:00:00Z",
  },
];

export const seedRewardItems: RewardItem[] = [
  { id: "item-1", tenant_id: TENANT_ID, campaign_id: "camp-algebra-week", title: "스타벅스 아메리카노 기프티콘", image_url: null, link_url: null, qty: 3 },
  { id: "item-2", tenant_id: TENANT_ID, campaign_id: "camp-algebra-week", title: "문화상품권 1만원", image_url: null, link_url: null, qty: 5 },
];

export const seedRewardClaims: RewardClaim[] = [];

export const seedNotices: Notice[] = [
  {
    id: "n1",
    tenant_id: TENANT_ID,
    title: "7월 정기고사 대비 특강 안내",
    content: "7/22(월)부터 정기고사 대비 특강이 진행됩니다. 시간표는 반별 공지를 참고해주세요.",
    pinned: true,
    author_teacher_id: OWNER_ID,
    created_at: "2026-07-18T09:00:00Z",
  },
  {
    id: "n2",
    tenant_id: TENANT_ID,
    title: "7월 랭킹 보상 이벤트 진행중!",
    content: "이번 주 대수반 랭킹 상위 3명에게 상품을 드려요.",
    pinned: true,
    author_teacher_id: OWNER_ID,
    created_at: "2026-07-15T09:00:00Z",
  },
  {
    id: "n3",
    tenant_id: TENANT_ID,
    title: "이번 주 목요일 휴원 안내",
    content: "시설 점검으로 7/23(목)은 휴원합니다.",
    pinned: false,
    author_teacher_id: ASSISTANT_ID,
    created_at: "2026-07-17T09:00:00Z",
  },
];
