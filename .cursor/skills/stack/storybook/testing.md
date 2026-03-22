# Storybook 스택 — 테스트 전략

Storybook 기반 시각·인터랙션 검증 시 QA 에이전트가 적용하는 규칙입니다.  
기존 `qa/references/storybook-strategy.md`를 유지하며, 본 파일은 **진입 요약**입니다.

## 상세 레퍼런스 (경로 고정)

- [Storybook 테스트 전략](../../qa/references/storybook-strategy.md)

## 아키텍처·파일 위치 (요약)

- **형식**: `.stories.ts` **CSF3**만 사용 (프로젝트 관례; 커스텀 Svelte 컴파일과 맞춤)
- **위치**: 컴포넌트별 `__tests__/{Name}.stories.ts`, 필요 시 `{Name}StoryWrapper.svelte`
- **검증 import**: `storybook/test`의 `expect`, `fn`, `within`, `userEvent` 등
- **`children: Snippet`**: `.stories.ts`만으로는 자식 전달이 어려우므로 **StoryWrapper** 패턴 사용

**상세·코드 템플릿**: [storybook-strategy.md](../../qa/references/storybook-strategy.md)

## 품질 게이트 (스토리 존재 시)

- [ ] **모든 Story에 play function 존재** (`storybook-strategy.md` 참조)
- [ ] play function에서 최소 1개 이상 assertion (렌더링/역할/텍스트 등)
- [ ] 모듈 레벨 상태를 쓰는 컴포넌트: StoryWrapper `onMount`에서 reset 함수 호출 여부 확인

## Feature 태스크 시 (필수 트리거)

새 컴포넌트 파일(예: `.svelte`)이 추가된 경우, 프로젝트 관례에 맞는 스토리 파일(예: `__tests__/*.stories.ts`) 존재 여부를 확인합니다.

- 스토리 없음 → `storybook-strategy.md`를 참조하여 스토리 작성
- 작성 불가(mock 부재, 환경 제약 등) → 원인을 메인 에이전트에게 보고하고 인프라 개선 제안

## 기존 컴포넌트 수정 시

기존 스토리가 있는 컴포넌트의 props·구조가 바뀐 경우 스토리를 함께 업데이트합니다.
