import React from 'react';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center rounded-xl bg-[#E63946] text-white shadow-md shadow-[#E63946]/20 ${iconSizes[size]}`}>
        <Sparkles className="w-1/2 h-1/2" />
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#32B878] rounded-full border-2 border-white" />
      </div>
      <div className="flex flex-col">
        <span className={`font-bold tracking-tight text-[#202124] ${textSizes[size]}`}>
          IDEA <span className="text-[#E63946]">LAB</span>
        </span>
        <span className="text-[10px] font-medium tracking-wider uppercase text-[#777777]">
          Saveetha Eng. College
        </span>
      </div>
    </div>
  );
};
