import React from 'react';
import { ASSETS } from '../../utils/assets';

export type IdeaLabLogoVariant = 'header' | 'compact' | 'auth' | 'splash';

interface IdeaLabLogoProps {
  variant?: IdeaLabLogoVariant;
  className?: string;
  alt?: string;
}

const VARIANT_IMAGE_CLASSES: Record<IdeaLabLogoVariant, string> = {
  header: 'w-[170px] sm:w-[215px] lg:w-[245px] h-auto object-contain shrink-0 select-none',
  compact: 'w-[155px] sm:w-[185px] lg:w-[205px] h-auto object-contain shrink-0 select-none',
  auth: 'w-[185px] sm:w-[220px] lg:w-[245px] h-auto object-contain shrink-0 select-none',
  splash: 'w-[235px] sm:w-[310px] md:w-[350px] h-auto object-contain shrink-0 select-none',
};

export const IdeaLabLogo: React.FC<IdeaLabLogoProps> = ({
  variant = 'header',
  className = '',
  alt = 'IDEA LAB — AICTE · Saveetha Engineering College',
}) => {
  if (variant === 'splash') {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white rounded-3xl px-7 py-5 sm:px-10 sm:py-7 shadow-[0_20px_60px_rgba(0,0,0,0.22)] ${className}`}
      >
        <img
          src={ASSETS.ideaLabLogo}
          alt={alt}
          width={1092}
          height={228}
          draggable={false}
          className={VARIANT_IMAGE_CLASSES.splash}
        />
      </div>
    );
  }

  return (
    <img
      src={ASSETS.ideaLabLogo}
      alt={alt}
      width={1092}
      height={228}
      draggable={false}
      className={`${VARIANT_IMAGE_CLASSES[variant]} ${className}`}
    />
  );
};
