import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import type { TeacherPermissions } from "@/lib/types";

type LedgerAction = "adjust" | "rollback";

export async function PATCH(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const db = createSupabaseAdminClient();
  const teacher = await db.from("teachers").select("id, tenant_id, role, permissions").eq("id", auth.user.id).maybeSingle();
  if (!teacher.data) return NextResponse.json({ error: "선생님 계정이 필요합니다." }, { status: 403 });
  const permissions = teacher.data.permissions as TeacherPermissions | null;
  if (teacher.data.role !== "owner" && permissions?.sticker_audit !== true) {
    return NextResponse.json({ error: "스티커 로그 수정 권한이 없습니다." }, { status: 403 });
  }

  const body = await request.json() as { action?: LedgerAction; ledgerId?: string; count?: number; reason?: string };
  const reason = body.reason?.trim();
  if (!body.action || !body.ledgerId || !reason) return NextResponse.json({ error: "수정할 기록과 사유를 입력해 주세요." }, { status: 400 });

  const ledger = await db.from("sticker_ledger").select("*").eq("id", body.ledgerId).eq("tenant_id", teacher.data.tenant_id).eq("status", "active").maybeSingle();
  if (ledger.error) return NextResponse.json({ error: ledger.error.message }, { status: 400 });
  if (!ledger.data) return NextResponse.json({ error: "이미 취소되었거나 찾을 수 없는 스티커 기록입니다." }, { status: 404 });

  const rollbackAt = new Date().toISOString();
  if (body.action === "rollback") {
    const rolledBack = await db.from("sticker_ledger").update({ status: "rolled_back", rollback_reason: reason, rollback_at: rollbackAt }).eq("id", ledger.data.id).eq("status", "active").select("id").maybeSingle();
    if (rolledBack.error) return NextResponse.json({ error: rolledBack.error.message }, { status: 400 });
    if (!rolledBack.data) return NextResponse.json({ error: "다른 관리자가 먼저 처리한 기록입니다." }, { status: 409 });
    return NextResponse.json({ ok: true });
  }

  const count = Math.round(body.count ?? Number.NaN);
  if (!Number.isFinite(count) || count < 0 || count > 100) return NextResponse.json({ error: "스티커 수는 0장부터 100장까지 입력할 수 있습니다." }, { status: 400 });
  if (count === ledger.data.count) return NextResponse.json({ error: "기존과 다른 스티커 수를 입력해 주세요." }, { status: 400 });

  const historyReason = `지급 수정: ${ledger.data.count}장 → ${count}장 · ${reason}`;
  const rolledBack = await db.from("sticker_ledger").update({ status: "rolled_back", rollback_reason: historyReason, rollback_at: rollbackAt }).eq("id", ledger.data.id).eq("status", "active").select("id").maybeSingle();
  if (rolledBack.error) return NextResponse.json({ error: rolledBack.error.message }, { status: 400 });
  if (!rolledBack.data) return NextResponse.json({ error: "다른 관리자가 먼저 처리한 기록입니다." }, { status: 409 });

  const sourceTable = ledger.data.source_type === "attendance" ? "attendance_records" : ledger.data.source_type === "homework" ? "homework_submissions" : "praise_requests";
  const source = await db.from(sourceTable).select("id, sticker_count").eq("id", ledger.data.source_id).eq("tenant_id", teacher.data.tenant_id).maybeSingle();
  if (source.error) {
    await db.from("sticker_ledger").update({ status: "active", rollback_reason: null, rollback_at: null }).eq("id", ledger.data.id);
    return NextResponse.json({ error: source.error.message }, { status: 400 });
  }

  if (source.data) {
    const sourceUpdated = await db.from(sourceTable).update({ sticker_count: count }).eq("id", source.data.id);
    if (sourceUpdated.error) {
      await db.from("sticker_ledger").update({ status: "active", rollback_reason: null, rollback_at: null }).eq("id", ledger.data.id);
      return NextResponse.json({ error: sourceUpdated.error.message }, { status: 400 });
    }
  }

  const replacement = await db.from("sticker_ledger").insert({
    tenant_id: ledger.data.tenant_id,
    student_id: ledger.data.student_id,
    class_id: ledger.data.class_id,
    source_type: ledger.data.source_type,
    source_id: ledger.data.source_id,
    count,
    status: "active",
    actor_teacher_id: teacher.data.id,
    created_at: ledger.data.created_at,
  }).select("id").single();
  if (replacement.error) {
    if (source.data) await db.from(sourceTable).update({ sticker_count: source.data.sticker_count }).eq("id", source.data.id);
    await db.from("sticker_ledger").update({ status: "active", rollback_reason: null, rollback_at: null }).eq("id", ledger.data.id);
    return NextResponse.json({ error: replacement.error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, replacementId: replacement.data.id });
}
