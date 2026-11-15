import React from 'react';
import { ASSETS } from '../../utils/assets';

export type IdeaLabLogoVariant = 'header' | 'compact' | 'auth' | 'splash';

interface IdeaLabLogoProps {
  variant?: IdeaLabLogoVariant;
  className?: string;
  alt?: string;
}

const VARIANT_IMAGE_CLASSES: Record<IdeaLabLogoVariant, string> = {
  header: 'w-full h-auto object-contain object-left select-none',
  compact: 'w-[155px] h-auto object-contain shrink-0 select-none',
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
          width={914}
          height={273}
          draggable={false}
          className={VARIANT_IMAGE_CLASSES.splash}
        />
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <>
        {/* Preserve existing mobile navbar logo untouched */}
        <div
          className={`flex sm:hidden items-center justify-start shrink-0 overflow-hidden w-[170px] ${className}`}
        >
          <img
            src={ASSETS.ideaLabLogo}
            alt={alt}
            width={914}
            height={273}
            draggable={false}
            className={VARIANT_IMAGE_CLASSES.header}
          />
        </div>

        {/* Tablet & Desktop navbar logo: prominent, centered, contained within existing navbar height */}
        <div
          className={`hidden sm:flex items-center justify-center shrink-0 overflow-hidden px-1 sm:w-[205px] sm:h-[58px] lg:w-[176px] lg:h-[52px] min-[1150px]:w-[220px] min-[1150px]:h-[62px] xl:w-[254px] xl:h-[65px] min-[1400px]:w-[272px] min-[1400px]:h-[65px] ${className}`}
        >
          <img
            src={ASSETS.ideaLabLogo}
            alt={alt}
            width={914}
            height={273}
            draggable={false}
            className="w-full h-full object-contain object-center select-none"
          />
        </div>
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        {/* Preserve mobile compact logo */}
        <img
          src={ASSETS.ideaLabLogo}
          alt={alt}
          width={914}
          height={273}
          draggable={false}
          className={`sm:hidden ${VARIANT_IMAGE_CLASSES.compact} ${className}`}
        />

        {/* Desktop compact navbar logo */}
        <div
          className={`hidden sm:flex items-center justify-center shrink-0 overflow-hidden px-1 sm:w-[185px] sm:h-[50px] lg:w-[210px] lg:h-[56px] ${className}`}
        >
          <img
            src={ASSETS.ideaLabLogo}
            alt={alt}
            width={914}
            height={273}
            draggable={false}
            className="w-full h-full object-contain object-center select-none"
          />
        </div>
      </>
    );
  }

  return (
    <img
      src={ASSETS.ideaLabLogo}
      alt={alt}
      width={914}
      height={273}
      draggable={false}
      className={`${VARIANT_IMAGE_CLASSES[variant]} ${className}`}
    />
  );
};
