import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import ChatMessage from '../coaching/ChatMessage';
import { generatePipelineResponse } from '../../utils/aiService';

export default function ResultChatbot({ resultContext }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const lang = (i18n.language || 'ko').split(/[-_]/)[0];
  const language = ['ko', 'en', 'ja'].includes(lang) ? lang : 'ko';

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { id: Date.now(), text, isUser: true }]);
    setLoading(true);

    try {
      const summary = resultContext?.response?.slice(0, 500) || '';
      const userContext = {
        ...resultContext,
        resultSummary: summary,
      };
      const res = await generatePipelineResponse({
        userQuery: text,
        language,
        userContext,
      });
      const reply = typeof res === 'object' && res?.response != null ? res.response : String(res);
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: reply, isUser: false }]);
    } catch (err) {
      const errMsg = err?.userMessage || err?.message || t('common.error');
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: errMsg, isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full glass-card flex items-center justify-center text-2xl shadow-lg hover:scale-105 transition"
        aria-label={t('result.chatbotTitle')}
      >
        💬
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-end p-4 pb-24 md:pb-8 md:items-center md:justify-center"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-md max-h-[70vh] flex flex-col rounded-2xl overflow-hidden bg-gray-900/95 border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <span className="font-semibold text-white">{t('result.chatbotTitle')}</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                {messages.length === 0 && (
                  <p className="text-white/60 text-sm">{t('result.chatbotIntro')}</p>
                )}
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={m.text} isUser={m.isUser} />
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <span className="animate-pulse">🔮</span>
                    <span>{t('coaching.thinking')}</span>
                  </div>
                )}
                <div ref={endRef} />
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="p-3 border-t border-white/10 flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('result.chatbotPlaceholder')}
                  className="flex-1 glass-input text-sm py-2"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="glass-button py-2 px-4 text-sm disabled:opacity-50"
                >
                  {t('coaching.send')}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
