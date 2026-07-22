update enrollments
set
  status = 'approved',
  approved_at = coalesce(approved_at, requested_at, now()),
  approver_id = null
where status = 'pending';

create or replace function auto_approve_class_enrollment()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'pending' then
    new.status := 'approved';
    new.approved_at := coalesce(new.approved_at, now());
    new.approver_id := null;
  end if;
  return new;
end;
$$;

drop trigger if exists enrollments_auto_approve on enrollments;
create trigger enrollments_auto_approve
before insert or update of status on enrollments
for each row
execute function auto_approve_class_enrollment();
