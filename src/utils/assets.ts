/**
 * Centralized image configuration system for IDEA LAB.
 * Uses the approved local illustration assets in /public/images/.
 */

export const ASSETS = {
  logo: {
    icon: '/images/desk-card.png',
    banner: '/images/desk-card.png',
  },
  ideaLabLogo: '/images/desk-card.png',
  splashScreen: '/images/splash-screen.png',
  welcomeHero: '/images/desk-card.png',
  welcomeHeroMobile: '/images/mob-card.png',
  onboardingExplore: '/images/desk-card.png',
  onboardingCollaborate: '/images/desk-card.png',
  onboardingCreate: '/images/desk-card.png',
  authSideIllustration: '/images/desk-card.png',
  joinSideIllustration: '/images/desk-card.png',
  pendingApproval: '/images/mob-card.png',
  campus: {
    mainBuilding: '/images/desk-card.png',
    ideaLabInterior: '/images/desk-card.png',
    workshopHall: '/images/desk-card.png',
    makerspace: '/images/desk-card.png',
  },
  students: [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
  ],
  projects: [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  ],
  events: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
  ],
  placeholders: {
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    project: '/images/desk-card.png',
  }
};

export const getStudentAvatar = (index: number) => {
  return ASSETS.students[index % ASSETS.students.length];
};

export const getProjectImage = (index: number) => {
  return ASSETS.projects[index % ASSETS.projects.length];
};

export const getEventImage = (index: number) => {
  return ASSETS.events[index % ASSETS.events.length];
};
