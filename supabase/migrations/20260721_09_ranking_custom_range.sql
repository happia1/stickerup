alter table ranking_period_config
  add column if not exists custom_start date,
  add column if not exists custom_end date;

alter table ranking_period_config drop constraint if exists ranking_period_config_custom_days_check;
update ranking_period_config
set custom_start = coalesce(custom_start, current_date - (coalesce(custom_days, 7) - 1)),
    custom_end = coalesce(custom_end, current_date)
where unit = 'custom';
update ranking_period_config set custom_days = null;

alter table ranking_period_config drop constraint if exists ranking_period_config_custom_range_check;
alter table ranking_period_config add constraint ranking_period_config_custom_range_check check (
  (unit = 'custom' and custom_start is not null and custom_end is not null and custom_start <= custom_end)
  or (unit <> 'custom' and custom_start is null and custom_end is null)
);
