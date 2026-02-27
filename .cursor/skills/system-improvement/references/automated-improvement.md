---
name: automated-improvement
description: 메트릭 기반 자동 개선 제안 생성
---

# 자동 개선 제안

메트릭 데이터를 분석하여 구체적인 개선 제안을 자동으로 생성합니다.

## 개선 제안 생성 프로세스

### 1단계: 메트릭 분석

#### 성능 저하 패턴 감지

```typescript
// 의사코드
interface PerformancePattern {
  agent: string;
  metric: 'duration' | 'retries' | 'errors' | 'tokens';
  trend: 'increasing' | 'decreasing' | 'stable';
  change_percent: number;
  severity: 'high' | 'medium' | 'low';
}

function detectPerformanceDegradation(cycles: CycleMetrics[]): PerformancePattern[] {
  const recent = cycles.slice(-10); // 최근 10개
  const baseline = cycles.slice(-20, -10); // 이전 10개
  
  const patterns: PerformancePattern[] = [];
  
  // 에이전트별 분석
  for (const agent of ['planner', 'developer', 'qa', 'docs']) {
    const recentAvg = calculateAverage(recent, agent, 'duration_ms');
    const baselineAvg = calculateAverage(baseline, agent, 'duration_ms');
    const change = (recentAvg - baselineAvg) / baselineAvg;
    
    if (change >= 0.10) { // 10% 이상 증가
      patterns.push({
        agent,
        metric: 'duration',
        trend: 'increasing',
        change_percent: change * 100,
        severity: change >= 0.30 ? 'high' : change >= 0.20 ? 'medium' : 'low'
      });
    }
  }
  
  return patterns;
}
```

#### 성능 저하 패턴 감지

다음 패턴을 자동으로 감지합니다:

1. **시간 증가 패턴**:
   - 특정 에이전트의 평균 실행 시간이 10% 이상 증가
   - 전체 사이클 시간이 점진적으로 증가

2. **재시도 증가 패턴**:
   - 특정 에이전트의 재시도 횟수가 증가
   - 연속 실패 발생

3. **에러 증가 패턴**:
   - 특정 유형의 에러가 빈번하게 발생
   - 에러 해결 시간이 증가

4. **비용 증가 패턴**:
   - 토큰 사용량이 증가
   - 불필요한 에이전트 호출 증가

### 2단계: 개선 제안 생성

#### 제안 생성 로직

```markdown
## 개선 제안 템플릿

### 제안 ID: IMP-{YYYY-MM-DD}-{NNN}

**문제 식별**:
- 에이전트: {agent_name}
- 메트릭: {metric_name}
- 현재 상태: {current_value}
- 기준점 대비: {change_percent}% {increase/decrease}
- 심각도: {severity}

**근본 원인 분석**:
- {root_cause_1}
- {root_cause_2}

**개선 방안**:
1. {improvement_action_1}
   - 변경 사항: {specific_change}
   - 예상 효과: {expected_improvement}
   - 적용 난이도: {effort_level}

2. {improvement_action_2}
   - 변경 사항: {specific_change}
   - 예상 효과: {expected_improvement}
   - 적용 난이도: {effort_level}

**A/B 테스트 설계**:
- Control: {baseline_configuration}
- Treatment: {proposed_configuration}
- 측정 지표: {metrics_to_measure}
- 최소 사이클 수: 10개 (각 그룹)

**예상 효과**:
- 시간 단축: {time_reduction}%
- 재시도 감소: {retry_reduction}%
- 품질 유지: {quality_maintained}
```

#### 구체적인 개선 제안 예시

**예시 1: QA 에이전트 재시도 증가**

```markdown
### 제안 ID: IMP-2026-01-28-001

**문제 식별**:
- 에이전트: qa
- 메트릭: retries
- 현재 상태: 평균 3.2회 재시도
- 기준점 대비: 60% 증가 (이전: 2.0회)
- 심각도: high

**근본 원인 분석**:
- 커버리지 80% 목표 달성 어려움
- 모든 파일에 동일한 커버리지 기준 적용
- 테스트 작성 시간 부족

**개선 방안**:
1. 파일별 차등 커버리지 기준 적용
   - 변경 사항: `.cursor/rules/qa.mdc` 수정
     - 핵심 파일 (src/core): 90%
     - 일반 파일 (src/utils): 70%
     - 테스트 파일: 50%
   - 예상 효과: 재시도 50% 감소, 시간 20% 단축
   - 적용 난이도: low

**A/B 테스트 설계**:
- Control: 모든 파일 80% 커버리지
- Treatment: 파일별 차등 커버리지
- 측정 지표: 재시도 횟수, 완료 시간, 품질 점수
- 최소 사이클 수: 10개 (각 그룹)

**예상 효과**:
- 시간 단축: 20%
- 재시도 감소: 50%
- 품질 유지: 0.85 이상
```

**예시 2: Developer 에이전트 Linter 오류 재발**

```markdown
### 제안 ID: IMP-2026-01-28-002

**문제 식별**:
- 에이전트: developer
- 메트릭: linter_errors_introduced
- 현재 상태: 평균 2.5개 오류 도입
- 기준점 대비: 25% 증가 (이전: 2.0개)
- 심각도: medium

**근본 원인 분석**:
- 자주 발생하는 Linter 오류 패턴 미숙지
- 자동 수정 가능한 오류 미처리
- 코딩 컨벤션 체크리스트 부족

**개선 방안**:
1. Linter 자동 수정 가이드 Skill 추가
   - 변경 사항: `.cursor/skills/developer/references/linter-fix-guide.md` 생성
     - 자주 발생하는 오류 10가지
     - 자동 수정 방법
     - 예방 체크리스트
   - 예상 효과: Linter 오류 도입 30% 감소
   - 적용 난이도: low

**A/B 테스트 설계**:
- Control: 기존 개발 프로세스
- Treatment: Linter 가이드 Skill 사용
- 측정 지표: linter_errors_introduced, linter_errors_fixed, 재시도 횟수
- 최소 사이클 수: 10개 (각 그룹)

**예상 효과**:
- Linter 오류 도입: 30% 감소
- 재시도 감소: 15%
- 품질 유지: 0.80 이상
```

### 3단계: 개선 효과 예측

#### 효과 예측 알고리즘

```typescript
// 의사코드
interface ImprovementPrediction {
  metric: string;
  current_value: number;
  predicted_value: number;
  improvement_percent: number;
  confidence: 'high' | 'medium' | 'low';
}

function predictImprovementEffect(
  pattern: PerformancePattern,
  improvement: ImprovementAction
): ImprovementPrediction {
  // 과거 유사 개선 사례 분석
  const similarCases = findSimilarImprovements(pattern, improvement);
  
  // 통계적 모델 기반 예측
  const avgImprovement = calculateAverageImprovement(similarCases);
  const confidence = similarCases.length >= 5 ? 'high' : 
                     similarCases.length >= 3 ? 'medium' : 'low';
  
  return {
    metric: pattern.metric,
    current_value: pattern.current_value,
    predicted_value: pattern.current_value * (1 - avgImprovement),
    improvement_percent: avgImprovement * 100,
    confidence
  };
}
```

#### 효과 예측 기준

1. **높은 신뢰도 (High Confidence)**:
   - 과거 유사 개선 사례 5개 이상
   - 통계적 유의성 확인 (p < 0.05)
   - 일관된 개선 효과

2. **중간 신뢰도 (Medium Confidence)**:
   - 과거 유사 개선 사례 3-4개
   - 부분적 유의성 확인
   - 변동성 있음

3. **낮은 신뢰도 (Low Confidence)**:
   - 과거 유사 개선 사례 2개 이하
   - 예측 불가능
   - A/B 테스트 필수

### 4단계: 우선순위 결정 알고리즘

#### 우선순위 점수 계산

```typescript
// 의사코드
interface PriorityScore {
  impact_score: number; // 0-100
  effort_score: number; // 0-100 (낮을수록 좋음)
  urgency_score: number; // 0-100
  total_score: number; // 가중 평균
}

function calculatePriority(
  pattern: PerformancePattern,
  improvement: ImprovementAction
): PriorityScore {
  // Impact 점수 (영향도)
  const impactScore = pattern.severity === 'high' ? 100 :
                      pattern.severity === 'medium' ? 60 : 30;
  
  // Effort 점수 (개선 난이도, 낮을수록 좋음)
  const effortScore = improvement.effort === 'low' ? 100 :
                      improvement.effort === 'medium' ? 60 : 20;
  
  // Urgency 점수 (긴급도)
  const urgencyScore = pattern.change_percent >= 30 ? 100 :
                       pattern.change_percent >= 20 ? 70 : 40;
  
  // 가중 평균 (Impact 40%, Effort 30%, Urgency 30%)
  const totalScore = impactScore * 0.4 + effortScore * 0.3 + urgencyScore * 0.3;
  
  return {
    impact_score: impactScore,
    effort_score: effortScore,
    urgency_score: urgencyScore,
    total_score: totalScore
  };
}
```

#### 우선순위 결정 기준

1. **P0 (즉시 개선)**:
   - 총점 80점 이상
   - High Impact + Low Effort
   - 성능 저하 30% 이상

2. **P1 (계획 수립)**:
   - 총점 60-79점
   - High Impact + Medium Effort
   - 성능 저하 20-30%

3. **P2 (다음 사이클)**:
   - 총점 40-59점
   - Medium Impact + Low Effort
   - 성능 저하 10-20%

4. **P3 (분석 후 결정)**:
   - 총점 20-39점
   - Medium Impact + Medium Effort

5. **P4 (보류)**:
   - 총점 20점 미만
   - Low Impact

### 5단계: 개선 제안 저장

#### 저장 형식

```json
{
  "improvement_id": "IMP-2026-01-28-001",
  "created_at": "2026-01-28T10:00:00Z",
  "status": "proposed",
  "priority": "P0",
  "problem": {
    "agent": "qa",
    "metric": "retries",
    "current_value": 3.2,
    "baseline_value": 2.0,
    "change_percent": 60,
    "severity": "high"
  },
  "root_causes": [
    "커버리지 80% 목표 달성 어려움",
    "모든 파일에 동일한 커버리지 기준 적용"
  ],
  "improvements": [
    {
      "action": "파일별 차등 커버리지 기준 적용",
      "changes": [
        {
          "file": ".cursor/rules/qa.mdc",
          "type": "modify",
          "description": "커버리지 기준을 파일 유형별로 차등 적용"
        }
      ],
      "expected_effect": {
        "retry_reduction": 50,
        "time_reduction": 20,
        "quality_maintained": true
      },
      "effort": "low"
    }
  ],
  "ab_test": {
    "control": "모든 파일 80% 커버리지",
    "treatment": "파일별 차등 커버리지",
    "metrics": ["retries", "duration_ms", "quality_score"],
    "min_cycles": 10
  },
  "prediction": {
    "confidence": "high",
    "improvement_percent": 50,
    "similar_cases": 3
  }
}
```

#### 저장 위치

- 파일 경로: `.cursor/metrics/improvements/{improvement_id}.json`
- 파일명 형식: `IMP-{YYYY-MM-DD}-{NNN}.json`

## 자동 개선 제안 생성 시점

### 트리거 조건

1. **성능 저하 감지 시**:
   - 성능 저하 10% 이상 감지
   - 즉시 개선 제안 생성

2. **정기 분석 시**:
   - 20개 사이클마다 자동 분석
   - 개선 기회 식별 시 제안 생성

3. **주간 요약 생성 시**:
   - 주간 요약 생성 후 자동 분석
   - 트렌드 분석 기반 제안 생성

4. **연속 실패 발생 시**:
   - 연속 3회 실패 발생
   - 즉시 원인 분석 및 제안 생성

## 완료 기준

- [ ] 성능 저하 패턴 감지 로직 구현
- [ ] 개선 제안 템플릿 생성
- [ ] 효과 예측 알고리즘 구현
- [ ] 우선순위 결정 알고리즘 구현
- [ ] 개선 제안 저장 기능 구현
- [ ] 자동 트리거 조건 설정
