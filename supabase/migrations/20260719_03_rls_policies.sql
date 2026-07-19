-- StickerUp: Row Level Security 정책
-- 원칙: 모든 테이블은 tenant_id 기준으로 격리한다.
--       "누가 쓸 수 있는가"는 is_teacher()/is_owner()/본인 id 비교로 제한한다.
--
-- 주의(운영 하드닝 TODO): sticker_ledger insert, reward_claims insert,
-- invite_links 토큰 검증(redeem)은 클라이언트가 직접 테이블에 쓰게 두면
-- 부정 조작 위험이 있다. 실제 운영에서는 이 세 가지를 SECURITY DEFINER
-- RPC 함수 또는 Supabase Edge Function으로 감싸서 서버 측에서 값을
-- 재계산/검증한 뒤 insert 하도록 교체할 것을 권장한다. 아래 정책은
-- 초기 개발 단계에서 빠르게 붙여볼 수 있도록 최소 제약만 걸어둔 것이다.

-- =========================================================
-- tenants
-- =========================================================
alter table tenants enable row level security;

create policy tenants_select on tenants
  for select using (id = current_tenant_id());

create policy tenants_update on tenants
  for update using (id = current_tenant_id())
  with check (is_owner());

-- insert 는 서비스 롤(가입 온보딩 서버 로직)에서만 수행 → 별도 정책 없음(기본 거부)

-- =========================================================
-- teachers
-- =========================================================
alter table teachers enable row level security;

create policy teachers_select on teachers
  for select using (tenant_id = current_tenant_id());

create policy teachers_insert on teachers
  for insert with check (tenant_id = current_tenant_id() and is_owner());

create policy teachers_update on teachers
  for update using (
    tenant_id = current_tenant_id() and (id = auth.uid() or is_owner())
  )
  with check (tenant_id = current_tenant_id());

create policy teachers_delete on teachers
  for delete using (
    tenant_id = current_tenant_id() and is_owner() and role = 'assistant'
  );

-- =========================================================
-- invite_links
-- =========================================================
alter table invite_links enable row level security;

create policy invite_links_select on invite_links
  for select using (tenant_id = current_tenant_id() and is_teacher());

create policy invite_links_insert on invite_links
  for insert with check (
    tenant_id = current_tenant_id() and is_teacher() and issuer_teacher_id = auth.uid()
  );

create policy invite_links_update on invite_links
  for update using (tenant_id = current_tenant_id() and is_teacher())
  with check (tenant_id = current_tenant_id());

-- 익명 사용자의 토큰 검증(가입 시점)은 이 테이블을 직접 select 하지 않고
-- SECURITY DEFINER 함수(redeem_invite(token text))를 통해서만 접근한다.

-- =========================================================
-- students
-- =========================================================
alter table students enable row level security;

create policy students_select on students
  for select using (tenant_id = current_tenant_id());

create policy students_update on students
  for update using (
    id = auth.uid() or (tenant_id = current_tenant_id() and is_teacher())
  )
  with check (tenant_id = current_tenant_id());

-- insert 는 가입 온보딩(서비스 롤/Edge Function)에서만 수행

-- =========================================================
-- classes
-- =========================================================
alter table classes enable row level security;

create policy classes_select on classes
  for select using (tenant_id = current_tenant_id());

create policy classes_insert on classes
  for insert with check (tenant_id = current_tenant_id() and is_teacher());

create policy classes_update on classes
  for update using (tenant_id = current_tenant_id() and is_teacher())
  with check (tenant_id = current_tenant_id());

-- 삭제 없음 — status를 'archived'로 변경해서 운영 종료 처리

-- =========================================================
-- enrollments
-- =========================================================
alter table enrollments enable row level security;

create policy enrollments_select on enrollments
  for select using (tenant_id = current_tenant_id());

create policy enrollments_insert on enrollments
  for insert with check (
    tenant_id = current_tenant_id() and (student_id = auth.uid() or is_teacher())
  );

create policy enrollments_update_teacher on enrollments
  for update using (tenant_id = current_tenant_id() and is_teacher())
  with check (tenant_id = current_tenant_id());

create policy enrollments_delete on enrollments
  for delete using (
    tenant_id = current_tenant_id()
    and ((student_id = auth.uid() and status = 'pending') or is_teacher())
  );

-- =========================================================
-- attendance_records
-- =========================================================
alter table attendance_records enable row level security;

create policy attendance_select on attendance_records
  for select using (tenant_id = current_tenant_id());

create policy attendance_insert on attendance_records
  for insert with check (
    tenant_id = current_tenant_id() and (student_id = auth.uid() or is_teacher())
  );

create policy attendance_update on attendance_records
  for update using (tenant_id = current_tenant_id() and is_teacher())
  with check (tenant_id = current_tenant_id());

-- =========================================================
-- homework_submissions
-- =========================================================
alter table homework_submissions enable row level security;

create policy homework_select on homework_submissions
  for select using (tenant_id = current_tenant_id());

create policy homework_insert on homework_submissions
  for insert with check (tenant_id = current_tenant_id() and student_id = auth.uid());

create policy homework_update_student on homework_submissions
  for update using (
    tenant_id = current_tenant_id() and student_id = auth.uid() and approval_status = 'pending'
  )
  with check (tenant_id = current_tenant_id());

create policy homework_update_teacher on homework_submissions
  for update using (tenant_id = current_tenant_id() and is_teacher())
  with check (tenant_id = current_tenant_id());

-- =========================================================
-- praise_requests
-- =========================================================
alter table praise_requests enable row level security;

create policy praise_select on praise_requests
  for select using (tenant_id = current_tenant_id());

create policy praise_insert on praise_requests
  for insert with check (tenant_id = current_tenant_id() and student_id = auth.uid());

create policy praise_update_student on praise_requests
  for update using (
    tenant_id = current_tenant_id() and student_id = auth.uid() and approval_status = 'pending'
  )
  with check (tenant_id = current_tenant_id());

create policy praise_update_teacher on praise_requests
  for update using (tenant_id = current_tenant_id() and is_teacher())
  with check (tenant_id = current_tenant_id());

-- =========================================================
-- sticker_ledger (append-only 원장)
-- =========================================================
alter table sticker_ledger enable row level security;

create policy ledger_select on sticker_ledger
  for select using (tenant_id = current_tenant_id());

create policy ledger_insert on sticker_ledger
  for insert with check (
    tenant_id = current_tenant_id() and (is_teacher() or student_id = auth.uid())
  );

create policy ledger_update_rollback on sticker_ledger
  for update using (tenant_id = current_tenant_id() and is_teacher())
  with check (tenant_id = current_tenant_id());

-- delete 정책 없음(이력 보존 — 롤백은 status 변경으로만 처리)

-- =========================================================
-- ranking_period_config
-- =========================================================
alter table ranking_period_config enable row level security;

create policy ranking_config_select on ranking_period_config
  for select using (tenant_id = current_tenant_id());

create policy ranking_config_upsert on ranking_period_config
  for insert with check (tenant_id = current_tenant_id() and is_teacher());

create policy ranking_config_update on ranking_period_config
  for update using (tenant_id = current_tenant_id() and is_teacher())
  with check (tenant_id = current_tenant_id());

-- =========================================================
-- reward_campaigns / reward_items / reward_claims
-- =========================================================
alter table reward_campaigns enable row level security;

create policy reward_campaigns_select on reward_campaigns
  for select using (tenant_id = current_tenant_id());

create policy reward_campaigns_write on reward_campaigns
  for insert with check (tenant_id = current_tenant_id() and is_teacher());

create policy reward_campaigns_update on reward_campaigns
  for update using (tenant_id = current_tenant_id() and is_teacher())
  with check (tenant_id = current_tenant_id());

alter table reward_items enable row level security;

create policy reward_items_select on reward_items
  for select using (tenant_id = current_tenant_id());

create policy reward_items_write on reward_items
  for insert with check (tenant_id = current_tenant_id() and is_teacher());

create policy reward_items_update on reward_items
  for update using (tenant_id = current_tenant_id() and is_teacher())
  with check (tenant_id = current_tenant_id());

alter table reward_claims enable row level security;

create policy reward_claims_select on reward_claims
  for select using (tenant_id = current_tenant_id());

create policy reward_claims_insert on reward_claims
  for insert with check (tenant_id = current_tenant_id() and student_id = auth.uid());

-- =========================================================
-- notices
-- =========================================================
alter table notices enable row level security;

create policy notices_select on notices
  for select using (tenant_id = current_tenant_id());

create policy notices_write on notices
  for insert with check (tenant_id = current_tenant_id() and is_teacher());

create policy notices_update on notices
  for update using (tenant_id = current_tenant_id() and is_teacher())
  with check (tenant_id = current_tenant_id());

create policy notices_delete on notices
  for delete using (tenant_id = current_tenant_id() and is_teacher());
