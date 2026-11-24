
"use strict";

const $ = (id) => document.getElementById(id);

const SHORTCUTS_KEY = "muxShortcuts";


// ============================================
// CLOCK — 12 HOUR FORMAT
// ============================================

function updateClock() {
  const now = new Date();

  $("clock").textContent = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });

  $("date-line").textContent = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).toUpperCase();

  const timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  $("timezone").textContent = timezone || "LOCAL TIME";
  $("local-zone").textContent = timezone || "LOCAL SYSTEM";

  $("today-date").textContent =
    now.toLocaleDateString("en-GB");
}

updateClock();
setInterval(updateClock, 1000);


// ============================================
// MUX PARTICLE EARTH
// ============================================

(() => {
  const canvas = $("earth-canvas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d", {
    alpha: true
  });

  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  const CX = W / 2;
  const CY = H / 2;

  const R = 222;

  let rotation = 0;
  let animationFrame = null;

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Geographic coordinates:
  // [longitude, latitude]

  const continents = [

    // North America
    [
      [-168, 72], [-145, 70], [-130, 60],
      [-125, 50], [-117, 32], [-105, 24],
      [-97, 18], [-82, 25], [-80, 32],
      [-65, 45], [-55, 52], [-60, 65],
      [-85, 75], [-110, 78], [-140, 75]
    ],

    // South America
    [
      [-81, 12], [-70, 10], [-60, 5],
      [-50, -5], [-45, -15], [-52, -30],
      [-60, -45], [-70, -55], [-76, -35],
      [-80, -10]
    ],

    // Europe and Asia
    [
      [-10, 36], [0, 45], [10, 55],
      [25, 60], [40, 55], [55, 60],
      [75, 70], [100, 72], [125, 65],
      [145, 55], [160, 60], [175, 50],
      [160, 40], [140, 35], [130, 25],
      [120, 20], [110, 5], [100, 10],
      [90, 20], [80, 10], [70, 20],
      [60, 25], [50, 30], [40, 35],
      [30, 35], [20, 40], [10, 35],
      [0, 35]
    ],

    // Africa
    [
      [-17, 35], [5, 37], [25, 32],
      [40, 12], [48, 5], [40, -15],
      [30, -32], [18, -35], [10, -25],
      [-2, -10], [-10, 5], [-17, 20]
    ],

    // India
    [
      [68, 25], [78, 30], [88, 26],
      [92, 20], [85, 8], [78, 6],
      [72, 15]
    ],

    // Australia
    [
      [112, -11], [130, -12], [145, -18],
      [153, -28], [145, -39], [130, -35],
      [115, -30], [112, -20]
    ],

    // Greenland
    [
      [-52, 60], [-42, 65], [-30, 75],
      [-38, 82], [-55, 80], [-60, 70]
    ]

  ];


  // Point-in-polygon test

  function pointInPolygon(lon, lat, polygon) {
    let inside = false;

    for (
      let i = 0, j = polygon.length - 1;
      i < polygon.length;
      j = i++
    ) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];

      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersects =
        ((yi > lat) !== (yj > lat)) &&
        (lon < (xj - xi) * (lat - yi) /
          ((yj - yi) || 0.000001) + xi);

      if (intersects) inside = !inside;
    }

    return inside;
  }


  // Generate sphere particles

  const particles = [];

  const LAT_STEP = 3.1;
  const LON_STEP = 3.1;

  for (
    let lat = -87;
    lat <= 87;
    lat += LAT_STEP
  ) {
    const latitude = lat * Math.PI / 180;

    for (
      let lon = -180;
      lon < 180;
      lon += LON_STEP
    ) {
      const longitude = lon * Math.PI / 180;

      const x =
        Math.cos(latitude) *
        Math.sin(longitude);

      const y =
        Math.sin(latitude);

      const z =
        Math.cos(latitude) *
        Math.cos(longitude);

      const land = continents.some(
        polygon => pointInPolygon(lon, lat, polygon)
      );

      particles.push({
        x,
        y,
        z,
        land,
        random: Math.random()
      });
    }
  }


  // Draw background grid

  function drawGrid() {
    ctx.save();

    ctx.strokeStyle = "rgba(0,217,245,0.10)";
    ctx.lineWidth = 1;

    // Horizontal latitude lines

    for (let i = -60; i <= 60; i += 30) {
      const y = CY - Math.sin(i * Math.PI / 180) * R;

      const width =
        Math.cos(i * Math.PI / 180) * R;

      ctx.beginPath();

      ctx.ellipse(
        CX,
        y,
        width,
        4,
        0,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }

    // Longitude curves

    for (let i = 0; i < 180; i += 30) {
      const angle = i * Math.PI / 180;

      ctx.beginPath();

      ctx.ellipse(
        CX,
        CY,
        Math.abs(Math.sin(angle)) * R,
        R,
        0,
        0,
        Math.PI * 2
      );

      ctx.stroke();
    }

    ctx.restore();
  }


  // Atmospheric glow

  function drawAtmosphere() {
    const gradient = ctx.createRadialGradient(
      CX,
      CY,
      R * 0.65,
      CX,
      CY,
      R * 1.13
    );

    gradient.addColorStop(0, "rgba(0,217,245,0)");
    gradient.addColorStop(0.72, "rgba(0,217,245,0.015)");
    gradient.addColorStop(0.91, "rgba(0,217,245,0.07)");
    gradient.addColorStop(1, "rgba(0,217,245,0)");

    ctx.beginPath();

    ctx.arc(
      CX,
      CY,
      R * 1.13,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = gradient;
    ctx.fill();
  }


  // Draw particle Earth

  function drawEarth() {
    ctx.clearRect(0, 0, W, H);

    drawAtmosphere();

    // Sphere background

    const sphereGradient = ctx.createRadialGradient(
      CX - 65,
      CY - 75,
      5,
      CX,
      CY,
      R
    );

    sphereGradient.addColorStop(
      0,
      "rgba(0,217,245,0.065)"
    );

    sphereGradient.addColorStop(
      0.65,
      "rgba(0,217,245,0.025)"
    );

    sphereGradient.addColorStop(
      1,
      "rgba(0,217,245,0.005)"
    );

    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);

    ctx.fillStyle = sphereGradient;
    ctx.fill();

    // Outer edge

    ctx.strokeStyle = "rgba(0,217,245,0.38)";
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.stroke();


    // Globe grid

    drawGrid();


    // Rotation calculations

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const visibleParticles = [];

    for (const p of particles) {

      const x = p.x * cos - p.z * sin;
      const z = p.x * sin + p.z * cos;

      // Only render front hemisphere

      if (z <= 0.015) continue;

      const px = CX + x * R;
      const py = CY - p.y * R;

      const depth = z;

      const size =
        (p.land ? 1.45 : 0.85) +
        depth * (p.land ? 1.0 : 0.45);

      const alpha =
        0.18 + depth * (p.land ? 0.82 : 0.48);

      visibleParticles.push({
        x: px,
        y: py,
        z: depth,
        size,
        alpha,
        land: p.land
      });
    }


    // Sort from back to front

    visibleParticles.sort(
      (a, b) => a.z - b.z
    );


    // Draw particle points

    for (const p of visibleParticles) {

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        p.size,
        0,
        Math.PI * 2
      );

      if (p.land) {
        ctx.fillStyle =
          `rgba(0,217,245,${p.alpha})`;
      } else {
        ctx.fillStyle =
          `rgba(0,160,190,${p.alpha * 0.62})`;
      }

      ctx.fill();
    }


    // Small brighter points on continents

    for (const p of visibleParticles) {

      if (!p.land || p.z < 0.55) continue;

      if (p.size < 2.0) continue;

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        0.65,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(190,250,255,${p.alpha * 0.45})`;

      ctx.fill();
    }


    // Outer atmospheric rim

    const rim = ctx.createRadialGradient(
      CX,
      CY,
      R * 0.94,
      CX,
      CY,
      R * 1.025
    );

    rim.addColorStop(
      0,
      "rgba(0,217,245,0)"
    );

    rim.addColorStop(
      0.75,
      "rgba(0,217,245,0.015)"
    );

    rim.addColorStop(
      1,
      "rgba(0,217,245,0.24)"
    );

    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);

    ctx.strokeStyle = rim;
    ctx.lineWidth = 3;

    ctx.stroke();
  }


  // Animation loop

  function animate() {
    drawEarth();

    if (!prefersReducedMotion) {
      rotation += 0.0018;

      if (rotation >= Math.PI * 2) {
        rotation = 0;
      }
    }

    animationFrame =
      requestAnimationFrame(animate);
  }

  animate();


  // Pause rendering when tab is hidden

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
      } else if (!animationFrame) {
        animate();
      }
    }
  );

})();


// ============================================
// GPS WEATHER
// ============================================

const weatherCodes = {
  0: ["Clear sky", "☀"],
  1: ["Mainly clear", "🌤"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁"],
  45: ["Fog", "≋"],
  48: ["Depositing rime fog", "≋"],
  51: ["Light drizzle", "☂"],
  53: ["Drizzle", "☂"],
  55: ["Dense drizzle", "☂"],
  61: ["Slight rain", "☂"],
  63: ["Moderate rain", "☂"],
  65: ["Heavy rain", "☂"],
  71: ["Slight snow", "❄"],
  73: ["Snow", "❄"],
  75: ["Heavy snow", "❄"],
  80: ["Rain showers", "☂"],
  81: ["Rain showers", "☂"],
  82: ["Violent rain showers", "☂"],
  95: ["Thunderstorm", "ϟ"],
  96: ["Thunderstorm with hail", "ϟ"],
  99: ["Thunderstorm with hail", "ϟ"]
};


async function fetchWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,

    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m"
    ].join(","),

    timezone: "auto"
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`
  );

  if (!response.ok) {
    throw new Error("Weather API unavailable");
  }

  const data = await response.json();
  const current = data.current;

  const [description, icon] =
    weatherCodes[current.weather_code] ||
    ["Current conditions", "☁"];

  $("weather-icon").textContent = icon;

  $("weather-temp").textContent =
    `${Math.round(current.temperature_2m)}°C`;

  $("weather-description").textContent =
    description;

  $("weather-feels").textContent =
    `FEELS LIKE ${Math.round(current.apparent_temperature)}°C`;

  $("weather-humidity").textContent =
    `HUMIDITY ${current.relative_humidity_2m}%`;

  $("weather-wind").textContent =
    `WIND ${Math.round(current.wind_speed_10m)} km/h`;

  $("weather-status").textContent =
    "GPS WEATHER UPDATED";
}


function loadWeather() {
  $("weather-status").textContent =
    "REQUESTING GPS LOCATION...";

  if (!navigator.geolocation) {
    $("weather-description").textContent =
      "Geolocation unavailable";

    $("weather-status").textContent =
      "Your browser does not support GPS location.";

    return;
  }

  navigator.geolocation.getCurrentPosition(

    async (position) => {
      try {
        const { latitude, longitude } =
          position.coords;

        await fetchWeather(latitude, longitude);

      } catch (error) {
        console.error("Weather error:", error);

        $("weather-description").textContent =
          "Weather unavailable";

        $("weather-status").textContent =
          "Could not retrieve weather data.";
      }
    },

    (error) => {
      console.error("GPS error:", error);

      $("weather-description").textContent =
        "Location permission required";

      if (error.code === error.PERMISSION_DENIED) {
        $("weather-status").textContent =
          "Allow location access in Chrome settings.";
      } else if (error.code === error.TIMEOUT) {
        $("weather-status").textContent =
          "GPS request timed out. Try again.";
      } else {
        $("weather-status").textContent =
          "Unable to detect your location.";
      }
    },

    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 600000
    }

  );
}

$("weather-refresh").addEventListener(
  "click",
  loadWeather
);

loadWeather();


// ============================================
// IP AND ISP LOOKUP
// ============================================

async function loadISP() {
  const ispEl = document.getElementById("isp-value");
  const ipEl = document.getElementById("ip-value");

  if (ispEl) ispEl.textContent = "Looking up...";
  if (ipEl) ipEl.textContent = "Looking up...";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch("https://ipwho.is/", {
        method: "GET",
        cache: "no-store",
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`IP lookup HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "IP lookup unsuccessful");
      }

      const isp = data.connection?.isp || "Unknown";
      const org = data.connection?.org || "";
      const ip = data.ip || "Unavailable";

      if (ispEl) {
        ispEl.textContent = org && org !== isp
          ? `${isp} / ${org}`
          : isp;
      }

      if (ipEl) {
        ipEl.textContent = ip;
      }

    } finally {
      clearTimeout(timeout);
    }

  } catch (error) {
    console.warn("MUX Network Monitor: ISP lookup failed:", error);

    // Fallback: Public IP only
    try {
      const response = await fetch("https://api.ipify.org?format=json", {
        cache: "no-store"
      });

      if (!response.ok) throw new Error("Fallback IP lookup failed");

      const data = await response.json();

      if (ipEl) ipEl.textContent = data.ip || "Unavailable";
      if (ispEl) ispEl.textContent = "ISP lookup unavailable";

    } catch (fallbackError) {
      if (ipEl) ipEl.textContent = "Unavailable";
      if (ispEl) ispEl.textContent = "Lookup unavailable";

      console.warn("MUX Network Monitor: fallback failed:", fallbackError);
    }
  }
}

loadISP();


// ============================================
// NETWORK TEST
// ============================================

async function runNetworkTest() {
  const button = $("network-test");

  button.disabled = true;
  button.textContent = "TEST RUNNING...";

  $("network-state").textContent = "TESTING";

  $("network-note").textContent =
    "Measuring connection...";

  try {

    // Latency test

    const pingStart = performance.now();

    const pingResponse = await fetch(
      `https://www.cloudflare.com/cdn-cgi/trace?t=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!pingResponse.ok) {
      throw new Error("Ping test failed");
    }

    const ping = Math.round(
      performance.now() - pingStart
    );

    $("ping-value").textContent = ping;


    // Download estimate

    const downloadStart = performance.now();

    const downloadResponse = await fetch(
      `https://speed.cloudflare.com/__down?bytes=1000000&t=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!downloadResponse.ok) {
      throw new Error("Download test failed");
    }

    const blob = await downloadResponse.blob();

    const seconds = Math.max(
      (performance.now() - downloadStart) / 1000,
      0.05
    );

    const speed = (
      blob.size * 8 / seconds / 1000000
    ).toFixed(1);

    $("download-value").textContent = speed;

    // Upload is not measured in this simple test.

    $("upload-value").textContent = "N/A";

    $("server-value").textContent = "Cloudflare";

    $("network-state").textContent = "COMPLETE";

    $("network-note").textContent =
      "Download and latency are estimates. Upload test unavailable.";

  } catch (error) {

    console.error("Network test error:", error);

    $("network-state").textContent = "ERROR";

    $("network-note").textContent =
      "Network test failed. Try again.";

  }

  button.disabled = false;
  button.textContent = "RUN NETWORK TEST ↗";
}

$("network-test").addEventListener(
  "click",
  runNetworkTest
);


// ============================================
// GOOGLE SEARCH
// ============================================

$("search-form").addEventListener(
  "submit",
  (event) => {

    event.preventDefault();

    const query =
      $("search-input").value.trim();

    if (!query) return;

    const isURL =
      /^(https?:\/\/)|^([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i
        .test(query);

    const destination = isURL
      ? (
          query.startsWith("http")
            ? query
            : `https://${query}`
        )
      : `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    location.href = destination;

  }
);


// ============================================
// BANGLADESH BREAKING NEWS
// ============================================

const NEWS_FEEDS = [
  {
    name: "Prothom Alo",
    url: "https://www.prothomalo.com/feed/"
  },
  {
    name: "The Daily Star",
    url: "https://www.thedailystar.net/frontpage/rss.xml"
  },
  {
    name: "Jamuna TV",
    url: "https://jamuna.tv/feed"
  },
  {
    name: "Somoy TV",
    url: "https://www.somoynews.tv/feed"
  }
];

const ALERT_TERMS = [
  "cyclone",
  "ঘূর্ণিঝড়",
  "ঘূর্ণিঝড়",
  "বন্যা",
  "flood",
  "জলোচ্ছ্বাস",
  "storm surge",
  "earthquake",
  "ভূমিকম্প",
  "ভূমিধস",
  "landslide",
  "lightning",
  "বজ্রপাত",
  "দুর্যোগ",
  "disaster",
  "সতর্কতা",
  "warning",
  "জরুরি",
  "emergency",
  "আগুন",
  "অগ্নিকাণ্ড",
  "fire",
  "বিস্ফোরণ",
  "explosion",
  "evacuation",
  "তাপপ্রবাহ",
  "heatwave",
  "ভারী বৃষ্টি",
  "heavy rain",
  "সুনামি",
  "tsunami",
  "দুর্ঘটনা",
  "major accident"
];

const CRITICAL_TERMS = [
  "cyclone",
  "ঘূর্ণিঝড়",
  "ঘূর্ণিঝড়",
  "earthquake",
  "ভূমিকম্প",
  "বন্যা",
  "flood",
  "tsunami",
  "সুনামি",
  "evacuation",
  "জলোচ্ছ্বাস"
];

const WARNING_TERMS = [
  "warning",
  "সতর্কতা",
  "landslide",
  "ভূমিধস",
  "lightning",
  "বজ্রপাত",
  "heatwave",
  "তাপপ্রবাহ",
  "heavy rain",
  "ভারী বৃষ্টি",
  "storm",
  "ঝড়",
  "ঝড়"
];


function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]
  );
}


function classifyAlert(text) {
  const value = text.toLowerCase();

  if (
    CRITICAL_TERMS.some(term =>
      value.includes(term)
    )
  ) {
    return "critical";
  }

  if (
    WARNING_TERMS.some(term =>
      value.includes(term)
    )
  ) {
    return "warning";
  }

  return "important";
}


function isAlert(item) {
  const text =
    `${item.title} ${item.description}`.toLowerCase();

  return ALERT_TERMS.some(
    term => text.includes(term)
  );
}


function timeAgo(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "RECENT";
  }

  const minutes = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 60000)
  );

  if (minutes < 60) {
    return `${minutes}M AGO`;
  }

  if (minutes < 1440) {
    return `${Math.floor(minutes / 60)}H AGO`;
  }

  return `${Math.floor(minutes / 1440)}D AGO`;
}


async function fetchNewsFeed(feed) {
  const endpoint =
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;

  const response = await fetch(endpoint, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`${feed.name} unavailable`);
  }

  const data = await response.json();

  if (
    data.status !== "ok" ||
    !Array.isArray(data.items)
  ) {
    throw new Error(`${feed.name} feed invalid`);
  }

  return data.items.map(item => ({
    source: feed.name,

    title: (item.title || "")
      .replace(/<[^>]*>/g, "")
      .trim(),

    description: (
      item.description ||
      item.content ||
      ""
    )
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 500),

    link: item.link || feed.url,
    pubDate: item.pubDate || ""

  })).filter(item => item.title && item.link);
}


function renderNews(items, failedCount) {
  const list = $("news-list");

  if (items.length) {

    list.innerHTML = items
      .slice(0, 6)
      .map(item => {

        const level = classifyAlert(
          `${item.title} ${item.description}`
        );

        return `
          <article class="news-card ${level}">

            <div class="news-meta">
              <span class="news-tag">
                ${level.toUpperCase()}
              </span>

              <span>
                ${escapeHTML(item.source)}
              </span>
            </div>

            <div class="news-title">
              ${escapeHTML(item.title)}
            </div>

            <div class="news-card-foot">

              <span>
                ${escapeHTML(timeAgo(item.pubDate))}
              </span>

              <a
                href="${escapeHTML(item.link)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                OPEN SOURCE ↗
              </a>

            </div>

          </article>
        `;

      })
      .join("");

    $("news-state").textContent = "ALERTS FOUND";
    $("news-state").style.color = "var(--amber)";

  } else if (failedCount === NEWS_FEEDS.length) {

    list.innerHTML = `
      <div class="empty-state">
        SOURCE UNAVAILABLE
        <br>
        <span class="subtle">
          Could not reach the configured news sources.
        </span>
      </div>
    `;

    $("news-state").textContent = "OFFLINE";
    $("news-state").style.color = "var(--red)";

  } else {

    list.innerHTML = `
      <div class="empty-state">
        NO BREAKING NEWS
        <br>
        NO ALERTS FOR NOW
      </div>
    `;

    $("news-state").textContent = "ALL CLEAR";
    $("news-state").style.color = "var(--green)";

  }

  $("news-updated").textContent =
    `CHECKED ${new Date().toLocaleTimeString()}`;
}


async function loadBreakingNews() {
  $("news-state").textContent = "CHECKING";

  $("news-list").innerHTML = `
    <div class="empty-state">
      SCANNING SELECTED SOURCES...
    </div>
  `;

  const results = await Promise.allSettled(
    NEWS_FEEDS.map(fetchNewsFeed)
  );

  const failedCount = results.filter(
    result => result.status === "rejected"
  ).length;

  let items = results
    .filter(result => result.status === "fulfilled")
    .flatMap(result => result.value)
    .filter(isAlert);

  const seen = new Set();

  items = items.filter(item => {

    const key = item.title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "")
      .slice(0, 90);

    if (seen.has(key)) return false;

    seen.add(key);
    return true;

  });

  items.sort(
    (a, b) =>
      new Date(b.pubDate).getTime() -
      new Date(a.pubDate).getTime()
  );

  renderNews(items, failedCount);
}

$("news-refresh").addEventListener(
  "click",
  loadBreakingNews
);

// Only runs when the New Tab opens.
loadBreakingNews();


// ============================================
// CHROME STORAGE SHORTCUTS
// ============================================

const DEFAULT_SHORTCUTS = [
  {
    name: "Claude",
    url: "https://claude.ai/",
    icon: "C"
  },
  {
    name: "ChatGPT",
    url: "https://chatgpt.com/",
    icon: "GPT"
  },
  {
    name: "GitHub",
    url: "https://github.com/",
    icon: "GH"
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/",
    icon: "YT"
  }
];


async function getStored(key) {
  if (chrome?.storage?.local) {
    const result = await chrome.storage.local.get(key);
    return result[key];
  }

  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}


async function setStored(key, value) {
  if (chrome?.storage?.local) {
    return chrome.storage.local.set({
      [key]: value
    });
  }

  localStorage.setItem(
    key,
    JSON.stringify(value)
  );
}


async function renderShortcuts() {
  let shortcuts = await getStored(SHORTCUTS_KEY);

  if (!Array.isArray(shortcuts)) {
    shortcuts = DEFAULT_SHORTCUTS;
  }

  const container = $("shortcuts");

  container.innerHTML = "";

  shortcuts.forEach((item, index) => {

    const anchor = document.createElement("a");

    anchor.className = "shortcut";
    anchor.href = item.url;
    anchor.title = item.url;

    const icon = document.createElement("span");

    icon.className = "shortcut-icon";

    icon.textContent =
      item.icon ||
      item.name.slice(0, 2).toUpperCase();

    const name = document.createElement("span");

    name.className = "shortcut-name";
    name.textContent = item.name;

    const remove = document.createElement("button");

    remove.className = "remove-shortcut";
    remove.type = "button";
    remove.textContent = "×";
    remove.title = "Remove shortcut";

    remove.addEventListener(
      "click",
      async (event) => {

        event.preventDefault();
        event.stopPropagation();

        shortcuts.splice(index, 1);

        await setStored(
          SHORTCUTS_KEY,
          shortcuts
        );

        renderShortcuts();

      }
    );

    anchor.append(icon, name, remove);

    container.append(anchor);

  });
}

renderShortcuts();


// ============================================
// ADD SHORTCUT DIALOG
// ============================================

const dialog = $("shortcut-dialog");

$("add-shortcut").addEventListener(
  "click",
  () => dialog.showModal()
);

$("cancel-shortcut").addEventListener(
  "click",
  () => dialog.close()
);


$("shortcut-form").addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const name =
      $("shortcut-name").value.trim();

    let url =
      $("shortcut-url").value.trim();

    if (!name || !url) return;

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    let shortcuts = await getStored(
      SHORTCUTS_KEY
    );

    if (!Array.isArray(shortcuts)) {
      shortcuts = DEFAULT_SHORTCUTS;
    }

    shortcuts.push({
      name,
      url,
      icon: name.slice(0, 2).toUpperCase()
    });

    await setStored(
      SHORTCUTS_KEY,
      shortcuts
    );

    $("shortcut-form").reset();

    dialog.close();

    renderShortcuts();

  }
);
