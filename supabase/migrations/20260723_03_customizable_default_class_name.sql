-- 기본 소속 반의 이름은 관리자별로 자유롭게 정한다.
-- 기존 반 이름은 보존하고, 새 학원에만 '기본반'을 초기값으로 사용한다.
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
