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
