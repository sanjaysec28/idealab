import React, { useState } from 'react';
import { IDEAS } from '../../data/ideas';
import { Idea } from '../../types';
import { Lightbulb, ThumbsUp, Plus, Sparkles, X, Users } from 'lucide-react';

export const IdeasPage: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>(IDEAS);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [category, setCategory] = useState('IoT & Hardware');

  const handleUpvote = (id: string) => {
    setIdeas(ideas.map(i => i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i));
  };

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      title,
      problem,
      solution,
      category,
      authorId: 'member-1',
      authorName: 'Ananya Sharma',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      upvotes: 1,
      status: 'Brainstorming',
      createdAt: 'Just now',
      tags: [category]
    };
    setIdeas([newIdea, ...ideas]);
    setShowModal(false);
    setTitle('');
    setProblem('');
    setSolution('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#202124]">Campus Innovation Ideas</h1>
          <p className="text-xs text-[#777777] mt-1">Pitch new campus problem statements and find teammates to build prototypes.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-[#E63946]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Pitch New Idea</span>
        </button>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ideas.map((idea) => (
          <div key={idea.id} className="bg-white rounded-3xl border border-[#EEEEEE] p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#E63946] bg-[#FFF0F1] px-3 py-1 rounded-full">
                  {idea.category}
                </span>
                <span className="text-[10px] font-semibold text-[#777777] bg-[#FAFAFA] px-2.5 py-1 rounded-lg border border-[#EEEEEE]">
                  {idea.status}
                </span>
              </div>

              <h3 className="font-bold text-base text-[#202124]">{idea.title}</h3>

              <div className="space-y-2 text-xs">
                <p className="text-[#777777]">
                  <strong className="text-[#202124]">Problem:</strong> {idea.problem}
                </p>
                <p className="text-[#777777]">
                  <strong className="text-[#202124]">Solution:</strong> {idea.solution}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#EEEEEE]">
              <div className="flex items-center gap-2">
                <img src={idea.authorAvatar} alt={idea.authorName} className="w-7 h-7 rounded-full object-cover" />
                <span className="text-xs font-medium text-[#202124]">{idea.authorName}</span>
              </div>

              <button
                onClick={() => handleUpvote(idea.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF0F1] text-[#E63946] hover:bg-[#E63946] hover:text-white transition-all text-xs font-bold cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{idea.upvotes} Upvotes</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pitch Idea Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EEEEEE] relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-[#777777] hover:text-[#202124] p-1 rounded-xl bg-[#FAFAFA]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#202124]">Pitch Innovation Idea</h3>
                <p className="text-xs text-[#777777]">Share your campus problem statement with the IDEA Lab community</p>
              </div>
            </div>

            <form onSubmit={handleCreateIdea} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                  Idea Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Smart Solar EV Charging Hub"
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
                  <option value="IoT & Hardware">IoT & Hardware</option>
                  <option value="AI / ML">AI / ML</option>
                  <option value="Sustainability">Sustainability</option>
                  <option value="Web & Mobile">Web & Mobile</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                  Problem Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="What campus issue does this solve?"
                  className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl px-4 py-2.5 text-sm text-[#202124] focus:outline-none focus:border-[#E63946] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5 uppercase tracking-wider">
                  Proposed Solution
                </label>
                <textarea
                  required
                  rows={2}
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="How do you plan to build this?"
                  className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl px-4 py-2.5 text-sm text-[#202124] focus:outline-none focus:border-[#E63946] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EEEEEE]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#777777] hover:bg-[#FAFAFA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#E63946] hover:bg-[#d62839] text-white rounded-xl text-xs font-semibold shadow-md shadow-[#E63946]/20 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Idea</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
