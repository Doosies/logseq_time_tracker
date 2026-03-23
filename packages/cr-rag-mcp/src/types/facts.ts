export interface StructuredFacts {
    commit_hash: string;
    author: string;
    date: string;
    message: string;
    conventional_type?: string;
    conventional_scope?: string;
    files: FileChange[];
    total_additions: number;
    total_deletions: number;
}

export interface FileChange {
    path: string;
    status: 'added' | 'modified' | 'deleted' | 'renamed';
    old_path?: string;
    additions: number;
    deletions: number;
    functions_modified: string[];
    file_role: string;
}
