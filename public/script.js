// // public/script.js
// const weatherBox = document.getElementById("weather-info");
// const forecastBox = document.getElementById("forecast");
// const hourlyCanvas = document.getElementById("hourlyChart");
// const hourlyTableContainerId = "hourly-table-container";
// let hourlyChart = null;

// // create hourly table container if not present (in case user didn't add in HTML)
// let hourlyTableContainer = document.getElementById(hourlyTableContainerId);
// if (!hourlyTableContainer) {
//   hourlyTableContainer = document.createElement("div");
//   hourlyTableContainer.id = hourlyTableContainerId;
//   hourlyTableContainer.className = "table-section";
//   document.querySelector("main").insertBefore(hourlyTableContainer, document.getElementById("forecast"));
// }

// // forecast detail table container
// let forecastTableContainer = document.getElementById("forecast-table-container");
// if (!forecastTableContainer) {
//   forecastTableContainer = document.createElement("div");
//   forecastTableContainer.id = "forecast-table-container";
//   forecastTableContainer.className = "table-section";
//   document.querySelector("main").appendChild(forecastTableContainer);
// }

// // baseURL toggles between emulator and deployed site
// const baseURL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
//   ? "http://127.0.0.1:5001/dah-agent/us-central1/api"
//   : "/api";

// // buttons & input
// const cityInput = document.getElementById("cityInput");
// document.getElementById("getWeatherBtn").addEventListener("click", async () => {
//   const city = cityInput.value.trim();
//   if (!city) return alert("Please enter a city name.");
//   await fetchWeatherByCity(city);
// });

// // Enter key triggers search
// cityInput.addEventListener("keydown", async (e) => {
//   if (e.key === "Enter") {
//     e.preventDefault();
//     const city = cityInput.value.trim();
//     if (!city) return;
//     await fetchWeatherByCity(city);
//   }
// });

// document.getElementById("getLocationBtn").addEventListener("click", () => {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
//       err => alert("Location access denied. " + (err.message || ""))
//     );
//   } else {
//     alert("Geolocation not supported by this browser.");
//   }
// });

// async function fetchWeatherByCity(city) {
//   resetDisplays();
//   weatherBox.innerHTML = "<p>Loading...</p>";
//   try {
//     const res = await fetch(`${baseURL}/weather/${encodeURIComponent(city)}`);
//     if (!res.ok) {
//       const err = await res.json().catch(() => ({ message: res.statusText }));
//       weatherBox.innerHTML = `<p>Error: ${err.message || JSON.stringify(err)}</p>`;
//       return;
//     }
//     const data = await res.json();
//     displayWeather(data);
//   } catch (e) {
//     console.error("Fetch error:", e);
//     weatherBox.innerHTML = "<p>Failed to fetch weather data.</p>";
//   }
// }

// async function fetchWeatherByCoords(lat, lon) {
//   resetDisplays();
//   weatherBox.innerHTML = "<p>Loading location weather...</p>";
//   try {
//     const res = await fetch(`${baseURL}/geo?lat=${lat}&lon=${lon}`);
//     if (!res.ok) {
//       const err = await res.json().catch(() => ({ message: res.statusText }));
//       weatherBox.innerHTML = `<p>Error: ${err.message || JSON.stringify(err)}</p>`;
//       return;
//     }
//     const data = await res.json();
//     displayWeather(data);
//   } catch (e) {
//     console.error("Fetch error:", e);
//     weatherBox.innerHTML = "<p>Failed to fetch weather data.</p>";
//   }
// }

// function resetDisplays() {
//   if (hourlyChart) { hourlyChart.destroy(); hourlyChart = null; }
//   hourlyCanvas.style.display = "none";
//   hourlyTableContainer.innerHTML = "";
//   forecastBox.innerHTML = "";
//   forecastTableContainer.innerHTML = "";
// }

// function displayWeather(data) {
//   if (!data || data.error) {
//     weatherBox.innerHTML = `<p>Error: ${data?.error?.message || data?.error || "No data"}</p>`;
//     return;
//   }

//   const w = data.weather;
//   const icon = getWeatherIcon(w.weatherMain);

//   weatherBox.innerHTML = `
//     <div class="weather-card">
//       <h2>${w.city}</h2>
//       <div class="weather-main">
//         <img src="${icon}" alt="icon" class="weather-icon">
//         <div>
//           <p><strong>${w.weatherMain}</strong> — ${w.description}</p>
//           <p><strong>🌡 Temp:</strong> ${round(w.temp)}°C</p>
//           <p><strong>💧 Humidity:</strong> ${w.humidity}%</p>
//           <p><strong>🌬 Wind:</strong> ${w.windSpeed} m/s</p>
//         </div>
//       </div>
//     </div>
//   `;



//   renderHourlyChart(data.hourly || [], data.timezoneOffset || 0);
//   renderHourlyTable(data.hourly || [], data.timezoneOffset || 0);
//   renderForecast(data.daily || [], data.timezoneOffset || 0);
//   renderForecastTable(data.daily || data.daily || [], data.timezoneOffset || 0);
// }

// /* Chart: each interpolated hour will be shown */
// function renderHourlyChart(hourly, timezoneOffset = 0) {
//   if (!hourly || hourly.length === 0) {
//     if (hourlyChart) { hourlyChart.destroy(); hourlyChart = null; }
//     hourlyCanvas.style.display = "none";
//     return;
//   }
//   hourlyCanvas.style.display = "block";
//   const ctx = hourlyCanvas.getContext("2d");

//   if (hourlyChart) hourlyChart.destroy();

//   const labels = hourly.map(h => formatHourLabel(h.dt, timezoneOffset));
//   const temps = hourly.map(h => h.temp);

//   hourlyChart = new Chart(ctx, {
//     type: "line",
//     data: {
//       labels,
//       datasets: [{
//         label: "Temperature (°C)",
//         data: temps,
//         borderColor: "#00bcd4",
//         backgroundColor: "rgba(0,188,212,0.2)",
//         fill: true,
//         tension: 0.3,
//         pointRadius: 1
//       }]
//     },
//     options: {
//       plugins: { legend: { labels: { color: "#fff" } } },
//       scales: {
//         x: {
//           ticks: { color: "#ccc", autoSkip: false, maxRotation: 45, minRotation: 0 },
//           grid: { color: "#333" }
//         },
//         y: { ticks: { color: "#ccc" }, grid: { color: "#333" } }
//       },
//       responsive: true,
//       maintainAspectRatio: false,
//     }
//   });

//   hourlyCanvas.parentElement.style.height = "320px";
// }

// function renderHourlyTable(hourly, timezoneOffset = 0) {
//   if (!hourly || hourly.length === 0) {
//     hourlyTableContainer.innerHTML = "";
//     return;
//   }

//   const rows = hourly.slice(0, 24).map(h => {
//     const time = formatHourLabel(h.dt, timezoneOffset);
//     const temp = `${round(h.temp)}°C`;
//     const cond = h.weather?.[0]?.description || "";
//     const iconUrl = h.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${h.weather[0].icon}@2x.png` : "";
//     const humidity = `${h.humidity ?? "-"}%`;
//     const wind = `${round(h.wind_speed ?? h.windSpeed ?? 0)} m/s`;
//     return `
//       <tr>
//         <td>${time}</td>
//         <td>${temp}</td>
//         <td>${cond} ${iconUrl ? `<img src="${iconUrl}" width="36" style="vertical-align:middle;">` : ""}</td>
//         <td>${humidity}</td>
//         <td>${wind}</td>
//       </tr>
//     `;
//   }).join("");

//   hourlyTableContainer.innerHTML = `
//     <h3>Hourly (next ${Math.min(24, hourly.length)} hours)</h3>
//     <div class="table-wrap">
//       <table class="hourly-table">
//         <thead>
//           <tr><th>Time</th><th>Temp</th><th>Condition</th><th>Humidity</th><th>Wind</th></tr>
//         </thead>
//         <tbody>
//           ${rows}
//         </tbody>
//       </table>
//     </div>
//   `;
// }

// function renderForecast(daily, timezoneOffset = 0) {
//   if (!daily || daily.length === 0) {
//     forecastBox.innerHTML = "<p>No forecast available.</p>";
//     return;
//   }

//   const cards = daily.slice(0, 7).map(d => {
//     const icon = d.rawItems?.[0]?.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${d.rawItems[0].weather[0].icon}@2x.png` : getWeatherIcon(d.weather);
//     const dayName = d.day;
//     const temp = `${d.temp}°C`;
//     const desc = d.weather;
//     return `
//       <div class="forecast-card">
//         <p><strong>${dayName}</strong></p>
//         <img src="${icon}" width="60" alt="icon"/>
//         <p>${temp}</p>
//         <p>${desc}</p>
//       </div>
//     `;
//   }).join("");

//   forecastBox.innerHTML = cards;
// }



// function renderForecastTable(daily, timezoneOffset = 0) {
//   if (!daily || daily.length === 0) {
//     forecastTableContainer.innerHTML = "";
//     return;
//   }

//   const rows = daily.slice(0, 7).map(d => {
//     const day = d.day;

//     // find min/max from rawItems if present
//     let min = "-", max = "-";
//     if (d.rawItems && d.rawItems.length) {
//       const temps = d.rawItems.map(it => it.main.temp);
//       min = `${Math.round(Math.min(...temps))}°C`;
//       max = `${Math.round(Math.max(...temps))}°C`;
//     } else if (d.temp && typeof d.temp === "object") {
//       min = `${Math.round(d.temp.min)}°C`;
//       max = `${Math.round(d.temp.max)}°C`;
//     } else {
//       min = max = `${Math.round(d.temp)}°C`;
//     }

//     // 🌧️ calculate total precipitation for the day
//     let precipTotal = 0;
//     if (d.rawItems && d.rawItems.length) {
//       d.rawItems.forEach(it => {
//         const rain = it.rain?.["3h"] || 0;
//         const snow = it.snow?.["3h"] || 0;
//         precipTotal += rain + snow;
//       });
//     }

//     // 📝 assign label based on precipitation intensity
//     let precipLabel = "No rain";
//     if (precipTotal > 0 && precipTotal <= 2) precipLabel = "Light rain";
//     else if (precipTotal > 2 && precipTotal <= 10) precipLabel = "Moderate rain";
//     else if (precipTotal > 10) precipLabel = "Heavy rain";

//     const desc = d.weather || "-";
//     const iconUrl = d.rawItems?.[0]?.weather?.[0]?.icon
//       ? `https://openweathermap.org/img/wn/${d.rawItems[0].weather[0].icon}@2x.png`
//       : "";

//     return `
//       <tr>
//         <td>${day}</td>
//         <td>${min} / ${max}</td>
//         <td>${desc} ${iconUrl ? `<img src="${iconUrl}" width="36" style="vertical-align:middle;">` : ""}</td>
//         <td>${round(precipTotal)} mm (${precipLabel})</td>
//       </tr>
//     `;
//   }).join("");

//   forecastTableContainer.innerHTML = `
//     <h3>7-day Forecast Details</h3>
//     <div class="table-wrap">
//       <table class="forecast-table">
//         <thead>
//           <tr><th>Day</th><th>Min / Max</th><th>Condition</th><th>Precip</th></tr>
//         </thead>
//         <tbody>
//           ${rows}
//         </tbody>
//       </table>
//     </div>
//   `;
// }


// function getWeatherIcon(condition) {
//   const icons = {
//     Clear: "https://openweathermap.org/img/wn/01d@2x.png",
//     Clouds: "https://openweathermap.org/img/wn/03d@2x.png",
//     Rain: "https://openweathermap.org/img/wn/09d@2x.png",
//     Thunderstorm: "https://openweathermap.org/img/wn/11d@2x.png",
//     Drizzle: "https://openweathermap.org/img/wn/10d@2x.png",
//     Snow: "https://openweathermap.org/img/wn/13d@2x.png",
//     Mist: "https://openweathermap.org/img/wn/50d@2x.png",
//   };
//   return icons[condition] || icons["Clear"];
// }

// function formatHourLabel(dtSec, timezoneOffset = 0) {
//   if (!dtSec) return "";
//   const date = new Date((dtSec + (timezoneOffset || 0)) * 1000);
//   return date.toLocaleTimeString("en-PK", { hour: "numeric", hour12: true });
// }

// function round(v) { return Math.round(v * 10) / 10; }












































// public/script.js
const weatherBox = document.getElementById("weather-info");
const forecastBox = document.getElementById("forecast");
const hourlyCanvas = document.getElementById("hourlyChart");
const hourlyTableContainerId = "hourly-table-container";
let hourlyChart = null;

// Create table containers if not present
let hourlyTableContainer = document.getElementById(hourlyTableContainerId);
if (!hourlyTableContainer) {
  hourlyTableContainer = document.createElement("div");
  hourlyTableContainer.id = hourlyTableContainerId;
  hourlyTableContainer.className = "table-section";
  document.querySelector("main").insertBefore(hourlyTableContainer, document.getElementById("forecast"));
}

let forecastTableContainer = document.getElementById("forecast-table-container");
if (!forecastTableContainer) {
  forecastTableContainer = document.createElement("div");
  forecastTableContainer.id = "forecast-table-container";
  forecastTableContainer.className = "table-section";
  document.querySelector("main").appendChild(forecastTableContainer);
}

// ✅ Direct OpenWeather API (Free 2.5)
const API_KEY = "c49eeb16a1e03e752c53a31ca49bf180";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// Buttons & Input
const cityInput = document.getElementById("cityInput");
document.getElementById("getWeatherBtn").addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) return alert("Please enter a city name.");
  await fetchWeatherByCity(city);
});

cityInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;
    await fetchWeatherByCity(city);
  }
});

document.getElementById("getLocationBtn").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      err => alert("Location access denied. " + (err.message || ""))
    );
  } else {
    alert("Geolocation not supported by this browser.");
  }
});

// 🟦 Fetch Weather by City
async function fetchWeatherByCity(city) {
  resetDisplays();
  weatherBox.innerHTML = "<p>Loading...</p>";
  try {
    const currentRes = await fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`);
    const forecastRes = await fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`);
    if (!currentRes.ok || !forecastRes.ok) throw new Error("City not found or API error.");

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    displayWeather(current, forecast);
  } catch (e) {
    console.error("Fetch error:", e);
    weatherBox.innerHTML = `<p>Failed to fetch weather data. ${e.message}</p>`;
  }
}

// 🟩 Fetch Weather by Coordinates
async function fetchWeatherByCoords(lat, lon) {
  resetDisplays();
  weatherBox.innerHTML = "<p>Loading location weather...</p>";
  try {
    const currentRes = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    const forecastRes = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    if (!currentRes.ok || !forecastRes.ok) throw new Error("Location not found or API error.");

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    displayWeather(current, forecast);
  } catch (e) {
    console.error("Fetch error:", e);
    weatherBox.innerHTML = `<p>Failed to fetch weather data. ${e.message}</p>`;
  }
}

// 🧭 Reset UI
function resetDisplays() {
  if (hourlyChart) { hourlyChart.destroy(); hourlyChart = null; }
  hourlyCanvas.style.display = "none";
  hourlyTableContainer.innerHTML = "";
  forecastBox.innerHTML = "";
  forecastTableContainer.innerHTML = "";
}

// 🌦️ Display Weather & Forecast
function displayWeather(current, forecast) {
  const w = current.weather[0];
  const icon = `https://openweathermap.org/img/wn/${w.icon}@2x.png`;

  weatherBox.innerHTML = `
    <div class="weather-card">
      <h2>${current.name}</h2>
      <div class="weather-main">
        <img src="${icon}" alt="icon" class="weather-icon">
        <div>
          <p><strong>${w.main}</strong> — ${w.description}</p>
          <p><strong>🌡 Temp:</strong> ${round(current.main.temp)}°C</p>
          <p><strong>💧 Humidity:</strong> ${current.main.humidity}%</p>
          <p><strong>🌬 Wind:</strong> ${current.wind.speed} m/s</p>
        </div>
      </div>
    </div>
  `;

  const hourly = forecast.list.slice(0, 24);
  renderHourlyChart(hourly);
  renderHourlyTable(hourly);
  renderForecast(forecast.list);
  renderForecastTable(forecast.list);
}

// 🔵 Hourly Chart
function renderHourlyChart(hourly) {
  if (!hourly || hourly.length === 0) return;
  hourlyCanvas.style.display = "block";
  const ctx = hourlyCanvas.getContext("2d");
  if (hourlyChart) hourlyChart.destroy();

  const labels = hourly.map(h => formatHourLabel(h.dt));
  const temps = hourly.map(h => h.main.temp);

  hourlyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Temperature (°C)",
        data: temps,
        borderColor: "#00bcd4",
        backgroundColor: "rgba(0,188,212,0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 1
      }]
    },
    options: {
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#ccc" }, grid: { color: "#333" } },
        y: { ticks: { color: "#ccc" }, grid: { color: "#333" } }
      },
      responsive: true,
      maintainAspectRatio: false,
    }
  });
  hourlyCanvas.parentElement.style.height = "320px";
}

// 📋 Hourly Table
function renderHourlyTable(hourly) {
  const rows = hourly.map(h => {
    const time = formatHourLabel(h.dt);
    const temp = `${round(h.main.temp)}°C`;
    const cond = h.weather?.[0]?.description || "";
    const iconUrl = h.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${h.weather[0].icon}@2x.png` : "";
    const humidity = `${h.main.humidity}%`;
    const wind = `${round(h.wind.speed)} m/s`;
    return `
      <tr>
        <td>${time}</td>
        <td>${temp}</td>
        <td>${cond} ${iconUrl ? `<img src="${iconUrl}" width="36" style="vertical-align:middle;">` : ""}</td>
        <td>${humidity}</td>
        <td>${wind}</td>
      </tr>
    `;
  }).join("");

  hourlyTableContainer.innerHTML = `
    <h3>Hourly (next 24 hours)</h3>
    <div class="table-wrap">
      <table class="hourly-table">
        <thead><tr><th>Time</th><th>Temp</th><th>Condition</th><th>Humidity</th><th>Wind</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// 🌤 Forecast Cards (3-hour steps)
function renderForecast(list) {
  const grouped = {};
  list.forEach(it => {
    const day = new Date(it.dt * 1000).toLocaleDateString("en-PK", { weekday: "short" });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(it);
  });

  const cards = Object.keys(grouped).slice(0, 7).map(day => {
    const items = grouped[day];
    const avgTemp = round(items.reduce((a, b) => a + b.main.temp, 0) / items.length);
    const icon = items[0].weather[0].icon;
    const desc = items[0].weather[0].main;
    return `
      <div class="forecast-card">
        <p><strong>${day}</strong></p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" width="60" alt="icon"/>
        <p>${avgTemp}°C</p>
        <p>${desc}</p>
      </div>
    `;
  }).join("");
  forecastBox.innerHTML = cards;
}

// 📅 Forecast Table
function renderForecastTable(list) {
  const grouped = {};
  list.forEach(it => {
    const day = new Date(it.dt * 1000).toLocaleDateString("en-PK", { weekday: "short" });
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(it);
  });

  const rows = Object.keys(grouped).slice(0, 7).map(day => {
    const items = grouped[day];
    const temps = items.map(it => it.main.temp);
    const min = Math.round(Math.min(...temps));
    const max = Math.round(Math.max(...temps));
    const icon = items[0].weather[0].icon;
    const desc = items[0].weather[0].main;
    return `
      <tr>
        <td>${day}</td>
        <td>${min}°C / ${max}°C</td>
        <td>${desc} <img src="https://openweathermap.org/img/wn/${icon}@2x.png" width="36"></td>
        <td>-</td>
      </tr>
    `;
  }).join("");

  forecastTableContainer.innerHTML = `
    <h3>7-day Forecast Details</h3>
    <div class="table-wrap">
      <table class="forecast-table">
        <thead><tr><th>Day</th><th>Min / Max</th><th>Condition</th><th>Precip</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// Utilities
function formatHourLabel(dtSec) {
  const date = new Date(dtSec * 1000);
  return date.toLocaleTimeString("en-PK", { hour: "numeric", hour12: true });
}
function round(v) { return Math.round(v * 10) / 10; }
