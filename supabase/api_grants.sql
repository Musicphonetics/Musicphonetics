-- =============================================================================
-- Data API grants
-- =============================================================================
-- Keeps every public-schema table reachable through the Supabase Data API
-- (supabase-js / PostgREST / GraphQL) after Supabase's 30 Oct 2026 change.
--
-- WHAT CHANGED (Supabase notice):
--   From 30 Oct 2026, Supabase stops automatically granting Data API access to
--   NEW tables in the "public" schema. Tables that already exist on the live
--   project are NOT affected — they keep their current grants and stay
--   reachable. A table created WITHOUT a grant from that date onwards returns
--   "permission denied" from the API.
--
-- WHY THIS FILE EXISTS:
--   These SQL files are applied by hand; there is no CLI migration chain. The
--   live project is therefore fine as-is. This script matters only when the
--   schema is RE-CREATED from these files — a brand-new project, a preview
--   branch, or `supabase db reset` — so the recreated tables behave exactly
--   like production does today instead of returning "permission denied".
--
-- SAFETY:
--   These are TABLE-level transport privileges only. Every table in this schema
--   has Row Level Security enabled, so which ROWS each role can see or change is
--   still decided entirely by the RLS policies in the other files. This grant
--   exposes nothing that RLS would otherwise hide — it restores the same access
--   Supabase granted by default before the change. Idempotent: safe to re-run.
--
-- HOW TO RUN:
--   Run it in the Supabase SQL editor (which executes as the table-owning role
--   `postgres`) AFTER the table-creating scripts have run. On a fresh project or
--   preview branch, run it last. Re-running it on the live project is a no-op.
-- =============================================================================

-- Roles must be able to see the schema at all.
grant usage on schema public to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 1) Every table and sequence that exists right now.
--    (ALL TABLES / ALL SEQUENCES covers the whole schema in one statement, so
--    there is nothing to keep in sync as tables are added.)
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on all tables    in schema public to anon, authenticated;
grant all                            on all tables    in schema public to service_role;

-- Sequences are needed when the API inserts into identity / serial columns.
grant usage, select                  on all sequences in schema public to anon, authenticated;
grant all                            on all sequences in schema public to service_role;

-- -----------------------------------------------------------------------------
-- 2) Any table or sequence created in "public" FROM NOW ON gets the same grants
--    automatically. This re-establishes the pre-30-Oct-2026 behaviour for this
--    project, so a new table never surprises you with "permission denied".
--    Access is still gated by RLS — remember to enable RLS on every new table
--    (every existing table here already does).
-- -----------------------------------------------------------------------------
alter default privileges in schema public
  grant select, insert, update, delete on tables    to anon, authenticated;
alter default privileges in schema public
  grant all                            on tables    to service_role;
alter default privileges in schema public
  grant usage, select                  on sequences to anon, authenticated;
alter default privileges in schema public
  grant all                            on sequences to service_role;
