import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployees } from '../utils/api';
import useVirtualScroll from '../hooks/useVirtualScroll';

const List = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployees().then(data => {
            setEmployees(data);
            setLoading(false);
        });
    }, []);

    const ROW_HEIGHT = 50;
    const CONTAINER_HEIGHT = 500;

    const {
        startIndex,
        endIndex,
        onScroll,
        topSpacerHeight,
        bottomSpacerHeight
    } = useVirtualScroll({
        totalItems: employees.length,
        rowHeight: ROW_HEIGHT,
        containerHeight: CONTAINER_HEIGHT,
        buffer: 5
    });

    const visibleEmployees = employees.slice(startIndex, endIndex);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Directory</h1>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                    Add Employee
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div
                        className="overflow-auto relative"
                        style={{ maxHeight: CONTAINER_HEIGHT }}
                        onScroll={onScroll}
                    >
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">City</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Salary</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">Department</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {topSpacerHeight > 0 && (
                                    <tr style={{ height: topSpacerHeight }}>
                                        <td colSpan={5} className="p-0 border-none"></td>
                                    </tr>
                                )}
                                {visibleEmployees.map((emp) => (
                                    <tr
                                        key={emp.id}
                                        onClick={() => navigate(`/details/${emp.id}`)}
                                        className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                                        style={{ height: ROW_HEIGHT }}
                                    >
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                            #{emp.id}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold shrink-0">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                                            {emp.city}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-green-600">
                                            {emp.salary}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {emp.department}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {bottomSpacerHeight > 0 && (
                                    <tr style={{ height: bottomSpacerHeight }}>
                                        <td colSpan={5} className="p-0 border-none"></td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default List;
