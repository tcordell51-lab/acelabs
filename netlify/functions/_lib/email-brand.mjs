// =====================================================================
// The ONE allowed ACE DAT email branding (Thomas, 2026-11-16).
// Every email Ace Labs sends is built from BRANDED_SHELL below, a verbatim copy
// of ace-system/email/branded-shell.html. It uses only these values:
//   page #f5f0e8 (cream), card 560px wide
//   header cell #1B3A2D, padding 20px 28px, radius 12px 12px 0 0, ACE DAT logo
//   body cell #fffdf7, Arial/Helvetica 16px/1.6, text #0d2018
//   footer cell #1B3A2D, radius 0 0 12px 12px, 13px Arial, text #e9e4d8,
//   signature FOOTER_HTML below
//   legal and unsubscribe lines below the card in small grey text
// The old look (text-only "AceTheDAT" header bar in #0E1311 with letter-spaced
// gold #C9A84C, white Georgia card on #F4F1EA, "Thomas Cordell / Founder,
// AceTheDAT" signature, gold rule footer) must never go out again:
// oldBrandProblems() names any trace of it; tests/email/brand.test.mjs runs it
// over every email this site sends.
// =====================================================================

export const BRAND = Object.freeze({
  page: '#f5f0e8',
  card: '#fffdf7',
  green: '#1B3A2D',
  gold: '#E2C97A',
  ink: '#0d2018',
  footerInk: '#e9e4d8',
  fine: '#646a66', // legal lines under the card: 5.0:1 on the cream page
  line: '#e4ddcc', // hairlines inside the body (tables, boxes)
  width: 560,
  // Hosted copy of the canonical logo PNG (sha256 21ab4452...bc27f), served
  // from this site's root: ace-dat-lockup-reversed.png, 561 x 120, shown at
  // 187 x 40 so it stays crisp on 3x screens.
  logoUrl: 'https://acethedat.com/ace-dat-lockup-reversed.png',
  logoWidth: 187,
  logoHeight: 40,
});

// Body links and the button. Green on the cream card is 11:1.
export const LINK_STYLE = 'color:#1B3A2D;text-decoration:underline;';

// The footer signature, word for word from the brand spec.
export const FOOTER_HTML = '<strong style="color:#E2C97A;">Thomas Cordell</strong><br>Founder, ACE DAT. 510 AA, 99th percentile<br><a style="color:#E2C97A;" href="https://acethedat.com">acethedat.com</a>';
export const FOOTER_TEXT = 'Thomas Cordell\nFounder, ACE DAT. 510 AA, 99th percentile\nacethedat.com';

// Any one of these in a client email means the old branding leaked back in.
export const OLD_BRAND_MARKERS = Object.freeze([
  [/#0E1311/i, 'old near-black header colour #0E1311'],
  [/rgb\(\s*14,\s*19,\s*17\s*\)/i, 'old near-black header colour rgb(14,19,17)'],
  [/#C9A84C/i, 'old gold #C9A84C'],
  [/#F4F1EA/i, 'old page colour #F4F1EA'],
  [/#E4DCC8/i, 'old card border #E4DCC8'],
  [/Founder,\s*AceTheDAT/i, 'old signature "Founder, AceTheDAT"'],
  [/letter-spacing:\s*\d+px[^>]*>\s*AceTheDAT\s*</i, 'old letter-spaced "AceTheDAT" header text'],
  [/>\s*AceTheDAT\s*<\/div>/i, 'old text-only "AceTheDAT" header'],
  [/Georgia/i, 'old Georgia serif body'],
  [/border-top:\s*2px solid #C9A84C/i, 'old gold rule footer'],
]);

/** Every old-brand marker found in an email's HTML (empty when clean). */
export function oldBrandProblems(html) {
  const s = String(html || '');
  return OLD_BRAND_MARKERS.filter(([re]) => re.test(s)).map(([, why]) => why);
}

/** The canonical pieces a branded email must carry (empty when complete). */
export function missingBrandPieces(html) {
  const s = String(html || '');
  const need = [
    [/bgcolor="#f5f0e8"/i, 'cream page #f5f0e8'],
    [/width="560"/, '560px card'],
    [/<td bgcolor="#1B3A2D"[^>]*border-radius:12px 12px 0 0/i, 'green #1B3A2D header cell'],
    [/<img [^>]*alt="ACE DAT"/, 'ACE DAT logo'],
    [/bgcolor="#fffdf7"/i, 'body cell #fffdf7'],
    [/<td bgcolor="#1B3A2D"[^>]*border-radius:0 0 12px 12px/i, 'green #1B3A2D footer cell'],
  ];
  const missing = need.filter(([re]) => !re.test(s)).map(([, why]) => why);
  if (!s.includes(FOOTER_HTML)) missing.push('footer signature');
  return missing;
}


// The canonical ACE DAT client email shell. Placeholders: PREHEADER, GREETING,
// BODY_HTML, SIGNOFF, QC_MARK. The grey line under the card is the portal line.
export const BRANDED_SHELL = "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"color-scheme\" content=\"light only\"><meta name=\"supported-color-schemes\" content=\"light only\"><title>ACE DAT</title></head>\n<body bgcolor=\"#f5f0e8\" style=\"margin:0;padding:0;background:#f5f0e8;background-color:#f5f0e8;\">\n<span style=\"display:none;max-height:0;overflow:hidden;opacity:0;\">{{PREHEADER}}</span>\n<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" bgcolor=\"#f5f0e8\" style=\"background:#f5f0e8;background-color:#f5f0e8;\">\n<tr><td align=\"center\" style=\"padding:28px 12px;\">\n<table role=\"presentation\" width=\"560\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:100%;max-width:560px;\">\n<tr><td bgcolor=\"#1B3A2D\" style=\"background:#1B3A2D;background-color:#1B3A2D;padding:20px 28px;border-radius:12px 12px 0 0;\">\n<img src=\"https://acethedat.com/ace-dat-lockup-reversed.png\" width=\"187\" height=\"40\" alt=\"ACE DAT\" style=\"display:block;width:187px;height:40px;border:0;outline:none;text-decoration:none;color:#E2C97A;font:700 18px/40px Arial,Helvetica,sans-serif;\">\n</td></tr>\n<tr><td bgcolor=\"#fffdf7\" style=\"background:#fffdf7;background-color:#fffdf7;padding:28px 28px 12px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#0d2018;\">\n<p style=\"margin:0 0 16px;\">{{GREETING}}</p>\n{{BODY_HTML}}\n<p style=\"margin:22px 0 16px;\">{{SIGNOFF}}</p>\n</td></tr>\n<tr><td bgcolor=\"#1B3A2D\" style=\"background:#1B3A2D;background-color:#1B3A2D;padding:20px 28px;border-radius:0 0 12px 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#e9e4d8;\"><strong style=\"color:#E2C97A;\">Thomas Cordell</strong><br>Founder, ACE DAT. 510 AA, 99th percentile<br><a style=\"color:#E2C97A;\" href=\"https://acethedat.com\">acethedat.com</a></td></tr>\n</table>\n<table role=\"presentation\" width=\"560\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:100%;max-width:560px;\">\n<tr><td style=\"padding:16px 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#646a66;\">Your plan, recaps and recordings live in your portal: <a href=\"https://acethedat-portal.netlify.app\" style=\"color:#1B3A2D;text-decoration:underline;\">acethedat-portal.netlify.app</a></td></tr>\n</table>\n</td></tr></table>\n{{QC_MARK}}\n</body></html>\n";

const escHtml = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * One email on the ACE DAT shell.
 * @param {{ preheader: string, greeting: string, bodyHtml: string, signoff: string, underCard?: string }} e
 *   underCard replaces the grey portal line under the card (plain text, escaped); "" removes it.
 */
export function brandedHtml({ preheader, greeting, bodyHtml, signoff, underCard = "" }) {
  const portal = /Your plan, recaps and recordings live in your portal: <a [^>]*>[^<]*<\/a>/;
  return BRANDED_SHELL
    .replace("{{PREHEADER}}", () => escHtml(preheader))
    .replace("{{GREETING}}", () => escHtml(greeting))
    .replace("{{BODY_HTML}}", () => bodyHtml)
    .replace("{{SIGNOFF}}", () => escHtml(signoff))
    .replace("{{QC_MARK}}", () => "")
    .replace(portal, () => escHtml(underCard));
}
