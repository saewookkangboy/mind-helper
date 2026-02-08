import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';

const RESULT_RESPONSE_STORAGE_KEY = 'mindHelper_result_response';
const RESULT_SUMMARY_STORAGE_KEY = 'mindHelper_result_summary';
const RESULT_SECTIONS_STORAGE_KEY = 'mindHelper_result_sections';
const RESULT_TAROT_CARDS_STORAGE_KEY = 'mindHelper_result_tarot_cards';

import GlassCard from '../components/ui/GlassCard';
import LiquidBackground from '../components/ui/LiquidBackground';
import LayerModal from '../components/ui/LayerModal';
import ResultChatbot from '../components/result/ResultChatbot';

function stripAsterisks(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/\*+/g, '').trim();
}

/** 텍스트 복사 버튼: 클립보드 복사 후 잠시 "복사됨" 표시 */
function CopyTextButton({ text, label, doneLabel, className = '' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!text || copied) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };
  if (!text) return null;
  const baseClass = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/95 text-sm transition disabled:opacity-60';
  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={copied}
      className={[baseClass, className].filter(Boolean).join(' ')}
      title={label}
    >
      <span aria-hidden>{copied ? '✓' : '📋'}</span>
      {copied ? doneLabel : label}
    </button>
  );
}

/**
 * AI 응답을 단락 단위로 나누어 표시 (내용 100% 유지).
 * 이중 줄바꿈(\n\n)으로만 분리하여, 문장 단위 분리로 인한 누락이 없도록 함.
 */
function formatResponseParagraphs(text) {
  if (!text || typeof text !== 'string') return [];
  const cleaned = text.replace(/\*+/g, '').trim();
  if (!cleaned) return [];
  const byNewline = cleaned.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return byNewline.length > 0 ? byNewline : [cleaned];
}

function formatSaju(saju) {
  if (!saju) return '—';
  const y = saju.year;
  const m = saju.month;
  const d = saju.day;
  const h = saju.hour;
  return `${y?.gan || ''}${y?.ji || ''}년 ${m?.gan || ''}${m?.ji || ''}월 ${d?.gan || ''}${d?.ji || ''}일 ${h?.gan || ''}${h?.ji || ''}시`;
}

const OHENG_HANJA = { 목: '木', 화: '火', 토: '土', 금: '金', 수: '水' };

/** 오행 분포 객체를 문장형 설명으로 변환 */
function formatOhengDistribution(dist) {
  if (!dist || typeof dist !== 'object') return null;
  const order = ['목', '화', '토', '금', '수'];
  const parts = order
    .filter((key) => dist[key] !== undefined)
    .map((key) => `${key}(${OHENG_HANJA[key] || key}) ${dist[key]}개`);
  return parts.length ? parts.join(', ') : null;
}

/** 상단 '간단 요약'용: 최소 4줄(4문장) 분량으로 표시. 줄바꿈 기준 4줄 또는 문장 기준 4문장 */
function getBriefSummary(fullSummaryOrResponse) {
  if (fullSummaryOrResponse == null || typeof fullSummaryOrResponse !== 'string') return '';
  const trimmed = String(fullSummaryOrResponse).trim();
  if (!trimmed) return '';
  const lines = trimmed.split(/\n/).map((s) => s.trim()).filter(Boolean);
  if (lines.length >= 4) return lines.slice(0, 4).join('\n');
  const sentences = trimmed.split(/(?<=[.!?。？！])\s+/).filter(Boolean);
  if (sentences.length >= 4) return sentences.slice(0, 4).join(' ').trim();
  return trimmed;
}

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
    response: '사주·심리·MBTI·타로·버크만·다크 심리학 6대 도메인을 반영한 맞춤 분석 결과입니다.',
    responseSummary: '일간 오행(목)과 성향을 고려하면 기반을 다진 뒤 단계적으로 나아가는 것이 유리합니다. 심리적으로는 자신의 경계를 인정하면서도 타인과의 소통을 이어가시길 권합니다.',
    responseSections: {
      saju: '사주 관점에서는 현재 오행 균형을 유지하며 단계적 도전이 좋습니다.',
      psychology: '심리적으로는 인지·정서·행동 패턴을 살펴보며 소통을 이어가세요.',
      mbti: 'MBTI 성향에 맞춘 행동 선택이 에너지 효율을 높입니다.',
      tarot: '타로 에너지는 지금 단계적 진행을 뒷받침합니다.',
      birkman: '버크만 관점에서 욕구와 스트레스 반응을 고려한 선택을 권합니다.',
      dark_psychology: '관계에서 자기보호와 경계 인지를 유지하세요.',
      path: '우선 1~2주 안에 할 수 있는 작은 행동 하나를 정해 실천해 보세요. 사주·MBTI·심리 분석을 종합하면, 기반을 다진 뒤 단계적으로 나아가는 것이 유리합니다. 주간 단위로 점검하며, 부담이 되지 않는 범위에서 소통과 자기보호의 균형을 유지하시길 권합니다.',
    },
    sourcesUsed: ['saju', 'psychology', 'mbti', 'tarot', 'birkman', 'dark_psychology'],
    tarotCards: [],
  };
}

export default function AnalysisResult() {
  const { t } = useTranslation();
  const location = useLocation();
  const state = location.state;

  const [modal, setModal] = useState(null);

  let data;
  try {
    data = state?.saju != null || state?.response != null
      ? (() => {
          let response = state?.response;
          let responseSummary = state?.responseSummary ?? '';
          let responseSections = state?.responseSections && typeof state.responseSections === 'object' ? state.responseSections : {};
          try {
            const storedResp = sessionStorage.getItem(RESULT_RESPONSE_STORAGE_KEY);
            if (storedResp && typeof storedResp === 'string') response = storedResp;
            const storedSum = sessionStorage.getItem(RESULT_SUMMARY_STORAGE_KEY);
            if (storedSum != null) responseSummary = String(storedSum);
            const storedSec = sessionStorage.getItem(RESULT_SECTIONS_STORAGE_KEY);
            if (storedSec) {
              try {
                const parsed = JSON.parse(storedSec);
                if (parsed && typeof parsed === 'object') responseSections = parsed;
              } catch (_) {}
            }
            let tarotCards = state?.tarotCards;
            if (!Array.isArray(tarotCards) || tarotCards.length === 0) {
              try {
                const stored = sessionStorage.getItem(RESULT_TAROT_CARDS_STORAGE_KEY);
                if (stored) {
                  const parsed = JSON.parse(stored);
                  if (Array.isArray(parsed)) tarotCards = parsed;
                }
              } catch (_) {}
            }
          } catch (_) {}
          return {
            saju: state?.saju ?? null,
            ohengAnalysis: state?.ohengAnalysis ?? null,
            interpretation: state?.interpretation ?? '',
            response: typeof response === 'string' ? response : '',
            responseSummary: typeof responseSummary === 'string' ? responseSummary : '',
            responseSections: typeof responseSections === 'object' && responseSections !== null ? responseSections : {},
            sourcesUsed: Array.isArray(state?.sourcesUsed) ? state.sourcesUsed : [],
            tarotCards: Array.isArray(tarotCards) ? tarotCards : [],
            mbti: state?.mbti ?? null,
            interests: state?.interests ?? null,
          };
        })()
      : getSimulatedResult();
  } catch (_) {
    data = getSimulatedResult();
  }

  useEffect(() => {
    return () => {
      try {
        sessionStorage.removeItem(RESULT_RESPONSE_STORAGE_KEY);
        sessionStorage.removeItem(RESULT_SUMMARY_STORAGE_KEY);
        sessionStorage.removeItem(RESULT_SECTIONS_STORAGE_KEY);
      } catch (_) {}
    };
  }, []);

  const sajuFormatted = formatSaju(data.saju);
  const interpretationClean = stripAsterisks(data.interpretation);

  const resultContext = {
    response: data.response,
    saju: data.saju,
    ohengAnalysis: data.ohengAnalysis,
    interpretation: data.interpretation,
  };

  return (
    <div className="min-h-screen relative">
      <LiquidBackground />

      <div className="container mx-auto px-4 pt-32 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            {t('result.title')}
          </h1>

          {/* 상단: 간단 요약 — 한눈에 파악할 수 있는 한 줄 요약 */}
          <GlassCard className="p-6 bg-white/5 border border-white/10">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <p className="text-xs font-medium text-aurora-purple/80 uppercase tracking-wider">{t('result.briefSummaryLabel')}</p>
              <CopyTextButton
                text={data.responseSummary || data.response ? stripAsterisks(getBriefSummary(data.responseSummary || data.response)) : t('result.briefSummaryFallback')}
                label={t('result.copyBtn')}
                doneLabel={t('result.copyDone')}
                className="bg-white/10 hover:bg-white/15 shrink-0"
              />
            </div>
            <p className="text-lg md:text-xl text-white/95 leading-relaxed whitespace-pre-line">
              {data.responseSummary || data.response
                ? stripAsterisks(getBriefSummary(data.responseSummary || data.response))
                : t('result.briefSummaryFallback')}
            </p>
            <p className="text-white/60 text-sm mt-3">{t('result.briefSummarySubtitle')}</p>
          </GlassCard>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>🔮</span> {t('result.sectionSaju')}
            </h2>
            <GlassCard className="p-6">
              <p className="text-2xl font-bold text-gradient mb-2">{sajuFormatted}</p>
              <p className="text-white/80 text-sm mb-4">{t('result.sectionSajuDesc')}</p>
              {data.ohengAnalysis && (
                <div className="text-white/90 text-sm leading-relaxed space-y-2 mb-4">
                  <p>
                    <strong className="text-white">일간(日干) 오행</strong>은{' '}
                    <strong className="text-aurora-purple/90">{data.ohengAnalysis.dayOheng}({OHENG_HANJA[data.ohengAnalysis.dayOheng] || data.ohengAnalysis.dayOheng})</strong>
                    으로, 성향의 핵심을 나타냅니다.
                  </p>
                  {formatOhengDistribution(data.ohengAnalysis.distribution) && (
                    <p>
                      <strong className="text-white">오행 분포</strong>는 {formatOhengDistribution(data.ohengAnalysis.distribution)}로 구성되어 있습니다.
                    </p>
                  )}
                  {data.ohengAnalysis.balance && (
                    <p>
                      <strong className="text-white">오행 균형</strong>은 {data.ohengAnalysis.balance}한 편이며, 부족한 오행을 보완하면 에너지 조화에 도움이 됩니다.
                    </p>
                  )}
                </div>
              )}
              {data.responseSections?.saju && (
                <div className="mt-4 p-4 rounded-xl bg-aurora-purple/10 border border-aurora-purple/20">
                  <p className="text-xs font-medium text-aurora-purple/90 mb-1">{t('result.mindHelperAdvice')}</p>
                  <p className="text-white/92 text-sm leading-relaxed whitespace-pre-wrap">{stripAsterisks(data.responseSections.saju)}</p>
                </div>
              )}
              <p className="text-white/70 text-xs mb-3 mt-4">{t('result.reflectedInAdvice')}</p>
              <div className="flex flex-wrap items-center gap-2">
                <CopyTextButton
                  text={data.responseSections?.saju ? stripAsterisks(data.responseSections.saju) : ''}
                  label={t('result.copyBtn')}
                  doneLabel={t('result.copyDone')}
                  className="bg-white/10 hover:bg-white/15"
                />
                <button
                  type="button"
                  onClick={() => setModal({ type: 'help', section: 'saju' })}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-aurora-purple/20 hover:bg-aurora-purple/30 text-white/95 text-sm transition"
                >
                  <span aria-hidden>💡</span>
                  {t('result.helpBtn')}
                </button>
                <button
                  type="button"
                  onClick={() => setModal({ type: 'detail', section: 'saju' })}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/95 text-sm transition"
                >
                  <span aria-hidden>📄</span>
                  {t('result.detailBtn')}
                </button>
              </div>
            </GlassCard>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>📊</span> {t('result.sectionBirkman')}
            </h2>
            <GlassCard className="p-6">
              <p className="text-white/90 text-sm mb-3">{t('result.sectionBirkmanDesc')}</p>
              {data.responseSections?.birkman && (
                <div className="mt-4 p-4 rounded-xl bg-aurora-purple/10 border border-aurora-purple/20">
                  <p className="text-xs font-medium text-aurora-purple/90 mb-1">{t('result.mindHelperAdvice')}</p>
                  <p className="text-white/92 text-sm leading-relaxed whitespace-pre-wrap">{stripAsterisks(data.responseSections.birkman)}</p>
                </div>
              )}
              <p className="text-white/70 text-xs mb-3 mt-4">{t('result.reflectedInAdvice')}</p>
              <div className="flex flex-wrap items-center gap-2">
                <CopyTextButton text={data.responseSections?.birkman ? stripAsterisks(data.responseSections.birkman) : ''} label={t('result.copyBtn')} doneLabel={t('result.copyDone')} className="bg-white/10 hover:bg-white/15" />
                <button type="button" onClick={() => setModal({ type: 'help', section: 'birkman' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-aurora-purple/20 hover:bg-aurora-purple/30 text-white/95 text-sm transition"><span aria-hidden>💡</span>{t('result.helpBtn')}</button>
                <button type="button" onClick={() => setModal({ type: 'detail', section: 'birkman' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/95 text-sm transition"><span aria-hidden>📄</span>{t('result.detailBtn')}</button>
              </div>
            </GlassCard>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>💬</span> {t('result.sectionPsychology')}
            </h2>
            <GlassCard className="p-6">
              <p className="text-white/90 text-sm mb-3">{t('result.sectionPsychologyDesc')}</p>
              {data.responseSections?.psychology && (
                <div className="mt-4 p-4 rounded-xl bg-aurora-purple/10 border border-aurora-purple/20">
                  <p className="text-xs font-medium text-aurora-purple/90 mb-1">{t('result.mindHelperAdvice')}</p>
                  <p className="text-white/92 text-sm leading-relaxed whitespace-pre-wrap">{stripAsterisks(data.responseSections.psychology)}</p>
                </div>
              )}
              <p className="text-white/70 text-xs mb-3 mt-4">{t('result.reflectedInAdvice')}</p>
              <div className="flex flex-wrap items-center gap-2">
                <CopyTextButton text={data.responseSections?.psychology ? stripAsterisks(data.responseSections.psychology) : ''} label={t('result.copyBtn')} doneLabel={t('result.copyDone')} className="bg-white/10 hover:bg-white/15" />
                <button type="button" onClick={() => setModal({ type: 'help', section: 'psychology' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-aurora-purple/20 hover:bg-aurora-purple/30 text-white/95 text-sm transition"><span aria-hidden>💡</span>{t('result.helpBtn')}</button>
                <button type="button" onClick={() => setModal({ type: 'detail', section: 'psychology' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/95 text-sm transition"><span aria-hidden>📄</span>{t('result.detailBtn')}</button>
              </div>
            </GlassCard>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>🃏</span> {t('result.sectionTarot')}
            </h2>
            <GlassCard className="p-6">
              <p className="text-white/90 text-sm mb-3">{t('result.sectionTarotDesc')}</p>
              {data.responseSections?.tarot && (
                <div className="mt-4 p-4 rounded-xl bg-aurora-purple/10 border border-aurora-purple/20">
                  <p className="text-xs font-medium text-aurora-purple/90 mb-1">{t('result.mindHelperAdvice')}</p>
                  <p className="text-white/92 text-sm leading-relaxed whitespace-pre-wrap">{stripAsterisks(data.responseSections.tarot)}</p>
                </div>
              )}
              <p className="text-white/70 text-xs mb-3 mt-4">{t('result.reflectedInAdvice')}</p>
              <div className="flex flex-wrap items-center gap-2">
                <CopyTextButton text={data.responseSections?.tarot ? stripAsterisks(data.responseSections.tarot) : ''} label={t('result.copyBtn')} doneLabel={t('result.copyDone')} className="bg-white/10 hover:bg-white/15" />
                <button type="button" onClick={() => setModal({ type: 'help', section: 'tarot' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-aurora-purple/20 hover:bg-aurora-purple/30 text-white/95 text-sm transition"><span aria-hidden>💡</span>{t('result.helpBtn')}</button>
                <button type="button" onClick={() => setModal({ type: 'detail', section: 'tarot' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/95 text-sm transition"><span aria-hidden>📄</span>{t('result.detailBtn')}</button>
              </div>
            </GlassCard>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>🧠</span> {t('result.sectionMbti')}
            </h2>
            <GlassCard className="p-6">
              {data.mbti && (
                <p className="text-xl font-semibold text-gradient mb-2">{data.mbti}</p>
              )}
              <p className="text-white/90 text-sm mb-3">{t('result.sectionMbtiDesc')}</p>
              {data.responseSections?.mbti && (
                <div className="mt-4 p-4 rounded-xl bg-aurora-purple/10 border border-aurora-purple/20">
                  <p className="text-xs font-medium text-aurora-purple/90 mb-1">{t('result.mindHelperAdvice')}</p>
                  <p className="text-white/92 text-sm leading-relaxed whitespace-pre-wrap">{stripAsterisks(data.responseSections.mbti)}</p>
                </div>
              )}
              <p className="text-white/70 text-xs mb-3 mt-4">{t('result.reflectedInAdvice')}</p>
              <div className="flex flex-wrap items-center gap-2">
                <CopyTextButton text={data.responseSections?.mbti ? stripAsterisks(data.responseSections.mbti) : ''} label={t('result.copyBtn')} doneLabel={t('result.copyDone')} className="bg-white/10 hover:bg-white/15" />
                <button type="button" onClick={() => setModal({ type: 'help', section: 'mbti' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-aurora-purple/20 hover:bg-aurora-purple/30 text-white/95 text-sm transition"><span aria-hidden>💡</span>{t('result.helpBtn')}</button>
                <button type="button" onClick={() => setModal({ type: 'detail', section: 'mbti' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/95 text-sm transition"><span aria-hidden>📄</span>{t('result.detailBtn')}</button>
              </div>
            </GlassCard>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>🎭</span> {t('result.sectionDark')}
            </h2>
            <GlassCard className="p-6">
              <p className="text-white/90 text-sm mb-3">{t('result.sectionDarkDesc')}</p>
              {data.responseSections?.dark_psychology && (
                <div className="mt-4 p-4 rounded-xl bg-aurora-purple/10 border border-aurora-purple/20">
                  <p className="text-xs font-medium text-aurora-purple/90 mb-1">{t('result.mindHelperAdvice')}</p>
                  <p className="text-white/92 text-sm leading-relaxed whitespace-pre-wrap">{stripAsterisks(data.responseSections.dark_psychology)}</p>
                </div>
              )}
              <p className="text-white/70 text-xs mb-3 mt-4">{t('result.reflectedInAdvice')}</p>
              <div className="flex flex-wrap items-center gap-2">
                <CopyTextButton text={data.responseSections?.dark_psychology ? stripAsterisks(data.responseSections.dark_psychology) : ''} label={t('result.copyBtn')} doneLabel={t('result.copyDone')} className="bg-white/10 hover:bg-white/15" />
                <button type="button" onClick={() => setModal({ type: 'help', section: 'dark' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-aurora-purple/20 hover:bg-aurora-purple/30 text-white/95 text-sm transition"><span aria-hidden>💡</span>{t('result.helpBtn')}</button>
                <button type="button" onClick={() => setModal({ type: 'detail', section: 'dark' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/95 text-sm transition"><span aria-hidden>📄</span>{t('result.detailBtn')}</button>
              </div>
            </GlassCard>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <span>✨</span> {t('result.sectionPath')}
            </h2>
            <GlassCard className="p-6">
              <p className="text-white/90 text-sm mb-3">{t('result.sectionPathDesc')}</p>
              {data.responseSections?.path && (
                <div className="mt-4 p-4 rounded-xl bg-aurora-purple/10 border border-aurora-purple/20">
                  <p className="text-xs font-medium text-aurora-purple/90 mb-1">{t('result.mindHelperAdvice')}</p>
                  <p className="text-white/92 text-sm leading-relaxed whitespace-pre-wrap">{stripAsterisks(data.responseSections.path)}</p>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <CopyTextButton text={data.responseSections?.path ? stripAsterisks(data.responseSections.path) : ''} label={t('result.copyBtn')} doneLabel={t('result.copyDone')} className="bg-white/10 hover:bg-white/15" />
                <button type="button" onClick={() => setModal({ type: 'help', section: 'path' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-aurora-purple/20 hover:bg-aurora-purple/30 text-white/95 text-sm transition"><span aria-hidden>💡</span>{t('result.helpBtn')}</button>
                <button type="button" onClick={() => setModal({ type: 'detail', section: 'path' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/95 text-sm transition"><span aria-hidden>📄</span>{t('result.detailBtn')}</button>
              </div>
            </GlassCard>
          </section>

          {/* 하단: 종합 인사이트 — 각 섹션 내용을 기반으로 한 최종 정리 */}
          <GlassCard className="p-6 md:p-8 border-l-4 border-aurora-purple/50 bg-gradient-to-br from-aurora-purple/5 to-transparent">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden>✨</span>
                <h2 className="text-xl font-semibold text-white">{t('result.finalInsightTitle')}</h2>
              </div>
              <CopyTextButton
                text={data.responseSummary ? stripAsterisks(data.responseSummary) : (data.response ? stripAsterisks(data.response) : '') || t('result.personaIntro')}
                label={t('result.copyBtn')}
                doneLabel={t('result.copyDone')}
                className="bg-white/10 hover:bg-white/15 shrink-0"
              />
            </div>
            <p className="text-white/70 text-sm mb-4">{t('result.finalInsightSubtitle')}</p>
            <div className="text-white/95 leading-relaxed whitespace-pre-wrap break-words text-[15px]">
              {data.responseSummary
                ? stripAsterisks(data.responseSummary)
                : (data.response ? stripAsterisks(data.response) : t('result.personaIntro'))}
            </div>
          </GlassCard>

          {data.sourcesUsed?.length > 0 && (
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white/90 mb-3">{t('result.sourcesUsed')}</h2>
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
              {t('result.redoCoaching')}
            </Link>
          </div>
        </div>
      </div>

      {modal && (
        <LayerModal
          open={!!modal}
          onClose={() => setModal(null)}
          title={`${modal.type === 'help' ? t('result.helpBtn') : t('result.detailBtn')} · ${t(`result.section${modal.section.charAt(0).toUpperCase() + modal.section.slice(1)}`)}`}
          wide={modal.section === 'tarot' && modal.type === 'detail' && (data.tarotCards ?? []).length > 0}
        >
          <div className="prose prose-invert max-w-none text-base leading-relaxed space-y-4">
            <p className="whitespace-pre-wrap text-white/95">
              {modal.type === 'help' ? t(`result.help${modal.section.charAt(0).toUpperCase() + modal.section.slice(1)}`) : t(`result.detail${modal.section.charAt(0).toUpperCase() + modal.section.slice(1)}`)}
            </p>
            {modal.section === 'tarot' && modal.type === 'detail' && (data.tarotCards ?? []).length > 0 && (
              <div className="mt-4 space-y-4">
                <p className="text-xs font-medium text-aurora-purple/90 uppercase tracking-wider">{t('result.tarotCardsTitle')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(data.tarotCards ?? []).map((card, idx) => (
                    <div key={card.id || idx} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                      <div className="aspect-[3/4] bg-aurora-purple/10 flex items-center justify-center">
                        {card.imageUrl ? (
                          <img src={card.imageUrl} alt={card.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-4xl text-white/40" aria-hidden>🃏</span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-white/95 text-sm">
                          {card.name}
                          {card.reversed && <span className="ml-1 text-aurora-purple/90 text-xs">({t('result.tarotReversed')})</span>}
                        </p>
                        {card.position && <p className="text-xs text-white/70 mt-0.5">{card.position}</p>}
                        {card.meaningShort && <p className="text-white/80 text-xs mt-1 line-clamp-2">{card.meaningShort}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {modal.section === 'saju' && modal.type === 'detail' && data.saju?.kariLunarSource && (
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm space-y-1">
                <p className="font-medium text-white/95">{t('result.sajuSourceTitle')}</p>
                <p className="text-white/80">{data.saju.kariLunarSource.source}</p>
                <p>
                  {data.saju.kariLunarSource.lunYear}년(음력) {data.saju.kariLunarSource.lunMonth}월 {data.saju.kariLunarSource.lunDay}일
                  {data.saju.kariLunarSource.lunSecha && ` · 세차 ${data.saju.kariLunarSource.lunSecha}`}
                  {data.saju.kariLunarSource.lunIljin && ` · 일진 ${data.saju.kariLunarSource.lunIljin}`}
                  {data.saju.kariLunarSource.solJd != null && ` · 율리우스적일 ${data.saju.kariLunarSource.solJd}`}
                </p>
              </div>
            )}
          </div>
        </LayerModal>
      )}

      <ResultChatbot resultContext={resultContext} />
    </div>
  );
}
