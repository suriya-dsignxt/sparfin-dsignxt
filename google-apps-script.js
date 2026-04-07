// ── SETUP INSTRUCTIONS ──────────────────────────────────────────────────
// 1. In your Google Sheet (sparfin_forms_sheet), go to "Extensions" > "Apps Script".
// 2. Delete any existing code in the editor and PASTE THIS ENTIRE FILE.
// 3. Click the "Deploy" button (top right) > "New deployment".
// 4. Select Type: "Web App".
// 5. Description: "Sparfin Lead Form Handler".
// 6. Execute as: "Me" (your email).
// 7. Who has access: "Anyone" (Required for the website to send data).
// 8. Click "Deploy". You'll get a "Web App URL" (ends in /exec).
// 9. COPY that URL and paste it into assets/js/script.js.

// ── Configuration ──────────────────────────────────────────────────────
var NOTIFICATION_EMAIL = 'ceo@fenzo.co, suriya@dsignxt.com'; // ← Change this to your preferred emails
var SHEET_NAME_LEADS = 'Website Leads'; // The name of the tab in your Google Sheet

// ── Handle POST requests ───────────────────────────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var timestamp = new Date();

    // ── Append to Sheet ─────────────────────────────────────────
    var sheet = ss.getSheetByName(SHEET_NAME_LEADS);

    // Create the sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME_LEADS);
      // Add headers
      sheet.appendRow([
        'Timestamp', 'Full Name', 'Phone Number', 'City', 'Employment Type',
        'Loan Type', 'Loan Amount', 'Property Type',
        'Process Stage', 'Contact Preference', 'Notes'
      ]);
      sheet.getRange("A1:K1").setFontWeight("bold");
    }

    sheet.appendRow([
      timestamp,
      data.fname || '-',
      data.phone || '-',
      data.city || 'N/A',
      data.employment || 'N/A',
      data.loanType || 'N/A',
      data.loanAmount || 'N/A',
      data.propType || 'N/A',
      data.stage || 'N/A',
      data.prefContact || 'N/A',
      data.notes || '-'
    ]);

    // ── Send Email Notification ────────────────────────────────────────
    var subject = '🏦 New Sparfin Lead: ' + (data.fname || 'Unknown');
    var body = 'New loan enquiry received from the websites!\n\n'
      + '👤 Contact Details:\n'
      + '-------------------\n'
      + 'Name: ' + (data.fname || '-') + '\n'
      + 'Phone: ' + (data.phone || '-') + '\n'
      + 'City: ' + (data.city || '-') + '\n'
      + 'Employment: ' + (data.employment || '-') + '\n\n'
      + '💰 Loan Details:\n'
      + '-------------------\n'
      + 'Loan Type: ' + (data.loanType || '-') + '\n'
      + 'Amount: ' + (data.loanAmount || '-') + '\n'
      + 'Property Type: ' + (data.propType || '-') + '\n\n'
      + '📍 Status & Preference:\n'
      + '-------------------\n'
      + 'Current Stage: ' + (data.stage || '-') + '\n'
      + 'Contact Pref: ' + (data.prefContact || '-') + '\n\n'
      + '📝 Notes:\n'
      + (data.notes || '-') + '\n\n'
      + '🕒 Submitted: ' + timestamp.toLocaleString('en-IN');

    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      body: body
    });

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Handle GET requests ───────────────────────────────────────────────
function doGet(e) {
  return ContentService.createTextOutput('Sparfin form handler is running.');
}
