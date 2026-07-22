-- Limit attendance and homework to one check per student, class, and Korea date.
-- Historical duplicate rows are retained; only the earliest row gets a check_date.

alter table attendance_records add column if not exists check_date date;
alter table homework_submissions add column if not exists check_date date;

with ranked as (
  select id,
         (checked_at at time zone 'Asia/Seoul')::date as local_date,
         row_number() over (
           partition by student_id, class_id, (checked_at at time zone 'Asia/Seoul')::date
           order by checked_at, id
         ) as row_number
  from attendance_records
)
update attendance_records records
set check_date = ranked.local_date
from ranked
where records.id = ranked.id and ranked.row_number = 1 and records.check_date is null;

with ranked as (
  select id,
         (submitted_at at time zone 'Asia/Seoul')::date as local_date,
         row_number() over (
           partition by student_id, class_id, (submitted_at at time zone 'Asia/Seoul')::date
           order by submitted_at, id
         ) as row_number
  from homework_submissions
)
update homework_submissions submissions
set check_date = ranked.local_date
from ranked
where submissions.id = ranked.id and ranked.row_number = 1 and submissions.check_date is null;

create unique index if not exists attendance_once_per_day
  on attendance_records (student_id, class_id, check_date)
  where check_date is not null;

create unique index if not exists homework_once_per_day
  on homework_submissions (student_id, class_id, check_date)
  where check_date is not null;
