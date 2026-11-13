import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Flame,
  FolderKanban,
  Lightbulb,
  Lock,
  MessageSquare,
  Rocket,
  Trophy,
  Users,
} from 'lucide-react';
import { PROJECTS } from '../../data/projects';
import { IDEAS } from '../../data/ideas';
import { EVENTS } from '../../data/events';
import { LEADERBOARD } from '../../data/leaderboard';
import { ACHIEVEMENTS } from '../../data/achievements';

interface ProfileAchievementsContributionsProps {
  uid: string;
  studentName: string;
  studentEmail: string;
  emailVerified: boolean;
  hasCompletedTimetable: boolean;
  isCollaborationOptedIn: boolean;
  hasCompletedProfileBioAndSkills: boolean;
}

export const ProfileAchievementsContributions: React.FC<
  ProfileAchievementsContributionsProps
> = ({
  uid,
  studentName,
  studentEmail,
  emailVerified,
  hasCompletedTimetable,
  isCollaborationOptedIn,
  hasCompletedProfileBioAndSkills,
}) => {
  const normalizedName = studentName.trim().toLowerCase();
  const normalizedEmailPrefix = studentEmail.split('@')[0]?.trim().toLowerCase() || '';

  // Match only real records belonging to this authenticated student (never attribute mock peers' records)
  const myProjects = useMemo(
    () =>
      PROJECTS.filter(
        (p) =>
          p.authorId === uid ||
          (normalizedName.length > 3 &&
            p.authorName.trim().toLowerCase() === normalizedName)
      ),
    [uid, normalizedName]
  );

  const myIdeas = useMemo(
    () =>
      IDEAS.filter(
        (idea) =>
          idea.authorId === uid ||
          (normalizedName.length > 3 &&
            idea.authorName.trim().toLowerCase() === normalizedName)
      ),
    [uid, normalizedName]
  );

  const myEvents = useMemo(
    () => EVENTS.filter((ev) => Boolean(ev.isRegistered) && ev.id === uid),
    [uid]
  );

  // Community posts authored by this student (no fabricated posts)
  const myCommunityPosts: {
    id: string;
    content: string;
    createdAt: string;
    likes: number;
  }[] = useMemo(() => [], []);

  // Leaderboard entry only if this student actually appears on the campus leaderboard
  const leaderboardEntry = useMemo(
    () =>
      LEADERBOARD.find(
        (entry) =>
          entry.memberId === uid ||
          (normalizedName.length > 3 &&
            entry.name.trim().toLowerCase() === normalizedName) ||
          (normalizedEmailPrefix.length > 3 &&
            entry.name.trim().toLowerCase() === normalizedEmailPrefix)
      ) || null,
    [uid, normalizedName, normalizedEmailPrefix]
  );

  const pointsEarned = leaderboardEntry ? leaderboardEntry.points : 0;
  const leaderboardRank = leaderboardEntry ? `#${leaderboardEntry.rank}` : 'Unranked';

  // Real platform onboarding & contribution badges grounded strictly in verified student state
  const studentBadges = useMemo(
    () => [
      {
        id: 'badge-verified-member',
        title: 'Verified IDEA LAB Member',
        category: 'Identity',
        description: 'Verified email identity with Saveetha IDEA LAB student portal.',
        isUnlocked: emailVerified,
        icon: CheckCircle2,
      },
      {
        id: 'badge-timetable-synced',
        title: 'Schedule Architect',
        category: 'Availability',
        description: 'Submitted semester class timetable and calculated weekly free periods.',
        isUnlocked: hasCompletedTimetable,
        icon: Calendar,
      },
      {
        id: 'badge-collab-ready',
        title: 'Open Collaborator',
        category: 'Collaboration',
        description: 'Opted into Smart Availability discovery to team up during free slots.',
        isUnlocked: hasCompletedTimetable && isCollaborationOptedIn,
        icon: Users,
      },
      {
        id: 'badge-profile-complete',
        title: 'Complete Maker Profile',
        category: 'Profile',
        description: 'Added biography, technical skills, and innovation interests.',
        isUnlocked: hasCompletedProfileBioAndSkills,
        icon: Award,
      },
      ...ACHIEVEMENTS.slice(0, 2).map((ach) => ({
        id: ach.id,
        title: ach.title,
        category: ach.category,
        description: ach.description,
        isUnlocked:
          ach.id === 'ach-1' ? myProjects.length > 0 : false,
        icon: Rocket,
      })),
    ],
    [
      emailVerified,
      hasCompletedTimetable,
      isCollaborationOptedIn,
      hasCompletedProfileBioAndSkills,
      myProjects.length,
    ]
  );

  const unlockedBadgesCount = studentBadges.filter((b) => b.isUnlocked).length;

  return (
    <div className="space-y-5">
      {/* Top Overview Row: Points, Rank & Achievement Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Points Earned & Leaderboard Rank Card */}
        <section className="lg:col-span-4 bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_14px_rgba(32,33,36,0.03)] p-5 sm:p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#EAE6E1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                  <Trophy className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-[#202020]">
                    Standing & Points
                  </h2>
                  <p className="text-[11px] text-[#777777]">
                    Real campus leaderboard status
                  </p>
                </div>
              </div>

              <Link
                to="/leaderboard"
                className="text-xs font-bold text-[#E63946] hover:underline inline-flex items-center gap-1"
              >
                <span>Leaderboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#777777]">
                  <Flame className="w-3.5 h-3.5 text-[#E63946]" />
                  <span>Points Earned</span>
                </div>
                <p className="text-2xl font-extrabold text-[#202020] mt-1 tabular-nums">
                  {pointsEarned}
                </p>
                <p className="text-[10px] text-[#777777] mt-0.5">
                  {pointsEarned > 0 ? 'Verified maker points' : 'No points earned yet'}
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#777777]">
                  <Trophy className="w-3.5 h-3.5 text-[#E63946]" />
                  <span>Campus Rank</span>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-[#E63946] mt-1 tabular-nums">
                  {leaderboardRank}
                </p>
                <p className="text-[10px] text-[#777777] mt-0.5">
                  {leaderboardEntry ? leaderboardEntry.badge : 'Build projects to rank'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-[#EAE6E1] flex items-center justify-between text-xs text-[#777777]">
            <span>Unlocked Milestones</span>
            <span className="font-extrabold text-[#202020] tabular-nums">
              {unlockedBadgesCount} / {studentBadges.length}
            </span>
          </div>
        </section>

        {/* Achievement Badges Card */}
        <section className="lg:col-span-8 bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_14px_rgba(32,33,36,0.03)] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#EAE6E1]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                <Award className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#202020]">
                  Achievement Badges
                </h2>
                <p className="text-[11px] text-[#777777]">
                  Earned strictly from your verified account & campus activity ({unlockedBadgesCount} unlocked)
                </p>
              </div>
            </div>

            <Link
              to="/achievements"
              className="text-xs font-bold text-[#E63946] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>All Badges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {studentBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`rounded-2xl border p-3.5 flex items-start gap-3 transition-colors ${
                    badge.isUnlocked
                      ? 'bg-[#FAF8F5] border-[#EAE6E1]'
                      : 'bg-[#FAF8F5]/50 border-[#EAE6E1] opacity-65'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      badge.isUnlocked
                        ? 'bg-[#FFF0F1] text-[#E63946]'
                        : 'bg-[#EAE6E1]/70 text-[#777777]'
                    }`}
                  >
                    {badge.isUnlocked ? (
                      <Icon className="w-4.5 h-4.5" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-[#202020] truncate">
                        {badge.title}
                      </p>
                      <span
                        className={`text-[10px] font-bold shrink-0 ${
                          badge.isUnlocked ? 'text-[#32B878]' : 'text-[#777777]'
                        }`}
                      >
                        {badge.isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777777] leading-snug mt-1 line-clamp-2">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Contributions Grid: Projects, Ideas, Community Posts, Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Projects Created or Joined */}
        <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_14px_rgba(32,33,36,0.03)] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#EAE6E1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                  <FolderKanban className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#202020]">
                    Projects Created or Joined
                  </h3>
                  <p className="text-[11px] text-[#777777]">
                    Campus builds & prototypes ({myProjects.length})
                  </p>
                </div>
              </div>

              <Link
                to="/projects"
                className="text-xs font-bold text-[#E63946] hover:underline inline-flex items-center gap-1"
              >
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myProjects.length > 0 ? (
              <div className="mt-4 space-y-3">
                {myProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#202020] truncate">
                        {project.title}
                      </p>
                      <p className="text-[11px] text-[#777777] truncate mt-0.5">
                        {project.category} · {project.tagline}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#E63946] shrink-0 tabular-nums">
                      {project.likesCount} likes
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-5 text-center space-y-2.5">
                <p className="text-xs font-bold text-[#202020]">
                  No projects created or joined yet
                </p>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  You haven&apos;t published or joined a campus project yet. Start a build or collaborate with available students.
                </p>
                <Link
                  to="/projects"
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#E63946] inline-flex items-center gap-1.5 transition-colors"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>Browse Campus Projects</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 2. Ideas Submitted */}
        <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_14px_rgba(32,33,36,0.03)] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#EAE6E1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#202020]">
                    Ideas Submitted
                  </h3>
                  <p className="text-[11px] text-[#777777]">
                    Problem statements & pitches ({myIdeas.length})
                  </p>
                </div>
              </div>

              <Link
                to="/ideas"
                className="text-xs font-bold text-[#E63946] hover:underline inline-flex items-center gap-1"
              >
                <span>Ideas Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myIdeas.length > 0 ? (
              <div className="mt-4 space-y-3">
                {myIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#202020] truncate">
                        {idea.title}
                      </p>
                      <p className="text-[11px] text-[#777777] truncate mt-0.5">
                        {idea.category} · {idea.status}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#E63946] shrink-0 tabular-nums">
                      {idea.upvotes} upvotes
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-5 text-center space-y-2.5">
                <p className="text-xs font-bold text-[#202020]">
                  No ideas submitted yet
                </p>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  Have a solution for a campus or engineering challenge? Pitch your idea to gather upvotes and teammates.
                </p>
                <Link
                  to="/ideas"
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#E63946] inline-flex items-center gap-1.5 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Pitch an Idea</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 3. Community Posts */}
        <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_14px_rgba(32,33,36,0.03)] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#EAE6E1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#202020]">
                    Community Posts
                  </h3>
                  <p className="text-[11px] text-[#777777]">
                    Discussions & team requests ({myCommunityPosts.length})
                  </p>
                </div>
              </div>

              <Link
                to="/community"
                className="text-xs font-bold text-[#E63946] hover:underline inline-flex items-center gap-1"
              >
                <span>Community</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myCommunityPosts.length > 0 ? (
              <div className="mt-4 space-y-3">
                {myCommunityPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1]"
                  >
                    <p className="text-xs text-[#202020]">{post.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-5 text-center space-y-2.5">
                <p className="text-xs font-bold text-[#202020]">
                  No community posts published yet
                </p>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  Share project updates, ask technical questions, or connect with fellow makers across Saveetha Engineering College.
                </p>
                <Link
                  to="/community"
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#E63946] inline-flex items-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Visit Community</span>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 4. Events Participated In */}
        <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_14px_rgba(32,33,36,0.03)] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#EAE6E1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#202020]">
                    Events Participated In
                  </h3>
                  <p className="text-[11px] text-[#777777]">
                    Workshops, hackathons & tech talks ({myEvents.length})
                  </p>
                </div>
              </div>

              <Link
                to="/events"
                className="text-xs font-bold text-[#E63946] hover:underline inline-flex items-center gap-1"
              >
                <span>Events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myEvents.length > 0 ? (
              <div className="mt-4 space-y-3">
                {myEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1]"
                  >
                    <p className="text-xs font-bold text-[#202020]">{ev.title}</p>
                    <p className="text-[11px] text-[#777777] mt-0.5">
                      {ev.date} · {ev.location}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-5 text-center space-y-2.5">
                <p className="text-xs font-bold text-[#202020]">
                  No event participations recorded yet
                </p>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  Register for upcoming IDEA LAB workshops, hardware bootcamps, and 24-hour campus hackathons.
                </p>
                <Link
                  to="/events"
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#E63946] inline-flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Explore Upcoming Events</span>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
