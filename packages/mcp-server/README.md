# Personal MCP Server

Cursor에서 사용 가능한 TypeScript 기반 Model Context Protocol (MCP) 서버입니다.

## 기능

### 도구 (Tools)

각 도구의 설명은 코드의 `inputSchema`와 동일한 의미입니다.

#### get_current_time

**설명:** 현재 시간을 반환합니다.

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `format` | `string` | 아니오 | 시간 포맷 (`iso`, `locale`, `timestamp`). 기본값: `iso` |

#### calculate

**설명:** 간단한 수학 계산을 수행합니다.

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `expression` | `string` | 예 | 계산할 수식 (예: `2 + 2`, `10 * 5`) |

#### cycle_init

**설명:** 새 작업 사이클을 초기화합니다. `cycle_id`를 자동 생성하고 `started_at`을 현재 시간으로 설정합니다.

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `task_type` | `string` | 예 | 태스크 유형: `feature`, `bugfix`, `refactor`, `docs`, `hotfix`, `chore` |
| `task_description` | `string` | 예 | 태스크 설명 |

#### cycle_get

**설명:** 특정 사이클의 전체 데이터를 조회합니다.

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `cycle_id` | `string` | 예 | 사이클 ID (`YYYY-MM-DD-NNN`) |

#### cycle_update

**설명:** 사이클 데이터를 부분 업데이트합니다. 배열 필드는 append, 객체 필드는 merge됩니다.

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `cycle_id` | `string` | 예 | 사이클 ID (`YYYY-MM-DD-NNN`) |
| `workflow_append` | `string` | 아니오 | `workflow` 배열에 추가할 에이전트명 |
| `agent_name` | `string` | 아니오 | 업데이트할 에이전트 이름 (`agent_outcome`과 함께 사용) |
| `agent_outcome` | `string` | 아니오 | 에이전트 결과 (`success`, `failure`, `skipped`) |
| `decision` | `object` | 아니오 | 추가할 결정사항. 필드: `phase`, `decision`, `rationale`, `alternatives`(배열) |
| `issue` | `object` | 아니오 | 추가할 이슈. 필드: `phase`, `issue`, `resolution`, `impact` |
| `quality_gates` | `object` | 아니오 | 업데이트할 품질 게이트 (키-값 쌍) |
| `notes` | `string` | 아니오 | 메모 (기존 값을 대체) |

#### cycle_complete

**설명:** 사이클을 완료 처리합니다. `completed_at`을 현재 시간으로 설정하고 `git diff`로 `files_changed`를 수집합니다.

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `cycle_id` | `string` | 예 | 사이클 ID (`YYYY-MM-DD-NNN`) |
| `success` | `boolean` | 예 | 성공 여부 |
| `failure_reason` | `string` | 아니오 | 실패 사유 (실패 시) |

#### cycle_list

**설명:** 특정 날짜의 사이클 목록을 조회합니다.

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `date` | `string` | 아니오 | 조회할 날짜 (`YYYY-MM-DD`, 기본: 오늘) |

#### cycle_summary

**설명:** 특정 날짜의 사이클 통계를 집계합니다.

| 파라미터 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `date` | `string` | 아니오 | 조회할 날짜 (`YYYY-MM-DD`, 기본: 오늘) |

### 리소스 (Resources)

- **info://server** - 서버 정보 조회

## 워크스페이스 경로

사이클 메트릭 JSON은 다음 디렉터리에 읽고 씁니다.

```text
{워크스페이스_루트}/.cursor/metrics/cycles/
```

**워크스페이스 루트**는 아래 순서로 결정됩니다.

1. CLI 인자: `--workspace` 바로 **다음** 인자 (예: `node dist/index.js --workspace D:/personal`)
2. 환경 변수: `WORKSPACE_ROOT`
3. 폴백: `process.cwd()` (MCP 프로세스의 현재 작업 디렉터리)

Cursor에서 MCP를 띄울 때 작업 디렉터리가 저장소 루트가 아니면, `args`에 `--workspace`와 프로젝트 절대 경로를 넣어 사이클 파일이 올바른 저장소에 쓰이도록 하세요.

### Cursor MCP 설정 예시 (워크스페이스 지정)

#### Windows

```json
{
  "mcpServers": {
    "personal": {
      "command": "node",
      "args": [
        "D:/personal/packages/mcp-server/dist/index.js",
        "--workspace",
        "D:/personal"
      ],
      "transport": "stdio"
    }
  }
}
```

#### macOS/Linux

```json
{
  "mcpServers": {
    "personal": {
      "command": "node",
      "args": [
        "/path/to/personal/packages/mcp-server/dist/index.js",
        "--workspace",
        "/path/to/personal"
      ],
      "transport": "stdio"
    }
  }
}
```

`WORKSPACE_ROOT`를 쓰는 경우 `env`에 설정할 수 있습니다.

## 설치

```bash
# 의존성 설치
pnpm install

# 빌드
pnpm build
```

## 개발

```bash
# 타입 체크
pnpm type-check

# Watch 모드
pnpm dev
```

## Cursor에서 사용하기

### 1. 빌드

```bash
cd packages/mcp-server
pnpm build
```

### 2. Cursor 설정

워크스페이스 경로가 필요하면 위 [워크스페이스 경로](#워크스페이스-경로)의 `args` 예시를 사용하세요.

#### Windows (워크스페이스 미지정 시)

Cursor Settings → Features → Model Context Protocol → Add New MCP Server

```json
{
  "mcpServers": {
    "personal": {
      "command": "node",
      "args": ["D:/personal/packages/mcp-server/dist/index.js"],
      "transport": "stdio"
    }
  }
}
```

#### macOS/Linux

```json
{
  "mcpServers": {
    "personal": {
      "command": "node",
      "args": ["/path/to/personal/packages/mcp-server/dist/index.js"],
      "transport": "stdio"
    }
  }
}
```

### 3. Cursor 재시작

설정 후 Cursor를 재시작하면 MCP 서버가 자동으로 시작됩니다.

## 사용 예제

Cursor의 Composer나 Chat에서 다음과 같이 사용할 수 있습니다:

```
현재 시간을 알려줘
```

```
25 * 4를 계산해줘
```

사이클 도구는 에이전트 워크플로우와 연동해 `cycle_init`, `cycle_list` 등으로 메트릭을 기록할 때 사용합니다.

## 프로젝트 구조

```text
src/
├── index.ts                 # 메인 서버, ListTools / CallTool 핸들러
├── tools/
│   ├── index.ts             # 도구 확장 포인트 (registerTools)
│   └── cycle_metrics.ts     # 사이클 도구 정의·핸들러 (CYCLE_TOOL_DEFINITIONS)
├── utils/
│   └── cycle_file.ts        # 사이클 JSON 읽기/쓰기·목록·시퀀스 유틸
└── resources/
    └── index.ts             # 리소스 등록
```

## 도구 추가하기

### 패턴 A: `index.ts`에 인라인으로 추가

`ListToolsRequestSchema` 핸들러의 `tools` 배열에 객체를 추가하고, `CallToolRequestSchema`의 `switch`에 `case`를 추가합니다.

```typescript
{
  name: "my_tool",
  description: "도구 설명",
  inputSchema: {
    type: "object",
    properties: {
      param: {
        type: "string",
        description: "파라미터 설명"
      }
    },
    required: ["param"]
  }
}
```

```typescript
case "my_tool": {
  const param = args?.param as string;
  return {
    content: [{
      type: "text",
      text: `결과: ${param}`
    }]
  };
}
```

### 패턴 B: 모듈로 정의를 분리해 스프레드 (`cycle_metrics.ts` 방식)

1. `src/tools/my_feature.ts`에서 도구 정의 배열(각 항목에 `name`, `description`, `inputSchema`)과 핸들러 함수를 export합니다.
2. `src/index.ts`에서 해당 배열을 `tools` 배열에 `...MY_TOOL_DEFINITIONS`로 펼칩니다.
3. `CallToolRequestSchema` 핸들러에서 export한 핸들러를 import한 뒤, `switch`의 `case`에서 호출합니다.

이렇게 하면 도구가 많아져도 `index.ts`가 비대해지지 않고, 스키마와 구현을 한 파일에서 유지할 수 있습니다.

## 디버깅

서버 로그는 Cursor의 Output 패널 (MCP Logs)에서 확인할 수 있습니다.

```typescript
console.error("디버그 메시지"); // stderr로 출력
```

## 참고 자료

- [MCP 공식 문서](https://modelcontextprotocol.io/)
- [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Cursor MCP 문서](https://docs.cursor.com/context/model-context-protocol)
