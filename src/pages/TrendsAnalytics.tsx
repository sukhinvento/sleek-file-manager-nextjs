import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, DollarSign, TrendingDown, Calendar,
  ArrowUpRight, ArrowDownRight, Activity, BarChart2,
} from 'lucide-react';
import {
  fetchAdmissionsMonthlyAnalytics,
  fetchBillingWeeklyAnalytics,
  fetchBillingMonthlyAnalytics,
  fetchExpenditureMonthlyAnalytics,
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
  const [metric, setMetric] = useState<'admissions' | 'revenue' | 'expenditure' | 'diagnostics'>('admissions');
  const [loading, setLoading] = useState(true);

  const [monthlyOverview,   setMonthlyOverview]   = useState<any[]>([]);
  const [revExpMonthly,     setRevExpMonthly]      = useState<any[]>([]);
  const [weeklyRevenue,     setWeeklyRevenue]      = useState<any[]>([]);
  const [diagCategories,    setDiagCategories]     = useState<string[]>([]);
  const [diagRows,          setDiagRows]           = useState<any[]>([]);
  const [kpis, setKpis] = useState<{
    admissionsMoM:  number | null;
    revenueMoM:     number | null;
    expenditureMoM: number | null;
    avgLos:         number;
    // Current month absolute values — shown as fallback when MoM has no prior baseline
    currAdm:  number;
    currRev:  number;
    currExp:  number;
  }>({
    admissionsMoM:  null,
    revenueMoM:     null,
    expenditureMoM: null,
    avgLos:         0,
    currAdm:  0,
    currRev:  0,
    currExp:  0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [admData, billingWeekly, billingMonthly, expenditureMonthly, poData, diagData] =
          await Promise.all([
            fetchAdmissionsMonthlyAnalytics(12),
            fetchBillingWeeklyAnalytics(12),
            fetchBillingMonthlyAnalytics(12),
            fetchExpenditureMonthlyAnalytics(12),
            fetchPOMonthlyAnalytics(12),
            fetchDiagnosticsMonthlyCategoryAnalytics(6),
          ]);

        const admFilled  = fillMonthGaps(admData.monthly, 12, { admissions: 0, discharges: 0 });
        const revMap     = new Map(billingMonthly.map(d => [d.month, d.revenue]));
        const expMap     = new Map(expenditureMonthly.map(d => [d.month, d.spend]));
        const poMap      = new Map(poData.map(d => [d.month, d.count]));

        // Overview data (used by all tabs)
        const overview = admFilled.map(d => ({
          month:       d.label,
          admissions:  d.admissions,
          discharges:  d.discharges,
          revenue:     revMap.get(d.month) ?? 0,
          expenditure: expMap.get(d.month) ?? 0,
          inventory:   poMap.get(d.month) ?? 0,
        }));
        setMonthlyOverview(overview);

        // Revenue vs Expenditure monthly comparison
        setRevExpMonthly(overview.map(d => ({
          month:       d.month,
          revenue:     d.revenue,
          expenditure: d.expenditure,
        })));

        const diagWithLabel = diagData.rows.map(row => ({ ...row, month: toMonthLabel(row.month) }));
        setDiagCategories(diagData.categories);
        setDiagRows(diagWithLabel);
        setWeeklyRevenue(billingWeekly);

        // MoM KPIs
        const lastTwo   = overview.slice(-2);
        const prevAdm   = lastTwo[0]?.admissions  ?? 0;
        const currAdm   = lastTwo[1]?.admissions  ?? 0;
        const prevRev   = lastTwo[0]?.revenue     ?? 0;
        const currRev   = lastTwo[1]?.revenue     ?? 0;
        const prevExp   = lastTwo[0]?.expenditure ?? 0;
        const currExp   = lastTwo[1]?.expenditure ?? 0;
        // Returns null when there's no prior baseline (prev = 0) — shown as "N/A" in UI
        const mom = (prev: number, curr: number): number | null =>
          prev > 0 ? +((((curr - prev) / prev) * 100).toFixed(1)) : null;

        setKpis({
          admissionsMoM:  mom(prevAdm, currAdm),
          revenueMoM:     mom(prevRev, currRev),
          expenditureMoM: mom(prevExp, currExp),
          avgLos:         admData.avgLos,
          currAdm,
          currRev,
          currExp,
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
    admissions:  'Admissions & Discharges',
    revenue:     'Revenue — SO + Diagnostics + Admissions (₹K)',
    expenditure: 'Expenditure — Purchase Orders (₹K)',
    diagnostics: 'Diagnostics Volume',
  };

  return (
    <div className="space-y-6 p-1">

      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: 'hsl(220,16%,88%)', color: 'hsl(220,12%,54%)' }}>
          <Activity size={13} />
          Live Data
        </div>
      </div>

      {/* ── KPI strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={kpis.admissionsMoM !== null ? 'Admissions MoM' : 'Admissions (this month)'}
          value={loading ? '—' : kpis.admissionsMoM !== null
            ? `${kpis.admissionsMoM >= 0 ? '+' : ''}${kpis.admissionsMoM}%`
            : String(kpis.currAdm)}
          icon={Users}
          trend={kpis.admissionsMoM ?? undefined}
          sub={kpis.admissionsMoM !== null ? 'month-over-month change' : 'first month of data'}
          accent={kpis.admissionsMoM === null ? 'cyan' : kpis.admissionsMoM >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          label={kpis.revenueMoM !== null ? 'Revenue MoM' : 'Revenue (this month)'}
          value={loading ? '—' : kpis.revenueMoM !== null
            ? `${kpis.revenueMoM >= 0 ? '+' : ''}${kpis.revenueMoM}%`
            : `₹${Math.abs(kpis.currRev).toLocaleString('en-IN')}`}
          icon={DollarSign}
          trend={kpis.revenueMoM ?? undefined}
          sub={kpis.revenueMoM !== null ? 'SO + diagnostics + admissions' : 'first month of data'}
          accent={kpis.revenueMoM === null ? 'cyan' : kpis.revenueMoM >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          label={kpis.expenditureMoM !== null ? 'Expenditure MoM' : 'Expenditure (this month)'}
          value={loading ? '—' : kpis.expenditureMoM !== null
            ? `${kpis.expenditureMoM >= 0 ? '+' : ''}${kpis.expenditureMoM}%`
            : `₹${Math.abs(kpis.currExp).toLocaleString('en-IN')}`}
          icon={TrendingDown}
          trend={kpis.expenditureMoM ?? undefined}
          sub={kpis.expenditureMoM !== null ? 'purchase orders to vendors' : 'first month of data'}
          accent={kpis.expenditureMoM === null ? 'cyan' : kpis.expenditureMoM <= 0 ? 'success' : 'warning'}
        />
        <StatCard
          label="Avg LOS (days)"
          value={loading ? '—' : kpis.avgLos > 0 ? `${kpis.avgLos}d` : 'N/A'}
          icon={Calendar}
          sub="average length of stay"
          accent="cyan"
        />
      </div>

      {/* ── 12-Month Overview ───────────────────────────────────────────── */}
      <ChartCard
        title="12-Month Overview"
        subtitle={`Live data — ${metricLabels[metric]}`}
        badge="12 months"
      >
        <div className="flex gap-1 overflow-x-auto scrollbar-hide" style={{ background: 'hsl(220,14%,96%)', borderRadius: 8, margin: '0 8px 12px', padding: '4px', WebkitOverflowScrolling: 'touch' }}>
          {(['admissions', 'revenue', 'expenditure', 'diagnostics'] as const).map(m => (
            <MetricTab key={m} active={metric === m} onClick={() => setMetric(m)}>
              {m}
            </MetricTab>
          ))}
        </div>

        {loading ? <LoadingChart h={260} /> : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={metric === 'diagnostics' ? diagRows : monthlyOverview} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
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
              {metric === 'expenditure' && (
                <Area type="monotone" dataKey="expenditure" stroke={DANGER} fill="url(#ovGrad5)" strokeWidth={2.5} name="Expenditure (₹K)" dot={false} />
              )}
              {metric === 'diagnostics' && diagRows.length > 0 &&
                diagCategories.map((cat, i) => (
                  <Area key={cat} type="monotone" dataKey={cat}
                    stroke={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                    fill={`url(#ovGrad${i})`} strokeWidth={2} name={cat} dot={false}
                  />
                ))
              }
              {metric === 'diagnostics' && diagRows.length === 0 && (
                <Area type="monotone" dataKey="admissions" stroke="hsl(220,13%,80%)" fill="url(#ovGrad0)" strokeWidth={1} name="No data" dot={false} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* ── Revenue vs Expenditure + Diagnostics ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Revenue vs Expenditure — monthly comparison */}
        <ChartCard
          title="Revenue vs Expenditure"
          subtitle="Monthly cash flow — income (+) vs procurement spend (−)"
          badge="12 months"
        >
          {loading ? <LoadingChart h={220} /> :
           revExpMonthly.every(d => d.revenue === 0 && d.expenditure === 0) ? (
            <EmptyChart h={220} msg="No financial data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revExpMonthly} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(220,12%,54%)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(220,12%,54%)' }} />
                <Tooltip content={<ChartTooltip suffix="K" />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue"     fill={SUCCESS} name="Revenue (₹K)"     radius={[3, 3, 0, 0]} />
                <Bar dataKey="expenditure" fill={DANGER}  name="Expenditure (₹K)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Revenue inflow trend (weekly collections) */}
        <ChartCard title="Revenue Collection (Weekly)" subtitle="Collected vs outstanding from SO + diagnostics + admissions (₹K)">
          {loading ? <LoadingChart h={220} /> : weeklyRevenue.length === 0 ? (
            <EmptyChart h={220} msg="No revenue data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyRevenue} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
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
      </div>

      {/* ── Diagnostics + Admissions row ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <Bar dataKey="admissions" fill={PRIMARY} name="Admissions" radius={[3, 3, 0, 0]} />
                <Bar dataKey="discharges" fill={SUCCESS} name="Discharges" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

    </div>
  );
};
