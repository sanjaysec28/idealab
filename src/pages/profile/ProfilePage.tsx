import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  GraduationCap,
  Hash,
  ImagePlus,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  resolveProfileAvatarUrl,
  resolveProfileBannerUrl,
} from '../../utils/assets';
import { HomeHeader } from '../../components/home/HomeHeader';
import { MobileBottomNavigation } from '../../components/home/MobileBottomNavigation';
import { CoverBannerModal } from '../../components/profile/CoverBannerModal';
import { ProfilePhotoModal } from '../../components/profile/ProfilePhotoModal';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { SkillsInterestsSocialSection } from '../../components/profile/SkillsInterestsSocialSection';
import { ReadOnlyWeeklyTimetable } from '../../components/profile/ReadOnlyWeeklyTimetable';
import { ProfileAchievementsContributions } from '../../components/profile/ProfileAchievementsContributions';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'IL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const ProfilePage: React.FC = () => {
  const {
    user,
    studentProfile,
    studentTimetable,
    studentAvailability,
    hasCompletedTimetable,
    studentData,
    refreshStudentData,
  } = useAuth();

  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const uid = user?.uid || '';

  const fullName =
    studentProfile?.fullName || user?.displayName || studentData.name || 'IDEA Lab Student';
  const email = studentProfile?.email || user?.email || studentData.email || '';
  const registrationNumber =
    studentProfile?.registrationNumber || studentData.rollNumber || '';
  const department =
    studentProfile?.department ||
    studentTimetable?.department ||
    studentData.department ||
    'AI & Data Science';
  const academicYear =
    studentProfile?.currentAcademicYear ||
    studentProfile?.academicYear ||
    studentTimetable?.academicYear ||
    studentData.year ||
    '3rd Year';
  const currentSemester =
    studentProfile?.currentSemester ||
    studentTimetable?.semester ||
    studentData.semester ||
    'Semester 5';
  const location =
    studentProfile?.location?.trim() || 'Saveetha Engineering College, Chennai';
  const phoneNumber = studentProfile?.phoneNumber?.trim() || '';
  const bio = studentProfile?.bio?.trim() || '';

  const skills = studentProfile?.skills ?? [];
  const interests = studentProfile?.interests ?? [];
  const socialLinks = studentProfile?.socialLinks ?? {};

  const membershipStatusLabel =
    studentProfile?.membershipStatus === 'pending'
      ? 'Verified Student Member'
      : 'Active IDEA LAB Member';

  const resolvedBannerUrl = resolveProfileBannerUrl({
    bannerURL: studentProfile?.bannerURL,
    bannerPresetId: studentProfile?.bannerPresetId,
  });

  const resolvedAvatarUrl = resolveProfileAvatarUrl({
    photoURL: studentProfile?.photoURL || user?.photoURL,
    avatarPresetId: studentProfile?.avatarPresetId,
  });

  const notifySaved = async (message: string) => {
    await refreshStudentData();
    setStatusBanner(message);
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  const hasCompletedProfileBioAndSkills = Boolean(
    bio.length >= 10 && skills.length > 0 && interests.length > 0
  );

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F5] text-[#202020] flex flex-col">
      <HomeHeader />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-28 lg:pb-10 space-y-5">
        {statusBanner && (
          <div
            role="status"
            className="px-4 py-3 rounded-2xl bg-[#32B878]/12 border border-[#32B878]/30 text-xs font-bold text-[#1F7A4D] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#32B878] shrink-0" />
              <span>{statusBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="text-[11px] font-semibold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. PROFILE HERO CARD: COVER BANNER + CIRCULAR PHOTO + STUDENT INFORMATION */}
        <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_14px_rgba(32,33,36,0.03)] overflow-hidden">
          {/* Wide Landscape Cover Banner */}
          <div className="relative h-44 sm:h-56 lg:h-64 w-full overflow-hidden bg-[#202020]">
            <img
              src={resolvedBannerUrl}
              alt={`${fullName} profile cover banner`}
              className="w-full h-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

            {/* Subtle Edit Cover Button */}
            <button
              type="button"
              onClick={() => setIsCoverModalOpen(true)}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 px-3.5 py-2 rounded-xl bg-white/92 hover:bg-white text-[#202020] hover:text-[#E63946] border border-white/60 shadow-md backdrop-blur-md text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Edit Cover</span>
            </button>
          </div>

          {/* Overlapping Avatar + Student Identity & Information */}
          <div className="px-5 sm:px-7 lg:px-8 pb-6 sm:pb-7 pt-0 relative">
            {/* Top Row: Overlapping Circular Avatar + Primary Actions */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 lg:-mt-18">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5">
                {/* Circular Profile Photo */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 shrink-0">
                  <div className="w-full h-full rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#FFF0F1] flex items-center justify-center">
                    {resolvedAvatarUrl ? (
                      <img
                        src={resolvedAvatarUrl}
                        alt={fullName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#E63946] select-none">
                        {getInitials(fullName)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    aria-label="Update profile photo"
                    title="Upload or change profile photo"
                    className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#E63946] hover:bg-[#D62839] text-white border-2 border-white shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Name, Academic Subtitle & Membership Badge */}
                <div className="pt-1 sm:pb-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl lg:text-[28px] font-extrabold tracking-tight text-[#202020]">
                      {fullName}
                    </h1>

                    {/* IDEA LAB Membership Status Badge */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#32B878]/12 border border-[#32B878]/30 text-xs font-bold text-[#1F7A4D]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#32B878]" />
                      <span>{membershipStatusLabel}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm font-medium text-[#777777]">
                    <span className="font-semibold text-[#202020]">{department}</span>
                    <span aria-hidden="true">·</span>
                    <span>{academicYear}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentSemester}</span>
                    {registrationNumber && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-xs text-[#202020] tabular-nums">
                          Reg No: {registrationNumber}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 sm:pb-1">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold shadow-md shadow-[#E63946]/20 inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                <Link
                  to="/timetable"
                  className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#202020] hover:text-[#E63946] inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-[#E63946]" />
                  <span>Timetable Builder</span>
                </Link>
              </div>
            </div>

            {/* Short Biography */}
            <div className="mt-5 pt-5 border-t border-[#EAE6E1]">
              <div className="max-w-3xl">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#777777] mb-1.5">
                  About & Biography
                </h2>
                {bio ? (
                  <p className="text-xs sm:text-sm text-[#202020] leading-relaxed whitespace-pre-line">
                    {bio}
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] px-4 py-3">
                    <p className="text-xs text-[#777777]">
                      Add a short biography about your academic interests, makerspace projects, and collaboration goals.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditProfileModalOpen(true)}
                      className="text-xs font-bold text-[#E63946] hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Write Biography</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Student Information Grid (All Required Academic & Contact Fields) */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                  <Hash className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#777777]">
                    Registration Number
                  </p>
                  <p className="text-xs font-bold text-[#202020] mt-0.5 truncate tabular-nums">
                    {registrationNumber || 'Verified Student Account'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#777777]">Department</p>
                  <p className="text-xs font-bold text-[#202020] mt-0.5 truncate">
                    {department}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#777777]">
                    Academic Year & Semester
                  </p>
                  <p className="text-xs font-bold text-[#202020] mt-0.5 truncate">
                    {academicYear} · {currentSemester}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#777777]">Location</p>
                  <p className="text-xs font-bold text-[#202020] mt-0.5 truncate">
                    {location}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#777777]">
                    Verified Email Address
                  </p>
                  <p className="text-xs font-bold text-[#202020] mt-0.5 truncate">
                    {email}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#777777]">Phone Number</p>
                  <p className="text-xs font-bold text-[#202020] mt-0.5 truncate tabular-nums">
                    {phoneNumber || 'Not added yet'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#32B878]/15 text-[#32B878] flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#777777]">
                    Collaboration Status
                  </p>
                  <p className="text-xs font-bold text-[#202020] mt-0.5 truncate">
                    {studentAvailability?.isOptedIn
                      ? 'Opted In for Teammate Discovery'
                      : 'Discovery Opt-In Off'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#777777]">
                    Timetable Status
                  </p>
                  <p className="text-xs font-bold text-[#202020] mt-0.5 truncate">
                    {hasCompletedTimetable
                      ? `Synced (v${studentTimetable?.version ?? 1})`
                      : 'Not Submitted Yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. SKILLS, INTERESTS & SOCIAL PROFILES */}
        <SkillsInterestsSocialSection
          uid={uid}
          skills={skills}
          interests={interests}
          socialLinks={socialLinks}
          onUpdated={() => notifySaved('Skills, interests, and social links updated.')}
        />

        {/* 3. MY WEEKLY TIMETABLE (STRICTLY READ-ONLY) */}
        <ReadOnlyWeeklyTimetable
          timetableDoc={studentTimetable}
          availabilityDoc={studentAvailability}
          fallbackSemester={currentSemester}
          fallbackAcademicYear={academicYear}
          fallbackDepartment={department}
        />

        {/* 4. ACHIEVEMENTS & CONTRIBUTIONS */}
        <ProfileAchievementsContributions
          uid={uid}
          studentName={fullName}
          studentEmail={email}
          emailVerified={Boolean(user?.emailVerified)}
          hasCompletedTimetable={hasCompletedTimetable}
          isCollaborationOptedIn={Boolean(studentAvailability?.isOptedIn)}
          hasCompletedProfileBioAndSkills={hasCompletedProfileBioAndSkills}
        />
      </main>

      <MobileBottomNavigation />

      {/* Modals */}
      <CoverBannerModal
        isOpen={isCoverModalOpen}
        uid={uid}
        currentBannerUrl={studentProfile?.bannerURL}
        currentBannerPresetId={studentProfile?.bannerPresetId}
        onClose={() => setIsCoverModalOpen(false)}
        onSaved={() => notifySaved('Profile cover banner saved.')}
      />

      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        uid={uid}
        studentName={fullName}
        currentPhotoUrl={studentProfile?.photoURL || user?.photoURL || undefined}
        currentAvatarPresetId={studentProfile?.avatarPresetId}
        onClose={() => setIsPhotoModalOpen(false)}
        onSaved={() => notifySaved('Profile photo updated.')}
      />

      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        uid={uid}
        initialValues={{
          fullName,
          email,
          registrationNumber,
          department,
          academicYear,
          currentSemester,
          location,
          phoneNumber,
          bio,
          membershipStatusLabel,
        }}
        onClose={() => setIsEditProfileModalOpen(false)}
        onSaved={() => notifySaved('Student profile details saved.')}
      />
    </div>
  );
};
