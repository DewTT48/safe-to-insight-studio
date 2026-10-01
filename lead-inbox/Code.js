/* Standalone lead inbox, bound to its own master Sheet. Never accesses the Safe Data app. */
var LEAD_CONFIG = Object.freeze({
  owner: 'dewteerapap@seederschool.com',
  spreadsheetId: '1NoQIPNAqr-px-Lf4OSMz4QYxRFTnX1XY1Z46uQtJUjE',
  version: '1.0.0',
  requestsTab: '01_Requests',
  logTab: '02_NotificationLog',
  maxPerHour: 20,
  maxPerDay: 60,
  maxPerEmailDay: 3
});
var LEAD_HEADERS = ['request_id', 'created_at', 'request_type', 'contact_name', 'email', 'organization', 'team_size', 'message', 'status', 'notification_status', 'notification_attempts', 'notification_updated_at', 'submission_token'];
var LEAD_TYPES = ['นัดดูโปรแกรม', 'ขอใบเสนอราคา', 'นัดดูโปรแกรมและขอใบเสนอราคา'];

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  template.token = issueLeadToken_();
  var type = e && e.parameter && e.parameter.type;
  template.initialType = type === 'quote' ? LEAD_TYPES[1] : LEAD_TYPES[0];
  return template.evaluate().setTitle('ติดต่อ Safe-to-Insight Studio')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function issueLeadToken_() {
  var token = Utilities.getUuid();
  CacheService.getScriptCache().put('lead-token:' + token, String(Date.now()), 3600);
  return token;
}

function normalizeLead_(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('กรุณาตรวจข้อมูลแล้วลองอีกครั้ง');
  if (JSON.stringify(input).length > 7000) throw new Error('ข้อความยาวเกินไป กรุณาย่อรายละเอียด');
  function field(key, max, required) {
    if (input[key] !== undefined && typeof input[key] !== 'string') throw new Error('ข้อมูลไม่ถูกต้อง');
    var value = (input[key] || '').trim();
    if (value.length > max || (required && !value)) throw new Error('กรุณาตรวจช่องที่จำเป็นและความยาวข้อความ');
    if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) throw new Error('ข้อความมีอักขระที่ไม่รองรับ');
    return value;
  }
  if (input.website) throw new Error('ไม่สามารถส่งคำขอนี้ได้');
  if (input.acknowledged !== true) throw new Error('กรุณารับทราบการใช้ข้อมูลติดต่อก่อนส่ง');
  var lead = {
    token: field('token', 80, true),
    type: field('type', 60, true),
    name: field('name', 120, true),
    email: field('email', 254, true).toLowerCase(),
    organization: field('organization', 160, false),
    teamSize: field('teamSize', 60, false),
    message: field('message', 1500, false)
  };
  if (!/^[a-f0-9-]{36}$/i.test(lead.token) || LEAD_TYPES.indexOf(lead.type) === -1) throw new Error('กรุณาเปิดฟอร์มใหม่แล้วลองอีกครั้ง');
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(lead.email)) throw new Error('กรุณากรอกอีเมลให้ถูกต้อง');
  if (/[\r\n]/.test(lead.name + lead.organization + lead.teamSize)) throw new Error('กรุณากรอกข้อมูลติดต่อเป็นบรรทัดเดียว');
  return lead;
}

function safeCell_(value) {
  var text = String(value == null ? '' : value);
  return /^[\s\uFEFF]*[=+@-]/.test(text) ? "'" + text : text;
}

function inbox_() {
  if (LEAD_CONFIG.spreadsheetId === 'SET_AFTER_PROVISIONING') throw new Error('ระบบยังไม่เปิดรับคำขอ กรุณาติดต่อทางอีเมล');
  var book = SpreadsheetApp.openById(LEAD_CONFIG.spreadsheetId);
  var requests = book.getSheetByName(LEAD_CONFIG.requestsTab);
  if (!requests) {
    requests = book.insertSheet(LEAD_CONFIG.requestsTab);
    requests.appendRow(LEAD_HEADERS);
    requests.setFrozenRows(1);
    requests.getRange(1, 1, 1, LEAD_HEADERS.length).setFontWeight('bold').setBackground('#0c2639').setFontColor('#ffffff');
  } else {
    var actual = requests.getRange(1, 1, 1, LEAD_HEADERS.length).getValues()[0];
    if (JSON.stringify(actual) !== JSON.stringify(LEAD_HEADERS)) throw new Error('ระบบกำลังปรับปรุง กรุณาติดต่อทางอีเมล');
  }
  var log = book.getSheetByName(LEAD_CONFIG.logTab);
  if (!log) { log = book.insertSheet(LEAD_CONFIG.logTab); log.appendRow(['timestamp', 'request_id', 'event']); log.setFrozenRows(1); }
  return {book: book, requests: requests, log: log};
}

function checkLeadLimit_(sheet, lead, now) {
  var day = Utilities.formatDate(now, 'Asia/Bangkok', 'yyyy-MM-dd');
  var hourly = 0, daily = 0, emailDaily = 0;
  if (sheet.getLastRow() > 1) {
    var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
    rows.forEach(function(row) {
      var created = new Date(row[1]);
      if (now.getTime() - created.getTime() < 3600000) hourly++;
      if (Utilities.formatDate(created, 'Asia/Bangkok', 'yyyy-MM-dd') === day) {
        daily++;
        if (String(row[4]).replace(/^'/, '').toLowerCase() === lead.email) emailDaily++;
      }
    });
  }
  if (hourly >= LEAD_CONFIG.maxPerHour || daily >= LEAD_CONFIG.maxPerDay || emailDaily >= LEAD_CONFIG.maxPerEmailDay) {
    throw new Error('ขณะนี้มีคำขอจำนวนมาก กรุณาติดต่อ dewteerapap@seederschool.com หรือลองใหม่ภายหลัง');
  }
}

// Only public write operation. No public read, search, export, recipient, or Sheet-ID parameters.
function submitLead(input) {
  var lead = normalizeLead_(input);
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) throw new Error('ระบบกำลังรับคำขอ กรุณารอสักครู่แล้วกดส่งอีกครั้ง');
  try {
    var data = inbox_();
    var sheet = data.requests;
    if (sheet.getLastRow() > 1) {
      var match = sheet.getRange(2, 13, sheet.getLastRow() - 1, 1).createTextFinder(lead.token).matchEntireCell(true).findNext();
      if (match) return {ok: true, requestId: sheet.getRange(match.getRow(), 1).getValue(), duplicate: true};
    }
    var issued = Number(CacheService.getScriptCache().get('lead-token:' + lead.token));
    var age = Date.now() - issued;
    if (!issued || age > 3600000) throw new Error('ฟอร์มหมดอายุ กรุณาโหลดหน้าใหม่แล้วกรอกอีกครั้ง');
    if (age < 2000) throw new Error('กรุณาตรวจข้อมูลสักครู่แล้วกดส่งอีกครั้ง');
    var now = new Date();
    checkLeadLimit_(sheet, lead, now);
    var requestId = 'LEAD-' + Utilities.formatDate(now, 'Asia/Bangkok', 'yyyyMMdd-HHmmss') + '-' + Utilities.getUuid().slice(0, 6).toUpperCase();
    sheet.appendRow([requestId, now, lead.type, safeCell_(lead.name), safeCell_(lead.email), safeCell_(lead.organization), safeCell_(lead.teamSize), safeCell_(lead.message), 'NEW', 'PENDING', 0, '', lead.token]);
    SpreadsheetApp.flush();
    var row = sheet.getLastRow();
    // A notification failure must never turn a persisted submission into a form failure.
    try { notifyLead_(data, row); } catch (error) { console.error('Lead notification requires review: ' + requestId); }
    return {ok: true, requestId: requestId};
  } finally { lock.releaseLock(); }
}

function notifyLead_(data, row) {
  var values = data.requests.getRange(row, 1, 1, LEAD_HEADERS.length).getValues()[0];
  if (['PENDING', 'FAILED', 'QUOTA'].indexOf(values[9]) === -1) return;
  function status(value, attempts) {
    data.requests.getRange(row, 10, 1, 3).setValues([[value, attempts, new Date()]]);
    SpreadsheetApp.flush();
  }
  var attempts = Number(values[10]) || 0;
  if (MailApp.getRemainingDailyQuota() < 1) { status('QUOTA', attempts); return; }
  status('SENDING', attempts + 1);
  var sheetUrl = data.book.getUrl() + '#gid=' + data.requests.getSheetId() + '&range=A' + row;
  var body = ['มีคำขอใหม่จากเว็บไซต์ Safe-to-Insight Studio', '', 'เลขคำขอ: ' + values[0], 'เรื่อง: ' + values[2], 'ชื่อ: ' + values[3], 'อีเมล: ' + values[4], 'องค์กร: ' + (values[5] || '-'), 'จำนวนผู้ใช้: ' + (values[6] || '-'), 'รายละเอียด: ' + (values[7] || '-'), '', 'ดูรายการใน Sheet: ' + sheetUrl, '', 'ยังไม่ได้ยืนยันวันนัดหรือราคาให้ผู้กรอก กรุณาติดต่อกลับตามคำขอ'].join('\n');
  try {
    MailApp.sendEmail({to: LEAD_CONFIG.owner, replyTo: String(values[4]).replace(/^'/, ''), subject: '[Safe-to-Insight] ' + values[2] + ' | ' + values[0], body: body, name: 'Safe-to-Insight Studio'});
  } catch (error) {
    status('FAILED', attempts + 1);
    data.log.appendRow([new Date(), values[0], 'MAIL_FAILED']);
    return;
  }
  // If this write fails after mail delivery, leave SENDING for manual review; never auto-resend it.
  status('SENT', attempts + 1);
  data.log.appendRow([new Date(), values[0], 'MAIL_SENT']);
}

function requireLeadOwner_() {
  if (Session.getActiveUser().getEmail().toLowerCase() !== LEAD_CONFIG.owner) throw new Error('เฉพาะผู้ดูแลระบบ');
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Safe-to-Insight Leads')
    .addItem('ตั้งค่าตารางรับคำขอ', 'setupLeadInbox')
    .addItem('ลองส่งการแจ้งเตือนที่ค้างอีกครั้ง', 'retryLeadNotifications').addToUi();
}

function setupLeadInbox() {
  requireLeadOwner_();
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try { inbox_(); MailApp.getRemainingDailyQuota(); } finally { lock.releaseLock(); }
  return 'พร้อมรับคำขอ';
}

function retryLeadNotifications() {
  requireLeadOwner_();
  var lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    var data = inbox_();
    var count = 0;
    for (var row = 2; row <= data.requests.getLastRow() && count < 10; row++) {
      var state = data.requests.getRange(row, 10).getValue();
      if (['PENDING', 'FAILED', 'QUOTA'].indexOf(state) !== -1) { notifyLead_(data, row); count++; }
    }
    return count;
  } finally { lock.releaseLock(); }
}
