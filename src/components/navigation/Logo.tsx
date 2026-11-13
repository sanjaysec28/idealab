import React from 'react';
import { IdeaLabLogo, IdeaLabLogoVariant } from '../shared/IdeaLabLogo';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_TO_VARIANT: Record<NonNullable<LogoProps['size']>, IdeaLabLogoVariant> = {
  sm: 'compact',
  md: 'header',
  lg: 'auth',
};

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  return <IdeaLabLogo variant={SIZE_TO_VARIANT[size]} className={className} />;
};
