import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Coaching from './pages/Coaching';

function App() {
  const { i18n } = useTranslation();
  const savedLanguage = localStorage.getItem('language') || 'ko';

  useEffect(() => {
    i18n.changeLanguage(savedLanguage);
  }, [i18n, savedLanguage]);

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/coaching" element={<Coaching />} />
          <Route path="/profile" element={<div className="min-h-screen pt-32 px-4"><h1 className="text-4xl">프로필 (준비 중)</h1></div>} />
        </Routes>
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
