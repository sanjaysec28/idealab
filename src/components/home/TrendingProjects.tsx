import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { HOME_DEMO_PROJECTS } from '../../data/homeDemoData';
import { ProjectCard } from './ProjectCard';

export const TrendingProjects: React.FC = () => {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const handleToggleBookmark = (projectId: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  return (
    <section className="bg-white rounded-[22px] border border-[#EAE6E1] shadow-[0_2px_12px_rgba(32,33,36,0.03)] p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4.5 h-4.5 text-[#E63946]" />
          <h2 className="text-[15px] font-bold text-[#202124]">Trending Projects</h2>
        </div>

        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#E63946] hover:underline shrink-0"
        >
          <span>See All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {HOME_DEMO_PROJECTS.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isBookmarked={bookmarkedIds.includes(project.id)}
            onToggleBookmark={handleToggleBookmark}
          />
        ))}
      </div>
    </section>
  );
};
