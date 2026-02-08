import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassCard from '../components/ui/GlassCard';
import LiquidBackground from '../components/ui/LiquidBackground';

export default function Dashboard() {
  const { t } = useTranslation();
  const [userSaju, setUserSaju] = useState(null);

  useEffect(() => {
    // localStorage에서 사주 정보 불러오기
    const savedSaju = localStorage.getItem('userSaju');
    if (savedSaju) {
      setUserSaju(JSON.parse(savedSaju));
    }
  }, []);

  const formatSaju = (saju) => {
    if (!saju) return '';
    return `${saju.year.gan}${saju.year.ji}년 ${saju.month.gan}${saju.month.ji}월 ${saju.day.gan}${saju.day.ji}일 ${saju.hour.gan}${saju.hour.ji}시`;
  };

  return (
    <div className="min-h-screen relative">
      <LiquidBackground />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-8">
            {t('dashboard.title')}
          </h1>
          
          {/* 사주 정보 카드 */}
          {userSaju && (
            <GlassCard className="p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">나의 사주</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-white/70">사주: </span>
                  <span className="text-xl font-bold text-gradient">
                    {formatSaju(userSaju.saju)}
                  </span>
                </div>
                {userSaju.interpretation && (
                  <div className="mt-4 p-4 bg-glass-dark rounded-lg">
                    <p className="text-white/90">{userSaju.interpretation}</p>
                  </div>
                )}
              </div>
            </GlassCard>
          )}
          
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="text-2xl mb-2">{t('dashboard.level')}</div>
              <div className="text-4xl font-bold text-gradient">1</div>
            </GlassCard>
            
            <GlassCard className="p-6">
              <div className="text-2xl mb-2">{t('dashboard.exp')}</div>
              <div className="text-4xl font-bold text-gradient">0 / 100</div>
            </GlassCard>
            
            <GlassCard className="p-6">
              <div className="text-2xl mb-2">{t('dashboard.streak')}</div>
              <div className="text-4xl font-bold text-gradient">🔥 0</div>
            </GlassCard>
          </div>
          
          {/* 오늘의 퀘스트 */}
          <GlassCard className="p-8">
            <h2 className="text-2xl font-semibold mb-4">{t('dashboard.dailyQuest')}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-glass-dark rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <span>오늘의 운세 확인하기</span>
                </div>
                <button className="glass-button text-sm">완료</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-glass-dark rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💬</span>
                  <span>AI 코칭 받기</span>
                </div>
                <span className="text-white/50">잠금</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-glass-dark rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⭐</span>
                  <span>피드백 남기기</span>
                </div>
                <span className="text-white/50">잠금</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
