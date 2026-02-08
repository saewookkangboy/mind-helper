import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import LiquidBackground from '../components/ui/LiquidBackground';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen relative">
      <LiquidBackground />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-gradient mb-4"
          >
            {t('common.welcome')}
          </motion.h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12">
            나만의 영적 라이프 코치와 함께하는 하루
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <GlassCard className="p-6">
              <div className="text-4xl mb-4">🔮</div>
              <h3 className="text-xl font-semibold mb-2">사주 분석</h3>
              <p className="text-white/70 text-sm">
                생년월일시 기반 정확한 사주 분석
              </p>
            </GlassCard>
            
            <GlassCard className="p-6">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI 코칭</h3>
              <p className="text-white/70 text-sm">
                진로, 연애, 오늘의 운세까지
              </p>
            </GlassCard>
            
            <GlassCard className="p-6">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-2">게이미피케이션</h3>
              <p className="text-white/70 text-sm">
                퀘스트와 보상으로 재미있게
              </p>
            </GlassCard>
          </div>
          
          <div className="mt-12 flex gap-4 justify-center">
            <Link
              to="/auth"
              className="glass-button text-lg px-8 py-4 inline-block"
            >
              {t('auth.signIn')}
            </Link>
            <Link
              to="/onboarding"
              className="glass-button text-lg px-8 py-4 inline-block bg-glass-dark hover:bg-glass-medium"
            >
              {t('onboarding.submit')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
