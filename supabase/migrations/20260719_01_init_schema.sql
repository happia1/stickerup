-- StickerUp: 초기 스키마
-- 대상: Supabase Postgres
-- 이 파일은 supabase/migrations/ 아래에 그대로 두면 `supabase db push` / `supabase migration up`으로 적용됩니다.

create extension if not exists "pgcrypto";

-- =========================================================
-- 1. 테넌시 (학원) & 계정
-- =========================================================

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_teacher_id uuid, -- teachers 테이블 생성 후 FK 추가 (아래 참고)
  created_at timestamptz not null default now()
);

-- teachers.id 는 auth.users.id 와 1:1 로 연결됩니다 (Supabase Auth 사용자).
create table teachers (
  id uuid primary key references auth.users (id) on delete cascade,
  tenant_id uuid not null references tenants (id) on delete cascade,
  role text not null check (role in ('owner', 'assistant')),
  name text not null,
  email text not null,
  invited_by uuid references teachers (id),
  created_at timestamptz not null default now()
);

alter table tenants
  add constraint tenants_owner_teacher_id_fkey
  foreign key (owner_teacher_id) references teachers (id) on delete set null deferrable initially deferred;

create table invite_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  issuer_teacher_id uuid not null references teachers (id) on delete cascade,
  token text not null unique,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- students.id 는 auth.users.id 와 1:1 로 연결됩니다.
create table students (
  id uuid primary key references auth.users (id) on delete cascade,
  tenant_id uuid not null references tenants (id) on delete cascade,
  invited_by_teacher_id uuid references teachers (id),
  invite_link_id uuid references invite_links (id),
  name text not null,
  age int check (age between 1 and 100),
  profile_image_url text,
  account_status text not null default 'active' check (account_status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

-- =========================================================
-- 2. 반(클래스) & 소속 승인
-- =========================================================

create table classes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  name text not null,
  attendance_time time not null default '15:00',
  is_default boolean not null default false, -- 기본반 여부 (테넌트당 1개)
  special_start date,
  special_end date,
  ranking_unit text not null default 'month' check (ranking_unit in ('day', 'week', 'month', 'quarter', 'custom')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index one_default_class_per_tenant
  on classes (tenant_id)
  where is_default = true;

create table enrollments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  class_id uuid not null references classes (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  approver_id uuid references teachers (id),
  unique (student_id, class_id)
);

-- =========================================================
-- 3. 스티커 원천 데이터 (출석 / 숙제 / 칭찬)
-- =========================================================

create table attendance_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  class_id uuid not null references classes (id) on delete cascade,
  checked_at timestamptz not null default now(),
  tier text not null,
  sticker_count int not null,
  created_at timestamptz not null default now()
);

create table homework_submissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  class_id uuid not null references classes (id) on delete cascade,
  completion_tier text not null,
  sticker_count int not null,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approver_id uuid references teachers (id),
  submitted_at timestamptz not null default now(),
  approved_at timestamptz
);

create table praise_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  class_id uuid references classes (id),
  category text,
  reason text not null,
  sticker_count int,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approver_id uuid references teachers (id),
  requested_at timestamptz not null default now(),
  approved_at timestamptz
);

-- =========================================================
-- 4. 스티커 지급 원장 (랭킹 집계의 단일 소스)
-- =========================================================

create table sticker_ledger (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  class_id uuid not null references classes (id) on delete cascade,
  source_type text not null check (source_type in ('attendance', 'homework', 'praise')),
  source_id uuid not null, -- attendance_records / homework_submissions / praise_requests 의 id (폴리모픽, FK 제약 없음)
  count int not null,
  status text not null default 'active' check (status in ('active', 'rolled_back')),
  actor_teacher_id uuid references teachers (id), -- null 이면 시스템 자동 지급(출석)
  rollback_reason text,
  rollback_at timestamptz,
  created_at timestamptz not null default now()
);

create index sticker_ledger_ranking_idx
  on sticker_ledger (tenant_id, class_id, status, created_at);

-- =========================================================
-- 5. 랭킹 노출 설정
-- =========================================================

create table ranking_period_config (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  class_id uuid references classes (id), -- null = 전체(글로벌) 랭킹 설정
  unit text not null default 'month' check (unit in ('day', 'week', 'month', 'quarter', 'custom')),
  custom_days int check (
    (unit = 'custom' and custom_days between 1 and 365)
    or (unit <> 'custom' and custom_days is null)
  ),
  updated_at timestamptz not null default now(),
  unique (tenant_id, class_id)
);

create unique index one_global_ranking_config_per_tenant
  on ranking_period_config (tenant_id)
  where class_id is null;

-- =========================================================
-- 6. 상품(리워드)
-- =========================================================

create table reward_campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  class_id uuid references classes (id), -- null = 전체 대상
  period_start date not null,
  period_end date not null,
  target_distribution jsonb not null default '{"type":"ratio","value":0.5}'::jsonb,
  status text not null default 'scheduled' check (status in ('scheduled', 'active', 'ended')),
  created_at timestamptz not null default now()
);

create table reward_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  campaign_id uuid not null references reward_campaigns (id) on delete cascade,
  title text not null,
  image_url text,
  link_url text,
  qty int not null default 1 check (qty >= 0)
);

create table reward_claims (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  item_id uuid not null references reward_items (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  rank_at_claim int,
  claimed_at timestamptz not null default now()
);

-- =========================================================
-- 7. 공지사항
-- =========================================================

create table notices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  title text not null,
  content text not null default '',
  pinned boolean not null default false,
  author_teacher_id uuid references teachers (id),
  created_at timestamptz not null default now()
);
