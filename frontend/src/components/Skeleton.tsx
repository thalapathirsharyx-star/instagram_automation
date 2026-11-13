import React from 'react';

/**
 * Loading placeholders shaped like the content they stand in for, so a page
 * keeps its layout while data arrives instead of flashing an empty state.
 * The shimmer stops for people who ask for reduced motion (index.css).
 * Every placeholder is hidden from assistive tech; the container announces
 * "Loading" once through role="status".
 */
export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <span className={`skeleton ${className}`} style={style} aria-hidden="true" />
);

const Loading: React.FC<{ label: string; className?: string; children: React.ReactNode }> = ({ label, className = '', children }) => (
  <div role="status" aria-live="polite" className={className}>
    <span className="sr-only">{label}</span>
    {children}
  </div>
);

/** Rows of a conversation list: avatar, name, handle, time. */
export const ThreadListSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <Loading label="Loading conversations">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-center gap-3 border-b border-hairline px-3.5 py-3.5">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3.5" style={{ width: `${55 + ((i * 17) % 30)}%` }} />
          <Skeleton className="h-3 w-2/5" />
        </div>
        <Skeleton className="h-3 w-10 self-start" />
      </div>
    ))}
  </Loading>
);

/** A conversation thread: alternating incoming and outgoing bubbles. */
export const ChatSkeleton: React.FC = () => (
  <Loading label="Loading messages" className="flex flex-col gap-5">
    {[['in', 52], ['out', 38], ['in', 64], ['out', 58], ['in', 30]].map(([side, w], i) => (
      <div key={i} className={`flex flex-col gap-1.5 ${side === 'out' ? 'items-end' : 'items-start'}`}>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-11 rounded-[18px]" style={{ width: `${w}%` }} />
      </div>
    ))}
  </Loading>
);

/** Table body rows; the first column carries an avatar and two lines. */
export const TableRowsSkeleton: React.FC<{ cols: number; rows?: number }> = ({ cols, rows = 6 }) => (
  <>
    {Array.from({ length: rows }, (_, r) => (
      <tr key={r} aria-hidden="true">
        {Array.from({ length: cols }, (_, c) => (
          <td key={c}>
            {c === 0 ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-3/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </div>
            ) : (
              <Skeleton className="h-3.5" style={{ width: `${40 + ((r + c) * 13) % 45}%` }} />
            )}
          </td>
        ))}
      </tr>
    ))}
  </>
);

/** A grid of content cards (knowledge items and similar). */
export const CardGridSkeleton: React.FC<{ cards?: number; className?: string }> = ({ cards = 6, className = '' }) => (
  <Loading label="Loading" className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-3 ${className}`}>
    {Array.from({ length: cards }, (_, i) => (
      <div key={i} className="surface space-y-3 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="flex items-center justify-between pt-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    ))}
  </Loading>
);

/** The dashboard: page header, four stat cards, a chart and a side card, a table. */
export const DashboardSkeleton: React.FC = () => (
  <Loading label="Loading your workspace" className="page">
    <div className="page-head">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
    </div>
    <div className="metric-grid mb-6">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="surface flex items-center gap-4 p-5">
          <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
    <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="surface h-[340px] space-y-4 p-6 lg:col-span-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-[250px] w-full rounded-xl" />
      </div>
      <div className="surface flex h-[340px] flex-col items-center justify-center gap-5 p-6">
        <Skeleton className="h-32 w-32 rounded-full" />
        <div className="w-full space-y-2.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      </div>
    </div>
    <div className="surface p-6">
      <Skeleton className="mb-5 h-4 w-44" />
      <div className="space-y-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <Skeleton className="h-3.5 flex-1" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </Loading>
);
