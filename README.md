# 🌤️ SkyFetch - Weather Dashboard

A beautiful, interactive weather dashboard that provides real-time
weather data and 5-day forecasts for any city in the world.

## 🚀 Live Demo

[Add your Vercel URL here after deployment]

## ✨ Features

- 🔍 Search weather for any city worldwide
- 🌡️ Current temperature, feels-like, and humidity
- 📊 5-day weather forecast with daily predictions
- 💾 Recent searches saved with localStorage
- 🔄 Auto-loads last searched city on page refresh
- 🗑️ Clear recent search history
- 📱 Fully responsive design (mobile, tablet, desktop)
- ⚡ Simultaneous API calls with Promise.all()

## 🛠️ Technologies Used

- HTML5
- CSS3 (Grid, Flexbox, Animations)
- JavaScript ES6+ (OOP, Async/Await, Promises)
- Axios (HTTP requests)
- OpenWeatherMap API
- localStorage (data persistence)
- Vercel (deployment)

## 🎯 Concepts Demonstrated

- Prototypal Inheritance (Constructor Functions)
- Async/Await & Promise.all()
- DOM Manipulation
- Event Handling with .bind(this)
- Error Handling (try/catch/finally)
- localStorage API (get, set, remove)
- JSON.stringify() / JSON.parse()
- Array methods (filter, map, unshift, splice, pop)
- Responsive Web Design (CSS Grid + Flexbox)

## 💻 Local Setup

1. Clone the repository:
   git clone https://github.com/YOUR-USERNAME/skyfetch-weather-dashboard.git

2. Navigate to the project:
   cd skyfetch-weather-dashboard

3. Get a free API key from https://openweathermap.org/api

4. Replace the API key in app.js:
   const app = new WeatherApp('YOUR_API_KEY_HERE');

5. Open index.html in your browser — done!

## 📸 Screenshots

[Add screenshots after deployment]

## 📁 Project Structure

skyfetch-weather-dashboard/
├── index.html   - App structure + recent searches section
├── style.css    - All styles including forecast grid
├── app.js       - WeatherApp OOP class + all methods
└── README.md    - This file

## 👨‍💻 Author

[Your Name]
GitHub: @your-username
LinkedIn: your-linkedin

## 🙏 Acknowledgments

- Weather data by OpenWeatherMap API
- Built as part of Frontend Web Development Advanced Course