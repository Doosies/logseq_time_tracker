---
name: metrics-analysis
description: 메트릭 데이터 분석 및 트렌드 계산
---

# 메트릭 분석 시스템

## 개요

수집된 메트릭 데이터를 분석하여 성능 트렌드를 계산하고, 병목 지점을 식별하며, 개선 기회를 발견하는 시스템입니다.

## 핵심 원칙

1. **데이터 기반**: 실제 메트릭 데이터를 기반으로 분석
2. **트렌드 중심**: 단일 값보다 시간에 따른 변화 추세 분석
3. **병목 식별**: 성능 저하의 주요 원인 파악
4. **실행 가능**: 분석 결과를 바탕으로 구체적인 개선 제안

---

## 트렌드 계산 로직

### 평균 완료 시간 트렌드

```typescript
interface TrendAnalysis {
  metric: string;
  current_value: number;
  previous_value: number;
  change_percent: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  significance: 'high' | 'medium' | 'low';
}

function calculateDurationTrend(
  current_cycles: CycleMetrics[],
  previous_cycles: CycleMetrics[]
): TrendAnalysis {
  const current_avg = calculateAverageDuration(current_cycles);
  const previous_avg = calculateAverageDuration(previous_cycles);
  
  const change_percent = previous_avg > 0 
    ? ((current_avg - previous_avg) / previous_avg) * 100 
    : 0;
  
  const abs_change = Math.abs(change_percent);
  
  return {
    metric: 'avg_duration',
    current_value: current_avg,
    previous_value: previous_avg,
    change_percent,
    trend: abs_change < 5 ? 'stable' : change_percent > 0 ? 'increasing' : 'decreasing',
    significance: abs_change > 20 ? 'high' : abs_change > 10 ? 'medium' : 'low'
  };
}

function calculateAverageDuration(cycles: CycleMetrics[]): number {
  const durations = cycles
    .map(c => c.totals?.duration_ms || 0)
    .filter(d => d > 0);
  
  return durations.length > 0
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length
    : 0;
}
```

### 성공률 트렌드

```typescript
function calculateSuccessRateTrend(
  current_cycles: CycleMetrics[],
  previous_cycles: CycleMetrics[]
): TrendAnalysis {
  const current_rate = calculateSuccessRate(current_cycles);
  const previous_rate = calculateSuccessRate(previous_cycles);
  
  const change_percent = previous_rate > 0
    ? ((current_rate - previous_rate) / previous_rate) * 100
    : 0;
  
  const abs_change = Math.abs(change_percent);
  
  return {
    metric: 'success_rate',
    current_value: current_rate,
    previous_value: previous_rate,
    change_percent,
    trend: abs_change < 2 ? 'stable' : change_percent > 0 ? 'increasing' : 'decreasing',
    significance: abs_change > 10 ? 'high' : abs_change > 5 ? 'medium' : 'low'
  };
}

function calculateSuccessRate(cycles: CycleMetrics[]): number {
  if (cycles.length === 0) return 0;
  
  const successful = cycles.filter(c => c.totals?.success === true).length;
  return successful / cycles.length;
}
```

### 토큰 효율 트렌드

```typescript
function calculateTokenEfficiencyTrend(
  current_cycles: CycleMetrics[],
  previous_cycles: CycleMetrics[]
): TrendAnalysis {
  const current_efficiency = calculateTokenEfficiency(current_cycles);
  const previous_efficiency = calculateTokenEfficiency(previous_cycles);
  
  const change_percent = previous_efficiency > 0
    ? ((current_efficiency - previous_efficiency) / previous_efficiency) * 100
    : 0;
  
  const abs_change = Math.abs(change_percent);
  
  return {
    metric: 'token_efficiency',
    current_value: current_efficiency,
    previous_value: previous_efficiency,
    change_percent,
    trend: abs_change < 5 ? 'stable' : change_percent > 0 ? 'increasing' : 'decreasing',
    significance: abs_change > 15 ? 'high' : abs_change > 8 ? 'medium' : 'low'
  };
}

function calculateTokenEfficiency(cycles: CycleMetrics[]): number {
  let total_tokens = 0;
  let total_duration_ms = 0;
  
  for (const cycle of cycles) {
    total_tokens += cycle.totals?.total_tokens || 0;
    total_duration_ms += cycle.totals?.duration_ms || 0;
  }
  
  // 분당 토큰 수
  const total_minutes = total_duration_ms / 60000;
  return total_minutes > 0 ? total_tokens / total_minutes : 0;
}
```

---

## 병목 지점 식별 알고리즘

### 시간 병목 식별

```typescript
interface TimeBottleneck {
  agent: string;
  avg_duration_ms: number;
  max_duration_ms: number;
  frequency: number;
  impact_score: number; // 0-100
  percentile_95: number;
}

function identifyTimeBottlenecks(cycles: CycleMetrics[]): TimeBottleneck[] {
  const agent_stats: Map<string, number[]> = new Map();
  
  // 각 에이전트의 실행 시간 수집
  for (const cycle of cycles) {
    for (const [agent, agentData] of Object.entries(cycle.agents || {})) {
      if (agentData.duration_ms > 0) {
        if (!agent_stats.has(agent)) {
          agent_stats.set(agent, []);
        }
        agent_stats.get(agent)!.push(agentData.duration_ms);
      }
    }
  }
  
  const bottlenecks: TimeBottleneck[] = [];
  
  for (const [agent, durations] of agent_stats.entries()) {
    if (durations.length === 0) continue;
    
    durations.sort((a, b) => a - b);
    
    const avg_duration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const max_duration = Math.max(...durations);
    const percentile_95 = durations[Math.floor(durations.length * 0.95)];
    
    // 영향도 점수 계산: 평균 시간 * 빈도 * 변동성
    const variance = calculateVariance(durations);
    const coefficient_of_variation = variance / avg_duration;
    const impact_score = Math.min(100, (avg_duration / 1000) * durations.length * (1 + coefficient_of_variation));
    
    bottlenecks.push({
      agent,
      avg_duration_ms: avg_duration,
      max_duration_ms: max_duration,
      frequency: durations.length,
      impact_score,
      percentile_95
    });
  }
  
  // 영향도 점수 순으로 정렬
  return bottlenecks.sort((a, b) => b.impact_score - a.impact_score);
}

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squared_diffs = values.map(v => Math.pow(v - mean, 2));
  return squared_diffs.reduce((sum, d) => sum + d, 0) / values.length;
}
```

### 품질 병목 식별

```typescript
interface QualityBottleneck {
  agent: string;
  issue_type: string;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  avg_resolution_time_ms?: number;
}

function identifyQualityBottlenecks(cycles: CycleMetrics[]): QualityBottleneck[] {
  const issue_frequency: Map<string, { agent: string; count: number; resolution_times: number[] }> = new Map();
  
  for (const cycle of cycles) {
    // 재시도 분석
    for (const [agent, agentData] of Object.entries(cycle.agents || {})) {
      if (agentData.retries > 0) {
        const key = `${agent}_retries`;
        const existing = issue_frequency.get(key);
        if (existing) {
          existing.count += agentData.retries;
        } else {
          issue_frequency.set(key, {
            agent,
            count: agentData.retries,
            resolution_times: []
          });
        }
      }
    }
    
    // Linter 오류 분석 (Developer)
    if (cycle.agents?.developer?.linter_errors_introduced > 0) {
      const key = 'developer_linter_errors';
      const existing = issue_frequency.get(key);
      if (existing) {
        existing.count += cycle.agents.developer.linter_errors_introduced;
      } else {
        issue_frequency.set(key, {
          agent: 'developer',
          count: cycle.agents.developer.linter_errors_introduced,
          resolution_times: []
        });
      }
    }
    
    // 테스트 실패 분석 (QA)
    if (cycle.agents?.qa?.tests_failed > 0) {
      const key = 'qa_test_failures';
      const existing = issue_frequency.get(key);
      if (existing) {
        existing.count += cycle.agents.qa.tests_failed;
      } else {
        issue_frequency.set(key, {
          agent: 'qa',
          count: cycle.agents.qa.tests_failed,
          resolution_times: []
        });
      }
    }
    
    // 에러 해결 시간 분석
    for (const error of cycle.errors || []) {
      if (error.resolved && error.resolution_time_ms) {
        const key = `${error.agent}_${error.type}`;
        const existing = issue_frequency.get(key);
        if (existing) {
          existing.resolution_times.push(error.resolution_time_ms);
        }
      }
    }
  }
  
  const bottlenecks: QualityBottleneck[] = [];
  const total_cycles = cycles.length;
  
  for (const [key, stats] of issue_frequency.entries()) {
    const frequency_rate = stats.count / total_cycles;
    
    let impact: 'high' | 'medium' | 'low' = 'low';
    if (frequency_rate >= 0.3) {
      impact = 'high';
    } else if (frequency_rate >= 0.15) {
      impact = 'medium';
    }
    
    const avg_resolution_time = stats.resolution_times.length > 0
      ? stats.resolution_times.reduce((sum, t) => sum + t, 0) / stats.resolution_times.length
      : undefined;
    
    bottlenecks.push({
      agent: stats.agent,
      issue_type: key.split('_').slice(1).join('_'),
      frequency: stats.count,
      impact,
      avg_resolution_time_ms: avg_resolution_time
    });
  }
  
  return bottlenecks.sort((a, b) => {
    // 영향도 우선, 그 다음 빈도
    const impact_order = { high: 3, medium: 2, low: 1 };
    if (impact_order[a.impact] !== impact_order[b.impact]) {
      return impact_order[b.impact] - impact_order[a.impact];
    }
    return b.frequency - a.frequency;
  });
}
```

---

## 성능 저하 감지

### 이상치 감지

```typescript
interface Anomaly {
  cycle_id: string;
  metric: string;
  value: number;
  expected_range: { min: number; max: number };
  deviation_percent: number;
  severity: 'critical' | 'warning' | 'info';
}

function detectPerformanceAnomalies(cycles: CycleMetrics[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  
  if (cycles.length < 3) return anomalies; // 최소 3개 사이클 필요
  
  // 평균 완료 시간 이상치
  const durations = cycles.map(c => c.totals?.duration_ms || 0).filter(d => d > 0);
  const duration_stats = calculateStatistics(durations);
  
  for (const cycle of cycles) {
    const duration = cycle.totals?.duration_ms || 0;
    if (duration > duration_stats.mean + 2 * duration_stats.std_dev) {
      anomalies.push({
        cycle_id: cycle.cycle_id,
        metric: 'duration',
        value: duration,
        expected_range: {
          min: duration_stats.mean - duration_stats.std_dev,
          max: duration_stats.mean + duration_stats.std_dev
        },
        deviation_percent: ((duration - duration_stats.mean) / duration_stats.mean) * 100,
        severity: duration > duration_stats.mean + 3 * duration_stats.std_dev ? 'critical' : 'warning'
      });
    }
  }
  
  // 토큰 사용량 이상치
  const tokens = cycles.map(c => c.totals?.total_tokens || 0).filter(t => t > 0);
  const token_stats = calculateStatistics(tokens);
  
  for (const cycle of cycles) {
    const tokens_used = cycle.totals?.total_tokens || 0;
    if (tokens_used > token_stats.mean + 2 * token_stats.std_dev) {
      anomalies.push({
        cycle_id: cycle.cycle_id,
        metric: 'tokens',
        value: tokens_used,
        expected_range: {
          min: token_stats.mean - token_stats.std_dev,
          max: token_stats.mean + token_stats.std_dev
        },
        deviation_percent: ((tokens_used - token_stats.mean) / token_stats.mean) * 100,
        severity: tokens_used > token_stats.mean + 3 * token_stats.std_dev ? 'critical' : 'warning'
      });
    }
  }
  
  return anomalies;
}

function calculateStatistics(values: number[]): {
  mean: number;
  std_dev: number;
  median: number;
  q1: number;
  q3: number;
} {
  if (values.length === 0) {
    return { mean: 0, std_dev: 0, median: 0, q1: 0, q3: 0 };
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, v) => sum + v, 0) / sorted.length;
  
  const variance = sorted.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / sorted.length;
  const std_dev = Math.sqrt(variance);
  
  const median = sorted[Math.floor(sorted.length / 2)];
  const q1 = sorted[Math.floor(sorted.length / 4)];
  const q3 = sorted[Math.floor(sorted.length * 3 / 4)];
  
  return { mean, std_dev, median, q1, q3 };
}
```

### 성능 저하 패턴 감지

```typescript
interface PerformanceDegradation {
  pattern: string;
  affected_agents: string[];
  start_date: string;
  end_date?: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

function detectPerformanceDegradation(
  daily_summaries: DailySummary[]
): PerformanceDegradation[] {
  const degradations: PerformanceDegradation[] = [];
  
  if (daily_summaries.length < 3) return degradations;
  
  // 연속된 성공률 저하 감지
  let consecutive_failures = 0;
  let failure_start_date = '';
  
  for (let i = 1; i < daily_summaries.length; i++) {
    const prev = daily_summaries[i - 1];
    const curr = daily_summaries[i];
    
    if (curr.success_rate < prev.success_rate - 0.1) {
      if (consecutive_failures === 0) {
        failure_start_date = curr.date;
      }
      consecutive_failures++;
    } else {
      if (consecutive_failures >= 2) {
        degradations.push({
          pattern: 'success_rate_decline',
          affected_agents: [],
          start_date: failure_start_date,
          end_date: prev.date,
          severity: consecutive_failures >= 3 ? 'high' : 'medium',
          description: `성공률이 ${consecutive_failures}일 연속 하락했습니다.`
        });
      }
      consecutive_failures = 0;
    }
  }
  
  // 평균 완료 시간 증가 감지
  let duration_increase_days = 0;
  let duration_start_date = '';
  
  for (let i = 1; i < daily_summaries.length; i++) {
    const prev = daily_summaries[i - 1];
    const curr = daily_summaries[i];
    
    if (curr.duration.avg_ms > prev.duration.avg_ms * 1.2) {
      if (duration_increase_days === 0) {
        duration_start_date = curr.date;
      }
      duration_increase_days++;
    } else {
      if (duration_increase_days >= 2) {
        degradations.push({
          pattern: 'duration_increase',
          affected_agents: [],
          start_date: duration_start_date,
          end_date: prev.date,
          severity: duration_increase_days >= 3 ? 'high' : 'medium',
          description: `평균 완료 시간이 ${duration_increase_days}일 연속 증가했습니다.`
        });
      }
      duration_increase_days = 0;
    }
  }
  
  return degradations;
}
```

---

## 개선 기회 발견

### 효율성 개선 기회

```typescript
interface ImprovementOpportunity {
  area: string;
  current_value: number;
  potential_value: number;
  improvement_percent: number;
  effort: 'low' | 'medium' | 'high';
  priority: 'high' | 'medium' | 'low';
  description: string;
}

function identifyImprovementOpportunities(
  cycles: CycleMetrics[],
  daily_summaries: DailySummary[]
): ImprovementOpportunity[] {
  const opportunities: ImprovementOpportunity[] = [];
  
  // 재시도율 감소 기회
  const agent_retry_rates: Map<string, number> = new Map();
  for (const cycle of cycles) {
    for (const [agent, agentData] of Object.entries(cycle.agents || {})) {
      if (agentData.retries > 0) {
        const current = agent_retry_rates.get(agent) || 0;
        agent_retry_rates.set(agent, current + agentData.retries);
      }
    }
  }
  
  for (const [agent, total_retries] of agent_retry_rates.entries()) {
    const agent_cycles = cycles.filter(c => c.agents?.[agent]);
    const retry_rate = agent_cycles.length > 0 ? total_retries / agent_cycles.length : 0;
    
    if (retry_rate > 0.1) {
      opportunities.push({
        area: `${agent}_retry_rate`,
        current_value: retry_rate,
        potential_value: retry_rate * 0.5, // 50% 감소 목표
        improvement_percent: 50,
        effort: retry_rate > 0.3 ? 'high' : 'medium',
        priority: retry_rate > 0.2 ? 'high' : 'medium',
        description: `${agent} 에이전트의 재시도율이 ${(retry_rate * 100).toFixed(1)}%입니다. 요구사항 명확화 및 품질 개선으로 감소 가능합니다.`
      });
    }
  }
  
  // Linter 오류 감소 기회
  const developer_cycles = cycles.filter(c => c.agents?.developer);
  const total_linter_errors = developer_cycles.reduce(
    (sum, c) => sum + (c.agents.developer.linter_errors_introduced || 0),
    0
  );
  
  if (total_linter_errors > 0) {
    const avg_linter_errors = total_linter_errors / developer_cycles.length;
    opportunities.push({
      area: 'developer_linter_errors',
      current_value: avg_linter_errors,
      potential_value: 0,
      improvement_percent: 100,
      effort: avg_linter_errors > 2 ? 'high' : 'medium',
      priority: 'high',
      description: `Developer 에이전트가 평균 ${avg_linter_errors.toFixed(1)}개의 Linter 오류를 도입합니다. 코드 품질 검증 강화 필요합니다.`
    });
  }
  
  // 평균 완료 시간 단축 기회
  const avg_duration = daily_summaries.length > 0
    ? daily_summaries.reduce((sum, d) => sum + d.duration.avg_ms, 0) / daily_summaries.length
    : 0;
  
  const time_bottlenecks = identifyTimeBottlenecks(cycles);
  if (time_bottlenecks.length > 0) {
    const top_bottleneck = time_bottlenecks[0];
    const potential_reduction = top_bottleneck.avg_duration_ms * 0.2; // 20% 감소 목표
    
    opportunities.push({
      area: `${top_bottleneck.agent}_duration`,
      current_value: top_bottleneck.avg_duration_ms,
      potential_value: top_bottleneck.avg_duration_ms - potential_reduction,
      improvement_percent: 20,
      effort: top_bottleneck.impact_score > 50 ? 'high' : 'medium',
      priority: top_bottleneck.impact_score > 70 ? 'high' : 'medium',
      description: `${top_bottleneck.agent} 에이전트가 평균 ${(top_bottleneck.avg_duration_ms / 1000).toFixed(1)}초 소요됩니다. 최적화로 ${(potential_reduction / 1000).toFixed(1)}초 단축 가능합니다.`
    });
  }
  
  return opportunities.sort((a, b) => {
    // 우선순위 우선, 그 다음 개선율
    const priority_order = { high: 3, medium: 2, low: 1 };
    if (priority_order[a.priority] !== priority_order[b.priority]) {
      return priority_order[b.priority] - priority_order[a.priority];
    }
    return b.improvement_percent - a.improvement_percent;
  });
}
```

---

## 사용 방법

### 일별 요약 분석

```typescript
// 일별 요약 읽기
const daily_summary = JSON.parse(
  await readFile('.cursor/metrics/summaries/daily-2026-01-28.json', 'utf-8')
);

// 병목 지점 확인
console.log('Top Bottlenecks:', daily_summary.top_bottlenecks);

// 에이전트별 성능 확인
console.log('Agent Performance:', daily_summary.agent_performance);
```

### 주별 트렌드 분석

```typescript
// 주별 요약 읽기
const weekly_summary = JSON.parse(
  await readFile('.cursor/metrics/summaries/weekly-2026-W04.json', 'utf-8')
);

// 트렌드 확인
console.log('Trends:', weekly_summary.trends);

// 개선 제안 확인
console.log('Recommendations:', weekly_summary.recommendations);
```

### 성능 분석 실행

```typescript
// 사이클 데이터 읽기
const cycles = await loadCyclesForDate('2026-01-28');

// 병목 지점 식별
const time_bottlenecks = identifyTimeBottlenecks(cycles);
const quality_bottlenecks = identifyQualityBottlenecks(cycles);

// 이상치 감지
const anomalies = detectPerformanceAnomalies(cycles);

// 개선 기회 발견
const opportunities = identifyImprovementOpportunities(cycles, []);
```

---

## 주의사항

### 데이터 품질

- 최소 3개 이상의 사이클 데이터가 있어야 의미 있는 분석 가능
- 이상치가 많으면 통계적 유의성 감소
- 누락된 데이터는 분석 결과에 영향을 줄 수 있음

### 해석 주의

- 트렌드는 단기 변동성에 영향을 받을 수 있음
- 병목 지점은 상대적 비교이므로 절대적 기준이 아님
- 개선 기회는 잠재적 가능성을 나타내며, 실제 달성 여부는 보장하지 않음

### 성능 고려

- 대량의 사이클 데이터 분석 시 메모리 사용량 주의
- 분석 함수는 비동기로 실행하여 메인 작업 흐름 방해 최소화

---

## 완료 기준

- [ ] 트렌드 계산 로직이 정확히 작동함
- [ ] 병목 지점이 정확히 식별됨
- [ ] 성능 저하가 감지됨
- [ ] 개선 기회가 발견됨
- [ ] 분석 결과가 실행 가능한 제안으로 변환됨
