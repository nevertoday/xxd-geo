// 把 research/NN-*.md 末尾的出处表导成 src/data/sources.gen.js。可以反复跑，结果只取决于调研稿。
// id 是「稿子编号-s 编号」，比如 02-s1（正文里写 02-S1 也认）。几份稿子引用同一个链接时，只保留第一次出现的那条，其他编号进 ALIAS，正文里照样能用。
// 用法：node scripts/import-sources.mjs
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const DIR = new URL("../research/", import.meta.url);
const OUT = new URL("../src/data/sources.gen.js", import.meta.url);

const KIND_RULES = [
  [/媒体|新闻|报道|播客|二手|转述/, "报道"],
  [/论文|预印本|综述/, "论文"],
  [/官方|平台|协议|更新日志|规则|标准/, "官方文档"],
  [/案例|实测|实验|自述/, "案例"],
  [/研究|数据|测试|报告|调查/, "数据研究"],
];
const kindOf = (s) => KIND_RULES.find(([re]) => re.test(s))?.[1] ?? "观点";
const seenOf = (s) => (/已读原文/.test(s) ? "原文" : /摘要|搜索结果|未打开|据搜索/.test(s) ? "摘要" : undefined);
const dateOf = (s) => s.match(/\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?(?!\d)|\d{4}/)?.[0] ?? "";
const urlOf = (s) => s.match(/https?:\/\/[^\s|)）]+/)?.[0]?.replace(/[，。；,;]+$/, "") ?? "";
const normUrl = (u) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();
const cell = (s) => s.trim().replace(/\\\|/g, "|");

const sources = {};
const alias = {};
const byUrl = new Map();
const problems = [];

for (const file of readdirSync(DIR).filter((f) => /^\d\d-.*\.md$/.test(f)).sort()) {
  const doc = file.slice(0, 2);
  const lines = readFileSync(new URL(file, DIR), "utf8").split("\n");
  const head = lines.findIndex((l) => /^\|\s*编号\s*\|/.test(l));
  if (head < 0) { problems.push(`${file}: 没找到出处表`); continue; }
  for (const line of lines.slice(head + 2)) {
    if (!/^\|\s*S\d+\s*\|/.test(line)) continue;
    const c = line.replace(/\\\|/g, "\u0000").split("|").slice(1, -1).map((x) => cell(x.replace(/\u0000/g, "|")));
    if (c.length < 8) { problems.push(`${file}: 列数不对 ${line.slice(0, 60)}`); continue; }
    const [sid, title, publisher, dateCell, linkCell, typeCell, gradeCell, note] = c;
    const id = `${doc}-${sid}`.toLowerCase();
    const url = urlOf(linkCell);
    const key = url ? normUrl(url) : null;
    if (key && byUrl.has(key)) { alias[id] = byUrl.get(key); continue; }
    const grade = gradeCell.match(/^[ABCDX]/)?.[0];
    if (!grade) problems.push(`${id}: 证据等级「${gradeCell}」看不懂`);
    const s = { title, publisher, date: dateOf(dateCell), url, kind: kindOf(typeCell), grade: grade ?? "D", note };
    const seen = seenOf(typeCell + linkCell + dateCell);
    if (seen) s.seen = seen;
    if (/利益相关/.test(gradeCell + typeCell + publisher + note)) s.conflict = true;
    if (!url) s.where = linkCell;
    sources[id] = s;
    if (key) byUrl.set(key, id);
  }
}

const body = `// 由 scripts/import-sources.mjs 从 research/ 的出处表生成，不要手改。改调研稿后重跑脚本。
export const GENERATED = ${JSON.stringify(sources, null, 1)};
/** 几份稿子引用同一个链接时，后出现的编号指向第一次出现的那条 */
export const ALIAS = ${JSON.stringify(alias, null, 1)};
`;
writeFileSync(OUT, body);
console.log(`✓ ${Object.keys(sources).length} 条出处，${Object.keys(alias).length} 个重复编号并到别名`);
for (const p of problems) console.log(`⚠ ${p}`);
