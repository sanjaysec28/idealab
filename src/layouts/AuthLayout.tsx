import React from 'react';
import { Outlet } from 'react-router-dom';
import { IdeaLabLogo } from '../components/shared/IdeaLabLogo';
import { ASSETS } from '../utils/assets';
import { ShieldCheck, Sparkles, Users } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col lg:flex-row text-[#202124]">
      {/* Left Hero Panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#FFF0F1] to-white p-8 lg:p-16 flex flex-col justify-between border-r border-[#EEEEEE] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-[#E63946]/5 rounded-full blur-3xl pointer-events-none" />

        <div>
          <IdeaLabLogo variant="auth" />
        </div>

        <div className="my-auto py-12 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EEEEEE] text-xs font-semibold text-[#E63946] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Saveetha Engineering College Ecosystem</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[#202124] leading-tight">
            Innovate. Build. <span className="text-[#E63946]">Collaborate.</span>
          </h1>

          <p className="text-sm lg:text-base text-[#777777] leading-relaxed">
            Welcome to IDEA Lab — the private digital campus hub where registered student innovators discover breakthrough projects, team up for hackathons, and showcase their engineering achievements.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white p-4 rounded-2xl border border-[#EEEEEE] shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-[#202124]">70 Members</p>
                <p className="text-[11px] text-[#777777]">Active Student Makers</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EEEEEE] shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#32B878]/10 text-[#32B878] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-[#202124]">Secure Campus</p>
                <p className="text-[11px] text-[#777777]">Verified SEC Students</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-[#777777]">
          © 2026 IDEA Lab, Saveetha Engineering College. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
