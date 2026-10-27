import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads, getInstagramSettings } from '../api/crm.api';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Loader2, ArrowRight, Users, MessageCircle, UserCheck, BadgeCheck } from 'lucide-react';
import type { Lead } from '../models/crm.models';
import { formatScore, leadStatusLabel, leadStatusColorVar } from '../lib/leadStatus';
import { LeadStatusChip, HandlerChip } from '../components/LeadStatusChip';

/**
 * Chart series read in the app's own palette: the accent for anything the
 * automation did, neutrals and signals for everything else. Resolved from CSS
 * variables so the charts follow the light/dark theme like the rest of the UI.
 */
interface DayBucket { key: string; day: string; leads: number }
interface StatusSlice { name: string; value: number }

const seriesColor = (token: string, fallback: string) => {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return value || fallback;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [interactionData, setInteractionData] = useState<DayBucket[]>([]);
  const [statusData, setStatusData] = useState<StatusSlice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(true);
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

  // Re-read the palette whenever the theme class on <html> changes.
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

      const leadList: Lead[] = leadsRes?.Data || [];
      setLeads(leadList);

      const statusCounts = leadList.reduce<Record<string, number>>((acc, lead) => {
        acc[lead.lead_status] = (acc[lead.lead_status] || 0) + 1;
        return acc;
      }, {});
      setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

      // Leads captured per day over the last week, taken from created_on. Days
      // with no leads stay at zero rather than being filled with sample values.
      const days: DayBucket[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        days.push({
          key: d.toISOString().slice(0, 10),
          day: d.toLocaleDateString([], { weekday: 'short' }),
          leads: 0,
        });
      }
      const byDay = new Map(days.map(d => [d.key, d]));
      leadList.forEach((lead) => {
        if (!lead.created_on) return;
        const key = new Date(lead.created_on).toISOString().slice(0, 10);
        const bucket = byDay.get(key);
        if (bucket) bucket.leads += 1;
      });
      setInteractionData(days);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center gap-2.5 text-ink-soft">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-[15px]">Loading your workspace</span>
      </div>
    );
  }

  const activeLeads = leads.filter((l) => l.lead_status !== 'Lost');
  const handoffLeads = leads.filter((l) => l.human_agent_active);
  const buyers = leads.filter((l) => l.lead_status === 'Buyer');
  const leadsThisWeek = interactionData.reduce((sum, d) => sum + d.leads, 0);
  const buyerShare = leads.length ? Math.round((buyers.length / leads.length) * 100) : 0;
  // Pipeline slices take each status's own colour, the same one its chip uses.
  // Read on every render, so a theme switch (which re-renders via `palette`) recolours them.
  const statusColor = (status: string) => seriesColor(leadStatusColorVar(status), '#94a3b8');
  const pipeline = [...statusData].sort((a, b) => b.value - a.value);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">What the assistant has been doing across your Instagram conversations.</p>
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

      {/* Headline counts as pastel metric cards, one tone per meaning. Each is a
          count this workspace actually has: no projected trends, no sample percentages. */}
      <div className="metric-grid mb-6">
        {[
          { label: 'Leads captured', value: leads.length, note: `${leadsThisWeek.toLocaleString()} in the last 7 days`, icon: Users, tone: 'tone-blue' },
          { label: 'Open conversations', value: activeLeads.length, note: 'Everything not marked lost', icon: MessageCircle, tone: 'tone-peach' },
          { label: 'With a person', value: handoffLeads.length, note: 'Taken over by your team', icon: UserCheck, tone: 'tone-lavender' },
          { label: 'Marked as buyers', value: buyers.length, note: leads.length ? `${buyerShare}% of all leads` : 'None yet', icon: BadgeCheck, tone: 'tone-mint' },
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
              <p className="label mt-0.5">Last 7 days</p>
            </div>
          </div>
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
        </div>

        <div className="surface flex h-[340px] flex-col">
          <div className="surface-head">
            <h2>Pipeline</h2>
          </div>
          {statusData.length === 0 ? (
            <div className="empty flex-grow">
              <p className="empty-title">No leads yet</p>
              <p className="empty-body">Statuses appear here once the assistant has handled its first conversation.</p>
            </div>
          ) : (
            <div className="flex min-h-0 flex-grow flex-col items-center gap-4 px-4 py-4 sm:flex-row">
              {/* Donut with the total in its middle; the list beside it is the legend. */}
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
                  <span className="tabular text-[22px] font-bold leading-none text-ink">{leads.length}</span>
                  <span className="mt-1 text-[12px] text-ink-soft">leads</span>
                </div>
              </div>
              <ul className="w-full min-w-0 flex-1 space-y-2">
                {pipeline.map((entry) => (
                  <li key={entry.name} className="flex items-center gap-2.5 text-[14px]">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: statusColor(entry.name) }} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-ink">{leadStatusLabel(entry.name)}</span>
                    <span className="tabular font-semibold text-ink">{entry.value}</span>
                    <span className="tabular w-9 text-right text-[13px] text-ink-soft">{Math.round((entry.value / leads.length) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="surface">
        <div className="surface-head">
          <h2>Needs your attention</h2>
          <button onClick={() => navigate('/inbox')} className="btn btn-sm">
            Open inbox
            <ArrowRight size={14} />
          </button>
        </div>

        {(() => {
          // Highest-scoring conversations the automation has not resolved: the
          // shortlist of threads where stepping in is most likely to matter.
          const attention = [...leads]
            .filter((l) => l.lead_status !== 'Lost' && l.lead_status !== 'Buyer')
            // Anyone who asked for a person comes first, then the warmest leads.
            .sort((a, b) =>
              Number(b.lead_status === 'Needs_Human') - Number(a.lead_status === 'Needs_Human') ||
              Number(b.lead_score || 0) - Number(a.lead_score || 0))
            .slice(0, 6);

          if (attention.length === 0) {
            return (
              <div className="empty">
                <p className="empty-title">Nothing waiting</p>
                <p className="empty-body">
                  Every open conversation is either resolved or still with the assistant.
                </p>
              </div>
            );
          }

          return (
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
                  {attention.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => navigate('/inbox', { state: { leadId: lead.id } })}
                      className="cursor-pointer"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="avatar-initial" style={{ width: 30, height: 30, fontSize: 13 }}>
                            {lead.customer_name?.[0] || '?'}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate font-medium">{lead.customer_name}</div>
                            <div className="truncate text-[13px] text-ink-soft">@{lead.instagram_handle}</div>
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
          );
        })()}
      </div>
    </div>
  );
};

export default Dashboard;
