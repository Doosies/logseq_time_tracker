# @personal/cr-rag-mcp

Code Review RAG MCP Server — Git 커밋 히스토리를 LLM 요약 + 벡터 검색으로 제공하는 [Model Context Protocol](https://modelcontextprotocol.io/) 서버입니다. ChromaDB에 임베딩을 저장하고, Cursor 등 MCP 클라이언트가 `search_review_context`, `ingest_commits`, `supplement_reason` 도구를 호출할 수 있습니다.

## 요구 사항

- Node.js (프로젝트 기준 ES2022)
- 실행 가능한 ChromaDB 인스턴스 (기본 `localhost:8000`)
- OpenAI API 키 (임베딩·요약용)

## 환경 변수

| 변수 | 필수 | 기본값 | 설명 |
|------|:----:|--------|------|
| `OPENAI_API_KEY` | 예 | — | OpenAI API 키. 없으면 서버 기동 시 오류 |
| `CR_RAG_DATA_DIR` | 아니오 | `<cwd>/.cr-rag-data` | 메타데이터·로컬 파일 저장 경로 (상대 경로는 `process.cwd()` 기준) |
| `CR_RAG_CHROMA_HOST` | 아니오 | `localhost` | ChromaDB 호스트 |
| `CR_RAG_CHROMA_PORT` | 아니오 | `8000` | ChromaDB 포트 (숫자 파싱 실패 시 `8000`) |
| `CR_RAG_COLLECTION_NAME` | 아니오 | `cr_rag_commits` | Chroma 컬렉션 이름 |

환경 변수는 `src/server/mcp_server.ts`의 `readEnv()`에서 읽습니다.

## Cursor에 MCP 등록

1. 패키지 빌드: `pnpm run build` (패키지 디렉터리 또는 루트에서 워크스페이스 스크립트에 맞게 실행).
2. Cursor MCP 설정(JSON)에 서버 정의를 추가합니다. 경로는 본인 환경에 맞게 바꿉니다.

```json
{
  "mcpServers": {
    "cr-rag-mcp": {
      "command": "node",
      "args": ["D:/personal/packages/cr-rag-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "CR_RAG_DATA_DIR": ".cr-rag-data",
        "CR_RAG_CHROMA_HOST": "localhost",
        "CR_RAG_CHROMA_PORT": "8000",
        "CR_RAG_COLLECTION_NAME": "cr_rag_commits"
      }
    }
  }
}
```

모노레포 루트에서 `pnpm exec`로 실행하려면 `command`를 `pnpm`, `args`를 `["exec", "--filter", "@personal/cr-rag-mcp", "start"]` 형태로 조정하고, 동일한 `env`를 넣으면 됩니다.

## 제공 도구 (Tools)

| 도구 | 설명 |
|------|------|
| `search_review_context` | unified diff(또는 변경 요약) 텍스트로 벡터 검색 후, 후처리된 유사 커밋 목록을 반환합니다. 선택적으로 `file_paths`로 결과를 좁힙니다. |
| `ingest_commits` | 지정한 Git 저장소(`repo_path`)에서 커밋을 수집·요약·임베딩해 Chroma에 인덱싱합니다. `mode`: `bulk` / `incremental` / `single`. |
| `supplement_reason` | 인덱스된 커밋에 보충 사유를 메타에 반영하고 임베딩을 갱신합니다. `commit_hash`, `reason`, `supplemented_by` 필수. |

스키마·필드 상세는 `docs/cr-rag-mcp/05-mcp-interface.md` 및 `src/server/mcp_server.ts`의 `TOOL_DEFINITIONS`를 참고하세요.

## 리소스 (Resources)

- `project://overview` — 프로젝트 인덱싱 개요(JSON). `ListResources` / `ReadResource`로 노출됩니다.

## 빌드 및 실행

```bash
# 패키지 디렉터리에서
pnpm run build
pnpm run start
```

개발 시 타입체크만:

```bash
pnpm run type-check
```

## npm 스크립트

| 스크립트 | 설명 |
|----------|------|
| `build` | `tsc`로 `dist/`에 컴파일 |
| `dev` | `tsc --watch` |
| `start` | `node dist/index.js` (stdio MCP 서버) |
| `type-check` | `tsc --noEmit` |
| `lint` | ESLint |
| `format` / `format:check` | Prettier |
| `test` | Vitest |

## CLI

`package.json`의 `bin` 필드로 `cr-rag-mcp`가 `dist/index.js`를 가리킵니다. 전역/로컬 설치 후 `cr-rag-mcp`로 stdio 서버를 띄울 수 있습니다.

## 라이선스

워크스페이스 루트 정책에 따릅니다.
