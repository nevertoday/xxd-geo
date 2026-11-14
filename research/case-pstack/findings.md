# pstack.xiaoxiaodong.ai 实测记录（2026-11-14T13:35:37Z，用 curl 换 User-Agent 测）

- robots.txt 返回 200，只有 Cloudflare 自动加的 content signals 注释，24 行，一条 User-agent / Disallow / Sitemap 指令都没有。仓库里没有 public/robots.txt，说明这是 Cloudflare 托管 robots.txt 加上去的。
- /sitemap.xml、/sitemap-index.xml、/llms.txt 都是 404。
- 用 /guide/0-what/ 测各家爬虫：
  - 403：GPTBot、ClaudeBot、PerplexityBot、Bytespider
  - 200：OAI-SearchBot、ChatGPT-User、Claude-SearchBot、Perplexity-User、Googlebot、bingbot、Baiduspider、curl
  - PerplexityBot 是 Perplexity 的搜索索引爬虫，不是训练爬虫，它也被挡了。推测是 Cloudflare 的 AI 爬虫拦截规则（Block AI bots / AI Crawl Control），要在后台核实。
- 首页 HTML 58 KB，是服务端直接给出的静态内容（Astro 构建），不靠 JS 渲染。
- 首页没有 JSON-LD（0 个 application/ld+json），没有 canonical 标签。有 title、description、og:title、og:description、og:url、og:image。
- 首页只有 1 个 h2。
