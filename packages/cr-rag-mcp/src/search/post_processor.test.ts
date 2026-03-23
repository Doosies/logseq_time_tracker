import { describe, expect, it } from 'vitest';

import type { SearchResult } from './engine.js';
import { PostProcessor } from './post_processor.js';
import type { CommitDocumentMetadata } from '../types/documents.js';

const BASE_COMMITTED_AT = '2024-06-01T12:00:00.000Z';

function createCommitMetadata(
    partial: Partial<Omit<CommitDocumentMetadata, 'doc_type'>> &
        Pick<CommitDocumentMetadata, 'commit_hash' | 'file_paths'>,
): CommitDocumentMetadata {
    const committed_at = partial.committed_at ?? BASE_COMMITTED_AT;
    return {
        doc_type: 'commit',
        commit_hash: partial.commit_hash,
        commit_short: partial.commit_short ?? 'abc1234',
        project_id: partial.project_id ?? 'test-proj',
        branch: partial.branch ?? 'main',
        author: partial.author ?? 'tester',
        committed_at,
        change_type: partial.change_type ?? 'feat',
        files_changed: partial.files_changed ?? 1,
        total_additions: partial.total_additions ?? 1,
        total_deletions: partial.total_deletions ?? 0,
        file_paths: partial.file_paths,
        symbols_modified: partial.symbols_modified ?? [],
        file_roles: partial.file_roles ?? [],
        reason_known: partial.reason_known ?? true,
        reason_inferred: partial.reason_inferred ?? false,
        reason_supplemented: partial.reason_supplemented ?? false,
        confidence_score: partial.confidence_score ?? 0.9,
        verified_at: partial.verified_at ?? committed_at,
        impact: partial.impact ?? 'low',
    };
}

function createSearchResult(params: {
    id: string;
    commit_hash: string;
    file_paths: string[];
    similarity_score: number;
    final_score: number;
    time_decay_factor?: number;
    distance?: number;
    document?: string | null;
}): SearchResult {
    const time_decay_factor = params.time_decay_factor ?? 1;
    const distance = params.distance ?? 1 - params.similarity_score;
    return {
        id: params.id,
        document: params.document ?? 'chunk text',
        distance,
        metadata: createCommitMetadata({
            commit_hash: params.commit_hash,
            file_paths: params.file_paths,
        }),
        similarity_score: params.similarity_score,
        time_decay_factor,
        final_score: params.final_score,
    };
}

describe('PostProcessor', () => {
    it('similarity_score가 0.25 이상이면 필터를 통과한다', () => {
        const processor = new PostProcessor();
        const raw = [
            createSearchResult({
                id: '1',
                commit_hash: 'aaa',
                file_paths: ['src/a.ts'],
                similarity_score: 0.25,
                final_score: 0.25,
            }),
        ];
        const out = processor.process(raw);
        expect(out.results).toHaveLength(1);
        expect(out.metadata.after_filter).toBe(1);
    });

    it('similarity_score가 0.25 미만이면 필터에서 제거된다', () => {
        const processor = new PostProcessor();
        const raw = [
            createSearchResult({
                id: '1',
                commit_hash: 'aaa',
                file_paths: ['src/a.ts'],
                similarity_score: 0.24,
                final_score: 0.9,
            }),
        ];
        const out = processor.process(raw);
        expect(out.results).toHaveLength(0);
        expect(out.metadata.after_filter).toBe(0);
    });

    it('similarity_score는 통과하지만 final_score가 0.25 미만인 결과도 필터를 통과한다', () => {
        const processor = new PostProcessor();
        const raw = [
            createSearchResult({
                id: '1',
                commit_hash: 'aaa',
                file_paths: ['src/a.ts'],
                similarity_score: 0.3,
                final_score: 0.1,
            }),
        ];
        const out = processor.process(raw);
        expect(out.results).toHaveLength(1);
        expect(out.results[0]!.score).toBeCloseTo(0.1, 5);
        expect(out.results[0]!.similarity_score).toBeCloseTo(0.3, 5);
    });

    it('결과가 final_score 내림차순으로 정렬된다', () => {
        const processor = new PostProcessor();
        const raw = [
            createSearchResult({
                id: '1',
                commit_hash: 'aaa',
                file_paths: ['src/a.ts'],
                similarity_score: 0.5,
                final_score: 0.3,
            }),
            createSearchResult({
                id: '2',
                commit_hash: 'bbb',
                file_paths: ['src/b.ts'],
                similarity_score: 0.5,
                final_score: 0.7,
            }),
        ];
        const out = processor.process(raw);
        expect(out.results.map((r) => r.score)).toEqual([0.7, 0.3]);
    });

    it('ProcessedSearchResult에 similarity_score 필드가 포함된다', () => {
        const processor = new PostProcessor();
        const sim = 0.42;
        const raw = [
            createSearchResult({
                id: '1',
                commit_hash: 'aaa',
                file_paths: ['src/a.ts'],
                similarity_score: sim,
                final_score: 0.2,
            }),
        ];
        const out = processor.process(raw);
        expect(out.results[0]).toMatchObject({
            similarity_score: sim,
            score: 0.2,
        });
    });

    it('동일 commit_hash는 첫 번째 결과만 유지한다', () => {
        const processor = new PostProcessor();
        const raw = [
            createSearchResult({
                id: 'first',
                commit_hash: 'same',
                file_paths: ['src/a.ts'],
                similarity_score: 0.5,
                final_score: 0.2,
            }),
            createSearchResult({
                id: 'second',
                commit_hash: 'same',
                file_paths: ['src/b.ts'],
                similarity_score: 0.6,
                final_score: 0.9,
            }),
        ];
        const out = processor.process(raw);
        expect(out.results).toHaveLength(1);
        expect(out.results[0]!.commit_hash).toBe('same');
        expect(out.results[0]!.score).toBeCloseTo(0.2, 5);
        expect(out.metadata.after_dedup).toBe(1);
    });

    it('파일 경로 겹침이 80% 초과이면 final_score가 더 높은 결과만 유지한다', () => {
        const processor = new PostProcessor();
        const shared_files = ['src/x.ts', 'src/y.ts'];
        const raw = [
            createSearchResult({
                id: 'low',
                commit_hash: 'hash-low',
                file_paths: shared_files,
                similarity_score: 0.5,
                final_score: 0.4,
            }),
            createSearchResult({
                id: 'high',
                commit_hash: 'hash-high',
                file_paths: shared_files,
                similarity_score: 0.5,
                final_score: 0.8,
            }),
        ];
        const out = processor.process(raw);
        expect(out.results).toHaveLength(1);
        expect(out.results[0]!.commit_hash).toBe('hash-high');
        expect(out.results[0]!.score).toBeCloseTo(0.8, 5);
    });

    it('파일 경로 겹침이 80% 초과일 때 기존 점수가 더 높으면 후보는 버려진다', () => {
        const processor = new PostProcessor();
        const shared_files = ['src/x.ts', 'src/y.ts'];
        const raw = [
            createSearchResult({
                id: 'high',
                commit_hash: 'hash-high',
                file_paths: shared_files,
                similarity_score: 0.5,
                final_score: 0.9,
            }),
            createSearchResult({
                id: 'low',
                commit_hash: 'hash-low',
                file_paths: shared_files,
                similarity_score: 0.5,
                final_score: 0.3,
            }),
        ];
        const out = processor.process(raw);
        expect(out.results).toHaveLength(1);
        expect(out.results[0]!.commit_hash).toBe('hash-high');
    });
});
