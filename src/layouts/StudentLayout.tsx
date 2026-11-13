import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/navigation/Sidebar';
import { TopNav } from '../components/navigation/TopNav';
import { MobileBottomNav } from '../components/navigation/MobileBottomNav';
import { Sparkles, X, Plus } from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'project' | 'idea'>('project');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AI / ML');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Successfully submitted new ${createType}: "${title}"!`);
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex text-[#202124] font-sans selection:bg-[#FFF0F1] selection:text-[#E63946]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <TopNav onOpenCreateIdea={() => { setCreateType('idea'); setShowCreateModal(true); }} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Create Modal (Project or Idea) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EEEEEE] relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-[#777777] hover:text-[#202124] p-1 rounded-xl bg-[#FAFAFA]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center font-bold">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#202124]">
                  {createType === 'project' ? 'Publish Campus Project' : 'Submit Innovation Idea'}
                </h3>
                <p className="text-xs text-[#777777]">Share your innovation with the Saveetha IDEA Lab community</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={createType === 'project' ? 'e.g., Smart Solar Bin' : 'e.g., Campus EV Charging Network'}
                  className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl px-4 py-2.5 text-sm text-[#202124] focus:outline-none focus:border-[#E63946]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl px-4 py-2.5 text-sm text-[#202124] focus:outline-none focus:border-[#E63946]"
                >
                  <option value="AI / ML">AI / ML</option>
                  <option value="IoT & Hardware">IoT & Hardware</option>
                  <option value="Web & Mobile">Web & Mobile</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Sustainability">Sustainability</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem, solution, and tech stack..."
                  className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl px-4 py-2.5 text-sm text-[#202124] focus:outline-none focus:border-[#E63946] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EEEEEE]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#777777] hover:bg-[#FAFAFA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#E63946] hover:bg-[#d62839] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#E63946]/20 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
