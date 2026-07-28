export type FooterSettings = {
  creator_name: string;
  support_title: string;
  support_description: string;
  terms_label: string;
  terms_url: string;
  privacy_label: string;
  privacy_url: string;
  copyright_text: string;
};

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  creator_name: "Jeongwon Kim",
  support_title: "고객지원",
  support_description: "서비스 이용 중 궁금한 점이나 불편한 사항이 있으면 문의해 주세요.",
  terms_label: "이용약관",
  terms_url: "/terms",
  privacy_label: "개인정보 처리방침",
  privacy_url: "/privacy",
  copyright_text: "Copyright © 2026 Jeongwon Kim. All rights reserved.",
};

export function normalizedFooterSettings(value?: Partial<FooterSettings> | null): FooterSettings {
  return { ...DEFAULT_FOOTER_SETTINGS, ...(value ?? {}) };
}
