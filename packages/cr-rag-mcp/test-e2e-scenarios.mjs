import { resolve } from 'node:path';
import { VectorStore } from './dist/storage/vector_db.js';
import { JsonMetaStore } from './dist/storage/meta_store.js';
import { EmbeddingGenerator } from './dist/processing/embedder.js';
import { SearchEngine } from './dist/search/engine.js';
import { PostProcessor } from './dist/search/post_processor.js';
import { runIngestPipeline } from './dist/pipeline/ingest_pipeline.js';

const api_key = process.env['OPENAI_API_KEY'];
if (!api_key) {
    console.error('OPENAI_API_KEY required');
    process.exit(1);
}

const DATA_DIR = resolve(process.cwd(), '.cr-rag-data-e2e');
const CHROMA = { host: 'localhost', port: 8000 };
const COLLECTION = 'cr_rag_e2e_test';
const REPO = 'D:\\ecxsolution\\flexion';

const results = { scenarios: {}, performance: {} };
const timer = (label) => {
    const start = Date.now();
    return () => {
        const ms = Date.now() - start;
        results.performance[label] = ms;
        return ms;
    };
};

// === Scenario 4: Cold Start (run first, uses fresh collection) ===
console.log('=== Scenario 4: Cold Start ===');
{
    const t = timer('cold_start_total');
    const vs = new VectorStore({ chroma_client_args: CHROMA, collection_name: COLLECTION });
    await vs.init();

    const count_before = await vs.count();
    console.log(`  Documents before: ${count_before}`);

    const ms = new JsonMetaStore(DATA_DIR);
    const em = new EmbeddingGenerator(api_key);

    const t_ingest = timer('cold_start_bulk_ingest');
    const ingest = await runIngestPipeline(REPO, 'flexion-e2e', 'incremental', vs, em, ms, undefined, {
        since_date: '2026-03-20',
    });
    const ingest_ms = t_ingest();

    console.log(`  Ingest: ${ingest.indexed}/${ingest.processed} indexed in ${(ingest_ms / 1000).toFixed(1)}s`);

    const engine = new SearchEngine(vs, em);
    const pp = new PostProcessor();

    const t_search = timer('cold_start_search');
    const search = await engine.search('refactor withLocalState HOC move package', 5);
    const search_ms = t_search();
    const processed = pp.process(search);
    console.log(`  Search: ${processed.results.length} results in ${search_ms}ms`);
    console.log(
        `  Top result: score=${processed.results[0]?.score?.toFixed(3)}, type=${processed.results[0]?.change_type}`,
    );

    const total_ms = t();
    results.scenarios['cold_start'] = {
        passed: ingest.indexed > 0 && processed.results.length > 0,
        docs_before: count_before,
        docs_after: await vs.count(),
        ingest_indexed: ingest.indexed,
        search_results: processed.results.length,
        total_ms,
    };
    console.log(`  PASS: ${results.scenarios['cold_start'].passed}\n`);
}

// === Scenario 1: Regression Detection (search) ===
console.log('=== Scenario 1: Regression Detection (search_review_context) ===');
{
    const vs = new VectorStore({ chroma_client_args: CHROMA, collection_name: 'cr_rag_gate_test' });
    await vs.init();
    const em = new EmbeddingGenerator(api_key);
    const engine = new SearchEngine(vs, em);
    const pp = new PostProcessor();

    const t = timer('search_response');
    const search = await engine.search('fix ECDefaultDecimal component value display issue when input loses focus', 5);
    const ms = t();
    const processed = pp.process(search);

    console.log(`  Results: ${processed.results.length} in ${ms}ms`);
    for (let i = 0; i < Math.min(processed.results.length, 2); i++) {
        const r = processed.results[i];
        console.log(
            `  [${i + 1}] Score: ${r.score?.toFixed(3)} | Type: ${r.change_type} | Files: ${r.file_paths?.slice(0, 2).join(', ')}`,
        );
    }

    const has_related = processed.results.some((r) =>
        r.file_paths?.some((f) => f.includes('Decimal') || f.includes('decimal')),
    );
    results.scenarios['regression_detection'] = {
        passed: processed.results.length > 0 && ms < 5000,
        found_related: has_related,
        result_count: processed.results.length,
        response_ms: ms,
    };
    console.log(`  Related to Decimal found: ${has_related}`);
    console.log(`  PASS: ${results.scenarios['regression_detection'].passed}\n`);
}

// === Scenario 2: Incremental Ingest ===
console.log('=== Scenario 2: Incremental Ingest ===');
{
    const vs = new VectorStore({ chroma_client_args: CHROMA, collection_name: 'cr_rag_gate_test' });
    await vs.init();
    const ms = new JsonMetaStore(resolve(process.cwd(), '.cr-rag-data'));
    const em = new EmbeddingGenerator(api_key);

    const count_before = await vs.count();

    const t = timer('single_ingest');
    const latest_hash = '7c2595c7c';
    const ingest = await runIngestPipeline(REPO, 'flexion', 'single', vs, em, ms, undefined, {
        commit_hash: latest_hash,
    });
    const ingest_ms = t();

    const count_after = await vs.count();
    console.log(
        `  Single commit ${latest_hash}: indexed=${ingest.indexed}, duration=${(ingest_ms / 1000).toFixed(1)}s`,
    );
    console.log(`  Documents: ${count_before} -> ${count_after}`);

    results.scenarios['incremental_ingest'] = {
        passed: ingest_ms < 30000,
        indexed: ingest.indexed,
        duration_ms: ingest_ms,
    };
    console.log(`  PASS: ${results.scenarios['incremental_ingest'].passed}\n`);
}

// === Scenario 3: Reason Supplementation ===
console.log('=== Scenario 3: Reason Supplementation (supplement_reason) ===');
{
    const vs = new VectorStore({ chroma_client_args: CHROMA, collection_name: 'cr_rag_gate_test' });
    await vs.init();
    const ms_store = new JsonMetaStore(resolve(process.cwd(), '.cr-rag-data'));
    const em = new EmbeddingGenerator(api_key);

    const test_hash = '21f8cad93894507d15ad4eb4fe5190af83f5649e';
    const row = await vs.getFirstByCommitHash(test_hash);

    if (row) {
        console.log(
            `  Found document for ${test_hash.slice(0, 7)}: reason_supplemented=${row.metadata.reason_supplemented}`,
        );

        const old_doc = row.document ?? '';
        const reason =
            'ECDecimal 컴포넌트에서 포커스 변경 시 값이 올바르게 표시되지 않는 버그를 수정. useDecimalInput 훅의 값 포맷팅 로직 개선.';
        const supplemented_at = new Date().toISOString();
        const new_doc = `${old_doc}\n\n[보충 사유] (${supplemented_at}, by e2e-test)\n${reason}`;

        const next_meta = {
            ...row.metadata,
            reason_known: true,
            reason_inferred: false,
            reason_supplemented: true,
            verified_at: supplemented_at,
            confidence_score: Math.min(1, row.metadata.confidence_score + 0.05),
        };

        const t = timer('supplement_reason');
        const embedding = await em.embed(new_doc);
        await vs.upsert(row.id, new_doc, embedding, next_meta);
        await ms_store.saveCommitDocumentMetadata(next_meta);
        const supplement_ms = t();

        const updated = await vs.getFirstByCommitHash(test_hash);
        console.log(
            `  Updated: reason_supplemented=${updated?.metadata.reason_supplemented}, confidence=${updated?.metadata.confidence_score}`,
        );
        console.log(`  Duration: ${supplement_ms}ms`);

        results.scenarios['reason_supplement'] = {
            passed: updated?.metadata.reason_supplemented === true && supplement_ms < 10000,
            duration_ms: supplement_ms,
            confidence_before: row.metadata.confidence_score,
            confidence_after: updated?.metadata.confidence_score,
        };
    } else {
        console.log(`  Document not found for ${test_hash.slice(0, 7)}`);
        results.scenarios['reason_supplement'] = { passed: false, error: 'Document not found' };
    }
    console.log(`  PASS: ${results.scenarios['reason_supplement'].passed}\n`);
}

// === Summary ===
console.log('=== E2E Summary ===');
console.log(JSON.stringify(results, null, 2));

const all_passed = Object.values(results.scenarios).every((s) => s.passed);
console.log(`\nAll scenarios passed: ${all_passed}`);
process.exit(all_passed ? 0 : 1);
