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
  ShieldCheck, 
  AlertCircle, 
  CornerDownRight
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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="page-title">Comments</h1>
            <span className="chip chip-accent hidden sm:inline-flex" title="Meta permission this page uses">
              <ShieldCheck size={13} />
              instagram_business_manage_comments
            </span>
          </div>
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
                    className={`flex w-full gap-3 rounded-[10px] border p-2.5 text-left transition-colors ${
                      isSelected
                        ? 'border-viridian bg-viridian-tint'
                        : 'border-hairline hover:bg-porcelain'
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
        <section className="surface flex min-h-[480px] flex-col overflow-hidden lg:col-span-7 lg:h-[calc(100dvh-240px)] lg:min-h-[560px]">
          {selectedMedia ? (
            <div className="surface-head py-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink-soft">Selected post</p>
                <p className="mt-0.5 truncate text-[14px] text-ink">
                  {selectedMedia.caption || `Post ID: ${selectedMedia.id}`}
                </p>
              </div>
              {selectedMedia.permalink && (
                <a
                  href={selectedMedia.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm shrink-0"
                >
                  View on Instagram <ExternalLink size={13} />
                </a>
              )}
            </div>
          ) : (
            <div className="surface-head py-3">
              <h2 className="text-[15px]">Comments</h2>
            </div>
          )}

          <div className="premium-scroll flex-1 space-y-3 overflow-y-auto p-4">
            {isLoadingComments ? (
              <div className="space-y-4 py-4" aria-busy="true" aria-label="Loading comments">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 w-1/4 rounded bg-porcelain-deep"></div>
                    <div className="h-10 rounded-[10px] bg-porcelain"></div>
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
                const handle = c.username || 'instagram_user';
                return (
                  <article
                    key={c.id}
                    className={`rounded-[10px] border p-3.5 transition-colors ${
                      isTargetReply
                        ? 'border-viridian bg-viridian-tint'
                        : isHidden
                          ? 'border-dashed border-hairline-strong bg-porcelain'
                          : 'border-hairline bg-surface'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="avatar-initial" style={{ width: 28, height: 28, fontSize: 12 }}>
                          {c.username ? c.username.charAt(0) : 'U'}
                        </span>
                        {/* Name and time stack, so a long handle truncates instead of
                            running under the action buttons on a phone. */}
                        <div className="min-w-0">
                          <span className="block truncate text-[14px] font-medium text-ink">@{handle}</span>
                          <span className="flex items-center gap-2 whitespace-nowrap text-[12px] text-ink-faint">
                            {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(c.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            {isHidden && <span className="chip px-1.5 py-0 text-[11px]">Hidden</span>}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => setReplyTargetComment(isTargetReply ? null : c)}
                          aria-pressed={isTargetReply}
                          aria-label={`Reply to @${handle}`}
                          className={`btn btn-sm ${isTargetReply ? 'btn-primary' : 'btn-ghost'}`}
                        >
                          <Send size={13} /> <span className="hidden sm:inline">Reply</span>
                        </button>
                        <button
                          onClick={() => handleToggleHide(c)}
                          disabled={actionLoadingId === c.id}
                          aria-busy={actionLoadingId === c.id || undefined}
                          aria-label={isHidden ? `Unhide comment by @${handle}` : `Hide comment by @${handle}`}
                          title={isHidden ? 'Unhide comment' : 'Hide comment'}
                          className="btn btn-ghost btn-icon btn-sm"
                        >
                          {isHidden ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button
                          onClick={() => setCommentToDelete(c)}
                          aria-label={`Delete comment by @${handle}`}
                          title="Delete comment"
                          className="btn btn-ghost btn-icon btn-sm is-danger"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <p className={`mt-2 text-[14px] leading-relaxed sm:pl-[38px] ${isHidden ? 'text-ink-soft' : 'text-ink'}`}>
                      {c.text}
                    </p>

                    {c.replies?.data && c.replies.data.length > 0 && (
                      <div className="mt-3 space-y-2 border-l-2 border-hairline-strong pl-3 sm:ml-[38px]">
                        {c.replies.data.map(reply => (
                          <div key={reply.id} className="rounded-[8px] bg-porcelain p-2.5">
                            <div className="mb-0.5 flex items-center gap-1.5 text-[13px] font-medium text-ink">
                              <CornerDownRight size={12} className="text-ink-faint" />
                              @{reply.username || connectedAccount?.name || 'Reply'}
                              <span className="font-normal text-ink-faint">
                                {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="pl-[18px] text-[14px] text-ink-soft">{reply.text}</p>
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
            <div className="border-t border-hairline bg-porcelain p-3">
              {replyTargetComment ? (
                <div className="mb-2 flex items-center justify-between gap-3 px-1 text-[13px]">
                  <span className="flex min-w-0 items-center gap-1.5 font-medium text-ink">
                    <CornerDownRight size={13} className="shrink-0 text-ink-faint" />
                    <span className="truncate">
                      Replying to @{replyTargetComment.username || 'user'}: “{replyTargetComment.text.slice(0, 50)}{replyTargetComment.text.length > 50 ? '…' : ''}”
                    </span>
                  </span>
                  <button
                    onClick={() => setReplyTargetComment(null)}
                    className="btn btn-ghost btn-sm shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="mb-2 px-1 text-[13px] text-ink-soft">
                  Pick Reply on a comment to answer publicly as @{connectedAccount?.name || 'your account'}.
                </p>
              )}

              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    replyTargetComment
                      ? `Write a public reply to @${replyTargetComment.username}…`
                      : 'Choose a comment to reply to'
                  }
                  aria-label="Public reply"
                  disabled={!replyTargetComment || isSubmittingReply}
                  className="field bg-surface"
                />
                <button
                  type="submit"
                  disabled={!replyTargetComment || !replyText.trim() || isSubmittingReply}
                  aria-busy={isSubmittingReply || undefined}
                  className="btn btn-primary shrink-0"
                >
                  <Send size={15} className={isSubmittingReply ? 'animate-pulse' : ''} />
                  Reply
                </button>
              </form>
            </div>
          )}
        </section>
      </div>

      {commentToDelete && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) setCommentToDelete(null); }}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-comment-title" className="modal max-w-md">
            <div className="modal-head border-b-0 pb-2">
              <div className="flex items-start gap-3">
                <span className="icon-tile is-sm is-stop"><Trash2 size={16} /></span>
                <div>
                  <h3 id="delete-comment-title">Delete this comment?</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
                    The comment by <strong className="font-medium text-ink">@{commentToDelete.username}</strong> will be removed from Instagram. This cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6">
              <blockquote className="line-clamp-3 rounded-[8px] border-l-2 border-hairline-strong bg-porcelain px-3 py-2 text-[14px] italic text-ink-soft">
                “{commentToDelete.text}”
              </blockquote>
            </div>
            <div className="modal-foot mt-4">
              <button
                autoFocus
                onClick={() => setCommentToDelete(null)}
                disabled={isDeleting}
                className="btn"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteComment}
                disabled={isDeleting}
                aria-busy={isDeleting || undefined}
                className="btn btn-danger"
              >
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
