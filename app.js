// Your OpenWeatherMap API Key
const API_KEY = '9bccb7c310aaf33427f2ccf3342c4f31';  // Replace with your actual API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';


const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");

function showError(message) {
    const errorHTML = `
        <div class="error-message">
            ❌ ${message}
        </div>
    `;
    document.getElementById('weather-display').innerHTML = errorHTML;
}

function showLoading() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p class="loading">Loading weather data...</p>
        </div>
    `;
    document.getElementById('weather-display').innerHTML = loadingHTML;
}

async function getWeather(city) {
    showLoading();
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    
    try {
        const response = await axios.get(url);
        console.log('Weather Data:', response.data);
        displayWeather(response.data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        if (error.response && error.response.status === 404) {
            showError('City not found. Please check the spelling and try again.');
        } else {
            showError('Something went wrong. Please try again later.');
        }
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
    }
}

function displayWeather(data) {
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;
    
    document.getElementById('weather-display').innerHTML = weatherHTML;
    cityInput.focus();
}

searchBtn.addEventListener('click', function() {
    let city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
    } else if (city.length < 2) {
        showError('City name too short');
    } else {
        getWeather(city);
    }
});

cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        let city = cityInput.value.trim();
        if (!city) {
            showError('Please enter a city name');
        } else if (city.length < 2) {
            showError('City name too short');
        } else {
            getWeather(city);
        }
    }
});

document.getElementById('weather-display').innerHTML = `
    <div class="welcome-message">
        Enter a city name to get started!
    </div>
`;