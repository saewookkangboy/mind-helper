import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import LiquidBackground from '../components/ui/LiquidBackground';
import ChatMessage from '../components/coaching/ChatMessage';
import ChatInput from '../components/coaching/ChatInput';
import { generateCoachingResponse } from '../utils/aiService';
import { logSajuConsultation, updateUserFeedback } from '../utils/firestoreLogger';
import { useAuthStore } from '../store/useAuthStore';

export default function Coaching() {
  const { t, i18n } = useTranslation();
  const { user, isGuest } = useAuthStore();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '안녕하세요! 저는 당신의 영적 라이프 코치입니다. 무엇이 궁금하신가요?',
      isUser: false,
      timestamp: new Date(),
      logId: null,
    },
  ]);
  const [selectedCategory, setSelectedCategory] = useState('today');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // 사용자 정보 가져오기
  const userSaju = JSON.parse(localStorage.getItem('userSaju') || 'null');
  const userInfo = userSaju?.userInfo || {};

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    // 사용자 메시지 추가
    const userMessage = {
      id: Date.now(),
      text,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // AI 응답 생성
      // 언어 코드 정규화 (ko-KR -> ko, en-US -> en) 후 API 전달
      const lang = (i18n.language || 'ko').split(/[-_]/)[0];
      const language = ['ko', 'en', 'ja'].includes(lang) ? lang : 'ko';

      const aiResponseText = await generateCoachingResponse({
        userQuery: text,
        queryType: selectedCategory,
        userSaju: userSaju?.saju ? {
          ...userSaju.saju,
          ohengAnalysis: userSaju.ohengAnalysis,
          interpretation: userSaju.interpretation,
        } : null,
        language,
        mbti: userInfo.mbti,
        interests: userInfo.interests,
      });

      const aiResponse = {
        id: Date.now() + 1,
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
        logId: null,
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Firestore에 로그 저장
      try {
        const userId = user?.uid || `guest_${Date.now()}`;
        const inputType = 'text';
        const logId = await logSajuConsultation({
          userId,
          queryType: selectedCategory,
          inputType,
          userQuery: text,
          aiResponse: aiResponseText,
        });
        
        // 메시지에 logId 추가
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiResponse.id ? { ...msg, logId } : msg
          )
        );
      } catch (error) {
        console.error('로그 저장 실패:', error);
      }
    } catch (error) {
      console.error('AI 응답 생성 실패:', error);
      const userText =
        error.userMessage ||
        error.message ||
        '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
      const errorMessage = {
        id: Date.now() + 1,
        text: userText,
        isUser: false,
        timestamp: new Date(),
        logId: null,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId, feedback) => {
    const message = messages.find((m) => m.id === messageId);
    if (message?.logId) {
      try {
        await updateUserFeedback(message.logId, feedback);
        // UI 업데이트
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, feedback } : m
          )
        );
      } catch (error) {
        console.error('피드백 저장 실패:', error);
      }
    }
  };

  const categories = [
    { id: 'today', label: t('coaching.today'), icon: '📅' },
    { id: 'career', label: t('coaching.career'), icon: '💼' },
    { id: 'love', label: t('coaching.love'), icon: '💕' },
  ];

  return (
    <div className="min-h-screen relative">
      <LiquidBackground />
      
      <div className="container mx-auto px-4 pt-32 pb-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-8">
            {t('coaching.title')}
          </h1>

          {/* 카테고리 선택 */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`glass-card px-6 py-3 whitespace-nowrap flex items-center gap-2 transition-all ${
                  selectedCategory === category.id
                    ? 'bg-aurora-purple/30 border-2 border-aurora-purple'
                    : ''
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* 채팅 영역 */}
          <GlassCard className="p-6 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  onFeedback={(feedback) => handleFeedback(message.id, feedback)}
                />
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-white/70"
                >
                  <span className="animate-pulse">🔮</span>
                  <span>생각 중...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </GlassCard>

          {/* 입력 영역 */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
