import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandling';
import { resolveProfileAvatarUrl } from '../utils/assets';

export type CommunityFeedCategory =
  | 'All Posts'
  | 'Projects'
  | 'Ideas'
  | 'Team Up'
  | 'Updates';

export const COMMUNITY_FEED_FILTERS: CommunityFeedCategory[] = [
  'All Posts',
  'Projects',
  'Ideas',
  'Team Up',
  'Updates',
];

export interface PublishedProject {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  coverImage: string;
  tags: string[];
  creatorUid: string;
  creatorName: string;
  creatorAvatar: string;
  teamMembers: { uid?: string; name: string; avatar?: string }[];
  likesCount: number;
  status: 'draft' | 'published' | 'archived';
  createdAtMs: number;
}

export interface PublishedCommunityPost {
  id: string;
  authorUid: string;
  authorName: string;
  authorDepartment: string;
  authorYear: string;
  authorAvatar: string;
  category: Exclude<CommunityFeedCategory, 'All Posts'>;
  content: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  status: 'published' | 'archived';
  createdAtMs: number;
  timeAgoLabel: string;
}

export interface CommunityPostComment {
  id: string;
  authorUid: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAtMs: number;
  timeAgoLabel: string;
}

export interface PublishedEvent {
  id: string;
  title: string;
  description: string;
  eventDateMs: number;
  month: string;
  day: string;
  timeRange: string;
  location: string;
  category: string;
  thumbnail: string;
  capacity?: number;
  registeredCount?: number;
  status: 'draft' | 'published' | 'cancelled';
}

export interface ApprovedLeaderboardEntry {
  uid: string;
  rank: number;
  fullName: string;
  department: string;
  academicYear: string;
  avatar: string;
  approvedPoints: number;
  projectsCompleted: number;
  badge: string;
}

function toMillis(ts: unknown): number {
  if (!ts) return 0;
  if (ts instanceof Timestamp) return ts.toMillis();
  if (typeof ts === 'object' && ts !== null && 'toMillis' in ts) {
    const fn = (ts as { toMillis?: () => number }).toMillis;
    if (typeof fn === 'function') return fn();
  }
  if (typeof ts === 'string') {
    const parsed = Date.parse(ts);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function formatRelativeTimestamp(ms: number): string {
  if (!ms) return 'Recently';
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function subscribeToPublishedProjects(
  onData: (projects: PublishedProject[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = 'projects';
  const q = query(collection(db, path), where('status', '==', 'published'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: PublishedProject[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        if (data.status !== 'published') return;
        const createdAtMs = toMillis(data.createdAt);
        const rawTeam = Array.isArray(data.teamMembers) ? data.teamMembers : [];
        const teamMembers = rawTeam
          .filter((m): m is Record<string, unknown> => typeof m === 'object' && m !== null)
          .slice(0, 10)
          .map((m) => ({
            uid: typeof m.uid === 'string' ? m.uid : undefined,
            name: typeof m.name === 'string' ? m.name : 'Team Member',
            avatar: typeof m.avatar === 'string' ? m.avatar : '',
          }));

        items.push({
          id: docSnap.id,
          title: typeof data.title === 'string' ? data.title : 'Untitled Project',
          tagline: typeof data.tagline === 'string' ? data.tagline : '',
          description: typeof data.description === 'string' ? data.description : '',
          category: typeof data.category === 'string' ? data.category : 'Innovation',
          coverImage: typeof data.coverImage === 'string' ? data.coverImage : '',
          tags: Array.isArray(data.tags)
            ? data.tags.filter((t): t is string => typeof t === 'string').slice(0, 12)
            : [],
          creatorUid: typeof data.creatorUid === 'string' ? data.creatorUid : '',
          creatorName: typeof data.creatorName === 'string' ? data.creatorName : 'IDEA Lab Member',
          creatorAvatar: typeof data.creatorAvatar === 'string' ? data.creatorAvatar : '',
          teamMembers,
          likesCount: typeof data.likesCount === 'number' ? data.likesCount : 0,
          status: 'published',
          createdAtMs,
        });
      });

      items.sort((a, b) => b.likesCount - a.likesCount || b.createdAtMs - a.createdAtMs);
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export function subscribeToPublishedCommunityPosts(
  onData: (posts: PublishedCommunityPost[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = 'communityPosts';
  const q = query(collection(db, path), where('status', '==', 'published'));

  return onSnapshot(
    q,
    (snapshot) => {
      const posts: PublishedCommunityPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        if (data.status !== 'published') return;
        const createdAtMs = toMillis(data.createdAt);
        const category =
          data.category === 'Projects' ||
          data.category === 'Ideas' ||
          data.category === 'Team Up' ||
          data.category === 'Updates'
            ? data.category
            : 'Updates';

        const resolvedAvatar =
          resolveProfileAvatarUrl({
            photoURL: typeof data.authorAvatar === 'string' ? data.authorAvatar : '',
            avatarPresetId:
              typeof data.authorAvatarPresetId === 'string' ? data.authorAvatarPresetId : '',
          }) || '';

        posts.push({
          id: docSnap.id,
          authorUid: typeof data.authorUid === 'string' ? data.authorUid : '',
          authorName: typeof data.authorName === 'string' ? data.authorName : 'IDEA Lab Member',
          authorDepartment:
            typeof data.authorDepartment === 'string' ? data.authorDepartment : '',
          authorYear: typeof data.authorYear === 'string' ? data.authorYear : '',
          authorAvatar: resolvedAvatar,
          category,
          content: typeof data.content === 'string' ? data.content : '',
          hashtags: Array.isArray(data.hashtags)
            ? data.hashtags.filter((t): t is string => typeof t === 'string').slice(0, 8)
            : [],
          likesCount: typeof data.likesCount === 'number' ? data.likesCount : 0,
          commentsCount: typeof data.commentsCount === 'number' ? data.commentsCount : 0,
          status: 'published',
          createdAtMs,
          timeAgoLabel: formatRelativeTimestamp(createdAtMs),
        });
      });

      posts.sort((a, b) => b.createdAtMs - a.createdAtMs);
      onData(posts);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function fetchUserLikedPostIds(
  postIds: string[],
  uid: string
): Promise<Set<string>> {
  if (!uid || postIds.length === 0) return new Set();
  const liked = new Set<string>();
  await Promise.all(
    postIds.slice(0, 20).map(async (postId) => {
      try {
        const snap = await getDoc(doc(db, 'communityPosts', postId, 'likes', uid));
        if (snap.exists()) {
          liked.add(postId);
        }
      } catch {
        // Ignore individual read check errors
      }
    })
  );
  return liked;
}

export async function toggleCommunityPostLike(
  postId: string,
  uid: string
): Promise<boolean> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid || !currentUser.emailVerified) {
    throw new Error('Please sign in with a verified account to like posts.');
  }

  const postRef = doc(db, 'communityPosts', postId);
  const likeRef = doc(db, 'communityPosts', postId, 'likes', uid);
  const path = `communityPosts/${postId}/likes/${uid}`;

  try {
    const [postSnap, likeSnap] = await Promise.all([getDoc(postRef), getDoc(likeRef)]);
    if (!postSnap.exists()) {
      throw new Error('This post is no longer available.');
    }
    const currentLikes = Number(postSnap.data().likesCount ?? 0);
    const batch = writeBatch(db);

    if (likeSnap.exists()) {
      batch.delete(likeRef);
      batch.update(postRef, {
        likesCount: Math.max(0, currentLikes - 1),
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      return false;
    }

    batch.set(likeRef, {
      uid,
      createdAt: serverTimestamp(),
    });
    batch.update(postRef, {
      likesCount: currentLikes + 1,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToPostComments(
  postId: string,
  onData: (comments: CommunityPostComment[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = `communityPosts/${postId}/comments`;
  return onSnapshot(
    collection(db, 'communityPosts', postId, 'comments'),
    (snapshot) => {
      const comments: CommunityPostComment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        const createdAtMs = toMillis(data.createdAt);
        comments.push({
          id: docSnap.id,
          authorUid: typeof data.authorUid === 'string' ? data.authorUid : '',
          authorName: typeof data.authorName === 'string' ? data.authorName : 'IDEA Lab Member',
          authorAvatar: typeof data.authorAvatar === 'string' ? data.authorAvatar : '',
          content: typeof data.content === 'string' ? data.content : '',
          createdAtMs,
          timeAgoLabel: formatRelativeTimestamp(createdAtMs),
        });
      });
      comments.sort((a, b) => a.createdAtMs - b.createdAtMs);
      onData(comments);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function addCommunityPostComment(params: {
  postId: string;
  authorUid: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
}): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== params.authorUid || !currentUser.emailVerified) {
    throw new Error('Please sign in with a verified account to reply.');
  }

  const cleanContent = params.content.trim().slice(0, 500);
  if (!cleanContent) {
    throw new Error('Reply cannot be empty.');
  }

  const postRef = doc(db, 'communityPosts', params.postId);
  const commentRef = doc(collection(db, 'communityPosts', params.postId, 'comments'));
  const path = `communityPosts/${params.postId}/comments/${commentRef.id}`;

  try {
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
      throw new Error('This post is no longer available.');
    }
    const currentCount = Number(postSnap.data().commentsCount ?? 0);
    const batch = writeBatch(db);
    batch.set(commentRef, {
      authorUid: params.authorUid,
      authorName: params.authorName.trim().slice(0, 100) || 'IDEA Lab Member',
      ...(params.authorAvatar ? { authorAvatar: params.authorAvatar.slice(0, 1000) } : {}),
      content: cleanContent,
      createdAt: serverTimestamp(),
    });
    batch.update(postRef, {
      commentsCount: currentCount + 1,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToUpcomingEvents(
  onData: (events: PublishedEvent[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = 'events';
  const q = query(collection(db, path), where('status', '==', 'published'));

  return onSnapshot(
    q,
    (snapshot) => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const cutoffMs = startOfToday.getTime();

      const events: PublishedEvent[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        if (data.status !== 'published') return;
        const eventDateMs = toMillis(data.eventDate);
        if (!eventDateMs || eventDateMs < cutoffMs) return;

        const d = new Date(eventDateMs);
        events.push({
          id: docSnap.id,
          title: typeof data.title === 'string' ? data.title : 'IDEA LAB Event',
          description: typeof data.description === 'string' ? data.description : '',
          eventDateMs,
          month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
          day: String(d.getDate()).padStart(2, '0'),
          timeRange: typeof data.timeRange === 'string' ? data.timeRange : '',
          location: typeof data.location === 'string' ? data.location : 'IDEA LAB',
          category: typeof data.category === 'string' ? data.category : 'Workshop',
          thumbnail: typeof data.thumbnail === 'string' ? data.thumbnail : '',
          capacity: typeof data.capacity === 'number' ? data.capacity : undefined,
          registeredCount:
            typeof data.registeredCount === 'number' ? data.registeredCount : undefined,
          status: 'published',
        });
      });

      events.sort((a, b) => a.eventDateMs - b.eventDateMs);
      onData(events);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export function subscribeToApprovedLeaderboard(
  onData: (entries: ApprovedLeaderboardEntry[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = 'leaderboard';
  const q = query(collection(db, path), where('status', '==', 'active'));

  return onSnapshot(
    q,
    (snapshot) => {
      const raw: Omit<ApprovedLeaderboardEntry, 'rank'>[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        if (data.status !== 'active') return;
        const approvedPoints =
          typeof data.approvedPoints === 'number' ? data.approvedPoints : 0;
        if (approvedPoints <= 0) return;

        const avatar =
          resolveProfileAvatarUrl({
            photoURL: typeof data.photoURL === 'string' ? data.photoURL : '',
            avatarPresetId:
              typeof data.avatarPresetId === 'string' ? data.avatarPresetId : '',
          }) || '';

        raw.push({
          uid: typeof data.uid === 'string' ? data.uid : docSnap.id,
          fullName: typeof data.fullName === 'string' ? data.fullName : 'IDEA Lab Member',
          department: typeof data.department === 'string' ? data.department : '',
          academicYear: typeof data.academicYear === 'string' ? data.academicYear : '',
          avatar,
          approvedPoints,
          projectsCompleted:
            typeof data.projectsCompleted === 'number' ? data.projectsCompleted : 0,
          badge: typeof data.badge === 'string' ? data.badge : 'Innovator',
        });
      });

      raw.sort(
        (a, b) =>
          b.approvedPoints - a.approvedPoints || a.fullName.localeCompare(b.fullName)
      );

      const ranked: ApprovedLeaderboardEntry[] = raw.map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
      }));
      onData(ranked);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}
