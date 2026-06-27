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
  merchant: ['receivedAt', 'shopName', 'contactName', 'email', 'phone', 'address', 'sells', 'posSystem', 'page'],
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

    // --- dedup: same email + kind within 60s (double-submit / retry storms) ---
    var cache = CacheService.getScriptCache();
    var dk = 'dedup:' + kind + ':' + String(body.email || '').toLowerCase();
    if (cache.get(dk)) return json({ ok: true });
    cache.put(dk, '1', 60);

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

/** Field validation. Returns an array of error strings (empty = valid). */
function validate_(kind, b) {
  var errs = [];
  var required = kind === 'driver'
    ? ['name', 'email', 'phone', 'town']
    : ['shopName', 'contactName', 'email', 'phone', 'address', 'sells'];

  required.forEach(function (f) {
    if (!String(b[f] || '').trim()) errs.push('missing ' + f);
  });

  if (b.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(b.email))) errs.push('bad email');

  // length caps — keep junk and oversized payloads out of the sheet
  Object.keys(b).forEach(function (k) {
    if (typeof b[k] === 'string' && b[k].length > 500) errs.push('too long: ' + k);
  });

  // links in a name field are a strong spam signal
  ['name', 'contactName', 'shopName'].forEach(function (f) {
    if (b[f] && /https?:\/\//i.test(String(b[f]))) errs.push('link in ' + f);
  });

  // drivers must attest to license + insurance
  if (kind === 'driver' && String(b.licenseInsurance || '').toLowerCase() !== 'yes') {
    errs.push('missing licenseInsurance');
  }
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
