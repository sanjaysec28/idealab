import React from 'react';
import { ASSETS } from '../../utils/assets';

export const WorkInProgress: React.FC = () => {
  return (
    <section
      aria-label="Work in Progress"
      className="w-full max-w-xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center select-none"
    >
      {/* Suspended Hanging Sign */}
      <div className="w-full flex justify-center overflow-visible">
        <div className="idea-hanging-sign w-48 sm:w-64 md:w-72 lg:w-[300px] aspect-square flex items-start justify-center">
          <img
            src={ASSETS.workInProgress}
            alt="Work in Progress hanging sign"
            draggable={false}
            className="w-full h-full object-contain drop-shadow-[0_14px_24px_rgba(32,32,32,0.08)]"
          />
        </div>
      </div>

      {/* Subtle Coral Accent */}
      <div
        aria-hidden="true"
        className="mt-6 sm:mt-7 w-10 h-1 rounded-full bg-[#E63946]"
      />

      {/* Minimal Supporting Copy */}
      <h1 className="mt-4 text-xl sm:text-2xl lg:text-[28px] font-extrabold tracking-tight text-[#202020] text-balance">
        We&apos;re Building Something Great!
      </h1>

      <p className="mt-2.5 max-w-md text-sm sm:text-[15px] leading-relaxed text-[#5F6368] font-medium text-balance">
        This IDEA LAB section is currently under development. We&apos;re working to bring you something exciting.
      </p>
    </section>
  );
};
