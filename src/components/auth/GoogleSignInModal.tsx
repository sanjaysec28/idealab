import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, Clock, Ban, ShieldAlert, AlertTriangle } from 'lucide-react';
import { GoogleSignInOptions } from '../../types/auth';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (options: GoogleSignInOptions) => Promise<void>;
  isSubmitting?: boolean;
}

interface PresetAccount {
  label: string;
  subtitle: string;
  email: string;
  displayName: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
}

const PRESET_ACCOUNTS: PresetAccount[] = [
  {
    label: 'Ananya Sharma',
    subtitle: 'ananya.sec2024101@saveetha.ac.in',
    email: 'ananya.sec2024101@saveetha.ac.in',
    displayName: 'Ananya Sharma',
    badge: 'Approved',
    badgeColor: 'bg-[#32B878]/10 text-[#32B878]',
    icon: <CheckCircle2 className="w-4 h-4 text-[#32B878]" />,
  },
  {
    label: 'Karthik Subramanian',
    subtitle: 'karthik.sec2024205@saveetha.ac.in',
    email: 'karthik.sec2024205@saveetha.ac.in',
    displayName: 'Karthik Subramanian',
    badge: 'Needs Profile',
    badgeColor: 'bg-amber-50 text-amber-700',
    icon: <CheckCircle2 className="w-4 h-4 text-amber-600" />,
  },
  {
    label: 'Rohan Venkatesh',
    subtitle: 'rohan.pending@saveetha.ac.in',
    email: 'rohan.pending@saveetha.ac.in',
    displayName: 'Rohan Venkatesh',
    badge: 'Pending',
    badgeColor: 'bg-[#FFF0F1] text-[#E63946]',
    icon: <Clock className="w-4 h-4 text-[#E63946]" />,
  },
  {
    label: 'Meera Nair',
    subtitle: 'meera.rejected@saveetha.ac.in',
    email: 'meera.rejected@saveetha.ac.in',
    displayName: 'Meera Nair',
    badge: 'Rejected',
    badgeColor: 'bg-red-50 text-red-700',
    icon: <Ban className="w-4 h-4 text-red-600" />,
  },
  {
    label: 'Vikram Sundar',
    subtitle: 'vikram.suspended@saveetha.ac.in',
    email: 'vikram.suspended@saveetha.ac.in',
    displayName: 'Vikram Sundar',
    badge: 'Suspended',
    badgeColor: 'bg-orange-50 text-orange-700',
    icon: <ShieldAlert className="w-4 h-4 text-orange-600" />,
  },
];

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  isSubmitting = false,
}) => {
  const [customEmail, setCustomEmail] = useState('arjun.sec2025042@saveetha.ac.in');
  const [customName, setCustomName] = useState('Arjun Kumar');
  const [simulateNotifFailure, setSimulateNotifFailure] = useState(false);

  if (!isOpen) return null;

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    await onSelectAccount({
      email: customEmail.trim(),
      displayName: customName.trim() || undefined,
      simulateNotificationFailure: simulateNotifFailure,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-signin-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EEEEEE] space-y-5 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close Google Sign-In"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAFAFA] hover:bg-[#EEEEEE] flex items-center justify-center text-[#777777] hover:text-[#202124] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-[#FAFAFA] border border-[#EEEEEE] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.45-2.68z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <div>
            <h2 id="google-signin-modal-title" className="text-base font-extrabold text-[#202124]">
              Choose a Google Account
            </h2>
            <p className="text-[11px] text-[#777777]">
              Sign in with your Saveetha Google identity to verify membership
            </p>
          </div>
        </div>

        {/* New Student Google Account Form */}
        <form onSubmit={handleCustomSubmit} className="p-3.5 rounded-2xl bg-[#FAF8F3] border border-[#EEEEEE] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#202124] flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-[#E63946]" />
              New or Custom Google Student
            </span>
            <span className="text-[10px] font-semibold text-[#777777]">Creates PENDING request</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Student Name"
              className="bg-white border border-[#EEEEEE] rounded-xl px-3 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#E63946]"
            />
            <input
              type="email"
              required
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="student@saveetha.ac.in"
              className="bg-white border border-[#EEEEEE] rounded-xl px-3 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#E63946]"
            />
          </div>
          <label className="flex items-center gap-2 text-[11px] text-[#777777] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={simulateNotifFailure}
              onChange={(e) => setSimulateNotifFailure(e.target.checked)}
              className="rounded border-[#EEEEEE] text-[#E63946] focus:ring-[#E63946]"
            />
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span>Simulate WhatsApp notification failure (for retry check)</span>
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying Membership...' : 'Continue with This Google Account'}
          </button>
        </form>

        {/* Existing Seeded Accounts */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] px-1">
            Existing Campus Accounts
          </p>
          <div className="divide-y divide-[#EEEEEE] border border-[#EEEEEE] rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
            {PRESET_ACCOUNTS.map((acct) => (
              <button
                key={acct.email}
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  onSelectAccount({
                    email: acct.email,
                    displayName: acct.displayName,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-white hover:bg-[#FAFAFA] transition-colors flex items-center justify-between gap-2 text-left cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#EEEEEE] flex items-center justify-center shrink-0">
                    {acct.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#202124] truncate">{acct.label}</p>
                    <p className="text-[10px] text-[#777777] truncate">{acct.subtitle}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${acct.badgeColor}`}
                >
                  {acct.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
