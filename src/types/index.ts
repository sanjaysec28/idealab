export interface Member {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  avatar: string;
  coverImage: string;
  bio: string;
  skills: string[];
  projectsCount: number;
  ideasCount: number;
  points: number;
  badge: string;
  github?: string;
  linkedin?: string;
  email: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'AI / ML' | 'IoT & Hardware' | 'Web & Mobile' | 'Sustainability' | 'Robotics';
  thumbnail: string;
  images: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  teamMembers: { name: string; avatar: string }[];
  likesCount: number;
  commentsCount: number;
  githubUrl?: string;
  liveUrl?: string;
  tags: string[];
  createdAt: string;
  featured?: boolean;
}

export interface Idea {
  id: string;
  title: string;
  problem: string;
  solution: string;
  category: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  upvotes: number;
  status: 'Brainstorming' | 'Looking for Teammates' | 'Prototyping' | 'Validated';
  createdAt: string;
  tags: string[];
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: 'Workshop' | 'Hackathon' | 'Tech Talk' | 'Demo Day' | 'Meetup';
  banner: string;
  capacity: number;
  registeredCount: number;
  isRegistered?: boolean;
  speaker?: {
    name: string;
    role: string;
    avatar: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  memberId: string;
  name: string;
  department: string;
  avatar: string;
  points: number;
  projectsCompleted: number;
  badge: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  points: number;
}
