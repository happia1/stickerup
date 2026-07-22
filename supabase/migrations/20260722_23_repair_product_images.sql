update marketplace_products
set image_url = nullif(trim(image_url), ''),
    prize_image_url = nullif(trim(prize_image_url), '');

update product_catalog as catalog
set image_url = coalesce(
      nullif(trim(catalog.image_url), ''),
      nullif(trim(source.prize_image_url), ''),
      nullif(trim(source.image_url), '')
    ),
    updated_at = now()
from marketplace_products as source
where catalog.source_marketplace_product_id = source.id
  and nullif(trim(catalog.image_url), '') is null;

update product_catalog
set image_url = null
where nullif(trim(image_url), '') is null;

update reward_items as item
set image_url = catalog.image_url
from product_catalog as catalog
where item.product_id = catalog.id
  and nullif(trim(item.image_url), '') is null
  and nullif(trim(catalog.image_url), '') is not null;
