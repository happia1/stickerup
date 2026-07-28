create table if not exists public.app_content_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.app_content_settings enable row level security;

revoke all on table public.app_content_settings from anon, authenticated;
grant all on table public.app_content_settings to service_role;

insert into public.app_content_settings (key, value)
values (
  'student_mypage_footer',
  jsonb_build_object(
    'creator_name', 'Jeongwon Kim',
    'tagline', '학원 출석 · 숙제 · 칭찬 스티커 랭킹 앱',
    'terms_label', '이용약관',
    'terms_url', '/terms',
    'privacy_label', '개인정보 처리방침',
    'privacy_url', '/privacy',
    'copyright_text', 'Copyright © 2026 Jeongwon Kim. All rights reserved.'
  )
)
on conflict (key) do nothing;
