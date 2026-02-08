import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import LiquidBackground from '../components/ui/LiquidBackground';
import ChatMessage from '../components/coaching/ChatMessage';
import ChatInput from '../components/coaching/ChatInput';
import { generatePipelineResponse } from '../utils/aiService';
import { apiCalculateSaju } from '../utils/apiClient';
import { calculateSaju, analyzeOheng, interpretSaju } from '../utils/sajuCalculator';

const MBTI_TYPES = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];

function parseStep1(text) {
  const trimmed = text.trim();
  const dateMatch = trimmed.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  const timeMatch = trimmed.match(/(\d{1,2}):(\d{2})/);
  if (!dateMatch || !timeMatch) return null;
  const [, y, m, d] = dateMatch;
  const [, h, min] = timeMatch;
  const birthDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  const birthTime = `${h.padStart(2, '0')}:${min}`;
  return { birthDate, birthTime };
}

function parseStep2(text) {
  const trimmed = text.trim();
  const upper = trimmed.toUpperCase();
  const mbti = MBTI_TYPES.find((t) => upper.includes(t)) || (upper.match(/\b([A-Z]{4})\b/)?.[1]);
  const rest = trimmed.replace(/\b(INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b/gi, '').replace(/[,،、]\s*/, '').trim();
  const interests = rest || null;
  return { mbti: mbti || null, interests: interests || null };
}

export default function Coaching() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [collectedData, setCollectedData] = useState({});
  const [messages, setMessages] = useState(() => {
    const intro = t('coaching.intro');
    const step1 = t('coaching.step1Question');
    return [
      {
        id: 1,
        text: `${intro}\n\n${step1}`,
        isUser: false,
        timestamp: new Date(),
        logId: null,
      },
    ];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [analyzingStepIndex, setAnalyzingStepIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const nextIdRef = useRef(2);
  const nextId = () => nextIdRef.current++;

  const ANALYZING_KEYS = [
    'coaching.analyzingSaju',
    'coaching.analyzingPsych',
    'coaching.analyzingTarot',
    'coaching.analyzingMbti',
    'coaching.analyzingBirkman',
    'coaching.analyzingDark',
    'coaching.analyzingAlmost',
  ];

  const lang = (i18n.language || 'ko').split(/[-_]/)[0];
  const language = ['ko', 'en', 'ja'].includes(lang) ? lang : 'ko';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      setAnalyzingStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setAnalyzingStepIndex((prev) => (prev + 1) % ANALYZING_KEYS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isLoading]);

  const appendBotMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: nextId(),
        text,
        isUser: false,
        timestamp: new Date(),
        logId: null,
      },
    ]);
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: nextId(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (step === 1) {
        const parsed = parseStep1(text);
        if (!parsed) {
          appendBotMessage(t('coaching.step1Question'));
          setIsLoading(false);
          return;
        }
        setCollectedData((prev) => ({ ...prev, ...parsed }));
        setStep(2);
        appendBotMessage(t('coaching.step2Question'));
      } else if (step === 2) {
        const parsed = parseStep2(text);
        setCollectedData((prev) => ({ ...prev, ...parsed }));
        setStep(3);
        appendBotMessage(t('coaching.step3Question'));
      } else if (step === 3) {
        const userQuery = text.trim();
        const finalData = { ...collectedData, userQuery };
        setCollectedData(finalData);

        appendBotMessage(t('coaching.thinking'));

        const { birthDate, birthTime, mbti, interests } = finalData;
        let saju = null;
        let ohengAnalysis = null;
        let interpretation = null;

        try {
          const userTimezone = Intl.DateTimeFormat?.()?.resolvedOptions?.()?.timeZone || 'Asia/Seoul';
          const res = await apiCalculateSaju(birthDate, birthTime, userTimezone);
          if (res?.success && res?.data?.saju) {
            saju = res.data.saju;
          }
        } catch (_) {}
        if (!saju && birthDate && birthTime) {
          saju = calculateSaju(birthDate, birthTime);
        }
        if (saju) {
          ohengAnalysis = analyzeOheng(saju);
          interpretation = interpretSaju(saju, ohengAnalysis);
        }

        const userContext = {
          birthDate,
          birthTime,
          mbti: mbti || undefined,
          interests: interests || undefined,
          userSaju: interpretation ? { interpretation, ohengAnalysis, saju } : undefined,
        };

        const pipelineResult = await generatePipelineResponse({
          userQuery,
          language,
          userContext,
        });

        const responseText = typeof pipelineResult === 'object' && pipelineResult?.response != null
          ? pipelineResult.response
          : String(pipelineResult);
        const sourcesUsed = typeof pipelineResult === 'object' && Array.isArray(pipelineResult?.sourcesUsed)
          ? pipelineResult.sourcesUsed
          : [];

        appendBotMessage(language === 'ko' ? '분석이 완료되었습니다. 결과 페이지로 이동합니다.' : language === 'ja' ? '分析が完了しました。結果ページへ移動します。' : 'Analysis complete. Redirecting to results.');

        navigate('/result', {
          state: {
            saju,
            ohengAnalysis,
            interpretation,
            response: responseText,
            sourcesUsed,
          },
        });
      }
    } catch (error) {
      console.error('Coaching/Pipeline error:', error);
      const errMsg = error?.userMessage || error?.message || t('common.error');
      appendBotMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <LiquidBackground />

      <div className="container mx-auto px-4 pt-32 pb-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-8">
            {t('coaching.title')}
          </h1>

          <GlassCard className="p-6 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                />
              ))}
              {isLoading && (
                <motion.div
                  key={analyzingStepIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-glass-dark/80 border border-white/10"
                >
                  <span className="text-2xl animate-pulse flex-shrink-0">🔮</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-aurora-purple/90 font-medium mb-0.5">
                      {t('coaching.thinking')}
                    </p>
                    <p className="text-white/90 text-[15px] leading-relaxed">
                      {t(ANALYZING_KEYS[analyzingStepIndex])}
                    </p>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </GlassCard>

          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
