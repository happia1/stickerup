import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import type { Action } from "@/lib/store/types";

export async function POST(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const db = createSupabaseAdminClient();
  const teacher = await db.from("teachers").select("id, tenant_id, role").eq("id", auth.user.id).maybeSingle();
  if (!teacher.data) return NextResponse.json({ error: "선생님 계정이 필요합니다." }, { status: 403 });
  const { action } = await request.json() as { action: Action };
  const tenantId = teacher.data.tenant_id;

  if (action.type === "ADD_CLASS") {
    const created = await db.from("classes").insert({ tenant_id: tenantId, name: action.name, attendance_time: "00:00", is_default: false, special_start: action.specialStart, special_end: action.specialEnd, ranking_unit: action.rankingUnit, status: "active" }).select("id").single();
    if (created.error) return NextResponse.json({ error: created.error.message }, { status: 400 });
    const end = new Date(); const start = new Date(end); start.setDate(end.getDate() - 6);
    const ranking = await db.from("ranking_period_config").insert({ tenant_id: tenantId, class_id: created.data.id, unit: action.rankingUnit, custom_days: null, custom_start: action.rankingUnit === "custom" ? start.toISOString().slice(0, 10) : null, custom_end: action.rankingUnit === "custom" ? end.toISOString().slice(0, 10) : null });
    if (ranking.error) return NextResponse.json({ error: ranking.error.message }, { status: 400 });
  } else if (action.type === "UPDATE_CLASS_NAME") {
    const name = action.name.trim();
    if (!name) return NextResponse.json({ error: "특강반 이름을 입력해 주세요." }, { status: 400 });
    const result = await db.from("classes").update({ name, updated_at: new Date().toISOString() }).eq("id", action.classId).eq("tenant_id", tenantId).eq("is_default", false).select("id").maybeSingle();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
    if (!result.data) return NextResponse.json({ error: "수정할 특강반을 찾을 수 없습니다." }, { status: 404 });
  } else if (action.type === "UPDATE_CLASS_SPECIAL_PERIOD") {
    const result = await db.from("classes").update({ special_start: action.specialStart, special_end: action.specialEnd, status: "active", updated_at: new Date().toISOString() }).eq("id", action.classId).eq("tenant_id", tenantId);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  } else if (action.type === "ADD_NOTICE") {
    const result = await db.from("notices").insert({ tenant_id: tenantId, title: action.title, content: action.content, image_url: action.imageUrl, pinned: action.pinned, author_teacher_id: teacher.data.id });
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  } else if (action.type === "UPDATE_NOTICE") {
    const result = await db.from("notices").update({ title: action.title, content: action.content, image_url: action.imageUrl, pinned: action.pinned }).eq("id", action.noticeId).eq("tenant_id", tenantId);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  } else if (action.type === "SET_NOTICE_PIN") {
    const result = await db.from("notices").update({ pinned: action.pinned }).eq("id", action.noticeId).eq("tenant_id", tenantId);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  } else if (action.type === "DELETE_NOTICE") {
    const result = await db.from("notices").delete().eq("id", action.noticeId).eq("tenant_id", tenantId);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  } else if (action.type === "SET_RANKING_UNIT") {
    const values = { unit: action.unit, custom_days: null, custom_start: action.unit === "custom" ? action.customStart : null, custom_end: action.unit === "custom" ? action.customEnd : null, updated_at: new Date().toISOString() };
    const existing = action.classId ? await db.from("ranking_period_config").select("id").eq("tenant_id", tenantId).eq("class_id", action.classId).maybeSingle() : await db.from("ranking_period_config").select("id").eq("tenant_id", tenantId).is("class_id", null).maybeSingle();
    const result = existing.data ? await db.from("ranking_period_config").update(values).eq("id", existing.data.id) : await db.from("ranking_period_config").insert({ tenant_id: tenantId, class_id: action.classId, ...values });
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  } else if (action.type === "ROLLBACK_LEDGER") {
    const reason = action.reason.trim() || "관리자 지급 취소";
    const result = await db.from("sticker_ledger").update({
      status: "rolled_back",
      rollback_reason: reason,
      rollback_at: new Date().toISOString(),
    }).eq("id", action.ledgerId).eq("tenant_id", tenantId).eq("status", "active").select("id").maybeSingle();
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
    if (!result.data) return NextResponse.json({ error: "이미 취소되었거나 찾을 수 없는 스티커 기록입니다." }, { status: 404 });
  } else if (action.type === "ADD_REWARD_CAMPAIGN") {
    const campaign = await db.from("reward_campaigns").insert({ tenant_id: tenantId, title: action.title, description: action.description || null, class_id: action.classId, period_start: action.periodStart, period_end: action.periodEnd, target_distribution: { type: action.distributionType, value: action.distributionValue }, status: "active" }).select("id").single();
    if (campaign.error) return NextResponse.json({ error: campaign.error.message }, { status: 400 });
  } else if (action.type === "UPDATE_REWARD_CAMPAIGN") {
    const result = await db.from("reward_campaigns").update({ title: action.title, description: action.description || null, period_start: action.periodStart, period_end: action.periodEnd, target_distribution: { type: action.distributionType, value: action.distributionValue } }).eq("id", action.campaignId).eq("tenant_id", tenantId);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  } else if (action.type === "DELETE_REWARD_CAMPAIGN") {
    const result = await db.from("reward_campaigns").delete().eq("id", action.campaignId).eq("tenant_id", tenantId);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  } else if (action.type === "UPDATE_TEACHER_PROFILE") {
    if (action.teacherId !== teacher.data.id) return NextResponse.json({ error: "본인 프로필만 수정할 수 있습니다." }, { status: 403 });
    const result = await db.from("teachers").update({ name: action.name, profile_image_url: action.profileImageUrl }).eq("id", teacher.data.id);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 });
  } else {
    return NextResponse.json({ error: "지원하지 않는 저장 작업입니다." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
