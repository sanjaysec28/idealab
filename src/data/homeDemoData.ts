import { ASSETS } from '../utils/assets';
import { TimeSlotId } from '../types/timetable';

/**
 * Isolated demonstration content for the IDEA LAB student homepage.
 * Clearly separated from Firebase Firestore records and real student profiles.
 */

export interface HomeDemoProject {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  contributorAvatars: string[];
  extraContributors: number;
  isDemo: true;
}

export type CommunityFeedCategory =
  | 'All Posts'
  | 'Projects'
  | 'Ideas'
  | 'Team Up'
  | 'Updates';

export interface HomeDemoPost {
  id: string;
  authorName: string;
  authorMeta: string;
  authorAvatar: string;
  timeAgo: string;
  category: Exclude<CommunityFeedCategory, 'All Posts'>;
  content: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  isDemo: true;
}

export interface HomeDemoEvent {
  id: string;
  title: string;
  month: string;
  day: string;
  location: string;
  timeRange: string;
  thumbnail: string;
  isDemo: true;
}

export interface HomeDemoLeaderboardEntry {
  rank: 1 | 2 | 3;
  name: string;
  subtitle: string;
  avatar: string;
  points: number;
  isDemo: true;
}

export interface HomeDemoAvailableStudent {
  id: string;
  name: string;
  departmentYear: string;
  avatar: string;
  skills: string[];
  freeSlotIds: TimeSlotId[];
  optedIn: true;
  isDemo: true;
}

export const HOME_DEMO_PROJECTS: HomeDemoProject[] = [
  {
    id: 'home-proj-1',
    title: 'Smart Campus Assistant',
    category: 'AI/ML',
    description: 'An AI assistant for college inquiries, events and resources.',
    coverImage: ASSETS.home.projectCovers.smartCampusAssistant,
    contributorAvatars: [
      ASSETS.home.avatars.arun,
      ASSETS.home.avatars.ananya,
      ASSETS.home.avatars.rohan,
    ],
    extraContributors: 4,
    isDemo: true,
  },
  {
    id: 'home-proj-2',
    title: 'GreenTrack',
    category: 'Sustainability',
    description: 'A sustainable campus solution for waste and energy management.',
    coverImage: ASSETS.home.projectCovers.greenTrack,
    contributorAvatars: [
      ASSETS.home.avatars.meena,
      ASSETS.home.avatars.karthik,
      ASSETS.home.avatars.divya,
    ],
    extraContributors: 3,
    isDemo: true,
  },
  {
    id: 'home-proj-3',
    title: 'Virtual Lab Simulator',
    category: 'AR/VR',
    description: 'An immersive learning platform for core engineering concepts.',
    coverImage: ASSETS.home.projectCovers.virtualLabSimulator,
    contributorAvatars: [
      ASSETS.home.avatars.divya,
      ASSETS.home.avatars.rohan,
      ASSETS.home.avatars.ananya,
    ],
    extraContributors: 5,
    isDemo: true,
  },
];

export const COMMUNITY_FEED_FILTERS: CommunityFeedCategory[] = [
  'All Posts',
  'Projects',
  'Ideas',
  'Team Up',
  'Updates',
];

export const HOME_DEMO_POSTS: HomeDemoPost[] = [
  {
    id: 'home-post-1',
    authorName: 'Ananya R',
    authorMeta: 'AI & DS · 3rd Year',
    authorAvatar: ASSETS.home.avatars.ananya,
    timeAgo: '2h ago',
    category: 'Team Up',
    content:
      "Looking for teammates to build an AI-powered college event planner! If you're interested in ML, frontend or UI/UX, let's connect! 🚀",
    hashtags: ['#AI', '#WebDev', '#TeamUp'],
    likesCount: 24,
    commentsCount: 6,
    isDemo: true,
  },
  {
    id: 'home-post-2',
    authorName: 'Karthik V',
    authorMeta: 'CSE · 3rd Year',
    authorAvatar: ASSETS.home.avatars.karthik,
    timeAgo: '4h ago',
    category: 'Projects',
    content:
      'Just wrapped up the ESP32 telemetry prototype for our campus energy dashboard in IDEA Lab. Happy to walk anyone through the MQTT setup.',
    hashtags: ['#IoT', '#GreenTrack', '#Hardware'],
    likesCount: 31,
    commentsCount: 9,
    isDemo: true,
  },
  {
    id: 'home-post-3',
    authorName: 'Meena R',
    authorMeta: 'ECE · 3rd Year',
    authorAvatar: ASSETS.home.avatars.meena,
    timeAgo: '6h ago',
    category: 'Ideas',
    content:
      'What if we built an interactive circuit troubleshooting companion using WebXR for 1st-year lab sessions? Looking for early feedback.',
    hashtags: ['#ARVR', '#EdTech', '#IdeaLab'],
    likesCount: 19,
    commentsCount: 5,
    isDemo: true,
  },
  {
    id: 'home-post-4',
    authorName: 'Divya S',
    authorMeta: 'CSE · 4th Year',
    authorAvatar: ASSETS.home.avatars.divya,
    timeAgo: '1d ago',
    category: 'Updates',
    content:
      'Workstations 3 and 4 at the IDEA Lab prototyping bay now have the updated logic analyzers and Jetson Nano kits ready for student teams.',
    hashtags: ['#CampusLab', '#Updates', '#Makers'],
    likesCount: 42,
    commentsCount: 11,
    isDemo: true,
  },
];

export const HOME_DEMO_EVENTS: HomeDemoEvent[] = [
  {
    id: 'home-event-1',
    title: 'AI Innovation Workshop',
    month: 'JAN',
    day: '18',
    location: 'IDEA LAB',
    timeRange: '10:00 AM – 12:30 PM',
    thumbnail: ASSETS.home.eventThumbnails.aiInnovationWorkshop,
    isDemo: true,
  },
];

export const HOME_DEMO_LEADERBOARD: HomeDemoLeaderboardEntry[] = [
  {
    rank: 1,
    name: 'Divya S',
    subtitle: '4th Year · CSE',
    avatar: ASSETS.home.avatars.divya,
    points: 520,
    isDemo: true,
  },
  {
    rank: 2,
    name: 'Arun K',
    subtitle: '3rd Year · AI & DS',
    avatar: ASSETS.home.avatars.arun,
    points: 470,
    isDemo: true,
  },
  {
    rank: 3,
    name: 'Meena R',
    subtitle: '3rd Year · ECE',
    avatar: ASSETS.home.avatars.meena,
    points: 430,
    isDemo: true,
  },
];

export const HOME_DEMO_AVAILABLE_STUDENTS: HomeDemoAvailableStudent[] = [
  {
    id: 'avail-1',
    name: 'Ananya R',
    departmentYear: 'AI & DS · 3rd Year',
    avatar: ASSETS.home.avatars.ananya,
    skills: ['ML', 'Python', 'React'],
    freeSlotIds: ['slot-2', 'slot-3'],
    optedIn: true,
    isDemo: true,
  },
  {
    id: 'avail-2',
    name: 'Arun K',
    departmentYear: 'AI & DS · 3rd Year',
    avatar: ASSETS.home.avatars.arun,
    skills: ['Backend', 'FastAPI', 'Firebase'],
    freeSlotIds: ['slot-2', 'slot-4'],
    optedIn: true,
    isDemo: true,
  },
  {
    id: 'avail-3',
    name: 'Meena R',
    departmentYear: 'ECE · 3rd Year',
    avatar: ASSETS.home.avatars.meena,
    skills: ['IoT', 'PCB Design', 'Embedded C'],
    freeSlotIds: ['slot-3', 'slot-4'],
    optedIn: true,
    isDemo: true,
  },
  {
    id: 'avail-4',
    name: 'Divya S',
    departmentYear: 'CSE · 4th Year',
    avatar: ASSETS.home.avatars.divya,
    skills: ['UI/UX', 'TypeScript', 'Product'],
    freeSlotIds: ['slot-1', 'slot-3'],
    optedIn: true,
    isDemo: true,
  },
];

export const HOME_DEMO_AVAILABLE_COUNT = 12;
