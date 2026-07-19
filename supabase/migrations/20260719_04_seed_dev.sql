-- StickerUp: 로컬 개발용 시드 데이터
-- 경고: 이 파일은 로컬 개발(supabase start / supabase db reset) 전용입니다.
--       운영(호스팅) Supabase 프로젝트에는 절대 실행하지 마세요.
--       (auth.users에 직접 insert하는 것은 로컬 개발 시 계정을 빠르게
--        만들기 위한 트릭이며, 운영 환경에서는 Supabase Auth API/가입
--        플로우를 통해서만 사용자를 생성해야 합니다.)

-- =========================================================
-- 0. 테스트 계정 (auth.users) — 비밀번호는 모두 'password123'
-- =========================================================

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'authenticated', 'authenticated', 'owner@stickerup.dev', crypt('password123', gen_salt('bf')),
   now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'authenticated', 'authenticated', 'assistant@stickerup.dev', crypt('password123', gen_salt('bf')),
   now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333331',
   'authenticated', 'authenticated', 'student1@stickerup.dev', crypt('password123', gen_salt('bf')),
   now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333332',
   'authenticated', 'authenticated', 'student2@stickerup.dev', crypt('password123', gen_salt('bf')),
   now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'authenticated', 'authenticated', 'student3@stickerup.dev', crypt('password123', gen_salt('bf')),
   now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333334',
   'authenticated', 'authenticated', 'student4@stickerup.dev', crypt('password123', gen_salt('bf')),
   now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333335',
   'authenticated', 'authenticated', 'student5@stickerup.dev', crypt('password123', gen_salt('bf')),
   now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');

-- =========================================================
-- 1. 학원(테넌트) + 원장 — tenants insert 트리거가 기본반을 자동 생성한다
-- =========================================================

insert into tenants (id, name)
values ('aaaaaaaa-0000-0000-0000-000000000001', '해피 수학학원');

insert into teachers (id, tenant_id, role, name, email)
values ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'owner', '김원장', 'owner@stickerup.dev');

update tenants set owner_teacher_id = '11111111-1111-1111-1111-111111111111'
where id = 'aaaaaaaa-0000-0000-0000-000000000001';

insert into teachers (id, tenant_id, role, name, email, invited_by)
values ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0000-0000-0000-000000000001', 'assistant', '박조교', 'assistant@stickerup.dev', '11111111-1111-1111-1111-111111111111');

-- =========================================================
-- 2. 초대 링크
-- =========================================================

insert into invite_links (tenant_id, issuer_teacher_id, token, status)
values ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'happy-math-2026', 'active');

-- =========================================================
-- 3. 학생 (insert 트리거가 기본반 자동 승인 배정)
-- =========================================================

insert into students (id, tenant_id, invited_by_teacher_id, name, age)
values
  ('33333333-3333-3333-3333-333333333331', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '김민준', 16),
  ('33333333-3333-3333-3333-333333333332', 'aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '이서연', 17),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '박도윤', 15),
  ('33333333-3333-3333-3333-333333333334', 'aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '최지우', 16),
  ('33333333-3333-3333-3333-333333333335', 'aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '정하은', 17);

-- =========================================================
-- 4. 추가 반(특강반) — 기본반은 트리거로 이미 생성됨
-- =========================================================

insert into classes (id, tenant_id, name, attendance_time, is_default, special_start, special_end, ranking_unit)
values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', '대수반', '19:00', false, '2026-07-01', '2026-08-31', 'week'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', '수능특강반', '09:00', false, '2026-07-01', '2026-09-30', 'month');

-- =========================================================
-- 5. 반 승인요청 (일부 승인됨, 일부 대기중)
-- =========================================================

insert into enrollments (tenant_id, student_id, class_id, status, approved_at, approver_id)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333331', 'bbbbbbbb-0000-0000-0000-000000000001', 'approved', now(), '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333332', 'bbbbbbbb-0000-0000-0000-000000000001', 'approved', now(), '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333334', 'bbbbbbbb-0000-0000-0000-000000000002', 'approved', now(), '22222222-2222-2222-2222-222222222222');

insert into enrollments (tenant_id, student_id, class_id, status)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-0000-0000-0000-000000000001', 'pending');

-- =========================================================
-- 6. 스티커 원장 샘플 데이터 (대수반 이번 주 랭킹 확인용)
-- =========================================================

insert into sticker_ledger (tenant_id, student_id, class_id, source_type, source_id, count, actor_teacher_id)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333331', 'bbbbbbbb-0000-0000-0000-000000000001', 'attendance', gen_random_uuid(), 5, null),
  ('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333331', 'bbbbbbbb-0000-0000-0000-000000000001', 'homework', gen_random_uuid(), 5, '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333332', 'bbbbbbbb-0000-0000-0000-000000000001', 'attendance', gen_random_uuid(), 4, null),
  ('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333332', 'bbbbbbbb-0000-0000-0000-000000000001', 'homework', gen_random_uuid(), 3, '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333331', 'bbbbbbbb-0000-0000-0000-000000000001', 'praise', gen_random_uuid(), 2, '22222222-2222-2222-2222-222222222222');

-- =========================================================
-- 7. 그룹별 랭킹 단위기간 (대수반 = 주 단위로 오버라이드)
-- =========================================================

insert into ranking_period_config (tenant_id, class_id, unit)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'week');

-- 전체(글로벌) 랭킹 기본 단위 = 월 단위
insert into ranking_period_config (tenant_id, class_id, unit)
values ('aaaaaaaa-0000-0000-0000-000000000001', null, 'month');

-- =========================================================
-- 8. 대수반 이번 주 보상 캠페인
-- =========================================================

insert into reward_campaigns (id, tenant_id, class_id, period_start, period_end, target_distribution, status)
values (
  'cccccccc-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'bbbbbbbb-0000-0000-0000-000000000001',
  (select period_start from compute_period_bounds('week')),
  (select period_end from compute_period_bounds('week')),
  '{"type":"count","value":3}'::jsonb,
  'active'
);

insert into reward_items (tenant_id, campaign_id, title, image_url, qty)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', '스타벅스 아메리카노 기프티콘', null, 3),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', '문화상품권 1만원', null, 5);

-- =========================================================
-- 9. 공지사항
-- =========================================================

insert into notices (tenant_id, title, content, pinned, author_teacher_id)
values (
  'aaaaaaaa-0000-0000-0000-000000000001',
  '📢 7월 정기고사 대비 특강 안내',
  '7/22(월)부터 정기고사 대비 특강이 진행됩니다.',
  true,
  '11111111-1111-1111-1111-111111111111'
);

-- =========================================================
-- 확인용 쿼리 예시 (그대로 실행해서 랭킹 함수 테스트 가능)
-- =========================================================
-- select * from get_ranking(
--   'aaaaaaaa-0000-0000-0000-000000000001',
--   'bbbbbbbb-0000-0000-0000-000000000001',
--   (select period_start from compute_period_bounds('week')),
--   (select period_end from compute_period_bounds('week'))
-- );
