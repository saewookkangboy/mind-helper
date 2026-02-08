import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/useLanguageStore';

const languages = [
  { code: 'ko', label: 'KO' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: 'JA' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

  return (
    <div className="flex items-center gap-2 glass-card px-2 py-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
            language === lang.code
              ? 'bg-gradient-aurora text-white'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
