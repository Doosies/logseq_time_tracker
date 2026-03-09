# URL Hash 라우팅 구현 완료 보고서

**작업 ID**: 2026-03-09-013  
**작업 유형**: Feature  
**시작 시간**: 2026-03-09 17:00  
**완료 시간**: 2026-03-09 18:30  
**소요 시간**: 1시간 30분  
**상태**: ✅ 성공

---

## 요약

Tampermonkey 스타일의 URL hash 기반 라우팅을 구현하여 스크립트 편집을 별도 탭(editor.html)에서 처리하도록 개선했습니다. 2단 레이아웃으로 전체 화면을 활용하며, 키보드 단축키와 반응형 디자인을 지원합니다.

---

## 작업 내용

### 1. editor.html 및 EditorPage 컴포넌트

**신규 파일**:
- `packages/ecount-dev-tool/src/editor.html` - 편집 페이지 HTML 진입점
- `packages/ecount-dev-tool/src/editor.ts` - EditorPage 마운트 스크립트
- `packages/ecount-dev-tool/src/components/EditorPage/EditorPage.svelte` - 2단 레이아웃 편집 컴포넌트
- `packages/ecount-dev-tool/src/components/EditorPage/index.ts` - export

**주요 기능**:
- **2단 레이아웃**: 좌측 360px 메타데이터, 우측 가변 코드 에디터
- **고정 헤더**: 뒤로 버튼, 타이틀, 저장 버튼 (60px)
- **키보드 단축키**: Ctrl+S (저장), Esc (취소)
- **반응형**: < 900px에서 1단 레이아웃으로 전환

### 2. router.ts 유틸리티

**신규 파일**: `packages/ecount-dev-tool/src/utils/router.ts`

**3개 함수**:
```typescript
parseHash(): string | null      // URL hash에서 스크립트 ID 추출
openEditor(scriptId?): Promise<void>  // 새 탭에서 editor.html 열기
closeEditor(): Promise<void>    // 현재 탭 닫기
```

### 3. UserScriptSection 라우팅 연동

**수정 파일**: `packages/ecount-dev-tool/src/components/UserScriptSection/UserScriptSection.svelte`

**변경사항**:
- `view_mode`, `editing_script` state 제거
- `handleAdd()`, `handleEdit()` → `openEditor()` 호출로 변경
- 조건부 렌더링 제거, ScriptList 항상 표시

**기존 (popup 내 전환)**:
```typescript
view_mode = 'editor'; // 같은 화면에서 전환
```

**변경 후 (새 탭)**:
```typescript
await openEditor(script.id); // editor.html#script-id
```

### 4. 빌드 설정

**수정 파일**:
- `packages/ecount-dev-tool/vite.config.ts`: `additionalInputs: ['src/editor.html']` 추가
- `packages/ecount-dev-tool/tsconfig.json`: `#utils/*` 경로 alias 추가
- `packages/ecount-dev-tool/package.json`: `#utils/*` 경로 alias 추가

### 5. 테스트 및 Storybook

**수정 파일**:
- `packages/ecount-dev-tool/src/test/setup.ts`: `chrome.tabs.create`, `getCurrent`, `remove` mock 추가
- `packages/ecount-dev-tool/src/components/UserScriptSection/__tests__/UserScriptSection.stories.ts`: 새 탭 열기 동작 검증

### 6. 문서화

**수정 파일**:
- `packages/ecount-dev-tool/CHANGELOG.md`: Added/Changed 섹션 업데이트
- `packages/ecount-dev-tool/README.md`: "스크립트 편집" 섹션 추가

---

## 품질 검증 결과

| 항목 | 목표 | 실제 | 상태 |
|------|------|------|------|
| TypeScript 오류 | 0개 | 0개 | ✅ |
| Linter 오류 | 0개 | 0개 | ✅ |
| 테스트 통과율 | 100% | 100% (349/349) | ✅ |
| 빌드 | 성공 | 성공 | ✅ |
| editor.html 생성 | - | `dist/src/editor.html` | ✅ |
| editor.js 생성 | - | `dist/src/editor.js` | ✅ |

**검증 내역**:
1. `pnpm format`: 코드 포맷팅 완료
2. `pnpm test`: 22 파일, 349개 테스트 모두 통과
3. `pnpm lint`: 5개 패키지 모두 통과
4. `pnpm type-check`: svelte-check 0 errors, 0 warnings
5. `pnpm build`: 빌드 성공, editor.html/js 출력 확인

---

## 주요 결정사항

### 결정 1: 별도 페이지(editor.html) 분리

**근거**:
- Portal 방식은 Chrome Extension 환경에서 작동하지 않음 (이전 시도 실패)
- Tampermonkey 스타일 URL 라우팅으로 전체 화면 활용 가능
- 새 탭 방식으로 여러 스크립트 동시 편집 지원

**검토한 대안**:
- Dialog 오버레이: Chrome Extension에서 Portal 작동 불가
- popup 내 전환: 화면 공간 제약

### 결정 2: 2단 레이아웃

**근거**:
- 코드 편집 공간 최대화
- 전체 화면 효율적 활용
- 메타데이터와 코드 동시 확인 가능

**검토한 대안**:
- 1단 수직 레이아웃: 코드 에디터 높이 부족
- 기존 ScriptEditor 재사용: 전체 화면 활용 불가

### 결정 3: additionalInputs 빌드 설정

**근거**:
- manifest에 없는 HTML은 vite-plugin-web-extension이 자동 인식 못함
- additionalInputs로 명시적 추가 필요

**검토한 대안**:
- manifest에 직접 추가: editor.html은 popup이 아니므로 부적절

### 결정 4: #utils/* 경로 alias

**근거**:
- 일관된 import 경로 패턴 유지
- 프로젝트 전체 컨벤션 준수

**검토한 대안**:
- 상대 경로: 깊이에 따라 변경 필요

---

## 발견된 이슈

### 이슈 1: uikit TextInput/Textarea에 id prop 미지원

**문제**: `<TextInput id="name" />` 사용 불가

**해결 방법**: `id`/`for` 제거, `<span class="form-label">` 사용

**영향도**: Low (접근성 약간 감소하지만 기능 정상)

### 이슈 2: load_error Svelte 반응성 경고

**문제**: `let load_error = ''`에서 반응성 경고

**해결 방법**: `let load_error = $state('')`로 변경

**영향도**: None (경고 제거, 기능 영향 없음)

---

## 생성/수정된 파일 (13개)

### 신규 파일 (5개)

| 파일 | 설명 |
|------|------|
| `src/editor.html` | 편집 페이지 HTML 진입점 |
| `src/editor.ts` | EditorPage 마운트 스크립트 |
| `src/utils/router.ts` | URL hash 라우터 유틸리티 |
| `src/components/EditorPage/EditorPage.svelte` | 2단 레이아웃 편집 컴포넌트 |
| `src/components/EditorPage/index.ts` | EditorPage export |

### 수정 파일 (8개)

| 파일 | 변경 내용 |
|------|----------|
| `vite.config.ts` | additionalInputs에 editor.html 추가 |
| `tsconfig.json` | #utils/* 경로 alias 추가 |
| `package.json` | #utils/* 경로 alias 추가 |
| `UserScriptSection.svelte` | view_mode 제거, openEditor 연동 |
| `UserScriptSection.stories.ts` | 새 탭 열기 검증 |
| `test/setup.ts` | chrome.tabs mock 추가 |
| `CHANGELOG.md` | Added/Changed 섹션 업데이트 |
| `README.md` | "스크립트 편집" 섹션 추가 |

---

## 사용자 영향

### 긍정적 영향

1. **전체 화면 활용**: 코드 편집 공간 대폭 증가
2. **집중 모드**: 다른 섹션 방해 없이 편집에 집중
3. **URL 공유 가능**: `#script-id`로 북마크 및 재접근 가능
4. **멀티태스킹**: 여러 스크립트 동시 편집 가능 (탭 기반)
5. **키보드 최적화**: Ctrl+S, Esc로 빠른 작업 가능
6. **반응형**: 작은 화면에서도 사용 가능

### 주의사항

- 스크립트 추가/수정 시 새 탭이 열림 (기존: 같은 화면 전환)
- 탭 관리 필요 (여러 스크립트 열면 탭 증가)

---

## 시스템 개선

### 추가된 스킬 문서

**developer 스킬**:
- `.cursor/skills/developer/references/chrome-extension-routing.md` (신규)
  - editor.html 분리 패턴
  - additionalInputs 빌드 설정
  - chrome.tabs API 사용법

**qa 스킬**:
- `.cursor/skills/qa/references/chrome-extension-testing.md` (확장)
  - `chrome.tabs.create`, `getCurrent`, `remove` mock 패턴
  - Storybook play 함수 검증

**config-optimization**:
- `.cursor/skills/developer/references/config-optimization.md` (확장)
  - additionalInputs 패턴 추가

**개선 리포트**:
- `.cursor/metrics/improvements/2026-03-09-013-url-routing-pattern.md`
  - 패턴 분석 및 향후 개선 제안

---

## Git 커밋

**커밋 해시**: `184a6fa`

**커밋 통계**: 13개 파일 변경 (340 추가, 40 삭제)

**커밋 메시지**:
```
feat(ecount-dev-tool): URL hash 라우팅 기반 스크립트 편집 페이지 추가

별도 탭(editor.html)에서 스크립트를 편집할 수 있도록 Tampermonkey 스타일의
URL hash 라우팅을 구현했습니다.

주요 변경사항:
- editor.html 및 EditorPage 컴포넌트 추가 (2단 레이아웃)
- router.ts 유틸리티 (parseHash, openEditor, closeEditor)
- UserScriptSection에서 view_mode 제거, 새 탭 열기 방식으로 변경
- 키보드 단축키 지원 (Ctrl+S, Esc)
- 반응형 레이아웃 (< 900px: 1단 레이아웃)

기술적 세부사항:
- vite.config.ts에 additionalInputs로 editor.html 추가
- #utils/* 경로 alias 추가 (tsconfig.json, package.json)
- chrome.tabs API 사용 (create, getCurrent, remove)
- Storybook/test mock 업데이트

사용자 영향:
- 스크립트 편집 시 전체 화면 활용 가능
- URL 공유 및 북마크 가능 (#script-id)
- 여러 스크립트 동시 편집 가능 (탭 기반)
```

---

## 수동 검증 안내

Chrome Extension 빌드 후 다음 항목을 직접 확인해주세요:

1. ✅ popup에서 "+ 추가" 클릭 → `editor.html#new` 새 탭 열림
2. ✅ popup에서 수정 버튼 클릭 → `editor.html#<script-id>` 새 탭 열림
3. ✅ 2단 레이아웃 (메타데이터 360px | 코드 에디터) 렌더링
4. ✅ Ctrl+S로 저장 후 탭 자동 닫힘
5. ✅ Esc로 편집 취소 확인 다이얼로그, 탭 닫힘
6. ✅ 창 너비 900px 미만에서 1단 레이아웃으로 전환
7. ✅ popup 다시 열기 → `chrome.storage` 동기화로 목록 업데이트 확인
8. ✅ 여러 스크립트 동시 편집 (여러 탭)
9. ✅ URL 직접 접근: `chrome-extension://[id]/src/editor.html#script-id`

---

## 결론

URL Hash 라우팅 구현이 성공적으로 완료되었습니다. Tampermonkey 스타일의 편집 환경을 제공하며, 전체 화면 활용, 키보드 단축키, 반응형 디자인을 지원합니다. 모든 품질 기준을 충족했으며, Chrome Extension 라우팅 패턴을 스킬 문서로 체계화하여 향후 유사 작업의 효율성을 향상시켰습니다.

---

**작성자**: 메인 에이전트  
**작성일**: 2026-03-09  
**버전**: 1.0