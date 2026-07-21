create table if not exists product_catalog (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  title text not null,
  image_url text,
  purchase_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table reward_items add column if not exists product_id uuid references product_catalog(id) on delete set null;
alter table reward_items add column if not exists rank_order int check (rank_order is null or rank_order > 0);
create index if not exists product_catalog_tenant_idx on product_catalog(tenant_id, created_at desc);
create index if not exists reward_items_campaign_rank_idx on reward_items(campaign_id, rank_order);
grant select, insert, update, delete on table product_catalog to service_role;
