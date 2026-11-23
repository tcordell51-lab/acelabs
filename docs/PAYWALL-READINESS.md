# Ace Labs paywall readiness (nothing switched on)

Date: 2026-11-16. Written for Thomas. Nothing here is live, and no Stripe key, product, Payment
Link or function was created. `docs/` is blocked from being served.

**Update 2026-11-21: superseded.** The accounts and pass build (branch `feat/accounts-pass`,
behind `ACE_LABS_ACCOUNTS`, off by default) replaced this plan. Thomas's final decisions: the
pass is **$249, one payment, 90 days, no auto-renew** (not $349). Included free: coaching
students with Students Status Active, Inactive or DAT complete, and crash course buyers for 90
days from purchase. Still open: refund rule, free sample size, which coach email gets notices.

## The pattern that already exists (PAT Lab)

`ace-pat-lab` has a working, test-mode-only paywall. Ace Labs can reuse it as is:

1. **Checkout.** A Stripe Payment Link. Its success URL sends the buyer back with
   `?session_id={CHECKOUT_SESSION_ID}`.
2. **Verify.** `netlify/functions/verify-checkout.mjs` fetches that Checkout Session from Stripe
   with the secret key, requires `payment_status = paid` and `status = complete`, optionally
   requires the session to come from one named Payment Link (`STRIPE_PAYMENT_LINK_ID`), and reads
   the buyer's email. A live key is refused unless `STRIPE_ALLOW_LIVE=yes`.
3. **Token.** `netlify/lib/token.mjs` issues `v2.<email>.<expiry>.<kind>.<HMAC-SHA256>`, signed with
   `ENTITLEMENT_SECRET`, for 90 days. `verify(token, email)` checks the signature in constant time,
   the expiry and the email.
4. **Record.** The function marks the lead in Airtable Leads (tier and a line in Details).
5. **Browser.** The page keeps the token and sends it with each request for paid content.

## What Ace Labs would need for the $349 90-day pass

| Step | Work | Notes |
|---|---|---|
| 1 | Copy `verify-checkout.mjs`, `lib/token.mjs`, `lib/http.mjs`, `lib/airtable.mjs` into `netlify/functions/` | Change the token kind to `acelabs-pass` and the Airtable field it writes |
| 2 | A Payment Link for the pass (test mode first) and a thank-you page that calls verify-checkout | The buyer returns with `session_id`; the page stores the token |
| 3 | **Move paid content out of public static files.** | This is the real work. Today every bank ships as a public file (`games/*.json`, `shared/dat-mock-tests.js`, `data/*.json`) and anyone can download it. A paywall only holds if paid banks are served by a function after `verify()`, for example `/.netlify/functions/bank?name=full-mocks` with the token in a header |
| 4 | A small client helper, `shared/ace-pass.js`: has a valid token? then fetch paid banks through the function; if not, show the free tier and one upgrade line | Student pages carry no prices; the upgrade line links to acethedat.com, where pricing lives |
| 5 | Repair, Progress and the answer log stay free and local; with a token they can also sync to the student's record | One account for the portal and Ace Labs is a later step (the Ace Engine Supabase schema is ready) |
| 6 | Make the repo private before any paid content is added (Thomas is flipping it) | Private hides source and history, not files the site serves |

A first cut that would hold: the four full-length mocks, the three Prometric-style practice tests
and the Climb rungs above tier 1 behind the function; the labs, the hubs' daily sets, the
diagnostic, Repair and Progress free.

## Decisions only Thomas can make

1. **Free and paid line.** Which tools stay free (suggested above) and which need the pass.
2. **Price and term.** $349 for 90 days as planned; whether a 180-day tier exists; renewal price.
3. **Who gets it included.** Coaching students, crash course buyers (for how long), upgrade credit.
4. **Refund wording.** Reuse the crash course rule or write a new one.
5. **Where it is sold.** A pricing section on acethedat.com (recommended, keeps money language
   off student pages) versus a checkout inside Ace Labs.
6. **Which question banks a buyer gets.** The 4,140-item private ace-bank set is AI-checked only;
   your rule is that you review the exact questions. A paid launch either waits for that review
   or ships only banks you have signed off on.
7. **Account model.** Email plus token per device for now (PAT Lab's model), or wait for one
   account across the portal and Ace Labs.
8. **Mailing address and sender** for receipts and the welcome email (CAN-SPAM), always ACE DAT
   branded.
9. **Live switch.** `STRIPE_ALLOW_LIVE=yes` and the live key go in only on your explicit yes.

## What was not done tonight, on purpose

No function, Payment Link, product, price or environment variable was created, and no page
mentions a price. This document is the whole deliverable for the paywall step.
