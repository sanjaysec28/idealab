import React, { useState } from 'react';
import { Bell, Shield, User, Sparkles, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [workshopReminders, setWorkshopReminders] = useState(true);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-[#202124]">IDEA Lab Settings</h1>
        <p className="text-xs text-[#777777] mt-1">Manage your notification preferences and student profile configurations.</p>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-2xl bg-[#32B878]/10 border border-[#32B878]/30 text-[#32B878] text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-3xl border border-[#EEEEEE] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EEEEEE]">
            <Bell className="w-5 h-5 text-[#E63946]" />
            <h3 className="font-bold text-base text-[#202124]">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-semibold text-xs text-[#202124]">Email Notifications for New Projects</p>
                <p className="text-[10px] text-[#777777]">Receive weekly digest of top student innovations</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="w-4 h-4 text-[#E63946] rounded border-[#EEEEEE] focus:ring-[#E63946]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-semibold text-xs text-[#202124]">Workshop & Hackathon Reminders</p>
                <p className="text-[10px] text-[#777777]">Get notified 24 hours before registered events</p>
              </div>
              <input
                type="checkbox"
                checked={workshopReminders}
                onChange={(e) => setWorkshopReminders(e.target.checked)}
                className="w-4 h-4 text-[#E63946] rounded border-[#EEEEEE] focus:ring-[#E63946]"
              />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#EEEEEE] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-[#EEEEEE]">
            <Shield className="w-5 h-5 text-[#E63946]" />
            <h3 className="font-bold text-base text-[#202124]">Account Security & Privacy</h3>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-[#777777]">
              Your account is authenticated with Firebase Email/Password authentication.
            </p>
            <div className="p-3 rounded-2xl bg-[#FAFAFA] border border-[#EEEEEE] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#202124]">Email Verification</span>
              <span className="text-[10px] font-bold text-[#32B878] bg-[#32B878]/10 px-2.5 py-1 rounded-full">Verified</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-[#E63946] hover:bg-[#d62839] text-white rounded-2xl text-xs font-bold shadow-lg shadow-[#E63946]/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
