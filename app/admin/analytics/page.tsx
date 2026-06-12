'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import type { CvDownload, PageView } from '@/lib/types/general';
import { DownloadIcon, EyeIcon, GlobeIcon, UsersIcon } from 'lucide-react';

type Filter = '7d' | '30d' | 'all';
type Tab = 'pageviews' | 'cvdownloads';

interface AnalyticsData {
  views: PageView[];
  cvDownloads: CvDownload[];
}

function withinDays<T extends { timestamp: string }>(items: T[], days: number): T[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter((i) => new Date(i.timestamp).getTime() > cutoff);
}

function topN(values: (string | undefined)[], n = 6): { label: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const v of values) {
    const k = v || 'Unknown';
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }));
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatCard({
  Icon,
  label,
  value,
}: {
  Icon: React.FC<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-dark border border-white/[0.06] p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-3.5 text-ash" />
        <span className="text-[10px] font-black uppercase tracking-widest text-ash/50">{label}</span>
      </div>
      <p className="font-montserrat font-black text-3xl text-light">{value}</p>
    </div>
  );
}

function MiniList({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-ash/50 mb-3">{title}</p>
      <div className="border border-white/[0.06]">
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-center text-ash text-sm">No data yet.</p>
        ) : (
          rows.map(({ label, count }) => (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] last:border-0"
            >
              <span className="text-sm text-light/80 truncate font-mono">{label}</span>
              <span className="text-xs font-bold text-ash shrink-0 ml-4">{count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('30d');
  const [tab, setTab] = useState<Tab>('pageviews');

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((d: AnalyticsData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const views = useMemo(() => {
    if (!data) return [];
    return filter === 'all' ? data.views : withinDays(data.views, filter === '7d' ? 7 : 30);
  }, [data, filter]);

  const downloads = useMemo(() => {
    if (!data) return [];
    return filter === 'all' ? data.cvDownloads : withinDays(data.cvDownloads, filter === '7d' ? 7 : 30);
  }, [data, filter]);

  const uniqueVisitors = useMemo(() => new Set(views.map((v) => v.ip)).size, [views]);
  const topPages      = useMemo(() => topN(views.map((v) => v.path)), [views]);
  const topCountries  = useMemo(() => topN(views.map((v) => v.country)), [views]);
  const topBrowsers   = useMemo(() => topN(views.map((v) => v.browser)), [views]);
  const topDevices    = useMemo(() => topN(views.map((v) => v.device)), [views]);
  const topDlCountries = useMemo(() => topN(downloads.map((d) => d.country)), [downloads]);

  const FILTERS: { value: Filter; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: 'all', label: 'All time' },
  ];

  return (
    <div className="min-h-screen bg-darkBg text-light">
      <AdminHeader />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-montserrat font-black text-2xl text-light">Analytics</h2>
            {!loading && (
              <p className="text-ash text-sm mt-1">
                {views.length} page view{views.length !== 1 ? 's' : ''} · {downloads.length} CV download{downloads.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Period filter */}
          <div className="flex items-center border border-white/[0.06]">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 text-xs font-semibold font-montserrat transition-colors ${
                  filter === value
                    ? 'bg-white/[0.08] text-light'
                    : 'text-ash hover:text-light'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-white/10 border-t-red rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard Icon={EyeIcon}      label="Page Views"      value={views.length} />
              <StatCard Icon={UsersIcon}    label="Unique Visitors" value={uniqueVisitors} />
              <StatCard Icon={DownloadIcon} label="CV Downloads"    value={downloads.length} />
              <StatCard Icon={GlobeIcon}    label="Top Country"     value={topCountries[0]?.label ?? '—'} />
            </div>

            {/* Tab bar */}
            <div className="flex border border-white/[0.06] w-fit mb-6">
              {([
                { value: 'pageviews', label: 'Page Views' },
                { value: 'cvdownloads', label: 'CV Downloads' },
              ] as { value: Tab; label: string }[]).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTab(value)}
                  className={`px-4 py-2 text-xs font-semibold font-montserrat uppercase tracking-widest transition-colors ${
                    tab === value ? 'bg-white/[0.06] text-light' : 'text-ash hover:text-light'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Page Views tab ── */}
            {tab === 'pageviews' && (
              <div className="space-y-6">
                {/* Breakdown mini-lists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MiniList title="Top Pages"     rows={topPages} />
                  <MiniList title="Top Countries" rows={topCountries} />
                  <MiniList title="Browsers"      rows={topBrowsers} />
                  <MiniList title="Devices"       rows={topDevices} />
                </div>

                {/* Recent views table */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-ash/50 mb-3">
                    Recent Visitors{views.length > 50 ? ' (latest 50)' : ''}
                  </p>
                  <div className="border border-white/[0.06] overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-dark/50">
                          {['Time', 'Page', 'Country / City', 'Browser', 'OS', 'Device'].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-ash/50"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {views.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-12 text-center text-ash">
                              No page views recorded yet.
                            </td>
                          </tr>
                        ) : (
                          views.slice(0, 50).map((v) => (
                            <tr key={v.id} className="border-b border-white/[0.04] hover:bg-dark/30 transition-colors">
                              <td className="px-4 py-3 text-ash text-xs font-mono whitespace-nowrap">{fmt(v.timestamp)}</td>
                              <td className="px-4 py-3 font-mono text-light/80 max-w-[160px] truncate">{v.path}</td>
                              <td className="px-4 py-3 text-light/70 whitespace-nowrap">
                                {v.country ?? '—'}{v.city ? `, ${v.city}` : ''}
                              </td>
                              <td className="px-4 py-3 text-light/70">{v.browser}</td>
                              <td className="px-4 py-3 text-light/70">{v.os}</td>
                              <td className="px-4 py-3 text-light/70 capitalize">{v.device}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── CV Downloads tab ── */}
            {tab === 'cvdownloads' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MiniList title="Top Countries" rows={topDlCountries} />
                  <MiniList title="Devices" rows={topN(downloads.map((d) => d.device))} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-ash/50 mb-3">
                    All CV Downloads
                  </p>
                  <div className="border border-white/[0.06] overflow-x-auto">
                    <table className="w-full text-sm min-w-[720px]">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-dark/50">
                          {['Time', 'Country / City', 'Browser', 'OS', 'Device', 'Screen', 'Timezone'].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-ash/50"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {downloads.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-ash">
                              No CV downloads yet.
                            </td>
                          </tr>
                        ) : (
                          downloads.map((d) => (
                            <tr key={d.id} className="border-b border-white/[0.04] hover:bg-dark/30 transition-colors">
                              <td className="px-4 py-3 text-ash text-xs font-mono whitespace-nowrap">{fmt(d.timestamp)}</td>
                              <td className="px-4 py-3 text-light/70 whitespace-nowrap">
                                {d.country ?? '—'}{d.city ? `, ${d.city}` : ''}
                              </td>
                              <td className="px-4 py-3 text-light/70">{d.browser}</td>
                              <td className="px-4 py-3 text-light/70">{d.os}</td>
                              <td className="px-4 py-3 text-light/70 capitalize">{d.device}</td>
                              <td className="px-4 py-3 text-light/70 font-mono text-xs">
                                {d.screenWidth}×{d.screenHeight}
                              </td>
                              <td className="px-4 py-3 text-light/70 text-xs">{d.timezone || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
