import React, { useState } from 'react';
import { PROJECTS } from '../../data/projects';
import { Project } from '../../types';
import { Search, Star, Github, ExternalLink, Heart, MessageSquare, X } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const categories = ['All', 'AI / ML', 'IoT & Hardware', 'Web & Mobile', 'Robotics', 'Sustainability'];

  const filteredProjects = PROJECTS.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#202124]">Campus Innovation Projects</h1>
          <p className="text-xs text-[#777777] mt-1">Discover what fellow SEC students are building in IDEA Lab.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or tags..."
            className="w-full bg-white border border-[#EEEEEE] rounded-xl pl-10 pr-4 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#E63946] shadow-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20'
                : 'bg-white text-[#777777] border border-[#EEEEEE] hover:text-[#202124]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => setActiveProject(project)}
            className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col cursor-pointer group"
          >
            <div className="relative h-48 overflow-hidden bg-gray-100">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-[#202124] text-[10px] font-bold px-3 py-1 rounded-full border border-[#EEEEEE]">
                {project.category}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-base text-[#202124] group-hover:text-[#E63946] transition-colors line-clamp-1">
                  {project.title}
                </h3>
                <p className="text-xs text-[#777777] line-clamp-2">{project.tagline}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {project.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-[10px] bg-[#FAFAFA] text-[#777777] px-2.5 py-1 rounded-lg border border-[#EEEEEE]">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#EEEEEE]">
                <div className="flex items-center gap-2">
                  <img src={project.authorAvatar} alt={project.authorName} className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs font-medium text-[#202124] line-clamp-1">{project.authorName}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#777777]">
                  <span className="flex items-center gap-1 font-semibold text-[#E63946]">
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    {project.likesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {project.commentsCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      {activeProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 lg:p-8 shadow-2xl border border-[#EEEEEE] relative">
            <button
              onClick={() => setActiveProject(null)}
              className="absolute top-5 right-5 text-[#777777] hover:text-[#202124] p-1.5 rounded-xl bg-[#FAFAFA]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="relative h-64 rounded-2xl overflow-hidden bg-gray-100">
                <img src={activeProject.thumbnail} alt={activeProject.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-[#202124] text-xs font-bold px-3 py-1 rounded-full border border-[#EEEEEE]">
                  {activeProject.category}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-[#202124]">{activeProject.title}</h2>
                <p className="text-sm font-medium text-[#777777]">{activeProject.tagline}</p>
              </div>

              <div className="flex items-center justify-between py-3 border-y border-[#EEEEEE]">
                <div className="flex items-center gap-3">
                  <img src={activeProject.authorAvatar} alt={activeProject.authorName} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <p className="text-xs font-semibold text-[#202124]">{activeProject.authorName}</p>
                    <p className="text-[10px] text-[#777777]">Project Lead • Posted {activeProject.createdAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {activeProject.githubUrl && (
                    <a
                      href={activeProject.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-[#FAFAFA] border border-[#EEEEEE] text-[#202124] hover:bg-[#202124] hover:text-white transition-colors"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {activeProject.liveUrl && (
                    <a
                      href={activeProject.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-[#FFF0F1] text-[#E63946] hover:bg-[#E63946] hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-[#202124] uppercase tracking-wider">About Project</h4>
                <p className="text-xs text-[#777777] leading-relaxed">{activeProject.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-[#202124] uppercase tracking-wider">Tech Stack & Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {activeProject.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-[#FAFAFA] text-[#202124] px-3 py-1 rounded-xl border border-[#EEEEEE] font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
