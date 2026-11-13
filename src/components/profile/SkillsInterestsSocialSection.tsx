import React, { useEffect, useState } from 'react';
import {
  Check,
  Code2,
  Compass,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Loader2,
  Pencil,
  Plus,
  X,
} from 'lucide-react';
import { StudentSocialLinks } from '../../types/auth';
import {
  updateStudentSkillsAndInterests,
  updateStudentSocialLinks,
} from '../../firebase/studentService';

interface SkillsInterestsSocialSectionProps {
  uid: string;
  skills: string[];
  interests: string[];
  socialLinks: StudentSocialLinks;
  onUpdated: () => Promise<void> | void;
}

const SUGGESTED_SKILLS = [
  'Full Stack Development',
  'AI / Machine Learning',
  'UI/UX Design',
  'Android Development',
  'Cloud Computing',
  'Embedded Systems & IoT',
  'Robotics & ROS',
  'Data Science & Analytics',
  'TypeScript & React',
  'Python & FastAPI',
];

const SUGGESTED_INTERESTS = [
  'Generative AI',
  'Smart Campus IoT',
  'Hackathons & Prototyping',
  'Open Source Software',
  'Autonomous Robotics',
  'Sustainable Engineering',
  'Product Design',
  'Edge Computing',
];

export const SkillsInterestsSocialSection: React.FC<SkillsInterestsSocialSectionProps> = ({
  uid,
  skills,
  interests,
  socialLinks,
  onUpdated,
}) => {
  // Skills state
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [draftSkills, setDraftSkills] = useState<string[]>(skills);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [editingSkillValue, setEditingSkillValue] = useState('');
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  // Interests state
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [draftInterests, setDraftInterests] = useState<string[]>(interests);
  const [newInterestInput, setNewInterestInput] = useState('');
  const [editingInterestIndex, setEditingInterestIndex] = useState<number | null>(null);
  const [editingInterestValue, setEditingInterestValue] = useState('');
  const [isSavingInterests, setIsSavingInterests] = useState(false);
  const [interestsError, setInterestsError] = useState<string | null>(null);

  // Social links state
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const [linkedinInput, setLinkedinInput] = useState(socialLinks.linkedin || '');
  const [githubInput, setGithubInput] = useState(socialLinks.github || '');
  const [portfolioInput, setPortfolioInput] = useState(socialLinks.portfolio || '');
  const [isSavingSocials, setIsSavingSocials] = useState(false);
  const [socialsError, setSocialsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditingSkills) {
      setDraftSkills(skills);
    }
  }, [skills, isEditingSkills]);

  useEffect(() => {
    if (!isEditingInterests) {
      setDraftInterests(interests);
    }
  }, [interests, isEditingInterests]);

  useEffect(() => {
    if (!isEditingSocials) {
      setLinkedinInput(socialLinks.linkedin || '');
      setGithubInput(socialLinks.github || '');
      setPortfolioInput(socialLinks.portfolio || '');
    }
  }, [socialLinks, isEditingSocials]);

  // Skills handlers
  const handleAddSkill = (value: string) => {
    const clean = value.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (!clean) return;
    if (draftSkills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setNewSkillInput('');
      return;
    }
    if (draftSkills.length >= 25) {
      setSkillsError('Maximum 25 skills can be added.');
      return;
    }
    setSkillsError(null);
    setDraftSkills((prev) => [...prev, clean]);
    setNewSkillInput('');
  };

  const handleCommitEditSkill = (idx: number) => {
    const clean = editingSkillValue.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (!clean) {
      setEditingSkillIndex(null);
      return;
    }
    setDraftSkills((prev) => prev.map((item, i) => (i === idx ? clean : item)));
    setEditingSkillIndex(null);
    setEditingSkillValue('');
  };

  const handleSaveSkills = async () => {
    if (isSavingSkills) return;
    setSkillsError(null);
    setIsSavingSkills(true);
    try {
      const nextSkills =
        newSkillInput.trim().length > 0
          ? [...draftSkills, newSkillInput.trim()]
          : draftSkills;
      await updateStudentSkillsAndInterests(uid, { skills: nextSkills });
      setNewSkillInput('');
      setEditingSkillIndex(null);
      setIsEditingSkills(false);
      await onUpdated();
    } catch (err) {
      setSkillsError(
        err instanceof Error ? err.message : 'Unable to save skills right now.'
      );
    } finally {
      setIsSavingSkills(false);
    }
  };

  // Interests handlers
  const handleAddInterest = (value: string) => {
    const clean = value.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (!clean) return;
    if (draftInterests.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setNewInterestInput('');
      return;
    }
    if (draftInterests.length >= 25) {
      setInterestsError('Maximum 25 interests can be added.');
      return;
    }
    setInterestsError(null);
    setDraftInterests((prev) => [...prev, clean]);
    setNewInterestInput('');
  };

  const handleCommitEditInterest = (idx: number) => {
    const clean = editingInterestValue.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (!clean) {
      setEditingInterestIndex(null);
      return;
    }
    setDraftInterests((prev) => prev.map((item, i) => (i === idx ? clean : item)));
    setEditingInterestIndex(null);
    setEditingInterestValue('');
  };

  const handleSaveInterests = async () => {
    if (isSavingInterests) return;
    setInterestsError(null);
    setIsSavingInterests(true);
    try {
      const nextInterests =
        newInterestInput.trim().length > 0
          ? [...draftInterests, newInterestInput.trim()]
          : draftInterests;
      await updateStudentSkillsAndInterests(uid, { interests: nextInterests });
      setNewInterestInput('');
      setEditingInterestIndex(null);
      setIsEditingInterests(false);
      await onUpdated();
    } catch (err) {
      setInterestsError(
        err instanceof Error ? err.message : 'Unable to save interests right now.'
      );
    } finally {
      setIsSavingInterests(false);
    }
  };

  // Social links handlers
  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingSocials) return;
    setSocialsError(null);
    setIsSavingSocials(true);
    try {
      await updateStudentSocialLinks(uid, {
        linkedin: linkedinInput,
        github: githubInput,
        portfolio: portfolioInput,
      });
      setIsEditingSocials(false);
      await onUpdated();
    } catch (err) {
      setSocialsError(
        err instanceof Error ? err.message : 'Unable to save social profile links.'
      );
    } finally {
      setIsSavingSocials(false);
    }
  };

  const hasAnySocial = Boolean(
    socialLinks.linkedin || socialLinks.github || socialLinks.portfolio
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
      {/* 1. TECHNICAL SKILLS SECTION */}
      <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_14px_rgba(32,33,36,0.03)] p-5 sm:p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#EAE6E1]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                <Code2 className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold text-[#202020] truncate">
                  Skills & Expertise
                </h2>
                <p className="text-[11px] text-[#777777] truncate">
                  Technical domains & tools ({skills.length})
                </p>
              </div>
            </div>

            {!isEditingSkills && (
              <button
                type="button"
                onClick={() => {
                  setDraftSkills(skills);
                  setSkillsError(null);
                  setIsEditingSkills(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#202020] hover:text-[#E63946] inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Pencil className="w-3.5 h-3.5 text-[#E63946]" />
                <span>{skills.length > 0 ? 'Edit' : 'Add'}</span>
              </button>
            )}
          </div>

          {skillsError && (
            <div className="p-3 rounded-xl bg-[#FFF0F1] border border-[#E63946]/30 text-xs text-[#E63946] font-medium">
              {skillsError}
            </div>
          )}

          {isEditingSkills ? (
            <div className="space-y-3.5">
              {/* Add Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={60}
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(newSkillInput);
                    }
                  }}
                  placeholder="Add a skill (e.g., Full Stack Development)"
                  className="flex-1 rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] px-3.5 py-2 text-xs text-[#202020] outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(newSkillInput)}
                  className="px-3.5 py-2 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Active Draft Tags (Click tag text to rename, X to remove) */}
              {draftSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {draftSkills.map((skill, idx) =>
                    editingSkillIndex === idx ? (
                      <div
                        key={`${skill}-${idx}`}
                        className="inline-flex items-center gap-1 bg-white border border-[#E63946] rounded-xl px-2 py-1"
                      >
                        <input
                          type="text"
                          autoFocus
                          maxLength={60}
                          value={editingSkillValue}
                          onChange={(e) => setEditingSkillValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCommitEditSkill(idx);
                            } else if (e.key === 'Escape') {
                              setEditingSkillIndex(null);
                            }
                          }}
                          onBlur={() => handleCommitEditSkill(idx)}
                          className="text-xs font-semibold text-[#202020] outline-none w-36"
                        />
                      </div>
                    ) : (
                      <span
                        key={`${skill}-${idx}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0F1] border border-[#E63946]/25 text-xs font-semibold text-[#E63946]"
                      >
                        <button
                          type="button"
                          title="Click to edit skill name"
                          onClick={() => {
                            setEditingSkillIndex(idx);
                            setEditingSkillValue(skill);
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          {skill}
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${skill}`}
                          onClick={() =>
                            setDraftSkills((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-[#E63946]/70 hover:text-[#E63946] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#777777] italic">
                  No skills selected yet. Add a custom skill or pick from suggestions below.
                </p>
              )}

              {/* Quick Suggestions */}
              <div className="pt-2 border-t border-[#EAE6E1]">
                <p className="text-[11px] font-semibold text-[#777777] mb-2">
                  Quick Add Suggestions:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SKILLS.filter(
                    (sug) =>
                      !draftSkills.some((s) => s.toLowerCase() === sug.toLowerCase())
                  )
                    .slice(0, 6)
                    .map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddSkill(sug)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#FFF0F1] border border-[#EAE6E1] text-[11px] font-medium text-[#202020] hover:text-[#E63946] inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-[#E63946]" />
                        <span>{sug}</span>
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE6E1]">
                <button
                  type="button"
                  disabled={isSavingSkills}
                  onClick={() => {
                    setDraftSkills(skills);
                    setIsEditingSkills(false);
                    setEditingSkillIndex(null);
                    setSkillsError(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#EAE6E1] text-xs font-semibold text-[#202020] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingSkills}
                  onClick={() => void handleSaveSkills()}
                  className="px-4 py-2 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSavingSkills ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Skills</span>
                </button>
              </div>
            </div>
          ) : skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-[#FFF0F1] border border-[#E63946]/20 text-xs font-bold text-[#E63946]"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 text-center space-y-2">
              <p className="text-xs font-bold text-[#202020]">No skills added yet</p>
              <p className="text-[11px] text-[#777777]">
                Highlight your technical stack so IDEA LAB peers can invite you to matching projects.
              </p>
              <button
                type="button"
                onClick={() => setIsEditingSkills(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#E63946] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skills</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. INNOVATION INTERESTS SECTION */}
      <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_14px_rgba(32,33,36,0.03)] p-5 sm:p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#EAE6E1]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold text-[#202020] truncate">
                  Interests & Domains
                </h2>
                <p className="text-[11px] text-[#777777] truncate">
                  Topics you love exploring ({interests.length})
                </p>
              </div>
            </div>

            {!isEditingInterests && (
              <button
                type="button"
                onClick={() => {
                  setDraftInterests(interests);
                  setInterestsError(null);
                  setIsEditingInterests(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#202020] hover:text-[#E63946] inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Pencil className="w-3.5 h-3.5 text-[#E63946]" />
                <span>{interests.length > 0 ? 'Edit' : 'Add'}</span>
              </button>
            )}
          </div>

          {interestsError && (
            <div className="p-3 rounded-xl bg-[#FFF0F1] border border-[#E63946]/30 text-xs text-[#E63946] font-medium">
              {interestsError}
            </div>
          )}

          {isEditingInterests ? (
            <div className="space-y-3.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={60}
                  value={newInterestInput}
                  onChange={(e) => setNewInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest(newInterestInput);
                    }
                  }}
                  placeholder="Add an interest (e.g., Generative AI)"
                  className="flex-1 rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] px-3.5 py-2 text-xs text-[#202020] outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddInterest(newInterestInput)}
                  className="px-3.5 py-2 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {draftInterests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {draftInterests.map((interest, idx) =>
                    editingInterestIndex === idx ? (
                      <div
                        key={`${interest}-${idx}`}
                        className="inline-flex items-center gap-1 bg-white border border-[#E63946] rounded-xl px-2 py-1"
                      >
                        <input
                          type="text"
                          autoFocus
                          maxLength={60}
                          value={editingInterestValue}
                          onChange={(e) => setEditingInterestValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCommitEditInterest(idx);
                            } else if (e.key === 'Escape') {
                              setEditingInterestIndex(null);
                            }
                          }}
                          onBlur={() => handleCommitEditInterest(idx)}
                          className="text-xs font-semibold text-[#202020] outline-none w-36"
                        />
                      </div>
                    ) : (
                      <span
                        key={`${interest}-${idx}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] text-xs font-semibold text-[#202020]"
                      >
                        <button
                          type="button"
                          title="Click to edit interest"
                          onClick={() => {
                            setEditingInterestIndex(idx);
                            setEditingInterestValue(interest);
                          }}
                          className="hover:text-[#E63946] cursor-pointer"
                        >
                          {interest}
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${interest}`}
                          onClick={() =>
                            setDraftInterests((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-[#777777] hover:text-[#E63946] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#777777] italic">
                  No interests selected yet. Add custom topics or pick from below.
                </p>
              )}

              <div className="pt-2 border-t border-[#EAE6E1]">
                <p className="text-[11px] font-semibold text-[#777777] mb-2">
                  Suggested Topics:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_INTERESTS.filter(
                    (sug) =>
                      !draftInterests.some((s) => s.toLowerCase() === sug.toLowerCase())
                  )
                    .slice(0, 6)
                    .map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleAddInterest(sug)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#FFF0F1] border border-[#EAE6E1] text-[11px] font-medium text-[#202020] hover:text-[#E63946] inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-[#E63946]" />
                        <span>{sug}</span>
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE6E1]">
                <button
                  type="button"
                  disabled={isSavingInterests}
                  onClick={() => {
                    setDraftInterests(interests);
                    setIsEditingInterests(false);
                    setEditingInterestIndex(null);
                    setInterestsError(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#EAE6E1] text-xs font-semibold text-[#202020] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingInterests}
                  onClick={() => void handleSaveInterests()}
                  className="px-4 py-2 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSavingInterests ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Interests</span>
                </button>
              </div>
            </div>
          ) : interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6E1] text-xs font-semibold text-[#202020]"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 text-center space-y-2">
              <p className="text-xs font-bold text-[#202020]">No interests added yet</p>
              <p className="text-[11px] text-[#777777]">
                Share research areas, hackathons, and problem domains you want to explore.
              </p>
              <button
                type="button"
                onClick={() => setIsEditingInterests(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#E63946] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Interests</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. SOCIAL PROFILES SECTION */}
      <section className="bg-white rounded-[24px] border border-[#EAE6E1] shadow-[0_2px_14px_rgba(32,33,36,0.03)] p-5 sm:p-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-[#EAE6E1]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                <Globe className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold text-[#202020] truncate">
                  Social Profiles
                </h2>
                <p className="text-[11px] text-[#777777] truncate">
                  LinkedIn, GitHub & Portfolio links
                </p>
              </div>
            </div>

            {!isEditingSocials && (
              <button
                type="button"
                onClick={() => {
                  setLinkedinInput(socialLinks.linkedin || '');
                  setGithubInput(socialLinks.github || '');
                  setPortfolioInput(socialLinks.portfolio || '');
                  setSocialsError(null);
                  setIsEditingSocials(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#202020] hover:text-[#E63946] inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Pencil className="w-3.5 h-3.5 text-[#E63946]" />
                <span>{hasAnySocial ? 'Edit' : 'Add'}</span>
              </button>
            )}
          </div>

          {socialsError && (
            <div className="p-3 rounded-xl bg-[#FFF0F1] border border-[#E63946]/30 text-xs text-[#E63946] font-medium">
              {socialsError}
            </div>
          )}

          {isEditingSocials ? (
            <form onSubmit={(e) => void handleSaveSocials(e)} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#202020] mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  maxLength={300}
                  value={linkedinInput}
                  onChange={(e) => setLinkedinInput(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] px-3.5 py-2 text-xs text-[#202020] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#202020] mb-1">
                  GitHub URL
                </label>
                <input
                  type="text"
                  maxLength={300}
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="w-full rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] px-3.5 py-2 text-xs text-[#202020] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#202020] mb-1">
                  Portfolio Website
                </label>
                <input
                  type="text"
                  maxLength={300}
                  value={portfolioInput}
                  onChange={(e) => setPortfolioInput(e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="w-full rounded-xl bg-[#FAF8F5] focus:bg-white border border-[#EAE6E1] focus:border-[#E63946] px-3.5 py-2 text-xs text-[#202020] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE6E1]">
                <button
                  type="button"
                  disabled={isSavingSocials}
                  onClick={() => {
                    setIsEditingSocials(false);
                    setSocialsError(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#EAE6E1] text-xs font-semibold text-[#202020] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSocials}
                  className="px-4 py-2 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSavingSocials ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Links</span>
                </button>
              </div>
            </form>
          ) : hasAnySocial ? (
            <div className="space-y-2.5">
              {socialLinks.linkedin ? (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#FAF8F5] hover:bg-[#FFF0F1]/60 border border-[#EAE6E1] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                      <Linkedin className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#202020] group-hover:text-[#E63946] transition-colors">
                        LinkedIn
                      </p>
                      <p className="text-[11px] text-[#777777] truncate">
                        {socialLinks.linkedin.replace(/^https?:\/\/(www\.)?/i, '')}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#777777] group-hover:text-[#E63946] shrink-0" />
                </a>
              ) : null}

              {socialLinks.github ? (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#FAF8F5] hover:bg-[#FFF0F1]/60 border border-[#EAE6E1] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-[#202020] text-white flex items-center justify-center shrink-0">
                      <Github className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#202020] group-hover:text-[#E63946] transition-colors">
                        GitHub
                      </p>
                      <p className="text-[11px] text-[#777777] truncate">
                        {socialLinks.github.replace(/^https?:\/\/(www\.)?/i, '')}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#777777] group-hover:text-[#E63946] shrink-0" />
                </a>
              ) : null}

              {socialLinks.portfolio ? (
                <a
                  href={socialLinks.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#FAF8F5] hover:bg-[#FFF0F1]/60 border border-[#EAE6E1] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#202020] group-hover:text-[#E63946] transition-colors">
                        Portfolio Website
                      </p>
                      <p className="text-[11px] text-[#777777] truncate">
                        {socialLinks.portfolio.replace(/^https?:\/\/(www\.)?/i, '')}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#777777] group-hover:text-[#E63946] shrink-0" />
                </a>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-4 text-center space-y-2">
              <p className="text-xs font-bold text-[#202020]">No social profiles linked</p>
              <p className="text-[11px] text-[#777777]">
                Connect your LinkedIn, GitHub, and personal portfolio website.
              </p>
              <button
                type="button"
                onClick={() => setIsEditingSocials(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#E63946] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Social Links</span>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
