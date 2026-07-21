create table if not exists marketplace_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text,
  purchase_url text not null,
  description text,
  category text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists marketplace_product_favorites (
  product_id uuid not null references marketplace_products(id) on delete cascade,
  teacher_id uuid not null references teachers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, teacher_id)
);

alter table product_catalog
  add column if not exists source_marketplace_product_id uuid references marketplace_products(id) on delete set null;

create unique index if not exists product_catalog_tenant_source_unique
  on product_catalog(tenant_id, source_marketplace_product_id);
create index if not exists marketplace_products_active_sort_idx
  on marketplace_products(is_active, sort_order, created_at desc);
create index if not exists marketplace_favorites_teacher_idx
  on marketplace_product_favorites(teacher_id, created_at desc);

grant select, insert, update, delete on table marketplace_products to service_role;
grant select, insert, update, delete on table marketplace_product_favorites to service_role;
