import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  RefreshCw, 
  Send, 
  EyeOff, 
  Eye, 
  Trash2, 
  ExternalLink, 
  Heart, 
  AlertCircle, 
  CornerDownRight,
  X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { 
  getInstagramSettings, 
  getInstagramMedia, 
  getInstagramComments, 
  replyToInstagramComment, 
  hideInstagramComment, 
  deleteInstagramComment 
} from '../api/crm.api';
import type { InstagramMediaItem, InstagramCommentItem } from '../models/crm.models';
import { Link } from 'react-router-dom';

const renderFormattedText = (text: string) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-purple-600 hover:text-purple-700 underline font-medium break-all"
          onClick={(e) => e.stopPropagation()}
        >
          <span>{part}</span>
          <ExternalLink size={11} className="inline ml-0.5 opacity-70" />
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const CommentsManager: React.FC = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<{ name: string; id: string } | null>(null);
  const [mediaList, setMediaList] = useState<InstagramMediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<InstagramMediaItem | null>(null);
  const [comments, setComments] = useState<InstagramCommentItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [replyTargetComment, setReplyTargetComment] = useState<InstagramCommentItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<InstagramCommentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  // Graph returns results in pages; keep the `after` cursors so the agent can reach
  // older posts and long comment threads rather than only the most recent page.
  const [mediaCursor, setMediaCursor] = useState<string | null>(null);
  const [commentCursor, setCommentCursor] = useState<string | null>(null);
  const [isLoadingMoreMedia, setIsLoadingMoreMedia] = useState(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);

  useEffect(() => {
    checkConnectionAndLoad();
  }, []);

  const checkConnectionAndLoad = async () => {
    setIsLoadingMedia(true);
    try {
      const settingsRes = await getInstagramSettings();
      if (settingsRes.Success && settingsRes.Data?.isConnected) {
        setIsConnected(true);
        setConnectedAccount({
          name: settingsRes.Data.page_name || 'Connected Instagram Page',
          id: settingsRes.Data.business_id || ''
        });
        await fetchMedia();
      } else {
        setIsConnected(false);
        setIsLoadingMedia(false);
      }
    } catch (err: any) {
      console.error('Failed to load Instagram settings:', err);
      setIsConnected(false);
      setIsLoadingMedia(false);
    }
  };

  const fetchMedia = async () => {
    setIsLoadingMedia(true);
    try {
      const res = await getInstagramMedia(25);
      if (res.Success && res.Data?.data) {
        setMediaList(res.Data.data);
        setMediaCursor(res.Data.paging?.cursors?.after && res.Data.paging?.next ? res.Data.paging.cursors.after : null);
        if (res.Data.data.length > 0) {
          handleSelectMedia(res.Data.data[0]);
        }
      } else {
        setMediaList([]);
        setMediaCursor(null);
      }
    } catch (err: any) {
      console.error('Failed to load media:', err);
      toast.error('Failed to load Instagram posts: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleSelectMedia = async (media: InstagramMediaItem) => {
    setSelectedMedia(media);
    setIsLoadingComments(true);
    setReplyTargetComment(null);
    setReplyText('');
    try {
      const res = await getInstagramComments(media.id, 50);
      if (res.Success && res.Data?.data) {
        setComments(res.Data.data);
        setCommentCursor(res.Data.paging?.cursors?.after && res.Data.paging?.next ? res.Data.paging.cursors.after : null);
      } else {
        setComments([]);
        setCommentCursor(null);
      }
    } catch (err: any) {
      console.error('Failed to load comments:', err);
      toast.error('Failed to load comments: ' + (err.response?.data?.message || err.message));
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLoadMoreMedia = async () => {
    if (!mediaCursor || isLoadingMoreMedia) return;
    setIsLoadingMoreMedia(true);
    try {
      const res = await getInstagramMedia(25, mediaCursor);
      if (res.Success && res.Data?.data) {
        setMediaList(prev => [...prev, ...res.Data!.data]);
        setMediaCursor(res.Data.paging?.cursors?.after && res.Data.paging?.next ? res.Data.paging.cursors.after : null);
      } else {
        setMediaCursor(null);
      }
    } catch (err: any) {
      toast.error('Failed to load more posts: ' + (err.response?.data?.Message || err.message));
    } finally {
      setIsLoadingMoreMedia(false);
    }
  };

  const handleLoadMoreComments = async () => {
    if (!selectedMedia || !commentCursor || isLoadingMoreComments) return;
    setIsLoadingMoreComments(true);
    try {
      const res = await getInstagramComments(selectedMedia.id, 50, commentCursor);
      if (res.Success && res.Data?.data) {
        setComments(prev => [...prev, ...res.Data!.data]);
        setCommentCursor(res.Data.paging?.cursors?.after && res.Data.paging?.next ? res.Data.paging.cursors.after : null);
      } else {
        setCommentCursor(null);
      }
    } catch (err: any) {
      toast.error('Failed to load more comments: ' + (err.response?.data?.Message || err.message));
    } finally {
      setIsLoadingMoreComments(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTargetComment || !replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const res = await replyToInstagramComment(replyTargetComment.id, replyText.trim());
      if (res.Success) {
        toast.success('Public reply posted successfully on Instagram!');
        const newReplyObj = {
          id: res.Data?.id || `reply-${Date.now()}`,
          text: replyText.trim(),
          timestamp: new Date().toISOString(),
          username: connectedAccount?.name || 'You'
        };

        setComments(prev => prev.map(c => {
          if (c.id === replyTargetComment.id) {
            const existingReplies = c.replies?.data || [];
            return {
              ...c,
              replies: {
                data: [...existingReplies, newReplyObj]
              }
            };
          }
          return c;
        }));

        setReplyText('');
        setReplyTargetComment(null);
      } else {
        toast.error('Failed to reply: ' + (res.Message || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Reply failed:', err);
      toast.error('Reply failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleToggleHide = async (comment: InstagramCommentItem) => {
    const targetState = !comment.hidden;
    setActionLoadingId(comment.id);
    try {
      const res = await hideInstagramComment(comment.id, targetState);
      if (res.Success) {
        toast.success(targetState ? 'Comment hidden from public view.' : 'Comment unhidden.');
        setComments(prev => prev.map(c => c.id === comment.id ? { ...c, hidden: targetState } : c));
      } else {
        toast.error('Failed to update comment visibility: ' + (res.Message || ''));
      }
    } catch (err: any) {
      console.error('Toggle hide failed:', err);
      toast.error('Action failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteInstagramComment(commentToDelete.id);
      if (res.Success) {
        toast.success('Comment deleted from Instagram.');
        setComments(prev => prev.filter(c => c.id !== commentToDelete.id));
        setCommentToDelete(null);
      } else {
        toast.error('Failed to delete comment: ' + (res.Message || ''));
      }
    } catch (err: any) {
      console.error('Delete failed:', err);
      toast.error('Delete failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Comments</h1>
          <p className="page-sub">
            Moderate, reply publicly, hide, and manage comments across your connected Instagram posts in real time.
          </p>
        </div>

        <div className="page-actions">
          {isConnected && (
            <span className="chip chip-dot chip-go">{connectedAccount?.name}</span>
          )}
          <button
            onClick={() => {
              if (selectedMedia) handleSelectMedia(selectedMedia);
              else fetchMedia();
            }}
            disabled={isLoadingMedia || isLoadingComments}
            className="btn"
          >
            <RefreshCw size={15} className={isLoadingMedia || isLoadingComments ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {isConnected === false && (
        <div className="notice notice-warn mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-signal-warn" />
            <div>
              <p className="notice-title">Instagram isn't connected</p>
              <p className="notice-body">
                Link your Facebook Page and Instagram professional account to manage and reply to comments.
              </p>
            </div>
          </div>
          <Link to="/meta-integration" className="btn btn-primary btn-sm">
            Connect Instagram
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Posts and reels */}
        <section className="surface flex max-h-[460px] flex-col overflow-hidden lg:col-span-5 lg:h-[calc(100dvh-240px)] lg:max-h-none lg:min-h-[560px]">
          <div className="surface-head py-3">
            <h2 className="text-[15px]">
              <InstagramIcon size={17} className="text-ink-soft" />
              Recent posts and reels
            </h2>
            <span className="text-[13px] tabular-nums text-ink-soft">{mediaList.length} items</span>
          </div>

          <div className="premium-scroll flex-1 space-y-2 overflow-y-auto p-3">
            {isLoadingMedia ? (
              <div className="space-y-2" aria-busy="true" aria-label="Loading posts">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex animate-pulse gap-3 rounded-[10px] bg-porcelain p-3">
                    <div className="h-16 w-16 shrink-0 rounded-[8px] bg-porcelain-deep"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-3/4 rounded bg-porcelain-deep"></div>
                      <div className="h-3 w-1/2 rounded bg-porcelain-deep"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : mediaList.length === 0 ? (
              <div className="empty py-12">
                <span className="empty-mark"><InstagramIcon size={22} /></span>
                <p className="empty-title">No posts yet</p>
                <p className="empty-body">Posts and reels from your connected account appear here.</p>
              </div>
            ) : (
              mediaList.map(item => {
                const isSelected = selectedMedia?.id === item.id;
                const thumb = item.thumbnail_url || item.media_url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectMedia(item)}
                    aria-pressed={isSelected}
                    className={`flex w-full gap-3 rounded-xl border p-2.5 text-left transition-all duration-150 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/50 shadow-xs ring-1 ring-purple-500/20'
                        : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[8px] bg-porcelain-deep">
                      {thumb ? (
                        <img src={thumb} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-faint">
                          <InstagramIcon size={22} />
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 rounded bg-black/65 px-1 text-[11px] font-medium text-white">
                        {item.media_type === 'VIDEO' ? 'Reel' : 'Post'}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                      <p className="line-clamp-2 text-[14px] leading-snug text-ink">
                        {item.caption || <span className="text-ink-faint">No caption</span>}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[13px] tabular-nums text-ink-soft">
                        <span className="flex items-center gap-1" aria-label={`${item.like_count ?? 0} likes`}>
                          <Heart size={12} /> {item.like_count ?? 0}
                        </span>
                        <span className="flex items-center gap-1" aria-label={`${item.comments_count ?? 0} comments`}>
                          <MessageSquare size={12} /> {item.comments_count ?? 0}
                        </span>
                        <span>
                          {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}

            {mediaCursor && (
              <button
                onClick={handleLoadMoreMedia}
                disabled={isLoadingMoreMedia}
                aria-busy={isLoadingMoreMedia || undefined}
                className="btn btn-sm btn-block mt-1"
              >
                {isLoadingMoreMedia && <RefreshCw size={13} className="animate-spin" />}
                {isLoadingMoreMedia ? 'Loading…' : 'Load older posts'}
              </button>
            )}
          </div>
        </section>

        {/* Comment thread */}
        <section className="surface flex min-h-[480px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs lg:col-span-7 lg:h-[calc(100dvh-240px)] lg:min-h-[560px]">
          {selectedMedia ? (
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/60 px-4 py-3 sm:px-5">
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-purple-700 border border-purple-200/50">
                    <InstagramIcon size={12} />
                    Selected Post
                  </span>
                  <span className="text-[12px] font-medium text-slate-400">
                    {comments.length} comment{comments.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="mt-1 truncate text-[14px] font-medium text-slate-800" title={selectedMedia.caption}>
                  {selectedMedia.caption || `Post ID: ${selectedMedia.id}`}
                </p>
              </div>
              {selectedMedia.permalink && (
                <a
                  href={selectedMedia.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-purple-600 hover:border-purple-200 transition-all shrink-0"
                >
                  <span>View on Instagram</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center border-b border-slate-200/80 bg-slate-50/60 px-4 py-3 sm:px-5">
              <h2 className="text-[15px] font-semibold text-slate-800">Comments</h2>
            </div>
          )}

          <div className="premium-scroll flex-1 space-y-3.5 overflow-y-auto p-4 sm:p-5 bg-slate-50/30">
            {isLoadingComments ? (
              <div className="space-y-4 py-4" aria-busy="true" aria-label="Loading comments">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-200"></div>
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 w-1/4 rounded bg-slate-200"></div>
                        <div className="h-3 w-1/6 rounded bg-slate-100"></div>
                      </div>
                    </div>
                    <div className="h-4 w-3/4 rounded bg-slate-100 mt-2 sm:pl-[48px]"></div>
                  </div>
                ))}
              </div>
            ) : !selectedMedia ? (
              <div className="empty h-full">
                <span className="empty-mark"><MessageSquare /></span>
                <p className="empty-title">Pick a post</p>
                <p className="empty-body">Choose a post or reel to read, reply to, hide or delete its comments.</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="empty h-full">
                <span className="empty-mark"><MessageSquare /></span>
                <p className="empty-title">No comments yet</p>
                <p className="empty-body">New comments on this post show up here.</p>
              </div>
            ) : (
              comments.map(c => {
                const isHidden = !!c.hidden;
                const isTargetReply = replyTargetComment?.id === c.id;
                // @username, or plain words when Meta returns a commenter without one.
                const handle = c.username ? `@${c.username}` : 'Instagram user';
                const initial = (c.username ? c.username.charAt(0) : 'U').toUpperCase();

                return (
                  <article
                    key={c.id}
                    className={`group relative rounded-2xl border transition-all duration-200 p-4 sm:p-4.5 ${
                      isTargetReply
                        ? 'border-purple-400 bg-purple-50/30 ring-2 ring-purple-500/20 shadow-sm'
                        : isHidden
                          ? 'border-dashed border-slate-300 bg-slate-50/70 opacity-80'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500/15 via-pink-500/15 to-amber-500/15 border border-purple-200/60 text-[13px] font-bold text-purple-700 shadow-2xs">
                          {initial}
                        </div>
                        {/* Name and time stack, so a long handle truncates instead of
                            running under the action buttons on a phone. */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-[14px] text-slate-900 tracking-tight truncate">
                              {handle}
                            </span>
                            {isHidden && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.2 text-[10px] font-semibold text-amber-700 border border-amber-200/60">
                                Hidden
                              </span>
                            )}
                          </div>
                          <span className="block text-[12px] font-normal text-slate-400 mt-0.5">
                            {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(c.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => setReplyTargetComment(isTargetReply ? null : c)}
                          aria-pressed={isTargetReply}
                          aria-label={`Reply to ${handle}`}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all shadow-2xs ${
                            isTargetReply
                              ? 'bg-purple-600 text-white shadow-purple-500/20'
                              : 'bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-transparent'
                          }`}
                        >
                          <Send size={12} className={isTargetReply ? 'rotate-45' : ''} />
                          <span>{isTargetReply ? 'Replying' : 'Reply'}</span>
                        </button>
                        <button
                          onClick={() => handleToggleHide(c)}
                          disabled={actionLoadingId === c.id}
                          aria-busy={actionLoadingId === c.id || undefined}
                          aria-label={isHidden ? `Unhide comment by ${handle}` : `Hide comment by ${handle}`}
                          title={isHidden ? 'Unhide comment' : 'Hide comment'}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          {isHidden ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button
                          onClick={() => setCommentToDelete(c)}
                          aria-label={`Delete comment by ${handle}`}
                          title="Delete comment"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <p className={`mt-2.5 text-[14px] leading-relaxed break-words sm:pl-[48px] ${
                      isHidden ? 'italic text-slate-400' : 'text-slate-700'
                    }`}>
                      {renderFormattedText(c.text)}
                    </p>

                    {c.replies?.data && c.replies.data.length > 0 && (
                      <div className="mt-3.5 space-y-2 border-l-2 border-purple-200/80 pl-3.5 sm:ml-[48px]">
                        {c.replies.data.map(reply => (
                          <div
                            key={reply.id}
                            className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 shadow-2xs transition-colors hover:bg-slate-50"
                          >
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                                <CornerDownRight size={13} className="text-purple-600 shrink-0" />
                                <span>@{reply.username || connectedAccount?.name || 'Reply'}</span>
                                <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[10px] font-semibold uppercase tracking-wider text-purple-700">
                                  Account
                                </span>
                              </div>
                              <span className="text-[11px] font-normal text-slate-400">
                                {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="pl-4 text-[13.5px] leading-relaxed text-slate-600 font-normal">
                              {renderFormattedText(reply.text)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })
            )}

            {commentCursor && (
              <button
                onClick={handleLoadMoreComments}
                disabled={isLoadingMoreComments}
                aria-busy={isLoadingMoreComments || undefined}
                className="btn btn-sm btn-block"
              >
                {isLoadingMoreComments && <RefreshCw size={13} className="animate-spin" />}
                {isLoadingMoreComments ? 'Loading…' : 'Load older comments'}
              </button>
            )}
          </div>

          {selectedMedia && (
            <div className="border-t border-slate-200/80 bg-white/95 p-3.5 sm:p-4 backdrop-blur-sm shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
              {replyTargetComment ? (
                <div className="mb-2.5 flex items-center justify-between gap-3 rounded-xl border border-purple-200/80 bg-gradient-to-r from-purple-50/90 via-purple-50/50 to-white px-3.5 py-2 text-[13px] shadow-2xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white shadow-2xs">
                      <CornerDownRight size={11} />
                    </span>
                    <span className="truncate text-slate-700 font-normal">
                      Replying publicly to <strong className="font-semibold text-purple-700">@{replyTargetComment.username || 'user'}</strong>:
                      <span className="ml-1 text-slate-500 italic">“{replyTargetComment.text.slice(0, 48)}{replyTargetComment.text.length > 48 ? '…' : ''}”</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyTargetComment(null)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 transition-colors shrink-0"
                  >
                    <X size={13} />
                    <span>Cancel</span>
                  </button>
                </div>
              ) : (
                <div className="mb-2.5 flex items-center justify-between gap-2 px-1 text-[12.5px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-purple-500"></span>
                    <span>Click <strong>Reply</strong> on any comment above to answer publicly.</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-slate-400">
                    <span>Posting as</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200/60">
                      @{connectedAccount?.name || 'account'}
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendReply} className="flex items-center gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={
                      replyTargetComment
                        ? `Write a public reply to @${replyTargetComment.username}…`
                        : 'Choose a comment above to write a reply'
                    }
                    aria-label="Public reply"
                    disabled={!replyTargetComment || isSubmittingReply}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-[14px] text-slate-800 placeholder:text-slate-400 transition-all duration-200 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-purple-500/15 disabled:cursor-not-allowed disabled:bg-slate-100/60 disabled:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!replyTargetComment || !replyText.trim() || isSubmittingReply}
                  aria-busy={isSubmittingReply || undefined}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4.5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-all duration-150 hover:from-purple-700 hover:to-indigo-700 hover:shadow active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none shrink-0"
                >
                  {isSubmittingReply ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  <span>Reply</span>
                </button>
              </form>
            </div>
          )}
        </section>
      </div>

      {commentToDelete && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) setCommentToDelete(null); }}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-comment-title" className="modal max-w-md rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 shadow-2xs">
                <Trash2 size={18} />
              </span>
              <div>
                <h3 id="delete-comment-title" className="text-base font-semibold text-slate-900">Delete this comment?</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-slate-500">
                  The comment by <strong className="font-semibold text-slate-800">@{commentToDelete.username}</strong> will be permanently removed from Instagram. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <blockquote className="line-clamp-3 rounded-xl border-l-3 border-rose-400 bg-slate-50 px-3.5 py-2.5 text-[13.5px] italic text-slate-600">
                “{commentToDelete.text}”
              </blockquote>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                autoFocus
                onClick={() => setCommentToDelete(null)}
                disabled={isDeleting}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteComment}
                disabled={isDeleting}
                aria-busy={isDeleting || undefined}
                className="btn btn-sm btn-danger inline-flex items-center gap-1.5"
              >
                {isDeleting ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                {isDeleting ? 'Deleting…' : 'Delete comment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsManager;
