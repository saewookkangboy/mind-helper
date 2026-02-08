# 타로 MCP 연동 (데이터 정확성 보완)

Mind Helper는 기본 타로에 **RapidAPI Career Daily Tarot API**를 MCP로 보완해, 커리어·일일 타로 데이터 정확성을 높일 수 있습니다.

## 1. MCP 설정 (Cursor / VS Code)

### 1.1 프로젝트 설정

`.cursor/mcp.json` (또는 `.vscode/mcp.json`)에 아래와 같이 추가합니다.

```json
{
  "mcpServers": {
    "RapidAPI Hub - Career Daily Tarot API": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.rapidapi.com",
        "--header",
        "x-api-host: career-daily-tarot-api.p.rapidapi.com",
        "--header",
        "x-api-key: YOUR_RAPIDAPI_KEY"
      ]
    }
  }
}
```

- **`YOUR_RAPIDAPI_KEY`**: [RapidAPI](https://rapidapi.com)에서 Career Daily Tarot API 구독 후 발급받은 `x-api-key`로 교체하세요.
- API 키는 버전 관리에 올리지 말고, 로컬에서만 사용하거나 환경 변수로 주입하는 것을 권장합니다.

### 1.2 Cursor 전역 설정 (선택)

모든 프로젝트에서 쓰려면 Cursor 설정에서 MCP 서버를 등록할 수 있습니다.

- **macOS**: `~/Library/Application Support/Cursor/User/globalStorage/cursor.mcp/mcp.json` 등
- 설정 UI: Cursor → Settings → MCP 에서 동일한 `command` / `args` 추가

## 2. 역할 (데이터 정확성 중심)

| 구분 | 설명 |
|------|------|
| **앱 기본 타로** | [krates98/tarotcardapi](https://github.com/krates98/tarotcardapi) 기반 덱 + 이미지. 시드 기반 세 카드 스프레드. |
| **보완 MCP** | RapidAPI Career Daily Tarot API. **커리어·일일 타로** 해석 등 데이터 정확성 보강용. |

MCP 도구는 다음에 활용할 수 있습니다.

- 개발/기획 시 **커리어·일일 타로** 문구 검증 및 참고
- 프롬프트·번역·도움말 문구 작성 시 **정확한 해석** 참고
- 에이전트/자동화에서 Career Daily Tarot API 호출로 **보완 데이터** 수집

## 3. 보안

- **API 키**: `mcp.json`에 실제 키를 넣을 경우 해당 파일을 `.gitignore`에 추가하거나, 예제만 커밋하고 실제 키는 로컬/환경 변수로 관리하세요.
- **예제 파일**: 실제 키 없이 구조만 두려면 `mcp.json.example`을 커밋하고, `mcp.json`은 로컬에서만 생성해 사용할 수 있습니다.

## 4. 참고

- RapidAPI MCP: [RapidAPI Hub - Career Daily Tarot API](https://rapidapi.com) 에서 해당 API 검색 후 구독 및 키 발급
- 앱 내 타로: `backend/src/services/tarot.service.js`, `backend/src/services/tarotcardapiDeck.js`
