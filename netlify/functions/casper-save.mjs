/* Casper practice save — writes one AI-graded practice answer to the app-side
   "Casper Practice" Airtable table (admissions data; same shared base as the
   other app-side tables). Same-origin Netlify function so the Airtable key never
   touches the public client.

   Server-gated: requires CASPER_ACCESS_CODE + AIRTABLE_PAT env vars (503 until
   set), and the caller must send the student's name + the access code. */

const BASE = "appDXSpdJuc3WvtYU";
const TABLE = "tblOwKTF4pBbQgK71"; // Casper Practice

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
}
function lvl(v) { var n = parseInt(v, 10); return (n >= 1 && n <= 3) ? n : null; }

export default async (req) => {
  if (req.method !== "POST") return json({ error: "POST only." }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Bad request." }, 400); }
  const b = body || {};

  const accessCode = process.env.CASPER_ACCESS_CODE;
  const pat = process.env.AIRTABLE_PAT;
  if (!accessCode || !pat) return json({ error: "Saving isn't configured yet." }, 503);
  if (!b.code || b.code !== accessCode) return json({ error: "Invalid or missing access code." }, 401);
  if (!b.student || !String(b.student).trim()) return json({ error: "Missing student name." }, 400);
  if (!b.answer || !String(b.answer).trim()) return json({ error: "Nothing to save." }, 400);

  const d = b.dimensions || {};
  const fields = {
    "Student": String(b.student).trim().slice(0, 200),
    "Scenario": String(b.scenario || "").slice(0, 200),
    "Mode": (b.mode === "mock" ? "mock" : "scenario"),
    "Answer": String(b.answer).slice(0, 50000),
    "Headline": String(b.headline || "").slice(0, 500),
    "Missing Beat": String(b.missingBeat || "").slice(0, 5000),
    "Coach Note": String(b.note || "").slice(0, 5000),
    "Logged": new Date().toISOString(),
  };
  const info = lvl(d.info), emp = lvl(d.empathy), sta = lvl(d.stance), eth = lvl(d.ethics), con = lvl(d.concise);
  if (info !== null) fields["Info"] = info;
  if (emp !== null) fields["Empathy"] = emp;
  if (sta !== null) fields["Stance"] = sta;
  if (eth !== null) fields["Ethics"] = eth;
  if (con !== null) fields["Concise"] = con;

  let r;
  try {
    r = await fetch("https://api.airtable.com/v0/" + BASE + "/" + TABLE, {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": "Bearer " + pat },
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
    });
  } catch (e) {
    return json({ error: "Save failed." }, 502);
  }
  if (!r.ok) return json({ error: "Save failed." }, 502);
  return json({ ok: true }, 200);
};
