// ============================================
// SkyFetch Weather Dashboard - Part 3
// OOP with Prototypal Inheritance + 5-Day Forecast
// ============================================

// ── Constructor Function ──────────────────────
function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // Store DOM references once (better performance)
    this.searchBtn = document.getElementById('search-btn');
    this.cityInput = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');

    this.init();
}

// ── init: set up event listeners ─────────────
WeatherApp.prototype.init = function() {
    // .bind(this) keeps 'this' pointing to the WeatherApp instance
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));

    this.cityInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.handleSearch();
        }
    }.bind(this));

    this.showWelcome();
};

// ── showWelcome ───────────────────────────────
WeatherApp.prototype.showWelcome = function() {
    this.weatherDisplay.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">🌤️</div>
            <h2>Welcome to SkyFetch!</h2>
            <p>Enter a city name above to get the current weather and 5-day forecast.</p>
        </div>
    `;
};

// ── handleSearch ──────────────────────────────
WeatherApp.prototype.handleSearch = function() {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError('Please enter a city name.');
        return;
    }
    if (city.length < 2) {
        this.showError('City name is too short.');
        return;
    }

    this.getWeather(city);
    this.cityInput.value = '';
};

// ── showLoading ───────────────────────────────
WeatherApp.prototype.showLoading = function() {
    this.weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p class="loading">Fetching weather data...</p>
        </div>
    `;
};

// ── showError ─────────────────────────────────
WeatherApp.prototype.showError = function(message) {
    this.weatherDisplay.innerHTML = `
        <div class="error-message">
            ❌ <strong>Oops!</strong> ${message}
        </div>
    `;
};

// ── getForecast ───────────────────────────────
WeatherApp.prototype.getForecast = async function(city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        throw error;
    }
};

// ── getWeather: fetches both APIs with Promise.all ──
WeatherApp.prototype.getWeather = async function(city) {
    this.showLoading();
    this.searchBtn.disabled = true;
    this.searchBtn.textContent = 'Searching...';

    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        // Fetch current weather and forecast simultaneously
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

    } catch (error) {
        console.error('Error:', error);
        if (error.response && error.response.status === 404) {
            this.showError('City not found. Please check the spelling and try again.');
        } else {
            this.showError('Something went wrong. Please try again later.');
        }
    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = '🔍 Search';
    }
};

// ── displayWeather ────────────────────────────
WeatherApp.prototype.displayWeather = function(data) {
    const cityName = data.name;
    const country = data.sys.country;
    const temperature = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    this.weatherDisplay.innerHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}, ${country}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
            <div class="weather-meta">
                <span>Feels like ${feelsLike}°C</span>
                <span>Humidity ${humidity}%</span>
            </div>
        </div>
    `;

    this.cityInput.focus();
};

// ── processForecastData: filter to 1 entry per day ──
WeatherApp.prototype.processForecastData = function(data) {
    // Each item has dt_txt like "2024-01-20 12:00:00"
    // Filter to noon entries only → one forecast per day
    const dailyForecasts = data.list.filter(function(item) {
        return item.dt_txt.includes('12:00:00');
    });
    return dailyForecasts.slice(0, 5);
};

// ── displayForecast ───────────────────────────
WeatherApp.prototype.displayForecast = function(data) {
    const dailyForecasts = this.processForecastData(data);

    const forecastHTML = dailyForecasts.map(function(day) {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const temp = Math.round(day.main.temp);
        const tempMin = Math.round(day.main.temp_min);
        const tempMax = Math.round(day.main.temp_max);
        const description = day.weather[0].description;
        const icon = day.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

        return `
            <div class="forecast-card">
                <h4 class="forecast-day">${dayName}</h4>
                <p class="forecast-date">${dateStr}</p>
                <img src="${iconUrl}" alt="${description}" class="forecast-icon">
                <div class="forecast-temp">${temp}°C</div>
                <div class="forecast-range">${tempMax}° / ${tempMin}°</div>
                <p class="forecast-desc">${description}</p>
            </div>
        `;
    }).join('');

    // Use += to APPEND forecast below current weather
    this.weatherDisplay.innerHTML += `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;
};

// ── Bootstrap: create one instance ───────────
const app = new WeatherApp('9bccb7c310aaf33427f2ccf3342c4f31');