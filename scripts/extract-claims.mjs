// 把正文里每个带 <Src> 的句子和它引用的出处导成 TSV，给抽查用：这句话说的，出处里真有吗？
// 用法：node scripts/extract-claims.mjs > claims.tsv
//      node scripts/extract-claims.mjs --sample 60 --seed 7 > sample.tsv   （按种子随机抽，可复现）
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sourceOf, canon } from "../src/data/sources.js";

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? Number(args[i + 1]) : undefined; };
const sample = opt("--sample");
let seed = opt("--seed") ?? 1;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

const pages = ["start", "guide", "howto"].flatMap((d) => readdirSync(join("src/pages", d)).filter((f) => f.endsWith(".mdx")).map((f) => join("src/pages", d, f)));
const claims = [];
for (const f of pages) {
  const body = readFileSync(f, "utf8").replace(/^---[\s\S]*?\n---\n/, "").replace(/^```[\s\S]*?^```$/gm, "");
  for (const m of body.matchAll(/([^。！？\n]*?)\s*<Src ids="([^"]+)"\s*\/>/g)) {
    const text = m[1].replace(/<[^>]+>|\*\*|`/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").trim();
    if (!text) continue;
    const ids = m[2].trim().split(/\s+/);
    claims.push({ page: f, text, ids });
  }
}
let out = claims;
if (sample) {
  out = [...claims].map((c) => [rand(), c]).sort((a, b) => a[0] - b[0]).slice(0, sample).map(([, c]) => c);
}
const clean = (s = "") => String(s).replace(/[\t\n]/g, " ");
console.log(["page", "claim", "ids", "source_title", "source_note", "source_url"].join("\t"));
for (const c of out) {
  const srcs = c.ids.map((id) => ({ id: canon(id), s: sourceOf(id) }));
  console.log([c.page, c.text, srcs.map((x) => x.id).join(" "), srcs.map((x) => x.s?.title).join(" | "), srcs.map((x) => x.s?.note).join(" | "), srcs.map((x) => x.s?.url).join(" ")].map(clean).join("\t"));
}
console.error(`${claims.length} 条带出处的句子${sample ? `，抽了 ${out.length} 条` : ""}`);
