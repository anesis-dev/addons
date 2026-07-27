-- The first migration. `sqlx migrate add <name>` creates the next one.
--
-- This file is intentionally almost empty: it exists so `sqlx::migrate!()` has a
-- directory to compile against, and so the migration table is created on the
-- first run rather than the first time a real schema change ships.

CREATE TABLE IF NOT EXISTS health_check (
    id         INTEGER PRIMARY KEY,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
