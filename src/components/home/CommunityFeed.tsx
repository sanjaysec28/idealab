import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import {
  COMMUNITY_FEED_FILTERS,
  CommunityFeedCategory,
  HOME_DEMO_POSTS,
} from '../../data/homeDemoData';
import { CommunityPostCard } from './CommunityPostCard';

export const CommunityFeed: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<CommunityFeedCategory>('All Posts');
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>([]);

  const visiblePosts = useMemo(() => {
    if (selectedFilter === 'All Posts') {
      return HOME_DEMO_POSTS.slice(0, 1);
    }
    return HOME_DEMO_POSTS.filter((post) => post.category === selectedFilter);
  }, [selectedFilter]);

  const toggleLike = (postId: string) => {
    setLikedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
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

      {/* Demo Posts */}
      <div className="space-y-3">
        {visiblePosts.map((post) => (
          <CommunityPostCard
            key={post.id}
            post={post}
            isLiked={likedPostIds.includes(post.id)}
            isBookmarked={bookmarkedPostIds.includes(post.id)}
            onToggleLike={toggleLike}
            onToggleBookmark={toggleBookmark}
          />
        ))}
      </div>
    </section>
  );
};
