import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import LiquidBackground from '../components/ui/LiquidBackground';
import AuthButtons from '../components/auth/AuthButtons';

export default function Auth() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen relative">
      <LiquidBackground />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-md mx-auto">
          <GlassCard className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4 text-center">
              {t('common.welcome')}
            </h1>
            <p className="text-white/70 text-center mb-8">
              로그인하여 나만의 영적 라이프 코치를 만나보세요
            </p>
            
            <AuthButtons />
            
            <p className="text-white/50 text-sm text-center mt-6">
              계속 진행하면{' '}
              <Link to="/terms" className="underline">
                이용약관
              </Link>
              과{' '}
              <Link to="/privacy" className="underline">
                개인정보처리방침
              </Link>
              에 동의하는 것으로 간주됩니다.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
