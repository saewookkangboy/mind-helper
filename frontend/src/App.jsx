import { useEffect, Component } from 'react';
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
import AnalysisResult from './pages/AnalysisResult';

class ErrorFallback extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-xl font-semibold">일시적인 오류가 발생했습니다</h1>
            <p className="text-white/80 text-sm">페이지를 새로고침하거나, 잠시 후 다시 시도해 주세요.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { i18n } = useTranslation();
  const savedLanguage = localStorage.getItem('language') || 'ko';

  useEffect(() => {
    i18n.changeLanguage(savedLanguage);
  }, [i18n, savedLanguage]);

  return (
    <ErrorFallback>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen" data-mount="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Coaching />} />
            <Route path="/welcome" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/coaching" element={<Coaching />} />
            <Route path="/result" element={<AnalysisResult />} />
            <Route path="/profile" element={<div className="min-h-screen pt-32 px-4"><h1 className="text-4xl">프로필 (준비 중)</h1></div>} />
          </Routes>
          <MobileNav />
        </div>
      </BrowserRouter>
    </ErrorFallback>
  );
}

export default App;
