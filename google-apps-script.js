// ── SETUP INSTRUCTIONS ──────────────────────────────────────────────────
// 1. In your Google Sheet (sparfin_forms_sheet), go to "Extensions" > "Apps Script".
// 2. Delete any existing code in the editor and PASTE THIS ENTIRE FILE.
// 3. Click "Save" (disk icon).
// 4. Click the "Deploy" button (top right) > "New deployment".
// 5. Select Type: "Web App".
// 6. Description: "Sparfin Lead Form Handler v2".
// 7. Execute as: "Me" (your email).
// 8. Who has access: "Anyone" (CRITICAL: Required for the website to send data).
// 9. Click "Deploy". You'll get a "Web App URL" (ends in /exec).
// 10. COPY that URL and paste it into assets/js/script.js.

// ── Configuration ──────────────────────────────────────────────────────
var NOTIFICATION_EMAIL = 'ceo@fenzo.co, suriya@dsignxt.com';
var SHEET_NAME_LEADS = 'Website Leads';

/**
 * GET Request Handler (for testing)
 * Visit the Web App URL in your browser to see if the script is alive.
 */
function doGet() {
  return ContentService.createTextOutput("SPARFIN Script is ACTIVE! (v2.0)").setMimeType(ContentService.MimeType.TEXT);
}

/**
 * POST Request Handler (main entry point)
 */
function doPost(e) {
  try {
    // 1. Parse JSON data from the request
    var data = JSON.parse(e.postData.contents);
    
    // 2. Open the active spreadsheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME_LEADS);
    
    // 3. If the "Website Leads" sheet doesn't exist, create it with headers
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME_LEADS);
      sheet.appendRow([
        'Timestamp', 'Full Name', 'Phone', 'City', 'Employment', 
        'Loan Type', 'Loan Amount', 'Property Type', 'Stage', 
        'Preference', 'Notes', 'Source'
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#f3f3f3');
    }
    
    // 4. Prepare row data
    var row = [
      new Date(),
      data.fname || 'N/A',
      data.phone || 'N/A',
      data.city || 'N/A',
      data.employment || 'N/A',
      data.loanType || 'N/A',
      data.loanAmount || 'N/A',
      data.propType || 'N/A',
      data.stage || 'N/A',
      data.prefContact || 'N/A',
      data.notes || 'N/A',
      data.source || 'Website'
    ];
    
    // 5. Append to sheet
    sheet.appendRow(row);
    
    // 6. Send Email Notification
    sendLeadEmail(data);
    
    // 7. Return success response
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    // Log error to console (visible in Apps Script Executions)
    console.error('Script Error:', error.toString());
    
    // Return error message for visual debugging in website console
    return ContentService.createTextOutput("Error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Email Helper Function
 */
function sendLeadEmail(data) {
  var subject = 'New Website LEAD: ' + (data.fname || 'Prospect');
  
  var body = 'You have a new enquiry from Sparfin Services:\n\n' +
             '----------------------------------\n' +
             'Name: ' + data.fname + '\n' +
             'Phone: ' + data.phone + '\n' +
             'City: ' + data.city + '\n' +
             'Employment: ' + data.employment + '\n' +
             'Loan Type: ' + data.loanType + '\n' +
             'Loan Amount: ' + data.loanAmount + '\n' +
             'Property Type: ' + (data.propType || 'N/A') + '\n' +
             'Current Stage: ' + data.stage + '\n' +
             'Pref. Contact: ' + data.prefContact + '\n' +
             'Notes: ' + (data.notes || 'No extra notes') + '\n' +
             '----------------------------------\n\n' +
             'Sent from Sparfin Lead Automation Handler.';

  try {
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      body: body
    });
  } catch (e) {
    console.error('Email failed: ' + e.message);
  }
}
