import React, { useState } from 'react';
import { MEMBERS } from '../../data/members';
import { Member } from '../../types';
import { Search, Mail, Github, Linkedin, Award, X } from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const departments = [
    'All',
    'Computer Science & Engineering',
    'Artificial Intelligence & Data Science',
    'Information Technology',
    'Electronics & Communication Engg'
  ];

  const filteredMembers = MEMBERS.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDept === 'All' || m.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#202124]">IDEA Lab Community Members</h1>
          <p className="text-xs text-[#777777] mt-1">Browse all 70 registered student innovators and makers at Saveetha Engineering College.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#777777]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, roll no or skill..."
            className="w-full bg-white border border-[#EEEEEE] rounded-xl pl-10 pr-4 py-2 text-xs text-[#202124] focus:outline-none focus:border-[#E63946] shadow-sm"
          />
        </div>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedDept === dept
                ? 'bg-[#E63946] text-white shadow-md shadow-[#E63946]/20'
                : 'bg-white text-[#777777] border border-[#EEEEEE] hover:text-[#202124]'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="bg-white rounded-3xl border border-[#EEEEEE] p-5 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center cursor-pointer group"
          >
            <div className="relative mb-3">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#E63946]/20 group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-2 -right-2 bg-[#FFF0F1] text-[#E63946] text-[10px] font-bold px-2 py-0.5 rounded-full border border-white">
                {member.points} pts
              </span>
            </div>

            <h3 className="font-bold text-sm text-[#202124] group-hover:text-[#E63946] transition-colors">{member.name}</h3>
            <p className="text-[11px] text-[#777777] mt-0.5">{member.department}</p>
            <span className="text-[10px] font-semibold text-[#E63946] mt-1">{member.year} • {member.badge}</span>

            <div className="flex flex-wrap justify-center gap-1.5 mt-4 pt-3 border-t border-[#EEEEEE] w-full">
              {member.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="text-[10px] bg-[#FAFAFA] text-[#777777] px-2 py-0.5 rounded-lg border border-[#EEEEEE]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 lg:p-8 shadow-2xl border border-[#EEEEEE] relative text-center">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-5 right-5 text-[#777777] hover:text-[#202124] p-1.5 rounded-xl bg-[#FAFAFA]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center space-y-4">
              <img src={selectedMember.avatar} alt={selectedMember.name} className="w-24 h-24 rounded-3xl object-cover border-2 border-[#E63946]/30 shadow-md" />
              <div>
                <h3 className="text-xl font-extrabold text-[#202124]">{selectedMember.name}</h3>
                <p className="text-xs text-[#777777] mt-0.5">{selectedMember.rollNumber} • {selectedMember.department}</p>
                <span className="inline-block px-3 py-1 bg-[#FFF0F1] text-[#E63946] text-xs font-bold rounded-full mt-2">
                  {selectedMember.badge} • {selectedMember.points} Innovator Points
                </span>
              </div>

              <p className="text-xs text-[#777777] leading-relaxed px-4">{selectedMember.bio}</p>

              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {selectedMember.skills.map((skill, idx) => (
                  <span key={idx} className="text-xs bg-[#FAFAFA] text-[#202124] px-3 py-1 rounded-xl border border-[#EEEEEE] font-medium">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#EEEEEE] w-full">
                <a
                  href={`mailto:${selectedMember.email}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E63946] text-white text-xs font-semibold shadow-md shadow-[#E63946]/20"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Student</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
