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

- พัฒนาบน branch `codex/interactive-landing-v2`; ไม่เปลี่ยน `main`, `gh-pages` หรือ Apps Script
- ปรับ Hero, PDPA / Confidential Info, เดโม, ขั้นตอน, Safe Package, FAQ และ CTA
- เดโมข้อมูลธุรกิจและพนักงาน แก้ได้ทุกคอลัมน์ พร้อมก่อน–หลังและกราฟที่คำนวณจากผลลัพธ์
- แต่ละชุดเก็บตัวเลือกแยกกันในหน่วยความจำ กดเริ่มใหม่เพื่อคืนค่าแนะนำ หรือ reload เพื่อเริ่มทั้งสองชุดใหม่
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
