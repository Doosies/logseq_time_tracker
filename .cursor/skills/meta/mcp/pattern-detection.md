---
name: pattern-detection
description: 반복 작업 패턴 감지 알고리즘
---

# 패턴 감지

## 반복 패턴 식별

### 동일 작업 반복
```
메트릭 분석:
- QA 에이전트가 매번 "npm test -- --coverage" 실행
- 출력 파싱하여 커버리지 추출
- 5회 이상 반복

→ MCP 서버 후보: vitest-coverage-analyzer
```

### 수동 계산 반복
```
메트릭 분석:
- Developer가 매번 파일 크기 계산
- 패키지 의존성 수동 체크
- 3회 이상 반복

→ MCP 서버 후보: package-analyzer
```

## 패턴 분류

### High Priority (즉시 자동화)
- 5회 이상 반복
- 에러 발생률 20% 이상
- 시간 소요 30초 이상/회

### Medium Priority (계획)
- 3-4회 반복
- 에러 발생률 10-20%
- 시간 소요 10-30초/회

### Low Priority (모니터링)
- 2회 반복
- 에러 발생률 10% 미만

## 완료 기준
- [ ] 반복 패턴 3개 이상 식별
- [ ] 우선순위 분류
- [ ] MCP 서버 후보 선정
