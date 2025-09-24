/*  trip_planner.js – Holy Family Trail – كامل بعد التعديلات
    يحتوي على: عرض الوجهات – السحب/الإفلات – مشاركة الرابط – wizard – نصائح ديناميكية – طباعة/PDF
*/

// ========================== بيانات الوجهات ==========================
const destinations = [
  // القاهرة
  {id:"cairo_hanging_church",nameKey:"destinations.cairo.hanging_church.name",descKey:"destinations.cairo.hanging_church.desc",location:{lat:30.0061,lng:31.2304},type:"church",defaultVisitDuration:2},
  {id:"cairo_abu_serga",nameKey:"destinations.cairo.abu_serga.name",descKey:"destinations.cairo.abu_serga.desc",location:{lat:30.0045,lng:31.231},type:"church",defaultVisitDuration:1.5},
  {id:"cairo_mary_girgis",nameKey:"destinations.cairo.mary_girgis.name",descKey:"destinations.cairo.mary_girgis.desc",location:{lat:30.0057,lng:31.2321},type:"church",defaultVisitDuration:1.5},
  // الشرقية
  {id:"sharqia_tel_basta",nameKey:"destinations.sharqia.tel_basta.name",descKey:"destinations.sharqia.tel_basta.desc",location:{lat:30.566,lng:31.5},type:"archaeological",defaultVisitDuration:2},
  {id:"sharqia_belbeis",nameKey:"destinations.sharqia.belbeis.name",descKey:"destinations.sharqia.belbeis.desc",location:{lat:30.42,lng:31.56},type:"church",defaultVisitDuration:2},
  // المنيا
  {id:"minya_gabal_elteir",nameKey:"destinations.minya.gabal_elteir.name",descKey:"destinations.minya.gabal_elteir.desc",location:{lat:28.08,lng:30.75},type:"sacred_mountain",defaultVisitDuration:3},
  {id:"minya_ashmonin",nameKey:"destinations.minya.ashmonin.name",descKey:"destinations.minya.ashmonin.desc",location:{lat:27.78,lng:30.8},type:"archaeological",defaultVisitDuration:2},
  {id:"minya_mir",nameKey:"destinations.minya.mir.name",descKey:"destinations.minya.mir.desc",location:{lat:27.6,lng:30.9},type:"monastery",defaultVisitDuration:2},
  // أسيوط
  {id:"asyut_meir_monastery",nameKey:"destinations.asyut.meir_monastery.name",descKey:"destinations.asyut.meir_monastery.desc",location:{lat:27.3,lng:30.9},type:"monastery",defaultVisitDuration:2.5},
  {id:"asyut_dronka_monastery",nameKey:"destinations.asyut.dronka_monastery.name",descKey:"destinations.asyut.dronka_monastery.desc",location:{lat:27.18,lng:31.18},type:"monastery",defaultVisitDuration:3},
  // البحيرة
  {id:"wadi_natroun_saint_bishoy",nameKey:"destinations.beheira.wadi_natroun_saint_bishoy.name",descKey:"destinations.beheira.wadi_natroun_saint_bishoy.desc",location:{lat:30.37,lng:30.23},type:"monastery",defaultVisitDuration:2.5},
  {id:"wadi_natroun_el_suryan",nameKey:"destinations.beheira.wadi_natroun_el_suryan.name",descKey:"destinations.beheira.wadi_natroun_el_suryan.desc",location:{lat:30.39,lng:30.26},type:"monastery",defaultVisitDuration:2},
  {id:"wadi_natroun_el_baramos",nameKey:"destinations.beheira.wadi_natroun_el_baramos.name",descKey:"destinations.beheira.wadi_natroun_el_baramos.desc",location:{lat:30.42,lng:30.33},type:"monastery",defaultVisitDuration:2},
  {id:"wadi_natroun_saint_macarius",nameKey:"destinations.beheira.wadi_natroun_saint_macarius.name",descKey:"destinations.beheira.wadi_natroun_saint_macarius.desc",location:{lat:30.4,lng:30.29},type:"monastery",defaultVisitDuration:2}
];

// ========================== متغيّرات عامة ==========================
let selectedItinerary = [];
const estimatedDurationSpan = document.getElementById("estimated-duration");
const estimatedDistanceSpan = document.getElementById("estimated-distance");

// ========================== ترجمة آمنة ==========================
function safeI18n(key, opts) {
  try { return i18n.t(key, opts); } catch { return key; }
}

// ========================== محاكاة بيانات السفر ==========================
function getTravelData(fromId, toId) {
  return { time: Math.floor(Math.random() * 3) + 1, distance: Math.floor(Math.random() * 50) + 10 };
}

// ========================== تحديث الملخّص ==========================
function updateSummary() {
  let totalTime = 0, totalDistance = 0;
  selectedItinerary.forEach((item, idx) => {
    totalTime += item.userVisitDurationHours;
    if (idx < selectedItinerary.length - 1) {
      const next = selectedItinerary[idx + 1];
      const travel = getTravelData(item.id, next.id);
      totalTime += travel.time;
      totalDistance += travel.distance;
    }
  });
  if (estimatedDurationSpan) estimatedDurationSpan.textContent = totalTime.toFixed(1);
  if (estimatedDistanceSpan) estimatedDistanceSpan.textContent = totalDistance.toFixed(0);
}

// ========================== عرض الوجهات المتاحة ==========================
function renderAvailableDestinations() {
  const list = document.getElementById("destinations-list");
  if (!list) return;
  list.innerHTML = "";
  destinations.forEach(dest => {
    const card = document.createElement("div");
    card.className = "destination-card";
    card.innerHTML = `
      <h4>${safeI18n(dest.nameKey)}</h4>
      <p>${safeI18n(dest.descKey)}</p>
      <button class="btn-gold">+ <span data-i18n="plan_trip.add_btn">أضف</span></button>
    `;
    card.querySelector("button").addEventListener("click", () => addDestination(dest));
    list.appendChild(card);
  });
}

// ========================== إضافة وجهة ==========================
function addDestination(dest) {
  if (selectedItinerary.find(d => d.id === dest.id)) return;
  selectedItinerary.push({ ...dest, userVisitDurationHours: dest.defaultVisitDuration });
  renderItinerary();
  updateSummary();
  updateMapRoute();
  encodePlanToUrl();
  updateWizard();
}

// ========================== عرض خطّة المستخدم (قابلة للسحب) ==========================
function renderItinerary() {
  const list = document.getElementById("itinerary-list");
  if (!list) return;
  list.innerHTML = "";
  if (selectedItinerary.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 64 64"><path fill="#d0d0d0" d="M32 4a24 24 0 1 0 0 48 24 24 0 0 0 0-48zm0 44a20 20 0 1 1 0-40 20 20 0 0 1 0 40z"/><path fill="#d0d0d0" d="M35 21h-6v6h-4v6h4v6h6v-6h4v-6h-4z"/></svg>
        <p data-i18n="plan_trip_empty_itinerary_message">لم تُضف أي وجهة بعد. ابدأ بالنقر على "أضف".</p>
      </div>`;
    return;
  }
  selectedItinerary.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "itinerary-item";
    div.dataset.id = item.id;
    div.innerHTML = `
      <div>
        <h4>${safeI18n(item.nameKey)}</h4>
        <p><input type="range" min="0.5" max="8" step="0.5" value="${item.userVisitDurationHours}"> 
           <span>${item.userVisitDurationHours} <span data-i18n="plan_trip.hours">ساعة</span></span></p>
      </div>
      <button class="remove-btn" title="إزالة"><i class="fas fa-times"></i></button>
    `;
    // تغيير المدة
    div.querySelector("input").addEventListener("input", e => {
      item.userVisitDurationHours = +e.target.value;
      e.target.nextElementSibling.innerHTML = `${item.userVisitDurationHours} <span data-i18n="plan_trip.hours">ساعة</span>`;
      updateSummary();
      encodePlanToUrl();
    });
    // حذف
    div.querySelector(".remove-btn").addEventListener("click", () => {
      selectedItinerary.splice(idx, 1);
      renderItinerary();
      updateSummary();
      updateMapRoute();
      encodePlanToUrl();
      updateWizard();
    });
    list.appendChild(div);
  });
  // تهيئة السحب والإفلات
  Sortable.create(list, {
    animation: 200,
    ghostClass: "sortable-ghost",
    onEnd() {
      const newOrder = [];
      list.querySelectorAll(".itinerary-item").forEach(el => {
        const id = el.dataset.id;
        newOrder.push(selectedItinerary.find(i => i.id === id));
      });
      selectedItinerary = newOrder;
      updateMapRoute();
      encodePlanToUrl();
    }
  });
}

// ========================== الخريطة (Leaflet) ==========================
let map, markersLayer, routeLine;
function initMap() {
  map = L.map("map").setView([28.5, 30.8], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OSM contributors'
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}
function updateMapRoute() {
  if (!map) return;
  markersLayer.clearLayers();
  const coords = [];
  selectedItinerary.forEach((item, idx) => {
    const { lat, lng } = item.location;
    coords.push([lat, lng]);
    const m = L.marker([lat, lng]).addTo(markersLayer);
    m.bindPopup(`<b>${safeI18n(item.nameKey)}</b><br>${safeI18n(item.descKey)}`);
  });
  if (routeLine) map.removeLayer(routeLine);
  if (coords.length > 1) {
    routeLine = L.polyline(coords, { color: "var(--plan-accent)", weight: 5 }).addTo(map);
    map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
  } else if (coords.length === 1) map.setView(coords[0], 10);
}

// ========================== ترميز الخطة في الرابط ==========================
function encodePlanToUrl() {
  if (!selectedItinerary.length) { history.replaceState(null, "", "plan_trip.html"); return; }
  const plan = selectedItinerary.map(i => ({ id: i.id, hrs: i.userVisitDurationHours }));
  const hash = btoa(JSON.stringify(plan));
  history.replaceState(null, "", `?plan=${hash}`);
}
function decodePlanFromUrl() {
  const params = new URLSearchParams(location.search);
  const hash = params.get("plan");
  if (!hash) return;
  try {
    const plan = JSON.parse(atob(hash));
    selectedItinerary = plan.map(p => {
      const dest = destinations.find(d => d.id === p.id);
      return dest ? { ...dest, userVisitDurationHours: p.hrs } : null;
    }).filter(Boolean);
  } catch (e) { console.warn("Invalid plan hash"); }
}

// ========================== أزرار الطباعة، نسخ، بريد، PDF ==========================
document.addEventListener("DOMContentLoaded", () => {
  decodePlanFromUrl();
  renderAvailableDestinations();
  renderItinerary();
  renderTipsCards();               // ← سكشن النصائح
  updateSummary();
  initMap();
  updateMapRoute();
  updateWizard();

  // طباعة
  document.getElementById("print-itinerary")?.addEventListener("click", () => window.print());
  // نسخ
  document.getElementById("copy-itinerary")?.addEventListener("click", () => {
    let det = selectedItinerary.map((it, idx) =>
      `${idx + 1}. ${safeI18n(it.nameKey)} – ${it.userVisitDurationHours} ${safeI18n("plan_trip.hours")}`).join("\n");
    det += `\n\n${safeI18n("plan_trip_final_estimated_duration")}: ${estimatedDurationSpan?.textContent} ${safeI18n("plan_trip.hours")}`;
    det += `\n${safeI18n("plan_trip_final_estimated_distance")}: ${estimatedDistanceSpan?.textContent} ${safeI18n("plan_trip.km")}`;
    navigator.clipboard.writeText(det)
      .then(() => alert(safeI18n("plan_trip.copied_success")))
      .catch(() => alert(safeI18n("plan_trip.copied_fail")));
  });
  // بريد
  document.getElementById("email-itinerary")?.addEventListener("click", () => {
    let subj = encodeURIComponent(safeI18n("plan_trip_print_title"));
    let body = selectedItinerary.map((it, idx) =>
      `${idx + 1}. ${safeI18n(it.nameKey)} – ${it.userVisitDurationHours} ${safeI18n("plan_trip.hours")}`).join("%0D%0A");
    body += `%0D%0A${safeI18n("plan_trip_final_estimated_duration")}: ${estimatedDurationSpan?.textContent} ${safeI18n("plan_trip.hours")}%0D%0A`;
    body += `${safeI18n("plan_trip_final_estimated_distance")}: ${estimatedDistanceSpan?.textContent} ${safeI18n("plan_trip.km")}`;
    window.open(`mailto:?subject=${subj}&body=${body}`);
  });
  // PDF
  document.getElementById("pdf-itinerary")?.addEventListener("click", exportPDF);
  // مشاركة رابط
  document.getElementById("share-link")?.addEventListener("click", () => {
    const url = location.href;
    navigator.clipboard.writeText(url)
      .then(() => alert(safeI18n("plan_trip.link_copied")))
      .catch(() => prompt(safeI18n("plan_trip.copy_link_man"), url));
  });

  // تغيير اللغة
  document.addEventListener("i18n:languageChanged", () => {
    function renderAvailableDestinations() {
  const list = document.getElementById("destinations-list");
  if (!list) return;
  list.innerHTML = "";
  destinations.forEach(dest => {
    const card = document.createElement("div");
    card.className = "destination-card";
    card.innerHTML = `
      <h4>${safeI18n(dest.nameKey)}</h4>
      <p>${safeI18n(dest.descKey)}</p>
      <button class="btn-gold">+ <span>${t('plan_trip.add_btn')}</span></button>
    `;
    card.querySelector("button").addEventListener("click", () => addDestination(dest));
    list.appendChild(card);
  });
}
    renderItinerary(trip_planner.js);
    renderTipsCards();
    updateSummary();
    updateMapRoute();
  });
});

// ========================== تصدير PDF ==========================
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const t = (k, o) => translations[i18n.currentLang]?.[k] || k;

  const head = [["#", t("plan_trip_destinations_title"), t("plan_trip.visit_duration_label"), t("plan_trip_final_estimated_duration"), t("plan_trip_final_estimated_distance")]];
  const body = [];
  selectedItinerary.forEach((it, idx) => {
    body.push([idx + 1, safeI18n(it.nameKey), `${it.userVisitDurationHours} ${t("plan_trip.hours")}`, "", ""]);
    if (idx < selectedItinerary.length - 1) {
      const next = selectedItinerary[idx + 1];
      const tr = getTravelData(it.id, next.id);
      body.push(["", t("plan_trip.travel_to", { name: safeI18n(next.nameKey), time: tr.time, distance: tr.distance }), "", `${tr.time} ${t("plan_trip.hours")}`, `${tr.distance} ${t("plan_trip.km")}`]);
    }
  });

  doc.setFont("Cairo");
  doc.setFontSize(20);
  doc.text(t("plan_trip_print_title"), 14, 22);
  doc.autoTable({
    startY: 30,
    head,
    body,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10 }
  });
  let finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text(`${t("plan_trip_total")}`, 14, finalY);
  finalY += 8;
  doc.setFontSize(12);
  doc.text(`${t("plan_trip_final_estimated_duration")}: ${estimatedDurationSpan?.textContent} ${t("plan_trip.hours")}`, 20, finalY);
  finalY += 7;
  doc.text(`${t("plan_trip_final_estimated_distance")}: ${estimatedDistanceSpan?.textContent} ${t("plan_trip.km")}`, 20, finalY);
  doc.save("itinerary.pdf");
}

// ========================== تحديث خطوات الـ wizard ==========================
function updateWizard() {
  const steps = document.querySelectorAll(".step");
  steps.forEach(s => s.classList.remove("active"));
  if (selectedItinerary.length) steps[1].classList.add("active");
  if (selectedItinerary.length > 1) steps[2].classList.add("active");
}

// ========================== سكشن النصائح الديناميكي ==========================
function renderTipsCards() {
  const container = document.getElementById('tips-cards');
  if (!container) return;

  const tips = [
    { type: 'visa', icon: 'passport', titleKey: 'plan_trip.tip_visa_title', descKey: 'plan_trip.tip_visa_desc' },
    { type: 'transport', icon: 'bus', titleKey: 'plan_trip.tip_transport_title', descKey: 'plan_trip.tip_transport_desc' },
    { type: 'arrival', icon: 'plane', titleKey: 'plan_trip.tip_arrival_title', descKey: 'plan_trip.tip_arrival_desc' },
    { type: 'weather', icon: 'sun', titleKey: 'plan_trip.tip_weather_title', descKey: 'plan_trip.tip_weather_desc' }
  ];

  container.innerHTML = tips.map(t => `
    <div class="tip-card ${t.type}">
      <h4><i data-lucide="${t.icon}" class="icon-${t.type}"></i> ${safeI18n(t.titleKey)}</h4>
      <p>${safeI18n(t.descKey)}</p>
    </div>
  `).join('');

  lucide.createIcons();
}