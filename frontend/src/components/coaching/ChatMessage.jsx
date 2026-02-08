import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';

export default function ChatMessage({ message, isUser = false, onFeedback }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[80%] md:max-w-[70%] ${isUser ? 'order-2' : ''}`}>
        <GlassCard className={`p-4 ${isUser ? 'bg-aurora-purple/20' : ''}`}>
          <div className="flex items-start gap-3">
            {!isUser && (
              <div className="text-2xl flex-shrink-0">🔮</div>
            )}
            <div className="flex-1">
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {message}
              </p>
              {!isUser && onFeedback && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onFeedback('positive')}
                    className="text-sm px-3 py-1 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition"
                    title="좋아요"
                  >
                    👍 좋아요
                  </button>
                  <button
                    onClick={() => onFeedback('negative')}
                    className="text-sm px-3 py-1 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition"
                    title="아니요"
                  >
                    👎 아니요
                  </button>
                </div>
              )}
            </div>
            {isUser && (
              <div className="text-2xl flex-shrink-0">👤</div>
            )}
          </div>
        </GlassCard>
        <div className={`text-xs text-white/50 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}
