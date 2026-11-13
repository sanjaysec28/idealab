import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Check,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
} from 'lucide-react';
import {
  addCommunityPostComment,
  CommunityPostComment,
  PublishedCommunityPost,
  subscribeToPostComments,
} from '../../services/homeDataService';
import { SafeMediaImage } from './SafeMediaImage';

interface CommunityPostCardProps {
  post: PublishedCommunityPost;
  currentUid: string;
  currentUserName: string;
  currentUserAvatar: string;
  isLiked: boolean;
  isLikePending?: boolean;
  isBookmarked: boolean;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
}

export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  post,
  currentUid,
  currentUserName,
  currentUserAvatar,
  isLiked,
  isLikePending = false,
  isBookmarked,
  onToggleLike,
  onToggleBookmark,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [comments, setComments] = useState<CommunityPostComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    if (!showReplies) return;
    setLoadingComments(true);
    setReplyError(null);
    const unsubscribe = subscribeToPostComments(
      post.id,
      (items) => {
        setComments(items);
        setLoadingComments(false);
      },
      (err) => {
        setReplyError(err.message || 'Unable to load replies.');
        setLoadingComments(false);
      }
    );
    return () => unsubscribe();
  }, [post.id, showReplies]);

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(post.content);
      }
    } catch {
      // Clipboard optional in sandboxed iframes
    }
    setCopiedShare(true);
    window.setTimeout(() => setCopiedShare(false), 1800);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || submittingReply || !currentUid) return;
    setSubmittingReply(true);
    setReplyError(null);
    try {
      await addCommunityPostComment({
        postId: post.id,
        authorUid: currentUid,
        authorName: currentUserName,
        authorAvatar: currentUserAvatar,
        content: replyText,
      });
      setReplyText('');
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : 'Unable to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const authorMeta = [post.authorDepartment, post.authorYear]
    .filter(Boolean)
    .join(' · ') || 'IDEA LAB Member';

  return (
    <article className="rounded-2xl bg-[#FAF8F5]/75 border border-[#EAE6E1] p-4 space-y-3">
      {/* Author Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <SafeMediaImage
            src={post.authorAvatar}
            alt={post.authorName}
            variant="avatar"
            lazy
            className="w-10 h-10 rounded-full object-cover border border-[#EAE6E1] shrink-0 text-xs"
          />
          <div className="min-w-0">
            <h3 className="text-[13px] font-bold text-[#202124] truncate">
              {post.authorName}
            </h3>
            <p className="text-[11px] text-[#777777] truncate">{authorMeta}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 relative">
          <span className="text-[11px] text-[#777777] font-medium">{post.timeAgoLabel}</span>
          <button
            type="button"
            onClick={() => setShowMoreMenu((prev) => !prev)}
            aria-label="Post options"
            className="w-7 h-7 rounded-lg text-[#777777] hover:text-[#202124] hover:bg-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-8 w-40 bg-white rounded-xl shadow-lg border border-[#EAE6E1] p-1.5 z-20 text-xs">
              <Link
                to="/community"
                onClick={() => setShowMoreMenu(false)}
                className="block px-2.5 py-1.5 rounded-lg text-[#202124] hover:bg-[#FAF8F5] font-medium"
              >
                Open Community
              </Link>
              <button
                type="button"
                onClick={() => {
                  void handleShare();
                  setShowMoreMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-[#202124] hover:bg-[#FAF8F5] font-medium cursor-pointer"
              >
                Copy Post Text
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Copy */}
      <p className="text-[13px] text-[#202124] leading-relaxed">{post.content}</p>

      {/* Hashtags */}
      {post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.hashtags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-[#FFF0F1] text-[#E63946] text-[11px] font-semibold"
            >
              {tag.startsWith('#') ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {/* Engagement Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#EAE6E1]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={isLikePending}
            onClick={() => onToggleLike(post.id)}
            aria-pressed={isLiked}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer tabular-nums disabled:opacity-60 ${
              isLiked ? 'text-[#E63946]' : 'text-[#555555] hover:text-[#E63946]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{post.likesCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReplies((prev) => !prev)}
            aria-expanded={showReplies}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#555555] hover:text-[#202124] transition-colors cursor-pointer tabular-nums"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentsCount}</span>
          </button>

          <button
            type="button"
            onClick={() => void handleShare()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#555555] hover:text-[#202124] transition-colors cursor-pointer"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#177E48]" />
                <span className="text-[#177E48]">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onToggleBookmark(post.id)}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
          aria-pressed={isBookmarked}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            isBookmarked
              ? 'bg-[#FFF0F1] text-[#E63946]'
              : 'text-[#777777] hover:text-[#202124] hover:bg-white'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {showReplies && (
        <div className="pt-2.5 border-t border-[#EAE6E1]/70 space-y-2.5">
          {loadingComments ? (
            <div className="flex items-center gap-1.5 text-[11px] text-[#777777]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E63946]" />
              <span>Loading replies...</span>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-[11px] text-[#777777]">No replies yet. Start the discussion below.</p>
          ) : (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-xl bg-white border border-[#EAE6E1] px-3 py-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#202124] truncate">{comment.authorName}</span>
                    <span className="text-[10px] text-[#777777] shrink-0">
                      {comment.timeAgoLabel}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#555555] mt-0.5">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          {replyError && (
            <p className="text-[11px] font-medium text-[#E63946]">{replyError}</p>
          )}

          <form onSubmit={(e) => void handleSubmitReply(e)} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              maxLength={500}
              placeholder="Write a reply..."
              className="flex-1 h-9 bg-white border border-[#EAE6E1] focus:border-[#E63946] rounded-xl px-3 text-xs text-[#202124] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || submittingReply}
              aria-label="Send reply"
              className="h-9 px-3 rounded-xl bg-[#E63946] hover:bg-[#D62839] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
};
