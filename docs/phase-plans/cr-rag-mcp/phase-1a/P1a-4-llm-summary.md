# P1a-4: LLM 요약 + 추론 태깅

## 목표

OpenAI GPT-4o-mini를 사용하여 커밋의 구조화 팩트와 diff를 분석하고, `[추론된내용]` 태그를 포함한 요약을 생성한다. Diff 크기 게이트를 적용하여 대형 diff의 비용을 제어한다.

---

## 선행 조건

- P1a-3 완료 — StructuredFacts 추출 가능
- OpenAI API 키 환경 변수 설정

---

## 참조 설계 문서

| 문서                  | 섹션                  | 참조 내용                                                  |
| --------------------- | --------------------- | ---------------------------------------------------------- |
| `02-data-pipeline.md` | §4-2 LLM 요약 생성    | 프롬프트 설계, CommitSummary 인터페이스, 3단계 분류        |
| `02-data-pipeline.md` | §4-2 Diff 크기 게이트 | DiffSizeGate 인터페이스, 소/중/대 분류, estimateDiffSize() |
| `02-data-pipeline.md` | §4-2 사용자 보강 구조 | ReasonSupplement 인터페이스                                |
| `03-data-model.md`    | §2-1 CommitDocument   | content 필드 예시 (명확/추론/불명 3단계)                   |

---

## 생성/수정 파일 목록

| 파일                           | 역할                                               |
| ------------------------------ | -------------------------------------------------- |
| `src/processing/summarizer.ts` | LLM 요약 생성 — 프롬프트 조립 + OpenAI API 호출    |
| `src/processing/diff_gate.ts`  | Diff 크기 게이트 — 토큰/비용 추정, 분할 전략 결정  |
| `src/types/summary.ts`         | CommitSummary, DiffSizeGate, ReasonSupplement 타입 |

---

## 구현 상세

### src/types/summary.ts

```typescript
export interface CommitSummary {
    what: string; // [추론된내용] 태그 포함 가능
    reason_known: boolean;
    reason_inferred: boolean;
    reason: string | null;
    change_type: 'bugfix' | 'feature' | 'refactor' | 'optimization' | 'chore' | 'unknown';
    impact: string;
    risk_notes: string | null;
}

export interface DiffSizeGate {
    total_lines: number;
    estimated_tokens: number;
    estimated_cost_usd: number;
    tier: 'small' | 'medium' | 'large';
    strategy: 'auto' | 'split' | 'confirm';
}

export interface ReasonSupplement {
    commit_hash: string;
    reason: string;
    supplemented_by: string;
    supplemented_at: string;
}
```

### src/processing/diff_gate.ts

```typescript
import type { DiffSizeGate } from '../types/summary.js';
import type { CrRagConfig } from '../types/config.js';

const DEFAULT_SMALL_MAX = 200;
const DEFAULT_MEDIUM_MAX = 500;
const TOKENS_PER_LINE = 4;
const COST_PER_INPUT_TOKEN = 0.00000015; // GPT-4o-mini

export function estimateDiffSize(diff_lines: string[], config?: CrRagConfig): DiffSizeGate {
    const small_max = config?.diff_size_gate?.small_max_lines ?? DEFAULT_SMALL_MAX;
    const medium_max = config?.diff_size_gate?.medium_max_lines ?? DEFAULT_MEDIUM_MAX;

    const total_lines = diff_lines.length;
    const estimated_tokens = Math.ceil(total_lines * TOKENS_PER_LINE);
    const estimated_cost_usd = estimated_tokens * COST_PER_INPUT_TOKEN;

    let tier: DiffSizeGate['tier'];
    let strategy: DiffSizeGate['strategy'];

    if (total_lines <= small_max) {
        tier = 'small';
        strategy = 'auto';
    } else if (total_lines <= medium_max) {
        tier = 'medium';
        strategy = 'split';
    } else {
        tier = 'large';
        strategy = 'confirm';
    }

    return { total_lines, estimated_tokens, estimated_cost_usd, tier, strategy };
}
```

### src/processing/summarizer.ts 핵심

```typescript
import OpenAI from 'openai';
import type { StructuredFacts } from '../types/facts.js';
import type { CommitSummary, DiffSizeGate } from '../types/summary.js';
import { estimateDiffSize } from './diff_gate.js';

const SYSTEM_PROMPT = `당신은 코드 변경 히스토리 분석가입니다.`;

function buildUserPrompt(facts: StructuredFacts, diff_text: string): string {
    return `아래 커밋의 구조화 팩트와 diff를 분석하여 요약해주세요.

## 중요 규칙
- "무엇을 변경했는지(what)"는 diff를 기반으로 정확하게 기술하세요.
- "왜 변경했는지(why)"는 커밋 메시지에 명확한 이유가 있을 때만 기술하세요.
- diff의 기술적 맥락에서 이유를 추론할 수 있는 경우, reason_known을 true, reason_inferred를 true로 설정하고, content(what) 본문에 추론된 부분을 [추론된내용] 태그로 감싸세요.
- 비즈니스적 이유(기획 요청, 사용자 피드백 등)는 절대로 추측하지 마세요.
- 커밋 메시지가 모호하고 diff에서도 이유를 추론할 수 없으면, reason_known을 false로 설정하고 reason을 null로 두세요.

## 구조화 팩트
- 커밋 메시지: ${facts.message}
- 변경 파일: ${facts.files.map((f) => f.path).join(', ')}
- 변경 통계: +${facts.total_additions}, -${facts.total_deletions}
- 변경 함수: ${facts.files.flatMap((f) => f.functions_modified).join(', ') || '(없음)'}

## Diff
${diff_text}

## 출력 형식 (JSON만 출력)
{
  "what": "변경 내용 1~3문장. 추론된 부분은 [추론된내용] 태그 사용",
  "reason_known": true | false,
  "reason_inferred": true | false,
  "reason": "변경 이유 (reason_known이 false이면 null)",
  "change_type": "bugfix | feature | refactor | optimization | chore | unknown",
  "impact": "시스템 영향",
  "risk_notes": "주의사항 (없으면 null)"
}`;
}

export class LlmSummarizer {
    private client: OpenAI;

    constructor(
        api_key: string,
        private model = 'gpt-4o-mini',
    ) {
        this.client = new OpenAI({ apiKey: api_key });
    }

    async summarize(
        facts: StructuredFacts,
        diff_text: string,
    ): Promise<{ summary: CommitSummary; gate: DiffSizeGate }> {
        const diff_lines = diff_text.split('\n');
        const gate = estimateDiffSize(diff_lines);

        if (gate.strategy === 'confirm') {
            throw new LargeDiffError(facts.commit_hash, gate);
        }

        const effective_diff = gate.strategy === 'split' ? this.truncateDiff(diff_text) : diff_text;

        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: buildUserPrompt(facts, effective_diff) },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
        });

        const raw = JSON.parse(response.choices[0].message.content ?? '{}');
        const summary: CommitSummary = {
            what: raw.what ?? '',
            reason_known: raw.reason_known ?? false,
            reason_inferred: raw.reason_inferred ?? false,
            reason: raw.reason ?? null,
            change_type: raw.change_type ?? 'unknown',
            impact: raw.impact ?? '',
            risk_notes: raw.risk_notes ?? null,
        };

        return { summary, gate };
    }

    private truncateDiff(diff_text: string, max_lines = 500): string {
        const lines = diff_text.split('\n');
        if (lines.length <= max_lines) return diff_text;
        return lines.slice(0, max_lines).join('\n') + '\n... (truncated)';
    }
}

export class LargeDiffError extends Error {
    constructor(
        public commit_hash: string,
        public gate: DiffSizeGate,
    ) {
        super(`Large diff detected: ${gate.total_lines} lines, ~$${gate.estimated_cost_usd.toFixed(4)}`);
    }
}
```

---

## 완료 기준

- [ ] OpenAI API 호출로 커밋 요약 생성 성공
- [ ] 3단계 분류 동작 (명확/추론/불명)
- [ ] `[추론된내용]` 태그가 추론 시에만 포함
- [ ] Diff 크기 게이트: small → auto, medium → split, large → error
- [ ] JSON 응답 파싱 에러 처리 (재시도 또는 폴백)
- [ ] `pnpm type-check` 성공

---

## 다음 단계

→ P1a-5: 기본 검증 (`P1a-5-verification.md`)
