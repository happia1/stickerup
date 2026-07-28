import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import type { AdminStudentRow } from "@/lib/data/admin-students.types";
import type { TeacherPermissions } from "@/lib/types";
import { effectiveActiveLedger } from "@/lib/sticker-ledger";

async function getContext(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return { error: NextResponse.json({ error: auth.error ?? "로그인이 필요합니다." }, { status: 401 }) };
  const db = createSupabaseAdminClient();
  const teacher = await db.from("teachers").select("id, tenant_id, role, permissions").eq("id", auth.user.id).maybeSingle();
  if (teacher.error || !teacher.data) return { error: NextResponse.json({ error: "선생님 계정이 필요합니다." }, { status: 403 }) };
  const permissions = teacher.data.permissions as TeacherPermissions | null;
  if (teacher.data.role !== "owner" && permissions?.students === false) {
    return { error: NextResponse.json({ error: "학생 관리 권한이 없습니다." }, { status: 403 }) };
  }
  return { db, teacher: teacher.data };
}

export async function GET(request: Request) {
  const context = await getContext(request); if ("error" in context) return context.error;
  const { db, teacher } = context;
  const [students, classes, enrollments, ledger, connections, prizeLikes, products] = await Promise.all([
    db.from("students").select("id, name, birth_date, invited_by_teacher_id, created_at").eq("tenant_id", teacher.tenant_id),
    db.from("classes").select("id, name, is_default, status").eq("tenant_id", teacher.tenant_id),
    db.from("enrollments").select("student_id, class_id, status, requested_at").eq("tenant_id", teacher.tenant_id),
    db.from("sticker_ledger").select("student_id, source_type, count, status, created_at").eq("tenant_id", teacher.tenant_id),
    db.from("student_connection_requests").select("student_id, status, created_at").order("created_at", { ascending: false }),
    db.from("prize_product_likes").select("student_id, product_id").eq("tenant_id", teacher.tenant_id),
    db.from("product_catalog").select("id, title, image_url").eq("tenant_id", teacher.tenant_id),
  ]);
  const prizeLikesError = prizeLikes.error?.code === "42P01" ? null : prizeLikes.error;
  const error = students.error ?? classes.error ?? enrollments.error ?? ledger.error ?? connections.error ?? prizeLikesError ?? products.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const classNameById = new Map((classes.data ?? []).map((row) => [row.id, row.name]));
  const effectiveLedger = effectiveActiveLedger(ledger.data ?? []);
  const productById = new Map((products.data ?? []).map((row) => [row.id, row]));
  const rows: AdminStudentRow[] = (students.data ?? []).map((student) => {
    const studentEnrollments = (enrollments.data ?? []).filter((row) => row.student_id === student.id);
    const pendingConnection = (connections.data ?? []).find((row) => row.student_id === student.id && row.status === "pending");
    const connectionStatus = student.invited_by_teacher_id ? "connected" as const : pendingConnection ? "pending" as const : "unconnected" as const;
    const approvedMemberships = studentEnrollments.filter((row) => row.status === "approved").flatMap((row) => {
      const classInfo = (classes.data ?? []).find((candidate) => candidate.id === row.class_id);
      return classInfo ? [{ classId: classInfo.id, className: classInfo.name, isDefault: classInfo.is_default }] : [];
    });
    return {
      id: student.id,
      name: student.name,
      birthDate: student.birth_date,
      connectionStatus,
      classNames: studentEnrollments.filter((row) => row.status === "approved").map((row) => classNameById.get(row.class_id)).filter((name): name is string => Boolean(name)),
      classMemberships: approvedMemberships,
      totalStickers: effectiveLedger.filter((row) => row.student_id === student.id).reduce((sum, row) => sum + row.count, 0),
      requestedAt: pendingConnection?.created_at ?? student.created_at,
      wantedPrizes: (prizeLikes.data ?? []).filter((row) => row.student_id === student.id).flatMap((row) => {
        const product = productById.get(row.product_id);
        return product ? [{ id: product.id, title: product.title, imageUrl: product.image_url }] : [];
      }),
    };
  }).sort((a, b) => Number(b.connectionStatus === "pending") - Number(a.connectionStatus === "pending") || (b.requestedAt ?? "").localeCompare(a.requestedAt ?? ""));

  return NextResponse.json({
    students: rows,
    availableClasses: (classes.data ?? []).filter((row) => !row.is_default && row.status === "active").map((row) => ({ id: row.id, name: row.name })),
    pendingConnectionCount: rows.filter((row) => row.connectionStatus === "pending").length,
    canDeleteStudents: teacher.role === "owner",
  });
}

export async function PATCH(request: Request) {
  const context = await getContext(request); if ("error" in context) return context.error;
  const { db, teacher } = context;
  const body = await request.json() as { studentId?: string; classId?: string; classIds?: string[]; action?: "approve" | "disconnect" | "revoke_pending" | "delete" | "remove_class" | "add_classes" };
  if (!body.studentId || !body.action || !["approve", "disconnect", "revoke_pending", "delete", "remove_class", "add_classes"].includes(body.action)) {
    return NextResponse.json({ error: "학생과 처리 작업을 확인해주세요." }, { status: 400 });
  }
  const student = await db.from("students").select("id").eq("id", body.studentId).eq("tenant_id", teacher.tenant_id).maybeSingle();
  if (student.error || !student.data) return NextResponse.json({ error: "학생을 찾을 수 없습니다." }, { status: 404 });
  const studentId = student.data.id;

  if (body.action === "add_classes") {
    const classIds = [...new Set(body.classIds ?? [])];
    if (!classIds.length) return NextResponse.json({ error: "추가할 특강반을 선택해 주세요." }, { status: 400 });
    const classes = await db.from("classes").select("id").eq("tenant_id", teacher.tenant_id).eq("is_default", false).eq("status", "active").in("id", classIds);
    if (classes.error || classes.data.length !== classIds.length) return NextResponse.json({ error: "추가할 수 없는 반이 포함되어 있습니다." }, { status: 400 });
    const approvedAt = new Date().toISOString();
    const rows = classIds.map((classId) => ({ tenant_id: teacher.tenant_id, student_id: studentId, class_id: classId, status: "approved", approved_at: approvedAt, approver_id: teacher.id }));
    const added = await db.from("enrollments").upsert(rows, { onConflict: "student_id,class_id" });
    if (added.error) return NextResponse.json({ error: added.error.message }, { status: 400 });
  } else if (body.action === "remove_class") {
    if (!body.classId) return NextResponse.json({ error: "해지할 반을 확인해주세요." }, { status: 400 });
    const classInfo = await db.from("classes").select("is_default").eq("id", body.classId).eq("tenant_id", teacher.tenant_id).maybeSingle();
    if (!classInfo.data || classInfo.data.is_default) return NextResponse.json({ error: "기본 소속 반은 해지할 수 없습니다." }, { status: 400 });
    const removed = await db.from("enrollments").delete().eq("student_id", student.data.id).eq("class_id", body.classId).eq("tenant_id", teacher.tenant_id);
    if (removed.error) return NextResponse.json({ error: removed.error.message }, { status: 400 });
  } else if (body.action === "delete") {
    if (teacher.role !== "owner") return NextResponse.json({ error: "관리자만 학생을 삭제할 수 있습니다." }, { status: 403 });
    const deleted = await db.auth.admin.deleteUser(student.data.id);
    if (deleted.error) return NextResponse.json({ error: deleted.error.message }, { status: 400 });
  } else if (body.action === "approve") {
    const updateStudent = await db.from("students").update({ invited_by_teacher_id: teacher.id }).eq("id", student.data.id);
    if (updateStudent.error) return NextResponse.json({ error: updateStudent.error.message }, { status: 400 });
    const defaultClass = await db.from("classes").select("id").eq("tenant_id", teacher.tenant_id).eq("is_default", true).maybeSingle();
    if (defaultClass.data) {
      const enrollment = await db.from("enrollments").upsert({ tenant_id: teacher.tenant_id, student_id: student.data.id, class_id: defaultClass.data.id, status: "approved", approved_at: new Date().toISOString(), approver_id: teacher.id }, { onConflict: "student_id,class_id" });
      if (enrollment.error) return NextResponse.json({ error: enrollment.error.message }, { status: 400 });
    }
    await db.from("student_connection_requests").update({ status: "approved", approved_by: teacher.id, approved_at: new Date().toISOString() }).eq("student_id", student.data.id).eq("status", "pending");
  } else if (body.action === "disconnect") {
    const updateStudent = await db.from("students").update({ invited_by_teacher_id: null }).eq("id", student.data.id);
    if (updateStudent.error) return NextResponse.json({ error: updateStudent.error.message }, { status: 400 });
    await db.from("student_connection_requests").update({ status: "revoked" }).eq("student_id", student.data.id).eq("status", "approved");
  } else {
    await db.from("student_connection_requests").update({ status: "revoked" }).eq("student_id", student.data.id).eq("status", "pending");
    await db.from("enrollments").update({ status: "rejected", approved_at: null, approver_id: null }).eq("student_id", student.data.id).eq("tenant_id", teacher.tenant_id).eq("status", "pending");
  }
  return NextResponse.json({ ok: true });
}
