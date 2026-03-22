# Phase 3: 팀 공유 서버

## 목표

HTTP/SSE 기반 팀 공유 MCP 서버를 구축한다. 인증/권한 관리, GitLab 웹훅 기반 자동 인덱싱, 팀 대시보드를 추가하여 팀 전체가 하나의 벡터 DB를 공유한다.

---

## 선행 조건 (ROI 게이트)

- Phase 2 완료 및 멀티 프로젝트 안정 운영
- **팀원 3명+ 사용 의향 확인**

---

## 참조 설계 문서 (섹션 단위 매핑)

| 문서                  | 섹션                    | 참조 내용                                |
| --------------------- | ----------------------- | ---------------------------------------- |
| `01-architecture.md`  | §4 Phase 3 배포         | HTTP/SSE 서버, 인증, CI/CD 통합          |
| `02-data-pipeline.md` | §2-3 Phase 3: 웹훅 기반 | GitLab 웹훅 이벤트 (merge_request, push) |
| `04-verification.md`  | §2-3 신뢰도 점수 산출   | 3단계 검증 전체 파이프라인               |
| `06-tech-stack.md`    | §1 Phase 3              | HTTP 프레임워크, 인증, 모니터링          |

---

## 마일스톤 요약

| #    | 마일스톤           | 산출물                       | 완료 기준                      |
| ---- | ------------------ | ---------------------------- | ------------------------------ |
| P3-1 | HTTP/SSE 서버 전환 | stdio → HTTP/SSE MCP 서버    | 원격 접속 동작, 기존 Tool 호환 |
| P3-2 | 인증/권한 관리     | JWT 토큰 인증, 프로젝트 권한 | 사용자별 접근 제어 동작        |
| P3-3 | GitLab 웹훅 수신   | 웹훅 핸들러 + 자동 인덱싱    | MR 머지 시 자동 인제스트       |
| P3-4 | CI/CD 통합         | 파이프라인 스테이지          | MR 머지 후 자동 인덱싱         |
| P3-5 | 팀 대시보드        | 인덱싱 현황, 사용 통계       | 웹 UI에서 상태 모니터링        |
| P3-6 | 운영 모니터링      | 로깅, 메트릭, 알림           | 에러율/지연시간 모니터링       |

---

## 기술 스택 변경 (Phase 2 대비)

```diff
  Node.js >= 20 + TypeScript
- ├── @modelcontextprotocol/sdk (stdio)
+ ├── @modelcontextprotocol/sdk (HTTP/SSE)
+ ├── express 또는 fastify (HTTP 서버)
+ ├── jsonwebtoken (JWT 인증)
  ├── @qdrant/js-client-rest
  ├── @gitbeaker/rest
  ├── OpenAI API
  ├── typescript (Compiler API)
- └── better-sqlite3
+ ├── better-sqlite3
+ └── pino (로깅) + prom-client (메트릭)
```

---

## 배포 구성 (예상)

```
                 ┌─────────────────────────┐
                 │     Reverse Proxy        │
                 │     (nginx/traefik)      │
                 └────────┬────────────────┘
                          │
          ┌───────────────┼────────────────┐
          │               │                │
   ┌──────┴──────┐ ┌─────┴──────┐ ┌───────┴──────┐
   │  MCP Server  │ │  Qdrant    │ │  Webhook     │
   │  (HTTP/SSE)  │ │  Server    │ │  Handler     │
   └─────────────┘ └────────────┘ └──────────────┘
```

---

## 생성/수정 파일 목록 (예상)

| 파일                          | 역할                                  |
| ----------------------------- | ------------------------------------- |
| `src/server/http_server.ts`   | HTTP/SSE MCP 서버                     |
| `src/auth/jwt.ts`             | JWT 인증/검증                         |
| `src/auth/permissions.ts`     | 프로젝트별 권한 관리                  |
| `src/webhooks/handler.ts`     | GitLab 웹훅 수신 핸들러               |
| `src/webhooks/auto_ingest.ts` | 웹훅 → 자동 인제스트 트리거           |
| `src/monitoring/logger.ts`    | 구조화 로깅                           |
| `src/monitoring/metrics.ts`   | Prometheus 메트릭                     |
| `Dockerfile`                  | Docker 컨테이너 빌드                  |
| `docker-compose.yml`          | MCP + Qdrant + webhook 오케스트레이션 |

---

## 구현 상세

> Phase 1a에서 확립된 패턴(에러 처리, 설정 로드, 파이프라인 오케스트레이션)을 따름.
> 상세 구현은 Phase 3 시작 시 마일스톤별 문서로 작성.

---

## 검증 기준

- [ ] HTTP/SSE로 원격 Cursor 클라이언트 3개+ 동시 접속
- [ ] JWT 인증 동작, 미인증 요청 거부
- [ ] GitLab 웹훅으로 MR 머지 시 자동 인제스트 (5분 이내)
- [ ] 팀 대시보드에서 인덱싱 현황 실시간 조회
- [ ] 에러율 < 1%, P95 응답 시간 < 3초
- [ ] Docker 컨테이너 원클릭 배포

---

## 다음 단계

→ Phase 3 완료 = CR-RAG MCP 전체 완성
