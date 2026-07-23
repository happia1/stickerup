alter table public.tenants
  drop constraint if exists tenants_owner_teacher_id_fkey;

alter table public.tenants
  add constraint tenants_owner_teacher_id_fkey
  foreign key (owner_teacher_id)
  references public.teachers (id)
  on delete set null
  deferrable initially deferred;
