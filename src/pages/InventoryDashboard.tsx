import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  BarChart3,
  Eye,
  ShoppingCart,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  fetchInventoryDashboardAnalytics,
  fetchSOMonthlyAnalytics,
  fetchPOMonthlyAnalytics,
  fillMonthGaps,
  toMonthLabel,
  type InventoryDashboardAnalytics,
} from '@/services/analyticsService';

// ── Colour palette (mirrors CSS tokens) ────────────────────────
const PRIMARY      = 'hsl(220, 48%, 42%)';
const PRIMARY_LIGHT = 'hsl(220, 55%, 60%)';
const SUCCESS      = 'hsl(158, 70%, 36%)';
const WARNING      = 'hsl(33, 92%, 48%)';
const DANGER       = 'hsl(354, 70%, 50%)';
const MUTED        = 'hsl(220, 18%, 88%)';

const PIE_COLORS = [PRIMARY, PRIMARY_LIGHT, SUCCESS, WARNING, DANGER, 'hsl(270,55%,55%)', 'hsl(200,75%,45%)'];

// ── Data helpers ────────────────────────────────────────────────
const getStockStatus = (current: number, min: number) => {
  if (current === 0) return 'out';
  if (current <= min) return 'critical';
  if (current <= min * 1.5) return 'low';
  return 'normal';
};

// ── Custom tooltip ──────────────────────────────────────────────
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

// ── Stat card ───────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  sub?: string;
  accent?: 'primary' | 'danger' | 'warning' | 'success';
}
const StatCard = ({ label, value, icon: Icon, trend, sub, accent = 'primary' }: StatCardProps) => {
  const colours: Record<string, { bg: string; icon: string; text: string }> = {
    primary: { bg: 'hsl(220,48%,42%/0.07)', icon: PRIMARY,  text: PRIMARY  },
    danger:  { bg: 'hsl(354,70%,50%/0.08)', icon: DANGER,   text: DANGER   },
    warning: { bg: 'hsl(33,92%,48%/0.08)',  icon: WARNING,  text: WARNING  },
    success: { bg: 'hsl(158,70%,36%/0.08)', icon: SUCCESS,  text: SUCCESS  },
  };
  const c = colours[accent];
  return (
    <Card className="flex-shrink-0 border-0 shadow-sm" style={{ background: 'hsl(0,0%,100%)', minWidth: 160 }}>
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

// ── Section heading ─────────────────────────────────────────────
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold mb-3" style={{ color: 'hsl(215,28%,14%)' }}>{children}</h3>
);

// ── Main component ──────────────────────────────────────────────
export const InventoryDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<InventoryDashboardAnalytics | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<Array<{ month: string; sales: number; purchases: number }>>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashData, soData, poData] = await Promise.all([
          fetchInventoryDashboardAnalytics(),
          fetchSOMonthlyAnalytics(6),
          fetchPOMonthlyAnalytics(6),
        ]);
        setAnalytics(dashData);

        // Build merged monthly trend (last 6 months)
        const soFilled = fillMonthGaps(soData.map(d => ({ month: d.month, sales: d.total })), 6, { sales: 0 });
        const poMap = new Map(poData.map(d => [d.month, d.total]));
        setMonthlyTrend(soFilled.map(d => ({
          month: d.label,
          sales: d.sales,
          purchases: poMap.get(d.month) ?? 0,
        })));
      } catch (err) {
        console.error('InventoryDashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived data ────────────────────────────────────────────────
  const metrics = analytics?.stats ?? { total: 0, totalValue: 0, outOfStock: 0, critical: 0, low: 0, normal: 0, categories: 0 };

  const categoryData = (analytics?.categoryBreakdown ?? []).map(c => ({
    category: c.category.length > 14 ? c.category.slice(0, 13) + '…' : c.category,
    fullName: c.category,
    items: c.items,
    value: c.value,
    critical: c.critical,
  }));

  const stockLevelData = (analytics?.stockLevels ?? []).map(s => ({
    name: s.name.length > 16 ? s.name.slice(0, 15) + '…' : s.name,
    current: s.current,
    minimum: s.minimum,
    reorder: s.reorder,
  }));

  const usageVelocity = (analytics?.categoryBreakdown ?? []).slice(0, 6).map(c => ({
    week: c.category.length > 12 ? c.category.slice(0, 11) + '…' : c.category,
    units: c.consumed,
  }));

  const stockStatusData = [
    { name: 'Normal',   value: metrics.normal,    color: SUCCESS },
    { name: 'Low',      value: metrics.low,        color: WARNING },
    { name: 'Critical', value: metrics.critical,   color: DANGER  },
    { name: 'Out',      value: metrics.outOfStock, color: 'hsl(220,12%,56%)' },
  ].filter(d => d.value > 0);

  const fmt = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6 pb-8">

      {/* ── KPI strip ── */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-3 w-max">
          <StatCard label="Total SKUs"       value={loading ? '—' : metrics.total}             icon={Package}       trend={8}  sub={loading ? '' : `${metrics.categories} categories`} />
          <StatCard label="Stock Value"      value={loading ? '—' : fmt(metrics.totalValue)}    icon={DollarSign}    trend={12} accent="primary" />
          <StatCard label="Critical Items"   value={loading ? '—' : metrics.critical}           icon={AlertTriangle} trend={-3} accent="danger"  sub="Need immediate reorder" />
          <StatCard label="Low Stock"        value={loading ? '—' : metrics.low}                icon={TrendingUp}    sub={loading ? '' : `${metrics.normal} items normal`} accent="warning" />
          <StatCard label="Out of Stock"     value={loading ? '—' : metrics.outOfStock}         icon={Package}       accent="danger" />
          <StatCard label="Categories"       value={loading ? '—' : metrics.categories}         icon={ShoppingCart}  trend={15} accent="success" />
        </div>
      </div>

      {/* ── Row 1: Sales vs Purchases trend + Stock status pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area chart: monthly sales vs purchases */}
        <Card className="lg:col-span-2 border border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 size={16} style={{ color: PRIMARY }} />
                Sales vs Purchases — 6 Month Trend
              </CardTitle>
              <Badge variant="outline" className="text-xs">₹ INR</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {loading ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyTrend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={PRIMARY}  stopOpacity={0.18} />
                      <stop offset="95%" stopColor={PRIMARY}  stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradPurch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={SUCCESS}  stopOpacity={0.18} />
                      <stop offset="95%" stopColor={SUCCESS}  stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,92%)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(220,12%,54%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(220,12%,54%)' }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1e5 ? `${(v/1e5).toFixed(0)}L` : `${(v/1e3).toFixed(0)}k`} width={36} />
                  <Tooltip content={<ChartTooltip prefix="₹" />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="sales"     name="Sales"     stroke={PRIMARY} strokeWidth={2} fill="url(#gradSales)" dot={false} activeDot={{ r: 4 }} />
                  <Area type="monotone" dataKey="purchases" name="Purchases" stroke={SUCCESS} strokeWidth={2} fill="url(#gradPurch)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie: stock status */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Package size={16} style={{ color: PRIMARY }} />
              Stock Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 flex flex-col items-center">
            {loading ? (
              <div className="h-[170px] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={stockStatusData} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                      dataKey="value" paddingAngle={3} strokeWidth={0}>
                      {stockStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number, n: string) => [`${v} items`, n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-1.5 mt-1">
                  {stockStatusData.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                        <span style={{ color: 'hsl(220,12%,46%)' }}>{d.name}</span>
                      </div>
                      <span className="font-semibold" style={{ color: 'hsl(215,28%,14%)' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Category bar chart + Usage velocity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bar: category breakdown */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BarChart3 size={16} style={{ color: PRIMARY }} />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {loading ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,92%)" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: 'hsl(220,12%,54%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(220,12%,54%)' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="items"    name="Items"    fill={PRIMARY}  radius={[4,4,0,0]} />
                  <Bar dataKey="critical" name="Critical" fill={DANGER}   radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Line: stock consumption by category */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp size={16} style={{ color: PRIMARY }} />
              Stock Consumed by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {loading ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
            ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={usageVelocity} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,92%)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(220,12%,54%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(220,12%,54%)' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<ChartTooltip suffix=" units" />} />
                <Line type="monotone" dataKey="units" name="Units consumed" stroke={PRIMARY} strokeWidth={2.5}
                  dot={{ fill: PRIMARY, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Stock levels vs minimum bar + Category value bars ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Grouped bar: current stock vs minimum */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Package size={16} style={{ color: PRIMARY }} />
              Stock Levels vs Minimum (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {loading ? (
              <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stockLevelData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }} barSize={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,16%,92%)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(220,12%,54%)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(220,12%,54%)' }} width={100} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="current" name="Current"  fill={PRIMARY}  radius={[0,4,4,0]} />
                  <Bar dataKey="minimum" name="Min level" fill={WARNING}  radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category value + quick actions */}
        <div className="space-y-4">
          {/* Category value */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <DollarSign size={16} style={{ color: PRIMARY }} />
                Stock Value by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-4 space-y-3">
              {loading ? (
                <div className="py-4 text-sm text-muted-foreground text-center">Loading…</div>
              ) : (
                categoryData.sort((a,b) => b.value - a.value).map((cat, i) => {
                  const maxVal = Math.max(...categoryData.map(c => c.value));
                  const pct = maxVal ? Math.round((cat.value / maxVal) * 100) : 0;
                  return (
                    <div key={cat.fullName} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'hsl(215,28%,14%)', fontWeight: 500 }}>{cat.fullName}</span>
                        <span style={{ color: 'hsl(220,12%,46%)' }}>{fmt(cat.value)}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(220,18%,92%)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-sm font-semibold text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 grid grid-cols-3 gap-2">
              <Button size="sm" variant="outline" className="flex-col h-auto py-3 gap-1.5 text-xs" onClick={() => navigate('/inventory')}>
                <Eye size={16} className="text-primary" />
                Inventory
              </Button>
              <Button size="sm" variant="outline" className="flex-col h-auto py-3 gap-1.5 text-xs" onClick={() => navigate('/purchase-orders')}>
                <ShoppingCart size={16} className="text-primary" />
                New PO
              </Button>
              <Button size="sm" variant="outline" className="flex-col h-auto py-3 gap-1.5 text-xs" onClick={() => navigate('/vendors')}>
                <Users size={16} className="text-primary" />
                Vendors
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Row 4: Critical items alert table ── */}
      {!loading && metrics.critical > 0 && (
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle size={16} style={{ color: DANGER }} />
                Critical Stock Alerts
              </CardTitle>
              <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => navigate('/inventory')}>
                <RefreshCw size={12} /> Reorder
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left py-2 pr-4 font-semibold" style={{ color: PRIMARY }}>Item</th>
                    <th className="text-right py-2 pr-4 font-semibold" style={{ color: PRIMARY }}>Current</th>
                    <th className="text-right py-2 font-semibold" style={{ color: PRIMARY }}>Min Level</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.stockLevels ?? [])
                    .filter(s => getStockStatus(s.current, s.minimum) !== 'normal')
                    .map(item => {
                      const status = getStockStatus(item.current, item.minimum);
                      const badgeColor = status === 'critical' ? DANGER : status === 'out' ? 'hsl(220,12%,46%)' : WARNING;
                      return (
                        <tr key={item.name} style={{ borderTop: '1px solid hsl(220,16%,92%)' }}>
                          <td className="py-2 pr-4 font-medium" style={{ color: 'hsl(215,28%,14%)' }}>{item.name}</td>
                          <td className="py-2 pr-4 text-right font-mono font-semibold" style={{ color: badgeColor }}>{item.current}</td>
                          <td className="py-2 text-right font-mono" style={{ color: 'hsl(220,12%,54%)' }}>{item.minimum}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
