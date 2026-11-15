// 本站的 robots.txt：放行所有爬虫。这是开源知识库，搜索、实时读取和训练都欢迎。
// 照 /howto/astro/ 第 5 节的写法：Sitemap 网址跟着 site 和 base 走。
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const body = ["User-agent: *", "Allow: /", "", `Sitemap: ${new URL(`${base}sitemap-index.xml`, site).href}`, ""].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
