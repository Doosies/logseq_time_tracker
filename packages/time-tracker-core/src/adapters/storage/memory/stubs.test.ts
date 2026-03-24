import { describe, expect, it } from 'vitest';
import { StorageError } from '../../../errors';
import { StubExternalRefRepository, StubTemplateRepository } from './stubs';

describe('Stub 저장소', () => {
    it('StubExternalRefRepository 메서드 호출 시 StorageError', async () => {
        const repo = new StubExternalRefRepository();
        await expect(repo.getExternalRefs('j')).rejects.toMatchObject({
            name: 'StorageError',
            operation: 'stub',
        });
        await expect(repo.deleteByJobId('j')).rejects.toBeInstanceOf(StorageError);
    });

    it('StubTemplateRepository 메서드 호출 시 StorageError', async () => {
        const repo = new StubTemplateRepository();
        await expect(repo.getTemplates()).rejects.toMatchObject({
            name: 'StorageError',
            operation: 'stub',
        });
        await expect(repo.getTemplateById('t')).rejects.toBeInstanceOf(StorageError);
    });
});
