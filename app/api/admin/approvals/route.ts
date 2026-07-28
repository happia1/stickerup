import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import { DEFAULT_ATTENDANCE_TIERS, DEFAULT_HOMEWORK_TIERS, type TeacherPermissions } from "@/lib/types";
import { koreaDateKey } from "@/lib/korea-date";

type ApprovalType = "attendance" | "homework" | "praise";

async function getAuthorizedTeacher(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return { error: auth.error, status: 401 } as const;
  const db = createSupabaseAdminClient();
  const teacher = await db.from("teachers").select("id, tenant_id, role, permissions").eq("id", auth.user.id).maybeSingle();
  if (!teacher.data) return { error: "선생님 계정이 필요합니다.", status: 403 } as const;
  const permissions = teacher.data.permissions as TeacherPermissions | null;
  if (teacher.data.role !== "owner" && permissions?.approvals === false) return { error: "승인 권한이 없습니다.", status: 403 } as const;
  return { db, teacher: teacher.data } as const;
}

function sourceTimestamp(checkDate: string) {
  return `${checkDate}T12:00:00+09:00`;
}

export async function PATCH(request: Request) {
  const authorized = await getAuthorizedTeacher(request);
  if ("error" in authorized) return NextResponse.json({ error: authorized.error }, { status: authorized.status });
  const { db, teacher } = authorized;
  const body = await request.json() as { type?: ApprovalType; requestId?: string; action?: "approve" | "reject"; count?: number; tier?: string };
  if (!body.type || !body.requestId || !body.action) return NextResponse.json({ error: "승인 요청 정보를 확인해주세요." }, { status: 400 });
  const table = body.type === "attendance" ? "attendance_records" : body.type === "homework" ? "homework_submissions" : "praise_requests";
  const row = await db.from(table).select("*").eq("id", body.requestId).eq("tenant_id", teacher.tenant_id).eq("approval_status", "pending").maybeSingle();
  if (!row.data) return NextResponse.json({ error: "처리할 대기 요청을 찾을 수 없습니다." }, { status: 404 });
  if (body.action === "reject") {
    const rejectedAt = new Date().toISOString();
    const rejected = await db.from(table).update({ approval_status: "rejected", approver_id: teacher.id, approved_at: rejectedAt }).eq("id", body.requestId);
    if (rejected.error) return NextResponse.json({ error: rejected.error.message }, { status: 400 });
    let rejectionClassId = row.data.class_id as string | null;
    if (!rejectionClassId) {
      const defaultClass = await db.from("classes").select("id").eq("tenant_id", teacher.tenant_id).eq("is_default", true).maybeSingle();
      rejectionClassId = defaultClass.data?.id ?? null;
    }
    if (!rejectionClassId) {
      await db.from(table).update({ approval_status: "pending", approver_id: null, approved_at: null }).eq("id", body.requestId);
      return NextResponse.json({ error: "반려 이력을 기록할 기본 소속 반이 없습니다." }, { status: 400 });
    }
    const detail = body.type === "attendance"
      ? `${DEFAULT_ATTENDANCE_TIERS.find((item) => item.tier === row.data.tier)?.label ?? row.data.tier} · 신청 ${row.data.sticker_count}장`
      : body.type === "homework"
        ? `${DEFAULT_HOMEWORK_TIERS.find((item) => item.tier === row.data.completion_tier)?.label ?? row.data.completion_tier} · 신청 ${row.data.sticker_count}장`
        : row.data.reason;
    const audit = await db.from("sticker_ledger").insert({
      tenant_id: teacher.tenant_id,
      student_id: row.data.student_id,
      class_id: rejectionClassId,
      source_type: body.type,
      source_id: body.requestId,
      count: 0,
      status: "rolled_back",
      actor_teacher_id: teacher.id,
      rollback_reason: `승인 반려: ${detail}`,
      rollback_at: rejectedAt,
      created_at: rejectedAt,
    });
    if (audit.error) {
      await db.from(table).update({ approval_status: "pending", approver_id: null, approved_at: null }).eq("id", body.requestId);
      return NextResponse.json({ error: audit.error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }
  const count = Math.min(100, Math.max(0, Math.round(body.count ?? row.data.sticker_count ?? 2)));
  if (body.type === "attendance" && body.tier && !DEFAULT_ATTENDANCE_TIERS.some((item) => item.tier === body.tier)) return NextResponse.json({ error: "출석 지급 기준을 확인해 주세요." }, { status: 400 });
  if (body.type === "homework" && body.tier && !DEFAULT_HOMEWORK_TIERS.some((item) => item.tier === body.tier)) return NextResponse.json({ error: "과제 완료율을 확인해 주세요." }, { status: 400 });
  let classId = row.data.class_id as string | null;
  if (!classId) {
    const defaultClass = await db.from("classes").select("id").eq("tenant_id", teacher.tenant_id).eq("is_default", true).maybeSingle();
    classId = defaultClass.data?.id ?? null;
  }
  if (!classId) return NextResponse.json({ error: "스티커를 지급할 기본 소속 반이 없습니다." }, { status: 400 });
  const requestChanges = {
    approval_status: "approved",
    approver_id: teacher.id,
    approved_at: new Date().toISOString(),
    sticker_count: count,
    ...(body.type === "attendance" && body.tier ? { tier: body.tier } : {}),
    ...(body.type === "homework" && body.tier ? { completion_tier: body.tier } : {}),
  };
  const approved = await db.from(table).update(requestChanges).eq("id", body.requestId);
  if (approved.error) return NextResponse.json({ error: approved.error.message }, { status: 400 });
  const ledger = await db.from("sticker_ledger").insert({ tenant_id: teacher.tenant_id, student_id: row.data.student_id, class_id: classId, source_type: body.type, source_id: body.requestId, count, status: "active", actor_teacher_id: teacher.id, created_at: row.data.check_date ? sourceTimestamp(row.data.check_date) : undefined });
  if (ledger.error) {
    await db.from(table).update({ approval_status: "pending", approver_id: null, approved_at: null }).eq("id", body.requestId);
    return NextResponse.json({ error: ledger.error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const authorized = await getAuthorizedTeacher(request);
  if ("error" in authorized) return NextResponse.json({ error: authorized.error }, { status: authorized.status });
  const { db, teacher } = authorized;
  const body = await request.json() as { type?: "attendance" | "homework"; studentId?: string; classId?: string; checkDate?: string; tier?: string; count?: number };
  if (!body.type || !body.studentId || !body.checkDate || !body.tier || !/^\d{4}-\d{2}-\d{2}$/.test(body.checkDate) || body.checkDate > koreaDateKey()) {
    return NextResponse.json({ error: "학생, 날짜, 신청 내용을 확인해 주세요." }, { status: 400 });
  }
  const student = await db.from("students").select("id").eq("id", body.studentId).eq("tenant_id", teacher.tenant_id).maybeSingle();
  if (!student.data) return NextResponse.json({ error: "이 학원의 학생을 찾을 수 없습니다." }, { status: 404 });

  const policy = body.type === "attendance" ? DEFAULT_ATTENDANCE_TIERS : DEFAULT_HOMEWORK_TIERS;
  const tier = policy.find((item) => item.tier === body.tier);
  if (!tier) return NextResponse.json({ error: "지급 기준을 확인해 주세요." }, { status: 400 });
  const count = Math.min(100, Math.max(0, Math.round(body.count ?? tier.count)));
  let classId = body.classId;
  if (body.type === "attendance") {
    const regularClass = await db.from("classes").select("id").eq("tenant_id", teacher.tenant_id).eq("is_default", true).eq("status", "active").maybeSingle();
    classId = regularClass.data?.id;
  } else {
    if (!classId) return NextResponse.json({ error: "과제 반을 선택해 주세요." }, { status: 400 });
    const enrollment = await db.from("enrollments").select("id").eq("student_id", body.studentId).eq("class_id", classId).eq("status", "approved").maybeSingle();
    const classRoom = await db.from("classes").select("is_default").eq("id", classId).eq("tenant_id", teacher.tenant_id).maybeSingle();
    if (!enrollment.data || !classRoom.data || classRoom.data.is_default) return NextResponse.json({ error: "학생이 승인된 특강반만 과제를 등록할 수 있습니다." }, { status: 400 });
  }
  if (!classId) return NextResponse.json({ error: "스티커를 지급할 반을 찾을 수 없습니다." }, { status: 400 });

  const table = body.type === "attendance" ? "attendance_records" : "homework_submissions";
  let duplicateQuery = db.from(table).select("id, approval_status").eq("student_id", body.studentId).eq("check_date", body.checkDate);
  if (body.type === "homework") duplicateQuery = duplicateQuery.eq("class_id", classId);
  const duplicate = await duplicateQuery.limit(1).maybeSingle();
  if (duplicate.error) return NextResponse.json({ error: duplicate.error.message }, { status: 400 });
  if (duplicate.data && duplicate.data.approval_status !== "rejected") return NextResponse.json({ error: "해당 날짜에 이미 신청 또는 지급된 기록이 있습니다." }, { status: 409 });

  const timestamp = sourceTimestamp(body.checkDate);
  let source;
  if (body.type === "attendance") {
    const values = { tenant_id: teacher.tenant_id, student_id: body.studentId, class_id: classId, check_date: body.checkDate, checked_at: timestamp, tier: body.tier, sticker_count: count, approval_status: "approved", approver_id: teacher.id, approved_at: new Date().toISOString() };
    source = duplicate.data
      ? await db.from("attendance_records").update(values).eq("id", duplicate.data.id).select("id").single()
      : await db.from("attendance_records").insert(values).select("id").single();
  } else {
    const values = { tenant_id: teacher.tenant_id, student_id: body.studentId, class_id: classId, check_date: body.checkDate, submitted_at: timestamp, completion_tier: body.tier, sticker_count: count, approval_status: "approved", approver_id: teacher.id, approved_at: new Date().toISOString() };
    source = duplicate.data
      ? await db.from("homework_submissions").update(values).eq("id", duplicate.data.id).select("id").single()
      : await db.from("homework_submissions").insert(values).select("id").single();
  }
  if (source.error || !source.data) return NextResponse.json({ error: source.error?.message ?? "기록을 저장하지 못했습니다." }, { status: 400 });
  const ledger = await db.from("sticker_ledger").insert({ tenant_id: teacher.tenant_id, student_id: body.studentId, class_id: classId, source_type: body.type, source_id: source.data.id, count, status: "active", actor_teacher_id: teacher.id, created_at: timestamp });
  if (ledger.error) {
    await db.from(table).update({ approval_status: "rejected", approver_id: null, approved_at: null }).eq("id", source.data.id);
    return NextResponse.json({ error: ledger.error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
