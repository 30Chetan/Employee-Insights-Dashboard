import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import List from '../pages/List';
import Details from '../pages/Details';
import Analytics from '../pages/Analytics';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route
                path="/list"
                element={
                    <ProtectedRoute>
                        <List />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/details/:id"
                element={
                    <ProtectedRoute>
                        <Details />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/analytics"
                element={
                    <ProtectedRoute>
                        <Analytics />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
};
export default AppRoutes;
