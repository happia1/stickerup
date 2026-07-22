import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import type { Role } from "@/lib/types";

export async function GET(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  const db = createSupabaseAdminClient();
  const [studentProfile, teacherProfile] = await Promise.all([
    db.from("students").select("tenant_id").eq("id", auth.user.id).maybeSingle(),
    db.from("teachers").select("tenant_id, role").eq("id", auth.user.id).maybeSingle(),
  ]);
  if (studentProfile.error || teacherProfile.error) return NextResponse.json({ error: "프로필을 불러오지 못했습니다." }, { status: 400 });
  const tenantId = studentProfile.data?.tenant_id ?? teacherProfile.data?.tenant_id;
  const role: Role | null = studentProfile.data ? "student" : teacherProfile.data?.role ?? null;
  if (!tenantId || !role) return NextResponse.json({ error: "가입 프로필을 찾을 수 없습니다." }, { status: 404 });

  const [tenant, teachers, invites, students, classes, enrollments, ledger, homework, praise, ranking, campaigns, items, claims, notices] = await Promise.all([
    db.from("tenants").select("*").eq("id", tenantId).single(),
    db.from("teachers").select("*").eq("tenant_id", tenantId),
    db.from("invite_links").select("*").eq("tenant_id", tenantId),
    db.from("students").select("*").eq("tenant_id", tenantId),
    db.from("classes").select("*").eq("tenant_id", tenantId),
    db.from("enrollments").select("*").eq("tenant_id", tenantId),
    db.from("sticker_ledger").select("*").eq("tenant_id", tenantId),
    db.from("homework_submissions").select("*").eq("tenant_id", tenantId),
    db.from("praise_requests").select("*").eq("tenant_id", tenantId),
    db.from("ranking_period_config").select("*").eq("tenant_id", tenantId),
    db.from("reward_campaigns").select("*").eq("tenant_id", tenantId),
    db.from("reward_items").select("*").eq("tenant_id", tenantId),
    db.from("reward_claims").select("*").eq("tenant_id", tenantId),
    db.from("notices").select("*").eq("tenant_id", tenantId),
  ]);
  const results = [tenant, teachers, invites, students, classes, enrollments, ledger, homework, praise, ranking, campaigns, items, claims, notices];
  const error = results.find((result) => result.error)?.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ state: {
    currentUserId: auth.user.id,
    currentUserRole: role,
    tenant: tenant.data,
    teachers: teachers.data ?? [],
    inviteLinks: invites.data ?? [],
    students: students.data ?? [],
    classes: classes.data ?? [],
    enrollments: enrollments.data ?? [],
    ledger: ledger.data ?? [],
    homeworkSubmissions: homework.data ?? [],
    praiseRequests: praise.data ?? [],
    rankingPeriodConfigs: ranking.data ?? [],
    rewardCampaigns: campaigns.data ?? [],
    rewardItems: items.data ?? [],
    rewardClaims: claims.data ?? [],
    notices: notices.data ?? [],
  } });
}
