#!/usr/bin/env node
// GEO probe: node probe.mjs <url>  (Node 18+, no dependencies). Prints one JSON object to stdout.
// Facts only. The skill's SKILL.md turns them into a report.

// role: ai-search = AI search index, ai-user = fetch on a user's request, ai-training = training only,
// search = classic search engine, unclear = purpose not documented, browser = baseline.
// ua: null means a robots.txt token that never fetches pages, so it is checked in robots.txt only.
// robotsFallback: whose group the crawler obeys when robots.txt has no group for it.
const AGENTS = [
  { name: "OAI-SearchBot", owner: "OpenAI", role: "ai-search", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.3; +https://openai.com/searchbot" },
  { name: "ChatGPT-User", owner: "OpenAI", role: "ai-user", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot" },
  { name: "GPTBot", owner: "OpenAI", role: "ai-training", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.3; +https://openai.com/gptbot" },
  { name: "Claude-SearchBot", owner: "Anthropic", role: "ai-search", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +Claude-SearchBot@anthropic.com)" },
  { name: "Claude-User", owner: "Anthropic", role: "ai-user", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)" },
  { name: "ClaudeBot", owner: "Anthropic", role: "ai-training", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)" },
  { name: "PerplexityBot", owner: "Perplexity", role: "ai-search", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)" },
  { name: "Perplexity-User", owner: "Perplexity", role: "ai-user", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)" },
  { name: "Google-Extended", owner: "Google", role: "ai-training", ua: null },
  { name: "Googlebot", owner: "Google", role: "search", ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
  { name: "bingbot", owner: "Microsoft", role: "search", ua: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)" },
  { name: "Applebot", owner: "Apple", role: "search", robotsFallback: "Googlebot", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)" },
  { name: "Bytespider", owner: "ByteDance", role: "unclear", ua: "Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)" },
  { name: "Baiduspider", owner: "Baidu", role: "search", ua: "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)" },
  { name: "browser", owner: "-", role: "browser", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36" },
];

const BROWSER = AGENTS.find((a) => a.role === "browser");
const SITEMAP_GUESSES = ["/sitemap.xml", "/sitemap-index.xml", "/sitemap_index.xml"];
const TIMEOUT_MS = 15000;
const MAX_BODY = 3_000_000;

async function get(url, ua = BROWSER.ua) {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": ua, accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const body = (await res.text()).slice(0, MAX_BODY);
    return {
      status: res.status,
      finalUrl: res.url,
      contentType: res.headers.get("content-type"),
      server: res.headers.get("server"),
      cfMitigated: res.headers.get("cf-mitigated"),
      xRobotsTag: res.headers.get("x-robots-tag"),
      bytes: Buffer.byteLength(body),
      body,
    };
  } catch (e) {
    return { status: null, error: String(e.cause?.code ?? e.name ?? e) };
  }
}

function parseRobots(text) {
  const groups = [];
  const sitemaps = [];
  const contentSignals = [];
  let current = null;
  let directives = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const value = m[2].trim();
    directives++;
    if (key === "user-agent") {
      if (!current || current.rules.length) groups.push((current = { agents: [], rules: [] }));
      current.agents.push(value.toLowerCase());
    } else if ((key === "allow" || key === "disallow") && current) {
      if (value) current.rules.push({ allow: key === "allow", path: value });
    } else if (key === "sitemap") {
      sitemaps.push(value);
    } else if (key === "content-signal") {
      contentSignals.push(value);
    }
  }
  return { groups, sitemaps, contentSignals, directives };
}

const toRegex = (pattern) =>
  new RegExp("^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$"));

// RFC 9309: robots.txt that is 4xx means no restrictions; 5xx or unreachable means assume full disallow,
// but this probe cannot tell a real outage from a CDN rejecting its user agent, so it reports unknown.
function robotsVerdict(robots, agent, path, status) {
  if (status !== 200) {
    const unavailable = status !== null && status >= 400 && status < 500;
    return { group: null, allowed: unavailable ? true : null, rule: null, robotsStatus: status };
  }
  const find = (token) => robots.groups.filter((g) => g.agents.includes(token.toLowerCase()));
  let matched = find(agent.name);
  let group = matched.length ? agent.name : null;
  if (!matched.length && agent.robotsFallback) {
    matched = find(agent.robotsFallback);
    if (matched.length) group = agent.robotsFallback;
  }
  if (!matched.length) {
    matched = find("*");
    if (matched.length) group = "*";
  }
  let best = null;
  for (const rule of matched.flatMap((g) => g.rules)) {
    if (!toRegex(rule.path).test(path)) continue;
    const longer = !best || rule.path.length > best.path.length;
    const tieAllow = best && rule.path.length === best.path.length && rule.allow && !best.allow;
    if (longer || tieAllow) best = rule;
  }
  return { group, allowed: best ? best.allow : true, rule: best ? `${best.allow ? "Allow" : "Disallow"}: ${best.path}` : null };
}

const decode = (s) =>
  s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

const visibleText = (html) =>
  decode(html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|template|svg)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)) out[m[1].toLowerCase()] = decode(m[3] ?? m[4] ?? m[5] ?? "");
  return out;
}

function readPage(html) {
  const tags = (name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => attrs(m[0]));
  const metas = tags("meta");
  const links = tags("link");
  const meta = (key, value) => metas.find((m) => (m[key] ?? "").toLowerCase() === value)?.content ?? null;
  const headings = (level) => [...html.matchAll(new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)</h${level}>`, "gi"))].map((m) => visibleText(m[1]));

  const jsonLd = [...html.matchAll(/<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => {
    try {
      const data = JSON.parse(m[1]);
      const nodes = [data].flat().flatMap((d) => d?.["@graph"] ?? [d]);
      return { ok: true, types: nodes.map((n) => n?.["@type"]).flat().filter(Boolean), json: m[1].trim().slice(0, 4000) };
    } catch (e) {
      return { ok: false, error: e.message, json: m[1].trim().slice(0, 500) };
    }
  });

  const body = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
  const main = body.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  const text = visibleText(body);
  const mainText = main ? visibleText(main) : null;
  const scriptTags = (html.match(/<script\b/gi) ?? []).length;
  const emptyAppRoot = /<div[^>]+id=["'](root|app|__next|__nuxt|svelte)["'][^>]*>\s*<\/div>/i.test(html);

  return {
    lang: html.match(/<html\b[^>]*\blang=["']?([^"'\s>]+)/i)?.[1] ?? null,
    title: visibleText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "") || null,
    description: meta("name", "description"),
    canonical: links.find((l) => (l.rel ?? "").toLowerCase() === "canonical")?.href ?? null,
    metaRobots: meta("name", "robots"),
    ogTitle: meta("property", "og:title"),
    ogDescription: meta("property", "og:description"),
    hreflang: links.filter((l) => l.hreflang).length,
    markdownAlternate: links.find((l) => (l.type ?? "").toLowerCase() === "text/markdown")?.href ?? null,
    verification: { google: meta("name", "google-site-verification") !== null, bing: meta("name", "msvalidate.01") !== null },
    h1: headings(1),
    h2: headings(2).slice(0, 15),
    h2Count: headings(2).length,
    jsonLd,
    htmlBytes: Buffer.byteLength(html),
    scriptTags,
    emptyAppRoot,
    textLength: text.length,
    mainTextLength: mainText?.length ?? null,
    textStart: (mainText ?? text).slice(0, 600),
  };
}

function readSitemap(res) {
  const body = res.body ?? "";
  const kind = /<sitemapindex\b/i.test(body) ? "sitemapindex" : /<urlset\b/i.test(body) ? "urlset" : "other";
  const locs = [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => decode(m[1]));
  const lastmods = [...body.matchAll(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/gi)].map((m) => m[1]);
  return { status: res.status, contentType: res.contentType ?? null, kind, locCount: locs.length, firstLocs: locs.slice(0, 5), lastmodCount: lastmods.length, lastmodDistinct: new Set(lastmods).size };
}

async function probeSitemaps(origin, fromRobots) {
  const urls = [...new Set([...fromRobots, ...SITEMAP_GUESSES.map((p) => origin + p)])];
  const checked = [];
  for (const url of urls) {
    const info = { url, ...readSitemap(await get(url)) };
    if (info.status === 200 && info.kind === "sitemapindex" && info.firstLocs[0]) {
      info.firstChild = { url: info.firstLocs[0], ...readSitemap(await get(info.firstLocs[0])) };
    }
    checked.push(info);
  }
  const found = checked.find((s) => s.status === 200 && s.kind !== "other");
  return { found: found?.url ?? null, checked };
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("usage: node probe.mjs <url>");
    process.exit(2);
  }
  let target;
  try {
    target = new URL(/^https?:\/\//i.test(arg) ? arg : `https://${arg}`);
  } catch {
    console.error(`not a URL: ${arg}`);
    process.exit(2);
  }
  const origin = target.origin;
  const path = target.pathname + target.search;

  const robotsRes = await get(`${origin}/robots.txt`);
  const robotsText = robotsRes.status === 200 ? robotsRes.body : "";
  const robots = parseRobots(robotsText);

  const agents = [];
  let browserPage = null;
  for (const agent of AGENTS) {
    const http = agent.ua ? await get(target.href, agent.ua) : null;
    if (agent === BROWSER) browserPage = http;
    agents.push({
      name: agent.name,
      owner: agent.owner,
      role: agent.role,
      robots: agent.role === "browser" ? null : robotsVerdict(robots, agent, path, robotsRes.status),
      http: http && { status: http.status, bytes: http.bytes ?? null, cfMitigated: http.cfMitigated ?? null, error: http.error ?? null },
    });
  }

  const [sitemap, llms, bingAuth] = [await probeSitemaps(origin, robots.sitemaps), await get(`${origin}/llms.txt`), await get(`${origin}/BingSiteAuth.xml`)];
  const page = browserPage?.status === 200 ? readPage(browserPage.body) : null;
  const browserStatus = browserPage?.status ?? null;

  const out = {
    url: target.href,
    finalUrl: browserPage?.finalUrl ?? null,
    probedAt: new Date().toISOString(),
    robots: {
      url: `${origin}/robots.txt`,
      status: robotsRes.status,
      bytes: robotsRes.bytes ?? null,
      directives: robots.directives,
      groups: robots.groups.map((g) => ({ agents: g.agents, rules: g.rules.map((r) => `${r.allow ? "Allow" : "Disallow"}: ${r.path}`) })),
      sitemaps: robots.sitemaps,
      contentSignals: robots.contentSignals,
      text: robotsText.slice(0, 6000),
    },
    agents,
    sitemap,
    llmsTxt: { status: llms.status, bytes: llms.status === 200 ? llms.bytes : null, startsWithH1: llms.status === 200 && /^#\s/.test(llms.body.trimStart()) },
    bingSiteAuthXml: bingAuth.status === 200 && /<users>/i.test(bingAuth.body),
    page: page && { status: browserStatus, xRobotsTag: browserPage.xRobotsTag ?? null, server: browserPage.server ?? null, ...page },
    summary: {
      browserStatus,
      blockedByRobots: agents.filter((a) => a.robots && a.robots.allowed === false).map((a) => a.name),
      blockedByHttp: agents.filter((a) => a.http && a.role !== "browser" && (a.http.cfMitigated || (a.http.status !== browserStatus && (a.http.status === null || a.http.status >= 400)))).map((a) => `${a.name} ${a.http.status ?? a.http.error}`),
      robotsStatus: robotsRes.status,
      robotsHasRules: robots.groups.length > 0,
      sitemapFound: sitemap.found,
      llmsTxt: llms.status === 200,
      jsonLdTypes: page ? page.jsonLd.flatMap((b) => b.types ?? []) : [],
      textLength: page?.textLength ?? null,
    },
  };
  console.log(JSON.stringify(out, null, 2));
}

main();
