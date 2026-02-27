---
name: skill-generation
description: 새로운 Skill 생성 및 기존 Skill 수정
---

# Skill 생성 및 수정

## 새 Skill 생성 조건

### 패턴 감지
동일한 작업이 5회 이상 반복:
```
QA 에이전트가 매번 커버리지를 수동 파싱
→ coverage-automation.md 생성
```

### 지식 부족
에이전트가 특정 영역에서 반복적으로 실패:
```
API 보안 설정 실수 3회
→ api-security-checklist.md 생성
```

## Skill 수정

### 불명확한 지침
에이전트가 지침을 잘못 이해:
```
"테스트 작성" → 단위만? 통합도?
→ 명확하게 수정
```

### 최신화
새로운 best practice:
```
React 18 업데이트
→ 관련 Skill 업데이트
```

## Skill 템플릿

```markdown
---
name: skill-name
description: 간단한 설명
---

# Skill 제목

## 목적
[왜 필요한가]

## 사용 시점
[언제 사용하는가]

## 단계별 가이드
[어떻게 사용하는가]

## 예시
[구체적인 예시]

## 완료 기준
[체크리스트]
```

## 완료 기준
- [ ] 새 Skill 생성 또는 기존 수정
- [ ] 실제 태스크에 적용
- [ ] 효과 측정
