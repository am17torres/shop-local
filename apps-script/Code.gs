/**
 * Burnt Hills Local Marketplace — partner sign-up intake.
 *
 * Receives merchant and driver sign-ups from the static site (site/index.html
 * and site/drive.html) and appends each as a row to this spreadsheet.
 *
 * This script is meant to be BOUND to a Google Sheet: open the Sheet, then
 * Extensions -> Apps Script, paste this in, and Deploy as a Web app
 * (Execute as: Me, Who has access: Anyone). Full setup + the values to keep in
 * sync with the site live in docs/PARTNER_INTAKE.md.
 */

// Must match PARTNER_TOKEN in site/assets/app.js. A deterrent, not a wall.
var TOKEN = 'bh-partner-2026';

// Reject submissions filled faster than this (ms). Match MIN_FILL_MS in app.js.
var MIN_FILL_MS = 3000;

// Optional: paste your Cloudflare Turnstile SECRET key to require a passing
// challenge. Leave '' to keep Turnstile off. (Note: plain Apps Script can't read
// request headers, so an Origin/Referer check isn't possible here — Turnstile is
// the real server-verifiable wall when you need one.)
var TURNSTILE_SECRET = '';

// Optional: email to notify on each new sign-up. Leave '' for none.
var NOTIFY_EMAIL = '';

// Column order per kind. The first row of each tab should be these headers.
var COLUMNS = {
  // source/stage/fit are blank for inbound form sign-ups; the outbound sourcing
  // run fills them so prospects and real sign-ups share one pipeline tab.
  merchant: ['receivedAt', 'shopName', 'contactName', 'email', 'phone', 'address', 'sells', 'posSystem', 'page', 'website', 'source', 'stage', 'fit'],
  driver:   ['receivedAt', 'name', 'town', 'email', 'phone', 'vehicle', 'availability', 'licenseInsurance', 'notes', 'page'],
};
var TABS = { merchant: 'Merchants', driver: 'Drivers' };

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // --- cheap rejects: bad/missing token, or filled too fast ---
    if (body.token !== TOKEN) return json({ ok: false, error: 'forbidden' });
    if (typeof body.elapsedMs === 'number' && body.elapsedMs < MIN_FILL_MS) {
      return json({ ok: true }); // silent drop — don't reveal the check
    }
    if (TURNSTILE_SECRET && !verifyTurnstile_(body.turnstileToken)) {
      return json({ ok: true }); // silent drop
    }

    var kind = body.kind === 'driver' ? 'driver' : 'merchant';

    var errors = validate_(kind, body);
    if (errors.length) return json({ ok: false, error: errors.join('; ') });

    // --- dedup: same email (or shop/name when email is absent) + kind within
    // 60s (double-submit / retry storms; lets bulk prospect loads through) ---
    var cache = CacheService.getScriptCache();
    var dkey = String(body.email || '').toLowerCase()
      || String(body.shopName || body.name || '').toLowerCase();
    var dk = 'dedup:' + kind + ':' + dkey;
    if (dkey && cache.get(dk)) return json({ ok: true });
    if (dkey) cache.put(dk, '1', 60);

    appendRow_(kind, body);
    notify_(kind, body);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, service: 'bh-partner-intake' }); // health check
}

/** Abuse filtering. Returns an array of error strings (empty = accepted).
 *
 * Required-field presence, email format, and the driver license/insurance
 * attestation are enforced CLIENT-SIDE (HTML `required` + type="email" +
 * reportValidity in site/assets/app.js). The server intentionally keeps every
 * field optional so the outbound sourcing run can load prospect rows that lack
 * an email/contact. What stays here are the abuse filters that don't depend on
 * a real browser. NOTE: relaxing the server widens the spam surface — a direct
 * POST with the page token can now append a near-empty row; escalate to
 * Turnstile (see docs/PARTNER_INTAKE.md) if that gets abused. */
function validate_(kind, b) {
  var errs = [];

  // length caps — keep junk and oversized payloads out of the sheet
  Object.keys(b).forEach(function (k) {
    if (typeof b[k] === 'string' && b[k].length > 500) errs.push('too long: ' + k);
  });

  // links in a name field are a strong spam signal
  ['name', 'contactName', 'shopName'].forEach(function (f) {
    if (b[f] && /https?:\/\//i.test(String(b[f]))) errs.push('link in ' + f);
  });

  return errs;
}

function appendRow_(kind, b) {
  var ss = SpreadsheetApp.getActive();
  var name = TABS[kind];
  var sheet = ss.getSheetByName(name);
  var cols = COLUMNS[kind];
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(cols); // header row
  }
  var now = Utilities.formatDate(new Date(), ss.getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  var row = cols.map(function (c) {
    if (c === 'receivedAt') return now;
    if (c === 'stage' && !b[c]) return 'inbound';
    if (c === 'fit' && !b[c]) return 'pending';
    return b[c] != null ? String(b[c]) : '';
  });
  sheet.appendRow(row);
}

function notify_(kind, b) {
  if (!NOTIFY_EMAIL) return;
  var who = kind === 'driver' ? (b.name || 'A driver') : (b.shopName || 'A shop');
  MailApp.sendEmail(
    NOTIFY_EMAIL,
    'New ' + kind + ' sign-up: ' + who,
    JSON.stringify(b, null, 2)
  );
}

/** Verify a Cloudflare Turnstile token server-side. */
function verifyTurnstile_(token) {
  if (!token) return false;
  try {
    var res = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'post',
      payload: { secret: TURNSTILE_SECRET, response: token },
      muteHttpExceptions: true,
    });
    return !!JSON.parse(res.getContentText()).success;
  } catch (err) {
    return false;
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
