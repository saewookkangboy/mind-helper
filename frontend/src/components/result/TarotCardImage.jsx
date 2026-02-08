import { useState } from 'react';

/**
 * 생성 결과에 최적화된 타로 카드 이미지
 * - 로딩 스켈레톤, 에러 시 플레이스홀더
 * - decoding="async", loading="lazy"로 CLS·성능 최적화
 */
export default function TarotCardImage({
  card,
  size = 'modal',
  showLabel = true,
  reversedLabel = 'Reversed',
  className = '',
}) {
  const { id, name, imageUrl, reversed, meaningShort, position } = card || {};
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const isThumb = size === 'thumb';
  const aspectClass = isThumb ? 'aspect-[3/4]' : 'aspect-[3/4]';
  const imgClass = 'w-full h-full object-contain';

  return (
    <div className={`rounded-xl bg-white/5 border border-white/10 overflow-hidden ${className}`}>
      <div className={`${aspectClass} bg-aurora-purple/10 flex items-center justify-center relative min-h-[80px]`}>
        {!imageUrl || error ? (
          <span className="text-4xl text-white/40" aria-hidden>🃏</span>
        ) : (
          <>
            {!loaded && (
              <div className="absolute inset-0 animate-pulse bg-white/5" aria-hidden />
            )}
            <img
              src={imageUrl}
              alt={name || ''}
              className={imgClass}
              decoding="async"
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setError(true)}
            />
          </>
        )}
      </div>
      {showLabel && (
        <div className="p-3">
          <p className="font-medium text-white/95 text-sm">
            {name}
            {reversed && (
              <span className="ml-1 text-aurora-purple/90 text-xs">({reversedLabel})</span>
            )}
          </p>
          {position && (
            <p className="text-xs text-white/70 mt-0.5">{position}</p>
          )}
          {meaningShort && !isThumb && (
            <p className="text-white/80 text-xs mt-1 line-clamp-2">{meaningShort}</p>
          )}
        </div>
      )}
    </div>
  );
}
