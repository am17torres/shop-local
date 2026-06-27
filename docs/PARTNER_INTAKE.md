# Partner Intake (merchant & driver sign-ups)

How prospective **merchants** and **drivers** tell us they're interested, where
that data lands, and how we keep the public endpoint from filling with bot spam.

This doc lives in the repo but is **not** part of the deployed site (`site/` is
the only thing published to GitHub Pages), so it's the right place for the
anti-abuse details we don't want to advertise in page source.

## The shape of the problem

The marketplace site is **100% static** (GitHub Pages). A static page can't
process a form server-side, so the two sign-up forms POST to an external
endpoint from the browser:

- **Merchant** form — the `#join` section of [`site/index.html`](../site/index.html).
- **Driver** form — the `#apply` section of [`site/drive.html`](../site/drive.html).

Both are wired by `wirePartnerForms()` in
[`site/assets/app.js`](../site/assets/app.js), which POSTs JSON to a **Google
Apps Script web app** that appends a row to a **Google Sheet**. That combination
is free, has no submission cap that matters at our scale (≈1,000 merchants +
≈1,000 drivers is far under Apps Script's daily quotas), and leaves the data in a
spreadsheet anyone on the team can filter, export, or share.

```text
Browser form  ──POST JSON──▶  Apps Script /exec  ──append row──▶  Google Sheet
 (static site)                (validate + filter)                 (Merchants / Drivers tabs)
```

## One-time setup

1. Create **one** Google Sheet (e.g. "BH Partner Sign-ups"). You don't add any
   tabs by hand — the script creates a **Merchants** tab and a **Drivers** tab
   (with header rows) inside this one spreadsheet the first time each kind of
   sign-up arrives.
2. In that Sheet: **Extensions → Apps Script**. Delete the stub and paste
   [`apps-script/Code.gs`](../apps-script/Code.gs). Save.
3. **Deploy → New deployment → Web app.** Set *Execute as* **Me** and *Who has
   access* **Anyone**. Authorize when prompted. Copy the **/exec** URL.
4. Paste that URL into `PARTNER_ENDPOINT` in
   [`site/assets/app.js`](../site/assets/app.js) and commit. Until it's set, the
   forms show a friendly "sign-ups open soon" note instead of failing.
5. (Optional) Set `NOTIFY_EMAIL` in `Code.gs` to get an email on each sign-up.

Re-deploy the Apps Script (new version) whenever you edit `Code.gs`.

### Permissions: scope it to this one sheet

By default Apps Script grants access based on what the code touches. Two things
keep this script's reach to **only the spreadsheet it's attached to**:

1. **It's a bound script using `SpreadsheetApp.getActive()`.** Because you create
   it from inside the Sheet (Extensions → Apps Script) and it never calls
   `openById`, it qualifies for the narrow
   `…/auth/spreadsheets.currentonly` scope — write access to *this* spreadsheet
   only, not your whole Drive. Creating a standalone script and using `openById`
   would instead grant access to **every** spreadsheet you own — don't.
2. **An explicit manifest pins the scope.** Paste
   [`apps-script/appsscript.json`](../apps-script/appsscript.json) into the
   manifest (Project Settings → tick *Show "appsscript.json" manifest file in
   editor*). It lists exactly one OAuth scope, so the authorization prompt asks
   for nothing more, and scope can't creep as the code changes.

When you authorize, the consent screen should list **only** "see, edit, create,
and delete *this* spreadsheet." If it asks for all spreadsheets, Drive, or
Gmail, stop — something's off (likely an `openById` call or a leftover scope).
You can review or revoke the grant anytime at
[myaccount.google.com → Security → Third-party access](https://myaccount.google.com/connections).

Two optional features need broader scopes — add them **only if** you turn the
feature on, and re-authorize:

| Feature | Set in `Code.gs` | Add to `oauthScopes` |
| --- | --- | --- |
| Email notifications | `NOTIFY_EMAIL` | `https://www.googleapis.com/auth/script.send_mail` |
| Turnstile verification | `TURNSTILE_SECRET` | `https://www.googleapis.com/auth/script.external_request` |

While both are left blank (the default), those code paths never run, so the
extra scopes are neither requested nor needed.

> **Deploy settings ≠ data permissions.** "Who has access: Anyone" controls who
> can *call* the web app; "Execute as: Me" means it runs with *your*
> authorization. Neither widens what the script can touch — the OAuth scopes
> above are what bound that. "Anyone" is required so the public form can POST,
> and is safe because the script validates every request.

### Values that must stay in sync

| Setting | `site/assets/app.js` | `apps-script/Code.gs` |
| --- | --- | --- |
| Shared page token | `PARTNER_TOKEN` | `TOKEN` |
| Minimum fill time | `MIN_FILL_MS` | `MIN_FILL_MS` |

If you change one, change the other, or every submission gets rejected.

## What we collect

| Merchant | Driver |
| --- | --- |
| Shop name | Full name |
| Contact name | Town / area |
| Email | Email |
| Mobile phone | Mobile phone |
| Shop address | Vehicle type |
| What they sell | Availability windows |
| POS / inventory system (tier) | License + insurance attestation |
| | Notes |

Phone is required for both because the order-confirmation flow is SMS-based
(merchant story **M6** in [`PERSONAS.md`](PERSONAS.md)). The merchant POS answer
maps directly to the inventory tier in
[`INVENTORY_MODEL.md`](INVENTORY_MODEL.md).

## Keeping spam out (defense in depth)

The endpoint is public, so it will get hit by bots. We layer cheap, free
defenses; each is independently bypassable, but together they stop the bulk of
automated junk. The first two are invisible to real users.

1. **Honeypot field** — a hidden input real users never see. If it arrives
   filled, the submission is dropped. (The site renames the hook and omits any
   labelling comment so the trap isn't obvious in page source.)
2. **Time-trap** — the form stamps when it rendered; submissions that arrive
   faster than `MIN_FILL_MS` are dropped. Bots submit instantly; people don't.
3. **Shared page token** — embedded in the page and required by the script. It's
   visible in source (so it's a *deterrent*, not a wall), but it stops generic
   spray that POSTs straight at the URL without loading the page.
4. **Server-side validation** — required fields, email shape, length caps, and a
   reject for links pasted into name fields. Malformed payloads never reach the
   sheet.
5. **Dedup** — identical `email + kind` within 60s is dropped, killing
   double-submits and retry storms.

Dropped submissions are returned as a *success* to the client so we never reveal
which check tripped.

> **Note:** plain Apps Script can't read request headers, so an Origin/Referer
> check isn't available server-side. The token covers casual direct hits; for a
> real wall, turn on Turnstile (below).

### Escalation: Cloudflare Turnstile (free, near-invisible)

If spam gets through layers 1–5, switch on **Cloudflare Turnstile** — a free,
privacy-friendly CAPTCHA alternative that *is* verifiable server-side. It's
pre-wired so enabling it is config, not a rebuild:

1. Create a free Turnstile site at <https://dash.cloudflare.com/> → get a
   **site key** (public) and a **secret key**.
2. Add the Turnstile widget script + a `<div class="cf-turnstile" ...>` with your
   site key to each form, and include the resulting token as `turnstileToken` in
   the submitted payload.
3. Paste the **secret key** into `TURNSTILE_SECRET` in `Code.gs` and re-deploy.
   The script then verifies every submission against Cloudflare and silently
   drops any that fail.

## Why not the alternatives

| Option | Why not (for this scale, for free) |
| --- | --- |
| Formspree / Netlify Forms | Free tiers cap at ~50–100 submissions/month — far below ~2,000. |
| Airtable Forms | Free base caps at 1,000 records; 2,000 total would overflow. |
| Tally.so / Google Forms | Both work and are unlimited-free, but the form is an off-brand iframe rather than native on-site markup. Good fallbacks if we ever want zero code. |

## Testing

The Playwright specs ([`tests/merchant-signup.spec.js`](../tests/merchant-signup.spec.js)
and [`tests/driver-signup.spec.js`](../tests/driver-signup.spec.js)) stub the
network (`page.route`) and override the endpoint + time-trap on `window`, so they
exercise validation, the honeypot silent-drop, and the success state without ever
calling the live Apps Script.
