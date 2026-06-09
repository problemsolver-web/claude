'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '@/lib/api';
import { PageLoader, EmptyState } from '@/components/ui';

export default function CompanyAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/analytics/company/insights')
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return <EmptyState title="No analytics available" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Analytics &amp; insights</h1>

      {/* Hiring funnel */}
      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-800">Hiring funnel</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.funnel}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2347d1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
          {data.funnel.map((f: any) => (
            <div key={f.stage}>
              <p className="text-2xl font-bold text-slate-900">{f.count}</p>
              <p className="text-slate-500">{f.stage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Job performance */}
      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-800">Job posting performance</h2>
        {data.jobPerformance?.length ? (
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Job</th>
                <th className="py-2">Views</th>
                <th className="py-2">Applications</th>
                <th className="py-2">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {data.jobPerformance.map((j: any) => (
                <tr key={j.id} className="border-t border-slate-100">
                  <td className="py-2 font-medium text-slate-800">{j.title}</td>
                  <td className="py-2">{j.views}</td>
                  <td className="py-2">{j.applications}</td>
                  <td className="py-2">{j.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-400">No job data yet.</p>
        )}
      </div>
    </div>
  );
}
