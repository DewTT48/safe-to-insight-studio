const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../lead-inbox/Code.js'), 'utf8');
const TOKEN = '11111111-1111-4111-8111-111111111111';

function harness() {
  const state = {sheets: new Map(), cache: new Map(), mails: [], quota: 100, owner: 'dewteerapap@seederschool.com', locked: false, mailFails: false, failSentWrite: false};
  function sheet(name) {
    const s = {name, rows: [], getLastRow() {return this.rows.length;}, appendRow(row) {this.rows.push([...row]);}, setFrozenRows() {}, getSheetId() {return 42;}};
    s.getRange = (row, col, height = 1, width = 1) => ({
      getValues: () => Array.from({length: height}, (_, r) => Array.from({length: width}, (_, c) => s.rows[row - 1 + r]?.[col - 1 + c] ?? '')),
      getValue: () => s.rows[row - 1]?.[col - 1] ?? '',
      setValues(values) {
        if (state.failSentWrite && col === 10 && values[0][0] === 'SENT') throw Error('simulated Sheet failure after mail delivery');
        values.forEach((cells, r) => {s.rows[row - 1 + r] ||= []; cells.forEach((v, c) => {s.rows[row - 1 + r][col - 1 + c] = v;});});
      },
      setFontWeight() {return this;}, setBackground() {return this;}, setFontColor() {return this;},
      createTextFinder(value) {return {matchEntireCell() {return this;}, findNext() {const i=s.rows.findIndex((r,index)=>index>=row-1&&index<row-1+height&&r[col-1]===value);return i<0?null:{getRow:()=>i+1};}};}
    });
    return s;
  }
  const book = {getSheetByName: name => state.sheets.get(name), insertSheet(name) {const s=sheet(name);state.sheets.set(name,s);return s;},getUrl:()=> 'https://docs.google.com/spreadsheets/d/fixture/edit'};
  const context = vm.createContext({
    console: {error() {}},
    Utilities: {getUuid: () => TOKEN, formatDate(date, zone, format) {const iso=new Date(new Date(date).getTime()+7*3600000).toISOString();return format==='yyyy-MM-dd'?iso.slice(0,10):iso.slice(0,19).replace(/[-:T]/g,'');}},
    CacheService: {getScriptCache:()=>({get:key=>state.cache.get(key)||null,put:(key,value)=>state.cache.set(key,value)})},
    LockService: {getScriptLock:()=>({tryLock(){if(state.locked)return false;state.locked=true;return true;},waitLock(){state.locked=true;},releaseLock(){state.locked=false;}})},
    SpreadsheetApp: {openById:()=>book, flush() {}},
    Session: {getActiveUser:()=>({getEmail:()=>state.owner})},
    MailApp: {getRemainingDailyQuota:()=>state.quota,sendEmail(mail){if(state.mailFails)throw Error('simulated failure');state.mails.push(mail);}}
  });
  vm.runInContext(source.replace(/spreadsheetId: '[^']+'/u, "spreadsheetId: 'fixture'"), context);
  state.cache.set('lead-token:'+TOKEN,String(Date.now()-5000));
  const payload = {token:TOKEN,type:'นัดดูโปรแกรม',name:'ผู้ทดสอบระบบ',email:'test@example.com',organization:'องค์กรสมมติ',teamSize:'3 คน',message:'ข้อมูลสมมติสำหรับทดสอบ',acknowledged:true,website:''};
  return {state, context, payload, rows:()=>state.sheets.get('01_Requests').rows};
}

test('save one request, mail only the fixed owner, then acknowledge',()=>{
  const h=harness(), result=h.context.submitLead(h.payload);
  assert.equal(result.ok,true);assert.equal(h.rows().length,2);assert.equal(h.rows()[1][9],'SENT');
  assert.equal(h.state.mails.length,1);assert.equal(h.state.mails[0].to,'dewteerapap@seederschool.com');
  assert.equal(h.state.mails[0].replyTo,'test@example.com');assert.equal(h.state.locked,false);
});
test('duplicate clicks and retries reuse receipt without extra mail or row',()=>{
  const h=harness(),first=h.context.submitLead(h.payload);h.state.cache.clear();
  const second=h.context.submitLead(h.payload);assert.equal(second.requestId,first.requestId);assert.equal(second.duplicate,true);assert.equal(h.rows().length,2);assert.equal(h.state.mails.length,1);
});
test('mail failure preserves submission and reports success to respondent',()=>{
  const h=harness();h.state.mailFails=true;assert.equal(h.context.submitLead(h.payload).ok,true);assert.equal(h.rows()[1][9],'FAILED');assert.equal(h.rows().length,2);
  h.state.mailFails=false;h.context.retryLeadNotifications();assert.equal(h.rows()[1][9],'SENT');assert.equal(h.state.mails.length,1);
});
test('quota exhaustion records QUOTA and does not lose the request',()=>{const h=harness();h.state.quota=0;assert.equal(h.context.submitLead(h.payload).ok,true);assert.equal(h.rows()[1][9],'QUOTA');assert.equal(h.state.mails.length,0);});
test('ambiguous post-mail Sheet failure is not automatically resent',()=>{const h=harness();h.state.failSentWrite=true;assert.equal(h.context.submitLead(h.payload).ok,true);assert.equal(h.rows()[1][9],'SENDING');h.context.retryLeadNotifications();assert.equal(h.state.mails.length,1);});
test('formula-like user input is stored as literal text',()=>{const h=harness();h.payload.name='=IMPORTXML("https://example.com","x")';h.payload.message=' +SUM(A1:A2)';h.context.submitLead(h.payload);assert.ok(h.rows()[1][3].startsWith("'="));assert.ok(h.rows()[1][7].startsWith("'+"));});
test('untrusted input cannot override notification recipient',()=>{const h=harness();h.context.submitLead({...h.payload,to:'attacker@example.com',spreadsheetId:'other'});assert.equal(h.state.mails[0].to,'dewteerapap@seederschool.com');});
for (const [name,change] of [
  ['invalid email',{email:'broken-address'}],['mail-header newline',{email:'a@example.com\r\nBcc:b@example.com'}],
  ['missing name',{name:''}],['unrecognised request type',{type:'other'}],['missing acknowledgement',{acknowledged:false}],
  ['honeypot filled',{website:'spam'}],['oversized message',{message:'x'.repeat(1501)}],['non-string name',{name:123}]
]) test('reject '+name,()=>{const h=harness();assert.throws(()=>h.context.submitLead({...h.payload,...change}));assert.equal(h.state.mails.length,0);assert.equal(h.state.sheets.size,0);});
test('unknown and expired tokens cannot write rows',()=>{const h=harness();h.state.cache.clear();assert.throws(()=>h.context.submitLead(h.payload),/หมดอายุ/);assert.equal(h.rows().length,1);});
test('too-fast token is rejected',()=>{const h=harness();h.state.cache.set('lead-token:'+TOKEN,String(Date.now()));assert.throws(()=>h.context.submitLead(h.payload),/สักครู่/);assert.equal(h.rows().length,1);});
test('per-email limit counts across independent form tokens',()=>{const h=harness();for(let i=0;i<3;i++){const t=TOKEN.slice(0,-1)+i;h.state.cache.set('lead-token:'+t,String(Date.now()-5000));h.context.submitLead({...h.payload,token:t});}const t=TOKEN.slice(0,-1)+'4';h.state.cache.set('lead-token:'+t,String(Date.now()-5000));assert.throws(()=>h.context.submitLead({...h.payload,token:t}),/จำนวนมาก/);assert.equal(h.rows().length,4);});
test('admin functions reject external or anonymous caller before accessing Sheet',()=>{const h=harness();h.state.owner='';assert.throws(()=>h.context.setupLeadInbox(),/ผู้ดูแล/);assert.throws(()=>h.context.retryLeadNotifications(),/ผู้ดูแล/);assert.equal(h.state.sheets.size,0);});
test('schema drift fails closed without appending into wrong columns',()=>{const h=harness();h.context.setupLeadInbox();h.rows()[0][0]='renamed';assert.throws(()=>h.context.submitLead(h.payload),/ปรับปรุง/);assert.equal(h.rows().length,1);assert.equal(h.state.locked,false);});
test('busy lock cannot append or send mail',()=>{const h=harness();h.state.locked=true;assert.throws(()=>h.context.submitLead(h.payload),/รอสักครู่/);assert.equal(h.state.sheets.size,0);});
test('template reports success only after server acknowledgement and renders receipt as text',()=>{const html=fs.readFileSync(path.join(__dirname,'../lead-inbox/Index.html'),'utf8');assert.match(html,/result\.ok!==true/);assert.match(html,/textContent='เลขคำขอ: '/);assert.doesNotMatch(html,/innerHTML|no-cors|type="file"/);});
test('only the separate lead inbox is public after owner approval; runtime stays owner-executed without Gmail read scope',()=>{const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../lead-inbox/appsscript.json'),'utf8'));assert.equal(manifest.webapp.access,'ANYONE_ANONYMOUS');assert.equal(manifest.webapp.executeAs,'USER_DEPLOYING');assert.ok(manifest.oauthScopes.includes('https://www.googleapis.com/auth/script.send_mail'));assert.ok(!manifest.oauthScopes.some(s=>s.includes('gmail')));});
test('contact guidance fits an enquiry form, with next steps below submit',()=>{const html=fs.readFileSync(path.join(__dirname,'../lead-inbox/Index.html'),'utf8');assert.doesNotMatch(html,/ไม่ต้องแนบไฟล์จริง/);assert.match(html,/เล่าลักษณะงานที่ต้องการนำไปใช้ได้เลย/);assert.ok(html.indexOf('เราจะติดต่อกลับเพื่อคุยรายละเอียด ก่อนยืนยันวันนัด')>html.indexOf('id="submit"'));});
test('landing enquiry buttons target the verified form, with separate intent and email fallback',()=>{const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');const target='https://script.google.com/a/macros/seederschool.com/s/AKfycbwa2B_jcm8_Wp3WEIYhLhhHhzluMK0wfS7TOIOhCGmu27-BolLVUsQpxg6mCJxBDtoqyA/exec';for(const type of ['demo','quote'])assert.ok(html.includes('href="'+target+'?type='+type+'"'));assert.ok(html.includes('href="mailto:dewteerapap@seederschool.com"'));assert.doesNotMatch(html,/ปุ่มจะเปิดแอปอีเมลของคุณ/);});
