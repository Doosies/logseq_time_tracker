import type { ILogger } from '../adapters/logger';
import type { IUnitOfWork } from '../adapters/storage/unit_of_work';
import { HistoryService } from './history_service';
import { JobService } from './job_service';
import { CategoryService } from './category_service';
import { TimerService } from './timer_service';
import { JobCategoryService } from './job_category_service';
import { DataExportService } from './data_export_service';
import { DataFieldService } from './data_field_service';
import { TimeEntryService } from './time_entry_service';

export function createServices(uow: IUnitOfWork, logger?: ILogger) {
    const history_service = new HistoryService(uow, logger);
    const job_service = new JobService(uow, history_service, logger);
    const category_service = new CategoryService(uow, logger);
    const timer_service = new TimerService(uow, job_service, logger);
    const job_category_service = new JobCategoryService(uow, logger);
    const data_field_service = new DataFieldService(uow, logger);
    const data_export_service = new DataExportService(uow, logger);
    const time_entry_service = new TimeEntryService(uow, logger);
    return {
        history_service,
        job_service,
        category_service,
        timer_service,
        job_category_service,
        data_field_service,
        data_export_service,
        time_entry_service,
    };
}

export type Services = ReturnType<typeof createServices>;

export * from './history_service';
export * from './job_service';
export * from './category_service';
export * from './timer_service';
export * from './job_category_service';
export * from './data_field_service';
export * from './data_export_service';
export * from './time_entry_service';
