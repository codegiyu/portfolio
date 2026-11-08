'use client';

import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import type { AnalyticsBucket, AnalyticsSummary } from '@/lib/types/general';
import { DownloadIcon, EyeIcon, GlobeIcon } from 'lucide-react';

type Days = 7 | 30 | 90;

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
        <span className="text-[10px] font-black uppercase tracking-widest text-ash/50">
          {label}
        </span>
      </div>
      <p className="font-montserrat font-black text-3xl text-light">{value}</p>
    </div>
  );
}

function MiniList({ title, rows }: { title: string; rows: AnalyticsBucket[] }) {
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
              className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] last:border-0">
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
  const [days, setDays] = useState<Days>(30);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/analytics?days=${days}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Analytics unavailable');
        return (await response.json()) as AnalyticsSummary;
      })
      .then(setData)
      .catch(reason => {
        if (reason.name !== 'AbortError') setError('Analytics could not be loaded.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [days]);

  return (
    <div className="min-h-screen bg-darkBg text-light">
      <AdminHeader />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-montserrat font-black text-2xl text-light">Analytics</h1>
            <p className="text-ash text-sm mt-1">Aggregate data only · no raw visitor records</p>
          </div>
          <div
            className="flex items-center border border-white/[0.06]"
            role="group"
            aria-label="Analytics period">
            {[7, 30, 90].map(value => (
              <button
                key={value}
                type="button"
                aria-pressed={days === value}
                onClick={() => {
                  setDays(value as Days);
                  setLoading(true);
                  setError('');
                }}
                className={`px-3 py-1.5 text-xs font-semibold font-montserrat transition-colors ${
                  days === value ? 'bg-white/[0.08] text-light' : 'text-ash hover:text-light'
                }`}>
                {value} days
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24" role="status" aria-live="polite">
            <div className="w-8 h-8 border-2 border-white/10 border-t-red rounded-full animate-spin" />
            <span className="sr-only">Loading analytics</span>
          </div>
        ) : error ? (
          <div role="alert" className="border border-red/40 bg-red/10 p-5 text-red">
            {error}
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard Icon={EyeIcon} label="Page Views" value={data.pageViews} />
              <StatCard Icon={DownloadIcon} label="CV Downloads" value={data.cvDownloads} />
              <StatCard
                Icon={GlobeIcon}
                label="Top Country"
                value={data.topCountries[0]?.label ?? '—'}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <MiniList title="Top Pages" rows={data.topPages} />
              <MiniList title="Referrers" rows={data.topReferrers} />
              <MiniList title="Countries" rows={data.topCountries} />
              <MiniList title="Browsers" rows={data.browsers} />
              <MiniList title="Devices" rows={data.devices} />
            </div>
          </>
        ) : (
          <p className="py-24 text-center text-ash">No analytics data yet.</p>
        )}
      </main>
    </div>
  );
}
