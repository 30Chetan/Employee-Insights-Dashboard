# 📊 Employee Insights Dashboard

A full-stack web application built to manage, visualize, and interact with an organization's employee directory. The dashboard emphasizes performance optimization, clean modern UI using Tailwind CSS, and integrates powerful JavaScript APIs for data visualization and hardware interaction.

## 🚀 Key Features

- **Authentication System**: Secure Context API-based login with persistent localStorage sessions. Allows users to manage sessions securely across routes.
- **Virtualized Employee Directory**: Custom-built high-performance table virtualization hook (`useVirtualScroll.js`) ensuring seamless 60fps scrolling even with thousands of records, without relying on external UI libraries natively.
- **Hardware Integration (WebRTC)**: Allows HR to take new profile pictures directly from the browser utilizing the device's camera.
- **Interactive Signature Support**: Features a custom HTML5 Canvas overlay enabling physical or mouse-drawn signatures embedded directly into the captured image base64 export natively.
- **Advanced Data Visualizations**: Pure SVG data representation visualizing average salaries natively, and OpenStreetMap Leaflet integration pinpointing dynamic office distributions geographically.
- **Proxy Backend Service**: A dedicated Node.js/Express backend resolving CORS and routing effectively towards upstream PHP datasets.

## 🛠 Tech Stack

- **Frontend Framework**: React.js (Vite configuration)
- **Styling**: Tailwind CSS v4 (Pure utilities without libraries like MUI/Bootstrap)
- **Routing**: React Router DOM v6
- **Mapping**: Leaflet + React-Leaflet
- **Backend Server**: Node.js & Express
- **Development Tools**: Nodemon, Dotenv, CORS wrappers.

## 📂 Project Structure

```text
employee-insights-dashboard/
├── frontend/                  # React Application 
│   ├── src/
│   │   ├── components/        # Reusable UI (CameraCapture, Navbar, ProtectedRoute)
│   │   ├── context/           # React Context (AuthContext)
│   │   ├── hooks/             # Custom Hooks (useVirtualScroll)
│   │   ├── pages/             # Route Pages (Analytics, Details, List, Login)
│   │   ├── utils/             # Helpers (API proxy wrappers)
│   │   └── index.css          # Tailwind Main Configuration 
│   └── package.json           # Frontend Dependencies
└── backend/                   # NodeJS Express Proxy Server
    ├── controllers/           # Endpoint handlers
    ├── routes/                # API pathing Definitions
    ├── index.js               # Node Entry
    └── package.json           # Backend Dependencies
```

## ⚙️ Installation & Usage

### 1. Clone the Repository
```bash
git clone https://github.com/30Chetan/Employee-Insights-Dashboard.git
cd Employee-Insights-Dashboard
```

### 2. Setup the Backend
Initialize the proxy server configuring your dataset endpoint queries safely.
```bash
cd backend
npm install
npm run dev
```
*The backend server will run efficiently by default on `http://localhost:5000`*.

### 3. Setup the Frontend
Keep the backend running, open a new terminal tab, and start Vite locally.
```bash
cd frontend
npm install
npm run dev
```
*The React application will execute dynamically at `http://localhost:5173`*.

### 4. Account Access
Use the following demo credentials internally initialized to access the Dashboard:
- **Username**: `testuser`
- **Password**: `Test123`

---

## 🗺 Geographic Map Logic

We integrated the `react-leaflet` package mapping dynamically the available demographic spread of employees dynamically. 

The application utilizes a hardcoded geolocation dictionary structure intercepting raw textual `emp.city` string values fetched successfully from our proxy, converting them manually to absolute latitudinal & longitudinal vectors allowing OpenStreetMap TileLayers to map out distribution interactively as demonstrated below!

### Mapped Cities Coordinates
```javascript
const CITY_COORDINATES = {
    'Delhi': [28.6139, 77.2090],   // Northern Central Vector
    'Mumbai': [19.0760, 72.8777],  // Western Coast Vector
    'Jaipur': [26.9124, 75.7873]   // North-Western Vector
};
```
These precise pinpoints project dynamically to an active `<MapContainer />` block nested seamlessly below the interactive Dashboard visual matrices. The chart scans against `citySalaryStats` looping precisely the employees stationed within the corresponding sectors pushing native Leaflet `<Marker />` instances with descriptive `<Popup />` modals!

## 🐛 Known Intentional Bug: Virtualization Stale Closure

For demonstration and debugging exercise purposes, an **intentional bug** has been embedded into the application's React hook architecture. 

### Where is the bug?
The bug is securely located inside `frontend/src/hooks/useVirtualScroll.js`. Specifically, it exists inside the `onScroll = useCallback(...)` initialization near line 6.

### Why does it occur?
It is a classic "Stale Closure" issue. In the code, we added boundary-limiting math referencing the `totalItems` property dynamically fetched by our `useVirtualScroll` hook. However, we specifically omitted `totalItems` (along with `rowHeight`) from the `useCallback` hook's dependency array. 

When the List component mounts, `totalItems` is initially `0` (because the API data hasn't loaded yet). Because dependencies are missing, the `onScroll` function is cached with the initial value of `0` forever. When a user tries to scroll later, the listener continues to enforce a maximum scroll boundary evaluated against `0 * 50 = 0`, aggressively capping `scrollTop` back to 0—effectively freezing the virtualization rows from properly slicing new visible data into the DOM entirely.

### How to fix it?
Re-insert the necessary variables into the dependency array at the bottom of the `useCallback`, triggering the React engine to refresh the cached function appropriately whenever the bounds change:

```javascript
// Change the intentional bug line from this:
}, []);

// To fix the code, simply trace the stale variables adding them to the dependency array natively:
}, [totalItems, rowHeight]);
```
