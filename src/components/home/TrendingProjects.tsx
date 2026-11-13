import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, FolderKanban, TrendingUp } from 'lucide-react';
import {
  PublishedProject,
  subscribeToPublishedProjects,
} from '../../services/homeDataService';
import { ProjectCard } from './ProjectCard';

export const TrendingProjects: React.FC = () => {
  const [projects, setProjects] = useState<PublishedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const unsubscribe = subscribeToPublishedProjects(
      (items) => {
        setProjects(items.slice(0, 3));
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || 'Unable to load published projects.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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

      {error ? (
        <div
          role="alert"
          className="rounded-2xl bg-[#FFF0F1] border border-[#E63946]/25 p-4 flex items-start gap-2.5 text-xs text-[#E63946]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Could not load published projects</p>
            <p className="text-[11px] text-[#555555] mt-0.5">{error}</p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5" aria-busy="true">
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#EAE6E1] bg-[#FAF8F5]/70 overflow-hidden animate-pulse"
            >
              <div className="aspect-[16/10] bg-[#EAE6E1]/60" />
              <div className="p-3.5 space-y-2">
                <div className="h-3.5 w-3/4 rounded bg-[#EAE6E1]" />
                <div className="h-3 w-full rounded bg-[#EAE6E1]/80" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-6 text-center space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center mx-auto">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#202124]">No published projects yet</p>
            <p className="text-[11px] text-[#777777] mt-0.5">
              Published student builds and prototypes from IDEA LAB will appear here.
            </p>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#E63946] transition-colors"
          >
            <span>Start a Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isBookmarked={bookmarkedIds.includes(project.id)}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      )}
    </section>
  );
};
