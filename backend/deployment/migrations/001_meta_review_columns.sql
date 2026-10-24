-- Flazly — schema changes required by the Meta App Review fixes.
--
-- RUN THIS BEFORE (or immediately after) DEPLOYING. DB_SYNC is false in production, so
-- TypeORM does not create these columns itself. TypeORM enumerates every declared column
-- in its SELECT statements, so a deployed entity with a column that does not exist in the
-- database makes ordinary reads fail — not just writes.
--
-- All statements are additive, idempotent, and non-destructive. No data is modified or
-- dropped. Safe to re-run.
--
-- Usage:
--   psql "$DATABASE_URL" -f 001_meta_review_columns.sql

BEGIN;

-- --------------------------------------------------------------------------------------
-- company.meta_user_id
--
-- App-scoped Meta user id of the person who authorised the Instagram connection.
-- Required by Meta's data-deletion and deauthorization callbacks, which identify the app
-- user by this id and nothing else. Without it those callbacks cannot resolve whose data
-- to delete.
-- --------------------------------------------------------------------------------------
ALTER TABLE company ADD COLUMN IF NOT EXISTS meta_user_id varchar;
CREATE INDEX IF NOT EXISTS idx_company_meta_user_id ON company (meta_user_id);

-- --------------------------------------------------------------------------------------
-- instagram_lead — human agent handoff
--
-- human_agent_active : while true, the automation engine must not auto-reply, so the AI
--                      does not talk over the human agent handling the conversation.
-- assigned_agent_id  : the user who claimed the conversation (the "human agent").
-- handoff_at         : when the takeover happened, for the audit trail.
-- --------------------------------------------------------------------------------------
ALTER TABLE instagram_lead ADD COLUMN IF NOT EXISTS human_agent_active boolean NOT NULL DEFAULT false;
ALTER TABLE instagram_lead ADD COLUMN IF NOT EXISTS assigned_agent_id uuid;
ALTER TABLE instagram_lead ADD COLUMN IF NOT EXISTS handoff_at timestamp;

COMMIT;

-- --------------------------------------------------------------------------------------
-- Verification — every row should report 't'.
-- --------------------------------------------------------------------------------------
-- SELECT
--   to_regclass('company') IS NOT NULL AS company_exists,
--   EXISTS (SELECT 1 FROM information_schema.columns
--           WHERE table_name='company' AND column_name='meta_user_id') AS company_meta_user_id,
--   EXISTS (SELECT 1 FROM information_schema.columns
--           WHERE table_name='instagram_lead' AND column_name='human_agent_active') AS lead_handoff_flag,
--   EXISTS (SELECT 1 FROM information_schema.columns
--           WHERE table_name='instagram_lead' AND column_name='assigned_agent_id') AS lead_agent_id,
--   EXISTS (SELECT 1 FROM information_schema.columns
--           WHERE table_name='instagram_lead' AND column_name='handoff_at') AS lead_handoff_at;
