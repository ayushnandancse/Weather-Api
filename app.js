const WMO_CODES = {
    0: { desc: 'Clear sky', icon: '☀️' },
    1: { desc: 'Mainly clear', icon: '🌤️' },
    2: { desc: 'Partly cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Fog', icon: '🌫️' },
    48: { desc: 'Depositing rime fog', icon: '🌫️' },
    51: { desc: 'Drizzle: Light', icon: '🌧️' },
    53: { desc: 'Drizzle: Moderate', icon: '🌧️' },
    55: { desc: 'Drizzle: Dense', icon: '🌧️' },
    56: { desc: 'Freezing Drizzle: Light', icon: '🌧️' },
    57: { desc: 'Freezing Drizzle: Dense', icon: '🌧️' },
    61: { desc: 'Rain: Slight', icon: '🌧️' },
    63: { desc: 'Rain: Moderate', icon: '🌧️' },
    65: { desc: 'Rain: Heavy', icon: '🌧️' },
    66: { desc: 'Freezing Rain: Light', icon: '🌧️' },
    67: { desc: 'Freezing Rain: Heavy', icon: '🌧️' },
    71: { desc: 'Snow fall: Slight', icon: '❄️' },
    73: { desc: 'Snow fall: Moderate', icon: '❄️' },
    75: { desc: 'Snow fall: Heavy', icon: '❄️' },
    77: { desc: 'Snow grains', icon: '❄️' },
    80: { desc: 'Rain showers: Slight', icon: '🌦️' },
    81: { desc: 'Rain showers: Moderate', icon: '🌦️' },
    82: { desc: 'Rain showers: Violent', icon: '🌦️' },
    85: { desc: 'Snow showers: Slight', icon: '❄️' },
    86: { desc: 'Snow showers: Heavy', icon: '❄️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' },
    96: { desc: 'Thunderstorm, slight hail', icon: '⛈️' },
    99: { desc: 'Thunderstorm, heavy hail', icon: '⛈️' }
};

const searchInput = document.getElementById('search-input');
const suggestionsList = document.getElementById('suggestions');
const searchView = document.getElementById('search-view');
const weatherView = document.getElementById('weather-view');
const backBtn = document.getElementById('back-btn');

const elements = {
    cityName: document.getElementById('city-name'),
    weatherIcon: document.getElementById('weather-icon'),
    currentTemp: document.getElementById('current-temp'),
    weatherDesc: document.getElementById('weather-desc'),
    humidity: document.getElementById('humidity'),
    wind: document.getElementById('wind'),
    uv: document.getElementById('uv'),
    feelsLike: document.getElementById('feels-like'),
    forecastList: document.getElementById('forecast-list')
};

let debounceTimer;

// Handle typing in search input
searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        suggestionsList.innerHTML = '';
        suggestionsList.classList.add('hidden');
        return;
    }
    
    debounceTimer = setTimeout(() => {
        fetchSuggestions(query);
    }, 300);
});

// Fetch city suggestions from Open-Meteo Geocoding API
async function fetchSuggestions(query) {
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
        const data = await res.json();
        
        if (data.results && data.results.length > 0) {
            renderSuggestions(data.results);
        } else {
            suggestionsList.innerHTML = '<li class="suggestion-item" style="color: var(--text-secondary); cursor: default;">No results found</li>';
            suggestionsList.classList.remove('hidden');
        }
    } catch (err) {
        console.error('Error fetching suggestions:', err);
    }
}

// Render the dropdown suggestions
function renderSuggestions(results) {
    suggestionsList.innerHTML = '';
    results.forEach(city => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        
        const region = city.admin1 ? `, ${city.admin1}` : '';
        const country = city.country ? `, ${city.country}` : '';
        li.textContent = `${city.name}${region}${country}`;
        
        li.addEventListener('click', () => {
            selectCity(city);
        });
        
        suggestionsList.appendChild(li);
    });
    suggestionsList.classList.remove('hidden');
}

// Handle city selection
async function selectCity(city) {
    searchInput.value = '';
    suggestionsList.innerHTML = '';
    suggestionsList.classList.add('hidden');
    
    // Animate transition to dashboard
    searchView.classList.remove('active');
    searchView.classList.add('hidden');
    
    elements.cityName.textContent = city.name;
    
    try {
        await fetchWeather(city.latitude, city.longitude);
        setTimeout(() => {
            weatherView.classList.remove('hidden');
            weatherView.classList.add('active');
        }, 300);
    } catch (err) {
        console.error('Error fetching weather:', err);
        alert('Failed to load weather data.');
        backToSearch();
    }
}

// Fetch weather from Open-Meteo API
async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto&forecast_days=8`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    
    updateDashboard(data);
}

// Update the weather UI components
function updateDashboard(data) {
    const current = data.current;
    const daily = data.daily;
    
    const weatherInfo = WMO_CODES[current.weather_code] || { desc: 'Unknown', icon: '🌡️' };
    
    elements.weatherIcon.textContent = weatherInfo.icon;
    elements.currentTemp.textContent = `${Math.round(current.temperature_2m)}°`;
    elements.weatherDesc.textContent = weatherInfo.desc;
    
    elements.humidity.textContent = `${current.relative_humidity_2m}%`;
    elements.wind.textContent = `${current.wind_speed_10m} km/h`;
    elements.feelsLike.textContent = `${Math.round(current.apparent_temperature)}°`;
    
    const todayUV = daily.uv_index_max && daily.uv_index_max[0] ? daily.uv_index_max[0] : '--';
    elements.uv.textContent = todayUV;
    
    // Update Forecast (Next 7 days, skipping today which is index 0)
    elements.forecastList.innerHTML = '';
    let forecastCount = 0;
    for (let i = 1; i <= 7; i++) {
        if (!daily.time[i]) break;
        
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]);
        const fWeatherInfo = WMO_CODES[daily.weather_code[i]] || { desc: 'Unknown', icon: '🌡️' };
        
        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">${fWeatherInfo.icon}</div>
            <div class="forecast-temp">
                ${maxTemp}°<span class="forecast-temp-min">${minTemp}°</span>
            </div>
        `;
        elements.forecastList.appendChild(item);
        forecastCount++;
    }
    
    if (forecastCount === 0) {
        elements.forecastList.innerHTML = '<div style="color: var(--text-secondary); text-align: center; width: 100%;">Forecast not available</div>';
    }
}

// Handle back button click
function backToSearch() {
    weatherView.classList.remove('active');
    weatherView.classList.add('hidden');
    
    setTimeout(() => {
        searchView.classList.remove('hidden');
        searchView.classList.add('active');
        searchInput.focus();
    }, 400); // Wait for dashboard to hide
}

backBtn.addEventListener('click', backToSearch);
