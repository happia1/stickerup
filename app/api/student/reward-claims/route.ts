import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";

export async function POST(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { itemId } = await request.json() as { itemId?: string };
  if (!itemId) return NextResponse.json({ error: "상품을 선택해주세요." }, { status: 400 });
  const db = createSupabaseAdminClient();
  const student = await db.from("students").select("id, tenant_id").eq("id", auth.user.id).maybeSingle();
  if (!student.data) return NextResponse.json({ error: "학생 계정이 필요합니다." }, { status: 403 });
  const studentData = student.data;
  const item = await db.from("reward_items").select("id, campaign_id, qty").eq("id", itemId).eq("tenant_id", studentData.tenant_id).maybeSingle();
  if (!item.data) return NextResponse.json({ error: "상품을 찾을 수 없습니다." }, { status: 404 });
  const campaign = await db.from("reward_campaigns").select("id, class_id, period_start, period_end, target_distribution").eq("id", item.data.campaign_id).single();
  if (!campaign.data) return NextResponse.json({ error: "이벤트를 찾을 수 없습니다." }, { status: 404 });
  const today = new Date().toISOString().slice(0, 10);
  if (today <= campaign.data.period_end) return NextResponse.json({ error: "랭킹 기간이 끝난 뒤 선물을 선택할 수 있어요." }, { status: 409 });

  const [students, enrollments, ledger, campaignItems] = await Promise.all([
    db.from("students").select("id").eq("tenant_id", studentData.tenant_id),
    db.from("enrollments").select("student_id, class_id, status").eq("tenant_id", studentData.tenant_id).eq("status", "approved"),
    db.from("sticker_ledger").select("student_id, class_id, count, status, created_at").eq("tenant_id", studentData.tenant_id).eq("status", "active").gte("created_at", `${campaign.data.period_start}T00:00:00`).lte("created_at", `${campaign.data.period_end}T23:59:59.999`),
    db.from("reward_items").select("id").eq("campaign_id", campaign.data.id),
  ]);
  const eligibleIds = (students.data ?? []).map((row) => row.id).filter((id) => !campaign.data.class_id || (enrollments.data ?? []).some((row) => row.student_id === id && row.class_id === campaign.data.class_id));
  const rows = eligibleIds.map((id) => { const entries = (ledger.data ?? []).filter((entry) => entry.student_id === id && (!campaign.data.class_id || entry.class_id === campaign.data.class_id)); return { id, total: entries.reduce((sum, entry) => sum + entry.count, 0), first: entries.map((entry) => entry.created_at).sort()[0] ?? "9999" }; }).sort((a,b)=>b.total-a.total||a.first.localeCompare(b.first)||a.id.localeCompare(b.id));
  const distribution = campaign.data.target_distribution as { type: "count" | "ratio"; value: number };
  const eligibleCount = distribution.type === "count" ? Math.min(distribution.value, rows.length) : Math.max(1, Math.round(rows.length * distribution.value));
  const itemIds = (campaignItems.data ?? []).map((row) => row.id);
  const claims = itemIds.length ? await db.from("reward_claims").select("student_id, item_id").in("item_id", itemIds) : { data: [], error: null };
  const claimedIds = new Set((claims.data ?? []).map((claim) => claim.student_id));
  const next = rows.slice(0, eligibleCount).find((row) => !claimedIds.has(row.id));
  if (!next || next.id !== studentData.id) return NextResponse.json({ error: "앞 순위 학생의 선택이 끝난 뒤 선택할 수 있어요." }, { status: 409 });
  const itemClaimCount = (claims.data ?? []).filter((claim) => claim.item_id === itemId).length;
  if (itemClaimCount >= item.data.qty) return NextResponse.json({ error: "선택 가능한 수량이 없습니다." }, { status: 409 });
  const inserted = await db.from("reward_claims").insert({ tenant_id: studentData.tenant_id, item_id: itemId, student_id: studentData.id, rank_at_claim: rows.findIndex((row) => row.id === studentData.id) + 1 }).select("*").single();
  if (inserted.error) return NextResponse.json({ error: inserted.error.message }, { status: 400 });
  return NextResponse.json({ claim: inserted.data });
}
