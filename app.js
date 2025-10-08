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

    // Get main weather condition of the first forecast day (lowercase)
    const weatherMain = dailyData[0].weather[0].main.toLowerCase();

    // Map weather conditions to image paths
    const weatherImages = {
      rain: "images/rain.png",
      snow: "images/snow.png",
      clear: "images/hot.png",
      clouds: "images/cloudy.png", 
      drizzle: "images/drizzle.png", 
      thunderstorm: "images/storm.png" 
    };

    const defaultImage = "images/default.jpg";

    // Set background image in <aside>
    const asideImg = document.querySelector("#aside-img");
    if (asideImg) {
      asideImg.src = weatherImages[weatherMain] || defaultImage;
    }

    // Set current weather data
    const cityName = data.city.name;
    const countryName = getCountryName(data.city.country);
    const description = dailyData[0].weather[0].description;
    const temp = Math.round(dailyData[0].main.temp);
    const currentIconCode = dailyData[0].weather[0].icon;
    const currentIconUrl = `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`;

    document.getElementById("City-name").textContent = `City: ${cityName}, ${countryName}`;
    document.getElementById("weather-desc").textContent = `Weather Description: ${description}`;
    document.getElementById("temp").textContent = `Temperature: ${temp}°C`;

    // Insert weather icon inside aside text container
    let iconImg = document.querySelector("aside > div.absolute img.weather-icon");
    if (!iconImg) {
      iconImg = document.createElement("img");
      iconImg.className = "weather-icon w-16 h-16 mb-2";
      document.querySelector("aside > div.absolute").insertBefore(iconImg, document.getElementById("City-name"));
    }
    iconImg.src = currentIconUrl;
    iconImg.alt = description;

    // Optional background overlays styling
    const aside = document.querySelector("#aside-img");
    if (aside) {
      aside.style.backgroundColor = "rgba(156, 163, 175, 0.3)";
    }

    const textContainer = document.querySelector("aside > div.absolute");
    if (textContainer) {
      textContainer.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    }

    // Clear previous forecast
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";

    // Create 5-day forecast cards
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
      dayDiv.className =
        "bg-white bg-opacity-30 text-gray-800 p-4 rounded-xl shadow-md flex flex-col items-center";

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
  getFiveDayForecast("Delhi,India");
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
