# Changelog

이 패키지의 주목할 만한 변경 사항은 모두 이 파일에 기록됩니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며, [Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [0.0.2] - 2026-03-23

### Fixed

- PostProcessor의 노이즈 필터가 `final_score`(유사도 × 시간 감쇠) 기준으로 필터링되어 관련성 높은 결과가 탈락하던 문제를 수정했습니다. 노이즈 필터는 `similarity_score`(순수 유사도) 기준으로 동작하고, `final_score`는 결과 정렬(랭킹)에만 사용합니다.

### Added

- `ProcessedSearchResult` 인터페이스에 `similarity_score` 필드를 추가했습니다.
- 단위 테스트 8개를 추가하고 Vitest 설정을 도입했습니다.

### Changed

- 설계 문서 4개를 갱신했습니다: P1a-7, 02-data-pipeline, 03-data-model, 05-mcp-interface.
