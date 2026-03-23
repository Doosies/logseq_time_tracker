import { VectorStore } from './dist/storage/vector_db.js';
import { EmbeddingGenerator } from './dist/processing/embedder.js';
import { SearchEngine } from './dist/search/engine.js';
import { PostProcessor } from './dist/search/post_processor.js';

const api_key = process.env['OPENAI_API_KEY'];
if (!api_key) { console.error('OPENAI_API_KEY required'); process.exit(1); }

const vector_store = new VectorStore({
    chroma_client_args: { host: 'localhost', port: 8000 },
    collection_name: 'cr_rag_gate_test',
});
await vector_store.init();

const embedder = new EmbeddingGenerator(api_key);
const engine = new SearchEngine(vector_store, embedder);
const post_processor = new PostProcessor();

const SEARCH_QUERIES = [
    {
        id: 1,
        description: 'ECDecimal 컴포넌트 버그 수정 관련',
        diff_text: 'ECDefaultDecimal useDecimalInput value formatting fix when focus changes',
    },
    {
        id: 2,
        description: 'withLocalState HOC 리팩토링 관련',
        diff_text: 'refactor move withLocalState HOC and hooks from flexion-node to flexion-react package restructuring',
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

const count = await vector_store.count();
console.log(`ChromaDB documents: ${count}\n`);

for (const q of SEARCH_QUERIES) {
    console.log(`=== Search ${q.id}: ${q.description} ===`);
    console.log(`Query: ${q.diff_text}\n`);
    
    const results = await engine.search(q.diff_text, 5);
    const processed = post_processor.process(results);
    
    if (processed.results.length === 0) {
        console.log('  No results found\n');
        continue;
    }
    
    for (let i = 0; i < Math.min(processed.results.length, 3); i++) {
        const r = processed.results[i];
        console.log(`  [${i+1}] Score: ${r.score?.toFixed(3) ?? 'N/A'}`);
        console.log(`      Commit: ${r.commit_hash?.slice(0,7)} by ${r.author}`);
        console.log(`      Type: ${r.change_type} | Confidence: ${r.confidence_score}`);
        console.log(`      Paths: ${(r.file_paths ?? []).slice(0, 3).join(', ')}`);
        console.log(`      Impact: ${(r.impact ?? '').slice(0, 120)}`);
        console.log();
    }
    
    console.log(`  Total results: ${processed.results.length}`);
    console.log(`  ${JSON.stringify(processed.metadata)}\n`);
}
