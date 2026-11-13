-- Flazly — Migration 002: Add profile picture and username to instagram_lead
--
-- RUN THIS IN SUPABASE / POSTGRESQL BEFORE OR AFTER DEPLOYING.
-- All statements are additive, idempotent, and non-destructive.
--
-- Usage:
--   psql "$DATABASE_URL" -f 002_lead_profile_fields.sql

BEGIN;

-- Profile picture URL fetched from Meta Graph API
ALTER TABLE instagram_lead ADD COLUMN IF NOT EXISTS profile_pic_url text;

-- Real Instagram username (handle without @) fetched from Meta Graph API
ALTER TABLE instagram_lead ADD COLUMN IF NOT EXISTS instagram_username text;

COMMIT;

