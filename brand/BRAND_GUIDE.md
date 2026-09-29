# Safe-to-Insight Studio — Brand assets

## แนวคิด

เส้นรูปตัว `S` แทนการไหลของข้อมูลจากต้นทาง ผ่านจุดตรวจและการตัดสินใจของมนุษย์ ไปสู่ข้อมูลที่พร้อมใช้งาน ลูกศรสีเขียวอมฟ้าแทน Safe Output และประกายด้านบนแทน Insight ที่เกิดหลังจากปกป้องข้อมูลแล้ว

## สีหลัก

- Deep Navy: `#0B1F33`
- Navy Highlight: `#102D4D`
- Safe Teal: `#0F9D8A`
- Bright Teal: `#38D6C2`
- Off White: `#F8FCFF`
- Slate: `#53677A`

## ไฟล์

- `logo-horizontal.svg` — โลโก้หลักสำหรับ Header, Proposal และ Social banner
- `logo-mark.svg` — เครื่องหมายสี่เหลี่ยมสำหรับ Profile และ App icon
- `favicon.svg` — Favicon สมัยใหม่
- `favicon.ico` — Favicon สำหรับ Browser ที่ต้องการ ICO
- `favicon-32x32.png` — Favicon PNG
- `apple-touch-icon.png` — ไอคอน Add to Home Screen บน iPhone/iPad
- `icon-192.png` และ `icon-512.png` — PWA และ Android Home Screen
- `icon-maskable-512.png` — PWA maskable icon สำหรับ Android
- `site.webmanifest` — Web App Manifest

## HTML ที่ต้องใส่ใน `<head>`

```html
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/brand/favicon-32x32.png" sizes="32x32" type="image/png">
<link rel="shortcut icon" href="/brand/favicon.ico">
<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
<link rel="manifest" href="/brand/site.webmanifest">
<meta name="theme-color" content="#0B1F33">
```

## การใช้งาน

- เว้นพื้นที่รอบโลโก้อย่างน้อยเท่ากับความสูงตัวอักษร `S` ในคำว่า Safe
- ห้ามยืด บีบ หมุน หรือเปลี่ยนอัตราส่วน
- ใช้ `logo-horizontal.svg` บนพื้นขาวหรือพื้นสีอ่อน
- ใช้ `logo-mark.svg` เมื่อต้องการไอคอนหรือพื้นที่มีขนาดเล็ก
- ข้อมูลใน Landing Page และ Icon ต้องไม่มีข้อมูลส่วนบุคคลหรือข้อมูลลูกค้า
