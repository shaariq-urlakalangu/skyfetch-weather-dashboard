// ============================================
// SkyFetch Weather Dashboard - Part 4
// localStorage + Recent Searches + Auto-load
// ============================================

// ── Constructor Function ──────────────────────
function WeatherApp(apiKey) {
    this.apiKey      = apiKey;
    this.apiUrl      = 'https://api.openweathermap.org/data/2.5/weather';
    this.forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // Existing DOM references
    this.searchBtn      = document.getElementById('search-btn');
    this.cityInput      = document.getElementById('city-input');
    this.weatherDisplay = document.getElementById('weather-display');

    // NEW: Recent searches DOM references
    this.recentSection    = document.getElementById('recent-searches-section');
    this.recentContainer  = document.getElementById('recent-searches-container');

    // NEW: Recent searches state
    this.recentSearches    = [];
    this.maxRecentSearches = 5;

    this.init();
}

// ── init ─────────────────────────────────────
WeatherApp.prototype.init = function() {
    this.searchBtn.addEventListener('click', this.handleSearch.bind(this));

    this.cityInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.handleSearch();
        }
    }.bind(this));

    // NEW: wire up clear-history button
    const clearBtn = document.getElementById('clear-history-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', this.clearHistory.bind(this));
    }

    // NEW: load saved searches then auto-load last city
    this.loadRecentSearches();
    this.loadLastCity();
};

// ── showWelcome ───────────────────────────────
WeatherApp.prototype.showWelcome = function() {
    this.weatherDisplay.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">🌤️</div>
            <h2>Welcome to SkyFetch!</h2>
            <p>Enter a city name above to get the current weather and 5-day forecast.</p>
            <p class="welcome-hint">Try: London, Tokyo, New York, Paris</p>
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

// ── NEW: loadRecentSearches ───────────────────
WeatherApp.prototype.loadRecentSearches = function() {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
        this.recentSearches = JSON.parse(saved);
    }
    this.displayRecentSearches();
};

// ── NEW: saveRecentSearch ─────────────────────
WeatherApp.prototype.saveRecentSearch = function(city) {
    // Title-case for consistency
    const cityName = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    // Remove duplicate if it exists
    const index = this.recentSearches.indexOf(cityName);
    if (index > -1) {
        this.recentSearches.splice(index, 1);
    }

    // Add to front
    this.recentSearches.unshift(cityName);

    // Keep only max 5
    if (this.recentSearches.length > this.maxRecentSearches) {
        this.recentSearches.pop();
    }

    // Persist to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));

    this.displayRecentSearches();
};

// ── NEW: displayRecentSearches ────────────────
WeatherApp.prototype.displayRecentSearches = function() {
    this.recentContainer.innerHTML = '';

    if (this.recentSearches.length === 0) {
        this.recentSection.style.display = 'none';
        return;
    }

    this.recentSection.style.display = 'block';

    this.recentSearches.forEach(function(city) {
        const btn = document.createElement('button');
        btn.className   = 'recent-search-btn';
        btn.textContent = city;

        btn.addEventListener('click', function() {
            this.cityInput.value = city;
            this.getWeather(city);
        }.bind(this));

        this.recentContainer.appendChild(btn);
    }.bind(this));
};

// ── NEW: loadLastCity ─────────────────────────
WeatherApp.prototype.loadLastCity = function() {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        this.getWeather(lastCity);
    } else {
        this.showWelcome();
    }
};

// ── NEW: clearHistory ─────────────────────────
WeatherApp.prototype.clearHistory = function() {
    if (confirm('Clear all recent searches?')) {
        this.recentSearches = [];
        localStorage.removeItem('recentSearches');
        this.displayRecentSearches();
    }
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

// ── getWeather ────────────────────────────────
WeatherApp.prototype.getWeather = async function(city) {
    this.showLoading();
    this.searchBtn.disabled    = true;
    this.searchBtn.textContent = 'Searching...';

    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

        // NEW: save successful search
        this.saveRecentSearch(city);
        localStorage.setItem('lastCity', city);

    } catch (error) {
        console.error('Error:', error);
        if (error.response && error.response.status === 404) {
            this.showError('City not found. Please check the spelling and try again.');
        } else {
            this.showError('Something went wrong. Please try again later.');
        }
    } finally {
        this.searchBtn.disabled    = false;
        this.searchBtn.textContent = '🔍 Search';
    }
};

// ── displayWeather ────────────────────────────
WeatherApp.prototype.displayWeather = function(data) {
    const cityName    = data.name;
    const country     = data.sys.country;
    const temperature = Math.round(data.main.temp);
    const feelsLike   = Math.round(data.main.feels_like);
    const humidity    = data.main.humidity;
    const description = data.weather[0].description;
    const icon        = data.weather[0].icon;
    const iconUrl     = `https://openweathermap.org/img/wn/${icon}@2x.png`;

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

// ── processForecastData ───────────────────────
WeatherApp.prototype.processForecastData = function(data) {
    const dailyForecasts = data.list.filter(function(item) {
        return item.dt_txt.includes('12:00:00');
    });
    return dailyForecasts.slice(0, 5);
};

// ── displayForecast ───────────────────────────
WeatherApp.prototype.displayForecast = function(data) {
    const dailyForecasts = this.processForecastData(data);

    const forecastHTML = dailyForecasts.map(function(day) {
        const date        = new Date(day.dt * 1000);
        const dayName     = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr     = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const temp        = Math.round(day.main.temp);
        const tempMin     = Math.round(day.main.temp_min);
        const tempMax     = Math.round(day.main.temp_max);
        const description = day.weather[0].description;
        const icon        = day.weather[0].icon;
        const iconUrl     = `https://openweathermap.org/img/wn/${icon}@2x.png`;

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

    this.weatherDisplay.innerHTML += `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;
};

// ── Bootstrap ────────────────────────────────
const app = new WeatherApp('9bccb7c310aaf33427f2ccf3342c4f31');