import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import LiquidBackground from '../components/ui/LiquidBackground';
import { useAuthStore } from '../store/useAuthStore';
import { apiCalculateSaju } from '../utils/apiClient';
import { calculateSaju, analyzeOheng, interpretSaju } from '../utils/sajuCalculator';

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setGuest, setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    mbti: '',
    interests: '',
    currentConcern: '',
  });
  
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [sajuResult, setSajuResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let saju;
      // 만세력 API 우선 사용 (KST 기준, KARI 음력). 입력 일시는 사용자 타임존으로 해석 후 KST로 변환
      const userTimezone = Intl.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone || 'Asia/Seoul';
      try {
        const res = await apiCalculateSaju(formData.birthDate, formData.birthTime, userTimezone);
        if (res?.success && res?.data?.saju) {
          saju = res.data.saju;
        } else {
          throw new Error('Invalid response');
        }
      } catch (apiErr) {
        console.warn('만세력 API 사용 불가, 로컬 계산으로 대체:', apiErr?.message);
        saju = calculateSaju(formData.birthDate, formData.birthTime);
      }

      const ohengAnalysis = analyzeOheng(saju);
      const interpretation = interpretSaju(saju, ohengAnalysis);

      setSajuResult({
        saju,
        ohengAnalysis,
        interpretation,
      });

      setGuest(true);

      localStorage.setItem('userSaju', JSON.stringify({
        saju,
        ohengAnalysis,
        interpretation,
        userInfo: formData,
      }));

      navigate('/dashboard');
    } catch (error) {
      console.error('사주 계산 오류:', error);
      alert('사주 계산 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsVoiceInput(true);
      // TODO: Web Speech API 구현
      alert('음성 입력 기능은 곧 지원됩니다');
      setIsVoiceInput(false);
    } else {
      alert('이 브라우저는 음성 입력을 지원하지 않습니다');
    }
  };

  return (
    <div className="min-h-screen relative">
      <LiquidBackground />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-2xl mx-auto">
          <GlassCard className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-4 text-center">
              {t('onboarding.title')}
            </h1>
            <p className="text-white/70 text-center mb-8">
              {t('onboarding.subtitle')}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white/90 mb-2">
                  {t('onboarding.birthDate')}
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="glass-input w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white/90 mb-2">
                  {t('onboarding.birthTime')}
                </label>
                <input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  className="glass-input w-full"
                  required
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className="mt-2 glass-button text-sm"
                >
                  🎤 {t('onboarding.voiceInput')}
                </button>
              </div>
              
              <div>
                <label className="block text-white/90 mb-2">
                  {t('onboarding.mbti')}
                </label>
                <select
                  value={formData.mbti}
                  onChange={(e) => setFormData({ ...formData, mbti: e.target.value })}
                  className="glass-input w-full"
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="INTJ">INTJ</option>
                  <option value="INTP">INTP</option>
                  <option value="ENTJ">ENTJ</option>
                  <option value="ENTP">ENTP</option>
                  <option value="INFJ">INFJ</option>
                  <option value="INFP">INFP</option>
                  <option value="ENFJ">ENFJ</option>
                  <option value="ENFP">ENFP</option>
                  <option value="ISTJ">ISTJ</option>
                  <option value="ISFJ">ISFJ</option>
                  <option value="ESTJ">ESTJ</option>
                  <option value="ESFJ">ESFJ</option>
                  <option value="ISTP">ISTP</option>
                  <option value="ISFP">ISFP</option>
                  <option value="ESTP">ESTP</option>
                  <option value="ESFP">ESFP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white/90 mb-2">
                  {t('onboarding.interests')}
                </label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="glass-input w-full"
                  placeholder="예: 음악, 영화, 독서"
                />
              </div>
              
              <div>
                <label className="block text-white/90 mb-2">
                  {t('onboarding.currentConcern')}
                </label>
                <textarea
                  value={formData.currentConcern}
                  onChange={(e) => setFormData({ ...formData, currentConcern: e.target.value })}
                  className="glass-input w-full min-h-[100px]"
                  placeholder="현재 고민이나 궁금한 점을 입력해주세요"
                />
              </div>
              
              <button
                type="submit"
                className="glass-button w-full text-lg py-4"
              >
                {t('onboarding.submit')}
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
