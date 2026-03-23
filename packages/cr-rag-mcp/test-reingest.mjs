import { resolve } from 'node:path';
import { rm } from 'node:fs/promises';
import { VectorStore } from './dist/storage/vector_db.js';
import { JsonMetaStore } from './dist/storage/meta_store.js';
import { EmbeddingGenerator } from './dist/processing/embedder.js';
import { runIngestPipeline } from './dist/pipeline/ingest_pipeline.js';

const api_key = process.env['OPENAI_API_KEY'];
if (!api_key) {
    console.error('OPENAI_API_KEY is required');
    process.exit(1);
}

const data_dir = resolve(process.cwd(), '.cr-rag-data');

console.log('=== Step 1: Clean up existing data ===');

const commit_docs_dir = resolve(data_dir, 'commit_docs', 'flexion');
try {
    await rm(commit_docs_dir, { recursive: true, force: true });
    console.log(`  Deleted: ${commit_docs_dir}`);
} catch {
    console.log(`  No existing commit_docs to delete`);
}

const pipeline_state_file = resolve(data_dir, 'pipeline_flexion.json');
try {
    await rm(pipeline_state_file, { force: true });
    console.log(`  Deleted: ${pipeline_state_file}`);
} catch {
    console.log(`  No existing pipeline state to delete`);
}

try {
    const res = await fetch('http://localhost:8000/api/v2/tenants/default_tenant/databases/default_database/collections/cr_rag_gate_test', { method: 'DELETE' });
    if (res.ok) {
        console.log('  Deleted ChromaDB collection: cr_rag_gate_test');
    } else {
        console.log(`  ChromaDB delete returned ${res.status} (may not exist)`);
    }
} catch {
    console.log('  No existing ChromaDB collection to delete');
}

const vector_store = new VectorStore({
    chroma_client_args: { host: 'localhost', port: 8000 },
    collection_name: 'cr_rag_gate_test',
});
await vector_store.init();
console.log('  Created fresh ChromaDB collection: cr_rag_gate_test');

const meta_store = new JsonMetaStore(data_dir);
const embedder = new EmbeddingGenerator(api_key);

console.log();
console.log('=== Step 2: Re-ingest ===');
console.log('  repo_path: D:\\ecxsolution\\flexion');
console.log('  project_id: flexion');
console.log('  mode: incremental');
console.log('  since_date: 2026-03-11');
console.log();

const result = await runIngestPipeline(
    'D:\\ecxsolution\\flexion',
    'flexion',
    'incremental',
    vector_store,
    embedder,
    meta_store,
    undefined,
    { since_date: '2026-03-11' },
);

console.log('=== Ingest Result ===');
console.log(JSON.stringify(result, null, 2));
console.log();
console.log(`Processed: ${result.processed}`);
console.log(`Indexed:   ${result.indexed}`);
console.log(`Failed:    ${result.failed}`);
console.log(`Skipped:   ${result.skipped}`);
console.log(`Duration:  ${(result.duration_ms / 1000).toFixed(1)}s`);

const pass_rate = result.processed > 0 ? ((result.indexed / result.processed) * 100).toFixed(1) : '0';
console.log(`Pass rate: ${pass_rate}%`);

if (result.errors.length > 0) {
    console.log();
    console.log('=== Errors ===');
    for (const err of result.errors) {
        console.log(`  - ${err}`);
    }
}

const count = await vector_store.count();
console.log();
console.log(`ChromaDB documents: ${count}`);
