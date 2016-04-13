//Display the interactive landing page for this servcie
function doGet() {
  var html = HtmlService.createHtmlOutputFromFile('Index')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  return html;
}

//Create a global object to store the response from a POST request
var RESP;

//Handle a POST request directly to this service.  
//The parameter "data" should contain CSV content
//A response page will be generated with a link to the Google Sheet that is generated
function doPost(req) {
  RESP = createPlainTextSpreadsheet(req.parameter.data);
  var temp = HtmlService.createTemplateFromFile('Response');
  return temp.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

//Handle CSV content sent from the interactive landing page for this script
//Return a string representation of a JSON object with the name and URL of the generated Google Sheet
function doTextPost(req) {
  var resp = createPlainTextSpreadsheet(req.data);
  return JSON.stringify(resp);
}

//Handle file upload content sent from the interactive landing page for this script
//Return a string representation of a JSON object with the name and URL of the generated Google Sheet
function processFile(form) {
  var blob = form.file;
  var resp = createPlainTextSpreadsheet(blob.getDataAsString());
  return JSON.stringify(resp);
}

//Generate a new Google Sheet containing the CSV data that is provided
//The new Google Sheet will be named "import.YYYY-MM-DD_HH:MM.csv in Google Drive
//All data cells will be set as "Plain Text" to prevent auto-conversion of strings that look like dates and numbers
//Text wrap will be enabled for all data cells
//The header row will be highlighted and the columns will be auto-sized
//Return a JSON object containing the name and URL of the new Google Sheet
function createPlainTextSpreadsheet(data) {
  var arr = Utilities.parseCsv(data);
  if (arr.length == 0) return "No data";
  
  var formattedDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd_HH:mm");
  var spreadsheet = SpreadsheetApp.create("import."+formattedDate+".csv");
  var sheet = spreadsheet.getActiveSheet();
  var range = sheet.getRange(1, 1, arr.length, arr[0].length);
  var rangeR1 = sheet.getRange(1, 1, 1, arr[0].length);
  range.setValue("");
  range.setNumberFormat("@STRING@");
  range.setValues(arr);
  range.setWrap(true);
  rangeR1.setBackground("yellow");
  rangeR1.setFontWeight("bold");
  for(var i=1; i<=arr[0].length; i++) {
    sheet.autoResizeColumn(i);
    if (sheet.getColumnWidth(i) > 300) {
      sheet.setColumnWidth(i, 300);
    }
  }
    
  return {name: spreadsheet.getName(), url: spreadsheet.getUrl()};
}
