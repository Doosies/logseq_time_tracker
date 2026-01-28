---
name: bottleneck-analysis
description: 병목 지점 식별 및 우선순위 결정
---

# 병목 분석

## 병목 지점 식별

### 시간 병목
가장 오래 걸리는 단계:
```
QA 에이전트: 평균 45분 (전체의 60%)
→ 병목 지점
```

### 에러 병목
가장 많이 실패하는 단계:
```
Developer: 재시도 평균 2.5회
→ 품질 문제
```

### 토큰 병목
가장 많이 사용하는 단계:
```
Planner: 평균 10K 토큰
→ 비용 최적화 필요
```

## 우선순위 결정

### Impact vs Effort

```
High Impact, Low Effort → 우선 개선
- QA 커버리지 체크 자동화

High Impact, High Effort → 계획 필요
- 전체 워크플로우 재설계

Low Impact, Low Effort → 나중에
- 로그 형식 개선

Low Impact, High Effort → 보류
- 완전히 새로운 시스템
```

## 완료 기준
- [ ] 병목 지점 3개 이상 식별
- [ ] 우선순위 순위 매기기
- [ ] 개선 계획 수립
