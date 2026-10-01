# Safe-to-Insight Lead Inbox

ระบบรับคำขอใหม่ แยกจากแอป Safe Data ทุกโปรเจกต์ ไม่ใช้ Google Forms API ไม่ใช้ AI และไม่รับไฟล์แนบ

## ตำแหน่งและเจ้าของ

- เจ้าของ: `dewteerapap@seederschool.com`
- Master Sheet: https://docs.google.com/spreadsheets/d/1NoQIPNAqr-px-Lf4OSMz4QYxRFTnX1XY1Z46uQtJUjE/edit
- Bound Apps Script: https://script.google.com/home/projects/1Zr8Hvq4VKp9WTCmd_FpX2JraFyH1aIcH-r6J-xAE1-blpkJrHbQ03WJW/edit
- Web app ทดสอบ: https://script.google.com/a/macros/seederschool.com/s/AKfycbwa2B_jcm8_Wp3WEIYhLhhHhzluMK0wfS7TOIOhCGmu27-BolLVUsQpxg6mCJxBDtoqyA/exec
- Deployment ID: `AKfycbwa2B_jcm8_Wp3WEIYhLhhHhzluMK0wfS7TOIOhCGmu27-BolLVUsQpxg6mCJxBDtoqyA`
- Version 3, วันที่ 1 ตุลาคม 2569: `ANYONE_ANONYMOUS` / `USER_DEPLOYING` เฉพาะฟอร์มรับคำขอใหม่ ตามคำอนุญาตเปิดให้ลูกค้ากรอกโดยไม่ล็อกอิน
- ยืนยัน metadata หลังสร้าง: parentId ของสคริปต์ตรงกับ Master Sheet; Sheet มี permission ของเจ้าของคนเดียว

## ขั้นตอนทำงาน

1. ปุ่มบน Landing Page จะเปิดฟอร์ม Apps Script (`?type=demo` หรือ `?type=quote`) หลังผ่าน live acceptance เท่านั้น
2. HTML Service เรียก `submitLead` ด้วย `google.script.run` ไม่ใช้ cross-origin fetch หรือ `no-cors` ที่ตรวจผลบันทึกไม่ได้
3. ตรวจข้อมูลและ token ฝั่ง server แล้วล็อกการเขียนเพื่อป้องกันคำขอซ้ำ
4. บันทึกลง `01_Requests` ก่อน แล้วส่งอีเมลด้วย MailApp ไปที่เจ้าของเพียงคนเดียว
5. หน้า success แสดงเลขคำขอเมื่อ server ยืนยันการบันทึก ไม่ยืนยันวันนัดหรือราคา

Tab คำขอมีสถานะ `NEW` ให้เจ้าของติดตามงาน และแยกสถานะอีเมลออกจากสถานะคำขอ
Tab `02_NotificationLog` เก็บเหตุการณ์การส่งอีเมลตาม request_id ไม่ทำสำเนาข้อมูลติดต่อใน log

## สิทธิ์

- clasp ใช้โปรไฟล์ `landing-leads-seeders-clasp` สำหรับจัดการโค้ดของโปรเจกต์นี้
- Runtime ของสคริปต์ต้องให้เจ้าของอนุญาต Google Sheets, ส่งอีเมล และยืนยันอีเมล
- ไม่ขออ่าน Gmail หรืออ่าน Google Forms ทั้งบัญชี
- Google Sheets runtime scope ครอบคลุม spreadsheets ของเจ้าของตามที่ Google กำหนด แต่โค้ดกำหนด Sheet ID ตายตัว ไม่รับ Sheet ID จากผู้กรอก
- การเปิดฟอร์มไม่เท่ากับแชร์ Sheet คำตอบ ต้องคง Sheet เป็นส่วนตัวเสมอ
- ผู้ใช้ยืนยันข้อยกเว้น anonymous เฉพาะฟอร์มใหม่นี้เมื่อ 1 ตุลาคม 2569 ไม่ครอบคลุมแอป Safe Data
- ห้ามแตะ deployment หรือข้อมูลของแอป Safe Data เดิม

## เจ้าของเริ่มใช้งานและทดสอบ

1. เปิดลิงก์ทดสอบด้วยบัญชีโรงเรียนและอนุญาต runtime ของสคริปต์ หากมีคำเตือนที่ไม่คาดคิด ให้หยุดตรวจ ไม่ข้ามการบล็อก
2. ส่งข้อมูลสมมติหนึ่งรายการ เช่นชื่อ `ทดสอบระบบ — ไม่ใช่ลูกค้าจริง` พร้อมอีเมลของเจ้าของ
3. ตรวจแถวใน `01_Requests` ว่ามีเลขคำขอตรงกับหน้าสำเร็จ และ notification_status เป็น `SENT`
4. ตรวจว่าได้รับอีเมลจริงในกล่องจดหมาย การแสดง `SENT` หมายถึง MailApp รับคำสั่งแล้ว ไม่ใช่หลักฐานว่าเมลเข้ากล่องจดหมาย
5. ทดสอบการส่งซ้ำว่ามีเพียงแถวเดียวและอีเมลเดียว จากนั้นทดสอบภายนอกเมื่อได้รับอนุญาตเปิดฟอร์ม
6. หลังผ่านจึงเปลี่ยนปุ่ม Landing Page เป็นลิงก์ฟอร์มและ deploy เฉพาะเว็บ Landing Page

หากต้องการตั้งค่าตารางก่อนส่ง ให้เปิด Apps Script จาก Sheet แล้วรัน `setupLeadInbox` ด้วยเจ้าของ หลัง reload Sheet จะมีเมนู Safe-to-Insight Leads

## เมื่อแจ้งเตือนไม่สำเร็จ

- `PENDING`: บันทึกแล้ว ยังไม่เสร็จขั้นส่ง
- `QUOTA`: โควตาส่งอีเมลไม่พอ
- `FAILED`: MailApp แจ้ง error; คำขอยังอยู่ใน Sheet
- `SENDING`: เริ่มส่งแล้วแต่ยังยืนยันสถานะไม่ได้ ต้องตรวจอีเมลก่อน ไม่ retry อัตโนมัติเพราะอาจส่งไปแล้ว
- `SENT`: MailApp รับคำสั่งส่งแล้ว

เจ้าของเลือกเมนู **ลองส่งการแจ้งเตือนที่ค้างอีกครั้ง** เพื่อส่ง PENDING/FAILED/QUOTA ครั้งละไม่เกิน 10 รายการ ไม่มี scheduled trigger ในรุ่นนี้

## การป้องกันและข้อจำกัด

- ตรวจชนิด/ความยาว input, honeypot, token อายุหนึ่งชั่วโมง, lock และ idempotency; escape สูตรใน Sheet
- จำกัด 20 คำขอต่อชั่วโมง / 60 ต่อวัน / 3 ต่ออีเมลต่อวัน (Asia/Bangkok)
- ขีดจำกัดนี้เป็นการลด spam เบื้องต้น ไม่ใช่ CAPTCHA หรือการป้องกัน distributed abuse; ผู้โจมตีอาจใช้โควตาจนคนอื่นส่งไม่ได้
- ไม่มี public API อ่านคำขอ รายชื่อลูกค้า หรือ config; admin functions ตรวจอีเมลเจ้าของก่อนเข้าถึง Sheet
- หน้าแบบฟอร์มแจ้งวัตถุประสงค์และช่องทางขอแก้ไข/ลบข้อมูล ไม่มี opt-in การตลาดหรือการแนบไฟล์
- ยังไม่ลบคำขออัตโนมัติ เจ้าของต้องกำหนดระยะเวลาเก็บและทบทวนข้อมูลก่อนเปิดเชิงพาณิชย์เต็มรูปแบบ
- ไม่ log payload หรือ token ใน console และไม่เก็บ credentials ใน repo

## ทดสอบในเครื่อง

จาก root ของ repo: `node --test tests/lead-inbox.test.cjs tests/landing-entry.test.cjs tests/demo-model.test.cjs`

ผ่าน 42 tests (25 lead inbox + 17 landing) แต่ไม่แทนการทดสอบสิทธิ์และส่งอีเมลจริงบน Google

## การเปิดฟอร์มสาธารณะ — 1 ตุลาคม 2569

- ผู้ใช้อนุญาตให้เปิดเฉพาะฟอร์มรับคำขอโดยไม่ล็อกอิน และเชื่อมปุ่มบน Landing Page
- Google ยืนยัน version 3, access ANYONE_ANONYMOUS; อ่านสิทธิ์ Sheet กลับแล้วยังคงมี owner คนเดียว ไม่มี public/domain sharing
- HTTP GET แบบไม่ส่ง credentials เปิดฟอร์มได้ status 200 ทั้ง URL ทั่วไปและแบบระบุโดเมน ไม่ redirect ไป sign-in
- ทดสอบส่งผ่านเบราว์เซอร์สำเร็จ ได้เลขคำขอ `LEAD-20261001-100157-AFF968` ระบุชัดว่าเป็นข้อมูลสมมติ ไม่ใช่ลูกค้าจริง; เก็บแถวทดสอบไว้เพื่อการตรวจสอบ ไม่ลบข้อมูล
- เบราว์เซอร์ทดสอบมีหลายบัญชี Google: URL ทั่วไปถูก redirect ไป `/u/1/` แล้วแสดงข้อผิดพลาด แต่ URL แบบระบุโดเมนที่ใช้บน Landing Page ทำงานได้ ไม่อ้างว่าการส่งผ่านเบราว์เซอร์ครั้งนี้เป็น anonymous session
- Apps Script มีข้อจำกัด multi-login จึงใส่คำแนะนำหน้าต่างส่วนตัวและอีเมลสำรองไว้ใต้ปุ่ม
- โค้ด Landing Page เชื่อมสองปุ่มไปยังฟอร์มเดียวกัน `?type=demo` และ `?type=quote` ในแท็บใหม่

## ผลทดสอบจริงและการปรับคำแนะนำ — 1 ตุลาคม 2569

- เจ้าของยืนยันว่ากรอกฟอร์มและดูข้อมูลใน Sheet ได้ ภาพหน้าสำเร็จแสดงเลขคำขอ `LEAD-20261001-095010-E4888F`
- เจ้าของยืนยันในแชทว่าได้รับอีเมลแจ้งเตือนแล้ว ไม่ได้เปิดอ่านกล่องจดหมายของเจ้าของผ่านเครื่องมือ
- ปรับคำเตือนเรื่องแนบไฟล์ให้เป็นคำแนะนำการเล่าลักษณะงาน ใช้พื้นเทาอมฟ้าอ่อน และแยกข้อความเรื่องวันนัด/ใบเสนอราคาไว้ใต้ปุ่มส่ง
- ไม่เปลี่ยน backend, schema, runtime scopes หรือสิทธิ์เข้าถึง; เวอร์ชัน 1 ยังเก็บอยู่ใน Apps Script เพื่อย้อนกลับได้
- เผยแพร่ version 2 ที่ deployment เดิม และอ่านกลับจาก Google ยืนยันว่า template ตรงกับ local และ backend ไม่เปลี่ยนจาก version 1
