import type { Migration } from '../migration_runner';

const DDL_PHASE_2 = `
CREATE TABLE IF NOT EXISTS external_ref (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES job(id) ON DELETE CASCADE,
  system_key TEXT NOT NULL,
  ref_value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(job_id, system_key)
);

CREATE TABLE IF NOT EXISTS job_category (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES job(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES category(id),
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE(job_id, category_id)
);

CREATE TABLE IF NOT EXISTS job_template (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  placeholders TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

export const migration_002_phase2: Migration = {
    version: 2,
    description: 'Phase 2 DDL (external_ref, job_category, job_template)',
    up(db) {
        db.exec(DDL_PHASE_2);
    },
};
