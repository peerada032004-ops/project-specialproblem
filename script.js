const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbwDdbyxceUlHAMBrhWyDd11pGS7A_pKnA0arbA026YCZa955uHjmcE7KnFILQBpmdJeZQ/exec";

// Config
const defaultConfig = {
  company_name: "บริษัท ทริลเลียนอีเทอร์นิตี้ จำกัด",
};

let config = { ...defaultConfig };

// Product rates (packs per box)
const productRates = {
  "Khaotalu สูตร กาแฟดำ 2.5g x 100 ซอง": 8,
  "Khaotalu สูตร กาแฟดำ 2.5g x 50 ซอง": 16,
  "Khaotalu สูตร ออริจินอล": 20,
  "Khaotalu สูตร กาแฟดำ 180g": 18,
  "Khaotalu สูตร เอสเปรสโซ่": 20,
  "Khaotalu สูตร กาแฟส้ม": 18,
  "Khaotalu สูตร หญ้าหวาน": 18,
};

// Local stock storage (simulated)
let localStock = {
  "Khaotalu สูตร กาแฟดำ 2.5g x 100 ซอง": { boxes: 0, packs: 0 },
  "Khaotalu สูตร กาแฟดำ 2.5g x 50 ซอง": { boxes: 0, packs: 0 },
  "Khaotalu สูตร ออริจินอล": { boxes: 0, packs: 0 },
  "Khaotalu สูตร กาแฟดำ 180g": { boxes: 0, packs: 0 },
  "Khaotalu สูตร เอสเปรสโซ่": { boxes: 0, packs: 0 },
  "Khaotalu สูตร กาแฟส้ม": { boxes: 0, packs: 0 },
  "Khaotalu สูตร หญ้าหวาน": { boxes: 0, packs: 0 },
};

// Load stock from localStorage
async function loadStock() {
  const container = document.getElementById("stock-list");
  container.innerHTML =
    '<div class="text-center p-4"><div class="loading-spinner mx-auto"></div><p class="mt-2 text-gray-500">กำลังโหลดข้อมูลล่าสุด...</p></div>';

  try {
    // เรียกไปที่ URL เดิมของคุณ แต่เพิ่ม ?action=getStock ต่อท้าย
    // หมายเหตุ: ต้องใช้ URL ของ Web App ล่าสุดของคุณ
    const response = await fetch(WEB_APP_URL + "?action=getStock");
    const data = await response.json();

    // อัปเดตตัวแปร Global
    currentStock = data;

    // เรียกฟังก์ชันแสดงผล
    renderStock(currentStock);
  } catch (error) {
    console.error("Load Stock Error:", error);
    container.innerHTML =
      '<div class="text-center text-red-500 p-4">ไม่สามารถโหลดข้อมูลได้ <br><button onclick="loadStock()" class="mt-2 underline">ลองใหม่</button></div>';
  }
}

// Save stock to localStorage
function saveStock() {
  localStorage.setItem("khaotalu_stock", JSON.stringify(localStock));
}

// Navigation
function showPage(pageName) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-btn")
    .forEach((b) => b.classList.remove("active"));

  document.getElementById("page-" + pageName).classList.add("active");
  event.target.closest(".nav-btn").classList.add("active");

  if (pageName === "stock") {
    renderStock();
  }
}

// Toast notification
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : "bg-amber-500"
  } text-white text-sm`;
  toast.innerHTML = `<span>${type === "success" ? "✅" : type === "error" ? "❌" : "⚠️"}</span> ${message}`;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// Export page functions
function updateExportInfo() {
  const select = document.getElementById("export-product");
  const option = select.options[select.selectedIndex];
  const rate = option.dataset.rate;
  const infoDiv = document.getElementById("export-info");
  const rateSpan = document.getElementById("rate-info");

  if (rate) {
    infoDiv.classList.remove("hidden");
    rateSpan.textContent = `1 กล่อง = ${rate} ห่อ`;
    calculateTotal();
  } else {
    infoDiv.classList.add("hidden");
  }
}

function calculateTotal() {
  const select = document.getElementById("export-product");
  const option = select.options[select.selectedIndex];
  const rate = parseInt(option.dataset.rate) || 0;
  const qty = parseInt(document.getElementById("export-qty").value) || 0;
  const unit = document.getElementById("export-unit").value;

  let totalPacks = unit === "กล่อง" ? qty * rate : qty;
  document.getElementById("total-packs").textContent = totalPacks + " ห่อ";
}

// Render stock list
function renderStock(stockData) {
  const container = document.getElementById("stock-list");

  // รายชื่อสินค้าทั้งหมดที่ควรมี (เผื่อใน Sheet ยังไม่มีข้อมูลบางตัว จะได้โชว์เป็น 0)
  const allProducts = Object.keys(productRates);

  const shortNames = {
    "Khaotalu สูตร กาแฟดำ 2.5g x 100 ซอง": "กาแฟดำ 100 ซอง",
    "Khaotalu สูตร กาแฟดำ 2.5g x 50 ซอง": "กาแฟดำ 50 ซอง",
    "Khaotalu สูตร ออริจินอล": "ออริจินอล",
    "Khaotalu สูตร กาแฟดำ 180g": "กาแฟดำ 180g",
    "Khaotalu สูตร เอสเปรสโซ่": "เอสเปรสโซ่",
    "Khaotalu สูตร กาแฟส้ม": "กาแฟส้ม",
    "Khaotalu สูตร หญ้าหวาน": "หญ้าหวาน",
  };

  const emojis = ["☕", "☕", "☕", "☕", "☕", "🍊", "🌿"];
  let html = "";

  allProducts.forEach((productName, index) => {
    // ดึงข้อมูลจาก stockData ถ้าไม่มีให้เป็น 0
    const item = stockData[productName] || { boxes: 0, packs: 0 };
    const rate = productRates[productName];
    const isLow = item.boxes < 5; // แจ้งเตือนถ้าต่ำกว่า 5 กล่อง

    html += `
             <div class="stock-card rounded-xl p-4 ${isLow ? "bg-red-50" : ""}">
               <div class="flex items-center justify-between">
                 <div class="flex items-center gap-3">
                   <span class="text-2xl">${emojis[index] || "📦"}</span>
                   <div>
                     <div class="font-medium text-gray-800">${shortNames[productName] || productName}</div>
                     <div class="text-xs text-gray-500">1 กล่อง = ${rate} ห่อ</div>
                   </div>
                 </div>
                 <div class="text-right">
                   <div class="text-2xl font-bold ${isLow ? "text-red-600" : "text-amber-700"}">${item.boxes}</div>
                   <div class="text-xs text-gray-500">กล่อง</div>
                   ${item.packs > 0 ? `<div class="text-xs text-amber-600">+ ${item.packs} ห่อ</div>` : ""}
                 </div>
               </div>
               ${isLow ? '<div class="mt-2 text-xs text-red-600 flex items-center gap-1"><span>⚠️</span> สินค้าใกล้หมด</div>' : ""}
             </div>
           `;
  });

  container.innerHTML = html;
}

function refreshStock() {
  showToast("รีเฟรชข้อมูล Stock สำเร็จ", "success");
  renderStock();
}

// Form submissions
document
  .getElementById("receive-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const btn = document.getElementById("receive-submit-btn");
    const btnText = document.getElementById("receive-btn-text");
    const spinner = document.getElementById("receive-spinner");

    btn.disabled = true;
    btnText.textContent = "กำลังบันทึก...";
    spinner.classList.remove("hidden");

    const formData = new FormData(this);
    const data = {
      action: "receive",
      timestamp: new Date().toISOString(),
      receive_date: formData.get("receive_date"),
      receive_time: formData.get("receive_time"),
      po_number: formData.get("po_number"),
      product_1: parseInt(formData.get("product_1")) || 0,
      product_2: parseInt(formData.get("product_2")) || 0,
      product_3: parseInt(formData.get("product_3")) || 0,
      product_4: parseInt(formData.get("product_4")) || 0,
      product_5: parseInt(formData.get("product_5")) || 0,
      product_6: parseInt(formData.get("product_6")) || 0,
      product_7: parseInt(formData.get("product_7")) || 0,
      driver_name: formData.get("driver_name"),
      car_plate: formData.get("car_plate"),
      receiver_name: formData.get("receiver_name"),
      note: formData.get("note"),
    };

    // Update local stock
    const products = Object.keys(localStock);
    localStock[products[0]].boxes += data.product_1;
    localStock[products[1]].boxes += data.product_2;
    localStock[products[2]].boxes += data.product_3;
    localStock[products[3]].boxes += data.product_4;
    localStock[products[4]].boxes += data.product_5;
    localStock[products[5]].boxes += data.product_6;
    localStock[products[6]].boxes += data.product_7;
    saveStock();

    try {
      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      showToast("บันทึกการรับสินค้าสำเร็จ!", "success");
      this.reset();
      setDefaultDateTime();
      loadStock();
    } catch (error) {
      showToast("เกิดข้อผิดพลาด แต่ข้อมูลถูกบันทึกในระบบแล้ว", "warning");
    }

    btn.disabled = false;
    btnText.textContent = "💾 บันทึกการรับสินค้า";
    spinner.classList.add("hidden");
  });

document
  .getElementById("export-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const btn = document.getElementById("export-submit-btn");
    const btnText = document.getElementById("export-btn-text");
    const spinner = document.getElementById("export-spinner");

    btn.disabled = true;
    btnText.textContent = "กำลังบันทึก...";
    spinner.classList.remove("hidden");

    const formData = new FormData(this);
    const productName = formData.get("product_name");
    const quantity = parseInt(formData.get("quantity")) || 0;
    const unit = formData.get("unit");
    const rate = productRates[productName];
    const totalPacks = unit === "กล่อง" ? quantity * rate : quantity;

    const data = {
      action: "export",
      timestamp: new Date().toISOString(),
      export_date: formData.get("export_date"),
      product_name: productName,
      quantity: quantity,
      unit: unit,
      total_packs: totalPacks,
      note: formData.get("export_note"),
    };

    // Update local stock
    if (unit === "กล่อง") {
      localStock[productName].boxes -= quantity;
    } else {
      localStock[productName].packs -= quantity;
      // Convert negative packs to boxes
      while (localStock[productName].packs < 0) {
        localStock[productName].boxes--;
        localStock[productName].packs += rate;
      }
    }
    saveStock();

    try {
      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      showToast("บันทึกการส่งออกสำเร็จ!", "success");
      this.reset();
      setDefaultExportDate();
      loadStock();
    } catch (error) {
      showToast("เกิดข้อผิดพลาด แต่ข้อมูลถูกบันทึกในระบบแล้ว", "warning");
    }

    btn.disabled = false;
    btnText.textContent = "📦 บันทึกการส่งออก";
    spinner.classList.add("hidden");
  });

document
  .getElementById("stock-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const btn = document.getElementById("stock-submit-btn");
    const btnText = document.getElementById("stock-btn-text");
    const spinner = document.getElementById("stock-spinner");

    // 1. ล็อคปุ่ม
    btn.disabled = true;
    btnText.textContent = "กำลังบันทึก...";
    spinner.classList.remove("hidden");

    const formData = new FormData(this);
    const productName = formData.get("stock_product");
    const adjustType = formData.get("adjustment_type");
    const quantity = parseInt(formData.get("stock_quantity")) || 0;

    // --- [ลบ] ไม่ต้องคำนวณ localStock เองแล้ว ปล่อยให้ Server จัดการ ---

    const data = {
      action: "stock_adjustment",
      timestamp: new Date().toISOString(),
      product_name: productName,
      adjustment_type: adjustType,
      quantity: quantity,
      note: formData.get("stock_note"),
    };

    try {
      // 2. ส่งข้อมูลไป Google Script
      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // ใช้ text/plain ปลอดภัยกว่าสำหรับ no-cors
        body: JSON.stringify(data),
      });

      showToast("ส่งคำขอปรับปรุงเรียบร้อย... กำลังอัปเดต", "success");

      // 3. [สำคัญ] หน่วงเวลา 2 วินาที รอให้ Google Sheet บันทึกเสร็จก่อน
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.reset();

      // 4. ดึงข้อมูลใหม่
      await loadStock();
    } catch (error) {
      console.error(error);
      showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ", "warning");
    }

    // 5. คืนค่าปุ่ม
    btn.disabled = false;
    btnText.textContent = "💾 บันทึกการปรับปรุง Stock";
    spinner.classList.add("hidden");
  });

// Set default date/time
function setDefaultDateTime() {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().slice(0, 5);

  const dateInput = document.querySelector(
    '#receive-form [name="receive_date"]',
  );
  const timeInput = document.querySelector(
    '#receive-form [name="receive_time"]',
  );

  if (dateInput) dateInput.value = dateStr;
  if (timeInput) timeInput.value = timeStr;
}

function setDefaultExportDate() {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const dateInput = document.querySelector('#export-form [name="export_date"]');
  if (dateInput) dateInput.value = dateStr;
}

// Initialize
function init() {
  setDefaultDateTime();
  setDefaultExportDate();
  loadStock();

  // Element SDK init
  if (window.elementSdk) {
    window.elementSdk.init({
      defaultConfig,
      onConfigChange: async (newConfig) => {
        config = { ...newConfig };
        document.getElementById("company-title").textContent =
          config.company_name || defaultConfig.company_name;
      },
      mapToCapabilities: (cfg) => ({
        recolorables: [],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined,
      }),
      mapToEditPanelValues: (cfg) =>
        new Map([
          ["company_name", cfg.company_name || defaultConfig.company_name],
        ]),
    });
  }
}

init();

(function () {
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement("script");
      d.innerHTML =
        "window.__CF$cv$params={r:'9c925295d1678940',t:'MTc3MDI5MzYxNS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
      b.getElementsByTagName("head")[0].appendChild(d);
    }
  }
  if (document.body) {
    var a = document.createElement("iframe");
    a.height = 1;
    a.width = 1;
    a.style.position = "absolute";
    a.style.top = 0;
    a.style.left = 0;
    a.style.border = "none";
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    if ("loading" !== document.readyState) c();
    else if (window.addEventListener)
      document.addEventListener("DOMContentLoaded", c);
    else {
      var e = document.onreadystatechange || function () {};
      document.onreadystatechange = function (b) {
        e(b);
        "loading" !== document.readyState &&
          ((document.onreadystatechange = e), c());
      };
    }
  }
})();
