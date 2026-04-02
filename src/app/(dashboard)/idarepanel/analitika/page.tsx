'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getAnalyticsData } from './actions';

const PIE_COLORS = ['#0D47A1', '#2EC4B6', '#6BBF6B', '#FF6B6B', '#FFA726'];

/* ── Page ─────────────────────────────────────────────────── */
export default function AnalitikaPage() {
  const [trackData, setTrackData] = useState<{name:string;count:number}[]>([]);
  const [teamSizeData, setTeamSizeData] = useState<{name:string;value:number}[]>([]);
  const [universityData, setUniversityData] = useState<{name:string;count:number}[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await getAnalyticsData();
        if (data.trackData.length > 0) setTrackData(data.trackData);
        if (data.teamSizeData.length > 0) setTeamSizeData(data.teamSizeData);
        if (data.universityData.length > 0) setUniversityData(data.universityData);
      } catch {
        // leave defaults
      }
    }

    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analitika</h1>
        <p className="text-muted-foreground">
          Hackathon statistikasi ve hesabatlari
        </p>
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar chart: Registrations by track */}
        <Card>
          <CardHeader>
            <CardTitle>Istiqametler uzre qeydiyyat</CardTitle>
            <CardDescription>
              Her istiqamet uzre qeydiyyatdan kecen komanda sayi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trackData.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">Melumat tapilmadi</p>
            ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trackData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value) => [String(value), 'Komanda sayi']}
                  />
                  <Bar
                    dataKey="count"
                    fill="#0D47A1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Pie chart: Team size distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Komanda olcusu paylanmasi</CardTitle>
            <CardDescription>
              Komandalarin uzv sayina gore bolgusu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamSizeData.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">Melumat tapilmadi</p>
            ) : (
            <>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={teamSizeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) =>
                      `${name ?? ''}: ${value ?? ''}`
                    }
                  >
                    {teamSizeData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                    formatter={(value) => [String(value), 'Komanda']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="mt-2 flex justify-center gap-4">
              {teamSizeData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5 text-sm">
                  <span
                    className="inline-block size-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx] }}
                  />
                  {item.name}
                </div>
              ))}
            </div>
            </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* University distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Universitetler uzre paylanma</CardTitle>
          <CardDescription>
            Istirakci universitetleri ve sayi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {universityData.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Melumat tapilmadi</p>
          ) : (
          <div className="space-y-3">
            {universityData.map((uni) => {
              const maxCount = Math.max(...universityData.map((u) => u.count));
              const percent = Math.round((uni.count / maxCount) * 100);

              return (
                <div key={uni.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{uni.name}</span>
                    <span className="text-muted-foreground">
                      {uni.count} istirakci
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#2EC4B6] transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
