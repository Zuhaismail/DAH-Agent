// functions/index.js
import express from "express";
import axios from "axios";
import cors from "cors";
import admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Get API key from env or firebase functions config (robust)
const API_KEY = process.env.WEATHER_KEY || (admin?.instanceId ? null : null) || null;
console.log("API_KEY loaded:", !!API_KEY);

// Helper: current weather by city or coords (free endpoint)
async function fetchCurrentByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  console.log("CALL ->", url.replace(/appid=[^&]+/, "appid=***"));
  return axios.get(url);
}
async function fetchCurrentByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  console.log("CALL ->", url.replace(/appid=[^&]+/, "appid=***"));
  return axios.get(url);
}

// Helper: 5-day / 3-hour forecast (free)
async function fetchForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  console.log("CALL ->", url.replace(/appid=[^&]+/, "appid=***"));
  return axios.get(url);
}

function makeHourlyFromForecast(forecastList, timezoneOffsetSeconds = 0) {
  if (!Array.isArray(forecastList) || forecastList.length === 0) return [];

  // convert forecastList to array of points (time in seconds + values)
  const points = forecastList.map(item => ({
    dt: item.dt,
    temp: item.main.temp,
    humidity: item.main.humidity,
    wind_speed: item.wind?.speed ?? item.wind_speed ?? 0,
    weather: item.weather || [],
  }));

  // Build hourly steps from now to next 24 hours
  const nowSec = Math.floor(Date.now() / 1000);
  const endSec = nowSec + 24 * 3600;
  const hours = [];

  // Helper: find surrounding points for a given timestamp
  function findSurrounding(t) {
    // ensure points sorted
    let prev = null, next = null;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p.dt === t) {
        return { prev: p, next: p };
      }
      if (p.dt < t) prev = p;
      if (p.dt > t) { next = p; break; }
    }
    // Edge cases: before first point or after last point
    if (!prev) prev = points[0];
    if (!next) next = points[points.length - 1];
    return { prev, next };
  }

  for (let ts = nowSec; ts <= endSec; ts += 3600) {
    // find nearest surrounding 3-hour points to interpolate temp
    const { prev, next } = findSurrounding(ts);
    let temp = prev.temp;
    if (prev.dt !== next.dt) {
      const ratio = (ts - prev.dt) / (next.dt - prev.dt);
      // clamp ratio
      const r = Math.max(0, Math.min(1, ratio));
      temp = prev.temp + (next.temp - prev.temp) * r;
    }
    // For condition/icon, choose the closer point (prev if tie)
    const choose = (Math.abs(ts - prev.dt) <= Math.abs(next.dt - ts)) ? prev : next;

    hours.push({
      dt: ts,
      temp: Math.round(temp * 10) / 10,
      humidity: choose.humidity,
      wind_speed: choose.wind_speed,
      weather: choose.weather
    });
  }

  return hours;
}

function makeDailyFromForecast(forecastList, timezoneOffsetSeconds = 0) {
  // group forecast items by date (local)
  const groups = {};
  forecastList.forEach(item => {
    const local = new Date((item.dt + timezoneOffsetSeconds) * 1000);
    const key = local.toISOString().slice(0, 10);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  const days = Object.keys(groups).slice(0, 7).map(dateKey => {
    const items = groups[dateKey];
    const temps = items.map(it => it.main.temp);
    const avg = Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10;
    // pick the most frequent weather main
    const freq = {};
    items.forEach(it => {
      const m = it.weather?.[0]?.main || "Clear";
      freq[m] = (freq[m] || 0) + 1;
    });
    const winner = Object.keys(freq).sort((a,b)=>freq[b]-freq[a])[0];
    const dayName = new Date(dateKey).toLocaleDateString("en-PK", { weekday: "short" });
    return { day: dayName, temp: avg, weather: winner, rawItems: items };
  });

  return days;
}

// Route: city-based
app.get("/weather/:city", async (req, res) => {
  const { city } = req.params;
  if (!API_KEY) return res.status(500).json({ error: "Server missing API key" });

  try {
    // current weather (gives coordinates)
    const currentRes = await fetchCurrentByCity(city);
    const currentData = currentRes.data;
    const lat = currentData.coord.lat;
    const lon = currentData.coord.lon;

    // forecast (free 5 day / 3 hour)
    const forecastRes = await fetchForecast(lat, lon);
    const forecastData = forecastRes.data;

    const timezoneOffset = forecastData.city?.timezone || 0;

    const weather = {
      city: currentData.name,
      temp: currentData.main.temp,
      humidity: currentData.main.humidity,
      windSpeed: currentData.wind.speed,
      description: currentData.weather[0].description,
      weatherMain: currentData.weather[0].main,
      visibility: currentData.visibility,
      feels_like: currentData.main?.feels_like
    };

    const hourly = makeHourlyFromForecast(forecastData.list, timezoneOffset); // interpolated hourly
    const daily = makeDailyFromForecast(forecastData.list, timezoneOffset);

    // Alerts: we do simple heuristics (not OpenWeather alerts since free forecast doesn't include alerts here)
    const alerts = [];
    if ((weather.weatherMain || "").toLowerCase().includes("rain")) alerts.push("⚠ Flood Alert");
    if (weather.temp > 40) alerts.push("🔥 Heatwave Alert");
    if (weather.temp < 5) alerts.push("❄ Cold Weather Alert");

    // NOTE: UV index & true per-hour official values require One Call; not returned by current+forecast endpoints
    res.json({ weather, hourly, daily, alerts, timezoneOffset });
  } catch (err) {
    console.error("Error in /weather/:city ->", err.response?.data || err.message);
    const code = err.response?.status || 500;
    const body = err.response?.data || { message: err.message };
    return res.status(code).json({ error: body });
  }
});

// Route: geo-based (lat/lon)
app.get("/geo", async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: "lat & lon required" });
  if (!API_KEY) return res.status(500).json({ error: "Server missing API key" });

  try {
    const currentRes = await fetchCurrentByCoords(lat, lon);
    const currentData = currentRes.data;

    const forecastRes = await fetchForecast(lat, lon);
    const forecastData = forecastRes.data;
    const timezoneOffset = forecastData.city?.timezone || 0;

    const weather = {
      city: currentData.name,
      temp: currentData.main.temp,
      humidity: currentData.main.humidity,
      windSpeed: currentData.wind.speed,
      description: currentData.weather[0].description,
      weatherMain: currentData.weather[0].main,
      visibility: currentData.visibility,
      feels_like: currentData.main?.feels_like
    };

    const hourly = makeHourlyFromForecast(forecastData.list, timezoneOffset);
    const daily = makeDailyFromForecast(forecastData.list, timezoneOffset);

    res.json({ weather, hourly, daily, alerts: [], timezoneOffset });
  } catch (err) {
    console.error("Error in /geo ->", err.response?.data || err.message);
    const code = err.response?.status || 500;
    const body = err.response?.data || { message: err.message };
    return res.status(code).json({ error: body });
  }
});

// Export function
export const api = onRequest(app);

