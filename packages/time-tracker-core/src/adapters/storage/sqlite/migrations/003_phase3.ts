import type { Migration } from '../migration_runner';

const META_TS = '2026-01-01T00:00:00.000Z';

const DDL_PHASE_3 = `
CREATE TABLE IF NOT EXISTS data_type (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entity_type (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS data_field (
  id TEXT PRIMARY KEY,
  entity_type_id TEXT NOT NULL REFERENCES entity_type(id),
  data_type TEXT NOT NULL REFERENCES data_type(key),
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  view_type TEXT NOT NULL DEFAULT 'default',
  is_required INTEGER NOT NULL DEFAULT 0,
  is_system INTEGER NOT NULL DEFAULT 0,
  default_value TEXT,
  options TEXT,
  relation_entity_key TEXT,
  sort_order INTEGER,
  created_at TEXT NOT NULL,
  UNIQUE(entity_type_id, key)
);
`;

const SEED_PHASE_3 = `
INSERT OR IGNORE INTO data_type (id, key, label, description, created_at) VALUES
  ('dt-string', 'string', '텍스트', '', '${META_TS}'),
  ('dt-decimal', 'decimal', '소수', '', '${META_TS}'),
  ('dt-date', 'date', '날짜', '', '${META_TS}'),
  ('dt-datetime', 'datetime', '날짜+시간', '', '${META_TS}'),
  ('dt-boolean', 'boolean', '참/거짓', '', '${META_TS}'),
  ('dt-enum', 'enum', '선택 목록', '', '${META_TS}'),
  ('dt-relation', 'relation', '엔티티 참조', '', '${META_TS}');

INSERT OR IGNORE INTO entity_type (id, key, label, description, created_at, updated_at) VALUES
  ('et-job', 'job', '잡', '', '${META_TS}', '${META_TS}'),
  ('et-category', 'category', '카테고리', '', '${META_TS}', '${META_TS}'),
  ('et-time-entry', 'time_entry', '시간 기록', '', '${META_TS}', '${META_TS}'),
  ('et-job-history', 'job_history', '잡 히스토리', '', '${META_TS}', '${META_TS}'),
  ('et-job-template', 'job_template', '잡 템플릿', '', '${META_TS}', '${META_TS}');
`;

export const migration_003_phase3: Migration = {
    version: 3,
    description: 'Phase 3B DDL (data_type, entity_type, data_field) + seed',
    up(db) {
        db.exec(DDL_PHASE_3);
        db.exec(SEED_PHASE_3);
    },
};
