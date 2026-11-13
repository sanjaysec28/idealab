import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  COMMUNITY_FEED_FILTERS,
  CommunityFeedCategory,
  fetchUserLikedPostIds,
  PublishedCommunityPost,
  subscribeToPublishedCommunityPosts,
  toggleCommunityPostLike,
} from '../../services/homeDataService';
import { resolveProfileAvatarUrl } from '../../utils/assets';
import { CommunityPostCard } from './CommunityPostCard';

export const CommunityFeed: React.FC = () => {
  const { user, studentProfile, studentData } = useAuth();
  const uid = user?.uid || '';
  const currentUserName = studentProfile?.fullName || user?.displayName || studentData.name;
  const currentUserAvatar =
    resolveProfileAvatarUrl({
      photoURL: studentProfile?.photoURL || user?.photoURL,
      avatarPresetId: studentProfile?.avatarPresetId,
    }) || '';

  const [selectedFilter, setSelectedFilter] = useState<CommunityFeedCategory>('All Posts');
  const [posts, setPosts] = useState<PublishedCommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<string>>(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const unsubscribe = subscribeToPublishedCommunityPosts(
      (items) => {
        setPosts(items);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || 'Unable to load community posts.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!uid || posts.length === 0) {
      setLikedPostIds(new Set());
      return;
    }
    let active = true;
    void fetchUserLikedPostIds(
      posts.map((p) => p.id),
      uid
    ).then((liked) => {
      if (active) setLikedPostIds(liked);
    });
    return () => {
      active = false;
    };
  }, [posts, uid]);

  const visiblePosts = useMemo(() => {
    if (selectedFilter === 'All Posts') {
      return posts.slice(0, 3);
    }
    return posts.filter((post) => post.category === selectedFilter).slice(0, 3);
  }, [posts, selectedFilter]);

  const handleToggleLike = async (postId: string) => {
    if (!uid || pendingLikeIds.has(postId)) return;
    setPendingLikeIds((prev) => new Set(prev).add(postId));
    try {
      const nowLiked = await toggleCommunityPostLike(postId, uid);
      setLikedPostIds((prev) => {
        const next = new Set(prev);
        if (nowLiked) next.add(postId);
        else next.delete(postId);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update like.');
    } finally {
      setPendingLikeIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const toggleBookmark = (postId: string) => {
    setBookmarkedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  return (
    <section className="bg-white rounded-[22px] border border-[#EAE6E1] shadow-[0_2px_12px_rgba(32,33,36,0.03)] p-5 space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-4.5 h-4.5 text-[#E63946]" />
          <h2 className="text-[15px] font-bold text-[#202124]">Community Feed</h2>
        </div>

        <Link
          to="/community"
          className="text-xs font-bold text-[#E63946] hover:underline shrink-0"
        >
          See All
        </Link>
      </div>

      {/* Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
        {COMMUNITY_FEED_FILTERS.map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#E63946] text-white'
                  : 'bg-[#FAF8F5] text-[#555555] hover:text-[#202124] border border-[#EAE6E1]'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl bg-[#FFF0F1] border border-[#E63946]/25 p-4 flex items-start gap-2.5 text-xs text-[#E63946]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Could not load community feed</p>
            <p className="text-[11px] text-[#555555] mt-0.5">{error}</p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="space-y-3" aria-busy="true">
          <div className="rounded-2xl bg-[#FAF8F5]/75 border border-[#EAE6E1] p-4 space-y-3 animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#EAE6E1]" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-32 rounded bg-[#EAE6E1]" />
                <div className="h-2.5 w-24 rounded bg-[#EAE6E1]/80" />
              </div>
            </div>
            <div className="h-3.5 w-full rounded bg-[#EAE6E1]" />
            <div className="h-3.5 w-4/5 rounded bg-[#EAE6E1]/80" />
          </div>
        </div>
      ) : visiblePosts.length === 0 ? (
        <div className="rounded-2xl bg-[#FAF8F5] border border-[#EAE6E1] p-6 text-center space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0F1] text-[#E63946] flex items-center justify-center mx-auto">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#202124]">
              {selectedFilter === 'All Posts'
                ? 'No published community posts yet'
                : `No posts in ${selectedFilter} yet`}
            </p>
            <p className="text-[11px] text-[#777777] mt-0.5">
              Real updates, team-up requests, and project discussions from verified students will appear here.
            </p>
          </div>
          <Link
            to="/community"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF0F1] border border-[#EAE6E1] text-xs font-bold text-[#E63946] transition-colors"
          >
            <span>Explore Community</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visiblePosts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              currentUid={uid}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              isLiked={likedPostIds.has(post.id)}
              isLikePending={pendingLikeIds.has(post.id)}
              isBookmarked={bookmarkedPostIds.includes(post.id)}
              onToggleLike={(id) => void handleToggleLike(id)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      )}
    </section>
  );
};
