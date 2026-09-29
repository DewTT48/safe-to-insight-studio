# Safe-to-Insight Studio — Commercial Landing Page

หน้า Landing Page สำหรับแนะนำ Safe-to-Insight Studio ผลิตภัณฑ์เตรียมข้อมูลให้ปลอดภัยก่อนนำไปใช้กับ AI

- เว็บไซต์: `https://safedata.dewteerapap.com/`
- GitHub Pages source: branch `gh-pages`

## โครงสร้าง

- `dist/` — เว็บไซต์ static ที่พร้อม deploy
- `brand/` — ไฟล์ต้นฉบับ Logo, Favicon และ Brand Guide
- `.openai/hosting.json` — การตั้งค่า Sites hosting

## เปิดทดสอบในเครื่อง

```bash
python3 -m http.server 4173 --directory dist
```

แล้วเปิด `http://localhost:4173`

## หมายเหตุ

- ปุ่ม “เข้าสู่ระบบ Pilot” เชื่อมไปยัง Google Apps Script UAT ที่จำกัดบัญชี `seederschool.com`
- CTA สำหรับองค์กรใช้ email link ชั่วคราว และแก้ได้ใน `dist/index.html`
- Canonical URL เตรียมไว้เป็น `https://safedata.dewteerapap.com/` แต่ยังไม่ได้ผูก DNS
- Landing Page นี้ไม่รับหรืออัปโหลดไฟล์ข้อมูลของผู้ใช้
