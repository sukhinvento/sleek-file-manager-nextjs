import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Package, Calendar,
  ArrowUpRight, ArrowDownRight, Activity, Stethoscope, BarChart2,
} from 'lucide-react';
import {
  fetchAdmissionsMonthlyAnalytics,
  fetchBillingWeeklyAnalytics,
  fetchBillingMonthlyAnalytics,
  fetchPOMonthlyAnalytics,
  fetchDiagnosticsMonthlyCategoryAnalytics,
  fillMonthGaps,
  toMonthLabel,
} from '@/services/analyticsService';

// ── Colour palette (mirrors Inventory Dashboard tokens) ─────────────────────
const PRIMARY       = 'hsl(220, 48%, 42%)';
const PRIMARY_LIGHT = 'hsl(220, 55%, 60%)';
const SUCCESS       = 'hsl(158, 70%, 36%)';
const WARNING       = 'hsl(33, 92%, 48%)';
const DANGER        = 'hsl(354, 70%, 50%)';
const CYAN          = 'hsl(195, 70%, 42%)';
const PURPLE        = 'hsl(270, 60%, 50%)';

const CATEGORY_COLORS = [PRIMARY, CYAN, SUCCESS, WARNING, PURPLE, DANGER, PRIMARY_LIGHT];

// ── Custom tooltip ──────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, prefix = '', suffix = '' }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'hsl(0,0%,100%)', border: '1px solid hsl(220,16%,90%)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 16px hsl(220,48%,42%/0.12)', fontSize: 12 }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color: 'hsl(215,28%,14%)' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

// ── KPI stat card (mirrors Inventory Dashboard StatCard) ────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  sub?: string;
  accent?: 'primary' | 'danger' | 'warning' | 'success' | 'purple' | 'cyan';
}
const StatCard = ({ label, value, icon: Icon, trend, sub, accent = 'primary' }: StatCardProps) => {
  const colours: Record<string, { bg: string; icon: string; text: string }> = {
    primary: { bg: 'hsl(220,48%,42%/0.07)', icon: PRIMARY,  text: PRIMARY  },
    danger:  { bg: 'hsl(354,70%,50%/0.08)', icon: DANGER,   text: DANGER   },
    warning: { bg: 'hsl(33,92%,48%/0.08)',  icon: WARNING,  text: WARNING  },
    success: { bg: 'hsl(158,70%,36%/0.08)', icon: SUCCESS,  text: SUCCESS  },
    purple:  { bg: 'hsl(270,60%,50%/0.08)', icon: PURPLE,   text: PURPLE   },
    cyan:    { bg: 'hsl(195,70%,42%/0.08)', icon: CYAN,     text: CYAN     },
  };
  const c = colours[accent];
  return (
    <Card className="border-0 shadow-sm" style={{ background: 'hsl(0,0%,100%)' }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg" style={{ background: c.bg }}>
            <Icon size={18} style={{ color: c.icon }} />
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-0.5 text-xs font-medium" style={{ color: trend >= 0 ? SUCCESS : DANGER }}>
              {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold" style={{ color: 'hsl(215,28%,14%)' }}>{value}</p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: c.text }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'hsl(220,12%,54%)' }}>{sub}</p>}
      </CardContent>
    </Card>
  );
};

// ── Section heading ─────────────────────────────────────────────────────────
const SectionTitle = ({ icon: Icon, children, color = PRIMARY }: { icon?: React.ElementType; children: React.ReactNode; color?: string }) => (
  <div className="flex items-center gap-2 mb-3">
    {Icon && <Icon size={16} style={{ color }} />}
    <h3 className="text-sm font-semibold" style={{ color: 'hsl(215,28%,14%)' }}>{children}</h3>
  </div>
);

// ── Chart card wrapper (matches Inventory Dashboard chart cards) ────────────
const ChartCard = ({ title, subtitle, children, badge }: { title: string; subtitle?: string; children: React.ReactNode; badge?: string }) => (
  <Card className="border-0 shadow-sm" style={{ background: 'hsl(0,0%,100%)' }}>
    <CardHeader className="pb-2 pt-4 px-4">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-sm font-semibold" style={{ color: 'hsl(215,28%,14%)' }}>{title}</CardTitle>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: 'hsl(220,12%,54%)' }}>{subtitle}</p>}
        </div>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'hsl(220,48%,42%/0.08)', color: PRIMARY }}>
            {badge}
          </span>
        )}
      </div>
    </CardHeader>
    <CardContent className="px-2 pb-4">{children}</CardContent>
  </Card>
);

const LoadingChart = ({ h = 240 }: { h?: number }) => (
  <div style={{ height: h, color: 'hsl(220,12%,54%)' }} className="flex items-center justify-center text-sm">
    Loading…
  </div>
);

const EmptyChart = ({ h = 240, msg }: { h?: number; msg: string }) => (
  <div style={{ height: h }} className="flex flex-col items-center justify-center gap-2">
    <BarChart2 size={28} style={{ color: 'hsl(220,13%,80%)' }} />
    <p className="text-sm" style={{ color: 'hsl(220,12%,54%)' }}>{msg}</p>
  </div>
);

// ── Metric tab button ───────────────────────────────────────────────────────
const MetricTab = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all"
    style={{
      background: active ? PRIMARY : 'transparent',
      color: active ? '#fff' : 'hsl(220,12%,54%)',
    }}
  >
    {children}
  </button>
);

export const TrendsAnalytics = () => {
  const [metric, setMetric] = useState<'admissions' | 'revenue' | 'inventory' | 'diagnostics'>('admissions');
  const [loading, setLoading] = useState(true);

  const [monthlyOverview, setMonthlyOverview] = useState<any[]>([]);
  const [weeklyBilling, setWeeklyBilling] = useState<any[]>([]);
  const [diagCategories, setDiagCategories] = useState<string[]>([]);
  const [diagRows, setDiagRows] = useState<any[]>([]);
  const [kpis, setKpis] = useState({ admissionsMoM: 0, revenueMoM: 0, inventoryOrders: 0, avgLos: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [admData, billingWeekly, billingMonthly, poData, diagData] = await Promise.all([
          fetchAdmissionsMonthlyAnalytics(12),
          fetchBillingWeeklyAnalytics(12),
          fetchBillingMonthlyAnalytics(12),
          fetchPOMonthlyAnalytics(12),
          fetchDiagnosticsMonthlyCategoryAnalytics(6),
        ]);

        const admFilled = fillMonthGaps(admData.monthly, 12, { admissions: 0, discharges: 0 });
        const bilMap = new Map(billingMonthly.map(d => [d.month, d.revenue]));
        const poMap  = new Map(poData.map(d => [d.month, d.count]));

        const overview = admFilled.map(d => ({
          month: d.label,
          admissions: d.admissions,
          discharges: d.discharges,
          revenue: bilMap.get(d.month) ?? 0,
          inventory: poMap.get(d.month) ?? 0,
        }));
        setMonthlyOverview(overview);

        const diagWithLabel = diagData.rows.map(row => ({ ...row, month: toMonthLabel(row.month) }));
        setDiagCategories(diagData.categories);
        setDiagRows(diagWithLabel);
        setWeeklyBilling(billingWeekly);

        const lastTwo = overview.slice(-2);
        const prevAdm = lastTwo[0]?.admissions ?? 0;
        const currAdm = lastTwo[1]?.admissions ?? 0;
        const prevRev = lastTwo[0]?.revenue ?? 0;
        const currRev = lastTwo[1]?.revenue ?? 0;
        setKpis({
          admissionsMoM: prevAdm > 0 ? +((((currAdm - prevAdm) / prevAdm) * 100).toFixed(1)) : 0,
          revenueMoM:    prevRev > 0 ? +((((currRev - prevRev) / prevRev) * 100).toFixed(1)) : 0,
          inventoryOrders: poData.reduce((s, d) => s + d.count, 0),
          avgLos: admData.avgLos,
        });
      } catch (err) {
        console.error('TrendsAnalytics load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const metricLabels: Record<typeof metric, string> = {
    admissions: 'Admissions & Discharges',
    revenue:    'Billing Revenue (₹K)',
    inventory:  'Purchase Orders',
    diagnostics: 'Diagnostics Volume',
  };

  const metricColors: Record<typeof metric, string> = {
    admissions: PRIMARY,
    revenue:    SUCCESS,
    inventory:  WARNING,
    diagnostics: PURPLE,
  };

  return (
    <div className="space-y-6 p-1">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(215,28%,14%)' }}>Trends Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(220,12%,54%)' }}>12-month historical trends across all modules</p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: 'hsl(220,16%,88%)', color: 'hsl(220,12%,54%)' }}>
          <Activity size={13} />
          Live Data
        </div>
      </div>

      {/* ── KPI strip ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Admissions MoM"
          value={loading ? '—' : `${kpis.admissionsMoM >= 0 ? '+' : ''}${kpis.admissionsMoM}%`}
          icon={Users}
          trend={kpis.admissionsMoM}
          sub="month-over-month change"
          accent={kpis.admissionsMoM >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          label="Revenue MoM"
          value={loading ? '—' : `${kpis.revenueMoM >= 0 ? '+' : ''}${kpis.revenueMoM}%`}
          icon={DollarSign}
          trend={kpis.revenueMoM}
          sub="billing revenue change"
          accent={kpis.revenueMoM >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          label="PO Orders (12m)"
          value={loading ? '—' : kpis.inventoryOrders}
          icon={Package}
          sub="total purchase orders"
          accent="primary"
        />
        <StatCard
          label="Avg LOS (days)"
          value={loading ? '—' : kpis.avgLos > 0 ? `${kpis.avgLos}d` : 'N/A'}
          icon={Calendar}
          sub="average length of stay"
          accent="cyan"
        />
      </div>

      {/* ── 12-Month Overview ──────────────────────────────────────────── */}
      <ChartCard
        title="12-Month Overview"
        subtitle={`Live data — ${metricLabels[metric]}`}
        badge="12 months"
      >
        {/* Metric tabs */}
        <div className="flex gap-1 px-2 pb-3 pt-1" style={{ background: 'hsl(220,14%,96%)', borderRadius: 8, margin: '0 8px 12px', padding: '4px' }}>
          {(['admissions', 'revenue', 'inventory', 'diagnostics'] as const).map(m => (
            <MetricTab key={m} active={metric === m} onClick={() => setMetric(m)}>
              {m}
            </MetricTab>
          ))}
        </div>

        {loading ? <LoadingChart h={260} /> : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={monthlyOverview} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <defs>
                {CATEGORY_COLORS.map((c, i) => (
                  <linearGradient key={i} id={`ovGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(220,12%,54%)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220,12%,54%)' }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {metric === 'admissions' && (
                <>
                  <Area type="monotone" dataKey="admissions" stroke={PRIMARY} fill="url(#ovGrad0)" strokeWidth={2.5} name="Admissions" dot={false} />
                  <Area type="monotone" dataKey="discharges" stroke={SUCCESS} fill="url(#ovGrad2)" strokeWidth={2} strokeDasharray="5 3" name="Discharges" dot={false} />
                </>
              )}
              {metric === 'revenue' && (
                <Area type="monotone" dataKey="revenue" stroke={SUCCESS} fill="url(#ovGrad2)" strokeWidth={2.5} name="Revenue (₹K)" dot={false} />
              )}
              {metric === 'inventory' && (
                <Area type="monotone" dataKey="inventory" stroke={WARNING} fill="url(#ovGrad3)" strokeWidth={2.5} name="PO Orders" dot={false} />
              )}
              {metric === 'diagnostics' && diagRows.length > 0 && (
                <Area type="monotone" dataKey={diagCategories[0] ?? 'count'} stroke={PURPLE} fill="url(#ovGrad4)" strokeWidth={2.5} name="Diagnostics" dot={false} />
              )}
              {metric === 'diagnostics' && diagRows.length === 0 && (
                <Area type="monotone" dataKey="admissions" stroke="hsl(220,13%,80%)" fill="url(#ovGrad0)" strokeWidth={1} name="No data" dot={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* ── Billing + Diagnostics row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Billing Collection Trend" subtitle="Weekly collected vs outstanding (₹K)">
          {loading ? <LoadingChart h={220} /> : weeklyBilling.length === 0 ? (
            <EmptyChart h={220} msg="No billing data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyBilling} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(220,12%,54%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(220,12%,54%)' }} />
                <Tooltip content={<ChartTooltip suffix="K" />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="collected"   stackId="a" fill={SUCCESS} name="Collected (₹K)" />
                <Bar dataKey="outstanding" stackId="a" fill={WARNING} name="Outstanding (₹K)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Diagnostics Volume by Category" subtitle="Test bookings by category — last 6 months">
          {loading ? <LoadingChart h={220} /> : diagRows.length === 0 ? (
            <EmptyChart h={220} msg="No diagnostic booking data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={diagRows} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  {diagCategories.map((_, i) => (
                    <linearGradient key={i} id={`dGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stopOpacity={0.22} />
                      <stop offset="95%" stopColor={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(220,12%,54%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(220,12%,54%)' }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {diagCategories.map((cat, i) => (
                  <Area key={cat} type="monotone" dataKey={cat}
                    stroke={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                    fill={`url(#dGrad${i})`} strokeWidth={2} name={cat}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Admissions vs Discharges ───────────────────────────────────── */}
      <ChartCard title="Admissions vs Discharges" subtitle="12-month patient flow trend" badge="Patient Flow">
        {loading ? <LoadingChart h={220} /> : monthlyOverview.every(d => d.admissions === 0 && d.discharges === 0) ? (
          <EmptyChart h={220} msg="No admissions data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyOverview} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(220,12%,54%)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(220,12%,54%)' }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="admissions" fill={PRIMARY}  name="Admissions" radius={[3, 3, 0, 0]} />
              <Bar dataKey="discharges" fill={SUCCESS}  name="Discharges" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

    </div>
  );
};
