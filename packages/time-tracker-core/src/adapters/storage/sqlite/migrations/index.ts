import type { Migration } from '../migration_runner';
import { migration_001_initial } from './001_initial';
import { migration_002_phase2 } from './002_phase2';

export const ALL_MIGRATIONS: Migration[] = [migration_001_initial, migration_002_phase2];
