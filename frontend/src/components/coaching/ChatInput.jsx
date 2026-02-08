import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { getSpeechLang } from '../../utils/speech';

export default function ChatInput({ onSendMessage, disabled = false }) {
  const { t, i18n } = useTranslation();
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const speechLang = getSpeechLang(i18n.language);
  const { isListening, transcript, toggleListening, isSupported } = useVoiceInput(
    (result) => {
      setMessage(result);
    },
    { lang: speechLang }
  );
  
  useEffect(() => {
    if (transcript && !isListening) {
      setMessage(transcript);
    }
  }, [transcript, isListening]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('coaching.askQuestion')}
            className="glass-input w-full min-h-[50px] max-h-[150px] resize-none"
            rows={1}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleListening}
            disabled={!isSupported}
            className={`glass-button p-3 ${isListening ? 'bg-aurora-pink/30 animate-pulse' : ''} ${!isSupported ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={t('coaching.voiceChat')}
          >
            {isListening ? '🔴' : '🎤'}
          </button>
          
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="glass-button px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {disabled ? '전송 중...' : '전송'}
          </button>
        </div>
      </div>
    </form>
  );
}
