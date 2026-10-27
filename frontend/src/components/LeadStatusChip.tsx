import React from 'react';
import { statusOf } from '../lib/leadStatus';

/** A lead's status, in the colour every page uses for it. */
export const LeadStatusChip: React.FC<{ status?: string }> = ({ status }) => {
  const s = statusOf(status);
  return <span className={`chip ${s.tone}`}>{s.label}</span>;
};

/** Who is answering the conversation right now. */
export const HandlerChip: React.FC<{ human?: boolean }> = ({ human }) => (
  <span className={human ? 'chip tone-lavender' : 'chip chip-accent'}>{human ? 'Your team' : 'Assistant'}</span>
);
