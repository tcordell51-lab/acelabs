// =====================================================================
// The ACE DAT email layout (Thomas's Nov 2026 brand, the ONLY allowed one):
//   outer background #f5f0e8, card 560px wide
//   header  bgcolor #1B3A2D with the ACE DAT logo (hosted, absolute https)
//   body    #fffdf7, Arial 16px/1.6, text #0d2018
//   footer  bgcolor #1B3A2D, text #e9e4d8; signature "Thomas Cordell" in
//           #E2C97A, then "Founder, ACE DAT. 510 AA, 99th percentile",
//           then acethedat.com; then why they get it, a one-click
//           unsubscribe line and the postal address.
// The old layout (text "AceTheDAT" header on #0E1311, gold #c9a84c, a
// Georgia card, "Founder, AceTheDAT") is banned; checkBrand() fails on it.
//
// MIRROR for acelabs: generated from acethedat-com netlify/functions/_lib/email/
// acedat-brand.js (the layout Thomas approved on 2026-11-16) because Netlify
// Functions cannot import across repos. Change the original, then regenerate.
// =====================================================================

export const COLORS = {
  outer: '#f5f0e8',
  green: '#1B3A2D',
  body: '#fffdf7',
  text: '#0d2018',
  footerText: '#e9e4d8',
  gold: '#E2C97A',
};
export const CARD_WIDTH = 560;
// Transparent PNG (448x96, shown at 224x48), committed at /email/ace-dat-logo.png.
export const LOGO_URL = 'https://acethedat.com/email/ace-dat-logo.png';
const SIGNATURE_NAME = 'Thomas Cordell';
export const SIGNATURE_TITLE = 'Founder, ACE DAT. 510 AA, 99th percentile';
const SITE = 'acethedat.com';
export const POSTAL = 'ACEDAT LLC, 495 Regalia Dr, Inverness, IL 60010';

export const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const LINK_STYLE = `color:${COLORS.green};text-decoration:underline;`;
export const p = (html) => `<p style="margin:0 0 16px;">${html}</p>`;
export const a = (href, label) => `<a href="${esc(href)}" style="${LINK_STYLE}">${esc(label)}</a>`;
// Bulletproof button: the colour sits on a bgcolor cell too (Gmail drops CSS backgrounds).
export const button = (href, label) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;"><tr><td bgcolor="${COLORS.green}" style="background:${COLORS.green};background-color:${COLORS.green};border-radius:6px;"><a href="${esc(href)}" style="display:inline-block;padding:13px 24px;font:700 16px/1 Arial,Helvetica,sans-serif;color:${COLORS.body};text-decoration:none;border-radius:6px;">${esc(label)}</a></td></tr></table>`;

/**
 * @param {object} e
 *   preheader   inbox preview line (plain text)
 *   greeting    plain text, e.g. "Hi Maya,"
 *   bodyHtml    built from p / a / button
 *   signoff     plain text, e.g. "See you soon,"
 *   reason      why they get it (plain text)
 *   unsubUrl    one-click unsubscribe link (required for client email)
 *   postal      postal line, defaults to ACEDAT LLC's address
 *   internal    true for notes to Thomas only (no unsubscribe line needed)
 * @returns {{ html: string, text: string }}
 */
export function brandEmail({ preheader = '', greeting = '', bodyHtml, signoff = 'Best,', reason = '', unsubUrl = '', postal = POSTAL, internal = false }) {
  if (!bodyHtml) throw new Error('bodyHtml is required');
  if (!internal && !unsubUrl) throw new Error('client email needs an unsubscribe link');
  const footerLink = `color:${COLORS.footerText};text-decoration:underline;`;
  const fine = [];
  if (reason) fine.push(esc(reason));
  if (unsubUrl) fine.push(`Prefer not to get these? <a href="${esc(unsubUrl)}" style="${footerLink}">Unsubscribe in one click</a>.`);
  if (postal) fine.push(esc(postal));

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>ACE DAT</title></head>
<body bgcolor="${COLORS.outer}" style="margin:0;padding:0;background:${COLORS.outer};background-color:${COLORS.outer};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${COLORS.outer}" style="background:${COLORS.outer};background-color:${COLORS.outer};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="${CARD_WIDTH}" cellpadding="0" cellspacing="0" style="width:100%;max-width:${CARD_WIDTH}px;border-collapse:separate;">
<tr><td bgcolor="${COLORS.green}" style="background:${COLORS.green};background-color:${COLORS.green};border-radius:10px 10px 0 0;padding:22px 28px;">
<img src="${LOGO_URL}" width="224" height="48" alt="ACE DAT" style="display:block;width:224px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;color:${COLORS.footerText};font:700 20px/48px Arial,Helvetica,sans-serif;letter-spacing:3px;">
</td></tr>
<tr><td bgcolor="${COLORS.body}" style="background:${COLORS.body};background-color:${COLORS.body};padding:28px 28px 12px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:${COLORS.text};">
${greeting ? p(esc(greeting)) : ''}
${bodyHtml}
<p style="margin:8px 0 16px;">${esc(signoff)}</p>
</td></tr>
<tr><td bgcolor="${COLORS.green}" style="background:${COLORS.green};background-color:${COLORS.green};border-radius:0 0 10px 10px;padding:22px 28px 24px;font-family:Arial,Helvetica,sans-serif;color:${COLORS.footerText};">
<p style="margin:0;font-size:16px;line-height:1.5;font-weight:700;color:${COLORS.gold};">${SIGNATURE_NAME}</p>
<p style="margin:2px 0 0;font-size:14px;line-height:1.5;color:${COLORS.footerText};">${SIGNATURE_TITLE}</p>
<p style="margin:2px 0 0;font-size:14px;line-height:1.5;"><a href="https://${SITE}" style="${footerLink}">${SITE}</a></p>
${fine.length ? `<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:${COLORS.footerText};">${fine.join('<br>')}</p>` : ''}
</td></tr>
</table>
</td></tr></table>
</body></html>
`;
  return { html, text: toText({ greeting, bodyHtml, signoff, fine: [reason, unsubUrl ? `Unsubscribe in one click: ${unsubUrl}` : '', postal].filter(Boolean) }) };
}

function stripTags(html) {
  return html
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (m, href, label) => {
      const l = label.replace(/<[^>]+>/g, '').trim();
      const h = href.replace(/&amp;/g, '&');
      return l === h ? h : `${l}: ${h}`;
    })
    .replace(/<\/(p|tr|table)>/g, '\n').replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function toText({ greeting, bodyHtml, signoff, fine }) {
  return [greeting, stripTags(bodyHtml), signoff, `${SIGNATURE_NAME}\n${SIGNATURE_TITLE}\n${SITE}`, fine.join('\n')]
    .filter(Boolean).join('\n\n');
}

// Fails on anything that is not this layout, or that carries the old one.
export function checkBrand(html) {
  const problems = [];
  const has = (s) => html.toLowerCase().includes(s.toLowerCase());
  for (const c of [COLORS.outer, COLORS.green, COLORS.body, COLORS.text, COLORS.footerText, COLORS.gold]) {
    if (!has(c)) problems.push(`missing brand colour ${c}`);
  }
  if (!html.includes(`width="${CARD_WIDTH}"`) || !html.includes(`max-width:${CARD_WIDTH}px`)) problems.push('card is not 560px');
  if (!html.includes(`src="${LOGO_URL}"`)) problems.push('logo is not the hosted ACE DAT logo');
  if (!/<img[^>]+src="https:\/\//.test(html)) problems.push('logo URL is not absolute https');
  if (!html.includes('font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6')) problems.push('body is not Arial 16px/1.6');
  if (!html.includes(SIGNATURE_TITLE)) problems.push('signature title missing');
  if (has('#0E1311')) problems.push('old header colour #0E1311');
  if (has('#c9a84c')) problems.push('old gold #c9a84c');
  if (/georgia/i.test(html)) problems.push('old Georgia font');
  if (/Founder, AceTheDAT/.test(html)) problems.push('old signature "Founder, AceTheDAT"');
  if (/>\s*AceTheDAT\s*</.test(html)) problems.push('old text header "AceTheDAT"');
  return problems;
}


// ---------------------------------------------------------------------
// The shared shell (ace-system/email/branded-shell.html): acedat-brand's own
// HTML with placeholders PREHEADER, GREETING, BODY_HTML, SIGNOFF, FINE_PRINT
// (the 12px paragraph inside the green footer) and QC_MARK.
export const BRANDED_SHELL = "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"color-scheme\" content=\"light\"><title>ACE DAT</title></head>\n<body bgcolor=\"#f5f0e8\" style=\"margin:0;padding:0;background:#f5f0e8;background-color:#f5f0e8;\">\n<span style=\"display:none;max-height:0;overflow:hidden;opacity:0;\">{{PREHEADER}}</span>\n<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" bgcolor=\"#f5f0e8\" style=\"background:#f5f0e8;background-color:#f5f0e8;\">\n<tr><td align=\"center\" style=\"padding:24px 12px;\">\n<table role=\"presentation\" width=\"560\" cellpadding=\"0\" cellspacing=\"0\" style=\"width:100%;max-width:560px;border-collapse:separate;\">\n<tr><td bgcolor=\"#1B3A2D\" style=\"background:#1B3A2D;background-color:#1B3A2D;border-radius:10px 10px 0 0;padding:22px 28px;\">\n<img src=\"https://acethedat.com/email/ace-dat-logo.png\" width=\"224\" height=\"48\" alt=\"ACE DAT\" style=\"display:block;width:224px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;color:#e9e4d8;font:700 20px/48px Arial,Helvetica,sans-serif;letter-spacing:3px;\">\n</td></tr>\n<tr><td bgcolor=\"#fffdf7\" style=\"background:#fffdf7;background-color:#fffdf7;padding:28px 28px 12px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#0d2018;\">\n<p style=\"margin:0 0 16px;\">{{GREETING}}</p>\n{{BODY_HTML}}\n<p style=\"margin:8px 0 16px;\">{{SIGNOFF}}</p>\n</td></tr>\n<tr><td bgcolor=\"#1B3A2D\" style=\"background:#1B3A2D;background-color:#1B3A2D;border-radius:0 0 10px 10px;padding:22px 28px 24px;font-family:Arial,Helvetica,sans-serif;color:#e9e4d8;\">\n<p style=\"margin:0;font-size:16px;line-height:1.5;font-weight:700;color:#E2C97A;\">Thomas Cordell</p>\n<p style=\"margin:2px 0 0;font-size:14px;line-height:1.5;color:#e9e4d8;\">Founder, ACE DAT. 510 AA, 99th percentile</p>\n<p style=\"margin:2px 0 0;font-size:14px;line-height:1.5;\"><a href=\"https://acethedat.com\" style=\"color:#e9e4d8;text-decoration:underline;\">acethedat.com</a></p>\n<p style=\"margin:16px 0 0;font-size:12px;line-height:1.5;color:#e9e4d8;\">{{FINE_PRINT}}</p>\n</td></tr>\n</table>\n</td></tr></table>\n{{QC_MARK}}\n</body></html>\n";
const FINE_PRINT_P = '\n<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#e9e4d8;">{{FINE_PRINT}}</p>';
export { LINK_STYLE };
export const FOOTER_LINK_STYLE = 'color:#e9e4d8;text-decoration:underline;';
export const FOOTER_TEXT = 'Thomas Cordell\n' + SIGNATURE_TITLE + '\nacethedat.com';

/** Fill the shell. fineHtml is trusted HTML for the footer fine print; "" drops that paragraph. */
export function fillShell({ preheader = '', greeting = '', bodyHtml, signoff = '', fineHtml = '' }) {
  const shell = fineHtml ? BRANDED_SHELL : BRANDED_SHELL.replace(FINE_PRINT_P, '');
  return shell
    .replace('{{PREHEADER}}', () => esc(preheader))
    .replace('{{GREETING}}', () => esc(greeting))
    .replace('{{BODY_HTML}}', () => bodyHtml)
    .replace('{{SIGNOFF}}', () => esc(signoff))
    .replace('{{FINE_PRINT}}', () => fineHtml)
    .replace('{{QC_MARK}}', () => '');
}

// The old look (text-only "AceTheDAT" bar in #0E1311 with letter-spaced gold
// #C9A84C, white Georgia card on #F4F1EA, "Founder, AceTheDAT", gold rule
// footer, dark-plate logo) must never go out again.
export const OLD_BRAND_MARKERS = [
  [/#0E1311/i, 'old near-black header colour #0E1311'], [/#C9A84C/i, 'old gold #C9A84C'], [/#F4F1EA/i, 'old page colour #F4F1EA'],
  [/#E4DCC8/i, 'old card border #E4DCC8'], [/Founder,\s*AceTheDAT/i, 'old signature "Founder, AceTheDAT"'],
  [/letter-spacing:\s*\d+px[^>]*>\s*AceTheDAT\s*</i, 'old letter-spaced "AceTheDAT" header text'], [/>\s*AceTheDAT\s*<\/div>/i, 'old text-only "AceTheDAT" header'],
  [/Georgia/i, 'old Georgia serif body'], [/ace-dat-lockup-reversed\.png/, 'old logo plate (dark-background PNG)'],
];
export function oldBrandProblems(html) { return OLD_BRAND_MARKERS.filter(([re]) => re.test(String(html || ''))).map(([, why]) => why); }
export function missingBrandPieces(html) { return checkBrand(String(html || '')).filter((x) => !/^old /.test(x)); }
