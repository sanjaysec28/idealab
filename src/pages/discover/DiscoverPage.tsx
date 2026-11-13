import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Flame, Trophy, Calendar, Users, FolderKanban, Star } from 'lucide-react';
import { PROJECTS } from '../../data/projects';
import { EVENTS } from '../../data/events';
import { MEMBERS } from '../../data/members';
import { ASSETS } from '../../utils/assets';

export const DiscoverPage: React.FC = () => {
  const featuredProjects = PROJECTS.filter((p) => p.featured);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#E63946] to-[#d62839] text-white p-8 lg:p-12 shadow-xl shadow-[#E63946]/10">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 hidden md:block">
          <img src={ASSETS.campus.ideaLabInterior} alt="IDEA Lab" className="w-full h-full object-cover mix-blend-overlay" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Saveetha Engineering College • IDEA Lab</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
            Innovate. Build. Collaborate.
          </h1>
          <p className="text-sm lg:text-base text-white/90 leading-relaxed">
            Welcome back, Ananya! Explore breakthrough student innovations, join upcoming hardware & AI workshops, and connect with 70 registered campus makers.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/projects"
              className="px-5 py-2.5 bg-white text-[#E63946] rounded-xl text-xs font-bold hover:bg-[#FAFAFA] transition-all shadow-md flex items-center gap-2"
            >
              <FolderKanban className="w-4 h-4" />
              <span>Explore Projects</span>
            </Link>
            <Link
              to="/events"
              className="px-5 py-2.5 bg-white/15 backdrop-blur-md hover:bg-white/25 text-white rounded-xl text-xs font-semibold transition-all border border-white/20 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>View Workshops</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#202124]">70</p>
            <p className="text-xs text-[#777777]">Registered Members</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#32B878]/10 text-[#32B878] flex items-center justify-center font-bold">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#202124]">{PROJECTS.length}</p>
            <p className="text-xs text-[#777777]">Campus Projects</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#202124]">{EVENTS.length}</p>
            <p className="text-xs text-[#777777]">Upcoming Events</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-[#202124]">850</p>
            <p className="text-xs text-[#777777]">Your Innovator Points</p>
          </div>
        </div>
      </div>

      {/* Featured Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#E63946]" />
            <h2 className="text-xl font-bold text-[#202124]">Trending Campus Projects</h2>
          </div>
          <Link to="/projects" className="text-xs font-semibold text-[#E63946] hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-3xl border border-[#EEEEEE] shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col">
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#202124] text-[10px] font-bold px-3 py-1 rounded-full border border-[#EEEEEE]">
                  {project.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-[#202124] line-clamp-1">{project.title}</h3>
                  <p className="text-xs text-[#777777] line-clamp-2">{project.tagline}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#EEEEEE]">
                  <div className="flex items-center gap-2">
                    <img src={project.authorAvatar} alt={project.authorName} className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-xs font-medium text-[#202124]">{project.authorName}</span>
                  </div>
                  <span className="text-xs font-bold text-[#E63946] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {project.likesCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events & Leaderboard Teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events Teaser */}
        <div className="bg-white rounded-3xl border border-[#EEEEEE] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#202124]">Upcoming Workshops & Hackathons</h3>
            <Link to="/events" className="text-xs font-semibold text-[#E63946] hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {EVENTS.slice(0, 2).map((event) => (
              <div key={event.id} className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#EEEEEE] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#E63946] uppercase tracking-wider">{event.category}</span>
                  <h4 className="font-semibold text-sm text-[#202124]">{event.title}</h4>
                  <p className="text-xs text-[#777777]">{event.date} • {event.location}</p>
                </div>
                <Link to="/events" className="px-4 py-2 bg-white border border-[#EEEEEE] rounded-xl text-xs font-semibold text-[#202124] hover:bg-[#E63946] hover:text-white transition-all shrink-0">
                  Join
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Top Innovators Teaser */}
        <div className="bg-white rounded-3xl border border-[#EEEEEE] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#202124]">Top Campus Innovators</h3>
            <Link to="/leaderboard" className="text-xs font-semibold text-[#E63946] hover:underline">Full Leaderboard</Link>
          </div>
          <div className="space-y-3">
            {MEMBERS.slice(0, 3).map((member, idx) => (
              <div key={member.id} className="p-3 rounded-2xl bg-[#FAFAFA] border border-[#EEEEEE] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-[#E63946] w-5 text-center">#{idx + 1}</span>
                  <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-semibold text-xs text-[#202124]">{member.name}</h4>
                    <p className="text-[10px] text-[#777777]">{member.department}</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#202124] bg-white px-3 py-1.5 rounded-xl border border-[#EEEEEE]">
                  {member.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
