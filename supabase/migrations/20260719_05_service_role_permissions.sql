-- Server-only onboarding and admin reads use the Supabase service_role key.
-- Keep RLS enabled for browser clients; service_role bypasses RLS but still
-- needs PostgreSQL privileges when tables were created through SQL migrations.

grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter default privileges in schema public grant all privileges on tables to service_role;
alter default privileges in schema public grant all privileges on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;
