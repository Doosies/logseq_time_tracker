# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

## [0.1.0] - 2026-02-06

### Added

- MCP 서버 초기 구조 설정
  - TypeScript 기반 서버 구현
  - MCP SDK 1.25 통합
  - Zod 4.3 스키마 검증
- 도구 (Tools) 구현
  - **get_current_time**: 현재 시간 조회
    - 형식 지원: `iso`, `locale`, `timestamp`
    - 타임존 지원
  - **calculate**: 간단한 수학 계산
    - 사칙연산 지원 (+, -, *, /)
    - 괄호 및 우선순위 처리
- 리소스 (Resources) 구현
  - **info://server**: 서버 정보 조회
    - 서버 버전 정보
    - 사용 가능한 도구 목록
    - 사용 가능한 리소스 목록
- 개발 도구 설정
  - TypeScript 컴파일 설정
  - ESLint & Prettier
  - Watch 모드 지원 (`pnpm dev`)
- Cursor 통합 가이드
  - Windows 설정 예시
  - macOS/Linux 설정 예시
  - 사용 예제 문서화
