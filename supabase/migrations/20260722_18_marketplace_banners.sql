create table if not exists marketplace_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null default '프로모션',
  image_url text,
  link_url text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_banners_active_sort_idx
  on marketplace_banners(is_active, sort_order, created_at desc);

grant select, insert, update, delete on table marketplace_banners to service_role;
