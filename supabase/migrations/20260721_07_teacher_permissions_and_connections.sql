alter table teachers add column if not exists permissions jsonb not null default '{"notices":true,"sticker_policy":true,"classes":true,"students":true,"approvals":true,"sticker_audit":false,"ranking":true,"rewards":false}'::jsonb;
alter table invite_links add column if not exists invitee_role text not null default 'student' check (invitee_role in ('student', 'teacher'));

create table if not exists student_connection_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending','approved','expired','revoked')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  approved_by uuid references teachers(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists student_connection_requests_student_idx on student_connection_requests(student_id, status);
grant select, insert, update on table student_connection_requests to service_role;
