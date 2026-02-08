# Dev Agent Kit 연동 가이드

이 프로젝트는 [dev-agent-kit](https://github.com/saewookkangboy/dev-agent-kit)과 연동하여 **사양 관리(Spec-kit)**, **To-do 관리**, **Agent Roles**, **SEO/GEO/AIO 최적화** 워크플로를 사용할 수 있습니다.

## 에이전트 팀 오케스트레이션

**서비스 최적화·전체 개선**은 **Orchestrator(팀 리드)** 가 역할을 배정하고 팀을 조율합니다. 팀 구성·위임 규칙은 [AGENT_ORCHESTRATION.md](./AGENT_ORCHESTRATION.md)를 참고하세요.

## Cursor 에이전트

프로젝트에 다음 에이전트가 정의되어 있습니다(`.cursor/agents/`).

| 에이전트 | 용도 |
|----------|------|
| **Orchestrator** | 팀 리드. 서비스 최적화·전체 개선 시 역할 분해·배정·종합, 서브에이전트 조율 |
| **Dev Agent Kit** | Spec-kit, To-do, Agent Roles, SEO/AI SEO/GEO/AIO, API 키 관리 등 통합 워크플로 |
| **Spec & To-do** | 사양 문서 작성·갱신, To-do/마일스톤 목록 관리에 특화 |

넓은 범위 요청(서비스 최적화, agent team 등) 시 Orchestrator를 사용하고, 사양·To-do·SEO 등 특정 작업은 해당 서브에이전트를 직접 활용할 수 있습니다.

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
