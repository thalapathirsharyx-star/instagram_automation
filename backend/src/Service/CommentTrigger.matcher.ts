/**
 * Keyword matching for Comment-to-DM triggers, kept free of I/O so it can be
 * tested directly.
 *
 * Keywords are user input, so they are escaped before going into a RegExp: an
 * unescaped "C++" or "(" would throw and stop every trigger of the workspace.
 * Word boundaries are Unicode-aware lookarounds rather than \b, which only knows
 * ASCII letters and so never matched Tamil, Hindi, accented words or emoji.
 */

export interface MatchableTrigger {
  id: string;
  keyword: string;
  media_id?: string | null;
}

/** Splits the stored comma-separated keyword list into trimmed, uppercase keywords. */
export function parseTriggerKeywords(raw: unknown): string[] {
  if (typeof raw !== 'string') return [];
  const seen = new Set<string>();
  for (const part of raw.split(',')) {
    const kw = part.trim().replace(/\s+/g, ' ').toUpperCase();
    if (kw) seen.add(kw);
  }
  return [...seen];
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True when `keyword` appears in `text` as a whole word (or whole emoji/symbol run). */
export function commentContainsKeyword(text: string, keyword: string): boolean {
  if (!keyword) return false;
  // Letters, combining marks (Indic vowel signs) and digits count as "inside a word".
  const pattern = new RegExp(`(?<![\\p{L}\\p{M}\\p{N}])${escapeRegExp(keyword)}(?![\\p{L}\\p{M}\\p{N}])`, 'iu');
  return pattern.test(text);
}

/**
 * Picks the trigger for a comment. Triggers scoped to the commented post win over
 * "all posts" triggers; triggers for other posts never match.
 */
export function matchCommentTrigger<T extends MatchableTrigger>(
  triggers: T[],
  commentText: unknown,
  mediaId: unknown
): T | undefined {
  const text = String(commentText ?? '').toUpperCase();
  if (!text.trim()) return undefined;
  const media = mediaId ? String(mediaId) : '';

  const matches = (t: T) => parseTriggerKeywords(t.keyword).some(kw => commentContainsKeyword(text, kw));

  const postSpecific = triggers.filter(t => t.media_id && media && String(t.media_id) === media);
  const allPosts = triggers.filter(t => !t.media_id);
  return postSpecific.find(matches) ?? allPosts.find(matches);
}
