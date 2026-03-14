import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const links = [
        { path: '/list', label: 'Directory' },
        { path: '/analytics', label: 'Analytics' }
    ];

    const handleSignOut = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <Link to="/list" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-xl">E</span>
                            </div>
                            <span className="font-semibold text-xl tracking-tight text-gray-900">
                                Insights
                            </span>
                        </Link>

                        <div className="hidden md:flex gap-1">
                            {links.map((link) => {
                                const isActive = location.pathname.startsWith(link.path);
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 border border-gray-300">
                            TU
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="text-sm font-medium text-gray-500 hover:text-gray-700 transition"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;
