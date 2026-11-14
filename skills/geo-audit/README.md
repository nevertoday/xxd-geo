# geo-audit

给你的产品网站做一次 GEO 体检的 Agent Skill。它跑 `scripts/probe.mjs` 拿数据，再读页面，写一份中文报告：哪些 AI 爬虫被挡、sitemap 和 Bing 收录缺什么、正文在不在原始 HTML 里、首页有没有说清产品是什么、结构化数据，以及按优先级排的修复清单。每条修复带证据等级和《GEO 实战手册》的对应页面。

说明文档：https://geo.xiaoxiaodong.ai/howto/ai-audit/

## 安装

先把仓库拿到本地：

```bash
git clone --depth 1 https://github.com/nevertoday/xxd-geo /tmp/xxd-geo
```

**Claude Code**，所有项目都能用：

```bash
mkdir -p ~/.claude/skills && cp -r /tmp/xxd-geo/skills/geo-audit ~/.claude/skills/
```

只给某个项目用，在项目根目录：

```bash
mkdir -p .claude/skills && cp -r /tmp/xxd-geo/skills/geo-audit .claude/skills/
```

**Codex**：

```bash
mkdir -p ~/.agents/skills && cp -r /tmp/xxd-geo/skills/geo-audit ~/.agents/skills/
```

项目级放在仓库里的 `.agents/skills/`。

**Cursor**：

```bash
mkdir -p ~/.cursor/skills && cp -r /tmp/xxd-geo/skills/geo-audit ~/.cursor/skills/
```

项目级放在 `.cursor/skills/`。Cursor 也会读 `~/.claude/skills/` 和 `~/.agents/skills/`，装过 Claude Code 版的就不用再装。

## 用法

- Claude Code：输入 `/geo-audit https://<你的域名>/`
- Codex：输入 `$geo-audit https://<你的域名>/`
- Cursor：在 Agent 里说「用 geo-audit 体检 https://<你的域名>/」

只想要数据，不要报告：

```bash
node skills/geo-audit/scripts/probe.mjs https://<你的域名>/
```

要求 Node 18 或更高版本，不用装依赖。脚本只发 GET 请求：robots.txt、sitemap、llms.txt 各一次，目标页面按每个 User-Agent 各一次，一共二十次左右。

## 测哪些爬虫

名单在 `scripts/probe.mjs` 开头的 `AGENTS` 数组里，改这一处就行。Google-Extended 只是 robots.txt 里的标记，不会真的来抓页面，所以只查规则，不发请求。

## 局限

脚本从你的电脑伪造 User-Agent 发请求。403 说明网站有按 UA 拦截的规则；200 不保证真爬虫能进，因为 Cloudflare 这类 CDN 还会核对 IP。真实记录要去 CDN 后台看。
