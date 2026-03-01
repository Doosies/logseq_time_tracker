---
name: git-workflow
description: "Conventional Commits 기반 커밋/PR 작성 스킬. 커밋 메시지 생성, PR 설명 작성, 변경사항 분석, 커밋 분할, 리뷰어 추천 시 사용합니다. 커밋 subject/body는 한글로 작성합니다."
---

# Git 워크플로우 스킬

Git 커밋 메시지와 PR 관리를 위한 전문 스킬입니다.

## 사용 시점

- 커밋 메시지 생성 (Conventional Commits 형식)
- PR 설명 작성
- 변경사항 분석 및 논리적 커밋 분할
- 리뷰어 추천

## 핵심 규칙

- Conventional Commits 형식: `type(scope): description`
- Type 목록: feat, fix, refactor, docs, chore, test, style, perf
- 기능/수정 단위로 논리적 커밋 분할
- PR 설명은 한글 작성
- 커밋 메시지는 `type/scope`는 영어 키워드 유지, `subject/body`는 한글 작성

## 상세 레퍼런스

필요 시 아래 문서를 참조합니다.

- `references/commit-message-generation.md` - 커밋 메시지 생성 규칙
- `references/change-analysis.md` - 변경사항 분석 방법론
- `references/pr-description-generation.md` - PR 설명 템플릿
- `references/reviewer-recommendation.md` - 리뷰어 선정 기준
