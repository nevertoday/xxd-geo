// 本站自己的 GEO：页面的真实更新日期，和每页的 JSON-LD。照 /howto/astro/ 那一页的写法。
import { execFileSync } from "node:child_process";
import { NAME, TAGLINE, SITE, REPO } from "../data/nav.js";

/** 文件在 git 里最后一次提交的日期（YYYY-MM-DD）。还没提交的文件用今天。 */
export function updatedOf(file) {
  try {
    const d = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], { encoding: "utf8" }).trim();
    if (d) return d;
  } catch {}
  return new Date().toISOString().slice(0, 10);
}

const publisher = { "@type": "Organization", name: "小小东", url: "https://github.com/nevertoday" };

/** 首页：网站本身 */
export const websiteLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: NAME,
  description: TAGLINE,
  url: SITE,
  inLanguage: "zh-CN",
  publisher,
  sameAs: [REPO],
});

/** 教程页：标题和一句话都是页面上看得见的，日期也显示在标题下面 */
export const articleLd = ({ title, tldr, url, updated }) => ({
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: title,
  ...(tldr ? { description: tldr } : {}),
  url,
  dateModified: updated,
  inLanguage: "zh-CN",
  author: publisher,
  publisher,
  isPartOf: { "@type": "WebSite", name: NAME, url: SITE },
});
