/* Netlify event function — fires automatically on every Netlify Forms submission.
   For the free trick-library email capture (form "trick-sheets") it:
     1) writes the lead into the app-side Leads CRM (Airtable), tagged source
        "trick-library", status "New", so it enters the same nurture pipeline
        the rest of the funnel uses; and
     2) if RESEND_API_KEY is set, emails Thomas a "new lead" alert and sends the
        subscriber a short welcome (the first nurture touch).
   Every other form is ignored. Always returns 200 so a downstream hiccup can
   never block the visitor's submission or Netlify's own capture. */

import { brandedHtml, LINK_STYLE, FOOTER_TEXT } from "./_lib/email-brand.mjs";

const BASE  = "appDXSpdJuc3WvtYU";
const LEADS = "tblUJOZlwLMJdCYU3";
// write by field ID so a rename in Airtable never silently breaks this
const F_EMAIL  = "fldkM65rek2RTGIiV";  // Email
const F_SOURCE = "fldul8DSZ91BDbk96";  // Source (singleSelect)
const F_STATUS = "fldMDWQSc7zE9QV5w";  // Status (singleSelect)
const F_ACTIVE = "fldeowu2hpjXGPpi3";  // active (checkbox)
const F_NOTES  = "fldGkW6zk4UrrM8E5";  // Notes (multiline)
const F_WHEN   = "fldccLobWBwcPRJJl";  // captured (dateTime)

const NOTIFY_TO = process.env.LEADS_NOTIFY_TO || "thomascordell@acethedat.com";
const FROM      = process.env.LEADS_FROM || "ACE DAT <team@acethedat.com>";
const EMAIL_RE  = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const handler = async (event) => {
  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return ok(); }
  const p = body.payload || {};
  const data = p.data || {};
  const formName = p.form_name || data["form-name"] || "";
  if (formName !== "trick-sheets") return ok();           // only the trick-library form

  const email = String(p.email || data.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return ok();
  const when = new Date().toISOString();

  // 1) lead -> Leads CRM
  const pat = process.env.AIRTABLE_PAT;
  if (pat) {
    const fields = {};
    fields[F_EMAIL]  = email;
    fields[F_SOURCE] = "trick-library";
    fields[F_STATUS] = "New";
    fields[F_ACTIVE] = true;
    fields[F_NOTES]  = "Free trick-library email capture (acelabs.netlify.app/tricks/).";
    fields[F_WHEN]   = when;
    try {
      await fetch("https://api.airtable.com/v0/" + BASE + "/" + LEADS, {
        method: "POST",
        headers: { "content-type": "application/json", "authorization": "Bearer " + pat },
        body: JSON.stringify({ records: [{ fields }], typecast: true }),
      });
    } catch (e) { /* never block the submission */ }
  }

  // 2) alert Thomas + welcome the subscriber (only when Resend is wired)
  const rk = process.env.RESEND_API_KEY;
  if (rk) {
    const alert = buildLeadAlert(email, when);
    await sendEmail(rk, { to: NOTIFY_TO.split(",").map(s => s.trim()).filter(Boolean), ...alert }).catch(() => {});
    const welcome = buildWelcome();
    await sendEmail(rk, { to: email, ...welcome }).catch(() => {});
  }

  return ok();
};

// Every email goes out on the ACE DAT branded shell (./_lib/email-brand.mjs),
// with a plain-text part that says the same words and signs the same way.
const TRICKS = "https://acelabs.netlify.app/tricks/";

export function buildWelcome() {
  const html = brandedHtml({
    preheader: "Every OChem and Gen Chem shortcut, in one place.",
    greeting: "Hi there,",
    bodyHtml: [
      "<p style=\"margin:0 0 16px;\">You are in. The full trick library, every OChem and Gen Chem shortcut, lives here:</p>",
      "<p style=\"margin:0 0 16px;\"><a href=\"" + TRICKS + "\" style=\"" + LINK_STYLE + "\">acelabs.netlify.app/tricks</a></p>",
      "<p style=\"margin:0 0 16px;\">One trick a day, nothing else. Reply any time.</p>",
    ].join("\n"),
    signoff: "Thomas",
    underCard: "You are receiving this because you signed up for the free trick library at acelabs.netlify.app. Reply \"unsubscribe\" and I will take you off the list.",
  });
  const text = [
    "Hi there,", "",
    "You are in. The full trick library, every OChem and Gen Chem shortcut, lives here:", "",
    TRICKS, "",
    "One trick a day, nothing else. Reply any time.", "",
    "Thomas", "",
    FOOTER_TEXT, "",
    "You are receiving this because you signed up for the free trick library at acelabs.netlify.app. Reply \"unsubscribe\" and I will take you off the list.",
  ].join("\n");
  return { subject: "Your DAT trick library is open", html, text };
}

export function buildLeadAlert(email, when) {
  const html = brandedHtml({
    preheader: "New signup on the free trick library.",
    greeting: "Thomas,",
    bodyHtml: [
      "<p style=\"margin:0 0 16px;\">New signup on the free trick library.</p>",
      "<p style=\"margin:0 0 16px;font-size:18px;\"><b>" + esc(email) + "</b></p>",
      "<p style=\"margin:0 0 16px;color:#4a524d;\">Source: trick-library, " + esc(when) + "</p>",
      "<p style=\"margin:0 0 16px;\">Filed in the Leads CRM as <b>New</b>.</p>",
    ].join("\n"),
    signoff: "Sent automatically",
  });
  const text = ["Thomas,", "", "New signup on the free trick library.", "", email, "", "Source: trick-library, " + when, "", "Filed in the Leads CRM as New.", "", "Sent automatically", "", FOOTER_TEXT].join("\n");
  return { subject: "New trick-library email: " + email, html, text };
}

function ok() { return { statusCode: 200, body: "" }; }
function esc(s) { return String(s).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])); }
async function sendEmail(key, { to, subject, html, text }) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "content-type": "application/json", "authorization": "Bearer " + key },
    body: JSON.stringify({ from: FROM, to: Array.isArray(to) ? to : [to], subject, html, text }),
  });
}
