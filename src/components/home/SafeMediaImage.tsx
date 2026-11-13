import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface SafeMediaImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  fallbackInitials?: string;
  lazy?: boolean;
  variant?: 'cover' | 'avatar';
}

export const SafeMediaImage: React.FC<SafeMediaImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
  fallbackInitials,
  lazy = false,
  variant = 'cover',
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    if (variant === 'avatar') {
      const initials =
        fallbackInitials ||
        alt
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() ?? '')
          .join('') ||
        'IL';

      return (
        <div
          aria-label={alt}
          className={`flex items-center justify-center bg-[#FFF0F1] text-[#E63946] font-bold select-none ${className}`}
        >
          <span>{initials}</span>
        </div>
      );
    }

    return (
      <div
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#FFF0F1] via-[#FAF8F5] to-[#F3EDE4] text-[#777777] p-3 text-center select-none ${className}`}
      >
        <ImageOff className="w-5 h-5 text-[#E63946]/70" />
        {fallbackLabel && (
          <span className="text-[11px] font-semibold text-[#555555] line-clamp-1">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={lazy ? 'lazy' : undefined}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
