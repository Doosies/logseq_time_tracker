export interface RawCommit {
    hash: string;
    short_hash: string;
    author: string;
    date: string; // ISO 8601
    subject: string;
    body: string;
}

export interface RawDiff {
    commit_hash: string;
    files: RawDiffFile[];
    raw_patch: string; // 전체 diff 텍스트
}

export interface RawDiffFile {
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
    old_path?: string;
    additions: number;
    deletions: number;
    patch: string; // 파일별 diff
}
