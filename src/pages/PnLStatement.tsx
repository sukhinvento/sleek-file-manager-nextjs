import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { formatIndianCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, Download, TrendingUp, TrendingDown } from 'lucide-react';
import * as financeReportService from '@/services/financeReportService';
import { PnLStatement as PnLData, PnLSection } from '@/types/finance';
import { DatePicker } from '@/components/ui/date-picker';

const toDate = (s: string): Date | undefined => s ? new Date(s + 'T00:00:00') : undefined;
const fromDate = (d: Date | undefined): string => d ? d.toISOString().split('T')[0] : '';

const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';
const PRIMARY   = STAT_ACCENTS.PRIMARY;

// Period preset helpers
function isoDate(d: Date) { return d.toISOString().slice(0, 10); }
function today() { return isoDate(new Date()); }
function firstOfMonth(d = new Date()) { return isoDate(new Date(d.getFullYear(), d.getMonth(), 1)); }
function lastOfMonth(d = new Date()) { return isoDate(new Date(d.getFullYear(), d.getMonth() + 1, 0)); }
function addMonths(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth() + n, d.getDate()); }

const PERIOD_PRESETS = [
  { label: 'This Month', from: () => firstOfMonth(), to: () => today() },
  { label: 'Last Month', from: () => firstOfMonth(addMonths(new Date(), -1)), to: () => lastOfMonth(addMonths(new Date(), -1)) },
  { label: 'Last 3 Months', from: () => isoDate(addMonths(new Date(), -3)), to: () => today() },
  { label: 'This Year', from: () => `${new Date().getFullYear()}-01-01`, to: () => today() },
];

function SectionBlock({ section }: { section: PnLSection }) {
  return (
    <div>
      <div className="px-4 py-2" style={{ background: 'hsl(220,16%,96%)' }}>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_MUTE }}>{section.title}</p>
      </div>
      {section.lines.map((l, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-2" style={{ borderTop: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[10px] shrink-0 w-10 text-right" style={{ color: TEXT_MUTE }}>{l.accountCode}</span>
            <span className="text-sm truncate" style={{ color: TEXT_MAIN }}>{l.accountName}</span>
          </div>
          <span className="font-mono font-medium text-sm shrink-0 ml-4" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(l.amount)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: `2px solid ${BORDER}`, background: 'hsl(220,16%,98%)' }}>
        <span className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>Total {section.title}</span>
        <span className="font-mono font-bold text-sm" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(section.subtotal)}</span>
      </div>
    </div>
  );
}

function SubtotalRow({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  const positive = value >= 0;
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg mx-2 my-1"
      style={{
        background: highlight ? (positive ? 'hsl(158,70%,96%)' : 'hsl(354,70%,96%)') : 'hsl(220,16%,96%)',
        border: `1px solid ${highlight ? (positive ? 'hsl(158,60%,85%)' : 'hsl(354,60%,85%)') : BORDER}`,
      }}>
      <div className="flex items-center gap-2">
        {positive ? <TrendingUp size={15} style={{ color: 'hsl(158,70%,36%)' }} /> : <TrendingDown size={15} style={{ color: 'hsl(354,70%,50%)' }} />}
        <span className="font-semibold text-sm" style={{ color: TEXT_MAIN }}>{label}</span>
      </div>
      <span className="font-mono font-bold text-base" style={{ color: positive ? 'hsl(158,70%,36%)' : 'hsl(354,70%,50%)' }}>
        {formatIndianCurrency(Math.abs(value))}
        <span className="text-xs ml-1 font-normal" style={{ color: TEXT_MUTE }}>{positive ? 'Profit' : 'Loss'}</span>
      </span>
    </div>
  );
}

export function PnLStatement() {
  const [periodFrom, setPeriodFrom] = useState(firstOfMonth());
  const [periodTo, setPeriodTo] = useState(today());
  const [activePreset, setActivePreset] = useState('This Month');
  const [data, setData] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPnL = useCallback(async () => {
    setLoading(true);
    try {
      const res = await financeReportService.getPnLStatement(periodFrom, periodTo);
      setData(res);
    } catch {
      toast({ title: 'Error', description: 'Failed to generate P&L statement', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [periodFrom, periodTo]);

  useEffect(() => { fetchPnL(); }, [fetchPnL]);

  function applyPreset(preset: typeof PERIOD_PRESETS[0]) {
    setActivePreset(preset.label);
    setPeriodFrom(preset.from());
    setPeriodTo(preset.to());
  }

  const netMarginPct  = data && data.revenue.subtotal > 0 ? ((data.netIncome   / data.revenue.subtotal) * 100).toFixed(1) : '0.0';
  const grossMarginPct = data && data.revenue.subtotal > 0 ? ((data.grossProfit / data.revenue.subtotal) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-3">
      {/* KPI stat cards */}
      {data && (
        <div className="stat-cards-scroll">
          <div className="flex flex-nowrap gap-3 w-max">
            <StatCard label="Revenue" value={formatIndianCurrency(data.revenue.subtotal)} icon={TrendingUp} accent={PRIMARY} active={true} />
            <StatCard label="Gross Profit" value={formatIndianCurrency(data.grossProfit)} icon={TrendingUp} accent={STAT_ACCENTS.SUCCESS} />
            <StatCard label="Op. Income" value={formatIndianCurrency(data.operatingIncome)} icon={TrendingUp} accent={STAT_ACCENTS.CYAN} />
            <StatCard label="Net Income" value={formatIndianCurrency(data.netIncome)} icon={data.netIncome >= 0 ? TrendingUp : TrendingDown}
              accent={data.netIncome >= 0 ? STAT_ACCENTS.SUCCESS : STAT_ACCENTS.DANGER} active={true} />
          </div>
        </div>
      )}

      {/* Sticky filter bar — period presets + custom date range */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3" style={{ borderColor: BORDER }}>
        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-3 flex-wrap">
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {PERIOD_PRESETS.map(p => (
                <button key={p.label}
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: activePreset === p.label ? PRIMARY : 'transparent',
                    color: activePreset === p.label ? '#fff' : TEXT_MUTE,
                    borderColor: activePreset === p.label ? PRIMARY : BORDER,
                  }}>{p.label}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs" style={{ color: TEXT_MUTE }}>From</span>
            <DatePicker
              date={toDate(periodFrom)}
              onDateChange={d => { setPeriodFrom(fromDate(d)); setActivePreset(''); }}
              placeholder="Start date"
              className="h-8 text-xs w-36"
            />
            <span className="text-xs" style={{ color: TEXT_MUTE }}>To</span>
            <DatePicker
              date={toDate(periodTo)}
              onDateChange={d => { setPeriodTo(fromDate(d)); setActivePreset(''); }}
              placeholder="End date"
              className="h-8 text-xs w-36"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 flex-shrink-0" onClick={fetchPnL} disabled={loading}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Generate
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 flex-shrink-0" disabled>
            <Download size={12} /> Export PDF
            <Badge className="ml-1 bg-amber-100 text-amber-700 border-amber-200 border text-[9px] px-1 py-0 pointer-events-none">PREMIUM</Badge>
          </Button>
        </div>
        {/* Mobile */}
        <div className="lg:hidden space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: TEXT_MUTE }}>From</p>
              <DatePicker
                date={toDate(periodFrom)}
                onDateChange={d => { setPeriodFrom(fromDate(d)); setActivePreset(''); }}
                placeholder="Start date"
                className="h-8 text-xs w-full"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: TEXT_MUTE }}>To</p>
              <DatePicker
                date={toDate(periodTo)}
                onDateChange={d => { setPeriodTo(fromDate(d)); setActivePreset(''); }}
                placeholder="End date"
                className="h-8 text-xs w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide flex-1">
              <div className="flex gap-1.5 w-max">
                {PERIOD_PRESETS.map(p => (
                  <button key={p.label}
                    onClick={() => applyPreset(p)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                    style={{
                      background: activePreset === p.label ? PRIMARY : 'transparent',
                      color: activePreset === p.label ? '#fff' : TEXT_MUTE,
                      borderColor: activePreset === p.label ? PRIMARY : BORDER,
                    }}>{p.label}</button>
                ))}
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 flex-shrink-0" onClick={fetchPnL} disabled={loading}>
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw size={20} className="animate-spin" style={{ color: PRIMARY }} />
          <span className="ml-2 text-sm" style={{ color: TEXT_MUTE }}>Generating…</span>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Margin badges */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'Gross Margin', value: grossMarginPct + '%' },
              { label: 'Net Margin', value: netMarginPct + '%' },
              { label: 'Period', value: `${data.periodFrom} → ${data.periodTo}` },
            ].map(b => (
              <span key={b.label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs" style={{ borderColor: BORDER }}>
                <span style={{ color: TEXT_MUTE }}>{b.label}</span>
                <span className="font-bold" style={{ color: TEXT_MAIN }}>{b.value}</span>
              </span>
            ))}
          </div>

          {/* P&L body */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <SectionBlock section={data.revenue} />
            <SubtotalRow label="Gross Profit" value={data.grossProfit} />
            <SectionBlock section={data.cogs} />
            <SectionBlock section={data.operatingExpenses} />
            <SubtotalRow label="Operating Income" value={data.operatingIncome} />
            {data.otherIncome.lines.length > 0 && <SectionBlock section={data.otherIncome} />}
            {data.otherExpenses.lines.length > 0 && <SectionBlock section={data.otherExpenses} />}
            <SubtotalRow label="Net Income / (Loss)" value={data.netIncome} highlight />
          </Card>

          <p className="text-xs text-right pb-2" style={{ color: TEXT_MUTE }}>
            Generated: {new Date(data.generatedAt).toLocaleString('en-IN')}
          </p>
        </>
      )}
    </div>
  );
}
