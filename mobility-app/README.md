# MoveIQ — Mobility Intelligence Platform

A professional React frontend for the FastAPI Mobility Intelligence Platform. Built with Vite, React Router, Axios, and Leaflet Maps.

---

## Project Structure

```
src/
├── api/
│   ├── client.js          # Axios instance with JWT interceptor
│   ├── auth.js            # Auth endpoints (register, OTP, login, forgot-pw)
│   ├── driver.js          # Driver endpoints (home, suggest-area)
│   ├── rider.js           # Rider endpoints (home, get-captain)
│   └── status.js          # Status endpoints (heartbeat, location, online-drivers)
│
├── context/
│   └── AuthContext.jsx    # Global auth state + heartbeat
│
├── utils/
│   └── constants.js       # All enums + area list + coordinates from backend
│
├── components/
│   └── common/
│       ├── AppLayout.jsx      # Sidebar + toast wrapper
│       ├── Sidebar.jsx        # Responsive sidebar navigation
│       ├── DelhiMap.jsx       # Leaflet map with colored markers
│       └── ProtectedRoute.jsx # Role-aware route guard
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx          # Email + password login
│   │   ├── RegisterPage.jsx       # 3-step OTP registration
│   │   ├── ForgotPasswordPage.jsx # OTP-based password reset
│   │   └── RoleSelectPage.jsx     # Driver / Rider role picker
│   │
│   ├── driver/
│   │   ├── DriverDashboard.jsx    # Stats + map overview
│   │   ├── DriverLocationPage.jsx # Set area → POST /status/driver/set-location
│   │   └── DriverSuggestPage.jsx  # AI hotspot → POST /driver/suggest-area
│   │
│   ├── rider/
│   │   ├── RiderDashboard.jsx     # Stats + live driver map
│   │   └── RiderRequestPage.jsx   # Request ride → POST /rider/get-captain
│   │
│   └── admin/
│       └── AdminDashboard.jsx     # Live driver distribution map + area breakdown
│
├── styles/
│   └── global.css         # Full design system (dark theme, CSS variables)
│
├── App.jsx                # Router + route definitions
└── main.jsx               # Entry point
```

---

## API Mapping

| Page | Method | Endpoint | Fields |
|---|---|---|---|
| RegisterPage (step 1) | POST | `/auth/register/request-otp` | `email` |
| RegisterPage (step 2) | POST | `/auth/register/verify-otp` | `email, otp` |
| RegisterPage (step 3) | POST | `/auth/register` | `name, email, phone_number, set_password, confirm_password, role` |
| LoginPage | POST | `/auth/login` | `username, password` (form-urlencoded) |
| ForgotPasswordPage (step 1) | POST | `/auth/forgot-password/request-otp` | `email` |
| ForgotPasswordPage (step 2) | POST | `/auth/forgot-password/reset` | `email, otp, new_password, confirm_password` |
| DriverDashboard | GET | `/driver/` | — |
| DriverLocationPage | POST | `/status/driver/set-location` | `area` (enum) |
| DriverSuggestPage | POST | `/driver/suggest-area` | `end_area, weather_condition, traffic_density_level, road_type, average_speed_kmph, distance_km` |
| RiderDashboard | GET | `/rider/` | — |
| RiderRequestPage | POST | `/rider/get-captain` | `rider_area, end_area, weather_condition, traffic_density_level, road_type, distance_km, time_of_day, day_of_week` |
| All dashboards | GET | `/status/online-drivers` | — |
| All authenticated pages | POST | `/status/heartbeat` | — (every 4 min) |

---

## Prerequisites

- Node.js 18+
- Your FastAPI backend running (default: `http://localhost:8000`)

---

## Installation & Setup

```bash
# 1. Navigate to the project
cd mobility-app

# 2. Install dependencies
npm install

# 3. Configure backend URL
# Edit .env file:
VITE_API_BASE_URL=http://localhost:8000

# 4. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Build for Production

```bash
npm run build
npm run preview
```

---

## Key Design Decisions

### Authentication Flow
1. User logs in → receives JWT token
2. Token stored in `localStorage`
3. Role selected on `RoleSelectPage` (since login endpoint only returns token, not role)
4. Registration at `/auth/register` returns token directly → role is stored from form
5. Heartbeat pings `/status/heartbeat` every 4 minutes to maintain online status

### Driver Location Flow (important)
After login, drivers MUST set their location via **My Location** page:
- Calls `POST /status/driver/set-location` with `{ area: "Area Name" }`
- Area is selected from a fixed list of 25 Delhi zones matching backend enum exactly
- Location is cached in localStorage for map display across sessions
- Until location is set, driver appears offline

### Map Display
- Uses **Leaflet** with CartoDB dark tiles (no API key required)
- Area coordinates hardcoded in `constants.js` (25 Delhi zones)
- Color coding:
  - 🔵 Cyan = Current/pickup location
  - 🟠 Orange = Online drivers
  - 🟢 Green = AI suggested area
  - 🟣 Purple = Destination

### Enum Inputs
All dropdowns and selectors use exact backend enum values:
- `WeatherCondition`: Clear, Rain, Fog, Heatwave
- `TrafficDensity`: Low, Medium, High, Very High
- `RoadType`: Main Road, Inner Road, Highway
- `TimeOfDay`: Night, Morning Peak, Afternoon, Evening Peak
- `Areas`: 25 fixed Delhi zones

---

## Libraries Used

| Library | Purpose |
|---|---|
| `react-router-dom` | Client-side routing |
| `axios` | HTTP client with JWT interceptors |
| `leaflet` + `react-leaflet` | Interactive Delhi map |
| `react-hot-toast` | Toast notifications |
| `lucide-react` | Icons |
| `vite` | Build tool |

---

## Responsive Design

- Desktop: Sidebar + content layout
- Tablet/Mobile: Hidden sidebar with hamburger menu toggle
- All forms use responsive grid (2-col → 1-col on mobile)
- Map height adjusts per viewport

---

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000
```
