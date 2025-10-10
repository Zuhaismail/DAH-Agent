// index.js
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

dotenv.config();
admin.initializeApp();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Weather API Key
const API_KEY = process.env.WEATHER_KEY;

// ✅ Route to fetch weather data
app.get("/weather/:city", async (req, res) => {
  const { city } = req.params;

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},PK&appid=${API_KEY}&units=metric`
    );

    const data = response.data;
    const weather = {
      city: data.name,
      temp: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      main: data.weather[0].main,
    };

    // Example alert logic
    const alerts = [];
    if (weather.main.includes("Rain")) alerts.push("⚠ Flood Alert");
    if (weather.temp > 40) alerts.push("🔥 Heatwave Alert");

    res.json({ weather, alerts });
  } catch (error) {
    console.error("❌ Error fetching weather:", error.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// ✅ Export the Express app as a Firebase Function
export const api = onRequest(app);




