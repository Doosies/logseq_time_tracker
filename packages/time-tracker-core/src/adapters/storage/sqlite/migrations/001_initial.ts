import type { Migration } from '../migration_runner';

const DDL_PHASE_1 = `
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS job (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  custom_fields TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_active
  ON job(status) WHERE status = 'in_progress';

CREATE TABLE IF NOT EXISTS category (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES category(id),
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS time_entry (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES job(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES category(id),
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  note TEXT,
  is_manual INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS job_history (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES job(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  reason TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

export const migration_001_initial: Migration = {
    version: 1,
    description: 'Phase 1 initial DDL (job, category, time_entry, job_history)',
    up(db) {
        db.exec(DDL_PHASE_1);
    },
};
