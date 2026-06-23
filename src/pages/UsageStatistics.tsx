import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, Activity, Clock, TrendingUp, Monitor, Smartphone,
  Tablet, Zap, Server, AlertTriangle
} from 'lucide-react';

const PRIMARY = 'hsl(220, 48%, 42%)';
const SUCCESS = 'hsl(158, 70%, 36%)';
const WARNING = 'hsl(38, 92%, 50%)';
const DANGER = 'hsl(0, 84%, 60%)';
const PURPLE = 'hsl(270, 60%, 50%)';
const CYAN = 'hsl(195, 70%, 42%)';

const hourlyActivity = [
  { hour: '12am', patients: 2, billing: 0, inventory: 1, diagnostics: 0 },
  { hour: '2am',  patients: 1, billing: 0, inventory: 0, diagnostics: 1 },
  { hour: '4am',  patients: 3, billing: 0, inventory: 2, diagnostics: 1 },
  { hour: '6am',  patients: 8, billing: 1, inventory: 4, diagnostics: 3 },
  { hour: '8am',  patients: 24, billing: 12, inventory: 18, diagnostics: 15 },
  { hour: '10am', patients: 38, billing: 22, inventory: 28, diagnostics: 26 },
  { hour: '12pm', patients: 45, billing: 30, inventory: 32, diagnostics: 31 },
  { hour: '2pm',  patients: 42, billing: 28, inventory: 30, diagnostics: 29 },
  { hour: '4pm',  patients: 36, billing: 24, inventory: 25, diagnostics: 22 },
  { hour: '6pm',  patients: 28, billing: 18, inventory: 20, diagnostics: 18 },
  { hour: '8pm',  patients: 18, billing: 10, inventory: 14, diagnostics: 12 },
  { hour: '10pm', patients: 10, billing: 4,  inventory: 8,  diagnostics: 6 },
];

const moduleUsage = [
  { module: 'Patient Mgmt', sessions: 1840, actions: 12450, avgTime: 18 },
  { module: 'Billing',      sessions: 1220, actions: 8320,  avgTime: 12 },
  { module: 'Inventory',    sessions: 980,  actions: 6240,  avgTime: 9 },
  { module: 'Diagnostics',  sessions: 860,  actions: 5180,  avgTime: 14 },
  { module: 'Sales Orders', sessions: 640,  actions: 3920,  avgTime: 8 },
  { module: 'PO / Vendor',  sessions: 420,  actions: 2640,  avgTime: 11 },
  { module: 'Reports',      sessions: 280,  actions: 1480,  avgTime: 22 },
];

const weeklyActiveUsers = [
  { week: 'W1 Apr', doctors: 28, nurses: 52, admin: 34, pharmacy: 18 },
  { week: 'W2 Apr', doctors: 30, nurses: 55, admin: 36, pharmacy: 20 },
  { week: 'W3 Apr', doctors: 32, nurses: 58, admin: 38, pharmacy: 19 },
  { week: 'W4 Apr', doctors: 29, nurses: 54, admin: 35, pharmacy: 22 },
  { week: 'W1 May', doctors: 34, nurses: 60, admin: 40, pharmacy: 24 },
  { week: 'W2 May', doctors: 36, nurses: 63, admin: 42, pharmacy: 26 },
  { week: 'W3 May', doctors: 38, nurses: 65, admin: 44, pharmacy: 28 },
];

const deviceBreakdown = [
  { device: 'Desktop', pct: 58, color: PRIMARY },
  { device: 'Tablet', pct: 28, color: CYAN },
  { device: 'Mobile', pct: 14, color: PURPLE },
];

const responseTimeTrend = [
  { day: 'Mon', avg: 210, p95: 420 },
  { day: 'Tue', avg: 195, p95: 390 },
  { day: 'Wed', avg: 230, p95: 480 },
  { day: 'Thu', avg: 205, p95: 410 },
  { day: 'Fri', avg: 245, p95: 510 },
  { day: 'Sat', avg: 180, p95: 360 },
  { day: 'Sun', avg: 170, p95: 340 },
];

const topActions = [
  { action: 'View Patient Record',    count: 4820, trend: '+12%' },
  { action: 'Generate Invoice',       count: 3240, trend: '+8%' },
  { action: 'Update Inventory Stock', count: 2910, trend: '-3%' },
  { action: 'Order Diagnostic Test',  count: 2480, trend: '+18%' },
  { action: 'Process Discharge',      count: 1860, trend: '+24%' },
  { action: 'Create Sales Order',     count: 1640, trend: '+6%' },
  { action: 'Run Report',             count: 1120, trend: '+2%' },
];

const StatCard = ({
  label, value, sub, icon: Icon, color = PRIMARY, trend
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color?: string; trend?: string;
}) => (
  <Card className="shadow-sm border-none bg-card">
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
          <TrendingUp className="h-3 w-3" /> {trend} vs last month
        </div>
      )}
    </CardContent>
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export const UsageStatistics = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');

  return (
    <div className="space-y-6 p-1">
      {/* Period toggle */}
      <div className="flex items-center justify-end">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['today', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors ${
                period === p ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Users" value="132" sub="of 148 registered" icon={Users} color={PRIMARY} trend="+11%" />
        <StatCard label="Daily Sessions" value="847" sub="avg session 14 min" icon={Activity} color={SUCCESS} trend="+8%" />
        <StatCard label="Avg Response" value="205ms" sub="p95: 420ms" icon={Zap} color={WARNING} />
        <StatCard label="System Uptime" value="99.97%" sub="last 30 days" icon={Server} color={PURPLE} />
      </div>

      {/* Hourly Activity + Module Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-sm border-none bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground">Hourly Module Activity (Today)</CardTitle>
            <p className="text-xs text-muted-foreground">Active sessions per hour by module</p>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={hourlyActivity} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gBilling" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SUCCESS} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={SUCCESS} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gInventory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={WARNING} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={WARNING} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDiag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PURPLE} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="patients" stroke={PRIMARY} fill="url(#gPatients)" strokeWidth={2} name="Patients" />
                <Area type="monotone" dataKey="billing" stroke={SUCCESS} fill="url(#gBilling)" strokeWidth={2} name="Billing" />
                <Area type="monotone" dataKey="inventory" stroke={WARNING} fill="url(#gInventory)" strokeWidth={2} name="Inventory" />
                <Area type="monotone" dataKey="diagnostics" stroke={PURPLE} fill="url(#gDiag)" strokeWidth={2} name="Diagnostics" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground">Device Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">How users access the system</p>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            {deviceBreakdown.map(d => {
              const Icon = d.device === 'Desktop' ? Monitor : d.device === 'Tablet' ? Tablet : Smartphone;
              return (
                <div key={d.device}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color: d.color }} />
                      <span className="text-sm font-medium text-foreground">{d.device}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: d.color }}>{d.pct}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${d.pct}%`, background: d.color }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-border space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Peak Hours</span><span className="font-semibold text-foreground">10am – 2pm</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Avg Session</span><span className="font-semibold text-foreground">14 min</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Bounce Rate</span><span className="font-semibold text-foreground">6.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Usage + Top Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground">Module Adoption</CardTitle>
            <p className="text-xs text-muted-foreground">Sessions and total actions per module (this month)</p>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={moduleUsage} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="module" type="category" tick={{ fontSize: 10 }} width={85} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sessions" fill={PRIMARY} radius={[0, 3, 3, 0]} name="Sessions" />
                <Bar dataKey="actions" fill={`${PRIMARY}50`} radius={[0, 3, 3, 0]} name="Actions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Actions Table */}
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground">Top Actions</CardTitle>
            <p className="text-xs text-muted-foreground">Most performed operations this week</p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-2">
              {topActions.map((a, i) => (
                <div key={a.action} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4 text-right">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-foreground">{a.action}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{a.count.toLocaleString()}</span>
                        <span className={`text-[10px] font-bold ${a.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{a.trend}</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div
                        className="h-1 rounded-full"
                        style={{ width: `${(a.count / 4820) * 100}%`, background: PRIMARY }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Active Users + Response Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground">Weekly Active Users by Role</CardTitle>
            <p className="text-xs text-muted-foreground">Distinct users per week</p>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyActiveUsers} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="doctors" stackId="a" fill={PRIMARY} name="Doctors" />
                <Bar dataKey="nurses" stackId="a" fill={CYAN} name="Nurses" />
                <Bar dataKey="admin" stackId="a" fill={WARNING} name="Admin" />
                <Bar dataKey="pharmacy" stackId="a" fill={PURPLE} radius={[3, 3, 0, 0]} name="Pharmacy" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground">API Response Time</CardTitle>
            <p className="text-xs text-muted-foreground">Avg and 95th percentile (ms) — this week</p>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={responseTimeTrend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="avg" stroke={PRIMARY} strokeWidth={2} dot={{ r: 3 }} name="Avg (ms)" />
                <Line type="monotone" dataKey="p95" stroke={DANGER} strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="p95 (ms)" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">Friday peak at 245ms — consider query optimisation for billing module</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
