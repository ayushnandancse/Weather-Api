# macOS-Style Weather App

A beautiful, premium single-page weather web application inspired by the macOS aesthetic. 

## Features
- **Minimalist Search**: A central Spotlight-style search bar for clean, distraction-free input.
- **Dynamic Autocomplete**: Real-time city suggestions as you type.
- **Glassmorphism UI**: Beautiful translucent dashboard panels with a vibrant animated background.
- **Detailed Weather Data**: Displays current temperature, weather conditions, humidity, wind speed, UV index, and a 3-day forecast.

## Technologies Used
- HTML5
- CSS3 (Vanilla, custom design system using CSS Variables and Flexbox/Grid)
- Vanilla JavaScript (ES6+)

## APIs
- **Geocoding API**: [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) for city search autocomplete.
- **Weather API**: [Open-Meteo Weather Forecast API](https://open-meteo.com/en/docs) for fetching weather conditions. Both APIs are completely free and require no authentication.

## How to Run Locally
Since this is a client-side only application, you can run it directly in your browser:
1. Double-click the `index.html` file to open it in your default web browser.
2. Alternatively, you can serve it via a local development server for a more robust experience:
   ```bash
   # using python
   python3 -m http.server 8085
   ```
   Then navigate to `http://localhost:8085` in your browser.

## Author
AI Assistant (Antigravity)
