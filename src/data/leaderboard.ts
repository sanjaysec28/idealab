import { LeaderboardEntry } from '../types';
import { MEMBERS } from './members';

export const LEADERBOARD: LeaderboardEntry[] = MEMBERS.slice(0, 20).map((m, idx) => ({
  rank: idx + 1,
  memberId: m.id,
  name: m.name,
  department: m.department,
  avatar: m.avatar,
  points: 1200 - (idx * 45),
  projectsCompleted: 6 - (idx % 4),
  badge: m.badge
})).sort((a, b) => b.points - a.points).map((entry, idx) => ({ ...entry, rank: idx + 1 }));
