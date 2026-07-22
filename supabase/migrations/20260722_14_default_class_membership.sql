-- Every student belongs to the tenant's default class automatically.
-- Teacher connection approval remains independent from default-class membership.

insert into enrollments (tenant_id, student_id, class_id, status, approved_at)
select s.tenant_id, s.id, c.id, 'approved', now()
from students s
join classes c on c.tenant_id = s.tenant_id and c.is_default = true
on conflict (student_id, class_id) do update
set status = 'approved', approved_at = coalesce(enrollments.approved_at, now());

create or replace function assign_student_to_default_class()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_class_id uuid;
begin
  select id into default_class_id
  from classes
  where tenant_id = new.tenant_id and is_default = true
  limit 1;

  if default_class_id is not null then
    insert into enrollments (tenant_id, student_id, class_id, status, approved_at)
    values (new.tenant_id, new.id, default_class_id, 'approved', now())
    on conflict (student_id, class_id) do update
    set status = 'approved', approved_at = coalesce(enrollments.approved_at, now());
  end if;

  return new;
end;
$$;

drop trigger if exists trg_assign_student_to_default_class on students;
create trigger trg_assign_student_to_default_class
after insert on students
for each row execute function assign_student_to_default_class();
