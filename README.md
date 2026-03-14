# Employee Insights Dashboard

## Features Overview

- **Frontend:** React + Vite, Context API for Authentication
- **Styling:** Fully Custom TailwindCSS layouts and custom visualizations
- **Backend:** Node.js Express server to proxy real PHP endpoints
- **Performance Mapping:** Advanced mathematical `<svg>` charts rendering Average Salaries natively.
- **Capture Capabilities:** Live hardware WebRTC camera frames with layered verification Canvas signing via native touch/mouse events!
- **Data Rendering:** Virtualized pure HTML/CSS list windows rendering rows efficiently!

## Geographic Map Logic

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

## Known Intentional Bug: Virtualization Stale Closure

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
