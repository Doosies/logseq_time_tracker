import { GitCollector } from './dist/collection/git_cli.js';
import { extractStructuredFacts } from './dist/processing/extractor.js';
import { LlmSummarizer } from './dist/processing/summarizer.js';
import { verifyCommitSummary } from './dist/processing/verifier.js';

const FAILED_HASHES = [
    'e69eabce4596f6961507ea26a3f3e647d4661678',
    'cac76abef2ae20f9b28b49779a7f87ff8ad6f8a3',
    'ac8f99104fad01dd24976fc0b9f083ff67f68eac',
];

const EMPTY_SYMBOL_HASHES = [
    '5fb4bfe85e50fc1611cb25000d5a512835161d6b',
];

const api_key = process.env['OPENAI_API_KEY'];
const collector = new GitCollector('D:\\ecxsolution\\flexion');
const summarizer = new LlmSummarizer({ api_key });

console.log('=== Verification Failure Debug (3 samples) ===\n');

for (const hash of FAILED_HASHES) {
    console.log(`--- Commit: ${hash.slice(0, 7)} ---`);
    try {
        const commits = await collector.listCommits(undefined, { single_hash: hash });
        const commit = commits[0];
        if (!commit) { console.log('  Commit not found\n'); continue; }
        console.log(`  Message: ${commit.message}`);
        
        const diff = await collector.getDiff(hash);
        console.log(`  Files: ${diff.files.length}, Patch lines: ${diff.raw_patch.split('\n').length}`);
        
        const facts = extractStructuredFacts(commit, diff);
        console.log(`  Symbols: [${facts.files.flatMap(f => f.functions_modified).join(', ')}]`);
        
        const { summary } = await summarizer.summarize(facts, diff.raw_patch);
        console.log(`  LLM what: ${summary.what.slice(0, 200)}`);
        console.log(`  reason_known: ${summary.reason_known}, reason_inferred: ${summary.reason_inferred}`);
        
        const result = verifyCommitSummary(summary, facts);
        console.log(`  Passed: ${result.passed}`);
        console.log(`  Violations:`);
        for (const v of result.violations) {
            console.log(`    [${v.severity}] ${v.type}: ${v.detail}`);
        }
    } catch (e) {
        console.log(`  Error: ${e.message}`);
    }
    console.log();
}

console.log('=== Empty Symbols Debug (1 sample) ===\n');

for (const hash of EMPTY_SYMBOL_HASHES) {
    console.log(`--- Commit: ${hash.slice(0, 7)} ---`);
    try {
        const commits = await collector.listCommits(undefined, { single_hash: hash });
        const commit = commits[0];
        if (!commit) { console.log('  Commit not found\n'); continue; }
        console.log(`  Message: ${commit.message}`);
        
        const diff = await collector.getDiff(hash);
        console.log(`  Files: ${diff.files.length}`);
        
        const facts = extractStructuredFacts(commit, diff);
        const all_symbols = facts.files.flatMap(f => f.functions_modified);
        console.log(`  All symbols: [${all_symbols.join(', ')}]`);
        console.log(`  Symbols empty: ${all_symbols.length === 0}`);
        console.log(`  File paths: ${facts.files.map(f => f.path).join(', ')}`);
    } catch (e) {
        console.log(`  Error: ${e.message}`);
    }
    console.log();
}
