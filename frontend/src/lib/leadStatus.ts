import type { Lead } from '../models/crm.models';

/**
 * How a lead's status reads everywhere in the app (Dashboard, Leads, Inbox),
 * so the same status never shows up in two different colours.
 *
 * Tones follow the shared vocabulary in index.css: peach for live interest,
 * rose when someone is needed, lavender for a person stepping in, mint for a
 * sale. New and Lost stay neutral.
 */
export const LEAD_STATUS: Record<Lead['lead_status'], { label: string; tone: string; color: string }> = {
  New: { label: 'New', tone: '', color: '--ink-faint' },
  Hot: { label: 'Hot', tone: 'tone-peach', color: '--peach-ink' },
  Needs_Human: { label: 'Needs human', tone: 'tone-rose', color: '--signal-stop' },
  Handoff: { label: 'Handoff', tone: 'tone-lavender', color: '--lavender-ink' },
  Buyer: { label: 'Buyer', tone: 'tone-mint', color: '--signal-go' },
  Lost: { label: 'Lost', tone: 'is-muted', color: '--hairline-strong' },
};

export const statusOf = (status?: string) => LEAD_STATUS[(status as Lead['lead_status']) || 'New'] ?? LEAD_STATUS.New;

export const leadStatusLabel = (status?: string) => statusOf(status).label;

/** The CSS variable that colours a status in charts. */
export const leadStatusColorVar = (status?: string) => statusOf(status).color;

/**
 * Lead scores are 0 to 10 and often fractional (the AI's confidence feeds
 * them), so one decimal keeps 7.6 and 8 distinguishable without noise.
 */
export const formatScore = (score?: number | null) => {
  const n = Math.max(0, Math.min(10, Number(score) || 0));
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};

export const scorePercent = (score?: number | null) => Math.max(0, Math.min(10, Number(score) || 0)) * 10;
