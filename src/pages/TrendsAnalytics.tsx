import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Package, Activity, Calendar } from 'lucide-react';

const PRIMARY = 'hsl(220, 48%, 42%)';
const SUCCESS = 'hsl(158, 70%, 36%)';
const WARNING = 'hsl(38, 92%, 50%)';
const DANGER = 'hsl(0, 84%, 60%)';
const PURPLE = 'hsl(270, 60%, 50%)';
const CYAN = 'hsl(195, 70%, 42%)';

const monthlyOverview = [
  { month: 'Jun',  admissions: 142, discharges: 138, revenue: 4820, inventory: 82, diagnostics: 310 },
  { month: 'Jul',  admissions: 158, discharges: 152, revenue: 5240, inventory: 94, diagnostics: 340 },
  { month: 'Aug',  admissions: 165, discharges: 160, revenue: 5580, inventory: 88, diagnostics: 358 },
  { month: 'Sep',  admissions: 172, discharges: 168, revenue: 5920, inventory: 102, diagnostics: 374 },
  { month: 'Oct',  admissions: 180, discharges: 174, revenue: 6210, inventory: 110, diagnostics: 390 },
  { month: 'Nov',  admissions: 175, discharges: 170, revenue: 6050, inventory: 106, diagnostics: 382 },
  { month: 'Dec',  admissions: 162, discharges: 158, revenue: 5640, inventory: 98, diagnostics: 365 },
  { month: 'Jan',  admissions: 148, discharges: 144, revenue: 5120, inventory: 90, diagnostics: 344 },
  { month: 'Feb',  admissions: 155, discharges: 150, revenue: 5380, inventory: 95, diagnostics: 356 },
  { month: 'Mar',  admissions: 182, discharges: 176, revenue: 6320, inventory: 115, diagnostics: 402 },
  { month: 'Apr',  admissions: 194, discharges: 188, revenue: 6780, inventory: 122, diagnostics: 428 },
  { month: 'May',  admissions: 208, discharges: 200, revenue: 7240, inventory: 130, diagnostics: 456 },
];

const weeklyBillingTrend = [
  { week: 'W1',  collected: 168, outstanding: 42, waived: 8 },
  { week: 'W2',  collected: 185, outstanding: 38, waived: 6 },
  { week: 'W3',  collected: 172, outstanding: 46, waived: 10 },
  { week: 'W4',  collected: 198, outstanding: 34, waived: 7 },
  { week: 'W5',  collected: 210, outstanding: 30, waived: 5 },
  { week: 'W6',  collected: 224, outstanding: 28, waived: 6 },
  { week: 'W7',  collected: 240, outstanding: 25, waived: 4 },
  { week: 'W8',  collected: 218, outstanding: 32, waived: 8 },
  { week: 'W9',  collected: 256, outstanding: 22, waived: 5 },
  { week: 'W10', collected: 272, outstanding: 20, waived: 4 },
  { week: 'W11', collected: 265, outstanding: 24, waived: 6 },
  { week: 'W12', collected: 288, outstanding: 18, waived: 3 },
];

const inventoryTurnover = [
  { month: 'Jun', turnover: 4.2, stockouts: 3, expiry: 2 },
  { month: 'Jul', turnover: 4.5, stockouts: 2, expiry: 1 },
  { month: 'Aug', turnover: 4.1, stockouts: 4, expiry: 3 },
  { month: 'Sep', turnover: 4.8, stockouts: 1, expiry: 1 },
  { month: 'Oct', turnover: 5.0, stockouts: 2, expiry: 2 },
  { month: 'Nov', turnover: 4.6, stockouts: 3, expiry: 2 },
  { month: 'Dec', turnover: 4.3, stockouts: 4, expiry: 4 },
  { month: 'Jan', turnover: 4.4, stockouts: 2, expiry: 1 },
  { month: 'Feb', turnover: 4.7, stockouts: 1, expiry: 1 },
  { month: 'Mar', turnover: 5.2, stockouts: 1, expiry: 0 },
  { month: 'Apr', turnover: 5.5, stockouts: 0, expiry: 1 },
  { month: 'May', turnover: 5.8, stockouts: 0, expiry: 0 },
];

const diagCategoryTrend = [
  { month: 'Jan', blood: 120, imaging: 68, ecg: 42, urine: 58, biopsy: 14 },
  { month: 'Feb', blood: 128, imaging: 72, ecg: 45, urine: 62, biopsy: 15 },
  { month: 'Mar', blood: 148, imaging: 84, ecg: 52, urine: 72, biopsy: 18 },
  { month: 'Apr', blood: 162, imaging: 92, ecg: 56, urine: 78, biopsy: 20 },
  { month: 'May', blood: 180, imaging: 104, ecg: 62, urine: 88, biopsy: 22 },
];

const trendKPIs = [
  { label: 'Admissions MoM', value: '+7.2%', positive: true, icon: Users },
  { label: 'Revenue MoM', value: '+6.8%', positive: true, icon: DollarSign },
  { label: 'Inventory Turnover', value: '5.8×', positive: true, icon: Package },
  { label: 'Avg LOS', value: '-0.4d', positive: true, icon: Calendar },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">{typeof p.value === 'number' && p.value > 100 ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export const TrendsAnalytics = () => {
  const [metric, setMetric] = useState<'admissions' | 'revenue' | 'inventory' | 'diagnostics'>('admissions');

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trends Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">12-month historical trends across all modules</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {trendKPIs.map(k => (
          <Card key={k.label} className="shadow-sm border-none bg-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{k.label}</p>
                  <p className="text-2xl font-bold" style={{ color: k.positive ? SUCCESS : DANGER }}>{k.value}</p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${k.positive ? SUCCESS : DANGER}18` }}>
                  <k.icon className="h-5 w-5" style={{ color: k.positive ? SUCCESS : DANGER }} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs font-medium" style={{ color: k.positive ? SUCCESS : DANGER }}>
                {k.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                month-over-month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main 12-month Overview */}
      <Card className="shadow-sm border-none bg-card">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">12-Month Overview</CardTitle>
              <p className="text-xs text-muted-foreground">Admissions vs Revenue trend</p>
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(['admissions', 'revenue', 'inventory', 'diagnostics'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                    metric === m ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={monthlyOverview} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="tGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SUCCESS} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={SUCCESS} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {metric === 'admissions' && (
                <>
                  <Area yAxisId="left" type="monotone" dataKey="admissions" stroke={PRIMARY} fill="url(#tGrad1)" strokeWidth={2.5} name="Admissions" />
                  <Line yAxisId="left" type="monotone" dataKey="discharges" stroke={SUCCESS} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} name="Discharges" />
                </>
              )}
              {metric === 'revenue' && (
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke={SUCCESS} fill="url(#tGrad2)" strokeWidth={2.5} name="Revenue (₹K)" />
              )}
              {metric === 'inventory' && (
                <Area yAxisId="left" type="monotone" dataKey="inventory" stroke={WARNING} fill="url(#tGrad1)" strokeWidth={2.5} name="Inventory Orders" />
              )}
              {metric === 'diagnostics' && (
                <Area yAxisId="left" type="monotone" dataKey="diagnostics" stroke={PURPLE} fill="url(#tGrad1)" strokeWidth={2.5} name="Diagnostics" />
              )}
              <ReferenceLine yAxisId="left" x="Jan" stroke={DANGER} strokeDasharray="4 2" label={{ value: 'New Year Dip', fontSize: 9, fill: DANGER, position: 'top' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Billing Trend + Inventory Turnover */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground">Billing Collection Trend</CardTitle>
            <p className="text-xs text-muted-foreground">Weekly collections vs outstanding (₹K)</p>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyBillingTrend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="collected" stackId="a" fill={SUCCESS} name="Collected" />
                <Bar dataKey="outstanding" stackId="a" fill={WARNING} name="Outstanding" />
                <Bar dataKey="waived" stackId="a" fill={DANGER} radius={[3, 3, 0, 0]} name="Waived" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground">Inventory Health Trend</CardTitle>
            <p className="text-xs text-muted-foreground">Stock turnover ratio with stockout & expiry events</p>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={inventoryTurnover} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} domain={[3, 7]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area yAxisId="left" type="monotone" dataKey="turnover" stroke={PRIMARY} fill={`${PRIMARY}20`} strokeWidth={2.5} name="Turnover Ratio" />
                <Bar yAxisId="right" dataKey="stockouts" fill={DANGER} opacity={0.7} name="Stockouts" />
                <Bar yAxisId="right" dataKey="expiry" fill={WARNING} opacity={0.7} name="Expiry Events" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Diagnostics Category Trend */}
      <Card className="shadow-sm border-none bg-card">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-foreground">Diagnostics Volume by Category</CardTitle>
          <p className="text-xs text-muted-foreground">Test volumes across categories — last 5 months</p>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={diagCategoryTrend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <defs>
                {[
                  { id: 'dBlood', color: PRIMARY },
                  { id: 'dImaging', color: CYAN },
                  { id: 'dEcg', color: SUCCESS },
                  { id: 'dUrine', color: WARNING },
                  { id: 'dBiopsy', color: PURPLE },
                ].map(g => (
                  <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={g.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="blood" stroke={PRIMARY} fill="url(#dBlood)" strokeWidth={2} name="Blood Tests" />
              <Area type="monotone" dataKey="imaging" stroke={CYAN} fill="url(#dImaging)" strokeWidth={2} name="Imaging" />
              <Area type="monotone" dataKey="ecg" stroke={SUCCESS} fill="url(#dEcg)" strokeWidth={2} name="ECG / Cardio" />
              <Area type="monotone" dataKey="urine" stroke={WARNING} fill="url(#dUrine)" strokeWidth={2} name="Urine / Path" />
              <Area type="monotone" dataKey="biopsy" stroke={PURPLE} fill="url(#dBiopsy)" strokeWidth={2} name="Biopsy" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
