import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50 text-gray-900 font-sans">
      {!isLoginPage && <Navbar />}
      <main className="flex-1 flex flex-col">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
