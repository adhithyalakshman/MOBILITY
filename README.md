# MoveIQ — Mobility Intelligence Platform

<div align="center">

[![React](https://img.shields.io/badge/React-18.2-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Leaflet](https://img.shields.io/badge/Maps-Leaflet-199900?style=flat-square&logo=leaflet)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**An AI-powered mobility intelligence platform for Delhi NCR.**
Predicts traffic demand, suggests optimal driver positioning, and matches riders with the best available drivers — in real time.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Architecture](#-architecture) · [API Reference](#-api-reference)

</div>

---

## 📌 Overview

MoveIQ is a full-stack mobility application built on a **FastAPI ML backend** and a **React frontend**. The platform serves two user types:

- **Drivers** — receive AI-generated hotspot suggestions telling them *where to position themselves* to maximise ride demand
- **Riders** — submit ride requests and get matched with the optimal available driver based on real-time traffic, weather, and road conditions

The ML model ingests inputs like rider location, destination, weather conditions, traffic density, and road type — and returns intelligent predictions and driver recommendations.

---

## ✨ Features

### 🚗 Driver Interface
- Secure login with JWT authentication
- **Auto role detection** — no manual role selection after login
- Set current location from 25 fixed Delhi NCR zones
- Real-time online/offline status via heartbeat (every 4 minutes)
- **AI Hotspot Finder** — enter destination + road conditions → ML model returns the best area to start from
- Live map showing current position and AI-suggested hotspot

### 👤 Rider Interface
- Request a ride by selecting pickup area, destination, weather, traffic, road type, time of day, and day of week
- **ML-powered driver matching** via `/rider/get-captain`
- Dynamic result card showing raw model output — no hardcoded messages
- Live Delhi map showing available drivers nearby

### 🛡️ Admin Panel
- Live driver distribution map across all 25 Delhi NCR zones
- Area-wise driver density with visual progress bars
- Full coverage monitoring
- Auto-refreshes every 30 seconds

### 🔐 Authentication
- Email OTP-based registration (3-step flow)
- JWT login with persistent sessions in `localStorage`
- OTP-based forgot password / reset flow
- **Automatic role detection** from backend after login — system reads the user's role from the database via API probing, no manual selection needed

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + Vite 5 |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios (JWT interceptor + 401 auto-redirect) |
| **Maps** | Leaflet + React-Leaflet |
| **Notifications** | React Hot Toast |
| **Icons** | Lucide React |
| **Fonts** | Inter (Google Fonts) |
| **State Management** | React Context API |
| **Backend** | FastAPI (Python) |
| **Auth** | OAuth2 Password Flow / JWT Bearer |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- FastAPI backend running locally or deployed

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/moveiq-frontend.git
cd moveiq-frontend

# 2. Install dependencies
npm install

# 3. Configure environment
# Edit the .env file and set your backend URL:
VITE_API_BASE_URL=http://localhost:8000

# 4. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build      # Compiles to /dist
npm run preview    # Preview the production build locally
```

---

## 🗂 Architecture

### Project Structure

```
mobility-app/
├── src/
│   ├── api/                            # API service layer
│   │   ├── client.js                   # Axios instance + JWT interceptor + 401 handler
│   │   ├── auth.js                     # register, OTP, login, forgot-password
│   │   ├── driver.js                   # driver home, suggest-area
│   │   ├── rider.js                    # rider home, get-captain
│   │   └── status.js                   # heartbeat, set-location, online-drivers
│   │
│   ├── context/
│   │   └── AuthContext.jsx             # Global auth state, auto role detection, heartbeat
│   │
│   ├── components/
│   │   └── common/
│   │       ├── AppLayout.jsx           # Sidebar wrapper + Toast provider
│   │       ├── Sidebar.jsx             # Responsive navigation sidebar
│   │       ├── DelhiMap.jsx            # Leaflet map with zone markers
│   │       └── ProtectedRoute.jsx      # Role-aware route guard
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx           # Email + password sign-in
│   │   │   ├── RegisterPage.jsx        # 3-step OTP registration
│   │   │   └── ForgotPasswordPage.jsx  # OTP-based password reset
│   │   ├── driver/
│   │   │   ├── DriverDashboard.jsx     # Stats + live driver map
│   │   │   ├── DriverLocationPage.jsx  # Set area → POST /status/driver/set-location
│   │   │   └── DriverSuggestPage.jsx   # AI hotspot → POST /driver/suggest-area
│   │   ├── rider/
│   │   │   ├── RiderDashboard.jsx      # Overview + live driver map
│   │   │   └── RiderRequestPage.jsx    # Request ride → POST /rider/get-captain
│   │   └── admin/
│   │       └── AdminDashboard.jsx      # Driver distribution monitor
│   │
│   ├── utils/
│   │   └── constants.js                # Area list, enum values, map coordinates
│   │
│   ├── styles/
│   │   └── global.css                  # Design system (CSS variables, components)
│   │
│   ├── App.jsx                         # Router + all route definitions
│   └── main.jsx                        # React entry point
│
├── .env                                # Environment variables (git-ignored)
├── index.html
├── package.json
└── vite.config.js
```

---

### Key Architecture Decisions

#### 1. Automatic Role Detection

The `/auth/login` endpoint returns only a JWT token — it does not include the user's role. After login, `AuthContext` automatically probes `GET /driver/` then `GET /rider/` in sequence. Whichever returns HTTP `200` determines the role. The user sees a brief loading spinner and is routed directly to the correct dashboard — no manual role selection screen.

```
Login
  └── Save JWT token
        └── Probe GET /driver/
              ├── 200 OK  →  role = "driver"  →  /driver/dashboard
              └── Error
                    └── Probe GET /rider/
                          ├── 200 OK  →  role = "rider"  →  /rider/dashboard
                          └── Error   →  redirect to /login
```

#### 2. Heartbeat — Session Keep-Alive

`POST /status/heartbeat` is called immediately on login, then every **4 minutes** using `setInterval` inside `AuthContext`. The interval is automatically cleared on logout. This keeps the user marked as online in the backend database without any interaction.

```js
// AuthContext.jsx
const ping = () => heartbeat().catch(() => {});
ping();                                         // immediate on login
const interval = setInterval(ping, 4 * 60 * 1000); // every 4 min
return () => clearInterval(interval);           // cleanup on logout
```

#### 3. Driver Location Flow

After login, drivers must set their current area via the **My Location** page. This calls `POST /status/driver/set-location` with one of 25 fixed Delhi zone names (matching the backend enum exactly). The selected area is cached in `localStorage` for persistence across page refreshes and shown immediately on the map.

```
Driver logs in → DriverDashboard shows "not set" warning
  → Driver visits My Location page
    → Selects area from 25-zone grid
      → POST /status/driver/set-location { area: "Connaught Place" }
        → Driver is now Online and visible on map
```

#### 4. Model Output — No Hardcoded UI Messages

All result cards and toast notifications display the **raw model response** from the backend. The UI does not assume success or failure:

- The first value from the response object is used as the headline
- Negative outcomes are detected by scanning for keywords (`"no driver"`, `"not available"`, `"no captain"`) in the JSON
- The card colour, badge, and notification all change accordingly

This means the UI always reflects exactly what the ML model returned.

#### 5. Protected Routes

`ProtectedRoute` checks both `isAuthenticated` and `allowedRole`. A rider visiting `/driver/dashboard` is redirected to `/rider/dashboard`. Unauthenticated users are always sent to `/login`.

---

## 🗺 Covered Zones — Delhi NCR (25 Areas)

| | | |
|---|---|---|
| Connaught Place | Karol Bagh | Chandni Chowk |
| Preet Vihar | Greater Kailash | Vasant Kunj |
| IGI Airport | Saket | Punjabi Bagh |
| Nehru Place | Dwarka | Kalkaji |
| AIIMS | Rohini | Okhla |
| Civil Lines | Model Town | Janakpuri |
| Noida Sector 18 | Mayur Vihar | Hauz Khas |
| Pitampura | Shahdara | Rajouri Garden |
| Lajpat Nagar | | |

---

## 📡 API Reference

All endpoints connect to the FastAPI backend. The base URL is configured via `VITE_API_BASE_URL` in `.env`.

### Authentication

| Method | Endpoint | Payload | Notes |
|---|---|---|---|
| `POST` | `/auth/register/request-otp` | `{ email }` | Sends OTP to email |
| `POST` | `/auth/register/verify-otp` | `{ email, otp }` | Verifies 6-digit OTP |
| `POST` | `/auth/register` | `{ name, email, phone_number, set_password, confirm_password, role }` | Creates account, returns JWT |
| `POST` | `/auth/login` | `username, password` *(form-urlencoded)* | Returns JWT token |
| `POST` | `/auth/forgot-password/request-otp` | `{ email }` | Sends reset OTP |
| `POST` | `/auth/forgot-password/reset` | `{ email, otp, new_password, confirm_password }` | Resets password |

### Driver

| Method | Endpoint | Payload | Notes |
|---|---|---|---|
| `GET` | `/driver/` | — | Driver home; used for role detection |
| `POST` | `/driver/suggest-area` | `{ end_area, weather_condition, traffic_density_level, road_type, average_speed_kmph, distance_km }` | Returns `{ suggested_start_area }` |

### Rider

| Method | Endpoint | Payload | Notes |
|---|---|---|---|
| `GET` | `/rider/` | — | Rider home; used for role detection |
| `POST` | `/rider/get-captain` | `{ rider_area, end_area, weather_condition, traffic_density_level, road_type, distance_km, time_of_day, day_of_week }` | Returns driver match result |

### Status

| Method | Endpoint | Payload | Notes |
|---|---|---|---|
| `POST` | `/status/heartbeat` | — | Keep-alive ping (every 4 min) |
| `POST` | `/status/driver/set-location` | `{ area }` | Update driver's current zone |
| `GET` | `/status/online-drivers` | — | List all online drivers |
| `GET` | `/status/online/{email}` | — | Check if a specific user is online |

### Enum Values (Backend-Defined)

```
WeatherCondition : Clear | Rain | Fog | Heatwave
TrafficDensity   : Low | Medium | High | Very High
RoadType         : Main Road | Inner Road | Highway
TimeOfDay        : Night | Morning Peak | Afternoon | Evening Peak
Role             : rider | driver
```

---

## 🔧 Environment Variables

```env
# .env
VITE_API_BASE_URL=http://localhost:8000
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend | `http://localhost:8000` |

---

## 📱 Responsive Design

| Breakpoint | Layout |
|---|---|
| **Desktop** (> 768px) | Fixed 248px sidebar + scrollable main content |
| **Tablet / Mobile** (≤ 768px) | Collapsed sidebar with hamburger toggle + backdrop overlay |
| **Forms** | 2-column grid collapses to single column on small screens |

---

## 🔒 Security

- JWT tokens stored in `localStorage`, attached to every request via Axios interceptor
- Global `401` response interceptor clears token and redirects to `/login` automatically
- All protected routes guarded client-side by `ProtectedRoute`
- OTP verification required before account creation and password reset

---

## 🗺 Map Implementation

- Uses **Leaflet** with **CartoDB dark tiles** — no API key required
- All 25 Delhi zone coordinates are hardcoded in `src/utils/constants.js`
- Marker colour coding:
  - 🔵 **Blue** — Current location / pickup point
  - 🟠 **Orange** — Online drivers
  - 🟢 **Green** — AI suggested hotspot
  - 🟣 **Purple** — Destination

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add: your feature description'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/) — Python backend framework
- [React Leaflet](https://react-leaflet.js.org/) — interactive map integration
- [CartoDB](https://carto.com/) — map tile provider (no API key needed)
- [Lucide Icons](https://lucide.dev/) — clean SVG icon library
- [Vite](https://vitejs.dev/) — lightning-fast build tooling

---

<div align="center">
  <sub>Built for Delhi NCR mobility intelligence · MoveIQ © 2025</sub>
</div>
