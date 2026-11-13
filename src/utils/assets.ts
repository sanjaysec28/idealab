/**
 * Centralized image configuration system for IDEA LAB.
 * Uses the approved local illustration assets in /public/images/.
 */

export const ASSETS = {
  logo: {
    full: '/images/logo.png',
    icon: '/images/logo.png',
    banner: '/images/logo.png',
  },
  ideaLabLogo: '/images/logo.png',
  splashScreen: '/images/logo.png',
  welcomeHero: '/images/desk-card.png',
  welcomeHeroMobile: '/images/mob-card.png',
  onboardingExplore: '/images/desk-card.png',
  onboardingCollaborate: '/images/desk-card.png',
  onboardingCreate: '/images/desk-card.png',
  authSideIllustration: '/images/desk-card.png',
  joinSideIllustration: '/images/desk-card.png',
  pendingApproval: '/images/desk-card.png',
  workInProgress: '/images/work.png',
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
  },
  home: {
    heroDesktop: '/images/home-header.png',
    heroMobile: '/images/home-header.png',
    projectCovers: {
      smartCampusAssistant:
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80',
      greenTrack:
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80',
      virtualLabSimulator:
        'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=900&q=80',
    },
    eventThumbnails: {
      aiInnovationWorkshop:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
      iotHackathon:
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80',
    },
    avatars: {
      ananya:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      divya:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      arun:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      meena:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      rohan:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      karthik:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    },
  },
  profile: {
    defaultBannerId: 'banner-coral-grid',
    defaultBanners: [
      {
        id: 'banner-coral-grid',
        title: 'IDEA LAB Coral Innovation Grid',
        subtitle: 'Signature coral-red architectural blueprint',
        category: 'Brand Signature',
        imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 450" width="1600" height="450">
            <defs>
              <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#E63946" />
                <stop offset="55%" stop-color="#C92A37" />
                <stop offset="100%" stop-color="#202020" />
              </linearGradient>
              <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.1" />
                <circle cx="48" cy="48" r="1.8" fill="#FFFFFF" fill-opacity="0.22" />
              </pattern>
            </defs>
            <rect width="1600" height="450" fill="url(#bg)" />
            <rect width="1600" height="450" fill="url(#grid)" />
            <circle cx="1320" cy="90" r="260" fill="#FFF0F1" fill-opacity="0.08" />
            <circle cx="1420" cy="360" r="190" fill="#E63946" fill-opacity="0.25" />
            <path d="M980 450 L1220 150 L1490 450 Z" fill="#FFFFFF" fill-opacity="0.05" />
            <g transform="translate(1120, 110)" opacity="0.24">
              <rect x="0" y="0" width="340" height="210" rx="24" fill="none" stroke="#FFFFFF" stroke-width="2" />
              <circle cx="54" cy="54" r="18" fill="none" stroke="#FFFFFF" stroke-width="2" />
              <line x1="90" y1="46" x2="260" y2="46" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
              <line x1="90" y1="66" x2="190" y2="66" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
              <rect x="36" y="106" width="80" height="64" rx="10" fill="#FFFFFF" fill-opacity="0.18" />
              <rect x="130" y="106" width="80" height="64" rx="10" fill="#FFFFFF" fill-opacity="0.12" />
              <rect x="224" y="106" width="80" height="64" rx="10" fill="#FFFFFF" fill-opacity="0.18" />
            </g>
          </svg>`
        )}`,
      },
      {
        id: 'banner-makerspace-studio',
        title: 'AICTE IDEA LAB Makerspace',
        subtitle: 'Inside the Saveetha Engineering College innovation studio',
        category: 'Campus Studio',
        imageUrl: '/images/home-header.png',
      },
      {
        id: 'banner-campus-collab',
        title: 'Saveetha Campus Innovators',
        subtitle: 'Outdoor student collaboration across campus',
        category: 'Campus Life',
        imageUrl: '/images/desk-card.png',
      },
      {
        id: 'banner-charcoal-circuit',
        title: 'Charcoal Hardware & Circuit Lab',
        subtitle: 'Dark charcoal engineering matrix with coral accents',
        category: 'Engineering',
        imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 450" width="1600" height="450">
            <defs>
              <linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#191919" />
                <stop offset="60%" stop-color="#242424" />
                <stop offset="100%" stop-color="#2E1C1E" />
              </linearGradient>
              <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse">
                <circle cx="18" cy="18" r="1.5" fill="#FAF8F5" fill-opacity="0.12" />
              </pattern>
            </defs>
            <rect width="1600" height="450" fill="url(#cbg)" />
            <rect width="1600" height="450" fill="url(#dots)" />
            <g stroke="#E63946" stroke-width="2.5" fill="none" opacity="0.55">
              <path d="M 880 80 H 1060 L 1120 140 H 1380" />
              <path d="M 960 220 H 1180 L 1240 160 H 1520" />
              <path d="M 1040 340 H 1290 L 1350 280 H 1560" />
              <circle cx="880" cy="80" r="6" fill="#E63946" />
              <circle cx="1380" cy="140" r="6" fill="#E63946" />
              <circle cx="960" cy="220" r="6" fill="#32B878" stroke="#32B878" />
              <circle cx="1520" cy="160" r="6" fill="#E63946" />
              <circle cx="1040" cy="340" r="6" fill="#FAF8F5" stroke="#FAF8F5" />
            </g>
            <circle cx="1380" cy="225" r="210" fill="#E63946" fill-opacity="0.12" />
          </svg>`
        )}`,
      },
      {
        id: 'banner-warm-cream-arch',
        title: 'Warm Cream & Coral Atelier',
        subtitle: 'Minimalist editorial geometry in IDEA LAB cream tones',
        category: 'Minimalist',
        imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 450" width="1600" height="450">
            <defs>
              <linearGradient id="wbg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#FFF0F1" />
                <stop offset="50%" stop-color="#FAF8F5" />
                <stop offset="100%" stop-color="#F5E6E8" />
              </linearGradient>
            </defs>
            <rect width="1600" height="450" fill="url(#wbg)" />
            <circle cx="240" cy="420" r="300" fill="#E63946" fill-opacity="0.09" />
            <circle cx="1350" cy="120" r="240" fill="#E63946" fill-opacity="0.14" />
            <circle cx="1160" cy="380" r="200" fill="#202020" fill-opacity="0.06" />
            <g stroke="#E63946" stroke-opacity="0.22" stroke-width="2" fill="none">
              <rect x="960" y="60" width="520" height="330" rx="32" />
              <rect x="1000" y="100" width="440" height="250" rx="24" />
            </g>
          </svg>`
        )}`,
      },
      {
        id: 'banner-emerald-horizon',
        title: 'Prototype & Sustainability Horizon',
        subtitle: 'Balanced charcoal, cream, and maker emerald accents',
        category: 'Innovation',
        imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 450" width="1600" height="450">
            <defs>
              <linearGradient id="ebg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#202020" />
                <stop offset="55%" stop-color="#2A2E2C" />
                <stop offset="100%" stop-color="#1E3F32" />
              </linearGradient>
            </defs>
            <rect width="1600" height="450" fill="url(#ebg)" />
            <circle cx="1300" cy="180" r="240" fill="#32B878" fill-opacity="0.16" />
            <circle cx="980" cy="360" r="190" fill="#E63946" fill-opacity="0.16" />
            <path d="M 0 360 Q 450 260 900 350 T 1600 290 L 1600 450 L 0 450 Z" fill="#32B878" fill-opacity="0.12" />
          </svg>`
        )}`,
      },
    ],
    defaultAvatars: [
      {
        id: 'avatar-coral-spark',
        label: 'Coral Innovator',
        imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
            <rect width="240" height="240" rx="120" fill="#FFF0F1" />
            <circle cx="120" cy="92" r="42" fill="#E63946" />
            <path d="M 48 212 C 48 164 192 164 192 212" fill="#E63946" />
          </svg>`
        )}`,
      },
      {
        id: 'avatar-charcoal-maker',
        label: 'Charcoal Maker',
        imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
            <rect width="240" height="240" rx="120" fill="#202020" />
            <circle cx="120" cy="92" r="42" fill="#FAF8F5" />
            <path d="M 48 212 C 48 164 192 164 192 212" fill="#E63946" />
          </svg>`
        )}`,
      },
      {
        id: 'avatar-emerald-builder',
        label: 'Emerald Builder',
        imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
            <rect width="240" height="240" rx="120" fill="#EAF8EE" />
            <circle cx="120" cy="92" r="42" fill="#32B878" />
            <path d="M 48 212 C 48 164 192 164 192 212" fill="#202020" />
          </svg>`
        )}`,
      },
      {
        id: 'avatar-cream-architect',
        label: 'Warm Studio',
        imageUrl: `data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
            <rect width="240" height="240" rx="120" fill="#FAF8F5" stroke="#EAE6E1" stroke-width="8" />
            <circle cx="120" cy="92" r="42" fill="#202020" />
            <path d="M 48 212 C 48 164 192 164 192 212" fill="#E63946" />
          </svg>`
        )}`,
      },
    ],
  },
};

export function resolveProfileBannerUrl(params: {
  bannerURL?: string;
  bannerPresetId?: string;
}): string {
  if (params.bannerURL && params.bannerURL.trim().length > 0) {
    return params.bannerURL.trim();
  }
  if (params.bannerPresetId) {
    const preset = ASSETS.profile.defaultBanners.find((b) => b.id === params.bannerPresetId);
    if (preset) return preset.imageUrl;
  }
  return ASSETS.profile.defaultBanners[0].imageUrl;
}

export function resolveProfileAvatarUrl(params: {
  photoURL?: string | null;
  avatarPresetId?: string;
}): string | null {
  if (params.photoURL && params.photoURL.trim().length > 0) {
    return params.photoURL.trim();
  }
  if (params.avatarPresetId) {
    const preset = ASSETS.profile.defaultAvatars.find((a) => a.id === params.avatarPresetId);
    if (preset) return preset.imageUrl;
  }
  return null;
}

export const getStudentAvatar = (index: number) => {
  return ASSETS.students[index % ASSETS.students.length];
};

export const getProjectImage = (index: number) => {
  return ASSETS.projects[index % ASSETS.projects.length];
};

export const getEventImage = (index: number) => {
  return ASSETS.events[index % ASSETS.events.length];
};


