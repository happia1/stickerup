import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUser } from "@/lib/supabase/server-auth";
import { isDeveloperUser } from "@/lib/developer-auth";
import {
  DEFAULT_FOOTER_SETTINGS,
  normalizedFooterSettings,
  type FooterSettings,
} from "@/lib/footer-settings";

const SETTING_KEY = "student_mypage_footer";
const EDITABLE_FIELDS: Array<keyof FooterSettings> = [
  "creator_name",
  "support_title",
  "support_description",
  "terms_label",
  "terms_url",
  "privacy_label",
  "privacy_url",
  "copyright_text",
];

export async function GET() {
  try {
    const db = createSupabaseAdminClient();
    const result = await db.from("app_content_settings").select("value").eq("key", SETTING_KEY).maybeSingle();
    if (result.error) return NextResponse.json({ settings: DEFAULT_FOOTER_SETTINGS });
    return NextResponse.json({ settings: normalizedFooterSettings(result.data?.value as Partial<FooterSettings> | null) });
  } catch {
    return NextResponse.json({ settings: DEFAULT_FOOTER_SETTINGS });
  }
}

export async function PATCH(request: Request) {
  const auth = await getRequestUser(request);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
  if (!isDeveloperUser(auth.user)) {
    return NextResponse.json({ error: "개발자 계정만 푸터를 수정할 수 있습니다." }, { status: 403 });
  }

  const body = await request.json();
  const settings = normalizedFooterSettings();
  for (const field of EDITABLE_FIELDS) {
    if (typeof body[field] === "string") settings[field] = body[field].trim();
  }
  if (!settings.creator_name || !settings.support_title || !settings.copyright_text) {
    return NextResponse.json({ error: "필수 푸터 문구를 입력해 주세요." }, { status: 400 });
  }
  for (const field of ["terms_url", "privacy_url"] as const) {
    if (!settings[field].startsWith("/") && !/^https?:\/\//i.test(settings[field])) {
      return NextResponse.json({ error: "약관 링크는 /로 시작하는 앱 주소 또는 https 주소를 입력해 주세요." }, { status: 400 });
    }
  }

  const db = createSupabaseAdminClient();
  const result = await db.from("app_content_settings").upsert({
    key: SETTING_KEY,
    value: settings,
    updated_by: auth.user.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" }).select("value").single();
  if (result.error) {
    const migrationMissing = result.error.message.includes("app_content_settings");
    return NextResponse.json({
      error: migrationMissing
        ? "푸터 설정 테이블이 아직 없습니다. 최신 Supabase 마이그레이션을 적용해 주세요."
        : result.error.message,
    }, { status: 400 });
  }
  return NextResponse.json({ settings: normalizedFooterSettings(result.data.value as Partial<FooterSettings>) });
}
