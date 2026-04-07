// ── SETUP INSTRUCTIONS ──────────────────────────────────────────────────
// 1. In your Google Sheet (sparfin_forms_sheet), go to "Extensions" > "Apps Script".
// 2. Delete any existing code in the editor and PASTE THIS ENTIRE FILE.
// 3. Click "Save" (disk icon).
// 4. CRITICAL: Select 'manualTest' from the function dropdown at the top 
//    and click "Run". This will trigger the "Review Permissions" popup. 
//    Follow the prompts to ALLOW access to your Sheet and Gmail.
// 5. Click the "Deploy" button (top right) > "New deployment".
// 6. Select Type: "Web App". Description: "Sparfin Lead v3". 
//    Execute as: "Me". Who has access: "Anyone".
// 7. Click "Deploy". COPY the new Web App URL to assets/js/script.js.

// ── Configuration ──────────────────────────────────────────────────────
var NOTIFICATION_EMAIL = 'ceo@fenzo.co, suriya@dsignxt.com';
var SHEET_NAME_LEADS = 'Website Leads';

/**
 * MANUAL TEST FUNCTION (Run this once manually in the editor)
 * Use this to authorize the script and verify everything works!
 */
function manualTest() {
  var testData = {
    fname: "Test User",
    phone: "9999999999",
    city: "Chennai (Test)",
    employment: "Salaried",
    loanType: "Home Loan",
    loanAmount: "50 Lakhs",
    propType: "Flat",
    stage: "Exploring",
    prefContact: "WhatsApp",
    notes: "Testing the script v3",
    source: "Manual Test"
  };
  
  Logger.log("Starting manual test...");
  var result = processLead(testData);
  Logger.log("Result: " + result);
  
  if (result === "Success") {
    Logger.log("Check your Google Sheet and your Email inbox now!");
  } else {
    Logger.log("Error occurred: " + result);
  }
}

function doGet() {
  return ContentService.createTextOutput("SPARFIN Script is ACTIVE! (v3.0)").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var result = processLead(data);
    return ContentService.createTextOutput(result).setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Shared Core Logic for Leading Processing
 */
function processLead(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME_LEADS);
    
    // Auto-create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME_LEADS);
      sheet.appendRow([
        'Timestamp', 'Full Name', 'Phone', 'City', 'Employment', 
        'Loan Type', 'Loan Amount', 'Property Type', 'Stage', 
        'Preference', 'Notes', 'Source'
      ]);
      sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#EBF5FB');
      sheet.setFrozenRows(1);
    }
    
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
    
    sheet.appendRow(row);
    
    // Send Email via GmailApp (more robust than MailApp)
    sendLeadEmail(data);
    
    return "Success";
  } catch (e) {
    return "Error in processLead: " + e.toString();
  }
}

function sendLeadEmail(data) {
  var subject = '🚀 NEW LEAD: ' + (data.fname || 'Prospect') + ' (Sparfin)';
  var body = 'You have a new lead from Sparfin Services website:\n\n' +
             '----------------------------------\n' +
             'NAME: ' + data.fname + '\n' +
             'PHONE: ' + data.phone + '\n' +
             'CITY: ' + data.city + '\n' +
             'EMPLOYMENT: ' + data.employment + '\n' +
             'LOAN TYPE: ' + data.loanType + '\n' +
             'AMOUNT: ' + data.loanAmount + '\n' +
             'PROPERTY: ' + (data.propType || 'N/A') + '\n' +
             'STAGE: ' + data.stage + '\n' +
             'PREF. CONTACT: ' + data.prefContact + '\n' +
             'NOTES: ' + (data.notes || '---') + '\n' +
             '----------------------------------';

  try {
    GmailApp.sendEmail(NOTIFICATION_EMAIL, subject, body, {
      from: 'sparfin.automation@gmail.com', // Optional: leave blank normally
      name: 'Sparfin Automation'
    });
  } catch (e) {
    // Fallback if the 'from' or other parameters are locked
    GmailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
  }
}
