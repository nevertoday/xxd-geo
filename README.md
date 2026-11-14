<div align="center">

# GEO 实战手册

### 问 AI 你的产品名，它认得。问「有什么好用的这类工具」，它推荐了五个，没有你。

这本手册讲怎么让 ChatGPT、Perplexity、Google AI、Copilot、豆包、DeepSeek 搜得到你、读得懂你、愿意提你。<br>写给一个人做很多产品的独立开发者。每条建议都标了出处和证据等级。

<sub>免费 · 开源 · 中文</sub>

</div>

<p align="center">
  <a href="#为什么需要它">为什么</a> ·
  <a href="#这本书哪里不一样">哪里不一样</a> ·
  <a href="#站里有什么">站里有什么</a> ·
  <a href="#geo-audit让-ai-给网站做体检">geo-audit</a> ·
  <a href="#按产品类型照着做">按产品类型</a> ·
  <a href="#本地运行">本地运行</a> ·
  <a href="https://geo.xiaoxiaodong.ai">在线阅读</a>
</p>

> [!NOTE]
> 网站 <https://geo.xiaoxiaodong.ai> 和仓库 <https://github.com/nevertoday/xxd-geo> 都在发布后才能打开。下面的链接和安装命令，到那时就能用。

## 为什么需要它

做独立产品的人，多半遇到过这些：

- 在 ChatGPT 里问你做的那类工具，它推荐了五个，没有你。
- 网上的 GEO 文章一篇比一篇玄。「改写能提升 40%」「加 llms.txt 就会被引用」，不知道哪条是真的。
- 有人报价「保证 AI 推荐前三」，你不知道该不该信。
- 改了 robots.txt、加了结构化数据，不知道 AI 的爬虫到底来没来。

第一条不是你一个人的问题。[一项研究](https://arxiv.org/abs/2601.00912) 测了 112 个 Product Hunt 2025 年的热门产品：直接问名字，ChatGPT 认得 99.4%；问「最好的 AI 工具有哪些」，只提到 3.32%。AI 认得你，不等于会推荐你。

## 这本书哪里不一样

**每条建议后面都标着出处和证据等级。** 有实证的做法和没人验证过的说法分开写。宁可写「这一点还没有可靠数据」，也不写没有出处的结论。

| 等级 | 什么样的资料 | 正文里怎么写 |
|:---|:---|:---|
| **A** | 官方文档、平台声明、同行评审论文 | 直接说 |
| **B** | 大样本数据研究、能复现的实验 | 直接说，写明样本量 |
| **C** | 从业者案例、小规模实测 | 「一次实测发现」 |
| **D** | 观点、推测、营销 | 「有人主张，没有数据支持」 |
| **X** | 已过时或被推翻 | 只在讲「别再信」时出现 |

卖 GEO 工具的公司发的数据照样引用，但会写明「这是卖工具的公司自己的数据」。几份资料说法矛盾时，两边都写，再给你一个自己验证的办法。

几个这样查出来的结论：

- **原始论文的「提升 40%」，前提是页面已经被 AI 搜到了。** 换到更真实的设定，多数改写技巧没有效果，有的还让排名下降。
- **先被搜到，比改写文字重要得多。** 一项研究分析了 15.8 万条 ChatGPT 回答，被引用的每一页都来自它自己的搜索结果。
- **AI 的推荐每次都在变。** [SparkToro 的实验](https://www.searchenginejournal.com/ai-recommendations-change-with-nearly-every-query-sparktoro/566242/) 里，同一个问题重复问，给出同一份品牌清单的概率不到 1%。所以本书不承诺排名，只教你按次数测。
- **AI 带来的访问今天还很小。** 一家 SEO 工具公司统计了 10 万多个网站，2026 年 1 到 4 月 AI 访问占总流量 0.32%，比 2024 年涨了十几倍。

## 站里有什么

- **[新手入门](https://geo.xiaoxiaodong.ai/start/1-why/)**：3 课，一条路走到底 · GEO 是什么 → 20 分钟看 AI 怎么说你 → 第一周做五件事
- **[完整教程](https://geo.xiaoxiaodong.ai/guide/0-how-ai-answers/)**：9 步，按 AI 找答案的顺序 · 爬得到 → 搜得到 → 读得懂 → 愿意引用 → 别人提到你 → 国内平台 → 量出效果 → 用 AI 做下去
- **[How-to](https://geo.xiaoxiaodong.ai/howto/)**：按产品类型、技术配方（robots.txt、JSON-LD、Astro、IndexNow、Cloudflare）、测量和实验，一篇只讲一件事
- **[证据表](https://geo.xiaoxiaodong.ai/evidence/)**：每个做法该不该做，证据有多硬
- **[平台](https://geo.xiaoxiaodong.ai/platforms/)**：各家 AI 用什么搜索、派什么爬虫
- **[提示词库](https://geo.xiaoxiaodong.ai/prompts/)**：让 AI 帮你体检、改写、整理追踪表的现成提示词
- **[出处](https://geo.xiaoxiaodong.ai/sources/)**：全站引用的资料，按证据等级排

每页标题下有一句话，告诉你这页能帮你做成什么。每一步做完都写了「你应该看到什么」，页尾有「卡住了？」。

## geo-audit：让 AI 给网站做体检

仓库里带一个 Agent Skill，`skills/geo-audit/`。它先跑一个脚本收集事实，再让 AI 读页面，写一份中文报告：哪些 AI 爬虫被挡、sitemap 和 Bing 收录缺什么、正文在不在原始 HTML 里、首页有没有说清产品是什么，最后是按优先级排的修复清单。每条修复带证据等级和本书对应的页面。报告不给总分。

先把仓库拿到本地：

```bash
git clone --depth 1 https://github.com/nevertoday/xxd-geo /tmp/xxd-geo
```

再按你用的工具，选一条：

```bash
# Claude Code，所有项目都能用
mkdir -p ~/.claude/skills && cp -r /tmp/xxd-geo/skills/geo-audit ~/.claude/skills/

# Codex
mkdir -p ~/.agents/skills && cp -r /tmp/xxd-geo/skills/geo-audit ~/.agents/skills/

# Cursor（也会读 ~/.claude/skills/，装过 Claude Code 版就不用再装）
mkdir -p ~/.cursor/skills && cp -r /tmp/xxd-geo/skills/geo-audit ~/.cursor/skills/
```

然后让它体检：

- Claude Code：`/geo-audit https://<你的域名>/`
- Codex：`$geo-audit https://<你的域名>/`
- Cursor：在 Agent 里说「用 geo-audit 体检 https://<你的域名>/」

只想要数据，不要报告：

```bash
node skills/geo-audit/scripts/probe.mjs https://<你的域名>/
```

要 Node 18 以上，不用装依赖。脚本只发 GET 请求，一共二十次左右。它从你的电脑假装成爬虫发请求，所以 403 说明网站按名字拦了它；200 不保证真爬虫能进，真实记录要去 CDN 后台看。详见 [skills/geo-audit/README.md](skills/geo-audit/README.md) 和 [让 AI 给网站做 GEO 体检](https://geo.xiaoxiaodong.ai/howto/ai-audit/)。

## 按产品类型照着做

| 你做的是 | 看这篇 | 一句话要点 |
|:---|:---|:---|
| Chrome 插件 | [Chrome 插件](https://geo.xiaoxiaodong.ai/howto/chrome-extension/) | 改好商店页，再补自己的产品页、对比页和社区里的真实讨论 |
| 开源项目 | [开源项目和 GitHub 仓库](https://geo.xiaoxiaodong.ai/howto/open-source/) | README 第一屏说清是什么、给谁、怎么装，再进几个第三方列表 |
| 教程站、内容站 | [教程站和内容站](https://geo.xiaoxiaodong.ai/howto/content-site/) | 按读者会问 AI 的问题排好先后，一个问题写一页 |
| SaaS、会员站 | [SaaS 和会员网站](https://geo.xiaoxiaodong.ai/howto/saas/) | 付费内容各留一个公开介绍页，定价、对比、文档不登录也能读 |
| 微信小程序 | [微信小程序](https://geo.xiaoxiaodong.ai/howto/mini-program/) | 编写中 |
| 提示词、Skill 合集 | [提示词和 Skill 合集](https://geo.xiaoxiaodong.ai/howto/prompt-collection/) | 每条一个固定网址，写清用途、给例子、标日期 |

还有一个完整案例：[pstack 教程站做 GEO](https://geo.xiaoxiaodong.ai/howto/case-pstack/)，从体检发现了什么，到按什么顺序修、怎么量修前修后。

## 本地运行

```bash
npm install
npm run dev        # http://localhost:4430
npm run build      # 输出到 dist/，最后检查出处和站内链接
npm run release    # 构建并部署到 Cloudflare
```

```text
src/data/nav.js        站点结构：新手入门、完整教程、How-to、栏目、术语（唯一来源）
src/data/tactics.js    证据表：每个做法、结论和出处
src/data/platforms.js  各家 AI 平台的数据
src/data/prompts.js    提示词库
src/pages/start/       新手入门三课（MDX）
src/pages/guide/       完整教程（MDX）
src/pages/howto/       How-to（MDX）
research/              调研稿，末尾的出处表导成 src/data/sources.gen.js
skills/geo-audit/      体检技能和脚本
public/xxd/            小小东 UI Kit（自带一份，不走 CDN）
```

`npm run build` 最后一步会检查：正文引用的出处 id 存不存在，标了「必做」的做法有没有 A 或 B 级出处，站内链接有没有断。改内容、加页面、写作规矩见 [MAINTAINING.md](MAINTAINING.md)。

发现哪里没写清楚、照做不成、和你的实测对不上，欢迎提 Issue。

## License

文字和站点代码采用 [MIT](LICENSE)。`public/xxd/` 里的小小东 UI Kit 构建产物不在此列，适用它自己的 [LICENSE](public/xxd/LICENSE)（非商用免费，商用需授权）。

Copyright (c) 2026 小小东 Xiaoxiaodong
