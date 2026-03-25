import { StorageError } from '../../../errors';
import type { DataField } from '../../../types/meta';
import type { ExternalRef } from '../../../types/external_ref';
import type { JobCategory } from '../../../types/job_category';
import type { JobTemplate } from '../../../types/template';
import type {
    IDataFieldRepository,
    IExternalRefRepository,
    IJobCategoryRepository,
    ITemplateRepository,
} from '../repositories';

const STUB_MESSAGE = 'Phase 2에서 구현 예정';

export class StubExternalRefRepository implements IExternalRefRepository {
    async getExternalRefs(_job_id: string): Promise<ExternalRef[]> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async getExternalRef(_job_id: string, _system_key: string): Promise<ExternalRef | null> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async getExternalRefBySystemAndValue(_system_key: string, _ref_value: string): Promise<ExternalRef | null> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async upsertExternalRef(_ref: ExternalRef): Promise<void> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async deleteExternalRef(_id: string): Promise<void> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async deleteByJobId(_job_id: string): Promise<void> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }
}

export class StubTemplateRepository implements ITemplateRepository {
    async getTemplates(): Promise<JobTemplate[]> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async getTemplateById(_id: string): Promise<JobTemplate | null> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async upsertTemplate(_template: JobTemplate): Promise<void> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async deleteTemplate(_id: string): Promise<void> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }
}

export class StubJobCategoryRepository implements IJobCategoryRepository {
    async getJobCategories(_job_id: string): Promise<JobCategory[]> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async getCategoryJobs(_category_id: string): Promise<JobCategory[]> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async upsertJobCategory(_jc: JobCategory): Promise<void> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async deleteJobCategory(_id: string): Promise<void> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async deleteByJobId(_job_id: string): Promise<void> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }
}

export class StubDataFieldRepository implements IDataFieldRepository {
    async getDataFields(_entity_type_id: string): Promise<DataField[]> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async getDataFieldById(_id: string): Promise<DataField | null> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async upsertDataField(_field: DataField): Promise<void> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }

    async deleteDataField(_id: string): Promise<void> {
        throw new StorageError(STUB_MESSAGE, 'stub');
    }
}
