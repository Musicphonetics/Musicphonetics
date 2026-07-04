/**
 * Musicphonetics — Payments sheet write-back (Google Apps Script)
 *
 * SETUP (once):
 * 1. Open script.google.com → New project → paste this file.
 * 2. Set SHEET_ID below to your Google Sheet's id.
 * 3. Deploy → New deployment → Web app → Execute as: Me · Access: Anyone.
 * 4. Copy the /exec URL → set it as APPS_SCRIPT_URL in Cloudflare Pages env.
 *
 * What it does on every verified PAYMENT_SUCCESS webhook:
 *  - Appends a row to the "Payments" tab (creates the tab + header if missing)
 *  - IDEMPOTENT: skips if that Payment ID has already been written
 *  - Finds the matching row in "Leads" by phone and sets Payment Status = "Paid"
 */
var SHEET_ID = "PASTE_GOOGLE_SHEET_ID";

var PAYMENTS_HEADER = [
  "Payment ID", "Date", "Student/Lead", "Phone", "Package",
  "Amount", "Mode", "Payment Status", "Invoice/Link", "Notes",
];

function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.openById(SHEET_ID);

  var payments = ss.getSheetByName("Payments");
  if (!payments) {
    payments = ss.insertSheet("Payments");
    payments.appendRow(PAYMENTS_HEADER);
  }

  // Idempotency — one row per Cashfree payment id, even if the webhook retries.
  if (d.paymentId) {
    var ids = payments.getRange(1, 1, payments.getLastRow() || 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(d.paymentId)) {
        return ContentService.createTextOutput(JSON.stringify({ success: true, duplicate: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
  }

  payments.appendRow([
    d.paymentId || "", d.date || new Date(), d.student || "", "'" + (d.phone || ""),
    d.package || "", d.amount || "", d.mode || "Cashfree",
    d.paymentStatus || "Paid", d.invoice || "", d.notes || "",
  ]);

  // Flip the matching lead to Paid (match by last-10-digit phone).
  var leads = ss.getSheetByName("Leads");
  if (leads && d.phone) {
    var values = leads.getDataRange().getValues();
    var header = values[0] || [];
    var phoneCol = -1, statusCol = -1;
    for (var c = 0; c < header.length; c++) {
      var h = String(header[c]).toLowerCase();
      if (phoneCol < 0 && h.indexOf("phone") >= 0) phoneCol = c;
      if (statusCol < 0 && h.indexOf("payment") >= 0 && h.indexOf("status") >= 0) statusCol = c;
    }
    if (phoneCol >= 0 && statusCol >= 0) {
      var want = String(d.phone).replace(/\D/g, "").slice(-10);
      for (var r = 1; r < values.length; r++) {
        var have = String(values[r][phoneCol]).replace(/\D/g, "").slice(-10);
        if (have && have === want) {
          leads.getRange(r + 1, statusCol + 1).setValue("Paid");
          break;
        }
      }
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
