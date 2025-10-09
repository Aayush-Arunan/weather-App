// Convert country code (eg: 'IN') to full country name (like 'India')
function getCountryName(code) {
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
  return regionNames.of(code);
}

// Main function to fetch and display weather
async function getFiveDayForecast(city) {
  const apiKey = "d0e77e91efd14070ce97468b8e42f23a";
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.list || !data.city) {
      throw new Error("Invalid API response");
    }

    // Filter forecast to only 12:00 PM entries per day
    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
    if (dailyData.length === 0) throw new Error("No forecast data found");

    // Get weather condition for image switching
    const weatherMain = dailyData[0].weather[0].main.toLowerCase();

    // Map weather to image path
    const weatherImages = {
      rain: "src/images/rain.png",
      snow: "src/images/snow.png",
      clear: "src/images/hot.png",
      clouds: "src/images/cloudy.png",
      drizzle: "src/images/drizzle.png",
      thunderstorm: "src/images/storm.png"
    };
    const defaultImage = "src/images/default.jpg";

    // Set weather image
    const asideImg = document.getElementById("aside-img");
    if (asideImg) {
      asideImg.src = weatherImages[weatherMain] || defaultImage;
    }

    // Set overlay text
    const cityName = data.city.name;
    const countryName = getCountryName(data.city.country);
    const description = dailyData[0].weather[0].description;
    const temp = Math.round(dailyData[0].main.temp);
    const currentIconCode = dailyData[0].weather[0].icon;
    const currentIconUrl = `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`;

    document.getElementById("City-name").textContent = `City: ${cityName}, ${countryName}`;
    document.getElementById("weather-desc").textContent = `Weather Description: ${description}`;
    document.getElementById("temp").textContent = `Temperature: ${temp}°C`;

    // Insert weather icon into overlay (if not already added)
    let iconImg = document.querySelector(".weather-icon");
    if (!iconImg) {
      iconImg = document.createElement("img");
      iconImg.className = "weather-icon w-16 h-16 mb-2";
      const textContainer = document.getElementById("City-name").parentElement;
      textContainer.insertBefore(iconImg, textContainer.firstChild);
    }
    iconImg.src = currentIconUrl;
    iconImg.alt = description;

    // Clear previous forecast
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";

    // Build forecast cards
    dailyData.slice(0, 5).forEach(day => {
      const date = new Date(day.dt_txt).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short"
      });

      const dayTemp = Math.round(day.main.temp);
      const dayDesc = day.weather[0].main;
      const iconCode = day.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

      const dayDiv = document.createElement("div");
      dayDiv.className = "bg-white bg-opacity-30 text-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center";

      dayDiv.innerHTML = `
        <p class="font-semibold">${date}</p>
        <img src="${iconUrl}" alt="${dayDesc}" class="w-12 h-12" />
        <p class="text-sm">${dayDesc}</p>
        <p class="text-lg font-bold">${dayTemp}°C</p>
      `;

      forecastContainer.appendChild(dayDiv);
    });

  } catch (error) {
    console.error("Error fetching weather:", error);
    alert("Failed to fetch weather. Please check the city name.");
  }
}

// Load default weather for Delhi on page load
window.addEventListener("DOMContentLoaded", () => {
  getFiveDayForecast("Delhi,IN");
});

// Handle search button click
document.getElementById("SearchButton").addEventListener("click", () => {
  const city = document.getElementById("Searchinput").value.trim();
  if (city) {
    getFiveDayForecast(city);
  } else {
    alert("Please enter a city name.");
  }
});
