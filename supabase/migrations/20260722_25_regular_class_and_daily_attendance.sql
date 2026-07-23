update public.classes
set attendance_time = '00:00'
where is_default = true;

create or replace function public.fn_create_default_class_for_tenant()
returns trigger
language plpgsql
as $$
begin
  insert into public.classes (tenant_id, name, attendance_time, is_default, ranking_unit, status)
  values (new.id, '기본반', '00:00', true, 'month', 'active');
  return new;
end;
$$;

drop index if exists public.attendance_once_per_day;

with ranked as (
  select id,
         row_number() over (partition by student_id, check_date order by checked_at, id) as row_number
  from public.attendance_records
  where check_date is not null
)
update public.attendance_records records
set check_date = null
from ranked
where records.id = ranked.id and ranked.row_number > 1;

create unique index attendance_once_per_student_day
  on public.attendance_records (student_id, check_date)
  where check_date is not null;
