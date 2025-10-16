/* disasterScript.js
   Synthetic alerts generator for Pakistan:
   - Generates 100-200 alerts (per selected date)
   - Ensures markers are inside Pakistan polygon + bounding box
   - Guarantees major cities are included and placed at their correct coords
   - InfoWindow shows city name, event and date on hover/click
*/

const START_DATE = new Date();
const UNTIL_DATE = new Date("2025-12-30");
const MIN_ALERTS = 100;
const MAX_ALERTS = 200;

// Major cities (ensure these always can appear)
const majorCities = [
  // Sindh
  { name: "Karachi", lat: 24.8607, lon: 67.0011, province: "Sindh" },
  { name: "Hyderabad", lat: 25.3960, lon: 68.3578, province: "Sindh" },
  { name: "Sukkur", lat: 27.7052, lon: 68.8570, province: "Sindh" },

  // Punjab
  { name: "Lahore", lat: 31.5497, lon: 74.3436, province: "Punjab" },
  { name: "Faisalabad", lat: 31.4504, lon: 73.1350, province: "Punjab" },
  { name: "Rawalpindi", lat: 33.5651, lon: 73.0169, province: "Punjab" },
  { name: "Multan", lat: 30.1575, lon: 71.5249, province: "Punjab" },

  // KPK
  { name: "Peshawar", lat: 34.0151, lon: 71.5805, province: "KPK" },
  { name: "Mardan", lat: 34.2000, lon: 72.0500, province: "KPK" },
  { name: "Abbottabad", lat: 34.1688, lon: 73.2215, province: "KPK" },
  { name: "Swat", lat: 35.2220, lon: 72.4258, province: "KPK" },

  // Balochistan
  { name: "Quetta", lat: 30.1798, lon: 66.9750, province: "Balochistan" },
  { name: "Gwadar", lat: 25.1252, lon: 62.3220, province: "Balochistan" },

  // Gilgit-Baltistan / Northern & Tourist
  { name: "Gilgit", lat: 35.9176, lon: 74.3080, province: "Gilgit-Baltistan" },
  { name: "Skardu", lat: 35.3333, lon: 75.5833, province: "Gilgit-Baltistan" },
  { name: "Hunza", lat: 36.3167, lon: 74.6500, province: "Gilgit-Baltistan" },
  { name: "Naran", lat: 34.9081, lon: 73.6500, province: "Gilgit-Baltistan" },
  { name: "Chitral", lat: 35.8500, lon: 71.7833, province: "Gilgit-Baltistan" }
];

// Tighter bounding box to avoid Afghanistan/India spill
const PAK_MIN_LAT = 24.0;
const PAK_MAX_LAT = 37.1;
const PAK_MIN_LON = 61.0;
const PAK_MAX_LON = 75.4;

// A simple approximate Pakistan polygon (lat, lon pairs). It's coarse but good enough to filter random points.
const PAK_POLYGON = [
  [24.0, 61.0],
  [25.0, 62.5],
  [26.5, 63.5],
  [28.5, 64.0],
  [30.5, 66.5],
  [32.5, 69.0],
  [34.5, 72.0],
  [36.5, 73.5],
  [36.5, 74.8],
  [33.0, 75.4],
  [30.0, 71.0],
  [27.5, 68.0],
  [24.0, 66.0],
  [24.0, 61.0]
];

// Event types and icons (icons used from Icons8 CDN — replace with your own if needed)
// const EVENT_TYPES = [
//   { key: "Heatwave", label: "Heatwave Alert", icon: "https://img.icons8.com/color/48/000000/sun.png" },
//   { key: "Heatstroke", label: "Heatstroke Alert", icon: "https://img.icons8.com/color/48/000000/sun.png" },
//   { key: "Travel", label: "Travel Advisory", icon: "https://img.icons8.com/color/48/000000/road-trip.png" },
//   { key: "Flood", label: "Flood Warning", icon: "https://img.icons8.com/color/48/000000/flood.png" },
//   { key: "HeavyRain", label: "Heavy Rainfall", icon: "https://img.icons8.com/color/48/000000/rain.png" },
//   { key: "LightRain", label: "Light Rain", icon: "https://img.icons8.com/color/48/000000/light-rain.png" },
//   { key: "Storm", label: "Storm Alert", icon: "https://img.icons8.com/color/48/000000/storm.png" },
//   { key: "Wind", label: "Strong Wind", icon: "https://img.icons8.com/color/48/000000/windy-weather.png" },
//   { key: "Landslide", label: "Landslide Risk", icon: "https://img.icons8.com/color/48/000000/landslide.png" },
//   { key: "Snow", label: "Snowfall Alert", icon: "https://img.icons8.com/color/48/000000/snow.png" },
//   { key: "Earthquake", label: "Earthquake Reported", icon: "https://img.icons8.com/color/48/000000/earthquake.png" },
//   { key: "Other", label: "General Alert", icon: "https://img.icons8.com/color/48/000000/alert.png" }
// ];

const EVENT_TYPES = [
  { key: "Heatwave", label: "Heatwave Alert", icon: "https://img.icons8.com/color/48/000000/sun.png" },
  { key: "Heatstroke", label: "Heatstroke Alert", icon: "https://img.icons8.com/color/48/000000/sun.png" },
  { key: "Travel", label: "Travel Advisory", icon: "./icons/travel.png" },        // ✅ your local file
  { key: "Flood", label: "Flood Warning", icon: "./icons/flood.png" },           // ✅ your local file
  { key: "HeavyRain", label: "Heavy Rainfall", icon: "https://img.icons8.com/color/48/000000/rain.png" },
  { key: "LightRain", label: "Light Rain", icon: "https://img.icons8.com/color/48/000000/light-rain.png" },
  { key: "Storm", label: "Storm Alert", icon: "https://img.icons8.com/color/48/000000/storm.png" },
  { key: "Wind", label: "Strong Wind", icon: "https://img.icons8.com/color/48/000000/windy-weather.png" },
  { key: "Landslide", label: "Landslide Risk", icon: "https://img.icons8.com/color/48/000000/landslide.png" },
  { key: "Snow", label: "Snowfall Alert", icon: "https://img.icons8.com/color/48/000000/snow.png" },
  { key: "Earthquake", label: "Earthquake Reported", icon: "./icons/earthquake.png" }, // ✅ your local file
  { key: "Other", label: "General Alert", icon: "https://img.icons8.com/color/48/000000/alert.png" }
];


let map;
let markers = [];
let alertsForCurrentDate = [];
let currentDate = clampDate(new Date());
let currentFilter = "all";

// ---------- Geometry helpers ----------
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// Ray-casting algorithm: check if point (lat,lon) is inside polygon (polygon: array of [lat,lon])
function isPointInPolygon(lat, lon, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const yi = polygon[i][0], xi = polygon[i][1];
    const yj = polygon[j][0], xj = polygon[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lon < (xj - xi) * (lat - yi) / (yj - yi + 0.0000001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Distance squared
function dist2(aLat, aLon, bLat, bLon) { const dx = aLat - bLat; const dy = aLon - bLon; return dx * dx + dy * dy; }

// Find nearest major city (object) to a point
function nearestMajorCity(pt) {
  let best = majorCities[0], bestD = Infinity;
  majorCities.forEach(c => {
    const d = dist2(pt.lat, pt.lon, c.lat, c.lon);
    if (d < bestD) { best = c; bestD = d; }
  });
  return best;
}

// ---------- Pool generation (ensures points inside Pakistan polygon + bounding) ----------
function generatePointPool(n) {
  const pool = majorCities.map(c => ({ ...c, named: true })); // include major cities first
  // now fill random points inside polygon
  let attempts = 0;
  while (pool.length < n && attempts < n * 15) {
    attempts++;
    // random inside bounding box first
    const lat = +(PAK_MIN_LAT + Math.random() * (PAK_MAX_LAT - PAK_MIN_LAT)).toFixed(5);
    const lon = +(PAK_MIN_LON + Math.random() * (PAK_MAX_LON - PAK_MIN_LON)).toFixed(5);
    // clamp (just in case)
    const plat = clamp(lat, PAK_MIN_LAT, PAK_MAX_LAT);
    const plon = clamp(lon, PAK_MIN_LON, PAK_MAX_LON);
    if (!isPointInPolygon(plat, plon, PAK_POLYGON)) continue;
    pool.push({ name: null, lat: plat, lon: plon, province: null, named: false });
  }
  return pool.slice(0, n);
}

// build initial pool (200 - adjustable)
const TOTAL_POOL = 250;
const pointPool = generatePointPool(TOTAL_POOL);

// sample unique points
function samplePoints(count) {
  const copy = pointPool.slice();
  const out = [];
  while (out.length < count && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

// pick random event
function pickEvent() { return EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)]; }

// create human friendly name for unnamed points (use nearest city)
function nameForPoint(pt) {
  if (pt.name) return pt.name;
  const near = nearestMajorCity(pt);
  return `Near ${near.name}`;
}

// ---------- generate alerts for a date ----------
function generateAlertsForDate(dateObj) {
  const dateStr = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).toDateString();
  const total = MIN_ALERTS + Math.floor(Math.random() * (MAX_ALERTS - MIN_ALERTS + 1));
  // ensure all major cities are included (at least once)
  const mustInclude = majorCities.map(c => ({ ...c, named: true }));
  const remainingCount = Math.max(0, total - mustInclude.length);
  const sampled = samplePoints(remainingCount);
  const points = [...mustInclude, ...sampled];

  const alerts = points.map((pt, idx) => {
    const ev = pickEvent();
    const city = pt.name || nameForPoint(pt);
    const province = pt.province || nearestMajorCity(pt).province;
    return {
      id: `${city.replace(/\s+/g, '_')}_${idx}_${dateStr.replace(/\s+/g, '_')}`,
      city,
      lat: pt.lat,
      lon: pt.lon,
      province,
      event: ev.label,
      icon: ev.icon,
      date: dateStr,
      description: `${ev.label} reported for ${city} on ${dateStr}. (sample data)`
    };
  });

  return alerts;
}

// ---------- Map helpers ----------
function clearMarkers() {
  markers.forEach(m => m.setMap(null));
  markers = [];
}

function addMarker(alert) {
  const marker = new google.maps.Marker({
    position: { lat: alert.lat, lng: alert.lon },
    map,
    title: `${alert.event} — ${alert.city}`,
    icon: { url: alert.icon, scaledSize: new google.maps.Size(36, 36) }
  });

  // Remove unwanted white info window; show info only via title tooltip
  marker.addListener("click", () => {
    // Optional: zoom and center when clicked
    map.setCenter({ lat: alert.lat, lng: alert.lon });
    map.setZoom(8);
  });


  markers.push(marker);
  return marker;
}

// ---------- UI rendering ----------
function renderAlertsList(alerts, province = "all") {
  const container = document.getElementById("alerts-container");
  if (!container) return;
  container.innerHTML = "";

  const filtered = (province === "all") ? alerts : alerts.filter(a => a.province === province);
  if (filtered.length === 0) {
    container.innerHTML = `<p>✅ No synthetic alerts for ${currentDate.toDateString()} in ${province === "all" ? "Pakistan" : province}.</p>`;
    return;
  }

  const header = document.createElement("div");
  header.style.marginBottom = "8px";
  header.innerHTML = `<strong>${filtered.length} synthetic alerts — ${currentDate.toDateString()}</strong>`;
  container.appendChild(header);

  filtered.forEach(alert => {
    const div = document.createElement("div");
    div.className = "alert-item";
    div.innerHTML = `
      <img src="${alert.icon}" alt="${alert.event}" />
      <div>
        <strong>${alert.city}:</strong> ${alert.event} <br/>
        <small>${alert.date}</small><br/>
        <span style="opacity:0.9">${alert.description}</span>
      </div>
    `;
    div.addEventListener("click", () => {
      map.setCenter({ lat: alert.lat, lng: alert.lon });
      map.setZoom(8);
    });
    container.appendChild(div);
  });
}

// ---------- Date controls ----------
function toInputDate(d) { const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); return `${y}-${m}-${day}`; }

function createDateControls() {
  const tabs = document.getElementById("province-tabs");
  if (!tabs) return;
  if (document.getElementById("date-controls")) return;

  const wrapper = document.createElement("div");
  wrapper.id = "date-controls";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "8px";
  wrapper.style.marginLeft = "10px";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "◀ Prev"; prevBtn.className = "tab-btn";
  prevBtn.addEventListener("click", () => {
    const d = new Date(currentDate); d.setDate(d.getDate() - 1);
    if (d < START_DATE) return alert("Reached earliest date."); showAlertsForDate(d, currentFilter);
  });

  const input = document.createElement("input");
  input.type = "date"; input.id = "alert-date-input";
  input.value = toInputDate(currentDate);
  input.min = toInputDate(START_DATE); input.max = toInputDate(UNTIL_DATE);
  input.addEventListener("change", () => {
    const v = input.value; if (!v) return; showAlertsForDate(new Date(v + "T00:00:00"), currentFilter);
  });

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next ▶"; nextBtn.className = "tab-btn";
  nextBtn.addEventListener("click", () => {
    const d = new Date(currentDate); d.setDate(d.getDate() + 1);
    if (d > UNTIL_DATE) return alert("Reached latest date."); showAlertsForDate(d, currentFilter);
  });

  wrapper.appendChild(prevBtn); wrapper.appendChild(input); wrapper.appendChild(nextBtn);
  tabs.appendChild(wrapper);
}

function updateDateControls() {
  const input = document.getElementById("alert-date-input");
  if (input) input.value = toInputDate(currentDate);
}

// ---------- Show / load alerts ----------
function showAlertsForDate(dateObj, provinceFilter = "all") {
  currentDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  alertsForCurrentDate = generateAlertsForDate(currentDate);
  clearMarkers();
  // add markers for all alerts (we will filter list but map shows all)
  alertsForCurrentDate.forEach(addMarker);
  renderAlertsList(alertsForCurrentDate, provinceFilter);
  updateDateControls();
}

// ---------- Nearest alerts ----------
function showNearestAlerts(k = 12) {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    const withDist = alertsForCurrentDate.map(a => ({ ...a, dist: Math.hypot(a.lat - latitude, a.lon - longitude) }));
    withDist.sort((A, B) => A.dist - B.dist);
    const nearest = withDist.slice(0, k);
    if (nearest.length) {
      const bounds = new google.maps.LatLngBounds();
      nearest.forEach(n => bounds.extend({ lat: n.lat, lng: n.lon }));
      map.fitBounds(bounds);
      renderAlertsList(nearest, "all");
      clearMarkers();
      nearest.forEach(addMarker);
    } else alert("No synthetic alerts found for current date.");
  }, err => alert("Location permission denied or unavailable."));
}

// ---------- Helpers ----------
function clampDate(d) {
  const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (d < today) return today; return d;
}

// ---------- Map init and UI wiring ----------
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 30.3753, lng: 69.3451 },
    zoom: 5.5
  });

  createDateControls();

  // Tab handling
  document.querySelectorAll(".tab-btn").forEach(btn => {
    const province = btn.dataset ? btn.dataset.province : undefined;
    if (province === undefined) {
      // nearest button hooking
      if (btn.id === "nearest-btn") btn.addEventListener("click", () => showNearestAlerts(12));
      return;
    }
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = province;
      showAlertsForDate(currentDate, currentFilter);
    });
  });

  const nb = document.getElementById("nearest-btn");
  if (nb) nb.addEventListener("click", () => showNearestAlerts(12));

  // initial load
  showAlertsForDate(currentDate, "all");
};






























