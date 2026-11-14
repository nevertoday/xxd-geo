# 08 补充出处：第 8 步「用 AI 做 GEO」

只收第 8 步正文和 geo-audit 技能用到、而调研稿 01 到 06 没有的出处。2026-11-14 打开原文核实。

## 出处表

| 编号 | 标题 | 发布方 | 日期 | 链接 | 类型 | 证据等级 | 一句话要点 |
|---|---|---|---|---|---|---|---|
| S1 | Extend Claude with skills | Anthropic（Claude Code Docs） | 2026-11 访问 | https://code.claude.com/docs/en/skills | 官方文档 | A | 个人技能放 ~/.claude/skills/<name>/SKILL.md，项目技能放 .claude/skills/；用 /技能名 调用 |
| S2 | Build skills | OpenAI（Codex Docs） | 2026-11 访问 | https://learn.chatgpt.com/docs/build-skills | 官方文档 | A | Codex 读 $HOME/.agents/skills 和仓库里的 .agents/skills；SKILL.md 必须有 name 和 description；用 $技能名 调用 |
| S3 | Agent Skills | Cursor Docs | 2026-11 访问 | https://cursor.com/docs/context/skills | 官方文档 | A | Cursor 读 .cursor/skills、~/.cursor/skills，兼容 .claude/skills 和 .agents/skills；name 要和文件夹名一致 |
