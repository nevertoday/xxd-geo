// sitemap 的 lastmod：每个 MDX 页面用它在 git 里最后一次提交的日期，不用构建时间（见 /howto/astro/ 第 2 节）。
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { updatedOf } from "../src/lib/seo.js";

export function lastmodMap(site, base = "/", dir = "src/pages") {
  const map = new Map();
  for (const file of readdirSync(dir, { recursive: true })) {
    if (!/\.mdx$/.test(file)) continue;
    const slug = file.replace(/\\/g, "/").replace(/(\/index)?\.mdx$/, "");
    map.set(new URL(`${base.replace(/\/?$/, "/")}${slug}/`, site).href, updatedOf(join(dir, file)));
  }
  return map;
}
