# 17 补充出处：第 7 步「量出效果」这一组页面（2026-11-14）

写「量出效果」和四篇测量 How-to 时补的实测。调研稿 05 没查清国内 AI 产品的网页版域名，这里用 curl 实测了一次。

## 国内 AI 网页版：域名和 referrer 策略

2026-11-14 用 curl（桌面 Chrome 的 UA，跟随跳转）请求各家首页，记下最终落到的域名、HTTP 头里的 `Referrer-Policy`、HTML 里的 `<meta name="referrer">`。

| 请求的地址 | 最终域名 | 首页声明的 referrer 策略 |
|---|---|---|
| https://www.doubao.com/ | www.doubao.com（跳到 /chat/） | 没声明（浏览器默认只发域名） |
| https://kimi.moonshot.cn/ | www.kimi.com | 没声明 |
| https://yuanbao.tencent.com/ | yuanbao.tencent.com | 没声明 |
| https://chat.deepseek.com/ | chat.deepseek.com | 没声明 |
| https://tongyi.aliyun.com/ | qianwen.aliyun.com | `no-referrer-when-downgrade` |
| https://www.tongyi.com/ | www.qianwen.com | 没声明 |
| https://metaso.cn/ | metaso.cn | `no-referrer`（不发） |
| https://chatglm.cn/ | chatglm.cn | `no-referrer`（不发） |
| https://yiyan.baidu.com/ | wenxin.baidu.com | `origin-when-cross-origin` |

局限：只看了首页。对话页的策略、链接上的 `rel="noreferrer"`、手机 App 的行为都没看到。所以这张表只能说明「网页版在哪个域名」，点出去的链接到底带不带 referrer，要在自己的统计里核实。

命令：

```bash
for u in https://www.doubao.com/ https://kimi.moonshot.cn/ https://metaso.cn/; do
  curl -s -L -A "Mozilla/5.0 (Macintosh) Chrome/130" -D - -o page.html -w '%{url_effective}\n' "$u" | grep -i -E '^referrer-policy|^https'
  grep -oi '<meta[^>]*referrer[^>]*>' page.html
done
```

## 自建追踪器的假数据测试

`research/tracker/geo-track.mjs` 是 /howto/diy-tracker/ 页面上的脚本（页面直接读这个文件，逐字一致）。`research/tracker/geo-track.test.mjs` 用按 OpenAI、Anthropic、Gemini、Perplexity 2026-11-14 文档格式伪造的响应跑一遍：入库、一次 429 记成错误、按周按引擎算提及率、中文别名、自己域名的引用率。`node --test research/tracker/` 在 Node 26.13 上 4 项全过。没有用真实 API Key 调用过。

## 出处表

| 编号 | 标题 | 发布方 | 日期 | 链接 | 类型 | 证据等级 | 一句话要点 |
|---|---|---|---|---|---|---|---|
| S1 | 国内 AI 网页版的域名和 referrer 策略（curl 请求首页） | 本手册 | 2026-11-14 | 无（research/17-measure-extra.md，命令在同一文件） | 小规模实测 | C | 豆包 www.doubao.com、Kimi www.kimi.com、元宝 yuanbao.tencent.com、DeepSeek chat.deepseek.com、千问 www.qianwen.com 和 qianwen.aliyun.com、文心 wenxin.baidu.com；秘塔和智谱清言首页声明 no-referrer；只看了首页 |
| S2 | 自建追踪器 geo-track.mjs 的假数据测试 | 本手册 | 2026-11-14 | 无（research/tracker/geo-track.test.mjs） | 小规模实测 | C | 按四家文档格式伪造响应，入库、错误记录、按周按引擎的提及率和引用率都对；没有用真实 Key 调用 |
