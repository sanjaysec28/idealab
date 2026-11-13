import { Project } from '../types';
import { MEMBERS } from './members';
import { ASSETS, getProjectImage } from '../utils/assets';

export const PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'CampusAI Smart Attendance & Smart Classroom',
    tagline: 'Automated face recognition attendance system with real-time analytics for lecture halls.',
    description: 'CampusAI utilizes high-accuracy edge computer vision models to log student attendance seamlessly while providing professors with real-time engagement and comprehension sentiment dashboards.',
    category: 'AI / ML',
    thumbnail: getProjectImage(0),
    images: [getProjectImage(0), ASSETS.campus.ideaLabInterior],
    authorId: MEMBERS[0].id,
    authorName: MEMBERS[0].name,
    authorAvatar: MEMBERS[0].avatar,
    teamMembers: [
      { name: MEMBERS[1].name, avatar: MEMBERS[1].avatar },
      { name: MEMBERS[2].name, avatar: MEMBERS[2].avatar }
    ],
    likesCount: 142,
    commentsCount: 28,
    githubUrl: 'https://github.com/saveetha-idealab/campus-ai',
    liveUrl: 'https://campus-ai-demo.sec.ac.in',
    tags: ['Python', 'OpenCV', 'React', 'FastAPI', 'Edge AI'],
    createdAt: '2 days ago',
    featured: true
  },
  {
    id: 'proj-2',
    title: 'EcoTrash IoT Smart Bin Network',
    tagline: 'Solar-powered smart waste segregation bins with cloud level-monitoring.',
    description: 'An IoT ecosystem deployed across Saveetha campus that automatically segregates biodegradable and non-biodegradable waste using inductive and optical sensors, optimizing municipal collection routes.',
    category: 'IoT & Hardware',
    thumbnail: getProjectImage(1),
    images: [getProjectImage(1), ASSETS.campus.makerspace],
    authorId: MEMBERS[3].id,
    authorName: MEMBERS[3].name,
    authorAvatar: MEMBERS[3].avatar,
    teamMembers: [
      { name: MEMBERS[4].name, avatar: MEMBERS[4].avatar }
    ],
    likesCount: 98,
    commentsCount: 15,
    githubUrl: 'https://github.com/saveetha-idealab/ecotrash-iot',
    tags: ['Arduino', 'ESP32', 'MQTT', 'Node.js', 'React Native'],
    createdAt: '1 week ago',
    featured: true
  },
  {
    id: 'proj-3',
    title: 'MediConnect Emergency Drone Dispatch',
    tagline: 'Autonomous drone delivery network for first-aid kits and emergency blood supplies.',
    description: 'Designed for rapid campus and rural medical transit, MediConnect features GPS waypoint autonomous flight and obstacle avoidance to deliver critical medical supplies within minutes.',
    category: 'Robotics',
    thumbnail: getProjectImage(2),
    images: [getProjectImage(2)],
    authorId: MEMBERS[5].id,
    authorName: MEMBERS[5].name,
    authorAvatar: MEMBERS[5].avatar,
    teamMembers: [
      { name: MEMBERS[6].name, avatar: MEMBERS[6].avatar },
      { name: MEMBERS[7].name, avatar: MEMBERS[7].avatar }
    ],
    likesCount: 215,
    commentsCount: 42,
    githubUrl: 'https://github.com/saveetha-idealab/mediconnect-drone',
    liveUrl: 'https://mediconnect.sec.ac.in',
    tags: ['ROS', 'Python', 'PX4', 'Computer Vision'],
    createdAt: '2 weeks ago',
    featured: true
  },
  {
    id: 'proj-4',
    title: 'Saveetha Peer-to-Peer Study Hub',
    tagline: 'Collaborative flashcard and notes marketplace with AI quiz generator.',
    description: 'A web app built by students for students to share lecture notes, organize peer study groups, and instantly generate interactive practice quizzes using Gemini AI.',
    category: 'Web & Mobile',
    thumbnail: getProjectImage(3),
    images: [getProjectImage(3)],
    authorId: MEMBERS[8].id,
    authorName: MEMBERS[8].name,
    authorAvatar: MEMBERS[8].avatar,
    teamMembers: [
      { name: MEMBERS[9].name, avatar: MEMBERS[9].avatar }
    ],
    likesCount: 84,
    commentsCount: 12,
    githubUrl: 'https://github.com/saveetha-idealab/peer-study',
    liveUrl: 'https://study.sec.ac.in',
    tags: ['React', 'TailwindCSS', 'Firebase', 'Gemini API'],
    createdAt: '3 weeks ago',
    featured: false
  },
  {
    id: 'proj-5',
    title: 'SolarSmart PV Tracker Optimizer',
    tagline: 'Dual-axis solar tracker with AI weather prediction for maximum energy harvest.',
    description: 'Maximizes solar panel energy generation by 32% using light-dependent resistors and predictive meteorological machine learning models.',
    category: 'Sustainability',
    thumbnail: getProjectImage(4),
    images: [getProjectImage(4)],
    authorId: MEMBERS[10].id,
    authorName: MEMBERS[10].name,
    authorAvatar: MEMBERS[10].avatar,
    teamMembers: [],
    likesCount: 76,
    commentsCount: 9,
    githubUrl: 'https://github.com/saveetha-idealab/solar-tracker',
    tags: ['Hardware', 'IoT', 'Python', 'Renewable Energy'],
    createdAt: '1 month ago',
    featured: false
  },
  {
    id: 'proj-6',
    title: 'CampusAR Navigation Guide',
    tagline: 'Augmented reality indoor and outdoor campus navigation for new students.',
    description: 'Point your smartphone camera anywhere on Saveetha campus to view AR directional arrows, lab schedules, and faculty office hours in real time.',
    category: 'Web & Mobile',
    thumbnail: getProjectImage(5),
    images: [getProjectImage(5)],
    authorId: MEMBERS[12].id,
    authorName: MEMBERS[12].name,
    authorAvatar: MEMBERS[12].avatar,
    teamMembers: [
      { name: MEMBERS[13].name, avatar: MEMBERS[13].avatar }
    ],
    likesCount: 130,
    commentsCount: 19,
    githubUrl: 'https://github.com/saveetha-idealab/campus-ar',
    tags: ['Three.js', 'WebXR', 'React', 'GIS'],
    createdAt: '1 month ago',
    featured: false
  }
];
