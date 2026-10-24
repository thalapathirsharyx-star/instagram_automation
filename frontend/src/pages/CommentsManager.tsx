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
  CheckCircle2, 
  CornerDownRight, 
  ChevronRight,
  Filter
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
        if (res.Data.data.length > 0) {
          handleSelectMedia(res.Data.data[0]);
        }
      } else {
        setMediaList([]);
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
      } else {
        setComments([]);
      }
    } catch (err: any) {
      console.error('Failed to load comments:', err);
      toast.error('Failed to load comments: ' + (err.response?.data?.message || err.message));
      setComments([]);
    } finally {
      setIsLoadingComments(false);
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
    <div className="max-w-7xl mx-auto pb-12 font-sans animate-in fade-in duration-500">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-tr from-purple-500 to-pink-500 text-white rounded-xl shadow-lg shadow-purple-500/20">
              <MessageSquare size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Comments Manager
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <ShieldCheck size={14} />
              Permission: instagram_business_manage_comments
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Moderate, reply publicly, hide, and manage comments across your connected Instagram posts in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{connectedAccount?.name}</span>
            </div>
          )}
          <button
            onClick={() => {
              if (selectedMedia) handleSelectMedia(selectedMedia);
              else fetchMedia();
            }}
            disabled={isLoadingMedia || isLoadingComments}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-200 text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={15} className={isLoadingMedia || isLoadingComments ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Disconnected State */}
      {isConnected === false && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-6 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                Instagram Business Account Not Connected
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                To manage and reply to Instagram comments, link your Facebook Page and Instagram Professional account under Meta Integration.
              </p>
            </div>
          </div>
          <Link
            to="/meta-integration"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap"
          >
            Connect Meta Account
          </Link>
        </div>
      )}

      {/* Main Grid: Left Posts list, Right Comments thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Posts & Reels Column (4 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden h-[750px]">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <InstagramIcon size={18} className="text-pink-500" />
              <h2 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                Recent Posts & Reels
              </h2>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              {mediaList.length} items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {isLoadingMedia ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse flex gap-3 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/40">
                    <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-lg shrink-0"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : mediaList.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-sm">
                <InstagramIcon size={36} className="mx-auto mb-2 opacity-30" />
                <p>No eligible Instagram posts or Reels found.</p>
              </div>
            ) : (
              mediaList.map(item => {
                const isSelected = selectedMedia?.id === item.id;
                const thumb = item.thumbnail_url || item.media_url;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectMedia(item)}
                    className={`flex gap-3.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-purple-50/80 dark:bg-purple-950/20 border-purple-400 dark:border-purple-600/60 shadow-sm' 
                        : 'border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 overflow-hidden relative">
                      {thumb ? (
                        <img src={thumb} alt="Post thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <InstagramIcon size={24} />
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 px-1 bg-black/60 text-[9px] text-white rounded font-mono">
                        {item.media_type === 'VIDEO' ? 'REEL' : 'POST'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <p className="text-xs text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug">
                        {item.caption || '(No caption)'}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium mt-1">
                        <span className="flex items-center gap-1">
                          <Heart size={12} className="text-rose-500" />
                          {item.like_count ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={12} className="text-purple-500" />
                          {item.comments_count ?? 0}
                        </span>
                        <span>
                          {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Comments Conversation Stream (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden h-[750px]">
          
          {/* Post Header Info */}
          {selectedMedia ? (
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Selected Post
                </span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate max-w-md mt-0.5">
                  {selectedMedia.caption || `Post ID: ${selectedMedia.id}`}
                </p>
              </div>
              {selectedMedia.permalink && (
                <a
                  href={selectedMedia.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold shrink-0"
                >
                  View on Instagram <ExternalLink size={12} />
                </a>
              )}
            </div>
          ) : (
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">
                Select a post to view comments
              </h3>
            </div>
          )}

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoadingComments ? (
              <div className="space-y-4 py-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
                    <div className="h-10 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : !selectedMedia ? (
              <div className="text-center py-24 text-zinc-400 text-sm">
                <MessageSquare size={36} className="mx-auto mb-2 opacity-30" />
                <p>Choose an Instagram post from the list on the left.</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-24 text-zinc-400 text-sm">
                <MessageSquare size={36} className="mx-auto mb-2 opacity-30" />
                <p>No comments on this post yet.</p>
              </div>
            ) : (
              comments.map(c => {
                const isHidden = !!c.hidden;
                const isTargetReply = replyTargetComment?.id === c.id;
                return (
                  <div 
                    key={c.id} 
                    className={`p-3.5 rounded-xl border transition-all ${
                      isHidden 
                        ? 'bg-zinc-50 dark:bg-zinc-900/40 border-dashed border-zinc-300 dark:border-zinc-800 opacity-75' 
                        : 'bg-zinc-50/60 dark:bg-zinc-800/30 border-zinc-200/80 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                          {c.username ? c.username.charAt(0) : 'U'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            @{c.username || 'instagram_user'}
                          </span>
                          <span className="text-[10px] text-zinc-400 ml-2">
                            {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(c.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {isHidden && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            Hidden
                          </span>
                        )}
                        <button
                          onClick={() => {
                            if (isTargetReply) {
                              setReplyTargetComment(null);
                            } else {
                              setReplyTargetComment(c);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                            isTargetReply 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-300'
                          }`}
                        >
                          <Send size={11} /> Reply
                        </button>
                        <button
                          onClick={() => handleToggleHide(c)}
                          disabled={actionLoadingId === c.id}
                          title={isHidden ? 'Unhide comment' : 'Hide comment'}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition"
                        >
                          {isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                        <button
                          onClick={() => setCommentToDelete(c)}
                          title="Delete comment"
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Comment text */}
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 mt-2 pl-9">
                      {c.text}
                    </p>

                    {/* Replies thread if any */}
                    {c.replies?.data && c.replies.data.length > 0 && (
                      <div className="mt-3 pl-9 space-y-2 border-l-2 border-purple-200 dark:border-purple-900/60 ml-4">
                        {c.replies.data.map(reply => (
                          <div key={reply.id} className="text-xs bg-white dark:bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
                            <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                              <CornerDownRight size={12} />
                              @{reply.username || connectedAccount?.name || 'Reply'}
                              <span className="text-[10px] text-zinc-400 font-normal">
                                {new Date(reply.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-zinc-700 dark:text-zinc-300 pl-4">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Input Box */}
          {selectedMedia && (
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/80">
              {replyTargetComment ? (
                <div className="flex items-center justify-between text-xs mb-2 px-1 text-purple-600 dark:text-purple-400">
                  <span className="font-semibold flex items-center gap-1">
                    <CornerDownRight size={13} />
                    Replying to @{replyTargetComment.username || 'user'}: "{replyTargetComment.text.slice(0, 35)}..."
                  </span>
                  <button 
                    onClick={() => setReplyTargetComment(null)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-[11px] text-zinc-400 mb-1.5 px-1 font-medium">
                  Select a comment above to post a public reply as @{connectedAccount?.name || 'Account'}.
                </div>
              )}

              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    replyTargetComment 
                      ? `Write a public reply to @${replyTargetComment.username}...` 
                      : 'Select a comment above to reply...'
                  }
                  disabled={!replyTargetComment || isSubmittingReply}
                  className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!replyTargetComment || !replyText.trim() || isSubmittingReply}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Send size={13} className={isSubmittingReply ? 'animate-pulse' : ''} />
                  <span>Reply</span>
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <Trash2 size={20} />
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base mb-1">
              Delete Comment?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              Are you sure you want to delete this comment by <strong className="text-zinc-800 dark:text-zinc-200">@{commentToDelete.username}</strong>? This action cannot be undone on Instagram.
            </p>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 italic mb-5 line-clamp-2">
              "{commentToDelete.text}"
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCommentToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteComment}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm flex items-center justify-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommentsManager;
