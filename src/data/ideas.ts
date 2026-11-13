import { Idea } from '../types';
import { MEMBERS } from './members';

export const IDEAS: Idea[] = [
  {
    id: 'idea-1',
    title: 'Smart EV Charging Slots with Solar Canopy',
    problem: 'Electric vehicle charging spots on campus are frequently occupied by non-EVs or left plugged in after fully charged.',
    solution: 'Install automated smart locks controlled by college ID cards and real-time app notifications when charging completes.',
    category: 'Sustainability & IoT',
    authorId: MEMBERS[14].id,
    authorName: MEMBERS[14].name,
    authorAvatar: MEMBERS[14].avatar,
    upvotes: 64,
    status: 'Looking for Teammates',
    createdAt: '3 days ago',
    tags: ['IoT', 'Solar', 'Smart Campus']
  },
  {
    id: 'idea-2',
    title: 'AI Lab Equipment Booking & Status Monitor',
    problem: 'Students struggle to check which 3D printers, laser cutters, and high-end GPU workstations are currently available in IDEA Lab.',
    solution: 'Build a live sensor-based availability dashboard and reservation app with priority queuing for active project teams.',
    category: 'Web & Hardware',
    authorId: MEMBERS[15].id,
    authorName: MEMBERS[15].name,
    authorAvatar: MEMBERS[15].avatar,
    upvotes: 52,
    status: 'Prototyping',
    createdAt: '5 days ago',
    tags: ['React', 'IoT', 'Makerspace']
  },
  {
    id: 'idea-3',
    title: 'Automated Campus Cafeteria Food Waste Tracker',
    problem: 'Significant food wastage occurs daily in hostel messes without clear tracking or feedback loops.',
    solution: 'Smart weighing stations and a student feedback app that gamifies zero-food-waste targets with canteen discount rewards.',
    category: 'Sustainability',
    authorId: MEMBERS[16].id,
    authorName: MEMBERS[16].name,
    authorAvatar: MEMBERS[16].avatar,
    upvotes: 41,
    status: 'Brainstorming',
    createdAt: '1 week ago',
    tags: ['Analytics', 'Sustainability', 'Gamification']
  },
  {
    id: 'idea-4',
    title: 'Voice-Activated Multilingual Campus Assistant',
    problem: 'First-year students and campus visitors often get lost or have trouble finding administrative offices quickly.',
    solution: 'An offline-capable voice assistant kiosk deployed across campus supporting Tamil and English for instant campus guidance.',
    category: 'AI / ML',
    authorId: MEMBERS[17].id,
    authorName: MEMBERS[17].name,
    authorAvatar: MEMBERS[17].avatar,
    upvotes: 38,
    status: 'Validated',
    createdAt: '2 weeks ago',
    tags: ['NLP', 'Speech Recognition', 'AI']
  }
];
