create extension if not exists pgcrypto;

create table if not exists public.support_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  contact text not null,
  content text not null,
  status text not null default 'received' check (status in ('received', 'reviewing', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_inquiries_created_at_idx
  on public.support_inquiries (created_at desc);

alter table public.support_inquiries enable row level security;

revoke all on table public.support_inquiries from anon, authenticated;
grant all on table public.support_inquiries to service_role;
