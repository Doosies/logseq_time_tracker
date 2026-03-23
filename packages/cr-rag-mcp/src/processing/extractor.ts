import type { RawCommit, RawDiff } from '../types/git.js';
import type { CrRagConfig } from '../types/config.js';
import type { FileChange, StructuredFacts } from '../types/facts.js';
import { extractSymbolsFromHunks } from './hunk_parser.js';
import { inferFileRole } from './file_role.js';

const CONVENTIONAL_RE = /^(\w+)(?:\(([^)]+)\))?!?:\s*(.+)$/;

export function extractStructuredFacts(commit: RawCommit, diff: RawDiff, config?: CrRagConfig): StructuredFacts {
    const conventional = commit.subject.match(CONVENTIONAL_RE);

    const files: FileChange[] = diff.files.map((f) => {
        const change: FileChange = {
            path: f.path,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions,
            functions_modified: extractSymbolsFromHunks(f.patch),
            file_role: inferFileRole(f.path, config),
        };
        if (f.old_path !== undefined) {
            change.old_path = f.old_path;
        }
        return change;
    });

    const base: StructuredFacts = {
        commit_hash: commit.hash,
        author: commit.author,
        date: commit.date,
        message: commit.subject,
        files,
        total_additions: files.reduce((sum, f) => sum + f.additions, 0),
        total_deletions: files.reduce((sum, f) => sum + f.deletions, 0),
    };

    if (conventional?.[1] !== undefined) {
        base.conventional_type = conventional[1];
    }
    if (conventional?.[2] !== undefined) {
        base.conventional_scope = conventional[2];
    }

    return base;
}
