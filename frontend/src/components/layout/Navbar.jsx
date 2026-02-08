import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/coaching', label: t('nav.coaching') },
  ];
  /* 프로필 현재 숨김: { path: '/profile', label: t('nav.profile') } */

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-bold text-gradient">
            Mind Helper
          </Link>
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-glass-medium text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {/* 로그인 기능 우선 숨김
          {isAuthenticated && (
            <button
              onClick={logout}
              className="glass-button text-sm"
            >
              {t('auth.signOut')}
            </button>
          )}
          */}
        </div>
      </div>
    </nav>
  );
}
