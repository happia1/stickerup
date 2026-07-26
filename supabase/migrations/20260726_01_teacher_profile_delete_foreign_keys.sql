-- 관리자 본인 계정 삭제 시 학원·학생·승인 이력은 유지하고 선생님 참조만 비운다.
alter table public.teachers drop constraint if exists teachers_invited_by_fkey;
alter table public.teachers add constraint teachers_invited_by_fkey foreign key (invited_by) references public.teachers(id) on delete set null;

alter table public.students drop constraint if exists students_invited_by_teacher_id_fkey;
alter table public.students add constraint students_invited_by_teacher_id_fkey foreign key (invited_by_teacher_id) references public.teachers(id) on delete set null;
alter table public.students drop constraint if exists students_invite_link_id_fkey;
alter table public.students add constraint students_invite_link_id_fkey foreign key (invite_link_id) references public.invite_links(id) on delete set null;

alter table public.enrollments drop constraint if exists enrollments_approver_id_fkey;
alter table public.enrollments add constraint enrollments_approver_id_fkey foreign key (approver_id) references public.teachers(id) on delete set null;
alter table public.homework_submissions drop constraint if exists homework_submissions_approver_id_fkey;
alter table public.homework_submissions add constraint homework_submissions_approver_id_fkey foreign key (approver_id) references public.teachers(id) on delete set null;
alter table public.praise_requests drop constraint if exists praise_requests_approver_id_fkey;
alter table public.praise_requests add constraint praise_requests_approver_id_fkey foreign key (approver_id) references public.teachers(id) on delete set null;
alter table public.sticker_ledger drop constraint if exists sticker_ledger_actor_teacher_id_fkey;
alter table public.sticker_ledger add constraint sticker_ledger_actor_teacher_id_fkey foreign key (actor_teacher_id) references public.teachers(id) on delete set null;
alter table public.notices drop constraint if exists notices_author_teacher_id_fkey;
alter table public.notices add constraint notices_author_teacher_id_fkey foreign key (author_teacher_id) references public.teachers(id) on delete set null;

alter table public.student_connection_requests drop constraint if exists student_connection_requests_approved_by_fkey;
alter table public.student_connection_requests add constraint student_connection_requests_approved_by_fkey foreign key (approved_by) references public.teachers(id) on delete set null;
