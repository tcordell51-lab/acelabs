/* Casper practice grader — same-origin Netlify function for the Ace Labs Casper tool.
   Grades a student's answer against the 5 coaching dimensions and returns an
   elevated rewrite. Haiku 4.5, structured output. NOT an official Casper score.

   Calls the Anthropic Messages API over plain fetch (no SDK dependency, so this
   stays a near-static deploy and there's no package version to break the build).

   Guardrails (all server-side, so the public page can't drain the key):
   - Requires BOTH ANTHROPIC_API_KEY and CASPER_ACCESS_CODE env vars; returns 503
     until they're set, so nothing spends until it's configured.
   - Caller must send the access code (handed to students by their coach).
   - Daily global cap via Netlify Blobs (CASPER_DAILY_CAP, default 500); fails open
     on a Blobs hiccup since the access code is the real gate.
   - Cheap model, capped max_tokens. */

const MODEL = "claude-haiku-4-5";
const DAILY_CAP = parseInt(process.env.CASPER_DAILY_CAP || "500", 10);

const SYSTEM = `You are an expert coach for the Casper situational-judgment test used in health-professions admissions. A student has answered a Casper scenario. Grade their answer and show them a stronger version.

Grade these five dimensions, each as a PRESENCE LEVEL — not a Casper score:
- info: gathered information / asked what they'd want to know before deciding
- empathy: explicitly named the other person's feelings or perspective
- stance: avoided assumptions and hard verdicts; used conditional "if X, then Y" reasoning
- ethics: weighed the trade-off and multiple sides
- concise: clear, structured, finished, and actually answered the question asked

Level scale: 1 = missing, 2 = implied, 3 = explicit.

Grading principles (critical):
- Reward SPECIFICITY. An answer that engages THESE people and THIS dilemma scores higher. A generic line like "I'd be empathetic and fair" is level 1 or 2 even if it name-checks a dimension.
- Penalize templated, formulaic, or robotic answers. If it reads like a memorized script rather than a real person reasoning, say so and score lower. Casper raters reward authentic, specific judgment, not formulas.
- Never predict a Casper score, quartile, or percentile, and never claim what they "would get." These levels are a coaching aid only.
- Be encouraging and concrete. No shaming language.

Then produce:
- missingBeat: the single highest-impact thing to fix, specific to THEIR answer.
- rewrite: a stronger, top-tier version of THEIR answer. Keep their situation and any good specifics, add the missing beats, and make it sound like a thoughtful real person — natural first person, NOT a template. Be concise (Casper rewards concision): about 4 to 7 sentences.
- note: one line naming the specific moves that moved it up.`;

function dimSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      level: { type: "integer", enum: [1, 2, 3] },
      note: { type: "string" },
    },
    required: ["level", "note"],
  };
}
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    dimensions: {
      type: "object",
      additionalProperties: false,
      properties: {
        info: dimSchema(),
        empathy: dimSchema(),
        stance: dimSchema(),
        ethics: dimSchema(),
        concise: dimSchema(),
      },
      required: ["info", "empathy", "stance", "ethics", "concise"],
    },
    missingBeat: { type: "string" },
    rewrite: { type: "string" },
    note: { type: "string" },
  },
  required: ["dimensions", "missingBeat", "rewrite", "note"],
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "POST only." }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Bad request." }, 400); }
  const { stem, questions, answer, code } = body || {};

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const accessCode = process.env.CASPER_ACCESS_CODE;
  if (!apiKey || !accessCode) return json({ error: "AI feedback isn't configured yet." }, 503);
  if (!code || code !== accessCode) return json({ error: "Invalid or missing access code." }, 401);
  if (!answer || !String(answer).trim()) return json({ error: "Type an answer first." }, 400);

  // Daily global cap — best-effort; don't block legit use on a Blobs hiccup.
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("casper-grader");
    const day = new Date().toISOString().slice(0, 10);
    const key = `count-${day}`;
    const cur = parseInt((await store.get(key)) || "0", 10);
    if (cur >= DAILY_CAP) return json({ error: "Daily practice limit reached. Try again tomorrow." }, 429);
    await store.set(key, String(cur + 1));
  } catch (e) { /* cap unavailable — proceed; the access code is the real gate */ }

  const userMsg =
    "Scenario:\n" + (stem || "") +
    "\n\nQuestions:\n" + (Array.isArray(questions) ? questions.map((q, i) => (i + 1) + ". " + q).join("\n") : "") +
    "\n\nStudent's answer:\n" + answer;

  let apiResp;
  try {
    apiResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 900,
        system: SYSTEM,
        output_config: { format: { type: "json_schema", schema: SCHEMA } },
        messages: [{ role: "user", content: userMsg }],
      }),
    });
  } catch (e) {
    return json({ error: "Grader is temporarily unavailable." }, 502);
  }
  if (!apiResp.ok) return json({ error: "Grader is temporarily unavailable." }, 502);

  let payload;
  try { payload = await apiResp.json(); } catch { return json({ error: "Could not read the feedback." }, 502); }
  const text = (payload.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  let data;
  try { data = JSON.parse(text); } catch { return json({ error: "Could not read the feedback." }, 502); }
  return json(data, 200);
};
