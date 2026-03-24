---
name: stack-react
description: React 패키지(워크스페이스 내 React 앱·라이브러리, 예: {app-name}) 컨벤션·테스트 진입점. 상세는 references·QA 스킬 링크.
---

# React 스택 스킬 (진입점)

React + TypeScript 패키지 작업 시 이 디렉터리를 먼저 엽니다.

## 파일 목록

| 파일 | 용도 |
|------|------|
| [conventions.md](./conventions.md) | TS/JSX, 파일 네이밍, Hook·라이브러리 연동 요약 |
| [testing.md](./testing.md) | React Testing Library + Vitest 패턴 요약 |

## 사용 시점

- Developer: `.tsx` 컴포넌트·`use*` Hook·React 프로젝트 설정
- QA: RTL 기반 단위·통합 테스트 (프로젝트에 전용 `qa/references` 문서가 생기면 링크 추가)

## 관련

- [pnpm 모노레포](../pnpm-monorepo/SKILL.md) — 스크립트·turbo
- [설정 최적화](../../developer/references/config-optimization.md) — React 패키지 tsconfig 예시
- [QA SKILL](../../qa/SKILL.md) — 공통 품질 게이트
