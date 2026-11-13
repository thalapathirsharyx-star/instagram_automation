-- Flazly — Migration 003: Comment triggers table and lead profile fields
-- Run this in Supabase SQL Editor.

BEGIN;

-- 1. Create comment_trigger table if it doesn't exist
CREATE TABLE IF NOT EXISTS comment_trigger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status boolean DEFAULT true,
  created_by_id varchar DEFAULT '00000000-0000-0000-0000-000000000000',
  created_on timestamp DEFAULT NOW(),
  updated_by_id varchar,
  updated_on timestamp,
  company_id uuid NOT NULL,
  media_id varchar(64),
  post_title text NOT NULL DEFAULT '',
  keyword text NOT NULL DEFAULT '',
  reply_message text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_comment_trigger_company_id ON comment_trigger (company_id);

-- Ensure media_id and post_title exist if table already exists
ALTER TABLE comment_trigger ADD COLUMN IF NOT EXISTS media_id varchar(64);
ALTER TABLE comment_trigger ADD COLUMN IF NOT EXISTS post_title text DEFAULT '';

-- 2. Ensure instagram_lead columns exist
ALTER TABLE instagram_lead ADD COLUMN IF NOT EXISTS profile_pic_url text;
ALTER TABLE instagram_lead ADD COLUMN IF NOT EXISTS instagram_username text;
ALTER TABLE instagram_lead ADD COLUMN IF NOT EXISTS human_agent_active boolean NOT NULL DEFAULT false;
ALTER TABLE instagram_lead ADD COLUMN IF NOT EXISTS assigned_agent_id uuid;
ALTER TABLE instagram_lead ADD COLUMN IF NOT EXISTS handoff_at timestamp;

COMMIT;

