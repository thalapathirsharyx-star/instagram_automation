import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads, getInstagramSettings } from '../api/crm.api';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { ArrowRight, Users, MessageCircle, UserCheck, BadgeCheck, TrendingUp, PieChart as PieChartIcon, CheckCircle2, Calendar } from 'lucide-react';
import type { Lead } from '../models/crm.models';
import { formatScore, leadStatusLabel, leadStatusColorVar } from '../lib/leadStatus';
import { LeadStatusChip, HandlerChip } from '../components/LeadStatusChip';
import { DashboardSkeleton } from '../components/Skeleton';

interface DayBucket { key: string; day: string; leads: number }
interface StatusSlice { name: string; value: number }

type TimeRange = '7d' | '14d' | '30d' | '90d' | 'all';
type AttentionFilter = 'all' | 'needs_human' | 'hot' | 'new';

const TIME_RANGES: { key: TimeRange; label: string; periodLabel: string }[] = [
  { key: '7d', label: '7 days', periodLabel: 'Last 7 days' },
  { key: '14d', label: '14 days', periodLabel: 'Last 14 days' },
  { key: '30d', label: '30 days', periodLabel: 'Last 30 days' },
  { key: '90d', label: '90 days', periodLabel: 'Last 90 days' },
  { key: 'all', label: 'All time', periodLabel: 'All time' },
];

const seriesColor = (token: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  const scope = document.querySelector('.crm-layout') ?? document.documentElement;
  const value = getComputedStyle(scope).getPropertyValue(token).trim();
  return value || fallback;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [attentionFilter, setAttentionFilter] = useState<AttentionFilter>('all');
  const [palette, setPalette] = useState({
    accent: '#2563eb',
    ink: '#0f172a',
    hairline: '#e6eaf0',
    inkSoft: '#64748b',
    go: '#1f6b3a',
    warn: '#8a5a00',
    stop: '#9b2c2c',
    lavender: '#6a3fc0',
  });

  useEffect(() => {
    fetchStats();
  }, []);

  // Re-read palette on theme change
  useEffect(() => {
    const read = () => setPalette({
      accent: seriesColor('--viridian', '#2563eb'),
      ink: seriesColor('--ink', '#0f172a'),
      hairline: seriesColor('--hairline', '#e2e8f0'),
      inkSoft: seriesColor('--ink-soft', '#64748b'),
      go: seriesColor('--signal-go', '#1f6b3a'),
      warn: seriesColor('--signal-warn', '#8a5a00'),
      stop: seriesColor('--signal-stop', '#9b2c2c'),
      lavender: seriesColor('--lavender-ink', '#6a3fc0'),
    });
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const [leadsRes, igSettingsRes] = await Promise.all([
        getLeads(),
        getInstagramSettings().catch(err => {
          console.error('Failed to fetch IG settings in dashboard:', err);
          return { Success: false, Data: { isConnected: false } };
        })
      ]);

      if (igSettingsRes && igSettingsRes.Success) {
        setIsConnected(!!igSettingsRes.Data?.isConnected);
      } else {
        setIsConnected(false);
      }

      setLeads(leadsRes?.Data || []);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter leads based on selected timeRange
  const filteredLeads = useMemo(() => {
    if (timeRange === 'all') return leads;
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : 90;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return leads.filter((lead) => {
      const dateVal = lead.created_on || lead.last_message_time;
      if (!dateVal) return true;
      return new Date(dateVal).getTime() >= cutoff;
    });
  }, [leads, timeRange]);

  // Build chart buckets adaptively for the selected timeRange
  const interactionData = useMemo<DayBucket[]>(() => {
    const numDays = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : null;

    if (numDays !== null && numDays <= 30) {
      const days: DayBucket[] = [];
      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        days.push({
          key: d.toISOString().slice(0, 10),
          day: numDays <= 7
            ? d.toLocaleDateString([], { weekday: 'short' })
            : d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          leads: 0,
        });
      }
      const byDay = new Map(days.map(d => [d.key, d]));
      filteredLeads.forEach((lead) => {
        const dateVal = lead.created_on || lead.last_message_time;
        if (!dateVal) return;
        const key = new Date(dateVal).toISOString().slice(0, 10);
        const bucket = byDay.get(key);
        if (bucket) bucket.leads += 1;
      });
      return days;
    }

    // 90 days or All Time: aggregate across span
    const now = new Date();
    const start = timeRange === '90d'
      ? new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      : filteredLeads.reduce((earliest, l) => {
          const d = new Date(l.created_on || l.last_message_time || Date.now());
          return d < earliest ? d : earliest;
        }, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));

    const bucketCount = 10;
    const intervalMs = Math.max((now.getTime() - start.getTime()) / bucketCount, 24 * 60 * 60 * 1000);
    const buckets: DayBucket[] = [];
    for (let i = 0; i <= bucketCount; i++) {
      const bucketTime = new Date(start.getTime() + i * intervalMs);
      buckets.push({
        key: bucketTime.toISOString(),
        day: bucketTime.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        leads: 0,
      });
    }

    filteredLeads.forEach(lead => {
      const dateVal = lead.created_on || lead.last_message_time;
      if (!dateVal) return;
      const t = new Date(dateVal).getTime();
      if (t < start.getTime() || t > now.getTime()) return;
      const idx = Math.min(Math.floor((t - start.getTime()) / intervalMs), bucketCount);
      if (buckets[idx]) buckets[idx].leads += 1;
    });

    return buckets;
  }, [filteredLeads, timeRange]);

  // Pipeline status breakdown for the active window
  const statusData = useMemo<StatusSlice[]>(() => {
    const statusCounts = filteredLeads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.lead_status] = (acc[lead.lead_status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [filteredLeads]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const activeLeads = filteredLeads.filter((l) => l.lead_status !== 'Lost');
  const handoffLeads = filteredLeads.filter((l) => l.human_agent_active);
  const buyers = filteredLeads.filter((l) => l.lead_status === 'Buyer');
  const leadsInPeriod = filteredLeads.length;
  const buyerShare = filteredLeads.length ? Math.round((buyers.length / filteredLeads.length) * 100) : 0;
  const currentPeriodConfig = TIME_RANGES.find(r => r.key === timeRange) || TIME_RANGES[0];

  const statusColor = (status: string) => seriesColor(leadStatusColorVar(status), '#94a3b8');
  const pipeline = [...statusData].sort((a, b) => b.value - a.value);

  // Attention leads with filter applied
  const attentionList = leads
    .filter((l) => {
      if (attentionFilter === 'needs_human') {
        return l.lead_status === 'Needs_Human' || l.human_agent_active;
      }
      if (attentionFilter === 'hot') {
        return l.lead_status === 'Hot' || (l.lead_score || 0) >= 7;
      }
      if (attentionFilter === 'new') {
        return l.lead_status === 'New';
      }
      return l.lead_status !== 'Lost' && l.lead_status !== 'Buyer';
    })
    .sort((a, b) =>
      Number(b.lead_status === 'Needs_Human') - Number(a.lead_status === 'Needs_Human') ||
      Number(b.lead_score || 0) - Number(a.lead_score || 0)
    )
    .slice(0, 8);

  return (
    <div className="page">
      <div className="page-head flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">What the assistant has been doing across your Instagram conversations.</p>
        </div>

        {/* Global Time Range Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-ink-soft hidden sm:inline-flex items-center gap-1.5">
            <Calendar size={14} className="text-ink-faint" />
            Time range:
          </span>
          <div className="segmented" role="group" aria-label="Filter time range">
            {TIME_RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                aria-pressed={timeRange === r.key}
                onClick={() => setTimeRange(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!isConnected && (
        <div className="notice notice-warn mb-6">
          <div>
            <p className="notice-title">Connect Instagram to start replying</p>
            <p className="notice-body">
              Until your Facebook Page is linked, the assistant cannot read messages or reply to comments.
            </p>
          </div>
          <button onClick={() => navigate('/meta-integration')} className="btn btn-primary shrink-0">
            Connect Instagram
          </button>
        </div>
      )}

      {/* Headline counts as pastel metric cards */}
      <div className="metric-grid mb-6">
        {[
          {
            label: 'Leads captured',
            value: leadsInPeriod,
            note: `${leadsInPeriod.toLocaleString()} in ${currentPeriodConfig.periodLabel.toLowerCase()}`,
            icon: Users,
            tone: 'tone-blue'
          },
          {
            label: 'Open conversations',
            value: activeLeads.length,
            note: 'Everything not marked lost',
            icon: MessageCircle,
            tone: 'tone-peach'
          },
          {
            label: 'With a person',
            value: handoffLeads.length,
            note: 'Taken over by your team',
            icon: UserCheck,
            tone: 'tone-lavender'
          },
          {
            label: 'Marked as buyers',
            value: buyers.length,
            note: filteredLeads.length ? `${buyerShare}% of filtered leads` : 'None yet',
            icon: BadgeCheck,
            tone: 'tone-mint'
          },
        ].map(({ label, value, note, icon: Icon, tone }) => (
          <div key={label} className={`metric ${tone}`}>
            <div className="metric-head">
              <span className="metric-label">{label}</span>
              <span className="icon-tile is-sm"><Icon size={16} /></span>
            </div>
            <span className="metric-figure">{value.toLocaleString()}</span>
            <span className="metric-note">{note}</span>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="surface flex h-[340px] flex-col lg:col-span-2">
          <div className="surface-head">
            <div>
              <h2>Leads captured</h2>
              <p className="label mt-0.5">{currentPeriodConfig.periodLabel}</p>
            </div>
            <span className="chip tabular-nums font-semibold text-ink">
              {leadsInPeriod} {leadsInPeriod === 1 ? 'lead' : 'leads'}
            </span>
          </div>

          {leadsInPeriod === 0 ? (
            <div className="empty flex-grow">
              <span className="empty-mark"><TrendingUp /></span>
              <p className="empty-title">No leads in {currentPeriodConfig.periodLabel.toLowerCase()}</p>
              <p className="empty-body">Try selecting a broader range like "All time" to view earlier captured leads.</p>
            </div>
          ) : (
            <div className="min-h-0 flex-grow p-4 pl-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={interactionData} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.accent} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={palette.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={palette.hairline} vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: palette.inkSoft, fontSize: 13 }}
                    dy={8}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    width={34}
                    tick={{ fill: palette.inkSoft, fontSize: 13 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--hairline)',
                      borderRadius: 6,
                      color: 'var(--ink)',
                      fontSize: 13,
                    }}
                    labelStyle={{ color: 'var(--ink-soft)', fontSize: 13 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    name="Leads"
                    stroke={palette.accent}
                    fill="url(#leadFill)"
                    strokeWidth={2}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="surface flex h-[340px] flex-col">
          <div className="surface-head">
            <h2>Pipeline</h2>
            <span className="label mt-0.5">{currentPeriodConfig.label}</span>
          </div>
          {statusData.length === 0 ? (
            <div className="empty flex-grow">
              <span className="empty-mark"><PieChartIcon /></span>
              <p className="empty-title">No leads yet</p>
              <p className="empty-body">Statuses appear here once the assistant has handled its first conversation.</p>
            </div>
          ) : (
            <div className="flex min-h-0 flex-grow flex-col items-center gap-4 px-4 py-4 sm:flex-row">
              <div className="relative h-[132px] w-[132px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pipeline} innerRadius={44} outerRadius={64} paddingAngle={2} dataKey="value" stroke="none" isAnimationActive={false}>
                      {pipeline.map((entry) => (
                        <Cell key={entry.name} fill={statusColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [value, leadStatusLabel(String(name))]}
                      contentStyle={{
                        background: 'var(--surface)',
                        border: '1px solid var(--hairline)',
                        borderRadius: 6,
                        color: 'var(--ink)',
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="tabular text-[22px] font-bold leading-none text-ink">{filteredLeads.length}</span>
                  <span className="mt-1 text-[12px] text-ink-soft">leads</span>
                </div>
              </div>
              <ul className="w-full min-w-0 flex-1 space-y-2">
                {pipeline.map((entry) => (
                  <li key={entry.name} className="flex items-center gap-2.5 text-[14px]">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: statusColor(entry.name) }} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-ink">{leadStatusLabel(entry.name)}</span>
                    <span className="tabular font-semibold text-ink">{entry.value}</span>
                    <span className="tabular w-9 text-right text-[13px] text-ink-soft">{Math.round((entry.value / filteredLeads.length) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Needs Your Attention Section with Table Filtering */}
      <div className="surface">
        <div className="surface-head flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2>Needs your attention</h2>
            <span className="chip">{attentionList.length}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Attention category filter */}
            <div className="segmented" role="group" aria-label="Filter attention list">
              <button
                type="button"
                aria-pressed={attentionFilter === 'all'}
                onClick={() => setAttentionFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                aria-pressed={attentionFilter === 'needs_human'}
                onClick={() => setAttentionFilter('needs_human')}
              >
                Needs human
              </button>
              <button
                type="button"
                aria-pressed={attentionFilter === 'hot'}
                onClick={() => setAttentionFilter('hot')}
              >
                Hot leads
              </button>
              <button
                type="button"
                aria-pressed={attentionFilter === 'new'}
                onClick={() => setAttentionFilter('new')}
              >
                New
              </button>
            </div>

            <button onClick={() => navigate('/inbox')} className="btn btn-sm">
              Open inbox
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {attentionList.length === 0 ? (
          <div className="empty">
            <span className="empty-mark"><CheckCircle2 /></span>
            <p className="empty-title">Nothing waiting</p>
            <p className="empty-body">
              Every conversation matching this filter is either resolved or with the assistant.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table is-stacked">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Handled by</th>
                  <th className="max-lg:hidden">Last intent</th>
                  <th className="num">Score</th>
                </tr>
              </thead>
              <tbody>
                {attentionList.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate('/inbox', { state: { leadId: lead.id } })}
                    className="cursor-pointer"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        {lead.profile_pic_url ? (
                          <img
                            src={lead.profile_pic_url}
                            alt={lead.customer_name}
                            className="h-7 w-7 shrink-0 rounded-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'inline-flex';
                            }}
                          />
                        ) : null}
                        <span
                          className="avatar-initial"
                          style={{
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            display: lead.profile_pic_url ? 'none' : 'inline-flex'
                          }}
                        >
                          {lead.customer_name?.[0] || '?'}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{lead.customer_name}</div>
                          <div className="truncate text-[13px] text-ink-soft">@{lead.instagram_username || lead.instagram_handle}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Status"><LeadStatusChip status={lead.lead_status} /></td>
                    <td data-label="Handled by"><HandlerChip human={lead.human_agent_active} /></td>
                    <td data-label="Last intent" className="text-ink-soft max-lg:hidden">{lead.last_intent || '—'}</td>
                    <td data-label="Score" className="num font-medium">{formatScore(lead.lead_score)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
