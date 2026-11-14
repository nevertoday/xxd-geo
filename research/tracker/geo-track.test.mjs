// node --test research/tracker/   Mocked vendor responses shaped like each vendor's 2026-11-14 docs.
import test from "node:test";
import assert from "node:assert/strict";
import { openDb, run, parseCsv, isoWeek, mentions, observationsFromDb, observationsFromLessonCsv, summarize, toLessonCsv } from "./geo-track.mjs";

const RESPONSES = {
  "api.openai.com": (hit) => ({
    output: [
      { type: "web_search_call", status: "completed" },
      { type: "message", content: [{ type: "output_text", text: hit ? "Try MyTool or OtherTool." : "Try OtherTool.",
        annotations: [{ type: "url_citation", url: hit ? "https://www.mytool.dev/guide" : "https://other.com/" }] }] },
    ],
  }),
  "api.anthropic.com": (hit) => ({
    content: [
      { type: "server_tool_use", name: "web_search" },
      { type: "web_search_tool_result", content: [{ type: "web_search_result", url: "https://ignored.example/" }] },
      { type: "text", text: hit ? "我的工具 works well" : "Use OtherTool",
        citations: [{ type: "web_search_result_location", url: hit ? "https://docs.mytool.dev/a" : "https://other.com/b" }] },
    ],
  }),
  "generativelanguage.googleapis.com": (hit) => ({
    steps: [
      { type: "google_search_call", queries: ["x"] },
      { type: "model_output", content: [{ type: "text", text: hit ? "mytool is fine" : "nothing",
        annotations: [{ type: "url_citation", url: "https://other.com/c", start_index: 0, end_index: 4 }] }] },
    ],
  }),
  "api.perplexity.ai": (hit) => ({
    output: [
      { type: "search_results", results: [{ id: 1, url: "https://mytool.dev/", title: "t" }, { id: 2, url: "https://other.com/" }] },
      { type: "message", content: [{ type: "output_text", text: hit ? "MyTool, OtherTool" : "OtherTool" }] },
    ],
  }),
};

function mockFetch() {
  const seen = [];
  let n = 0;
  const impl = async (url, init) => {
    const host = new URL(url).hostname;
    seen.push({ host, body: JSON.parse(init.body), headers: init.headers });
    if (host === "api.perplexity.ai" && n++ === 3) return new Response("rate limited", { status: 429 });
    const hit = JSON.parse(init.body).input?.includes?.("hit") || JSON.parse(init.body).messages?.[0]?.content.includes("hit");
    return new Response(JSON.stringify(RESPONSES[host](hit)), { status: 200 });
  };
  return { impl, seen };
}

const CSV = `id,lang,type,prompt
E2,en,category,"best tool for hit, cheap"
E3,en,problem,how do I fix this
Z1,zh,name,"MyTool 收费吗 hit"
`;

for (const k of ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY", "PERPLEXITY_API_KEY"]) process.env[k] = "test";

test("csv with quoted commas parses into prompt rows", () => {
  const rows = parseCsv(CSV);
  assert.equal(rows.length, 3);
  assert.equal(rows[0].prompt, "best tool for hit, cheap");
  assert.equal(rows[2].type, "name");
});

test("brand matching respects word edges and works for Chinese names", () => {
  assert.ok(mentions("Try MyTool today", ["mytool"]));
  assert.ok(!mentions("Try MyToolbox", ["MyTool"]));
  assert.ok(mentions("推荐我的工具，很好用", ["我的工具"]));
});

test("iso week of a Monday in November 2026", () => {
  assert.equal(isoWeek("2026-11-16T09:00:00Z"), "2026-W47");
  assert.equal(isoWeek("2027-01-01T00:00:00Z"), "2026-W53");
});

test("run stores answers and citations, report gives per-engine weekly mention rate", async () => {
  const db = openDb(":memory:");
  const { impl, seen } = mockFetch();
  await run({ db, prompts: parseCsv(CSV), engines: ["openai", "anthropic", "gemini", "perplexity"],
    reps: 2, country: "US", fetchImpl: impl, pauseMs: 0, now: new Date("2026-11-16T09:00:00Z") });

  assert.equal(db.prepare("select count(*) n from answers").get().n, 24, "4 engines x 3 prompts x 2 reps");
  assert.equal(db.prepare("select count(*) n from answers where error is not null").get().n, 1, "the 429 is stored as an error");
  assert.deepEqual(seen.find((s) => s.host === "api.openai.com").body.tools[0].type, "web_search");
  assert.equal(seen.find((s) => s.host === "api.anthropic.com").headers["anthropic-version"], "2026-10-21");
  assert.equal(seen.find((s) => s.host === "api.perplexity.ai").body.effort, "fast");
  const anthropicUrls = db.prepare(
    "select url from citations join answers on answers.id = citations.answer_id where engine = 'anthropic'").all().map((r) => r.url);
  assert.ok(!anthropicUrls.includes("https://ignored.example/"), "only cited URLs, not every search result");

  const fromApi = observationsFromDb(db, ["MyTool", "我的工具"]);
  const r = summarize(fromApi, { domain: "mytool.dev" });
  const by = Object.fromEntries(r.rows.map((x) => [x.engine, x]));
  assert.deepEqual(Object.keys(by).sort(), ["Claude API", "Gemini API", "OpenAI API", "Perplexity API"]);
  assert.equal(by["OpenAI API"].week, "2026-W47");
  assert.equal(by["OpenAI API"].answers, 4, "name-type prompts are left out by default");
  assert.equal(by["OpenAI API"].mentionRate, 0.5);
  assert.equal(by["OpenAI API"].citationRate, 0.5, "www.mytool.dev counts as your domain");
  assert.equal(by["Claude API"].mentionRate, 0.5, "Chinese alias counts as a mention");
  assert.equal(by["Gemini API"].citationRate, 0);
  assert.equal(by["Perplexity API"].answers, 3, "errored answer is not counted");
  assert.ok(by["OpenAI API"].margin > 0.4, "4 answers give a huge margin");
  assert.deepEqual(Object.fromEntries(r.ownUrls),
    { "https://mytool.dev/": 3, "https://www.mytool.dev/guide": 2, "https://docs.mytool.dev/a": 2 });

  const withName = summarize(fromApi, { domain: "mytool.dev", includeName: true });
  assert.equal(withName.rows.find((x) => x.engine === "OpenAI API").answers, 6);

  const exported = toLessonCsv(fromApi, "mytool.dev");
  assert.equal(exported.split("\n")[0], "日期,AI,问题,第几遍,提到我了吗,引用的网址,说错了什么");
  assert.ok(exported.includes("2026-11-16,OpenAI API,E2,1,是,https://www.mytool.dev/guide,"), "export uses the lesson's columns");
  const roundTrip = observationsFromLessonCsv(parseCsv(exported), { Z1: "name" });
  assert.deepEqual(summarize(roundTrip, { domain: "mytool.dev" }).rows.map((x) => [x.engine, x.answers, x.mentioned]),
    r.rows.map((x) => [x.engine, x.answers, x.mentioned]), "exported CSV reads back to the same mention counts");
});

test("hand-written geo-baseline.csv from lesson 2 is counted per AI per week", () => {
  const baseline = `日期,AI,问题,第几遍,提到我了吗,引用的网址,说错了什么
2026-11-14,ChatGPT,E2,1,否,https://review.example/best/,
2026-11-14,ChatGPT,E1,1,是,https://mytool.dev/,说要登录账号，其实不用
2026-11-14,ChatGPT,E2,2,是,https://mytool.dev/guide/,
2026-11-14,豆包,Z3,1,否,https://qa.example/question/123,
`;
  const obs = observationsFromLessonCsv(parseCsv(baseline), { E1: "name", Z1: "name", E4: "name", Z4: "name" });
  const r = summarize(obs, { domain: "mytool.dev" });
  const chatgpt = r.rows.find((x) => x.engine === "ChatGPT");
  assert.equal(chatgpt.answers, 2, "E1 is a name question and is left out");
  assert.equal(chatgpt.mentionRate, 0.5);
  assert.equal(chatgpt.citationRate, 0.5);
  assert.equal(r.rows.find((x) => x.engine === "豆包").mentionRate, 0);
});
