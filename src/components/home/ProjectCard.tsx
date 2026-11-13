import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { PublishedProject } from '../../services/homeDataService';
import { SafeMediaImage } from './SafeMediaImage';

interface ProjectCardProps {
  project: PublishedProject;
  isBookmarked: boolean;
  onToggleBookmark: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isBookmarked,
  onToggleBookmark,
}) => {
  const contributors =
    project.teamMembers.length > 0
      ? project.teamMembers
      : [{ name: project.creatorName, avatar: project.creatorAvatar }];
  const visibleContributors = contributors.slice(0, 3);
  const extraCount = Math.max(0, contributors.length - visibleContributors.length);

  return (
    <article className="bg-[#FAF8F5]/65 hover:bg-white rounded-2xl border border-[#EAE6E1] overflow-hidden transition-all hover:shadow-sm flex flex-col">
      <Link to="/projects" className="relative block aspect-[16/10] overflow-hidden bg-[#F2ECE3] group">
        <SafeMediaImage
          src={project.coverImage}
          alt={project.title}
          fallbackLabel={project.title}
          lazy
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-bold text-[#202124] shadow-xs border border-[#EAE6E1]">
          {project.category}
        </span>
      </Link>

      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link
            to="/projects"
            className="block text-sm font-bold text-[#202124] hover:text-[#E63946] transition-colors line-clamp-1"
          >
            {project.title}
          </Link>
          <p className="mt-1 text-[11.5px] text-[#777777] leading-relaxed line-clamp-2">
            {project.tagline || project.description}
          </p>
          {project.tags.length > 0 && (
            <p className="mt-1.5 text-[10.5px] font-medium text-[#777777] truncate">
              {project.tags.slice(0, 3).join(' · ')}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#EAE6E1]/70">
          <div className="flex items-center min-w-0">
            <div className="flex -space-x-1.5 shrink-0">
              {visibleContributors.map((member, idx) => (
                <SafeMediaImage
                  key={`${project.id}-av-${idx}`}
                  src={member.avatar || ''}
                  alt={member.name}
                  variant="avatar"
                  lazy
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-white text-[9px]"
                />
              ))}
            </div>
            {extraCount > 0 ? (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#FFF0F1] text-[10px] font-bold text-[#E63946] tabular-nums">
                +{extraCount}
              </span>
            ) : (
              <span className="ml-2 text-[11px] font-medium text-[#555555] truncate">
                {project.creatorName}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleBookmark(project.id)}
            aria-label={isBookmarked ? `Remove ${project.title} bookmark` : `Bookmark ${project.title}`}
            aria-pressed={isBookmarked}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              isBookmarked
                ? 'bg-[#FFF0F1] text-[#E63946]'
                : 'text-[#777777] hover:text-[#202124] hover:bg-[#FAF8F5]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
};
