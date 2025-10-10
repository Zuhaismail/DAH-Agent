document.getElementById("getWeatherBtn").addEventListener("click", async () => {
  const city = document.getElementById("cityInput").value.trim();
  const weatherBox = document.getElementById("weather-info");

  weatherBox.innerHTML = "";

  if (!city) {
    weatherBox.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }

  try {
    // Step 1️⃣: Call your Firebase function route (not direct API)
    const response = await fetch(`http://localhost:5001/dah-agent/us-central1/api/weather/${city}`);
    const data = await response.json();

    if (!response.ok) {
      weatherBox.innerHTML = `<p>${data.error || "Failed to fetch weather data."}</p>`;
      return;
    }

    const weather = data.weather;
    const alerts = data.alerts;
    const helpMessage = data.helpMessage;

    const icon = getWeatherIcon(weather.weatherMain);

    // Step 2️⃣: Display the data beautifully
    weatherBox.innerHTML = `
      <div class="weather-card">
        <h2>${weather.city}</h2>
        <div class="weather-main">
          <img src="${icon}" alt="icon" class="weather-icon">
          <div>
            <p><strong>${weather.weatherMain}</strong> — ${weather.description}</p>
            <p><strong>🌡 Temp:</strong> ${weather.temp}°C</p>
            <p><strong>💧 Humidity:</strong> ${weather.humidity}%</p>
            <p><strong>🌬 Wind:</strong> ${weather.windSpeed} m/s</p>
            <p><strong>👁 Visibility:</strong> ${weather.visibility} m</p>
          </div>
        </div>
        ${
          alerts.length
            ? `<div class="alerts"><h3>⚠ Alerts:</h3><ul>${alerts.map(a => `<li>${a}</li>`).join("")}</ul></div>`
            : `<p>${helpMessage}</p>`
        }
      </div>
    `;
  } catch (error) {
    console.error(error);
    weatherBox.innerHTML = "<p>Failed to fetch weather data.</p>";
  }
});

// 🌤 Optional helper for weather icons
function getWeatherIcon(condition) {
  const icons = {
    Clear: "https://openweathermap.org/img/wn/01d@2x.png",
    Clouds: "https://openweathermap.org/img/wn/03d@2x.png",
    Rain: "https://openweathermap.org/img/wn/09d@2x.png",
    Thunderstorm: "https://openweathermap.org/img/wn/11d@2x.png",
    Drizzle: "https://openweathermap.org/img/wn/10d@2x.png",
    Snow: "https://openweathermap.org/img/wn/13d@2x.png",
    Mist: "https://openweathermap.org/img/wn/50d@2x.png",
  };
  return icons[condition] || icons["Clear"];
}





