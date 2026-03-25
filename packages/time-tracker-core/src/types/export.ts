import type { Category } from './category';
import type { ExternalRef } from './external_ref';
import type { JobHistory } from './history';
import type { JobCategory } from './job_category';
import type { Job } from './job';
import type { DataField } from './meta';
import type { JobTemplate } from './template';
import type { TimeEntry } from './time_entry';

export interface ExportData {
    version: string;
    exported_at: string;
    data: {
        jobs: Job[];
        categories: Category[];
        time_entries: TimeEntry[];
        job_history: JobHistory[];
        job_categories: JobCategory[];
        job_templates: JobTemplate[];
        external_refs: ExternalRef[];
        data_fields: DataField[];
        settings: Record<string, unknown>;
    };
}

export interface ImportResult {
    success: boolean;
    imported_counts: Record<string, number>;
    errors: string[];
}
