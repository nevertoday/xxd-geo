# 27 补充出处：国内平台和微信小程序这一组页面（2026-11-14）

写「国内 AI 平台怎么做」和「微信小程序」两页时补查的出处。07 稿已有的不重复收。每条都在 2026-11-14 打开原文核实。

## 出处表

| 编号 | 标题 | 发布方 | 日期 | 链接 | 类型 | 证据等级 | 一句话要点 |
|---|---|---|---|---|---|---|---|
| S1 | 小程序 AI 开发模式 接入方式 | 微信开放文档 | 2026（抓取于 2026-11-14） | https://developers.weixin.qq.com/miniprogram/dev/ai/integration.html | 官方文档（已读 Markdown 版原文） | A | app.json 的 agent.skills 声明 SKILL；SKILL 放独立分包并开 lazyCodeLoading；目录含 SKILL.md（最大 16000 字节）、index.js、mcp.json（最大 24000 字节）；最多 30 个 SKILL；原子接口返回 content、structuredContent，用 wx.modelContext.registerAPI 注册 |
