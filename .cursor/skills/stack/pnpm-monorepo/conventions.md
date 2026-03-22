# pnpm / 모노레포 스택 컨벤션

이 저장소는 pnpm workspace + Turbo를 사용합니다. **실제 스크립트 이름은 루트 `package.json`과 `.cursor-agent-config.yaml`(있는 경우)을 기준**으로 합니다.

> **구조·catalog·turbo·신규 패키지 체크리스트**: [monorepo-patterns.md](../../developer/references/monorepo-patterns.md)  
> **catalog·감사·버전 업데이트**: [dependency-management.md](../../developer/references/dependency-management.md)  
> **tsconfig / ESLint / Vite / Prettier / Storybook addon**: [config-optimization.md](../../developer/references/config-optimization.md)  
> **pnpm CLI (`--no-offline`, filter, turbo)**: [cli-usage SKILL](../../cli-usage/SKILL.md)

## 자주 쓰는 검증 스크립트 (예시)

- TypeScript: `pnpm type-check` (워크스페이스 루트, Stories·`.stories.ts` 포함 전체 검증)
- Lint: `pnpm lint` / 자동 수정: `pnpm lint:fix`
- 포매팅: `pnpm format`

다른 패키지 매니저·스크립트명을 쓰는 프로젝트는 해당 설정 파일을 따릅니다.

## Node.js 패키지 (예: MCP 서버)

모노레포 내 Node 패키지(tsconfig) 예시:

- `esModuleInterop: true` 필수 (CommonJS 호환)
- `verbatimModuleSyntax: false` (CJS/ESM 혼용 시)
- `noEmit: false` (빌드 출력 필요)

## 설정 파일 편집 시

`package.json`, `tsconfig.json`, `pnpm-workspace.yaml` 등 설정 파일을 수정할 때:

1. **기존 들여쓰기 확인**: 수정 전 파일을 읽어 들여쓰기 칸 수(2칸/4칸) 확인
2. **동일하게 유지**: 수정 후 동일한 들여쓰기 적용
3. **JSON.stringify 사용 시**: `JSON.stringify(obj, null, N)`에서 N을 기존 파일의 들여쓰기 칸 수로 설정
    - 예: 프로젝트 루트 `package.json`이 4칸이면 `JSON.stringify(pkg, null, 4)`
4. **Prettier 적용**: 프로젝트의 format 스크립트 실행 시 `.prettierrc`(tabWidth) 준수. 수동 작성 시 tabWidth와 일치시킬 것

## ReadLints 연계 워크플로우 (필수)

**중요**: 파일을 **작성하거나 수정한 직후** 반드시 ReadLints로 확인합니다.

### 자동화 프로세스

```
1. 파일 작성/수정
2. 워크스페이스 루트에서 type-check 스크립트 실행 (타입 오류 우선 확인, Stories 포함)
3. 타입 오류 발견 시 즉시 수정
4. ReadLints 실행 (편집한 파일 경로 지정)
5. 오류 발견 시:
   a. 즉시 lint:fix 스크립트 자동 실행 (우선)
   b. 자동 수정 불가능한 오류만 수동 수정
6. ReadLints 재실행하여 오류 0개 확인
7. Prettier 포매팅: format 스크립트 실행 (또는 저장 시 자동)
8. 최종 ReadLints 확인
```

**오류 해결 우선순위**:

1. **타입 검증 우선**: type-check 스크립트 즉시 실행
2. **자동 수정**: lint:fix 스크립트 즉시 실행
3. **수동 수정**: 자동 수정 불가능한 경우만
4. **검증**: ReadLints로 오류 0개 확인

### 예시

```typescript
// 파일 수정 후
ReadLints(['src/main.tsx']);

// 오류 발견 시 - 즉시 자동 수정 시도
run_terminal_cmd('npm run lint:fix');
ReadLints(['src/main.tsx']); // 재확인

// 자동 수정 불가능한 오류가 남아있으면 수동 수정
// 수동 수정 후 재확인
ReadLints(['src/main.tsx']); // 최종 확인
```

**주의**: Linter 오류가 0개가 아니면 다음 단계로 진행하지 않습니다!
