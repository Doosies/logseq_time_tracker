---
name: ab-testing
description: A/B 테스트 설계 및 실행 (Phase 4: 메트릭 기반 자동화)
---

# A/B 테스트

## Phase 4: 메트릭 데이터 기반 A/B 테스트 자동화

### 자동 테스트 설계

메트릭 데이터를 기반으로 A/B 테스트를 자동으로 설계하고 실행합니다.

#### 메트릭 기반 테스트 설계

```typescript
// 의사코드
interface ABTestDesign {
  test_id: string;
  hypothesis: string;
  control: {
    configuration: Record<string, any>;
    cycles: string[]; // 사이클 ID 목록
  };
  treatment: {
    configuration: Record<string, any>;
    cycles: string[]; // 사이클 ID 목록
  };
  metrics: string[]; // 측정 지표 목록
  min_cycles_per_group: number; // 최소 사이클 수 (기본: 10)
}

function designABTestFromMetrics(
  improvement: ImprovementProposal
): ABTestDesign {
  return {
    test_id: `AB-${improvement.improvement_id}`,
    hypothesis: improvement.hypothesis,
    control: {
      configuration: improvement.baseline_configuration,
      cycles: [] // 실행 중 채움
    },
    treatment: {
      configuration: improvement.proposed_configuration,
      cycles: [] // 실행 중 채움
    },
    metrics: improvement.metrics_to_measure,
    min_cycles_per_group: 10
  };
}
```

#### 자동 테스트 실행 트리거

다음 조건에서 A/B 테스트를 자동으로 실행합니다:

1. **개선 제안 승인 시**:
   - 우선순위 P0 또는 P1 개선 제안
   - 자동으로 A/B 테스트 설계 및 실행

2. **성능 저하 감지 시**:
   - 성능 저하 10% 이상 감지
   - 즉시 개선 제안 생성 및 A/B 테스트 실행

3. **정기 개선 분석 시**:
   - 20개 사이클마다 자동 분석
   - 개선 기회 발견 시 A/B 테스트 제안

## 테스트 설계

### 가설
```
변경: QA 커버리지 기준 80% → 70%
가설: 재시도 횟수 감소, 완료 시간 단축
예상 효과: 시간 20% 단축
```

### 테스트 그룹
```
Group A (Control): 기존 80%
Group B (Treatment): 새로운 70%

각 그룹: 10개 사이클
```

### 메트릭 기반 테스트 설계 프로세스

1. **개선 제안에서 테스트 설계 추출**:
   ```markdown
   개선 제안 (IMP-2026-01-28-001)에서:
   - Control: 모든 파일 80% 커버리지
   - Treatment: 파일별 차등 커버리지
   - 측정 지표: 재시도 횟수, 완료 시간, 품질 점수
   ```

2. **테스트 그룹 할당**:
   - 사이클 ID 기반 랜덤 할당 또는 순차 할당
   - 각 그룹 최소 10개 사이클 보장

3. **설정 적용**:
   - Control 그룹: 기존 Rule/Skill 유지
   - Treatment 그룹: 제안된 변경사항 적용

## 자동 테스트 실행

### 실행 프로세스

```typescript
// 의사코드
interface ABTestExecution {
  test_id: string;
  started_at: string;
  control_cycles: string[];
  treatment_cycles: string[];
  status: 'running' | 'completed' | 'cancelled';
  results: ABTestResults | null;
}

async function executeABTest(test: ABTestDesign): Promise<ABTestExecution> {
  const execution: ABTestExecution = {
    test_id: test.test_id,
    started_at: new Date().toISOString(),
    control_cycles: [],
    treatment_cycles: [],
    status: 'running',
    results: null
  };
  
  // Control 그룹 실행 (기존 설정)
  for (let i = 0; i < test.min_cycles_per_group; i++) {
    const cycleId = await runCycleWithConfiguration(
      test.control.configuration
    );
    execution.control_cycles.push(cycleId);
  }
  
  // Treatment 그룹 실행 (새로운 설정)
  for (let i = 0; i < test.min_cycles_per_group; i++) {
    const cycleId = await runCycleWithConfiguration(
      test.treatment.configuration
    );
    execution.treatment_cycles.push(cycleId);
  }
  
  // 결과 분석
  execution.results = await analyzeResults(execution);
  execution.status = 'completed';
  
  return execution;
}
```

### 트리거 조건

다음 조건에서 자동으로 A/B 테스트를 실행합니다:

1. **개선 제안 승인 시**:
   - 우선순위 P0 또는 P1 개선 제안
   - 자동으로 A/B 테스트 시작

2. **성능 저하 감지 시**:
   - 성능 저하 10% 이상 감지
   - 즉시 개선 제안 생성 및 A/B 테스트 실행

3. **사용자 요청 시**:
   - 사용자가 명시적으로 A/B 테스트 요청
   - 특정 개선안에 대한 검증 필요 시

## 측정 지표

### 주요 지표
- 평균 완료 시간 (`duration_ms`)
- 재시도 횟수 (`total_retries`)
- 품질 점수 (`quality_score`)
- 성공률 (`success_rate`)

### 보조 지표
- 사용자 만족도 (`user_feedback.rating`)
- 에러율 (`error_rate`)
- 토큰 효율 (`tokens_per_minute`)
- 파일 처리 효율 (`files_per_hour`)

### 메트릭 수집

각 사이클 완료 시 자동으로 메트릭을 수집합니다:

```typescript
// 의사코드
function collectMetricsForABTest(
  cycleId: string,
  group: 'control' | 'treatment'
): CycleMetrics {
  const cycle = readCycleFile(cycleId);
  
  return {
    group,
    duration_ms: cycle.totals.duration_ms,
    total_retries: cycle.totals.total_retries,
    success: cycle.totals.success,
    quality_score: calculateQualityScore(cycle),
    // 에이전트별 메트릭
    agent_metrics: extractAgentMetrics(cycle)
  };
}
```

## 결과 분석 및 통계적 유의성 검증

### 결과 분석

```typescript
// 의사코드
interface ABTestResults {
  control: {
    avg_duration_ms: number;
    avg_retries: number;
    avg_quality_score: number;
    success_rate: number;
    std_dev: {
      duration_ms: number;
      retries: number;
      quality_score: number;
    };
  };
  treatment: {
    avg_duration_ms: number;
    avg_retries: number;
    avg_quality_score: number;
    success_rate: number;
    std_dev: {
      duration_ms: number;
      retries: number;
      quality_score: number;
    };
  };
  improvement: {
    duration_reduction_percent: number;
    retry_reduction_percent: number;
    quality_change_percent: number;
  };
  statistical_significance: {
    duration: { p_value: number; significant: boolean };
    retries: { p_value: number; significant: boolean };
    quality: { p_value: number; significant: boolean };
  };
}

function analyzeResults(execution: ABTestExecution): ABTestResults {
  const controlMetrics = execution.control_cycles.map(id => 
    collectMetricsForABTest(id, 'control')
  );
  const treatmentMetrics = execution.treatment_cycles.map(id => 
    collectMetricsForABTest(id, 'treatment')
  );
  
  // 통계 계산
  const controlAvg = calculateAverage(controlMetrics);
  const treatmentAvg = calculateAverage(treatmentMetrics);
  
  // 통계적 유의성 검증 (t-test)
  const significance = performTTest(controlMetrics, treatmentMetrics);
  
  return {
    control: controlAvg,
    treatment: treatmentAvg,
    improvement: {
      duration_reduction_percent: 
        (controlAvg.avg_duration_ms - treatmentAvg.avg_duration_ms) / 
        controlAvg.avg_duration_ms * 100,
      retry_reduction_percent: 
        (controlAvg.avg_retries - treatmentAvg.avg_retries) / 
        controlAvg.avg_retries * 100,
      quality_change_percent: 
        (treatmentAvg.avg_quality_score - controlAvg.avg_quality_score) / 
        controlAvg.avg_quality_score * 100
    },
    statistical_significance: significance
  };
}
```

### 통계적 유의성 검증

#### t-test 수행

```markdown
## 통계적 유의성 검증 기준

### 주요 지표
- p-value < 0.05: 통계적으로 유의미한 차이
- p-value >= 0.05: 통계적으로 유의미하지 않음

### 개선 효과 기준
- 시간 단축: 10% 이상
- 재시도 감소: 20% 이상
- 품질 유지: 5% 이내 변화 (저하 없음)

### 채택 조건 (모두 충족 필요)
- [ ] 통계적 유의성 (p < 0.05)
- [ ] 개선 효과 10% 이상
- [ ] 품질 저하 없음 (5% 이내)
- [ ] 에러율 증가 없음
```

#### 결과 예시

```
Group A (Control): 
- 평균 40분, 재시도 2.3회, 품질 0.85

Group B (Treatment): 
- 평균 32분, 재시도 1.5회, 품질 0.86

통계 분석:
- 시간: p = 0.02 (유의미), 20% 개선
- 재시도: p = 0.01 (유의미), 35% 개선
- 품질: p = 0.45 (비유의미), 1% 개선

결과: B가 20% 빠름, 재시도 35% 감소, 품질 유지
→ B 채택
```

## 최적 변경 자동 적용

### 자동 적용 프로세스

A/B 테스트 결과가 채택 기준을 충족하면 자동으로 변경사항을 적용합니다:

```typescript
// 의사코드
async function applyOptimalChange(
  test: ABTestExecution,
  results: ABTestResults
): Promise<void> {
  // 채택 조건 확인
  if (shouldAdoptTreatment(results)) {
    // Treatment 그룹이 더 나음 → 변경사항 적용
    await applyConfiguration(test.test_design.treatment.configuration);
    
    // 개선 이력 기록
    await recordImprovement({
      improvement_id: extractImprovementId(test.test_id),
      test_id: test.test_id,
      adopted: true,
      applied_at: new Date().toISOString(),
      results: results
    });
  } else {
    // Control 그룹이 더 나음 → 변경사항 롤백
    await rollbackConfiguration();
    
    // 개선 이력 기록
    await recordImprovement({
      improvement_id: extractImprovementId(test.test_id),
      test_id: test.test_id,
      adopted: false,
      reason: 'No significant improvement or quality degradation'
    });
  }
}

function shouldAdoptTreatment(results: ABTestResults): boolean {
  // 통계적 유의성 확인
  const isSignificant = 
    results.statistical_significance.duration.significant ||
    results.statistical_significance.retries.significant;
  
  // 개선 효과 확인
  const hasImprovement = 
    results.improvement.duration_reduction_percent >= 10 ||
    results.improvement.retry_reduction_percent >= 20;
  
  // 품질 유지 확인
  const qualityMaintained = 
    Math.abs(results.improvement.quality_change_percent) <= 5;
  
  return isSignificant && hasImprovement && qualityMaintained;
}
```

### 자동 적용 조건

다음 조건을 모두 충족하면 자동으로 적용합니다:

1. **통계적 유의성**: p < 0.05
2. **개선 효과**: 시간 10% 이상 단축 또는 재시도 20% 이상 감소
3. **품질 유지**: 품질 점수 5% 이내 변화 (저하 없음)
4. **에러율 유지**: 에러율 증가 없음

### 사용자 승인 프로세스

중요한 변경사항의 경우 사용자 승인을 요청합니다:

```markdown
## 사용자 승인 필요 변경사항

다음 변경사항은 자동 적용 전 사용자 승인이 필요합니다:

1. **Rule 파일 수정**:
   - `.cursor/rules/*.mdc` 파일 수정
   - 워크플로우 변경

2. **Skill 파일 생성/수정**:
   - 새로운 Skill 추가
   - 기존 Skill 대폭 수정

3. **AGENTS.md 수정**:
   - 에이전트 구조 변경
   - 새로운 에이전트 추가

### 승인 프로세스

1. A/B 테스트 결과 보고서 생성
2. 사용자에게 승인 요청
3. 승인 시 자동 적용
4. 거부 시 롤백 및 다른 방안 검토
```

## 롤백 조건

다음 조건에서 자동으로 롤백합니다:

- 품질 10% 이상 저하
- 에러율 2배 증가
- 사용자 명시적 거부
- A/B 테스트에서 통계적 유의성 없음
- 개선 효과 5% 미만

## 완료 기준

- [ ] A/B 테스트 설계
- [ ] 각 그룹 10개 사이클 실행
- [ ] 통계적 유의성 확인
- [ ] 채택/거부 결정
- [ ] 최적 변경 자동 적용 (또는 사용자 승인)
- [ ] 개선 이력 기록