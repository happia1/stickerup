alter table public.classes drop constraint if exists classes_ranking_unit_check;
alter table public.classes
  add constraint classes_ranking_unit_check
  check (ranking_unit in ('day', 'week', 'month', 'quarter', 'custom', 'all'));

alter table public.ranking_period_config drop constraint if exists ranking_period_config_unit_check;
alter table public.ranking_period_config
  add constraint ranking_period_config_unit_check
  check (unit in ('day', 'week', 'month', 'quarter', 'custom', 'all'));
