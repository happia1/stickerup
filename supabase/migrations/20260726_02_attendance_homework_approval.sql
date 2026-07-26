-- 출석과 과제는 학생 요청 후 관리자 승인 시에만 스티커를 지급한다.
alter table public.attendance_records add column if not exists approval_status text;
alter table public.attendance_records add column if not exists approver_id uuid;
alter table public.attendance_records add column if not exists approved_at timestamptz;

update public.attendance_records
set approval_status = 'approved', approved_at = coalesce(approved_at, created_at)
where approval_status is null;

alter table public.attendance_records alter column approval_status set default 'pending';
alter table public.attendance_records alter column approval_status set not null;
alter table public.attendance_records drop constraint if exists attendance_records_approval_status_check;
alter table public.attendance_records add constraint attendance_records_approval_status_check check (approval_status in ('pending', 'approved', 'rejected'));
alter table public.attendance_records drop constraint if exists attendance_records_approver_id_fkey;
alter table public.attendance_records add constraint attendance_records_approver_id_fkey foreign key (approver_id) references public.teachers(id) on delete set null;

-- 과거 자동 승인 데이터는 유지하되 앞으로 생성되는 요청의 기본값은 pending으로 고정한다.
alter table public.homework_submissions alter column approval_status set default 'pending';
