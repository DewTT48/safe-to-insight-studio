# Safe-to-Insight Studio — Commercial Landing Page

หน้า Landing Page สำหรับแนะนำ Safe-to-Insight Studio ผลิตภัณฑ์เตรียมข้อมูลให้ปลอดภัยก่อนนำไปใช้กับ AI

- เว็บไซต์: `https://safedata.dewteerapap.com/`
- GitHub Pages source: branch `gh-pages`

## โครงสร้าง

- `dist/` — เว็บไซต์ static ที่พร้อม deploy
- `brand/` — ไฟล์ต้นฉบับ Logo, Favicon และ Brand Guide
- `.openai/hosting.json` — การตั้งค่า Sites hosting เดิม ไม่ใช้เผยแพร่งานรอบนี้
- `dist/demo-model.js` — ข้อมูลสมมติและตรรกะการแปลงข้อมูล (ไม่มี API)
- `tests/demo-model.test.cjs` — ชุดทดสอบด้วย Node.js โดยไม่ต้องติดตั้ง dependency

## เปิดทดสอบในเครื่อง

```bash
python3 -m http.server 4173 --directory dist
```

แล้วเปิด `http://localhost:4173`

## หมายเหตุ

- ปุ่ม “เข้าสู่ระบบ Pilot” เชื่อมไปยัง Google Apps Script UAT ที่จำกัดบัญชี `seederschool.com`
- CTA สำหรับองค์กรใช้ email link ชั่วคราว และแก้ได้ใน `dist/index.html`
- Canonical URL คือ `https://safedata.dewteerapap.com/` ต้องตรวจ DNS/TLS และสถานะ GitHub Pages ก่อนเผยแพร่
- Landing Page นี้ไม่รับหรืออัปโหลดไฟล์ข้อมูลของผู้ใช้

## Interactive landing v2 — 30 September 2026

- พัฒนาบน branch `codex/interactive-landing-v2` แล้วเผยแพร่ตามคำยืนยันของผู้ใช้เมื่อ 30 September 2026; ไม่เปลี่ยน Apps Script
- ปรับ Hero, PDPA / Confidential Info, เดโม, ขั้นตอน, Safe Package, FAQ และ CTA
- เดโมข้อมูลธุรกิจและพนักงาน แก้ได้ทุกคอลัมน์ พร้อมก่อน–หลังและกราฟที่คำนวณจากผลลัพธ์
- แต่ละชุดเก็บตัวเลือกแยกกันในหน่วยความจำ กดเริ่มใหม่เพื่อคืนข้อมูลต้นฉบับ หรือเลือกปุ่มแยกเพื่อใช้วิธีแนะนำ
- ชื่อบุคคลและบริษัทเป็นข้อมูลสมมติ อีเมลใช้ example.com เท่านั้น
- ไม่มี upload, analytics, storage หรือ API call ในเดโม; โหลดฟอนต์จาก Google Fonts
- ตัวเลือกตัด/ปิดบัง/ลดความละเอียดของคอลัมน์ที่จำเป็นจะหยุดแสดงกราฟ ไม่คำนวณจากข้อมูลต้นฉบับที่ซ่อนไว้
- รองรับคีย์บอร์ด, live status, reduced motion และสลับมุมมองก่อน–หลังบนมือถือ
- โลโก้, favicon, Home Screen icons, manifest และลิงก์ Pilot เดิมไม่เปลี่ยน

### Realistic demo + product enquiry update

- เพิ่มข้อมูลสมมติเป็นชุดละ 8 รายการ: พนักงานพร้อมเงินเดือน/ตำแหน่ง และยอดขายอุปกรณ์สำนักงานพร้อมรายการสินค้า/จำนวน/ราคา/ส่วนลด/ต้นทุน/กำไรขั้นต้น
- ยอดขายหลังส่วนลดไม่รวม VAT; กำไรขั้นต้น = ยอดขาย − ต้นทุนสินค้า ตรวจความสอดคล้องด้วย unit tests
- เพิ่มคำอธิบายสิ่งที่ไฟล์เปิดเผย พร้อมปุ่มเน้นคอลัมน์ต้นฉบับ และข้อควรระวังเรื่องคำนวณต้นทุนกลับจากคอลัมน์อื่น
- เพิ่มส่วนแนะนำโปรแกรมและ CTA นัดดูโปรแกรม/ขอรายละเอียดราคา ส่งต่อไป mailto เดิม ไม่มีการส่งอีเมลอัตโนมัติหรือเก็บ lead ในฐานข้อมูล
- ปรับภาษาไทยใน Hero, หัวข้อ, คำอธิบายเดโม, วิธีทำงาน และส่วนติดต่อ; ไม่เพิ่มราคา รีวิว หรือคำรับรองที่ยังไม่ได้ยืนยัน

ทดสอบ:

```bash
node --check dist/script.js
node --check dist/demo-model.js
node --test tests/demo-model.test.cjs
```

ก่อน publish ต้องตรวจหน้าจอและความถูกต้องของข้อความกับเจ้าของผลิตภัณฑ์ รวมถึงยืนยันมาตรการของ Pilot แยกจากเดโม ไม่ใช้ข้อความหน้าเว็บเป็นการรับรองความพร้อมของระบบหลังบ้าน

## Public release — 30 September 2026

- URL: https://safedata.dewteerapap.com/
- Source release: `1400beb`; deployment commit: `ceee998` (GitHub เพิ่ม commit CNAME ตามหลังระหว่างผูกโดเมนใหม่)
- GitHub Pages: `gh-pages` / root; HTTPS certificate approved และเปิด `https_enforced=true`
- สำรอง source เดิม: tag `backup/landing-source-before-public-v2-20260930`
- สำรองเว็บที่เคยเผยแพร่: tag `backup/landing-public-before-v2-20260930`
- ตรวจแล้ว: ชุดทดสอบ 11 ข้อ, เนื้อหา live ตรงกับไฟล์ local, เดโมสองชุด, เมนูมือถือ 390px, รูปภาพและลิงก์ภายใน, ปลายทาง mailto โดยไม่ส่งข้อความจริง
- ไม่ได้แก้ Apps Script, สิทธิ์ Pilot, โฟลเดอร์ `dist/app` หรือโลโก้/ไอคอนเดิม
- หากต้องย้อนเวอร์ชัน ให้สร้าง deployment commit ใหม่จาก tree ของ backup tag โดยมี parent เป็นปลาย branch gh-pages ปัจจุบัน ไม่ force-push ประวัติ

## Immediate preview + deep teal/gold — 30 September 2026

- เริ่มทุกคอลัมน์ด้วยข้อมูลต้นฉบับ ให้ผู้ใช้เลือกเอง; วิธีแนะนำเป็นปุ่มแยก
- มีรหัสแทนให้ทดลองทุกคอลัมน์: ชื่อคน/ลูกค้าอ้างอิง identity ต้นทาง ส่วนสินค้าและค่าอื่นใช้ mapping แยกตามคอลัมน์
- ตัวเลขที่แทนด้วยรหัสไม่ถูกนำไปคำนวณยอด; กลุ่มสินค้า/แผนกที่แทนด้วยรหัสยังรวมกลุ่มได้จากข้อมูลหลังปรับ
- ปุ่มวิธีจัดการแสดงครบ พร้อมตัวอย่างก่อน–หลังข้างปุ่มบนคอม และใต้ปุ่มทันทีบนมือถือ
- ตารางเต็มแสดงครั้งละมุมมอง มีปุ่มย้อนกลับ คืนคอลัมน์ และเริ่มใหม่
- เปลี่ยนสีหลักเป็น Teal #087f78 / #075c57 และ Gold #b77b27 พร้อมเฉดสว่างสำหรับข้อความบน Navy
- ตรวจด้วย unit tests 14 ข้อ และเบราว์เซอร์ที่ 390px / 1440px: รหัสสินค้า/อีเมล, ลบ/คืน/ย้อนกลับ, คำแนะนำ, รีเซ็ต, สลับต้นฉบับ/ผลลัพธ์ และหยุดกราฟเมื่อตัวเลขที่จำเป็นเป็นรหัส
- สำรองก่อนอัปเดต: `backup/landing-before-instant-preview-20260930` (source), `backup/public-before-instant-preview-20260930` (public)
- ไม่เปลี่ยน Apps Script, Pilot, โลโก้ หรือ Home Screen icons

## Thai hero + meaningful package samples — 30 September 2026

- Hero แบ่งเป็นวลีไทยแทนบังคับตัด 4 บรรทัด; ทดสอบ desktop 1440px และ mobile 390px รวมเป็น 2 บรรทัดโดยไม่มีแนวนอนล้น
- แทนเส้นตกแต่งใน Safe Package ด้วยตัวอย่างตารางข้อมูล แผนวิธีปกป้อง และรายการการเปลี่ยนแปลง พร้อมคำอธิบายการใช้แต่ละไฟล์
- `dist/entry.js` ให้ fresh visit/reload เริ่มที่ Hero แม้ URL เดิมมี #demo/#contact; ลิงก์ภายในยังทำงานตามปกติ และไม่บังคับ scroll เมื่อคืนหน้าจาก BFCache
- Run all checks: `node --test tests/*.test.cjs` (17 tests)
- **ยังไม่เสร็จ:** ฟอร์มรับคำขอนัดเดโม/ใบเสนอราคาแยกจากระบบเดิม ผู้ใช้อนุมัติให้สร้างแล้ว แต่การเข้าถึง Chrome เพื่อสร้างในบัญชี Google ยังไม่ได้รับอนุญาต จึงยังไม่สร้างหรือเปิดฟอร์ม ไม่มีการส่งคำขอทดสอบ และปุ่มเดิมยังเป็น mailto
- ขั้นต่อไปของฟอร์ม: สร้าง Google Form แยก เก็บประเภทคำขอ ชื่อผู้ติดต่อ องค์กร อีเมล และรายละเอียดที่จำเป็นเท่านั้น; ไม่รับไฟล์จริง/ข้อมูลลับ ไม่ยืนยันนัดหรือราคาอัตโนมัติ ตรวจสิทธิ์คำตอบและการแจ้งเตือนก่อนเชื่อมปุ่มบนเว็บ
- Backup source: `backup/landing-before-hero-package-20260930`; backup public: `backup/public-before-hero-package-20260930`

## Product sentence + workflow copy — 30 September 2026

- เอาข้อจำกัดความกว้าง 470px ของประโยคแนะนำโปรแกรมออก โดยคงขนาดตัวอักษรเดิม; ตรวจที่ 1440px แล้วอยู่บรรทัดเดียว และที่ 390px ตัดบรรทัดตามพื้นที่โดยไม่ล้น
- เขียนคำอธิบายขั้นตอน 1–2–3 ใหม่ให้บอกสิ่งที่ผู้ใช้ทำและผลที่ได้ ไม่ใช่เพียงรายการคำศัพท์
- ฟอร์มไม่จำเป็นต้องใช้ Chrome: Google Forms API รองรับการสร้างผ่าน drive.file ที่ได้รับสิทธิ์แล้ว แต่โปรไฟล์ `landing-leads` ปัจจุบันเป็นเจ้าของบัญชี Gmail ไม่ใช่ seederschool.com จึงต้องยืนยันเจ้าของฟอร์มก่อนสร้าง (ยังไม่มีฟอร์มถูกสร้างในรอบตรวจบัญชี)

## Apps Script lead inbox — 1 October 2026

- ใช้ระบบใหม่ใน `lead-inbox/` แทน Google Forms: Apps Script ผูกกับ Sheet หลักของระบบรับคำขอ เป็นของ dewteerapap@seederschool.com ไม่ใช่โปรเจกต์แอป Safe Data
- เจ้าของทดสอบส่ง/ดูข้อมูลและยืนยันว่าได้รับอีเมลแล้ว; แจ้งเตือนไปยังเจ้าของเท่านั้น ไม่ส่งอีเมลอัตโนมัติให้ผู้กรอก
- Version 3 เปิดเฉพาะแบบฟอร์มให้บุคคลทั่วไปกรอกได้ ตามการอนุมัติของผู้ใช้; Sheet คำตอบยังเป็นส่วนตัว
- ปุ่มนัดดูโปรแกรมและขอใบเสนอราคาเปิดฟอร์มในแท็บใหม่ พร้อมเลือกประเภทคำขอให้; ยังมีอีเมลสำรอง
- ผลทดสอบ ข้อจำกัด Apps Script multi-login และคู่มือดูแลอยู่ใน `lead-inbox/README.md`
- Runtime tests + landing tests: `node --test tests/*.test.cjs` — 42 ข้อ
- ไม่เปลี่ยน Apps Script ของ Safe Data, Pilot, โลโก้ หรือ Home Screen icons
