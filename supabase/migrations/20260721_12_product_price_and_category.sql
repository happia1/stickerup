alter table marketplace_products
  add column if not exists price_label text;

alter table product_catalog
  add column if not exists price_label text,
  add column if not exists category text;
