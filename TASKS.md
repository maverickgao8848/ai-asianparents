# AI 严父 – Task Backlog (Phase 1.5)

> Format: Feature Module → User Story → Task (status: todo/in-progress/done)

## 1. Rule Intake & Policy Engine
- **T1** (done) – Story: "作为用户，我想用自然语言添加规则以限制特定应用" → Task: Design Supabase schema (`rules`, `rule_exceptions`) and migrations.
- **T2** (done) – Story: "作为用户，我需要验证AI解析的规则是否准确" → Task: Edge Function spec for natural language to JSON parsing, including validation test plan.
- **T13** (done) – Story: "作为用户，我想让AI迅速解析我的自然语言规则" → Task: Implement `parse-rule` Edge Function with heuristics + tests.

## 2. 严父拦截对话
- **T3** (done) – Story: "作为破戒用户，我需要严父质询我再决定是否解锁" → Task: Define interception flow diagram + prompt templates per persona.
- **T4** (done) – Story: "作为移动端开发者，我要集成拦截对话界面" → Task: Create Expo screen/component checklist and state management plan.
- **T17** (done) – Story: "作为移动端用户，我需要看到严父拦截对话界面" → Task: Implement InterceptDialogScreen and supporting components with stub data.
- **T19** (done) – Story: "作为系统，我要在拦截时给出AI评估" → Task: Implement `intercept-session` Edge Function (LLM placeholder + logging updates).
- **T20** (done) – Story: "作为移动端用户，我希望与拦截AI实时交互" → Task: Connect mobile interception flow to `intercept-session` Edge Function (API client + state updates).
- **T23** (done) – Story: "作为移动端用户，我想用自然语言创建规则" → Task: Add rule creation screen calling `parse-rule` + Supabase persistence.
- **T22** (done) – Story: "作为系统，我要记录最终解锁决策" → Task: Implement decision logging Edge Function + mobile integration.

## 3. 记录与标签
- **T5** (done) – Story: "作为系统，我需要记录每次破戒的细节便于复盘" → Task: Design Supabase tables (`interceptions`, `override_reasons`) + retention policy.
- **T6** (done) – Story: "作为分析模块，我想给借口打标签" → Task: Define classification taxonomy + lightweight model selection (rules vs. LLM tagging).

## 4. 周报与提醒
- **T7** (done) – Story: "作为用户，我要每周收到总结报告" → Task: Plan scheduled Edge Function workflow and report template.
- **T8** (done) – Story: "作为用户，我希望通过推送/邮件收到提醒" → Task: Notification strategy (Expo Push + Resend), include failure handling.
- **T14** (done) – Story: "作为用户，我希望周末收到总结提醒" → Task: Implement `generate-weekly-report` Edge Function with aggregation + tests.
- **T15** (done) – Story: "作为用户，我希望及时收到通知提醒" → Task: Implement `dispatch-notifications` Edge Function with provider adapters + retries.
- **T18** (done) – Story: "作为用户，我想周报内容真实可信" → Task: Replace weekly report placeholder with real Supabase aggregation & persistence.
- **T21** (done) – Story: "作为运营，我希望周报和通知自动执行" → Task: Configure Supabase cron jobs for weekly reports & notification dispatch.

## 5. 人格与语气
- **T9** (done) – Story: "作为用户，我想选择不同的严父人格" → Task: Draft persona config file structure + content guidelines with brand voice alignment.

## 6. 紧急解锁
- **T10** (done) – Story: "作为用户，我需要紧急情况下临时解锁" → Task: Emergency override flow requirements + rate limit rules.
- **T16** (done) – Story: "作为系统，我要安全地处理紧急解锁" → Task: Implement `emergency-override` Edge Function with cooldown + logging.

## 7. 平台支撑
- **T11** (done) – Story: "作为开发者，我需要统一的开发环境" → Task: Set up monorepo scaffold (pnpm workspace, Expo, Next.js, Supabase CLI) and automation scripts.
- **T12** (done) – Story: "作为团队，我需要测试体系保证质量" → Task: Testing strategy checkbox (unit, integration, E2E) mapped to pipelines.

## Workflow Notes
- Update status to `in-progress` when actively working a task, `done` after merge + tests.
- Link PRs/issues next to corresponding task IDs in future updates.
