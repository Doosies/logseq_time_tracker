import { resolve } from 'node:path';
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
const vector_store = new VectorStore({
    chroma_client_args: { host: 'localhost', port: 8000 },
    collection_name: 'cr_rag_gate_test',
});
await vector_store.init();

const meta_store = new JsonMetaStore(data_dir);
const embedder = new EmbeddingGenerator(api_key);

console.log('Starting ingest pipeline...');
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
