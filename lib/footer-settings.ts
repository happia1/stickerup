export type FooterSettings = {
  creator_name: string;
  tagline: string;
  terms_label: string;
  terms_url: string;
  privacy_label: string;
  privacy_url: string;
  copyright_text: string;
};

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  creator_name: "Jeongwon Kim",
  tagline: "학원 출석 · 숙제 · 칭찬 스티커 랭킹 앱",
  terms_label: "이용약관",
  terms_url: "/terms",
  privacy_label: "개인정보 처리방침",
  privacy_url: "/privacy",
  copyright_text: "Copyright © 2026 Jeongwon Kim. All rights reserved.",
};

export function normalizedFooterSettings(value?: Partial<FooterSettings> | null): FooterSettings {
  return { ...DEFAULT_FOOTER_SETTINGS, ...(value ?? {}) };
}
