import { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: 'First Build',
    description: 'Published your very first project to the IDEA Lab community portfolio.',
    iconName: 'Rocket',
    category: 'Projects',
    unlockedAt: 'Oct 12, 2026',
    isUnlocked: true,
    points: 50
  },
  {
    id: 'ach-2',
    title: 'Code Contributor',
    description: 'Collaborated with 3+ peers on a campus innovation project.',
    iconName: 'Users',
    category: 'Collaboration',
    unlockedAt: 'Oct 28, 2026',
    isUnlocked: true,
    points: 100
  },
  {
    id: 'ach-3',
    title: 'Hackathon Finalist',
    description: 'Participated and successfully completed a 24-hour campus hackathon.',
    iconName: 'Trophy',
    category: 'Events',
    unlockedAt: 'Nov 05, 2026',
    isUnlocked: true,
    points: 200
  },
  {
    id: 'ach-4',
    title: 'Idea Generator',
    description: 'Submitted 5 innovative project concepts to the community idea board.',
    iconName: 'Lightbulb',
    category: 'Innovation',
    isUnlocked: false,
    points: 150
  },
  {
    id: 'ach-5',
    title: 'Master Maker',
    description: 'Earned over 1,000 innovation points on the campus leaderboard.',
    iconName: 'Award',
    category: 'Milestone',
    isUnlocked: false,
    points: 300
  },
  {
    id: 'ach-6',
    title: 'Workshop Expert',
    description: 'Attended 5 advanced IDEA Lab technical masterclasses.',
    iconName: 'BookOpen',
    category: 'Learning',
    isUnlocked: false,
    points: 120
  }
];
