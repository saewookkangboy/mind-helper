import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import LiquidBackground from '../components/ui/LiquidBackground';

function formatSaju(saju) {
  if (!saju) return '—';
  const y = saju.year;
  const m = saju.month;
  const d = saju.day;
  const h = saju.hour;
  return `${y?.gan || ''}${y?.ji || ''}년 ${m?.gan || ''}${m?.ji || ''}월 ${d?.gan || ''}${d?.ji || ''}일 ${h?.gan || ''}${h?.ji || ''}시`;
}

/** 시뮬레이션용 기본 결과 데이터 (실제 데이터 없을 때 표시) */
function getSimulatedResult() {
  return {
    saju: {
      year: { gan: '경', ji: '진' },
      month: { gan: '경', ji: '진' },
      day: { gan: '을', ji: '축' },
      hour: { gan: '갑', ji: '자' },
      oheng: { year: '금', month: '금', day: '목', hour: '수' },
    },
    ohengAnalysis: {
      dayOheng: '목',
      distribution: { 목: 2, 화: 0, 토: 1, 금: 2, 수: 1 },
      balance: '약간 불균형',
    },
    interpretation: '일간 오행 목(木)으로 성장과 발전을 추구하는 성향이 강합니다. 오행이 약간 불균형하므로 부족한 오행을 보완하는 것이 도움이 될 수 있습니다.',
    response: '사주·심리·MBTI·타로·버크만·다크 심리학 6대 도메인을 반영한 맞춤 분석 결과입니다. 당신의 질문에 대해 일간 오행(목)과 성향을 고려하면, 새로운 도전보다는 기반을 다진 뒤 단계적으로 나아가는 것이 유리합니다. 심리적으로는 자신의 경계를 인정하면서도 타인과의 소통을 이어가시길 권합니다.',
    sourcesUsed: ['saju', 'psychology', 'mbti', 'tarot', 'birkman', 'dark_psychology'],
  };
}

export default function AnalysisResult() {
  const { t } = useTranslation();
  const location = useLocation();
  const state = location.state;

  const data = state?.saju != null || state?.response != null
    ? {
        saju: state.saju,
        ohengAnalysis: state.ohengAnalysis,
        interpretation: state.interpretation,
        response: state.response,
        sourcesUsed: state.sourcesUsed || [],
      }
    : getSimulatedResult();

  const sajuFormatted = formatSaju(data.saju);

  return (
    <div className="min-h-screen relative">
      <LiquidBackground />

      <div className="container mx-auto px-4 pt-32 pb-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-8">
            {t('result.title')}
          </h1>

          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-3 text-white/90">
              {t('result.sajuPillars')}
            </h2>
            <p className="text-2xl font-bold text-gradient">
              {sajuFormatted}
            </p>
          </GlassCard>

          {data.ohengAnalysis && (
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-3 text-white/90">
                {t('result.oheng')}
              </h2>
              <ul className="space-y-2 text-white/80">
                <li>일간 오행: <strong className="text-white">{data.ohengAnalysis.dayOheng}</strong></li>
                <li>분포: <strong className="text-white">{JSON.stringify(data.ohengAnalysis.distribution || {})}</strong></li>
                <li>균형: <strong className="text-white">{data.ohengAnalysis.balance}</strong></li>
              </ul>
            </GlassCard>
          )}

          {data.interpretation && (
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-3 text-white/90">
                {t('result.interpretation')}
              </h2>
              <p className="text-white/90 whitespace-pre-wrap">
                {data.interpretation}
              </p>
            </GlassCard>
          )}

          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-3 text-white/90">
              {t('result.response')}
            </h2>
            <p className="text-white/90 whitespace-pre-wrap">
              {data.response}
            </p>
          </GlassCard>

          {data.sourcesUsed?.length > 0 && (
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-3 text-white/90">
                {t('result.sourcesUsed')}
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.sourcesUsed.map((id) => (
                  <span
                    key={id}
                    className="px-3 py-1 rounded-full bg-glass-medium text-white/90 text-sm"
                  >
                    {id}
                  </span>
                ))}
              </div>
            </GlassCard>
          )}

          <div className="flex justify-center pt-4">
            <Link to="/" className="glass-button text-lg px-8 py-4">
              {t('coaching.title')} 다시 하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
