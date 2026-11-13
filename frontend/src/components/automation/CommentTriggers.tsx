import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, MessageSquare, Pencil, Plus, RefreshCw, Save, Trash2, X, Zap } from 'lucide-react';
import api from '../../lib/axios';
import { getInstagramMedia } from '../../api/crm.api';
import type { InstagramMediaItem } from '../../models/crm.models';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../ConfirmModal';
import { Skeleton } from '../Skeleton';

interface CommentTrigger {
  id: string;
  mediaId: string | null;
  postTitle: string;
  keyword: string;
  replyMessage: string;
  isActive: boolean;
}

// Mirrors the backend limits in Instagram.service.ts (validateCommentTrigger).
const MAX_MESSAGE = 1000;
const MAX_KEYWORD = 50;
const ALL_POSTS = '';

interface CommentTriggerRow {
  id: string;
  media_id?: string | null;
  post_title: string;
  keyword: string;
  reply_message: string;
  is_active: boolean;
}

const fromApi = (item: CommentTriggerRow): CommentTrigger => ({
  id: item.id,
  mediaId: item.media_id ?? null,
  postTitle: item.post_title,
  keyword: item.keyword,
  replyMessage: item.reply_message,
  isActive: item.is_active,
});

/** The server's message when it sent one (validation, plan limit), else the fallback. */
const errorText = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { Message?: string } } })?.response?.data?.Message || fallback;

/** A short, single-line label for a post: its caption, else its type and date. */
const postLabel = (m: InstagramMediaItem) => {
  const caption = (m.caption || '').replace(/\s+/g, ' ').trim();
  const kind = m.media_type === 'VIDEO' ? 'Reel' : m.media_type === 'CAROUSEL_ALBUM' ? 'Carousel' : 'Post';
  const date = new Date(m.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return caption ? `${caption.length > 60 ? `${caption.slice(0, 60)}…` : caption}` : `${kind} · ${date}`;
};

const parseKeywords = (raw: string) =>
  [...new Set(raw.split(',').map((k) => k.trim().replace(/\s+/g, ' ').toUpperCase()).filter(Boolean))];

const CommentTriggers: React.FC<{ isConnected: boolean }> = ({ isConnected }) => {
  const { toast } = useToast();
  const formRef = useRef<HTMLElement>(null);

  const [triggers, setTriggers] = useState<CommentTrigger[]>([]);
  const [limit, setLimit] = useState<number | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [posts, setPosts] = useState<InstagramMediaItem[]>([]);
  const [postsState, setPostsState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState(ALL_POSTS);
  const [keyword, setKeyword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTriggers = useCallback(async () => {
    setLoadState('loading');
    try {
      const res = await api.get('/Instagram/CommentTriggers');
      if (!res.data?.Success || !Array.isArray(res.data.Data)) throw new Error('Unexpected response');
      setTriggers(res.data.Data.map(fromApi));
      setLimit(typeof res.data.Limit === 'number' ? res.data.Limit : null);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setPostsState('loading');
    try {
      const res = await getInstagramMedia(25);
      setPosts(res?.Data?.data || []);
      setPostsState('ready');
    } catch {
      setPostsState('error');
    }
  }, []);

  useEffect(() => {
    loadTriggers();
  }, [loadTriggers]);

  useEffect(() => {
    if (isConnected) loadPosts();
    else setPostsState('ready');
  }, [isConnected, loadPosts]);

  const resetForm = () => {
    setEditingId(null);
    setMediaId(ALL_POSTS);
    setKeyword('');
    setMessage('');
    setFormError(null);
  };

  const keywords = parseKeywords(keyword);
  const keywordTooLong = keywords.some((k) => k.length > MAX_KEYWORD);
  const messageTooLong = message.trim().length > MAX_MESSAGE;
  const atLimit = !editingId && limit !== null && triggers.length >= limit;
  const canSubmit = keywords.length > 0 && message.trim().length > 0 && !keywordTooLong && !messageTooLong && !atLimit;

  const selectedPost = posts.find((p) => p.id === mediaId);
  // A trigger being edited may point at a post that is no longer in the recent list.
  const editingTrigger = triggers.find((t) => t.id === editingId);
  const orphanPost = mediaId && !selectedPost && editingTrigger?.mediaId === mediaId ? editingTrigger : null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // a double click must not create two triggers
    if (!canSubmit) {
      setFormError(
        keywords.length === 0 ? 'Enter at least one keyword.' : !message.trim() ? 'Enter the message to send.' : null
      );
      return;
    }

    const payload = {
      keyword: keywords.join(', '),
      replyMessage: message.trim(),
      mediaId: mediaId || null,
      postTitle: selectedPost ? postLabel(selectedPost) : orphanPost?.postTitle,
    };

    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        const res = await api.put(`/Instagram/CommentTriggers/${editingId}`, payload);
        const updated = fromApi(res.data.Data);
        setTriggers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast.success('Trigger updated');
      } else {
        const res = await api.post('/Instagram/CommentTriggers', payload);
        const created = fromApi(res.data.Data);
        setTriggers((prev) => [created, ...prev]);
        toast.success('Trigger created');
      }
      resetForm();
    } catch (err) {
      setFormError(errorText(err, editingId ? 'Could not save the trigger. Try again.' : 'Could not create the trigger. Try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (t: CommentTrigger) => {
    setEditingId(t.id);
    setMediaId(t.mediaId || ALL_POSTS);
    setKeyword(t.keyword);
    setMessage(t.replyMessage);
    setFormError(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => document.getElementById('trigger-keyword')?.focus({ preventScroll: true }), 300);
  };

  const toggle = async (id: string) => {
    if (pendingToggles.has(id)) return;
    setPendingToggles((prev) => new Set(prev).add(id));
    // Optimistic: flip now, roll back if the server refuses.
    setTriggers((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)));
    try {
      const res = await api.post(`/Instagram/CommentTriggers/${id}/toggle`);
      const isActive = !!res.data?.Data?.is_active;
      setTriggers((prev) => prev.map((t) => (t.id === id ? { ...t, isActive } : t)));
    } catch (err) {
      setTriggers((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)));
      toast.error(errorText(err, 'Could not change the trigger. Try again.'));
    } finally {
      setPendingToggles((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const remove = async () => {
    const id = confirmDeleteId;
    if (!id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/Instagram/CommentTriggers/${id}`);
      setTriggers((prev) => prev.filter((t) => t.id !== id));
      if (editingId === id) resetForm();
      toast.success('Trigger deleted');
    } catch (err) {
      toast.error(errorText(err, 'Could not delete the trigger. Try again.'));
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const deleting = triggers.find((t) => t.id === confirmDeleteId);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <div className="min-w-0 space-y-6 lg:col-span-2">
        <section ref={formRef} className="surface scroll-mt-24 overflow-hidden" aria-labelledby="trigger-form-title">
          <form onSubmit={submit} noValidate>
            <div className="surface-head">
              <div>
                <h2 id="trigger-form-title">
                  <span className="icon-tile is-sm">{editingId ? <Pencil size={16} /> : <Plus size={16} />}</span>
                  {editingId ? 'Edit comment trigger' : 'New comment trigger'}
                </h2>
                <p>Send a private DM automatically when someone comments a keyword.</p>
              </div>
            </div>

            <div className="surface-body space-y-5">
              {atLimit && (
                <div className="notice notice-warn" role="status">
                  <p className="notice-body">
                    You've used all {limit} comment triggers on your plan. Delete one, or upgrade in Billing to add more.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="min-w-0">
                  <label htmlFor="trigger-post" className="field-label">Post</label>
                  <div className="flex items-center gap-3">
                    {selectedPost && (selectedPost.thumbnail_url || selectedPost.media_url) && (
                      <img
                        src={selectedPost.thumbnail_url || selectedPost.media_url}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <select
                      id="trigger-post"
                      value={mediaId}
                      onChange={(e) => setMediaId(e.target.value)}
                      className="field min-w-0"
                      disabled={postsState === 'loading'}
                      aria-describedby="trigger-post-hint"
                    >
                      <option value={ALL_POSTS}>All posts and reels</option>
                      {orphanPost && <option value={orphanPost.mediaId!}>{orphanPost.postTitle}</option>}
                      {posts.map((p) => (
                        <option key={p.id} value={p.id}>{postLabel(p)}</option>
                      ))}
                    </select>
                  </div>
                  <p id="trigger-post-hint" className="field-hint">
                    {postsState === 'loading' && 'Loading your recent posts…'}
                    {postsState === 'error' && (
                      <>
                        Couldn't load your posts, so only "All posts" is available.{' '}
                        <button type="button" className="font-medium text-viridian underline" onClick={loadPosts}>Retry</button>
                      </>
                    )}
                    {postsState === 'ready' && (isConnected ? 'Pick one post, or let the trigger work on all of them.' : 'Connect Instagram to pick a specific post.')}
                  </p>
                </div>

                <div className="min-w-0">
                  <label htmlFor="trigger-keyword" className="field-label">Keywords</label>
                  <input
                    id="trigger-keyword"
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. LINK, PRICE"
                    className="field"
                    maxLength={300}
                    aria-invalid={keywordTooLong || undefined}
                    aria-describedby="trigger-keyword-hint"
                  />
                  <p id="trigger-keyword-hint" className={keywordTooLong ? 'field-error' : 'field-hint'}>
                    {keywordTooLong
                      ? `Each keyword can be at most ${MAX_KEYWORD} characters.`
                      : 'Separate several with commas. Matches whole words, any capitalisation.'}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="trigger-reply" className="field-label">DM to send</label>
                <textarea
                  id="trigger-reply"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hey! Thanks for commenting. Here is the link you asked for…"
                  rows={3}
                  className="field"
                  aria-invalid={messageTooLong || undefined}
                  aria-describedby="trigger-reply-hint"
                />
                <p id="trigger-reply-hint" className={`flex justify-between gap-3 ${messageTooLong ? 'field-error' : 'field-hint'}`}>
                  <span>Sent privately. If Instagram blocks the DM, nothing is posted publicly.</span>
                  <span className="shrink-0 tabular-nums">{message.trim().length} / {MAX_MESSAGE}</span>
                </p>
              </div>

              {formError && (
                <p className="field-error flex items-center gap-1.5" role="alert">
                  <AlertCircle size={14} className="shrink-0" /> {formError}
                </p>
              )}
            </div>

            <div className="surface-foot">
              <p className="text-[13px] text-ink-soft">
                {limit !== null && limit < 1000 && loadState === 'ready' && `${triggers.length} of ${limit} triggers used`}
              </p>
              <div className="flex gap-2">
                {editingId && (
                  <button type="button" onClick={resetForm} className="btn" disabled={isSubmitting}>
                    <X size={16} /> Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || atLimit || loadState !== 'ready'}
                  aria-busy={isSubmitting || undefined}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : editingId ? <Save size={16} /> : <Plus size={16} />}
                  {editingId ? 'Save changes' : 'Create trigger'}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="surface overflow-hidden" aria-labelledby="trigger-list-title">
          <div className="surface-head">
            <h2 id="trigger-list-title">
              <span className="icon-tile is-sm is-neutral"><MessageSquare size={16} /></span>
              Your triggers
              {loadState === 'ready' && <span className="chip">{triggers.length}</span>}
            </h2>
          </div>

          {loadState === 'loading' && (
            <div role="status" className="divide-y divide-hairline">
              <span className="sr-only">Loading triggers</span>
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-5 py-4" aria-hidden="true">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40 rounded-full" />
                    <Skeleton className="h-3.5" style={{ width: `${70 - i * 12}%` }} />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {loadState === 'error' && (
            <div className="surface-body">
              <div className="notice notice-stop" role="alert">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="notice-title">Couldn't load your triggers</p>
                    <p className="notice-body">Your triggers are safe; this page just couldn't reach the server.</p>
                  </div>
                </div>
                <button type="button" onClick={loadTriggers} className="btn btn-sm">
                  <RefreshCw size={14} /> Retry
                </button>
              </div>
            </div>
          )}

          {loadState === 'ready' && triggers.length === 0 && (
            <div className="empty py-10">
              <span className="empty-mark"><MessageSquare /></span>
              <p className="empty-title">No triggers yet</p>
              <p className="empty-body">Create one above and matching comments get a DM within seconds.</p>
            </div>
          )}

          {loadState === 'ready' && triggers.length > 0 && (
            <ul className="divide-y divide-hairline">
              {triggers.map((t) => {
                const isOpen = expanded.has(t.id);
                const isLong = t.replyMessage.length > 120 || t.replyMessage.includes('\n');
                return (
                  <li
                    key={t.id}
                    className={`flex flex-col justify-between gap-4 px-5 py-4 md:flex-row md:items-center ${editingId === t.id ? 'bg-viridian-tint/40' : ''}`}
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {t.keyword.split(',').map((k) => k.trim()).filter(Boolean).map((k) => (
                          <span key={k} className="chip chip-accent">{k}</span>
                        ))}
                        <span className="min-w-0 truncate text-[13px] text-ink-soft">
                          on {t.mediaId ? t.postTitle : 'all posts and reels'}
                        </span>
                      </div>
                      <p className={`whitespace-pre-wrap break-words text-[14px] text-ink ${isOpen ? '' : 'line-clamp-2'}`}>
                        <span className="mr-1 text-ink-faint">Sends</span>{t.replyMessage}
                      </p>
                      {isLong && (
                        <button type="button" className="text-[13px] font-medium text-viridian" onClick={() => toggleExpanded(t.id)} aria-expanded={isOpen}>
                          {isOpen ? 'Show less' : 'Show full message'}
                        </button>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <label className="mr-1 flex cursor-pointer items-center gap-2 text-[13px] text-ink-soft">
                        <input
                          type="checkbox"
                          role="switch"
                          className="switch"
                          checked={t.isActive}
                          disabled={pendingToggles.has(t.id)}
                          onChange={() => toggle(t.id)}
                          aria-label={`Trigger ${t.keyword} ${t.isActive ? 'on' : 'off'}`}
                        />
                        <span aria-hidden="true" className="w-6">{t.isActive ? 'On' : 'Off'}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => startEdit(t)}
                        className="btn btn-ghost btn-icon btn-sm"
                        aria-label={`Edit trigger ${t.keyword}`}
                        title="Edit trigger"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(t.id)}
                        className="btn btn-ghost btn-icon btn-sm is-danger"
                        aria-label={`Delete trigger ${t.keyword}`}
                        title="Delete trigger"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <aside className="notice notice-info block">
        <p className="notice-title flex items-center gap-2">
          <Zap size={16} className="text-viridian" /> How comment triggers work
        </p>
        <ul className="notice-body mt-2 list-disc space-y-1.5 pl-4 leading-relaxed">
          <li>Someone comments a keyword on your post, and they get your message as a private DM.</li>
          <li>A trigger for a specific post wins over an "all posts" trigger with the same keyword.</li>
          <li>Instagram only allows one private reply per comment, within 7 days of the comment.</li>
          <li>Turning auto-reply off in Advanced logic pauses comment triggers too.</li>
        </ul>
      </aside>

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        title="Delete trigger"
        message={deleting ? `Comments with "${deleting.keyword}" will stop getting a DM. This can't be undone.` : 'This can\'t be undone.'}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
        onConfirm={remove}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default CommentTriggers;
