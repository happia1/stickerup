import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
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
import type { StudentHomeData } from "./student-home.types";

function assertQuery<T>(data: T | null, error: { message: string } | null, label: string): T {
  if (error) throw new Error(`${label}: ${error.message}`);
  if (data === null) throw new Error(`${label}: no data returned.`);
  return data;
}

export async function getStudentHomeData(
  supabase: SupabaseClient,
  studentId: string
): Promise<StudentHomeData> {
  const studentResult = await supabase.from("students").select("*").eq("id", studentId).maybeSingle();
  const student = assertQuery(studentResult.data as Student | null, studentResult.error, "Student profile");

  const [enrollmentResult, ledgerResult, noticeResult, rankingResult, campaignResult, studentsResult] =
    await Promise.all([
      supabase.from("enrollments").select("*").eq("tenant_id", student.tenant_id).eq("status", "approved"),
      supabase.from("sticker_ledger").select("*").eq("tenant_id", student.tenant_id).eq("status", "active"),
      supabase.from("notices").select("*").eq("tenant_id", student.tenant_id).order("pinned", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("ranking_period_config").select("*").eq("tenant_id", student.tenant_id),
      supabase.from("reward_campaigns").select("*").eq("tenant_id", student.tenant_id),
      supabase.from("students").select("*").eq("tenant_id", student.tenant_id),
    ]);

  const enrollments = assertQuery(enrollmentResult.data as Enrollment[] | null, enrollmentResult.error, "Enrollments");
  const classIds = enrollments.filter((enrollment) => enrollment.student_id === student.id).map((enrollment) => enrollment.class_id);
  const classesResult = classIds.length
    ? await supabase.from("classes").select("*").in("id", classIds).eq("status", "active")
    : { data: [], error: null };
  const campaigns = assertQuery(campaignResult.data as RewardCampaign[] | null, campaignResult.error, "Reward campaigns");
  const campaignIds = campaigns.map((campaign) => campaign.id);
  const [itemsResult, claimsResult] = campaignIds.length
    ? await Promise.all([
        supabase.from("reward_items").select("*").in("campaign_id", campaignIds),
        supabase.from("reward_claims").select("*").eq("student_id", student.id),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];
  const rawRewardItems = assertQuery(itemsResult.data as RewardItem[] | null, itemsResult.error, "Reward items");
  const productIds = Array.from(new Set(rawRewardItems.map((item) => item.product_id).filter((id): id is string => Boolean(id))));
  const productsResult = productIds.length
    ? await supabase.from("product_catalog").select("id, title, image_url, purchase_url").in("id", productIds)
    : { data: [], error: null };
  const products = assertQuery(productsResult.data, productsResult.error, "Reward products");
  const productById = new Map(products.map((product) => [product.id, product]));
  const rewardItems = rawRewardItems.map((item) => {
    const product = item.product_id ? productById.get(item.product_id) : null;
    return product ? { ...item, title: product.title, image_url: product.image_url, link_url: product.purchase_url } : item;
  });

  return {
    student,
    students: assertQuery(studentsResult.data as Student[] | null, studentsResult.error, "Students"),
    classes: assertQuery(classesResult.data as ClassRoom[] | null, classesResult.error, "Classes"),
    enrollments,
    stickerLedger: assertQuery(ledgerResult.data as StickerLedgerEntry[] | null, ledgerResult.error, "Sticker ledger"),
    notices: assertQuery(noticeResult.data as Notice[] | null, noticeResult.error, "Notices"),
    rankingPeriodConfigs: assertQuery(rankingResult.data as RankingPeriodConfig[] | null, rankingResult.error, "Ranking period config"),
    rewardCampaigns: campaigns,
    rewardItems,
    rewardClaims: assertQuery(claimsResult.data as RewardClaim[] | null, claimsResult.error, "Reward claims"),
  };
}
