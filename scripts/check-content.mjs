// 构建后检查（npm run build 的一步，在 base-links.mjs 之前）：出处、数据字段、导航、站内链接。
// 有错误就列出来并以退出码 1 结束；从没被引用的出处、还没替换的示例数据只提醒，不算失败。
// 单独跑：node scripts/check-content.mjs（要先有 dist/）
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { LESSONS, STEPS, HOWTO_FLAT } from "../src/data/nav.js";
import { SOURCES, GRADES, KINDS, bestGrade, canon } from "../src/data/sources.js";
import { TACTICS, LAYERS, VERDICTS, EFFORTS } from "../src/data/tactics.js";
import { PLATFORMS, REGIONS, PURPOSES } from "../src/data/platforms.js";
import { TOOLS, TOOL_KINDS } from "../src/data/tools.js";
import { PROMPTS } from "../src/data/prompts.js";

const errors = [];
const warnings = [];
const bad = (where, msg) => errors.push(`${where}：${msg}`);
const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
const names = (set) => (Array.isArray(set) ? set : Object.keys(set));
const allowed = (set, v) => names(set).includes(v);

for (const [id, s] of Object.entries(SOURCES)) {
  const where = `sources.js「${id}」`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) bad(where, "id 只用小写字母、数字和连字符");
  if (!allowed(GRADES, s.grade)) bad(where, `grade「${s.grade}」不是 ${names(GRADES).join(" / ")}`);
  if (!allowed(KINDS, s.kind)) bad(where, `kind「${s.kind}」不是 ${KINDS.join(" / ")}`);
  if (s.date && !/^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/.test(s.date)) bad(where, `date「${s.date}」要写成 YYYY、YYYY-MM 或 YYYY-MM-DD`);
  if (s.url ? !/^https?:\/\/\S+$/.test(s.url) : !s.where) bad(where, `url「${s.url}」要以 http(s):// 开头；没有链接就写 where`);
  if (!s.title || !s.publisher || !s.note) bad(where, "title、publisher、note 都要写");
}

const cited = new Set();
const cite = (where, ids = []) => {
  for (const raw of ids) {
    const id = canon(raw);
    cited.add(id);
    if (!SOURCES[id]) bad(where, `出处「${id}」不在 sources.js 里`);
  }
};
for (const f of walk("src/pages").filter((f) => f.endsWith(".mdx"))) {
  for (const m of readFileSync(f, "utf8").matchAll(/<Src\s+ids=["']([^"']*)["']/g)) cite(f, m[1].trim().split(/\s+/).filter(Boolean));
}

// 每个数据文件：哪些字段只能取哪些值
const DATA = [
  ["tactics.js", TACTICS, (x) => x.id, { layer: LAYERS, verdict: VERDICTS, effort: EFFORTS }],
  ["platforms.js", PLATFORMS, (x) => x.slug, { region: REGIONS }],
  ["tools.js", TOOLS, (x) => x.name, { kind: TOOL_KINDS }],
  ["prompts.js", PROMPTS, (x) => x.id, {}],
];
const steps = new Set(STEPS.map((s) => s.n));
const howtos = new Set(HOWTO_FLAT.map((h) => h.slug));
let samples = Object.values(SOURCES).filter((s) => s.sample).length;
for (const [file, list, key, enums] of DATA) {
  const seen = new Set();
  for (const x of list) {
    const where = `${file}「${key(x)}」`;
    if (seen.has(key(x))) bad(where, "重复了");
    seen.add(key(x));
    for (const [field, set] of Object.entries(enums)) if (!allowed(set, x[field])) bad(where, `${field}「${x[field]}」不是 ${names(set).join(" / ")}`);
    for (const c of x.crawlers ?? []) if (!allowed(PURPOSES, c.purpose)) bad(where, `爬虫 ${c.ua} 的 purpose「${c.purpose}」不是 ${names(PURPOSES).join(" / ")}`);
    if (x.step !== undefined && !steps.has(x.step)) bad(where, `step ${x.step} 不在 STEPS 里`);
    if (x.howto !== undefined && !howtos.has(x.howto)) bad(where, `howto「${x.howto}」不在 HOWTO 里`);
    cite(where, x.sources);
    if (x.verdict === "must" && !["A", "B"].includes(bestGrade(x.sources))) bad(where, "「必做」至少要有一条 A 或 B 级出处");
    if (x.sample) samples++;
  }
}

for (const id of Object.keys(SOURCES)) if (!cited.has(id)) warnings.push(`出处「${id}」还没有被任何页面或数据引用`);
if (samples) warnings.push(`还有 ${samples} 条示例数据（sample: true）没替换`);

for (const [dir, list] of [["start", LESSONS], ["guide", STEPS], ["howto", HOWTO_FLAT]]) {
  for (const x of list) {
    const f = `src/pages/${dir}/${x.slug}.mdx`;
    if (x.ready && !existsSync(f)) bad("nav.js", `${dir}/${x.slug} 标了 ready: true，但没有 ${f}`);
    if (!x.ready && existsSync(f)) warnings.push(`${f} 已经有了，nav.js 里还是 ready: false`);
  }
}

// 站内链接：dist 里每个 href="/…" 都要指向一个构建出来的文件（# 和 ? 后面的不管）
if (!existsSync("dist")) bad("dist", "没有 dist/，先跑 astro build");
else {
  const base = (process.env.BASE_PATH || "/").replace(/\/$/, "");
  const broken = new Map();
  for (const f of walk("dist").filter((f) => f.endsWith(".html"))) {
    for (const [, raw] of readFileSync(f, "utf8").matchAll(/\shref="([^"]*)"/g)) {
      let h = raw.replace(/&amp;/g, "&");
      if (!h.startsWith("/") || h.startsWith("//")) continue;
      h = h.replace(/[?#].*$/, "");
      const p = decodeURIComponent(base && h.startsWith(base + "/") ? h.slice(base.length) : h);
      const target = join("dist", p);
      const ok = p.endsWith("/") ? existsSync(join(target, "index.html")) : existsSync(target) || existsSync(join(target, "index.html"));
      if (!ok && !broken.has(h)) broken.set(h, relative("dist", f));
    }
  }
  for (const [h, f] of broken) bad(`dist/${f}`, `站内链接 ${h} 指向的页面不存在`);
}

for (const w of warnings) console.warn(`⚠ ${w}`);
for (const e of errors) console.error(`✗ ${e}`);
if (errors.length) {
  console.error(`✗ 内容检查没通过：${errors.length} 个错误`);
  process.exit(1);
}
console.log(`✓ 内容检查：${Object.keys(SOURCES).length} 条出处（${Object.keys(SOURCES).filter((id) => cited.has(id)).length} 条被引用）、${TACTICS.length} 个做法、${PLATFORMS.length} 个平台、${TOOLS.length} 个工具、${PROMPTS.length} 条提示词，站内链接都通`);
