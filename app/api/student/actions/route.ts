import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import { DEFAULT_ATTENDANCE_TIERS, DEFAULT_HOMEWORK_TIERS } from "@/lib/types";
import { koreaDateKey } from "@/lib/korea-date";

export async function POST(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const db = createSupabaseAdminClient();
  const student = await db.from("students").select("id, tenant_id").eq("id", auth.user.id).maybeSingle();
  if (student.error || !student.data) return NextResponse.json({ error: "학생 계정이 필요합니다." }, { status: 403 });
  const studentData = student.data;
  const body = await request.json() as { action?: "attendance" | "homework" | "praise" | "enrollment" | "withdraw-enrollment" | "profile"; classId?: string | null; classIds?: string[]; enrollmentId?: string; tier?: string; reason?: string; name?: string; birthDate?: string | null; profileImageUrl?: string | null };

  if (body.action === "profile") {
    const name = body.name?.trim();
    if (!name) return NextResponse.json({ error: "이름을 입력해 주세요." }, { status: 400 });
    if (body.birthDate && (!/^\d{4}-\d{2}-\d{2}$/.test(body.birthDate) || body.birthDate > koreaDateKey())) return NextResponse.json({ error: "올바른 생년월일을 입력해 주세요." }, { status: 400 });
    if (body.profileImageUrl && !body.profileImageUrl.startsWith("data:image/")) return NextResponse.json({ error: "올바른 프로필 이미지를 선택해 주세요." }, { status: 400 });
    const result = await db.from("students").update({ name, birth_date: body.birthDate || null, profile_image_url: body.profileImageUrl ?? null }).eq("id", studentData.id);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "withdraw-enrollment") {
    if (!body.enrollmentId) return NextResponse.json({ error: "취소할 반 신청을 확인해 주세요." }, { status: 400 });
    const enrollment = await db.from("enrollments").select("id, class_id, status").eq("id", body.enrollmentId).eq("student_id", studentData.id).maybeSingle();
    if (!enrollment.data) return NextResponse.json({ error: "취소할 반 신청을 찾지 못했어요." }, { status: 404 });
    const classRoom = await db.from("classes").select("is_default").eq("id", enrollment.data.class_id).eq("tenant_id", studentData.tenant_id).maybeSingle();
    if (!classRoom.data || classRoom.data.is_default) return NextResponse.json({ error: "정규반은 신청 취소할 수 없어요." }, { status: 400 });
    const result = await db.from("enrollments").delete().eq("id", enrollment.data.id).eq("student_id", studentData.id);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "enrollment") {
    const classIds = [...new Set(body.classIds ?? [])];
    if (!classIds.length) return NextResponse.json({ error: "신청할 특강반을 선택해 주세요." }, { status: 400 });
    const classes = await db.from("classes").select("id").eq("tenant_id", studentData.tenant_id).eq("is_default", false).eq("status", "active").in("id", classIds);
    if (classes.error || classes.data.length !== classIds.length) return NextResponse.json({ error: "신청할 수 없는 반이 포함되어 있습니다." }, { status: 400 });
    const requestedAt = new Date().toISOString();
    const rows = classIds.map((classId) => ({ tenant_id: studentData.tenant_id, student_id: studentData.id, class_id: classId, status: "approved", requested_at: requestedAt, approved_at: requestedAt, approver_id: null }));
    const result = await db.from("enrollments").upsert(rows, { onConflict: "student_id,class_id" }).select("*");
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
    return NextResponse.json({ enrollments: result.data });
  }

  if (body.action === "praise") {
    const reason = body.reason?.trim();
    if (!reason) return NextResponse.json({ error: "칭찬 사유를 입력해주세요." }, { status: 400 });
    const checkDate = koreaDateKey();
    const duplicate = await db.from("praise_requests").select("id").eq("student_id", student.data.id).gte("requested_at", `${checkDate}T00:00:00+09:00`).lte("requested_at", `${checkDate}T23:59:59.999+09:00`).neq("approval_status", "rejected").limit(1).maybeSingle();
    if (duplicate.error) return NextResponse.json({ error: duplicate.error.message }, { status: 400 });
    if (duplicate.data) return NextResponse.json({ error: "칭찬 스티커는 하루에 한 번만 요청할 수 있어요." }, { status: 409 });
    const result = await db.from("praise_requests").insert({ tenant_id: student.data.tenant_id, student_id: student.data.id, class_id: null, reason, approval_status: "pending" }).select("*").single();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
    return NextResponse.json({ request: result.data });
  }

  if (body.action === "homework") {
    if (!body.classId || !body.tier) return NextResponse.json({ error: "특강반과 과제 완료율을 선택해주세요." }, { status: 400 });
    const [enrollment, classRoom] = await Promise.all([
      db.from("enrollments").select("id").eq("student_id", student.data.id).eq("class_id", body.classId).eq("status", "approved").maybeSingle(),
      db.from("classes").select("id, is_default").eq("id", body.classId).eq("tenant_id", studentData.tenant_id).maybeSingle(),
    ]);
    if (!enrollment.data || !classRoom.data || classRoom.data.is_default) return NextResponse.json({ error: "과제를 제출할 승인된 특강반을 선택해주세요." }, { status: 400 });
    const tier = DEFAULT_HOMEWORK_TIERS.find((item) => item.tier === body.tier);
    if (!tier) return NextResponse.json({ error: "숙제 완료율을 확인해주세요." }, { status: 400 });
    const checkDate = koreaDateKey();
    const duplicate = await db.from("homework_submissions").select("id").eq("student_id", student.data.id).eq("class_id", body.classId).eq("check_date", checkDate).limit(1).maybeSingle();
    if (duplicate.error) return NextResponse.json({ error: duplicate.error.message }, { status: 400 });
    if (duplicate.data) return NextResponse.json({ error: "과제는 반별로 하루에 한 번만 체크할 수 있어요." }, { status: 409 });
    const approvedAt = new Date().toISOString();
    const result = await db.from("homework_submissions").insert({ tenant_id: student.data.tenant_id, student_id: student.data.id, class_id: body.classId, completion_tier: tier.tier, sticker_count: tier.count, approval_status: "approved", approved_at: approvedAt, check_date: checkDate }).select("*").single();
    if (result.error) return NextResponse.json({ error: result.error.code === "23505" ? "과제는 반별로 하루에 한 번만 체크할 수 있어요." : result.error.message }, { status: result.error.code === "23505" ? 409 : 400 });
    const ledger = await db.from("sticker_ledger").insert({ tenant_id: student.data.tenant_id, student_id: student.data.id, class_id: body.classId, source_type: "homework", source_id: result.data.id, count: tier.count, status: "active", actor_teacher_id: null });
    if (ledger.error) {
      await db.from("homework_submissions").delete().eq("id", result.data.id);
      return NextResponse.json({ error: ledger.error.message }, { status: 400 });
    }
    return NextResponse.json({ submission: result.data });
  }

  if (body.action === "attendance") {
    const tier = DEFAULT_ATTENDANCE_TIERS.find((item) => item.tier === "on_time")!;
    const checkDate = koreaDateKey();
    const regularClass = await db.from("classes").select("id").eq("tenant_id", studentData.tenant_id).eq("is_default", true).eq("status", "active").maybeSingle();
    if (!regularClass.data) return NextResponse.json({ error: "정규반 정보를 찾을 수 없어요." }, { status: 400 });
    const duplicate = await db.from("attendance_records").select("id").eq("student_id", student.data.id).eq("check_date", checkDate).limit(1).maybeSingle();
    if (duplicate.error) return NextResponse.json({ error: duplicate.error.message }, { status: 400 });
    if (duplicate.data) return NextResponse.json({ error: "출석은 하루에 한 번만 체크할 수 있어요." }, { status: 409 });
    const attendance = await db.from("attendance_records").insert({ tenant_id: student.data.tenant_id, student_id: student.data.id, class_id: regularClass.data.id, tier: tier.tier, sticker_count: tier.count, check_date: checkDate }).select("id, created_at").single();
    if (attendance.error) return NextResponse.json({ error: attendance.error.code === "23505" ? "출석은 하루에 한 번만 체크할 수 있어요." : attendance.error.message }, { status: attendance.error.code === "23505" ? 409 : 400 });
    const ledger = await db.from("sticker_ledger").insert({ tenant_id: student.data.tenant_id, student_id: student.data.id, class_id: regularClass.data.id, source_type: "attendance", source_id: attendance.data.id, count: tier.count, status: "active" });
    if (ledger.error) {
      await db.from("attendance_records").delete().eq("id", attendance.data.id);
      return NextResponse.json({ error: ledger.error.message }, { status: 400 });
    }
    return NextResponse.json({ attendance: attendance.data });
  }

  return NextResponse.json({ error: "지원하지 않는 요청입니다." }, { status: 400 });
}
