import { resolve } from 'node:path';
import { readdir, readFile } from 'node:fs/promises';
import { VectorStore } from './dist/storage/vector_db.js';
import { EmbeddingGenerator } from './dist/processing/embedder.js';
import { SearchEngine } from './dist/search/engine.js';
import { PostProcessor } from './dist/search/post_processor.js';

const api_key = process.env['OPENAI_API_KEY'];
if (!api_key) {
    console.error('OPENAI_API_KEY required');
    process.exit(1);
}

const vector_store = new VectorStore({
    chroma_client_args: { host: 'localhost', port: 8000 },
    collection_name: 'cr_rag_gate_test',
});
await vector_store.init();

const embedder = new EmbeddingGenerator(api_key);
const engine = new SearchEngine(vector_store, embedder);
const post_processor = new PostProcessor();

const count = await vector_store.count();
console.log(`ChromaDB documents: ${count}\n`);

// ============================
// PART 1: Search Simulation (5 queries)
// ============================
console.log('========================================');
console.log('PART 1: Search Simulation');
console.log('========================================\n');

const SEARCH_QUERIES = [
    {
        id: 1,
        description: 'ECDecimal 컴포넌트 버그 수정 관련',
        diff_text: 'ECDefaultDecimal useDecimalInput value formatting fix when focus changes',
    },
    {
        id: 2,
        description: 'withLocalState HOC 리팩토링 관련',
        diff_text:
            'refactor move withLocalState HOC and hooks from flexion-node to flexion-react package restructuring',
    },
    {
        id: 3,
        description: 'Aggregate 기능 구현 관련',
        diff_text: 'implement FlexionAggregateNode with commands handlers plugins views aggregate node feature',
    },
    {
        id: 4,
        description: 'Storybook 테스트 리팩토링 관련',
        diff_text: 'refactor aggregate storybook tests separate files per mode FlexionContextComponent step structure',
    },
    {
        id: 5,
        description: 'Grid Print Data 버그 수정 관련',
        diff_text: 'fix gridPrintData TXT not show issue resolve grid print data display problem',
    },
];

let useful_count = 0;

for (const q of SEARCH_QUERIES) {
    console.log(`=== Search ${q.id}: ${q.description} ===`);
    console.log(`Query: ${q.diff_text}\n`);

    const results = await engine.search(q.diff_text, 5);
    const processed = post_processor.process(results);

    if (processed.results.length === 0) {
        console.log('  No results found\n');
        continue;
    }

    let found_relevant = false;
    for (let i = 0; i < Math.min(processed.results.length, 3); i++) {
        const r = processed.results[i];
        console.log(`  [${i + 1}] Score: ${r.score?.toFixed(3) ?? 'N/A'}`);
        console.log(`      Commit: ${r.commit_hash?.slice(0, 7)} by ${r.author}`);
        console.log(`      Type: ${r.change_type} | Confidence: ${r.confidence_score}`);
        console.log(`      Paths: ${(r.file_paths ?? []).slice(0, 3).join(', ')}`);
        console.log(`      Impact: ${(r.impact ?? '').slice(0, 120)}`);
        console.log();
        if (r.score > 0.5 && i === 0) found_relevant = true;
    }

    if (found_relevant) useful_count++;
    console.log(`  Total results: ${processed.results.length}`);
    console.log(`  Useful: ${found_relevant ? 'YES' : 'NO'}`);
    console.log(`  ${JSON.stringify(processed.metadata)}\n`);
}

console.log(`Search usefulness: ${useful_count}/5\n`);

// ============================
// PART 2: Grouping Verification
// ============================
console.log('========================================');
console.log('PART 2: Grouping Verification');
console.log('========================================\n');

const docs_dir = resolve(process.cwd(), '.cr-rag-data', 'commit_docs', 'flexion');
let files;
try {
    files = await readdir(docs_dir);
} catch {
    console.log('No commit docs directory found');
    process.exit(1);
}

const json_files = files.filter((f) => f.endsWith('.json'));
console.log(`Total JSON docs: ${json_files.length}\n`);

const grouped_docs = [];
const all_docs = [];

for (const f of json_files) {
    const raw = await readFile(resolve(docs_dir, f), 'utf-8');
    const doc = JSON.parse(raw);
    all_docs.push(doc);
    if (doc.group_id) {
        grouped_docs.push(doc);
    }
}

console.log(`Docs with group metadata: ${grouped_docs.length}`);
console.log(`Docs without group: ${all_docs.length - grouped_docs.length}\n`);

const groups = new Map();
for (const doc of grouped_docs) {
    if (!groups.has(doc.group_id)) {
        groups.set(doc.group_id, []);
    }
    groups.get(doc.group_id).push(doc);
}

console.log(`Distinct groups: ${groups.size}\n`);

for (const [gid, members] of groups) {
    members.sort((a, b) => a.group_index - b.group_index);
    console.log(`Group ${gid.slice(0, 7)} (size=${members[0].group_size}):`);
    for (const m of members) {
        console.log(
            `  [${m.group_index}] ${m.commit_hash.slice(0, 7)} by ${m.author} — ${m.change_type} — ${m.impact?.slice(0, 80)}`,
        );
    }

    const expected_size = members[0].group_size;
    const actual_size = members.length;
    const indices = members.map((m) => m.group_index).sort((a, b) => a - b);
    const expected_indices = Array.from({ length: expected_size }, (_, i) => i);
    const indices_ok = JSON.stringify(indices) === JSON.stringify(expected_indices);

    console.log(`  Validation: expected_size=${expected_size}, actual=${actual_size}, indices_ok=${indices_ok}`);
    if (!indices_ok || actual_size !== expected_size) {
        console.log(`  ⚠ MISMATCH!`);
    }
    console.log();
}

// ============================
// PART 3: ChromaDB Group Search Verification
// ============================
console.log('========================================');
console.log('PART 3: ChromaDB Group Search');
console.log('========================================\n');

if (groups.size > 0) {
    const first_group_id = [...groups.keys()][0];
    console.log(`Testing group_id filter: ${first_group_id.slice(0, 7)}...\n`);

    const group_member = groups.get(first_group_id)[0];
    const found = await vector_store.getFirstByCommitHash(group_member.commit_hash);

    if (found) {
        console.log(`  Found commit ${found.metadata.commit_hash.slice(0, 7)} in ChromaDB`);
        console.log(`  group_id: ${found.metadata.group_id ?? 'MISSING'}`);
        console.log(`  group_size: ${found.metadata.group_size ?? 'MISSING'}`);
        console.log(`  group_index: ${found.metadata.group_index ?? 'MISSING'}`);
    } else {
        console.log(`  ⚠ Could not find commit in ChromaDB`);
    }
} else {
    console.log('No groups found to test ChromaDB search');
}

// ============================
// PART 4: Impact Accuracy Spot Check
// ============================
console.log('\n========================================');
console.log('PART 4: Impact Accuracy Spot Check');
console.log('========================================\n');

const target_hashes = ['0d27d63'];
for (const short_hash of target_hashes) {
    const doc = all_docs.find((d) => d.commit_hash?.startsWith(short_hash));
    if (doc) {
        console.log(`Commit ${doc.commit_hash.slice(0, 7)}:`);
        console.log(`  Files: ${doc.files_changed}`);
        console.log(`  Type: ${doc.change_type}`);
        console.log(`  Impact: ${doc.impact}`);
        console.log(`  Risk: ${doc.risk_notes ?? 'none'}`);
        console.log();
    } else {
        console.log(`Commit ${short_hash} not found in docs\n`);
    }
}

console.log('=== Validation Complete ===');
