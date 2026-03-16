# 📊 Employee Insights Dashboard

A full-stack web application built to manage, visualize, and interact with an organization's employee directory. The dashboard emphasizes performance optimization, clean modern UI using Tailwind CSS, and integrates powerful JavaScript APIs for data visualization and hardware interaction.

> **Built as part of a technical assignment evaluating engineering depth, browser hardware handling, and React rendering lifecycle mastery.**

---

## 🚀 Key Features

- **🔐 Secure Authentication**: Context API-based login with persistent `localStorage` sessions. Wrong credentials are rejected with a clear error message. Session persists on page refresh, and protected routes redirect unauthenticated users.
- **⚡ Custom Table Virtualization**: A handcrafted `useVirtualScroll.js` hook — zero external libraries — ensures 60fps scrolling even with thousands of records by only rendering rows visible in the viewport.
- **📷 Hardware Integration (WebRTC)**: Native camera interface via `navigator.mediaDevices.getUserMedia()` for live profile photo capture directly in the browser.
- **✍️ Signature Overlay**: HTML5 Canvas drawn over the captured photo; supports mouse and touch input. Clear and re-draw at any time.
- **🖼️ Programmatic Image Merge**: Photo and signature are composited onto an off-screen canvas and exported as a single Base64/JPEG image, stored in `localStorage` for the Analytics page.
- **📊 Pure SVG Bar Chart**: Average salary by city visualized using raw `<svg>`, `<rect>`, and `<text>` elements — no Chart.js or D3.
- **🗺️ Geospatial Mapping**: Leaflet + React-Leaflet map plots city markers for all employee locations using a hardcoded coordinate dictionary (explained below).
- **🔧 Node.js Proxy Backend**: Express server proxies the upstream PHP API, resolving CORS issues and normalizing the data structure for the frontend.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 (Vite) |
| Styling | Tailwind CSS v4 (zero UI libraries) |
| Routing | React Router DOM v7 |
| Mapping | Leaflet + React-Leaflet |
| State Management | React Context API |
| Backend | Node.js + Express v5 |
| Dev Tools | Nodemon, Dotenv, CORS |

---

## 📂 Project Structure

```text
employee-insights-dashboard/
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── CameraCapture.jsx   # WebRTC camera + canvas signature + blob merge
│   │   │   ├── Navbar.jsx          # Top navigation with sign-out
│   │   │   └── ProtectedRoute.jsx  # Auth guard redirecting unauthenticated users
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state with localStorage persistence
│   │   ├── hooks/
│   │   │   └── useVirtualScroll.js # Custom virtualization hook (contains intentional bug)
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Secure login with credential validation
│   │   │   ├── List.jsx            # Virtualized employee table
│   │   │   ├── Details.jsx         # Employee detail + camera/signature capture
│   │   │   └── Analytics.jsx       # SVG charts, Leaflet map, merged image display
│   │   ├── utils/
│   │   │   └── api.js              # Frontend API calls to the Node.js proxy
│   │   └── index.css               # Tailwind v4 configuration
│   ├── vite.config.js
│   └── package.json
└── backend/                    # Node.js Express Proxy Server
    ├── controllers/
    │   └── employeeController.js   # Proxies PHP API and normalizes response
    ├── routes/
    │   └── employeeRoutes.js       # REST route definitions
    ├── index.js                    # Express server entry point
    └── package.json
```

---

## ⚙️ Installation & Usage

### 1. Clone the Repository
```bash
git clone https://github.com/30Chetan/Employee-Insights-Dashboard.git
cd Employee-Insights-Dashboard
```

### 2. Setup the Backend
The backend acts as a CORS-safe proxy to the upstream PHP data source.
```bash
cd backend
npm install
npm run dev
```
> Backend runs at **`http://localhost:5000`**

### 3. Setup the Frontend
Open a new terminal tab, keeping the backend running.
```bash
cd frontend
npm install
npm run dev
```
> Frontend runs at **`http://localhost:5173`**

### 4. Login Credentials
```
Username: testuser
Password: Test123
```
> ⚠️ Entering incorrect credentials shows an error and clears the password field. No bypass is possible.

---

## 🔐 Authentication Flow

1. **Login page** validates credentials against hardcoded values (`testuser` / `Test123`) inside `AuthContext`.
2. On success, `isAuthenticated: true` is stored in `localStorage` and React state.
3. **Session persistence**: On page refresh, the `AuthProvider` reads `localStorage` first, so the user remains logged in.
4. **Route protection**: `ProtectedRoute` wraps all private routes. Unauthenticated access to `/list`, `/details/:id`, or `/analytics` triggers an immediate `<Navigate to="/login" />` redirect.
5. **Sign-out** clears both React state and `localStorage`.

---

## 📐 Technical Explanation: Virtualization Math

To handle large datasets without performance degradation, the List page uses a **custom-built virtualization engine** in `useVirtualScroll.js`.

### The Algorithm

Instead of rendering all N employees, we only render the rows visible in the viewport plus a small buffer.

```
Constants:
  ROW_HEIGHT      = 50px   (fixed height per row)
  CONTAINER_HEIGHT = 500px  (visible scroll area)
  BUFFER           = 5      (extra rows above/below viewport)

On each scroll event:
  scrollTop   → current scroll position of the container (pixels)

Derived values:
  visibleRows  = ceil(containerHeight / rowHeight)        → ~10 rows fit in viewport
  startIndex   = max(0, floor(scrollTop / rowHeight) - buffer)
  endIndex     = min(totalItems, startIndex + visibleRows + 2 * buffer)

Rendered slice:
  employees.slice(startIndex, endIndex)       → only ~20 DOM nodes at any time

Spacer divs maintain the illusion of a full-height list:
  topSpacerHeight    = startIndex * rowHeight
  bottomSpacerHeight = (totalItems - endIndex) * rowHeight
```

The spacer rows push the scrollbar thumb to the correct relative position, making the browser think all N rows exist, while only ~20 are actually in the DOM.

---

## 🖼️ Image Merging Logic (Blob Merge)

The Details page captures a photo and overlays a canvas signature. When "Approve & Save" is clicked:

```
Step 1 — Load the base photo into an HTMLImageElement
Step 2 — Create an off-screen canvas matching the photo's native resolution
Step 3 — ctx.drawImage(photo, 0, 0)              → Layer 1: base photo
Step 4 — ctx.drawImage(sigCanvas, 0, 0, ...)     → Layer 2: signature (scaled to photo dims)
Step 5 — canvas.toDataURL('image/jpeg', 0.8)     → Export merged image as Base64
Step 6 — Store in localStorage('latestCapturedImage') → Displayed on Analytics page
```

This is a pure Canvas API blend — no third-party image libraries used.

---

## 🗺️ Geographic Map Logic

The Analytics page uses `react-leaflet` to display a world map with markers at employee city locations.

### The Problem
The raw API returns city names as plain strings (e.g., `"London"`, `"Tokyo"`). Leaflet requires `[lat, lng]` coordinates.

### The Solution
A hardcoded coordinate dictionary maps each city name from the dataset to its geographic center:

```javascript
const CITY_COORDINATES = {
    'London':        [51.5074,  -0.1278],
    'Tokyo':         [35.6762, 139.6503],
    'San Francisco': [37.7749, -122.4194],
    'New York':      [40.7128,  -74.0060],
    'Edinburgh':     [55.9533,   -3.1883],
    'Sidney':        [-33.8688, 151.2093],
    'Singapore':     [ 1.3521, 103.8198]
};
```

At render time, we iterate over this dictionary and cross-reference against the live employee data. A `<Marker />` is only plotted if at least one employee exists in that city. Each marker popup shows the city name and employee count.

The map is centered at `[20, 0]` with `zoom=2` to display all global offices in one view.

---

## 🐛 Intentional Bug: Stale Closure in Virtualization

> **Required by assignment spec: exactly one intentional performance/logic bug.**

### 📍 Location
`frontend/src/hooks/useVirtualScroll.js` — inside the `onScroll` `useCallback`

### 🔍 What Is It?
A **stale closure** caused by omitting `totalItems` and `rowHeight` from the `useCallback` dependency array.

```javascript
// ❌ BUGGY CODE (intentional)
const onScroll = useCallback((e) => {
    const maxBoundary = totalItems * rowHeight; // captures stale values from mount
    if (e.target.scrollTop > maxBoundary) {
        setScrollTop(maxBoundary);              // always 0 * 50 = 0 initially
    } else {
        setScrollTop(e.target.scrollTop);
    }
}, []); // <-- missing dependencies: [totalItems, rowHeight]
```

### 💥 Why It Breaks
- When the component mounts, `totalItems` is `0` (API data hasn't loaded yet).
- `useCallback` with `[]` caches `onScroll` **forever** with `totalItems = 0`.
- After the API resolves and `employees.length = 57`, the `onScroll` function still uses the stale `0`.
- `maxBoundary = 0 * 50 = 0` → every scroll event clamps `scrollTop` back to `0`.
- **Result**: The list appears frozen and cannot be scrolled.

### ✅ How to Fix It
```javascript
// ✅ FIXED — add the missing dependencies
}, [totalItems, rowHeight]);
```

### 🤔 Why This Bug Was Chosen
This bug is subtle and non-obvious. It does not throw an error or produce a visible console warning — it silently causes incorrect behavior only after async data loads. It demonstrates a real-world pitfall common in React performance hooks.

---

## 📋 Assignment Checklist

| Requirement | Status |
|---|---|
| Zero UI Libraries (no MUI/Bootstrap/Ant Design) | ✅ Tailwind CSS only |
| Zero virtualization libraries (no react-window) | ✅ Custom `useVirtualScroll.js` |
| Intentional bug documented in README | ✅ Stale closure in `useVirtualScroll.js` |
| Regular & meaningful git commits | ✅ Multiple focused commits |
| Secure login with Context API + localStorage | ✅ |
| Protected routes (redirect if unauthenticated) | ✅ |
| Virtualized employee list with viewport math | ✅ |
| Camera API for profile photo capture | ✅ |
| HTML5 Canvas signature overlay | ✅ |
| Programmatic photo + signature merge | ✅ |
| Display merged "Audit Image" on Analytics page | ✅ |
| Salary distribution chart using raw SVG | ✅ |
| Geospatial map with city markers (Leaflet) | ✅ |
| Map coordinate logic explained in README | ✅ |

---

## 🔗 Repository
[https://github.com/30Chetan/Employee-Insights-Dashboard](https://github.com/30Chetan/Employee-Insights-Dashboard)
