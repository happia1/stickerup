-- StickerUp: 함수 & 트리거
-- 인증 컨텍스트 헬퍼, 자동 배정 트리거, 랭킹 계산 함수, 주기 계산 함수

-- =========================================================
-- 1. 인증 컨텍스트 헬퍼 (RLS 정책에서 사용)
-- =========================================================

create or replace function current_tenant_id()
returns uuid
language sql stable
as $$
  select coalesce(
    (select tenant_id from teachers where id = auth.uid()),
    (select tenant_id from students where id = auth.uid())
  );
$$;

create or replace function is_teacher()
returns boolean
language sql stable
as $$
  select exists (select 1 from teachers where id = auth.uid());
$$;

create or replace function is_owner()
returns boolean
language sql stable
as $$
  select exists (select 1 from teachers where id = auth.uid() and role = 'owner');
$$;

create or replace function is_student()
returns boolean
language sql stable
as $$
  select exists (select 1 from students where id = auth.uid());
$$;

-- =========================================================
-- 2. updated_at 자동 갱신
-- =========================================================

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_classes_updated_at
  before update on classes
  for each row execute function set_updated_at();

-- =========================================================
-- 3. 학원 생성 시 기본반 자동 생성
-- =========================================================

create or replace function fn_create_default_class_for_tenant()
returns trigger
language plpgsql
as $$
begin
  insert into classes (tenant_id, name, attendance_time, is_default, ranking_unit, status)
  values (new.id, '기본반', '15:00', true, 'month', 'active');
  return new;
end;
$$;

create trigger trg_create_default_class
  after insert on tenants
  for each row execute function fn_create_default_class_for_tenant();

-- =========================================================
-- 4. 학생 가입 시 기본반 자동(승인 불필요) 배정
-- =========================================================

create or replace function fn_auto_enroll_default_class()
returns trigger
language plpgsql
as $$
declare
  v_default_class_id uuid;
begin
  select id into v_default_class_id
  from classes
  where tenant_id = new.tenant_id and is_default = true
  limit 1;

  if v_default_class_id is not null then
    insert into enrollments (tenant_id, student_id, class_id, status, approved_at)
    values (new.tenant_id, new.id, v_default_class_id, 'approved', now())
    on conflict (student_id, class_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger trg_auto_enroll_default
  after insert on students
  for each row execute function fn_auto_enroll_default_class();

-- =========================================================
-- 5. 랭킹 단위기간(일/주/월/분기) → 시작일/종료일 계산
-- =========================================================

create or replace function compute_period_bounds(p_unit text, p_ref_date date default current_date)
returns table (period_start date, period_end date)
language sql
immutable
as $$
  select
    case p_unit
      when 'day' then p_ref_date
      when 'week' then date_trunc('week', p_ref_date)::date
      when 'month' then date_trunc('month', p_ref_date)::date
      when 'quarter' then date_trunc('quarter', p_ref_date)::date
      else date_trunc('month', p_ref_date)::date
    end as period_start,
    case p_unit
      when 'day' then p_ref_date
      when 'week' then (date_trunc('week', p_ref_date) + interval '6 days')::date
      when 'month' then (date_trunc('month', p_ref_date) + interval '1 month' - interval '1 day')::date
      when 'quarter' then (date_trunc('quarter', p_ref_date) + interval '3 months' - interval '1 day')::date
      else (date_trunc('month', p_ref_date) + interval '1 month' - interval '1 day')::date
    end as period_end;
$$;

-- =========================================================
-- 6. 랭킹 계산 함수 (1등=금, 2등=은, 3등=동 고정, 비율 없음)
--    동점 처리 기본 정책: 총합이 같으면 해당 학생의 가장 이른 스티커
--    활동 시각(first_activity_at)이 빠른 쪽을 상위로 처리한다. (PRD 4.8, Open Questions 참고)
-- =========================================================

create or replace function get_ranking(
  p_tenant_id uuid,
  p_class_id uuid,      -- null = 전체(글로벌) 랭킹
  p_period_start date,
  p_period_end date
)
returns table (
  student_id uuid,
  total_count bigint,
  first_activity_at timestamptz,
  rank int,
  medal text
)
language sql
stable
as $$
  with scoped_students as (
    select s.id as student_id
    from students s
    where s.tenant_id = p_tenant_id
      and (
        p_class_id is null
        or exists (
          select 1 from enrollments e
          where e.student_id = s.id and e.class_id = p_class_id and e.status = 'approved'
        )
      )
  ),
  totals as (
    select
      ss.student_id,
      coalesce(sum(sl.count) filter (
        where sl.status = 'active'
          and sl.created_at::date between p_period_start and p_period_end
          and (p_class_id is null or sl.class_id = p_class_id)
      ), 0) as total_count,
      min(sl.created_at) filter (
        where sl.status = 'active'
          and sl.created_at::date between p_period_start and p_period_end
          and (p_class_id is null or sl.class_id = p_class_id)
      ) as first_activity_at
    from scoped_students ss
    left join sticker_ledger sl
      on sl.student_id = ss.student_id and sl.tenant_id = p_tenant_id
    group by ss.student_id
  ),
  ranked as (
    select
      t.*,
      row_number() over (
        order by t.total_count desc, t.first_activity_at asc nulls last
      ) as rnk
    from totals t
  )
  select
    student_id,
    total_count,
    first_activity_at,
    rnk::int as rank,
    case rnk when 1 then 'gold' when 2 then 'silver' when 3 then 'bronze' else null end as medal
  from ranked
  order by rnk;
$$;

-- =========================================================
-- 7. 랭킹 주기 종료 / 특강반 만료 자동 처리 (pg_cron)
--    Supabase 대시보드 Database > Extensions 에서 pg_cron 활성화 후 아래 스케줄을 등록한다.
--    (이 파일 자체는 스케줄을 자동 등록하지 않으므로, 아래 블록의 주석을 해제해서 별도 실행)
-- =========================================================

-- select cron.schedule(
--   'end-expired-reward-campaigns',
--   '0 0 * * *',
--   $$ update reward_campaigns set status = 'ended'
--      where status = 'active' and period_end < current_date; $$
-- );
--
-- select cron.schedule(
--   'activate-scheduled-reward-campaigns',
--   '5 0 * * *',
--   $$ update reward_campaigns set status = 'active'
--      where status = 'scheduled' and period_start <= current_date and period_end >= current_date; $$
-- );
--
-- select cron.schedule(
--   'archive-expired-classes',
--   '10 0 * * *',
--   $$ update classes set status = 'archived'
--      where status = 'active' and special_end is not null and special_end < current_date; $$
-- );
