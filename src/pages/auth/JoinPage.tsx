import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { ASSETS } from '../../utils/assets';
import { Logo } from '../../components/navigation/Logo';
import { useAuth } from '../../context/AuthContext';

export const JoinPage: React.FC = () => {
  const navigate = useNavigate();
  const { submitJoinRequest } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('3rd Year');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim().toLowerCase().endsWith('@saveetha.ac.in') && !email.toLowerCase().includes('saveetha')) {
      setError('Please use your official Saveetha college email address (@saveetha.ac.in).');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitJoinRequest({
        name,
        email,
        rollNumber,
        department,
        year,
        reason,
      });
      if (result.membership.status === 'REJECTED') {
        navigate('/application-rejected', { replace: true });
      } else if (result.membership.status === 'SUSPENDED') {
        navigate('/account-suspended', { replace: true });
      } else if (result.membership.status === 'APPROVED') {
        navigate(result.profile.academicProfileCompleted ? '/discover' : '/setup-profile', { replace: true });
      } else {
        navigate('/pending-approval', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit membership request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col lg:flex-row text-[#202124]">
      {/* Left Illustration Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#FFF0F1] to-white p-12 flex-col justify-between border-r border-[#EEEEEE]">
        <div>
          <Logo size="lg" />
        </div>

        <div className="my-auto py-12 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EEEEEE] text-xs font-bold text-[#E63946] shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join Saveetha Maker Community</span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-[#202124] leading-tight">
            Collaborate on breakthrough campus innovations.
          </h2>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#EEEEEE] h-80">
            <img src={ASSETS.joinSideIllustration} alt="Student Collaboration" className="w-full h-full object-cover" />
          </div>
        </div>

        <p className="text-xs text-[#777777]">© 2026 IDEA Lab, Saveetha Engineering College.</p>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <Link to="/welcome" className="inline-flex items-center gap-2 text-xs font-semibold text-[#777777] hover:text-[#202124] ml-auto">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="max-w-lg w-full mx-auto my-auto space-y-6 py-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-[#202124]">Request to Join IDEA Lab</h1>
            <p className="text-xs text-[#777777]">Register your student membership for Saveetha Engineering College.</p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Rahul Kumar"
                  className="w-full bg-white border border-[#EEEEEE] rounded-xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                  Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g., SEC2024101"
                  className="w-full bg-white border border-[#EEEEEE] rounded-xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946] shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                Saveetha College Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@saveetha.ac.in"
                className="w-full bg-white border border-[#EEEEEE] rounded-xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946] shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white border border-[#EEEEEE] rounded-xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946] shadow-sm"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication Engg">Electronics & Communication Engg</option>
                  <option value="Electrical & Electronics Engg">Electrical & Electronics Engg</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Biomedical Engineering">Biomedical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                  Academic Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-white border border-[#EEEEEE] rounded-xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946] shadow-sm"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                Why do you want to join IDEA Lab?
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe your interest in hardware, AI, or building campus projects..."
                className="w-full bg-white border border-[#EEEEEE] rounded-xl px-4 py-3 text-xs text-[#202124] focus:outline-none focus:border-[#E63946] shadow-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#E63946] hover:bg-[#d62839] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-[#E63946]/25 transition-all text-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#777777]">
            Already have an active account?{' '}
            <Link to="/login" className="text-[#E63946] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        <div className="text-xs text-[#777777] text-center lg:text-left">
          Faculty coordinator review typically takes 24 hours.
        </div>
      </div>
    </div>
  );
};
