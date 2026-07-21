alter table marketplace_products
  add column if not exists prize_image_url text;
