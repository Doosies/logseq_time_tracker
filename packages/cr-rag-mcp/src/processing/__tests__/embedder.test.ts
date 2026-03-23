import { describe, expect, it } from 'vitest';

import type { StructuredFacts } from '../../types/facts.js';
import type { CommitSummary } from '../../types/summary.js';
import {
    MAX_DIRS,
    MAX_INLINE_FILES,
    MAX_SYMBOLS,
    buildContent,
    summarizeFilePaths,
    summarizeSymbols,
} from '../embedder.js';

function createCommitSummary(partial: Partial<CommitSummary> & Pick<CommitSummary, 'what'>): CommitSummary {
    return {
        what: partial.what,
        reason_known: partial.reason_known ?? false,
        reason_inferred: partial.reason_inferred ?? false,
        reason: partial.reason ?? null,
        change_type: partial.change_type ?? 'chore',
        impact: partial.impact ?? 'low',
        risk_notes: partial.risk_notes ?? null,
    };
}

function createFileChange(path: string, functions_modified: string[] = []): StructuredFacts['files'][number] {
    return {
        path,
        status: 'modified',
        additions: 1,
        deletions: 0,
        functions_modified,
        file_role: 'source',
    };
}

function createStructuredFacts(partial: Partial<StructuredFacts> & Pick<StructuredFacts, 'files'>): StructuredFacts {
    return {
        commit_hash: partial.commit_hash ?? 'abc123',
        author: partial.author ?? 'tester',
        date: partial.date ?? '2024-01-01',
        message: partial.message ?? 'test',
        files: partial.files,
        total_additions: partial.total_additions ?? 1,
        total_deletions: partial.total_deletions ?? 0,
    };
}

describe('embedder 상수', () => {
    it('경계값 상수가 요구사항과 일치한다', () => {
        expect(MAX_INLINE_FILES).toBe(5);
        expect(MAX_DIRS).toBe(5);
        expect(MAX_SYMBOLS).toBe(10);
    });
});

describe('summarizeFilePaths', () => {
    it('빈 배열이면 파일 라벨만 반환한다', () => {
        expect(summarizeFilePaths([])).toBe('파일: ');
    });

    it('파일이 1개면 전체 경로를 나열한다', () => {
        expect(summarizeFilePaths(['src/foo.ts'])).toBe('파일: src/foo.ts');
    });

    it('파일이 5개면 전체 경로를 쉼표로 나열한다', () => {
        const paths = ['src/a.ts', 'src/b.ts', 'src/c.ts', 'src/d.ts', 'src/e.ts'];
        expect(summarizeFilePaths(paths)).toBe(`파일: ${paths.join(', ')}`);
    });

    it('파일이 6개면 디렉터리별 집계 형식(변경 영역)으로 반환한다', () => {
        const paths = ['src/a.ts', 'src/b.ts', 'src/c.ts', 'src/d.ts', 'src/e.ts', 'src/f.ts'];
        expect(summarizeFilePaths(paths)).toBe('변경 영역: src/ (6) (총 6파일)');
    });

    it('대규모(20개 이상 파일, 7개 이상 디렉터리)에서는 상위 5개 디렉터리와 나머지 요약을 표시한다', () => {
        const paths: string[] = [];
        for (let i = 0; i < 5; i += 1) {
            paths.push(`a/f${i}.ts`);
        }
        for (let i = 0; i < 4; i += 1) {
            paths.push(`b/f${i}.ts`);
        }
        for (let i = 0; i < 3; i += 1) {
            paths.push(`c/f${i}.ts`);
        }
        for (let i = 0; i < 3; i += 1) {
            paths.push(`d/f${i}.ts`);
        }
        for (let i = 0; i < 2; i += 1) {
            paths.push(`e/f${i}.ts`);
        }
        for (let i = 0; i < 2; i += 1) {
            paths.push(`f/f${i}.ts`);
        }
        for (let i = 0; i < 2; i += 1) {
            paths.push(`g/f${i}.ts`);
        }
        expect(paths).toHaveLength(21);
        const result = summarizeFilePaths(paths);
        expect(result).toBe('변경 영역: a/ (5), b/ (4), c/ (3), d/ (3), e/ (2) 외 2개 디렉토리 (총 21파일)');
    });

    it('같은 디렉터리에 여러 파일이 있으면 파일 수 집계가 정확하다', () => {
        const paths = ['pkg/x.ts', 'pkg/y.ts', 'pkg/z.ts', 'other/a.ts', 'other/b.ts', 'other/c.ts'];
        expect(summarizeFilePaths(paths)).toBe('변경 영역: other/ (3), pkg/ (3) (총 6파일)');
    });

    it('Windows 경로(백슬래시)를 슬래시 기준으로 디렉터리를 묶는다', () => {
        const paths = [
            'packages\\cr-rag\\src\\a.ts',
            'packages\\cr-rag\\src\\b.ts',
            'packages\\cr-rag\\src\\c.ts',
            'packages\\cr-rag\\src\\d.ts',
            'packages\\cr-rag\\src\\e.ts',
            'packages\\cr-rag\\src\\f.ts',
        ];
        expect(summarizeFilePaths(paths)).toBe('변경 영역: packages/cr-rag/src/ (6) (총 6파일)');
    });

    it('루트 레벨 파일은 디렉터리 접두사 "."으로 집계한다', () => {
        const paths = ['README.md', 'LICENSE', 'a.ts', 'b.ts', 'c.ts', 'd.ts'];
        expect(summarizeFilePaths(paths)).toBe('변경 영역: . (6) (총 6파일)');
    });
});

describe('summarizeSymbols', () => {
    it('빈 배열이면 null을 반환한다', () => {
        expect(summarizeSymbols([])).toBeNull();
    });

    it('심볼이 1개면 심볼 라벨로 나열한다', () => {
        expect(summarizeSymbols(['Foo'])).toBe('심볼: Foo');
    });

    it('심볼이 10개면 전부 심볼 라벨로 나열한다', () => {
        const names = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10'];
        expect(summarizeSymbols(names)).toBe(`심볼: ${names.join(', ')}`);
    });

    it('심볼이 11개면 상위 10개와 나머지 개수를 주요 심볼로 표시한다', () => {
        const names = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11'];
        expect(summarizeSymbols(names)).toBe('주요 심볼: s1, s2, s3, s4, s5, s6, s7, s8, s9, s10 외 1개');
    });

    it('중복 심볼은 순서를 유지한 채 제거한 뒤 개수를 센다', () => {
        expect(summarizeSymbols(['a', 'b', 'a', 'c', 'b'])).toBe('심볼: a, b, c');
    });

    it('심볼이 20개면 상위 10개와 외 10개로 표시한다', () => {
        const names = Array.from({ length: 20 }, (_, i) => `sym${i + 1}`);
        const head = names.slice(0, 10).join(', ');
        expect(summarizeSymbols(names)).toBe(`주요 심볼: ${head} 외 10개`);
    });
});

describe('buildContent', () => {
    const base_summary = createCommitSummary({ what: '요약 본문' });

    it('reason_known이 true이고 reason이 있으면 reason 줄을 포함한다', () => {
        const summary = createCommitSummary({
            what: '변경 내용',
            reason_known: true,
            reason: '버그 수정',
        });
        const facts = createStructuredFacts({ files: [createFileChange('src/a.ts')] });
        expect(buildContent(facts, summary)).toBe(['변경 내용', '버그 수정', '파일: src/a.ts'].join('\n'));
    });

    it('reason_known이 false이면 reason을 포함하지 않는다', () => {
        const summary = createCommitSummary({
            what: '변경 내용',
            reason_known: false,
            reason: '추론된 이유',
        });
        const facts = createStructuredFacts({ files: [createFileChange('src/a.ts')] });
        expect(buildContent(facts, summary)).toBe(['변경 내용', '파일: src/a.ts'].join('\n'));
    });

    it('reason이 null이면 reason을 포함하지 않는다', () => {
        const summary = createCommitSummary({
            what: '변경 내용',
            reason_known: true,
            reason: null,
        });
        const facts = createStructuredFacts({ files: [createFileChange('src/a.ts')] });
        expect(buildContent(facts, summary)).toBe(['변경 내용', '파일: src/a.ts'].join('\n'));
    });

    it('소규모 커밋(3파일, 2심볼)은 파일·심볼 나열 형식을 사용한다', () => {
        const facts = createStructuredFacts({
            files: [
                createFileChange('src/a.ts', ['fnA']),
                createFileChange('src/b.ts', ['fnB']),
                createFileChange('src/c.ts', []),
            ],
        });
        const out = buildContent(facts, base_summary);
        expect(out).toBe(['요약 본문', '파일: src/a.ts, src/b.ts, src/c.ts', '심볼: fnA, fnB'].join('\n'));
    });

    it('대규모 커밋은 변경 영역과 주요 심볼 형식을 사용한다', () => {
        const file_changes: ReturnType<typeof createFileChange>[] = [];
        for (let i = 0; i < 5; i += 1) {
            file_changes.push(createFileChange(`a/f${i}.ts`, []));
        }
        for (let i = 0; i < 4; i += 1) {
            file_changes.push(createFileChange(`b/f${i}.ts`, []));
        }
        for (let i = 0; i < 3; i += 1) {
            file_changes.push(createFileChange(`c/f${i}.ts`, []));
        }
        for (let i = 0; i < 3; i += 1) {
            file_changes.push(createFileChange(`d/f${i}.ts`, []));
        }
        for (let i = 0; i < 2; i += 1) {
            file_changes.push(createFileChange(`e/f${i}.ts`, []));
        }
        for (let i = 0; i < 2; i += 1) {
            file_changes.push(createFileChange(`f/f${i}.ts`, []));
        }
        for (let i = 0; i < 2; i += 1) {
            file_changes.push(createFileChange(`g/f${i}.ts`, []));
        }
        const symbols = Array.from({ length: 15 }, (_, i) => `sym${i + 1}`);
        file_changes[0] = createFileChange('a/f0.ts', symbols);
        const facts = createStructuredFacts({ files: file_changes });
        const out = buildContent(facts, base_summary);
        const head = symbols.slice(0, 10).join(', ');
        expect(out).toBe(
            [
                '요약 본문',
                '변경 영역: a/ (5), b/ (4), c/ (3), d/ (3), e/ (2) 외 2개 디렉토리 (총 21파일)',
                `주요 심볼: ${head} 외 5개`,
            ].join('\n'),
        );
    });

    it('심볼이 없으면 심볼 줄을 넣지 않는다', () => {
        const facts = createStructuredFacts({
            files: [createFileChange('src/a.ts', []), createFileChange('src/b.ts', [])],
        });
        const out = buildContent(facts, base_summary);
        expect(out).toBe(['요약 본문', '파일: src/a.ts, src/b.ts'].join('\n'));
    });
});
