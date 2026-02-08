# Dev Agent Kit 연동 가이드

이 프로젝트는 [dev-agent-kit](https://github.com/saewookkangboy/dev-agent-kit)과 연동하여 **사양 관리(Spec-kit)**, **To-do 관리**, **Agent Roles**, **SEO/GEO/AIO 최적화** 워크플로를 사용할 수 있습니다.

## Cursor 서브에이전트

프로젝트에 다음 서브에이전트가 정의되어 있습니다(`.cursor/agents/`).

| 서브에이전트 | 용도 |
|-------------|------|
| **Dev Agent Kit** | Spec-kit, To-do, Agent Roles, SEO/AI SEO/GEO/AIO, API 키 관리 등 통합 워크플로 |
| **Spec & To-do** | 사양 문서 작성·갱신, To-do/마일스톤 목록 관리에 특화 |

에이전트가 복잡한 사양 정리·작업 목록·웹 최적화 분석이 필요할 때 위 서브에이전트를 자동으로 활용할 수 있습니다.

## CLI 설치 (선택)

dev-agent-kit CLI를 로컬에서 쓰려면:

```bash
# 프로젝트 루트에서
npm install --save-dev github:saewookkangboy/dev-agent-kit

# 전역 설치 (선택)
npm install -g github:saewookkangboy/dev-agent-kit
```

설치 후 `npx dev-agent` 또는 `dev-agent` 명령으로 다음을 사용할 수 있습니다.

- `dev-agent init` — 프로젝트 초기화
- `dev-agent todo add/list/complete` — To-do 관리
- `dev-agent spec create/list/validate` — 사양 문서
- `dev-agent role set --role frontend|backend|pm|...` — 역할 설정
- `dev-agent seo analyze`, `dev-agent ai-seo keywords`, `dev-agent geo analyze`, `dev-agent aio analyze` — 웹 최적화

## Cursor 규칙

`.cursor/rules/dev-agent-kit.mdc`에서 dev-agent-kit 워크플로와 서브에이전트 위임 가이드를 확인할 수 있습니다. 주로 `**/*.md`, `**/*.json` 등 문서/설정 파일 작업 시 적용됩니다.

## 참고

- dev-agent-kit 공식 문서: [README.ko.md](https://github.com/saewookkangboy/dev-agent-kit/blob/main/README.ko.md)
- 통합 가이드: [INTEGRATION_GUIDE.md](https://github.com/saewookkangboy/dev-agent-kit/blob/main/docs/INTEGRATION_GUIDE.md)
