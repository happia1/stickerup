-- Attendance and homework are self-check actions that issue stickers immediately.
-- Praise requests remain teacher-approved.

insert into sticker_ledger (
  tenant_id,
  student_id,
  class_id,
  source_type,
  source_id,
  count,
  status,
  actor_teacher_id,
  created_at
)
select
  homework.tenant_id,
  homework.student_id,
  homework.class_id,
  'homework',
  homework.id,
  homework.sticker_count,
  'active',
  null,
  homework.submitted_at
from homework_submissions homework
where homework.approval_status = 'pending'
  and not exists (
    select 1
    from sticker_ledger ledger
    where ledger.source_type = 'homework'
      and ledger.source_id = homework.id
  );

update homework_submissions
set approval_status = 'approved', approved_at = coalesce(approved_at, now()), approver_id = null
where approval_status = 'pending';
