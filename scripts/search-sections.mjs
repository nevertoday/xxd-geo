// 构建后处理：把新手入门、完整教程、How-to、Wiki、平台每篇正文按小节（h2/h3）切开，再加上证据表的每个做法、
// 每个工具、每条提示词、每个出处（直接读 src/data/），生成全文搜索数据
// dist/search-sections.json（根路径的语言）和 dist/<语言>/search-sections.json（以后加的语言）。
// 搜索框打开时才加载；结果是「文章 › 小节」，点了跳到那一节（锚点用页面右侧「本页」目录里的同一个）。
// 在 base-links.mjs 之前运行：这里的 href 不带子路径前缀，由页面脚本按 BASE_URL 补。
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, sep } from "node:path";
import { LANGS } from "../src/data/nav.js";
import { TACTICS, LAYERS, VERDICTS } from "../src/data/tactics.js";
import { TOOLS, toolId } from "../src/data/tools.js";
import { PROMPTS } from "../src/data/prompts.js";
import { SOURCES } from "../src/data/sources.js";

const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };
const text = (html) => html
  .replace(/<(script|style|button|svg)[\s\S]*?<\/\1>/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => ENT[e] ?? (e[0] === "#" ? String.fromCodePoint(e[1] === "x" ? parseInt(e.slice(2), 16) : +e.slice(1)) : m))
  .replace(/\s+/g, " ").trim();
const KIND = { zh: { start: "新手入门", guide: "完整教程", howto: "How-to", wiki: "Wiki", platforms: "平台", section: "小节" }, en: { start: "Beginner track", guide: "Full guide", howto: "How-to", wiki: "Wiki", platforms: "Platforms", section: "Section" } };
const out = Object.fromEntries(LANGS.map((l) => [l.code, []]));
const PREFIX = LANGS.length > 1 ? new RegExp(`^/(${LANGS.slice(1).map((l) => l.code).join("|")})/`) : /^$/;
for (const file of walk("dist").filter((f) => f.endsWith("index.html"))) {
  const path = "/" + file.slice("dist/".length).split(sep).join("/").replace(/index\.html$/, "");
  const lang = path.match(PREFIX)?.[1] ?? "zh";
  const rel = lang === "zh" ? path : path.slice(lang.length + 1);
  const kind = rel.split("/")[1];
  if (!["start", "guide", "howto", "wiki", "platforms"].includes(kind) || rel === `/${kind}/`) continue;
  const html = readFileSync(file, "utf8");
  const art = html.match(/<article class="xxd-prose[^"]*"[^>]*>([\s\S]*?)<\/article>/)?.[1];
  if (!art) continue;
  const title = text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");
  // 「本页」目录：标题文字 → 锚点
  const toc = new Map();
  for (const [, slug, t] of html.matchAll(/<a[^>]+href="#([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) if (slug !== "main") toc.set(text(t), decodeURIComponent(slug));
  const parts = art.split(/(?=<h[23][\s>])/);
  for (const part of parts) {
    const h = part.match(/^<h[23][^>]*>([\s\S]*?)<\/h[23]>/);
    if (!h) continue;
    const heading = text(h[1]);
    const body = text(part.slice(h[0].length)).slice(0, 600);
    const slug = h[0].match(/^<h[23][^>]*\sid="([^"]+)"/)?.[1] ?? toc.get(heading);
    const K = KIND[lang];
    out[lang].push({ label: `${title} › ${heading}`, hint: `${K[kind]} · ${K.section}`, keywords: body, href: path + (slug ? "#" + slug : "") });
  }
}
// 数据条目：只有中文（以后加语言时，按 t() 取对应字段）
out.zh.push(
  ...TACTICS.map((x) => ({ label: x.title, hint: `证据表 · ${LAYERS[x.layer].title} · ${VERDICTS[x.verdict].label}`, keywords: x.why, href: `/evidence/#${x.id}` })),
  ...TOOLS.map((x) => ({ label: x.name, hint: `工具 · ${x.kind}`, keywords: `${x.measures} ${x.fit}`, href: `/tools/#${toolId(x.name)}` })),
  ...PROMPTS.map((x) => ({ label: x.title, hint: "提示词库", keywords: `${x.use} ${x.prompt}`, href: `/prompts/#${x.id}` })),
  ...Object.entries(SOURCES).map(([id, x]) => ({ label: x.title, hint: `出处 · ${x.grade} · ${x.publisher}`, keywords: x.note, href: `/sources/#${id}` })),
);
for (const [code, list] of Object.entries(out)) writeFileSync(code === "zh" ? "dist/search-sections.json" : `dist/${code}/search-sections.json`, JSON.stringify(list));
console.log(`✓ 全文搜索：${Object.entries(out).map(([c, l]) => `${c} ${l.length}`).join("，")} 条`);
