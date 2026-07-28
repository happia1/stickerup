-- 반려된 요청은 스티커를 지급하지 않지만 재신청 후에도 감사 이력이 남아야 한다.
-- 앞으로의 반려는 관리자 API가 0장짜리 rolled_back 원장을 생성하며,
-- 이 마이그레이션은 기존 반려 요청을 같은 형식으로 한 번만 보정한다.

insert into public.sticker_ledger (
  tenant_id, student_id, class_id, source_type, source_id, count, status,
  actor_teacher_id, rollback_reason, rollback_at, created_at
)
select
  request.tenant_id, request.student_id, request.class_id, 'attendance', request.id, 0, 'rolled_back',
  request.approver_id, '승인 반려: 이전 출석 반려 기록',
  coalesce(request.approved_at, request.checked_at), coalesce(request.approved_at, request.checked_at)
from public.attendance_records request
where request.approval_status = 'rejected'
  and not exists (
    select 1 from public.sticker_ledger ledger
    where ledger.source_type = 'attendance'
      and ledger.source_id = request.id
      and ledger.rollback_reason like '승인 반려:%'
  );

insert into public.sticker_ledger (
  tenant_id, student_id, class_id, source_type, source_id, count, status,
  actor_teacher_id, rollback_reason, rollback_at, created_at
)
select
  request.tenant_id, request.student_id, request.class_id, 'homework', request.id, 0, 'rolled_back',
  request.approver_id, '승인 반려: 이전 과제 반려 기록',
  coalesce(request.approved_at, request.submitted_at), coalesce(request.approved_at, request.submitted_at)
from public.homework_submissions request
where request.approval_status = 'rejected'
  and not exists (
    select 1 from public.sticker_ledger ledger
    where ledger.source_type = 'homework'
      and ledger.source_id = request.id
      and ledger.rollback_reason like '승인 반려:%'
  );

insert into public.sticker_ledger (
  tenant_id, student_id, class_id, source_type, source_id, count, status,
  actor_teacher_id, rollback_reason, rollback_at, created_at
)
select
  request.tenant_id, request.student_id, default_class.id, 'praise', request.id, 0, 'rolled_back',
  request.approver_id, '승인 반려: 이전 칭찬 반려 기록',
  coalesce(request.approved_at, request.requested_at), coalesce(request.approved_at, request.requested_at)
from public.praise_requests request
join public.classes default_class
  on default_class.tenant_id = request.tenant_id and default_class.is_default = true
where request.approval_status = 'rejected'
  and not exists (
    select 1 from public.sticker_ledger ledger
    where ledger.source_type = 'praise'
      and ledger.source_id = request.id
      and ledger.rollback_reason like '승인 반려:%'
  );
