import type { AppState, Action } from "./types";
import { DEFAULT_TEACHER_PERMISSIONS, type ClassRoom, type Enrollment, type RewardCampaign, type RewardItem } from "@/lib/types";

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SWITCH_USER": {
      return { ...state, currentUserId: action.userId, currentUserRole: action.role };
    }

    case "CHECK_IN": {
      const tierDef = state.attendancePolicy.find((t) => t.tier === action.tier);
      const count = tierDef ? tierDef.count : 0;
      const entry = {
        id: uid("led"),
        tenant_id: state.tenant.id,
        student_id: action.studentId,
        class_id: action.classId,
        source_type: "attendance" as const,
        source_id: uid("att"),
        count,
        status: "active" as const,
        actor_teacher_id: null,
        rollback_reason: null,
        rollback_at: null,
        created_at: nowISO(),
      };
      return { ...state, ledger: [...state.ledger, entry] };
    }

    case "SUBMIT_HOMEWORK": {
      const tierDef = state.homeworkPolicy.find((t) => t.tier === action.tier);
      const submission = {
        id: uid("hw"),
        tenant_id: state.tenant.id,
        student_id: action.studentId,
        class_id: action.classId,
        completion_tier: action.tier,
        sticker_count: tierDef ? tierDef.count : 0,
        approval_status: "pending" as const,
        approver_id: null,
        submitted_at: nowISO(),
        approved_at: null,
      };
      return { ...state, homeworkSubmissions: [...state.homeworkSubmissions, submission] };
    }

    case "APPROVE_HOMEWORK": {
      const submission = state.homeworkSubmissions.find((h) => h.id === action.submissionId);
      if (!submission) return state;
      const updatedSubmissions = state.homeworkSubmissions.map((h) =>
        h.id === action.submissionId
          ? { ...h, approval_status: "approved" as const, approver_id: action.approverId, approved_at: nowISO() }
          : h
      );
      const entry = {
        id: uid("led"),
        tenant_id: state.tenant.id,
        student_id: submission.student_id,
        class_id: submission.class_id,
        source_type: "homework" as const,
        source_id: submission.id,
        count: submission.sticker_count,
        status: "active" as const,
        actor_teacher_id: action.approverId,
        rollback_reason: null,
        rollback_at: null,
        created_at: nowISO(),
      };
      return { ...state, homeworkSubmissions: updatedSubmissions, ledger: [...state.ledger, entry] };
    }

    case "REJECT_HOMEWORK": {
      return {
        ...state,
        homeworkSubmissions: state.homeworkSubmissions.map((h) =>
          h.id === action.submissionId ? { ...h, approval_status: "rejected" as const } : h
        ),
      };
    }

    case "SUBMIT_PRAISE": {
      const request = {
        id: uid("pr"),
        tenant_id: state.tenant.id,
        student_id: action.studentId,
        class_id: action.classId,
        category: null,
        reason: action.reason,
        sticker_count: null,
        approval_status: "pending" as const,
        approver_id: null,
        requested_at: nowISO(),
        approved_at: null,
      };
      return { ...state, praiseRequests: [...state.praiseRequests, request] };
    }

    case "APPROVE_PRAISE": {
      const request = state.praiseRequests.find((p) => p.id === action.requestId);
      if (!request) return state;
      const updated = state.praiseRequests.map((p) =>
        p.id === action.requestId
          ? { ...p, approval_status: "approved" as const, approver_id: action.approverId, sticker_count: action.count, approved_at: nowISO() }
          : p
      );
      const entry = {
        id: uid("led"),
        tenant_id: state.tenant.id,
        student_id: request.student_id,
        class_id: request.class_id ?? state.classes.find((c) => c.is_default)?.id ?? state.classes[0].id,
        source_type: "praise" as const,
        source_id: request.id,
        count: action.count,
        status: "active" as const,
        actor_teacher_id: action.approverId,
        rollback_reason: null,
        rollback_at: null,
        created_at: nowISO(),
      };
      return { ...state, praiseRequests: updated, ledger: [...state.ledger, entry] };
    }

    case "REJECT_PRAISE": {
      return {
        ...state,
        praiseRequests: state.praiseRequests.map((p) =>
          p.id === action.requestId ? { ...p, approval_status: "rejected" as const } : p
        ),
      };
    }

    case "ROLLBACK_LEDGER": {
      return {
        ...state,
        ledger: state.ledger.map((l) =>
          l.id === action.ledgerId
            ? { ...l, status: "rolled_back" as const, rollback_reason: action.reason, rollback_at: nowISO() }
            : l
        ),
      };
    }

    case "REQUEST_ENROLLMENT": {
      const newRows: Enrollment[] = action.classIds
        .filter((classId) => !state.enrollments.some((e) => e.student_id === action.studentId && e.class_id === classId))
        .map((classId) => ({
          id: uid("enr"),
          tenant_id: state.tenant.id,
          student_id: action.studentId,
          class_id: classId,
          status: "pending" as const,
          requested_at: nowISO(),
          approved_at: null,
          approver_id: null,
        }));
      return { ...state, enrollments: [...state.enrollments, ...newRows] };
    }

    case "APPROVE_ENROLLMENT": {
      return {
        ...state,
        enrollments: state.enrollments.map((e) =>
          e.id === action.enrollmentId
            ? { ...e, status: "approved" as const, approved_at: nowISO(), approver_id: action.approverId }
            : e
        ),
      };
    }

    case "REJECT_ENROLLMENT": {
      return {
        ...state,
        enrollments: state.enrollments.map((e) =>
          e.id === action.enrollmentId ? { ...e, status: "rejected" as const } : e
        ),
      };
    }

    case "WITHDRAW_ENROLLMENT": {
      return { ...state, enrollments: state.enrollments.filter((e) => e.id !== action.enrollmentId) };
    }

    case "ADD_CLASS": {
      const newClass: ClassRoom = {
        id: uid("class"),
        tenant_id: state.tenant.id,
        name: action.name,
        attendance_time: action.attendanceTime,
        is_default: false,
        special_start: action.specialStart,
        special_end: action.specialEnd,
        ranking_unit: action.rankingUnit,
        status: "active",
        created_at: nowISO(),
        updated_at: nowISO(),
      };
      const rankingConfig = {
        id: uid("rpc"),
        tenant_id: state.tenant.id,
        class_id: newClass.id,
        unit: action.rankingUnit,
        custom_days: null,
        updated_at: nowISO(),
      };
      return {
        ...state,
        classes: [...state.classes, newClass],
        rankingPeriodConfigs: [...state.rankingPeriodConfigs, rankingConfig],
      };
    }

    case "UPDATE_CLASS_ATTENDANCE_TIME": {
      return {
        ...state,
        classes: state.classes.map((c) =>
          c.id === action.classId ? { ...c, attendance_time: action.attendanceTime, updated_at: nowISO() } : c
        ),
      };
    }

    case "SET_ATTENDANCE_POLICY": {
      return { ...state, attendancePolicy: action.tiers };
    }

    case "SET_HOMEWORK_POLICY": {
      return { ...state, homeworkPolicy: action.tiers, homeworkGradingMode: action.mode };
    }

    case "ADD_NOTICE": {
      return {
        ...state,
        notices: [
          ...state.notices,
          {
            id: uid("notice"),
            tenant_id: state.tenant.id,
            title: action.title,
            content: action.content,
            pinned: action.pinned,
            author_teacher_id: action.authorId,
            created_at: nowISO(),
          },
        ],
      };
    }

    case "SET_NOTICE_PIN": {
      return {
        ...state,
        notices: state.notices.map((n) => (n.id === action.noticeId ? { ...n, pinned: action.pinned } : n)),
      };
    }

    case "DELETE_NOTICE": {
      return { ...state, notices: state.notices.filter((n) => n.id !== action.noticeId) };
    }

    case "SET_RANKING_UNIT": {
      const customDays = action.customDays ?? null;
      const exists = state.rankingPeriodConfigs.some((c) => c.class_id === action.classId);
      if (exists) {
        return {
          ...state,
          rankingPeriodConfigs: state.rankingPeriodConfigs.map((c) =>
            c.class_id === action.classId ? { ...c, unit: action.unit, custom_days: customDays, updated_at: nowISO() } : c
          ),
        };
      }
      return {
        ...state,
        rankingPeriodConfigs: [
          ...state.rankingPeriodConfigs,
          { id: uid("rpc"), tenant_id: state.tenant.id, class_id: action.classId, unit: action.unit, custom_days: customDays, updated_at: nowISO() },
        ],
      };
    }

    case "ADD_REWARD_CAMPAIGN": {
      const campaign: RewardCampaign = {
        id: uid("camp"),
        tenant_id: state.tenant.id,
        class_id: action.classId,
        period_start: action.periodStart,
        period_end: action.periodEnd,
        target_distribution: { type: action.distributionType, value: action.distributionValue },
        status: "active",
        created_at: nowISO(),
      };
      const item: RewardItem = {
        id: uid("item"),
        tenant_id: state.tenant.id,
        campaign_id: campaign.id,
        title: action.itemTitle,
        image_url: action.itemImageUrl,
        link_url: null,
        qty: action.itemQty,
      };
      return {
        ...state,
        rewardCampaigns: [...state.rewardCampaigns, campaign],
        rewardItems: [...state.rewardItems, item],
      };
    }

    case "UPDATE_REWARD_CAMPAIGN": {
      return {
        ...state,
        rewardCampaigns: state.rewardCampaigns.map((c) =>
          c.id === action.campaignId
            ? {
                ...c,
                target_distribution: { type: action.distributionType, value: action.distributionValue },
                period_start: action.periodStart,
                period_end: action.periodEnd,
              }
            : c
        ),
      };
    }

    case "UPDATE_REWARD_ITEM": {
      return {
        ...state,
        rewardItems: state.rewardItems.map((i) =>
          i.id === action.itemId ? { ...i, title: action.title, qty: action.qty, image_url: action.imageUrl } : i
        ),
      };
    }

    case "CLAIM_REWARD": {
      return {
        ...state,
        rewardClaims: [
          ...state.rewardClaims,
          {
            id: uid("claim"),
            tenant_id: state.tenant.id,
            item_id: action.itemId,
            student_id: action.studentId,
            rank_at_claim: action.rank,
            claimed_at: nowISO(),
          },
        ],
      };
    }

    case "ADD_TEACHER": {
      return {
        ...state,
        teachers: [
          ...state.teachers,
          {
            id: uid("teacher"),
            tenant_id: state.tenant.id,
            role: "assistant",
            name: action.name,
            email: action.email,
            invited_by: action.invitedBy,
            created_at: nowISO(),
          },
        ],
      };
    }

    case "REMOVE_TEACHER": {
      return { ...state, teachers: state.teachers.filter((t) => t.id !== action.teacherId) };
    }

    case "SET_TEACHER_PERMISSION": {
      return { ...state, teachers: state.teachers.map((t) => t.id === action.teacherId ? { ...t, permissions: { ...DEFAULT_TEACHER_PERMISSIONS, ...t.permissions, [action.permission]: action.enabled } } : t) };
    }

    case "ADD_INVITE_LINK": {
      return {
        ...state,
        inviteLinks: [
          ...state.inviteLinks,
          {
            id: uid("invite"),
            tenant_id: state.tenant.id,
            issuer_teacher_id: action.issuerTeacherId,
            token: action.token,
            status: "active",
            expires_at: null,
            created_at: nowISO(),
            invitee_role: action.inviteeRole,
          },
        ],
      };
    }

    case "UPDATE_STUDENT_PROFILE": {
      return {
        ...state,
        students: state.students.map((s) =>
          s.id === action.studentId
            ? { ...s, name: action.name, age: action.age, profile_image_url: action.profileImageUrl }
            : s
        ),
      };
    }

    default:
      return state;
  }
}
