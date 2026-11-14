#!/usr/bin/env node
// geo-track.mjs: ask a fixed prompt set through AI APIs with web search on,
// store every answer and cited URL in SQLite, report mention rate per engine per week.
// Node 22.13+ (uses the built-in node:sqlite and fetch), no npm install.
//
//   node geo-track.mjs run prompts.csv --engines anthropic,perplexity --reps 3 --country US
//   node geo-track.mjs report --brand "MyTool" --alias "我的工具" --domain mytool.dev --csv geo-baseline.csv --prompts prompts.csv
//   node geo-track.mjs export --brand "MyTool" --domain mytool.dev --out geo-api.csv
//
// prompts.csv columns: id,lang,type,prompt   (type: name | category | problem | compare)
// --csv and export use the hand-written log format: 日期,AI,问题,第几遍,提到我了吗,引用的网址,说错了什么
// Request and response shapes follow each vendor's docs as read on 2026-11-14.
// They were tested against mocked responses only, never with a real API key.
import { DatabaseSync } from "node:sqlite";
import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { pathToFileURL } from "node:url";

const textOf = (blocks, type) => (blocks ?? []).filter((c) => c.type === type).map((c) => c.text ?? "");
const citedUrls = (blocks, type) =>
  (blocks ?? []).flatMap((c) => (c.annotations ?? []).filter((a) => a.type === type && a.url).map((a) => a.url));

export const ENGINES = {
  openai: {
    model: process.env.OPENAI_MODEL ?? "gpt-6-astra",
    key: "OPENAI_API_KEY",
    request: (prompt, model, country, key) => ({
      url: "https://api.openai.com/v1/responses",
      headers: { authorization: `Bearer ${key}` },
      body: { model, input: prompt, tools: [{ type: "web_search", user_location: { type: "approximate", country } }] },
    }),
    parse: (d) => {
      const msgs = (d.output ?? []).filter((o) => o.type === "message");
      return {
        text: msgs.flatMap((m) => textOf(m.content, "output_text")).join("\n"),
        urls: msgs.flatMap((m) => citedUrls(m.content, "url_citation")),
      };
    },
  },
  anthropic: {
    model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-5-5",
    key: "ANTHROPIC_API_KEY",
    request: (prompt, model, country, key) => ({
      url: "https://api.anthropic.com/v1/messages",
      headers: { "x-api-key": key, "anthropic-version": "2026-10-21" },
      body: {
        model,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3, user_location: { type: "approximate", country } }],
      },
    }),
    parse: (d) => {
      const blocks = (d.content ?? []).filter((c) => c.type === "text");
      return {
        text: blocks.map((c) => c.text ?? "").join(""),
        urls: blocks.flatMap((c) => (c.citations ?? []).map((x) => x.url).filter(Boolean)),
      };
    },
  },
  gemini: {
    model: process.env.GEMINI_MODEL ?? "gemini-4-hydrogen",
    key: "GEMINI_API_KEY",
    request: (prompt, model, _country, key) => ({
      url: "https://generativelanguage.googleapis.com/v1beta/interactions",
      headers: { "x-goog-api-key": key, "Api-Revision": "2026-05-20" },
      body: { model, input: prompt, tools: [{ type: "google_search" }] },
    }),
    parse: (d) => {
      const steps = (d.steps ?? []).filter((s) => s.type === "model_output");
      return {
        text: steps.flatMap((s) => textOf(s.content, "text")).join("\n"),
        urls: steps.flatMap((s) => citedUrls(s.content, "url_citation")),
      };
    },
  },
  perplexity: {
    model: process.env.PPLX_EFFORT ?? "fast",
    key: "PERPLEXITY_API_KEY",
    request: (prompt, effort, _country, key) => ({
      url: "https://api.perplexity.ai/v1/agent",
      headers: { authorization: `Bearer ${key}` },
      body: { effort, input: prompt },
    }),
    parse: (d) => {
      const out = d.output ?? [];
      return {
        text: out.filter((o) => o.type === "message").flatMap((m) => textOf(m.content, "output_text")).join("\n"),
        urls: out.filter((o) => o.type === "search_results").flatMap((o) => (o.results ?? []).map((r) => r.url).filter(Boolean)),
      };
    },
  },
};

const SCHEMA = `
create table if not exists answers(
  id integer primary key, run_at text, engine text, model text, prompt_id text, lang text, type text,
  rep integer, prompt text, answer text, raw text, error text);
create table if not exists citations(answer_id integer, url text, domain text);`;

export function openDb(path) {
  const db = new DatabaseSync(path);
  db.exec(SCHEMA);
  return db;
}

export function parseCsv(src) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((x) => x !== "")) rows.push(row);
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim().replace(/^﻿/, ""), (r[i] ?? "").trim()])));
}

export const domainOf = (url) => {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
};

export async function run({ db, prompts, engines, reps, country, fetchImpl = fetch, pauseMs = 1000, now = new Date() }) {
  const runAt = now.toISOString().slice(0, 19) + "Z";
  const insertAnswer = db.prepare(
    "insert into answers(run_at,engine,model,prompt_id,lang,type,rep,prompt,answer,raw,error) values(?,?,?,?,?,?,?,?,?,?,?)");
  const insertCite = db.prepare("insert into citations values(?,?,?)");
  for (const name of engines) {
    if (!ENGINES[name]) throw new Error(`unknown engine: ${name} (known: ${Object.keys(ENGINES).join(", ")})`);
    if (!process.env[ENGINES[name].key]) throw new Error(`set ${ENGINES[name].key} first`);
  }
  for (const name of engines) {
    const eng = ENGINES[name];
    const key = process.env[eng.key];
    for (const p of prompts) {
      for (let rep = 0; rep < reps; rep++) {
        let raw = null, error = null, text = "", urls = [];
        try {
          const req = eng.request(p.prompt, eng.model, country, key);
          const res = await fetchImpl(req.url, {
            method: "POST",
            headers: { "content-type": "application/json", ...req.headers },
            body: JSON.stringify(req.body),
          });
          raw = await res.text();
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw.slice(0, 300)}`);
          ({ text, urls } = eng.parse(JSON.parse(raw)));
        } catch (e) {
          error = String(e).slice(0, 500);
        }
        const { lastInsertRowid } = insertAnswer.run(
          runAt, name, eng.model, p.id, p.lang ?? "", p.type ?? "", rep, p.prompt, text, raw, error);
        for (const u of new Set(urls)) insertCite.run(lastInsertRowid, u, domainOf(u));
        console.error(name, p.id, rep, error ? `ERROR ${error}` : `${text.length} chars, ${urls.length} urls`);
        if (pauseMs) await new Promise((r) => setTimeout(r, pauseMs));
      }
    }
  }
}

export function isoWeek(iso) {
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z");
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const jan1 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - jan1) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function mentions(text, names) {
  return names.some((n) => {
    const esc = n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?<![A-Za-z0-9_])${esc}(?![A-Za-z0-9_])`, "i").test(text);
  });
}

export const LABELS = { openai: "OpenAI API", anthropic: "Claude API", gemini: "Gemini API", perplexity: "Perplexity API" };
export const CSV_HEADER = ["日期", "AI", "问题", "第几遍", "提到我了吗", "引用的网址", "说错了什么"];

// One observation = one answer, whether it came from the API (SQLite) or was typed by hand (the lesson's geo-baseline.csv).
export function observationsFromDb(db, names) {
  const urls = new Map();
  for (const c of db.prepare("select answer_id, url from citations").all()) {
    if (!urls.has(c.answer_id)) urls.set(c.answer_id, []);
    urls.get(c.answer_id).push(c.url);
  }
  return db.prepare("select id, run_at, engine, prompt_id, type, rep, answer from answers where error is null and answer != ''").all()
    .map((a) => ({ date: a.run_at.slice(0, 10), engine: LABELS[a.engine] ?? a.engine, promptId: a.prompt_id, type: a.type,
      rep: a.rep + 1, mentioned: mentions(a.answer, names), urls: urls.get(a.id) ?? [] }));
}

export function observationsFromLessonCsv(rows, typeById = {}) {
  return rows.filter((r) => r["日期"] && r["AI"]).map((r) => ({
    date: r["日期"], engine: r["AI"], promptId: r["问题"], type: typeById[r["问题"]] ?? "", rep: Number(r["第几遍"]) || 1,
    mentioned: r["提到我了吗"].startsWith("是"), urls: (r["引用的网址"] ?? "").split(/[\s|]+/).filter((u) => /^https?:\/\//.test(u)),
  }));
}

export function summarize(observations, { domain = "", weeks = 8, includeName = false } = {}) {
  const own = (u) => { const d = domainOf(u); return Boolean(domain) && (d === domain || d.endsWith("." + domain)); };
  const groups = new Map();
  const ownUrls = new Map();
  for (const o of observations) {
    if (!includeName && o.type === "name") continue;
    const week = isoWeek(o.date);
    const k = `${week}\t${o.engine}`;
    const g = groups.get(k) ?? { week, engine: o.engine, answers: 0, mentioned: 0, citedOwn: 0 };
    g.answers++;
    g.mentioned += o.mentioned ? 1 : 0;
    g.citedOwn += o.urls.some(own) ? 1 : 0;
    for (const u of o.urls) if (own(u)) ownUrls.set(u, (ownUrls.get(u) ?? 0) + 1);
    groups.set(k, g);
  }
  const rows = [...groups.values()]
    .sort((x, y) => (x.week + x.engine).localeCompare(y.week + y.engine))
    .map((g) => {
      const p = g.mentioned / g.answers;
      return { ...g, mentionRate: p, margin: 1.96 * Math.sqrt((p * (1 - p)) / g.answers), citationRate: g.citedOwn / g.answers };
    });
  const keepWeeks = new Set([...new Set(rows.map((r) => r.week))].slice(-weeks));
  return {
    rows: rows.filter((r) => keepWeeks.has(r.week)),
    ownUrls: [...ownUrls].sort((a, b) => b[1] - a[1]).slice(0, 20),
  };
}

const csvCell = (v) => (/[",\n\r]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));

export function toLessonCsv(observations, domain = "") {
  const own = (u) => { const d = domainOf(u); return Boolean(domain) && (d === domain || d.endsWith("." + domain)); };
  const lines = observations.map((o) => {
    const mine = o.urls.filter(own);
    const shown = mine.length ? mine : o.urls.slice(0, 2);
    return [o.date, o.engine, o.promptId, o.rep, o.mentioned ? "是" : "否", shown.join(" "), ""].map(csvCell).join(",");
  });
  return [CSV_HEADER.join(","), ...lines].join("\n") + "\n";
}

const pct = (x) => `${(x * 100).toFixed(1)}%`.padStart(7);

function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      engines: { type: "string", default: "anthropic" },
      reps: { type: "string", default: "3" },
      country: { type: "string", default: "US" },
      brand: { type: "string" },
      alias: { type: "string", multiple: true, default: [] },
      domain: { type: "string", default: "" },
      weeks: { type: "string", default: "8" },
      "include-name": { type: "boolean", default: false },
      csv: { type: "string", multiple: true, default: [] },
      prompts: { type: "string" },
      out: { type: "string" },
      db: { type: "string", default: "geo.sqlite" },
    },
  });
  const [cmd, file] = positionals;
  const db = openDb(values.db);
  if (cmd === "run" && file) {
    const prompts = parseCsv(readFileSync(file, "utf8"));
    return run({ db, prompts, engines: values.engines.split(","), reps: Number(values.reps), country: values.country });
  }
  if ((cmd === "report" || cmd === "export") && values.brand) {
    const fromApi = observationsFromDb(db, [values.brand, ...values.alias]);
    if (cmd === "export") {
      const csv = toLessonCsv(fromApi, values.domain);
      if (values.out) writeFileSync(values.out, csv); else process.stdout.write(csv);
      return;
    }
    const typeById = values.prompts
      ? Object.fromEntries(parseCsv(readFileSync(values.prompts, "utf8")).map((p) => [p.id, p.type])) : {};
    const byHand = values.csv.flatMap((f) => observationsFromLessonCsv(parseCsv(readFileSync(f, "utf8")), typeById));
    const r = summarize([...fromApi, ...byHand], { domain: values.domain, weeks: Number(values.weeks), includeName: values["include-name"] });
    console.log("week       engine           answers  mention   ±95%  cited-you");
    for (const x of r.rows) {
      console.log(`${x.week}   ${x.engine.padEnd(15)} ${String(x.answers).padStart(7)}  ${pct(x.mentionRate)} ${pct(x.margin)} ${pct(x.citationRate)}`);
    }
    if (r.ownUrls.length) console.log("\nyour URLs cited most:");
    for (const [u, n] of r.ownUrls) console.log(`${String(n).padStart(5)}  ${u}`);
    return;
  }
  console.error("usage: node geo-track.mjs run prompts.csv [--engines a,b] [--reps 3] [--country US]\n" +
    "       node geo-track.mjs report --brand NAME [--alias X] [--domain example.com] [--csv geo-baseline.csv] [--prompts prompts.csv] [--weeks 8] [--include-name]\n" +
    "       node geo-track.mjs export --brand NAME [--alias X] [--domain example.com] [--out geo-api.csv]");
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await main(); } catch (e) { console.error(e.message); process.exitCode = 1; }
}
