// Brand guard (Thomas, 2026-11-16): every email Ace Labs sends is on the
// canonical ACE DAT shell, and the old look (text-only "AceTheDAT" bar in
// #0E1311 with letter-spaced gold #C9A84C, white Georgia card on #F4F1EA,
// "Founder, AceTheDAT", gold rule footer) can never come back.
// Run: node --test tests/email/*.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { BRANDED_SHELL, FOOTER_HTML, FOOTER_TEXT, oldBrandProblems, missingBrandPieces } from "../../netlify/functions/_lib/email-brand.mjs";
import { buildWelcome, buildLeadAlert } from "../../netlify/functions/submission-created.mjs";

test("the guard catches the old look", () => {
  const old = '<td bgcolor="#0E1311"><div style="letter-spacing:3px;color:#C9A84C;">AceTheDAT</div></td><body style="background:#F4F1EA;font:16px Georgia">Founder, AceTheDAT';
  assert.ok(oldBrandProblems(old).length >= 5);
  assert.ok(missingBrandPieces(old).length > 0);
});

test("the shell is the canonical ACE DAT layout", () => {
  assert.deepEqual(oldBrandProblems(BRANDED_SHELL), []);
  assert.deepEqual(missingBrandPieces(BRANDED_SHELL), []);
  assert.ok(BRANDED_SHELL.includes(FOOTER_HTML));
});

for (const [label, e] of [["subscriber welcome", buildWelcome()], ["lead alert to Thomas", buildLeadAlert("maya@example.com", "2026-11-16T12:00:00Z")]]) {
  test(`${label}: ACE DAT shell, no old branding, plain text signs the same`, () => {
    assert.deepEqual(oldBrandProblems(e.html), []);
    assert.deepEqual(missingBrandPieces(e.html), []);
    assert.ok(!/\{\{[A-Z_]+\}\}/.test(e.html), "no unfilled placeholder");
    assert.ok(e.text.includes(FOOTER_TEXT));
    assert.ok(!/[\u2013\u2014]/.test(e.subject + e.html + e.text), "no en or em dash");
  });
}

test("the sender never falls back to the old Georgia layout or the old name", () => {
  const src = fs.readFileSync(new URL("../../netlify/functions/submission-created.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(src, /Georgia|Founder,\s*AceTheDAT|#0E1311|#C9A84C|Ace the DAT/i);
});
