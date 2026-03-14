import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEmployeeById } from '../utils/api';
import CameraCapture from '../components/CameraCapture';

const Details = () => {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCamera, setShowCamera] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        fetchEmployeeById(id).then(data => {
            setEmployee(data);
            setLoading(false);
        });
    }, [id]);

    const handleCameraCapture = (base64Image) => {
        setProfileImage(base64Image);
        setShowCamera(false);
        // Store merged image for analytics page
        localStorage.setItem('latestCapturedImage', base64Image);
    };

    if (loading) {
        return (
            <div className="flex-1 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee not found</h2>
                <Link to="/list" className="text-blue-600 hover:underline">Back to Directory</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
            <Link to="/list" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Directory
            </Link>

            <div className="bg-white shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden border border-gray-100 relative">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative"></div>
                <div className="px-8 pb-8 flex flex-col sm:flex-row gap-6 relative">
                    <div className="-mt-12 group relative">
                        <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-lg flex items-center justify-center text-4xl font-bold text-blue-600 border border-gray-100 overflow-hidden cursor-pointer" onClick={() => setShowCamera(true)}>
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                employee.name.charAt(0)
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity cursor-pointer">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                        </div>
                    </div>
                    <div className="pt-2 sm:pt-4 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
                                <p className="text-gray-500 font-medium">{employee.role} • {employee.department}</p>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {employee.status}
                            </span>
                        </div>
                    </div>
                </div>

                {showCamera && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4">
                        <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
                            <button
                                onClick={() => setShowCamera(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1 bg-gray-100 rounded-full"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Update Profile Photo</h3>
                            <CameraCapture onCapture={handleCameraCapture} />
                        </div>
                    </div>
                )}

                <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Personal Details</h3>
                        <ul className="space-y-4">
                            <li className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-600">Email</span>
                                <span className="font-medium text-gray-900">{employee.email || `${employee.name.split(' ')[0].toLowerCase()}@company.com`}</span>
                            </li>
                            <li className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-600">Join Date</span>
                                <span className="font-medium text-gray-900">{employee.joinDate || 'N/A'}</span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Compensation & Performance</h3>
                        <ul className="space-y-4">
                            <li className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-600">Salary</span>
                                <span className="font-medium text-gray-900">${(employee.salary || 0).toLocaleString()}</span>
                            </li>
                            <li className="flex items-center justify-between border-b border-gray-200 pb-2">
                                <span className="text-gray-600">Performance Score</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full"
                                            style={{ width: `${employee.performanceScore || 0}%` }}
                                        />
                                    </div>
                                    <span className="font-medium text-gray-900">{employee.performanceScore || 0}%</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Details;
