# QA 테스트 환경 ERR_REQUIRE_ESM 이슈 분석 및 개선

**분석 일시**: 2026-03-01  
**분석 대상**: Feature (ecount-dev-tool 1+1 계산기 섹션 추가) 세션 - QA 단계 ERR_REQUIRE_ESM 발견  
**우선순위**: P0 (기술 해결) / P1 (에이전트 규칙·스킬 문서화)

---

## 1. 개선 필요 여부

**yes**

---

## 2. 근거

### 2.1 이슈 특성

| 구분 | 내용 |
|------|------|
| **발생 단계** | QA (테스트 실행) |
| **에러** | `ERR_REQUIRE_ESM` |
| **원인** | `html-encoding-sniffer@6.0.0`(CJS)가 `@exodus/bytes`(ESM-only)를 `require()`로 로드 |
| **의존성 체인** | jsdom 28 → html-encoding-sniffer 6.0.0 → @exodus/bytes |
| **Feature 관련성** | Calculator 추가와 무관, **pre-existing** 테스트 환경 이슈로 추정 |

### 2.2 재발 가능성

- **의존성 전환기**: npm 생태계의 CJS→ESM 전환으로 유사 이슈 재발 가능
- **Vitest forks pool**: Vitest 4 기본 `forks` 워커에서 CJS/ESM 혼용 시 module resolution 이슈 발생 가능
- **참고**: [vitest#9281](https://github.com/vitest-dev/vitest/issues/9281) - jsdom v27+ Node 20.19.0+ 요구 등

### 2.3 개선 필요 판단

1. **즉시 해결 필요**: 현재 `pnpm test` 실패 → CI/품질 게이트 통과 불가
2. **규칙·스킬 보강**: QA/Developer가 동일 유형 이슈 발생 시 대응 절차를 따를 수 있도록 문서화
3. **품질 게이트 보완**: 구현 직후 `pnpm test` 선행 검증으로 환경 이슈 조기 발견 가능

---

## 3. 변경 파일 목록

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `.cursor/skills/qa/references/vitest-env-troubleshooting.md` | 신규 (권장) | ERR_REQUIRE_ESM 등 Vitest 환경 이슈 트러블슈팅 |
| `config/vitest.shared.ts` | 수정 (권장) | pool 또는 deps 설정으로 ESM 호환 개선 |
| `.cursor/agents/qa.md` | 수정 (권장) | 테스트 환경 사전 점검 체크리스트 항목 추가 |

---

## 4. Decisions 표

| 결정 | 근거 | 검토한 대안 |
|------|------|--------------|
| 개선 필요 **yes** | 테스트 실패 → 품질 게이트 미통과, 재발 가능 패턴 | no로 두고 개발자가 수동 해결만 의존 |
| QA Skill에 **환경 트러블슈팅** 문서 추가 | ERR_REQUIRE_ESM 등 의존성 이슈는 QA 단계에서 자주 발견 | Developer Skill에만 넣기, Chore 규칙만 강화 |
| vitest config 수정 권장 | pool/deps 변경으로 forks worker에서 ESM 로드 개선 | jsdom 다운그레이드, happy-dom 전환 (호환성 리스크) |
| 2026-02-27-003 패턴과 **분리** | type-check/Stories 이슈와 ESM 환경 이슈는 원인·대상이 다름 | 기존 리포트에 통합 (가독성 저하) |

---

## 5. Issues 표

| 이슈 | 해결 방법 | 영향도 |
|------|-----------|--------|
| ERR_REQUIRE_ESM (html-encoding-sniffer → @exodus/bytes) | (1) vitest `pool: 'threads'` 시도 (2) `server.deps.inline: ['@exodus/bytes','html-encoding-sniffer']` (3) Node 20.19.0+ 확인 | major |
| QA에서 테스트 환경 이슈 조기 대응 절차 없음 | QA Skill에 Vitest 환경 트러블슈팅 섹션 추가 | minor |
| 구현 직후 메인 품질 게이트에 `pnpm test` 선행 검증 미명시 | main-orchestrator: 구현 완료 후 `pnpm test` 실행, 실패 시 QA 호출 전 환경 수정 요청 | minor |

---

## 6. 권장 개선안 상세

### 6.1 vitest 설정 (즉시 적용)

`config/vitest.shared.ts` 또는 `packages/ecount-dev-tool/vitest.config.ts`:

```typescript
test: {
    pool: 'threads',  // forks 대신 threads로 ESM 호환 개선 시도
    server: {
        deps: {
            inline: ['@storybook/svelte', '@exodus/bytes', 'html-encoding-sniffer'],
        },
    },
},
```

또는 Node 버전 확인: `node -v` ≥ 20.19.0 (vitest#9281 참고).

### 6.2 QA Skill 확장

**신규 파일**: `.cursor/skills/qa/references/vitest-env-troubleshooting.md`

- ERR_REQUIRE_ESM 발생 시 점검 순서
- pool threads vs forks 차이
- `server.deps.inline` 사용 가이드
- Node 버전 요구사항

### 6.3 main-orchestrator 품질 게이트

구현 단계 후 체크리스트에 다음 명시:

- [ ] **구현 완료 직후 `pnpm test` 실행** → 실패 시 QA 호출 전 Developer에게 환경/설정 수정 요청 또는 별도 Chore 이슈 생성

---

## 7. 검증 방법

- `pnpm --filter @personal/ecount-dev-tool test` 실행 후 0 errors
- QA 에이전트가 동일 유형 이슈 발생 시 vitest-env-troubleshooting.md 참조 여부 확인

---

## 8. 참고

- vitest #9281: jsdom v27+ requires Node 20.19.0+
- pnpm-workspace.yaml: jsdom ^28.0.0
- 의존성 체인: jsdom → html-encoding-sniffer@6.0.0 → @exodus/bytes (ESM-only)
