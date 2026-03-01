---
name: security
description: "보안 검증 및 취약점 탐지 스킬. SQL Injection/XSS/CSRF/Prototype Pollution 점검, 민감정보 탐지, 입력값 검증, 프롬프트 인젝션 방어, 의존성 취약점 점검 시 사용합니다."
---

# 보안 스킬

보안 검증과 취약점 탐지를 위한 전문 스킬입니다.

## 사용 시점

- 코드 보안 취약점 스캔(SQL Injection, XSS, CSRF)
- 민감 정보 탐지(API 키, 비밀번호, 토큰)
- 입력값 검증 확인
- 프롬프트 인젝션 방어
- 의존성 취약점 점검
- API 보안 검토(인증/인가)

## 보안 게이트

- Critical/High 취약점: 0
- 민감 정보 노출: 0
- 프롬프트 인젝션 차단율: 100%
- 안전하지 않은 코드 패턴: 0

## 상세 레퍼런스

필요 시 아래 레퍼런스를 참조합니다.

- `references/code-vulnerability-scan.md` - 코드 취약점 스캔
- `references/sensitive-data-detection.md` - 민감 정보 탐지
- `references/input-validation.md` - 입력 검증 규칙
- `references/prompt-injection-defense.md` - 프롬프트 인젝션 방어
- `references/api-security-check.md` - API 보안 체크리스트
