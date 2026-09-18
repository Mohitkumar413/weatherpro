 // ========================================
// ELEMENTS
// ========================================

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const loading = document.getElementById("loading");
const dashboard = document.getElementById("weatherDashboard");
const errorMessage = document.getElementById("errorMessage");

const suggestions = document.getElementById("suggestions");
const themeBtn = document.getElementById("themeBtn");

const locationBtn = document.getElementById("locationBtn");


// ========================================
// SEARCH BUTTON
// ========================================

searchBtn.addEventListener("click", function () {
    searchWeather();
});


// ========================================
// ENTER KEY
// ========================================

searchInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        searchWeather();
    }

});


// ========================================
// LIVE LOCATION SUGGESTIONS
// ========================================

let searchTimer;

searchInput.addEventListener("input", function () {

    clearTimeout(searchTimer);

    const query = searchInput.value.trim();

    if (query.length < 2) {

        suggestions.innerHTML = "";

        return;
    }


    searchTimer = setTimeout(async function () {

        try {

            const url =
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;


            const response =
                await fetch(url);


            if (!response.ok) {
                throw new Error("Location search failed");
            }


            const data =
                await response.json();


            suggestions.innerHTML = "";


            if (
                !data.results ||
                data.results.length === 0
            ) {

                suggestions.innerHTML = `

                    <div class="suggestion-item">

                        <div class="suggestion-icon">
                            🔍
                        </div>

                        <div>

                            <div class="suggestion-name">
                                No location found
                            </div>

                            <div class="suggestion-details">
                                Try another city or district
                            </div>

                        </div>

                    </div>

                `;

                return;
            }


            // Create suggestions
            data.results.forEach(function (place) {

                const item =
                    document.createElement("div");


                item.className =
                    "suggestion-item";


                const state =
                    place.admin1 || "";


                const country =
                    place.country || "";


                const details =
                    [state, country]
                        .filter(Boolean)
                        .join(", ");


                item.innerHTML = `

                    <div class="suggestion-icon">
                        📍
                    </div>

                    <div>

                        <div class="suggestion-name">
                            ${place.name}
                        </div>

                        <div class="suggestion-details">
                            ${details}
                        </div>

                    </div>

                `;


                // Click suggestion
                item.addEventListener(
                    "click",
                    function () {

                        searchInput.value =
                            place.name;

                        suggestions.innerHTML = "";

                        searchWeatherByLocation(
                            place
                        );

                    }
                );


                suggestions.appendChild(item);

            });


        } catch (error) {

            console.error(
                "Suggestion error:",
                error
            );

        }

    }, 400);

});


// ========================================
// SEARCH WEATHER
// ========================================

async function searchWeather() {

    const query =
        searchInput.value.trim();


    if (!query) {

        searchInput.focus();

        return;
    }


    dashboard.classList.add("hidden");

    errorMessage.classList.add("hidden");

    suggestions.innerHTML = "";

    loading.classList.remove("hidden");


    try {

        // Geocoding API
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;


        const geoResponse =
            await fetch(geoURL);


        if (!geoResponse.ok) {

            throw new Error(
                "Location search failed"
            );

        }


        const geoData =
            await geoResponse.json();


        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {

            throw new Error(
                "Location not found"
            );

        }


        const place =
            geoData.results[0];


        await searchWeatherByLocation(
            place
        );


    } catch (error) {

        console.error(error);

        loading.classList.add("hidden");

        dashboard.classList.add("hidden");

        errorMessage.classList.remove(
            "hidden"
        );

    }

}


// ========================================
// GET WEATHER BY LOCATION
// ========================================

async function searchWeatherByLocation(place) {

    dashboard.classList.add("hidden");

    errorMessage.classList.add("hidden");

    loading.classList.remove("hidden");


    try {

        const latitude =
            place.latitude;


        const longitude =
            place.longitude;


        const city =
            place.name || "Unknown";


        const state =
            place.admin1 || "";


        const country =
            place.country || "";


        // ========================================
        // OPEN-METEO WEATHER API
        // ========================================

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +

            `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,weather_code` +

            `&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m` +

            `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset` +

            `&timezone=auto` +

            `&forecast_days=7`;


        const response =
            await fetch(weatherURL);


        if (!response.ok) {

            throw new Error(
                "Weather API failed"
            );

        }


        const weather =
            await response.json();


        // ========================================
        // LOCATION
        // ========================================

        document.getElementById(
            "locationName"
        ).textContent = city;


        document.getElementById(
            "locationDetails"
        ).textContent =
            [state, country]
                .filter(Boolean)
                .join(", ");


        // ========================================
        // CURRENT WEATHER
        // ========================================

        const current =
            weather.current;

            // ========================================
// SUNRISE / SUNSET / WIND DIRECTION
// ========================================

const daily = weather.daily;

// Sunrise
const sunriseTime = daily.sunrise[0];

document.getElementById("sunrise").textContent =
    formatTime(sunriseTime);


// Sunset
const sunsetTime = daily.sunset[0];

document.getElementById("sunset").textContent =
    formatTime(sunsetTime);


// Wind Direction
const windDirection =
    current.wind_direction_10m;

document.getElementById("windDirection").textContent =
    getWindDirection(windDirection);


// Local Time
const localTime =
    weather.current.time;

document.getElementById("localTime").textContent =
    formatTime(localTime);


        document.getElementById(
            "temperature"
        ).textContent =
            Math.round(
                current.temperature_2m
            );


        document.getElementById(
            "feelsLike"
        ).textContent =
            Math.round(
                current.apparent_temperature
            );


        document.getElementById(
            "humidity"
        ).textContent =
            `${current.relative_humidity_2m}%`;


        document.getElementById(
            "wind"
        ).textContent =
            `${Math.round(current.wind_speed_10m)} km/h`;


        document.getElementById(
            "rain"
        ).textContent =
            `${current.precipitation} mm`;


        document.getElementById(
            "cloud"
        ).textContent =
            `${current.cloud_cover}%`;


        document.getElementById(
            "pressure"
        ).textContent =
            `${Math.round(current.pressure_msl)} hPa`;


        // ========================================
        // WEATHER CONDITION
        // ========================================

        const code =
            current.weather_code;


        document.getElementById(
            "condition"
        ).textContent =
            getWeatherDescription(code);


        document.getElementById(
            "weatherIcon"
        ).textContent =
            getWeatherIcon(code);


        // ========================================
        // UV INDEX
        // ========================================

        const uv =
            weather.daily.uv_index_max[0];


        document.getElementById(
            "uv"
        ).textContent =
            uv !== null &&
            uv !== undefined
                ? Number(uv).toFixed(1)
                : "--";


        // ========================================
        // 7 DAY FORECAST
        // ========================================

        createForecast(weather);


        // ========================================
        // FINISH LOADING
        // ========================================

        loading.classList.add("hidden");

        dashboard.classList.remove("hidden");


    } catch (error) {

        console.error(
            "Weather error:",
            error
        );

        loading.classList.add("hidden");

        dashboard.classList.add("hidden");

        errorMessage.classList.remove(
            "hidden"
        );

    }

}


// ========================================
// WEATHER DESCRIPTION
// ========================================

function getWeatherDescription(code) {

    if (code === 0)
        return "Clear sky";

    if ([1, 2].includes(code))
        return "Partly cloudy";

    if (code === 3)
        return "Overcast";

    if ([45, 48].includes(code))
        return "Foggy";

    if (
        [51, 53, 55, 56, 57]
            .includes(code)
    )
        return "Drizzle";

    if (
        [61, 63, 65, 66, 67]
            .includes(code)
    )
        return "Rain";

    if (
        [71, 73, 75, 77]
            .includes(code)
    )
        return "Snow";

    if (
        [80, 81, 82]
            .includes(code)
    )
        return "Rain showers";

    if (
        [85, 86].includes(code)
    )
        return "Snow showers";

    if (
        [95, 96, 99].includes(code)
    )
        return "Thunderstorm";

    return "Unknown";
}


// ========================================
// WEATHER ICON
// ========================================

function getWeatherIcon(code) {

    if (code === 0)
        return "☀️";

    if ([1, 2].includes(code))
        return "🌤️";

    if (code === 3)
        return "☁️";

    if ([45, 48].includes(code))
        return "🌫️";

    if (
        [51, 53, 55, 56, 57]
            .includes(code)
    )
        return "🌦️";

    if (
        [61, 63, 65, 66, 67]
            .includes(code)
    )
        return "🌧️";

    if (
        [71, 73, 75, 77]
            .includes(code)
    )
        return "❄️";

    if (
        [80, 81, 82]
            .includes(code)
    )
        return "🌦️";

    if (
        [85, 86].includes(code)
    )
        return "🌨️";

    if (
        [95, 96, 99].includes(code)
    )
        return "⛈️";

    return "🌤️";
}


// ========================================
// 7 DAY FORECAST
// ========================================

function createForecast(weather) {

    const forecastContainer =
        document.getElementById(
            "forecast"
        );


    forecastContainer.innerHTML = "";


    const daily =
        weather.daily;


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date =
            new Date(
                daily.time[i] +
                "T12:00:00"
            );


        const day =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        const code =
            daily.weather_code[i];


        const maxTemp =
            Math.round(
                daily.temperature_2m_max[i]
            );


        const minTemp =
            Math.round(
                daily.temperature_2m_min[i]
            );


        const rainChance =
            daily
                .precipitation_probability_max[i];


        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        card.innerHTML = `

            <div class="day">
                ${day}
            </div>

            <div class="icon">
                ${getWeatherIcon(code)}
            </div>

            <div class="temp">
                ${maxTemp}° / ${minTemp}°
            </div>

            <div style="
                margin-top:8px;
                font-size:12px;
                color:rgba(255,255,255,0.65);
            ">
                🌧️ ${rainChance ?? 0}%
            </div>

        `;


        forecastContainer.appendChild(card);

    }

}


// ========================================
// DARK / LIGHT MODE
// ========================================

themeBtn.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "light-mode"
        );


        if (
            document.body.classList.contains(
                "light-mode"
            )
        ) {

            themeBtn.textContent = "☀️";

        } else {

            themeBtn.textContent = "🌙";

        }

    }
);


// ========================================
// ESC - CLOSE SUGGESTIONS
// ========================================

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            suggestions.innerHTML = "";

        }

    }
);


// ========================================
// GET CURRENT LOCATION
// ========================================

function getCurrentLocation() {

    if (!navigator.geolocation) {

        alert(
            "Your browser does not support location."
        );

        return;
    }


    dashboard.classList.add("hidden");

    errorMessage.classList.add("hidden");

    loading.classList.remove("hidden");


    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const latitude =
                position.coords.latitude;


            const longitude =
                position.coords.longitude;


            try {

                // ========================================
                // REVERSE GEOCODING
                // ========================================

                const reverseURL =
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;


                const reverseResponse =
                    await fetch(reverseURL);


                const locationData =
                    await reverseResponse.json();


                const city =
                    locationData.city ||
                    locationData.locality ||
                    locationData.principalSubdivision ||
                    "Your Location";


                const state =
                    locationData.principalSubdivision ||
                    "";


                const country =
                    locationData.countryName ||
                    "";


                // Create location object
                const place = {

                    latitude: latitude,

                    longitude: longitude,

                    name: city,

                    admin1: state,

                    country: country

                };


                // Put location name in search
                searchInput.value =
                    city;


                // Fetch weather
                await searchWeatherByLocation(
                    place
                );


            } catch (error) {

                console.error(
                    "Current location error:",
                    error
                );


                loading.classList.add(
                    "hidden"
                );

                errorMessage.classList.remove(
                    "hidden"
                );

            }

        },


        function (error) {

            console.log(
                "Location permission denied/error:",
                error.message
            );


            loading.classList.add(
                "hidden"
            );


            alert(
                "Please allow location permission to use this feature."
            );

        },


        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }

    );

}





// window.addEventListener("load", () => {
//     showLoading();

//     if (!navigator.geolocation) {
//         return;
//     }

//     navigator.geolocation.getCurrentPosition(
//         (position) => {
//             getCurrentLocation();
//         },
//         (error) => {
//             console.log("Location permission denied.");
//             showLoading();
//         },
//         {
//             enableHighAccuracy: true,
//             timeout: 10000,
//             maximumAge: 0
//         }
//     );
// });









// ========================================
// AUTOMATIC LOCATION ON WEBSITE OPEN
// ========================================

window.addEventListener(
    "load",
    function () {

        getCurrentLocation();

    }
);


// ========================================
// USE MY LOCATION BUTTON
// ========================================

if (locationBtn) {

    locationBtn.addEventListener(
        "click",
        function () {

            getCurrentLocation();

        }
    );

}

// ========================================
// FORMAT TIME
// ========================================
 

function formatTime(timeString) {
    if (!timeString) return "--:--";

    const timePart = timeString.split("T")[1];

    if (!timePart) return "--:--";

    let [hour, minute] = timePart.split(":");

    hour = Number(hour);

    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${ampm}`;
}




// ========================================
// WIND DIRECTION
// ========================================

function getWindDirection(degrees) {

    if (
        degrees === null ||
        degrees === undefined
    ) {
        return "--";
    }

    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];

    const index =
        Math.round(degrees / 45) % 8;

    return directions[index];
}






/* ========================================
   NAVBAR SCROLL EFFECT
======================================== */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (!navbar) return;

    if (window.scrollY > 30) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }

});
 