-- Flazly — Comment-to-DM triggers can be limited to one Instagram post.
--
-- RUN THIS BEFORE DEPLOYING the matching backend. DB_SYNC is false in production and
-- TypeORM lists every declared column in its SELECTs, so without this column every read
-- of comment_trigger fails (the Automation page and the comment webhook both break).
--
-- Additive, idempotent, non-destructive. Existing triggers get NULL, which means
-- "all posts and reels" — the behaviour they already had. Safe to re-run.
--
-- Usage:
--   psql "$DATABASE_URL" -f 002_comment_trigger_media.sql

BEGIN;

ALTER TABLE comment_trigger ADD COLUMN IF NOT EXISTS media_id varchar(64) NULL;

-- Old rows stored a made-up post name ("Latest Reel", "Reel: 10x Your Sales") that was
-- never enforced. They have always fired on every post, so label them honestly.
UPDATE comment_trigger SET post_title = 'All Posts & Reels' WHERE media_id IS NULL;

COMMIT;
