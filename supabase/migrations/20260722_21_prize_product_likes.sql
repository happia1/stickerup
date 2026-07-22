create table if not exists prize_product_likes (
  product_id uuid not null references product_catalog(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, student_id)
);
create index if not exists prize_product_likes_tenant_product_idx on prize_product_likes(tenant_id, product_id);
grant select, insert, delete on table prize_product_likes to service_role;
