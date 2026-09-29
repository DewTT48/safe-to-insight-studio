const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const menu = document.querySelector("[data-menu]");

const closeMenu = () => {
  if (!menuButton || !menu) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "เปิดเมนู");
  menu.classList.remove("open");
  document.body.classList.remove("menu-open");
};

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
    menuButton.setAttribute("aria-label", open ? "เปิดเมนู" : "ปิดเมนู");
    menu.classList.toggle("open", !open);
    document.body.classList.toggle("menu-open", !open);
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 12);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -30px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const demoContent = {
  pseudonym: {
    method: "ทำรหัสแทน",
    title: "ยังติดตามคนเดิมในชุดข้อมูลได้ โดยไม่เปิดเผยชื่อ",
    description: "ระบบสร้างรหัสคงที่ตามแถวหรือรหัสอ้างอิงที่กำหนด เพื่อหลีกเลี่ยงการรวมคนชื่อซ้ำเป็นบุคคลเดียวกันโดยอัตโนมัติ",
    beforeLabel: "ชื่อ-นามสกุล",
    before: "สมชาย ใจดี",
    afterLabel: "รหัสบุคคล",
    after: "PERSON-A12F",
    transform: "PSEUDONYMIZE"
  },
  mask: {
    method: "ปิดบังบางส่วน",
    title: "ซ่อนส่วนที่ไม่จำเป็น แต่ยังเหลือรูปแบบให้ตรวจสอบได้",
    description: "เหมาะกับข้อมูลที่ทีมยังต้องเห็นบางหลักเพื่อแยกประเภทหรือเช็กความครบถ้วน โดยไม่จำเป็นต้องเปิดเผยค่าทั้งหมด",
    beforeLabel: "เบอร์โทรศัพท์",
    before: "089-123-4567",
    afterLabel: "เบอร์ที่ปิดบังแล้ว",
    after: "089-XXX-4567",
    transform: "MASK"
  },
  generalize: {
    method: "ลดความละเอียด",
    title: "เก็บประโยชน์เชิงสถิติ โดยลดโอกาสระบุตัวบุคคล",
    description: "เปลี่ยนค่าที่ละเอียดเกินจำเป็นให้เป็นช่วงหรือกลุ่ม เช่น อายุ 42 ปีเป็นช่วง 40–49 ปี เพื่อใช้วิเคราะห์ภาพรวม",
    beforeLabel: "อายุ",
    before: "42 ปี",
    afterLabel: "ช่วงอายุ",
    after: "40–49 ปี",
    transform: "GENERALIZE"
  },
  remove: {
    method: "ตัดคอลัมน์",
    title: "ข้อมูลที่ไม่จำเป็นต่อวัตถุประสงค์ ไม่ควรติดไปกับไฟล์",
    description: "ถ้าคอลัมน์ไม่ได้ช่วยตอบคำถามการวิเคราะห์ การตัดออกมักเป็นวิธีที่ตรงไปตรงมาและลดความเสี่ยงได้มากที่สุด",
    beforeLabel: "เลขบัตรประชาชน",
    before: "1-2345-67890-12-3",
    afterLabel: "ผลลัพธ์",
    after: "ตัดออก",
    transform: "REMOVE"
  }
};

const demoTargets = {
  method: document.querySelector("[data-method]"),
  title: document.querySelector("[data-demo-title]"),
  description: document.querySelector("[data-demo-description]"),
  beforeLabel: document.querySelector("[data-before-label]"),
  before: document.querySelector("[data-before]"),
  afterLabel: document.querySelector("[data-after-label]"),
  after: document.querySelector("[data-after]"),
  transform: document.querySelector("[data-transform-label]")
};

document.querySelectorAll("[data-demo]").forEach((button) => {
  button.addEventListener("click", () => {
    const content = demoContent[button.dataset.demo];
    if (!content) return;

    document.querySelectorAll("[data-demo]").forEach((item) => item.setAttribute("aria-selected", "false"));
    button.setAttribute("aria-selected", "true");

    Object.entries(demoTargets).forEach(([key, target]) => {
      if (target) target.textContent = content[key];
    });
  });
});

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq-list details[open]").forEach((other) => {
      if (other !== detail) other.removeAttribute("open");
    });
  });
});

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
