/* Synthetic demo only. No files, storage, requests, or AI calls. */
(function (root) {
  "use strict";
  const methods = {
    keep: {
      label: "เก็บข้อมูลเดิม",
      description:
        "เก็บค่าเดิมไว้ ลองทบทวนว่าต้องใช้ข้อมูลนี้ตอบคำถามหรือไม่ และมีสิทธิ์ส่งต่อหรือเปล่า",
    },
    pseudonym: {
      label: "เปลี่ยนเป็นรหัส",
      description:
        "ใช้รหัสแทนชื่อ โดยอ้างอิงรหัสต้นทาง ไม่รวมคนหรือบริษัทเข้าด้วยกันเพียงเพราะชื่อเหมือนกัน ข้อมูลอื่นอาจยังบอกได้ว่าเป็นใคร",
    },
    mask: {
      label: "ปิดบังข้อมูล",
      description:
        "ซ่อนค่าทั้งช่อง แต่ยังต้องดูคอลัมน์อื่นด้วยว่าเชื่อมโยงกลับไปหาคนหรือบริษัทเดิมได้หรือไม่",
    },
    generalize: {
      label: "ลดความละเอียด",
      description:
        "แสดงเป็นช่วงแทนตัวเลขจริง เหมาะกับการดูภาพรวม แต่จะนำไปคำนวณยอดที่แน่นอนไม่ได้",
    },
    remove: {
      label: "ตัดคอลัมน์ออก",
      description:
        "เอาคอลัมน์นี้ออกจากผลลัพธ์ ตารางต้นฉบับทางซ้ายยังอยู่ให้เปรียบเทียบ",
    },
  };
  const textMethods = ["keep", "mask", "remove"];
  const identityMethods = ["keep", "pseudonym", "mask", "remove"];
  const numberMethods = ["keep", "generalize", "mask", "remove"];
  const scenarios = {
    business: {
      label: "ข้อมูลธุรกิจ",
      filename: "ยอดขายรายลูกค้า_Q3_2569.xlsx",
      question: "สินค้ากลุ่มไหนทำกำไรได้มากที่สุด?",
      fileNote:
        "8 รายการขาย · ยอดขายหลังหักส่วนลด ไม่รวม VAT · กำไรขั้นต้น = ยอดขาย − ต้นทุนสินค้า",
      columns: [
        {
          key: "client",
          label: "ชื่อลูกค้า",
          methods: ["keep", "pseudonym", "mask", "remove"],
          context:
            "ถ้าต้องการรวมกำไรตามกลุ่มสินค้า ก็ไม่จำเป็นต้องส่งชื่อลูกค้าไปด้วย",
          prefix: "CLIENT",
        },
        {
          key: "product",
          label: "รายการสินค้า",
          methods: ["keep", "mask", "remove"],
          context:
            "ชื่อสินค้าช่วยให้เข้าใจว่าขายอะไร แต่หากต้องการดูแค่ภาพรวม สามารถเก็บเฉพาะกลุ่มสินค้าได้",
        },
        {
          key: "category",
          label: "กลุ่มสินค้า",
          methods: ["keep", "mask", "remove"],
          context: "เก็บคอลัมน์นี้ไว้เพื่อรวมกำไรแยกตามกลุ่มสินค้า",
        },
        {
          key: "quantity",
          label: "จำนวน",
          methods: ["keep", "generalize", "mask", "remove"],
          context:
            "จำนวนสินค้าบอกขนาดของแต่ละคำสั่งซื้อ คำถามนี้ใช้ตัวเลขกำไรที่คำนวณไว้แล้ว จึงไม่ต้องใช้จำนวนสินค้า",
          unit: "ชิ้น",
          band: 10,
        },
        {
          key: "unitPrice",
          label: "ราคาต่อหน่วย (บาท)",
          methods: ["keep", "generalize", "mask", "remove"],
          context:
            "เมื่ออ่านคู่กับจำนวนและส่วนลด จะคำนวณกลับเป็นยอดขายได้ แม้จะลบคอลัมน์ยอดขายออกแล้ว",
          unit: "บาท",
          band: 10000,
        },
        {
          key: "discount",
          label: "ส่วนลด (%)",
          methods: ["keep", "generalize", "mask", "remove"],
          context:
            "เมื่อจับคู่กับชื่อลูกค้า จะเห็นว่าลูกค้ารายไหนได้รับส่วนลดเท่าไร",
          unit: "%",
          band: 5,
        },
        {
          key: "sales",
          label: "ยอดขาย (บาท)",
          methods: ["keep", "generalize", "mask", "remove"],
          context:
            "ยอดขายบอกมูลค่าของแต่ละคำสั่งซื้อ และเมื่อนำไปหักกำไร ก็จะคำนวณต้นทุนกลับได้",
          unit: "บาท",
          band: 50000,
        },
        {
          key: "cost",
          label: "ต้นทุน (บาท)",
          methods: ["keep", "generalize", "mask", "remove"],
          context:
            "ต้นทุนต่อรายการเป็นข้อมูลภายใน สำหรับคำถามนี้ใช้กำไรขั้นต้นที่คำนวณไว้แล้วได้",
          unit: "บาท",
          band: 50000,
        },
        {
          key: "profit",
          label: "กำไรขั้นต้น (บาท)",
          methods: ["keep", "generalize", "mask", "remove"],
          context:
            "ต้องใช้กำไรที่เป็นตัวเลขเพื่อรวมยอด หากเปลี่ยนเป็นช่วงหรือปิดบัง จะรวมกำไรที่แน่นอนไม่ได้",
          unit: "บาท",
          band: 10000,
        },
      ],
      rows: [
        {
          id: "B1",
          entity: "C1",
          client: "บริษัท เมฆา ดีไซน์ จำกัด",
          product: "โน้ตบุ๊ก 14 นิ้ว RAM 16 GB",
          category: "คอมพิวเตอร์",
          quantity: 10,
          unitPrice: 28500,
          discount: 5,
          sales: 270750,
          cost: 238000,
          profit: 32750,
        },
        {
          id: "B2",
          entity: "C2",
          client: "บริษัท ธารา โลจิสติกส์ จำกัด",
          product: "เก้าอี้สำนักงานพนักพิงตาข่าย",
          category: "เฟอร์นิเจอร์",
          quantity: 20,
          unitPrice: 6900,
          discount: 10,
          sales: 124200,
          cost: 90000,
          profit: 34200,
        },
        {
          id: "B3",
          entity: "C3",
          client: "บริษัท นวา แอคเคาน์ติ้ง จำกัด",
          product: "จอภาพ IPS 24 นิ้ว",
          category: "คอมพิวเตอร์",
          quantity: 12,
          unitPrice: 5900,
          discount: 5,
          sales: 67260,
          cost: 51000,
          profit: 16260,
        },
        {
          id: "B4",
          entity: "C1",
          client: "บริษัท เมฆา ดีไซน์ จำกัด",
          product: "โต๊ะทำงานปรับระดับ 120 ซม.",
          category: "เฟอร์นิเจอร์",
          quantity: 10,
          unitPrice: 8900,
          discount: 8,
          sales: 81880,
          cost: 62000,
          profit: 19880,
        },
        {
          id: "B5",
          entity: "C4",
          client: "บริษัท พฤกษ์พิมาน ฟู้ดส์ จำกัด",
          product: "เครื่องพิมพ์เลเซอร์ขาวดำ Wi-Fi",
          category: "เครื่องพิมพ์",
          quantity: 4,
          unitPrice: 12900,
          discount: 5,
          sales: 49020,
          cost: 36000,
          profit: 13020,
        },
        {
          id: "B6",
          entity: "C5",
          client: "บริษัท อรุณวาด สตูดิโอ จำกัด",
          product: "โน้ตบุ๊ก 14 นิ้ว RAM 16 GB",
          category: "คอมพิวเตอร์",
          quantity: 6,
          unitPrice: 28500,
          discount: 3,
          sales: 165870,
          cost: 142800,
          profit: 23070,
        },
        {
          id: "B7",
          entity: "C2",
          client: "บริษัท ธารา โลจิสติกส์ จำกัด",
          product: "ตู้เอกสารเหล็กบานเลื่อน 4 ฟุต",
          category: "เฟอร์นิเจอร์",
          quantity: 8,
          unitPrice: 4900,
          discount: 10,
          sales: 35280,
          cost: 27200,
          profit: 8080,
        },
        {
          id: "B8",
          entity: "C6",
          client: "บริษัท ลลินทิพย์ เทรดดิ้ง จำกัด",
          product: "เครื่องพิมพ์มัลติฟังก์ชัน Ink Tank",
          category: "เครื่องพิมพ์",
          quantity: 5,
          unitPrice: 7900,
          discount: 4,
          sales: 37920,
          cost: 29000,
          profit: 8920,
        },
      ],
      defaults: {
        client: "pseudonym",
        product: "keep",
        category: "keep",
        quantity: "remove",
        unitPrice: "remove",
        discount: "remove",
        sales: "remove",
        cost: "remove",
        profit: "keep",
      },
      required: ["category", "profit"],
      exposure: [
        {
          keys: ["client", "discount"],
          title: "ใครได้ส่วนลดเท่าไร",
          detail:
            "บริษัท เมฆา ดีไซน์ จำกัด ได้ส่วนลด 5% สำหรับโน้ตบุ๊ก ส่วนบริษัท ธารา โลจิสติกส์ จำกัด ได้ 10% สำหรับเก้าอี้สำนักงาน — เงื่อนไขการขายติดมากับไฟล์ด้วย",
        },
        {
          keys: ["product", "cost", "profit"],
          title: "แต่ละงานเหลือกำไรเท่าไร",
          detail:
            "โน้ตบุ๊ก 10 เครื่อง มีต้นทุน 238,000 บาท และกำไรขั้นต้น 32,750 บาท ทั้งที่โจทย์ต้องการเพียงกำไรรวมตามกลุ่มสินค้า",
        },
        {
          keys: [
            "quantity",
            "unitPrice",
            "discount",
            "sales",
            "cost",
            "profit",
          ],
          title: "ลบต้นทุนอย่างเดียว อาจยังคำนวณกลับได้",
          detail:
            "ถ้ายังมียอดขายและกำไร ก็หาต้นทุนกลับได้ หรือใช้จำนวน × ราคาต่อหน่วย × (1 − ส่วนลด) เพื่อหายอดขายก่อน ต้องดูหลายคอลัมน์ร่วมกัน",
        },
      ],
    },
    people: {
      label: "ข้อมูลพนักงาน",
      filename: "ทะเบียนพนักงาน_Q3_2569.xlsx",
      question: "แต่ละแผนกมีสัดส่วนพนักงานลาออกเท่าไร?",
      fileNote:
        "พนักงานสมมติ 8 คน · เงินเดือนต่อเดือน · ใช้สาธิต ไม่ใช่ข้อมูลสำหรับสรุปแนวโน้มจริง",
      columns: [
        {
          key: "name",
          label: "ชื่อ–นามสกุล",
          methods: ["keep", "pseudonym", "mask", "remove"],
          context:
            "ไม่ต้องใช้ชื่อเพื่อดูสัดส่วนการลาออก ในตัวอย่างมีพนักงานชื่อซ้ำ 2 คน ซึ่งต้องได้คนละรหัส",
          prefix: "EMP",
        },
        {
          key: "email",
          label: "อีเมล",
          methods: ["keep", "mask", "remove"],
          context:
            "อีเมลช่วยระบุตัวพนักงาน แต่ไม่จำเป็นสำหรับคำถามนี้ อีเมลในตัวอย่างใช้ example.com ทั้งหมด",
        },
        {
          key: "department",
          label: "แผนก",
          methods: ["keep", "mask", "remove"],
          context: "เก็บแผนกไว้เพื่อเปรียบเทียบสัดส่วนการลาออก",
        },
        {
          key: "position",
          label: "ตำแหน่ง",
          methods: ["keep", "mask", "remove"],
          context:
            "แม้จะซ่อนชื่อแล้ว ตำแหน่งที่มีคนเดียวในแผนกก็อาจทำให้รู้ว่าเป็นใคร",
        },
        {
          key: "salary",
          label: "เงินเดือน (บาท)",
          methods: ["keep", "generalize", "mask", "remove"],
          context:
            "ถ้าต้องการดูสัดส่วนการลาออกตามแผนก ก็ไม่จำเป็นต้องส่งเงินเดือนของแต่ละคนไปด้วย",
          unit: "บาท",
          band: 10000,
        },
        {
          key: "tenure",
          label: "อายุงาน (ปี)",
          methods: ["keep", "generalize", "mask", "remove"],
          context:
            "อายุงานช่วยตอบคำถามเรื่องการอยู่กับองค์กร แต่ไม่จำเป็นสำหรับคำถามที่เลือกอยู่ตอนนี้",
          unit: "ปี",
          band: 5,
        },
        {
          key: "status",
          label: "สถานะ",
          methods: ["keep", "mask", "remove"],
          context: "เก็บสถานะไว้เพื่อแยกจำนวนคนที่ลาออกจากจำนวนพนักงานทั้งหมด",
        },
      ],
      rows: [
        {
          id: "P1",
          entity: "P1",
          name: "ณัฐวุฒิ ใจมั่น",
          email: "nattawut.1@example.com",
          department: "ขาย",
          position: "เจ้าหน้าที่ฝ่ายขาย",
          salary: 38500,
          tenure: 3,
          status: "ลาออก",
        },
        {
          id: "P2",
          entity: "P2",
          name: "พิมพ์ชนก วัฒนกุล",
          email: "pimchanok@example.com",
          department: "ไอที",
          position: "นักพัฒนาระบบ",
          salary: 62000,
          tenure: 6,
          status: "ทำงาน",
        },
        {
          id: "P3",
          entity: "P3",
          name: "กิตติภพ รุ่งเรือง",
          email: "kittiphop@example.com",
          department: "ขาย",
          position: "ผู้จัดการฝ่ายขาย",
          salary: 78000,
          tenure: 8,
          status: "ทำงาน",
        },
        {
          id: "P4",
          entity: "P4",
          name: "ณัฐวุฒิ ใจมั่น",
          email: "nattawut.2@example.com",
          department: "ไอที",
          position: "เจ้าหน้าที่ดูแลระบบ",
          salary: 42000,
          tenure: 2,
          status: "ทำงาน",
        },
        {
          id: "P5",
          entity: "P5",
          name: "ศิริพร แสงสกุล",
          email: "siriporn@example.com",
          department: "บัญชี",
          position: "เจ้าหน้าที่บัญชี",
          salary: 34500,
          tenure: 4,
          status: "ทำงาน",
        },
        {
          id: "P6",
          entity: "P6",
          name: "ธนกฤต พูนผล",
          email: "thanakrit@example.com",
          department: "ขาย",
          position: "เจ้าหน้าที่ฝ่ายขาย",
          salary: 32000,
          tenure: 1,
          status: "ลาออก",
        },
        {
          id: "P7",
          entity: "P7",
          name: "อรณิชา วงศ์มณี",
          email: "ornnicha@example.com",
          department: "บัญชี",
          position: "หัวหน้าฝ่ายบัญชี",
          salary: 58000,
          tenure: 7,
          status: "ทำงาน",
        },
        {
          id: "P8",
          entity: "P8",
          name: "ปกรณ์ ธรรมรักษ์",
          email: "pakorn@example.com",
          department: "ไอที",
          position: "นักวิเคราะห์ระบบ",
          salary: 55000,
          tenure: 5,
          status: "ลาออก",
        },
      ],
      defaults: {
        name: "pseudonym",
        email: "remove",
        department: "keep",
        position: "remove",
        salary: "remove",
        tenure: "keep",
        status: "keep",
      },
      required: ["department", "status"],
      exposure: [
        {
          keys: ["name", "salary"],
          title: "ชื่อกับเงินเดือนถูกส่งไปพร้อมกัน",
          detail:
            "กิตติภพ รุ่งเรือง มีเงินเดือน 78,000 บาทต่อเดือน ทั้งที่การนับคนลาออกแยกตามแผนกไม่ต้องใช้เงินเดือน",
        },
        {
          keys: ["department", "position"],
          title: "ไม่มีชื่อ ก็อาจรู้ว่าเป็นใคร",
          detail:
            "ในตัวอย่างมีผู้จัดการฝ่ายขายเพียงคนเดียว ถ้ายังมีแผนกและตำแหน่งอยู่ คนที่รู้จักทีมอาจเชื่อมโยงกลับได้",
        },
        {
          keys: ["name", "email", "status"],
          title: "อีเมลเชื่อมกลับมาหาพนักงานได้",
          detail:
            "เมื่ออีเมลอยู่คู่กับสถานะการลาออก ก็อาจรู้ว่าใครลาออกไปแล้ว แม้จะเปลี่ยนชื่อเป็นรหัสก็ตาม",
        },
      ],
    },
  };
  function validate(scenarioKey, plan) {
    const scenario = scenarios[scenarioKey];
    if (!scenario) throw new Error("Unknown scenario");
    for (const column of scenario.columns) {
      if (!column.methods.includes(plan[column.key]))
        throw new Error("Invalid method for " + column.key);
    }
    return scenario;
  }
  function format(value) {
    return typeof value === "number"
      ? value.toLocaleString("en-US")
      : String(value);
  }
  function transform(scenarioKey, plan) {
    const scenario = validate(scenarioKey, plan);
    const columns = scenario.columns.filter(
      (column) => plan[column.key] !== "remove",
    );
    const identities = [...new Set(scenario.rows.map((row) => row.entity))];
    return {
      columns,
      rows: scenario.rows.map((row) => {
        const result = {};
        for (const column of columns) {
          const method = plan[column.key],
            value = row[column.key];
          if (method === "keep") result[column.key] = value;
          if (method === "mask") result[column.key] = "[ปิดบัง]";
          if (method === "pseudonym")
            result[column.key] =
              column.prefix +
              "-" +
              String(identities.indexOf(row.entity) + 1).padStart(3, "0");
          if (method === "generalize") {
            const start = Math.floor(value / column.band) * column.band;
            result[column.key] =
              format(start) +
              "–" +
              format(start + column.band - 1) +
              " " +
              column.unit;
          }
        }
        return result;
      }),
    };
  }
  function insight(scenarioKey, plan) {
    const scenario = validate(scenarioKey, plan);
    const missing = scenario.required.filter((key) => plan[key] !== "keep");
    if (missing.length)
      return {
        available: false,
        missing: missing.map(
          (key) => scenario.columns.find((c) => c.key === key).label,
        ),
        items: [],
      };
    // Only derive the result from the transformed dataset, never a hidden raw-data fallback.
    const output = transform(scenarioKey, plan).rows;
    const groups = new Map();
    for (const row of output) {
      const group = scenarioKey === "business" ? row.category : row.department;
      if (!groups.has(group))
        groups.set(group, { name: group, count: 0, value: 0, left: 0 });
      const item = groups.get(group);
      item.count += 1;
      if (scenarioKey === "business") item.value += row.profit;
      else if (row.status === "ลาออก") item.left += 1;
    }
    const items = [...groups.values()].map((item) => ({
      ...item,
      value:
        scenarioKey === "business"
          ? item.value
          : (item.left / item.count) * 100,
    }));
    return { available: true, items };
  }
  const api = { scenarios, methods, transform, insight, format, validate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SafeDemo = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
