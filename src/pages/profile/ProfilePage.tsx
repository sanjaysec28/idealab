import React from 'react';
import { MEMBERS } from '../../data/members';
import { PROJECTS } from '../../data/projects';
import { ACHIEVEMENTS } from '../../data/achievements';
import { Mail, Github, Linkedin, Award, FolderKanban, Star, CheckCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const user = MEMBERS[0]; // Ananya Sharma
  const userProjects = PROJECTS.filter(p => p.authorId === user.id || p.authorName === user.name);

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-[#EEEEEE] overflow-hidden shadow-sm">
        <div className="h-48 bg-gradient-to-r from-[#E63946] to-[#d62839] relative">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <div className="px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 -mt-16 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-lg"
              />
              <div className="space-y-1 pb-2">
                <h1 className="text-2xl font-extrabold text-[#202124]">{user.name}</h1>
                <p className="text-xs text-[#777777]">{user.rollNumber} • {user.department} ({user.year})</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="px-3 py-1 bg-[#FFF0F1] text-[#E63946] text-xs font-bold rounded-full">
                    {user.badge}
                  </span>
                  <span className="px-3 py-1 bg-[#FAFAFA] text-[#202124] text-xs font-bold rounded-full border border-[#EEEEEE]">
                    {user.points} Innovator Points
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={user.github}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-[#FAFAFA] border border-[#EEEEEE] text-[#202124] hover:bg-[#202124] hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href={user.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-[#FAFAFA] border border-[#EEEEEE] text-[#202124] hover:bg-[#0A66C2] hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <p className="text-xs text-[#777777] leading-relaxed max-w-2xl">{user.bio}</p>

          <div className="flex flex-wrap gap-2 pt-4">
            {user.skills.map((skill, idx) => (
              <span key={idx} className="text-xs bg-[#FAFAFA] text-[#202124] px-3.5 py-1.5 rounded-xl border border-[#EEEEEE] font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* User's Published Projects */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#202124]">Published Projects ({userProjects.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-3xl border border-[#EEEEEE] overflow-hidden shadow-sm flex flex-col">
              <div className="relative h-44 overflow-hidden">
                <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-[#202124] text-[10px] font-bold px-3 py-1 rounded-full">
                  {project.category}
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h4 className="font-bold text-base text-[#202124]">{project.title}</h4>
                <p className="text-xs text-[#777777] line-clamp-2">{project.tagline}</p>
                <div className="flex items-center justify-between pt-3 border-t border-[#EEEEEE] text-xs font-semibold text-[#E63946]">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {project.likesCount} Likes
                  </span>
                  <span className="text-[#777777]">{project.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unlocked Achievements */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#202124]">Unlocked Badges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ACHIEVEMENTS.filter(a => a.isUnlocked).map((ach) => (
            <div key={ach.id} className="bg-white rounded-2xl border border-[#EEEEEE] p-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#202124]">{ach.title}</h4>
                <p className="text-[10px] text-[#32B878] font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3 h-3" />
                  Unlocked
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
