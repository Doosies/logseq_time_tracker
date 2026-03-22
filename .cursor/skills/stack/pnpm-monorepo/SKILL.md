---
name: stack-pnpm-monorepo
description: pnpm workspace·Turbo·검증 스크립트 진입점. 모노레포·의존성·설정 상세는 developer references·cli-usage 링크.
---

# pnpm / 모노레포 스택 스킬 (진입점)

워크스페이스 루트에서 type-check·lint·format·turbo를 쓸 때 이 디렉터리를 먼저 엽니다.

## 파일 목록

| 파일 | 용도 |
|------|------|
| [conventions.md](./conventions.md) | 자주 쓰는 스크립트, Node 패키지 tsconfig 요약, ReadLints 워크플로우 |
| (링크만) | 모노레포 구조·catalog·의존성·tsconfig/eslint/vite |

## 상세 레퍼런스 (삭제하지 않음)

- [monorepo-patterns.md](../../developer/references/monorepo-patterns.md)
- [dependency-management.md](../../developer/references/dependency-management.md)
- [config-optimization.md](../../developer/references/config-optimization.md)
- [CLI 사용 SKILL](../../cli-usage/SKILL.md) — `pnpm install/add/update --no-offline`, filter, turbo

## 사용 시점

- 루트·패키지 `package.json` / `pnpm-workspace.yaml` / `turbo.json` 변경
- catalog·`workspace:*`·신규 패키지 추가
- 에이전트 품질 게이트용 스크립트 이름 확인
