import { useEffect, useState } from 'react';
import { fetchEmployees } from '../utils/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix typical Leaflet default icon bug in Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

const CITY_COORDINATES = {
    'Delhi': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Jaipur': [26.9124, 75.7873]
};

const Analytics = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        // Load stored signature/image
        const storedImage = localStorage.getItem('latestCapturedImage');
        if (storedImage) {
            setCapturedImage(storedImage);
        }

        fetchEmployees().then(data => {
            setEmployees(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const avgSalary = totalEmployees ? employees.reduce((acc, curr) => acc + curr.salary, 0) / totalEmployees : 0;

    const deptCount = employees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
    }, {});

    // City grouping and average salary calculation
    const citySalaryStats = employees.reduce((acc, emp) => {
        if (!acc[emp.city]) {
            acc[emp.city] = { total: 0, count: 0 };
        }
        acc[emp.city].total += emp.salary;
        acc[emp.city].count += 1;
        return acc;
    }, {});

    const cityAvgSalaries = Object.entries(citySalaryStats)
        .map(([city, stats]) => ({
            city,
            avg: Math.round(stats.total / stats.count)
        }))
        .sort((a, b) => b.avg - a.avg);

    const maxSalary = Math.max(...cityAvgSalaries.map(d => d.avg), 1);
    const svgChartWidth = Math.max(400, cityAvgSalaries.length * 80 + 80);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics Dashboard</h1>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transform transition hover:-translate-y-1 hover:shadow-md">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Employees</p>
                    <p className="text-4xl font-extrabold text-gray-900">{totalEmployees}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transform transition hover:-translate-y-1 hover:shadow-md">
                    <p className="text-sm font-medium text-gray-500 mb-1">Active Rate</p>
                    <div className="flex items-end gap-2">
                        <p className="text-4xl font-extrabold text-blue-600">{Math.round((activeEmployees / totalEmployees) * 100) || 0}%</p>
                        <p className="text-sm font-medium text-gray-400 mb-1">{activeEmployees} active</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center transform transition hover:-translate-y-1 hover:shadow-md">
                    <p className="text-sm font-medium text-gray-500 mb-1">Average Salary</p>
                    <p className="text-4xl font-extrabold text-green-600">${Math.round(avgSalary).toLocaleString()}</p>
                </div>
            </div>

            {/* Visualizations layout wrapper */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
                    <div className="space-y-4 pt-2">
                        {Object.entries(deptCount).map(([dept, count]) => {
                            const width = `${(count / totalEmployees) * 100}%`;
                            return (
                                <div key={dept}>
                                    <div className="flex justify-between text-sm font-medium mb-1">
                                        <span className="text-gray-700">{dept}</span>
                                        <span className="text-gray-500">{count}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Status</h3>
                    <div className="flex h-48 items-center justify-center gap-8">
                        <div className="relative w-32 h-32 rounded-full border-8 border-gray-100 overflow-hidden flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                <circle
                                    cx="50%" cy="50%" r="46%"
                                    fill="transparent"
                                    className="text-green-500 stroke-current"
                                    strokeWidth="16"
                                    strokeDasharray={`${(activeEmployees / totalEmployees) * 289} 289`}
                                />
                            </svg>
                            <span className="text-xl font-bold text-gray-900">{activeEmployees}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm font-medium text-gray-600">Active ({activeEmployees})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                                <span className="text-sm font-medium text-gray-600">On Leave ({totalEmployees - activeEmployees})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SVG Pure Bar Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Average Salary by City</h3>
                    <div className="w-full flex-1 min-h-[250px] overflow-x-auto pb-4">
                        <svg width="100%" height="240" viewBox={`0 0 ${svgChartWidth} 240`} className="text-xs preserve-3d" preserveAspectRatio="xMinYMax meet">
                            {/* Y-Axis Grid lines & Labels */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                const y = 200 - (ratio * 180);
                                const val = Math.round(maxSalary * ratio);
                                return (
                                    <g key={`grid-${i}`}>
                                        <line x1="45" y1={y} x2={svgChartWidth} y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray={ratio === 0 ? "0" : "4 4"} />
                                        <text x="40" y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="11" fontWeight="500">
                                            ${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Chart Bars */}
                            {cityAvgSalaries.map((data, index) => {
                                const barHeight = (data.avg / maxSalary) * 180;
                                const x = 70 + index * 80;
                                const y = 200 - barHeight;
                                return (
                                    <g key={data.city} className="group cursor-pointer">
                                        <rect
                                            x={x}
                                            y={y}
                                            width="40"
                                            height={barHeight}
                                            fill="#3b82f6"
                                            className="transition-all duration-300 transform origin-bottom hover:fill-blue-700"
                                            rx="4"
                                        />
                                        {/* X-Axis City Label */}
                                        <text x={x + 20} y={222} textAnchor="middle" fill="#4b5563" fontSize="12" fontWeight="600">{data.city}</text>

                                        {/* Hover Tooltip/Value */}
                                        <text
                                            x={x + 20}
                                            y={y - 8}
                                            textAnchor="middle"
                                            fill="#1f2937"
                                            fontSize="12"
                                            fontWeight="bold"
                                            opacity="0"
                                            className="group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                        >
                                            ${data.avg.toLocaleString()}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* Stored Captured Image Block */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Signed Photo</h3>
                    <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden min-h-[250px]">
                        {capturedImage ? (
                            <img src={capturedImage} alt="Latest Signed Verification" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-center p-6">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm font-medium text-gray-500">No photos verified recently.</p>
                            </div>
                        )}
                    </div>
                </div>
                {/* Employee Map Block */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                    <div className="flex-1 w-full rounded-xl overflow-hidden border border-gray-200 z-0 relative" style={{ minHeight: '400px' }}>
                        <MapContainer center={[23.5937, 78.9629]} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {Object.entries(CITY_COORDINATES).map(([cityName, coords]) => {
                                const stats = citySalaryStats[cityName];
                                const count = stats ? stats.count : 0;
                                // Only plot markers if employees exist for mapped cities.
                                if (count === 0) return null;
                                return (
                                    <Marker key={cityName} position={coords}>
                                        <Popup className="font-sans">
                                            <div className="text-center">
                                                <strong className="text-gray-900 block text-base">{cityName}</strong>
                                                <span className="text-gray-600 block mt-1">{count} Employee(s)</span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
