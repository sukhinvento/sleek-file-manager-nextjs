import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { formatIndianCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  Scale, DollarSign, TrendingUp, TrendingDown, Landmark,
  ChevronDown, ChevronUp, Download, Lock,
} from 'lucide-react';
import * as financeReportService from '@/services/financeReportService';
import { BalanceSheetData } from '@/types/finance';
import { DatePicker } from '@/components/ui/date-picker';

const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';
const PRIMARY   = STAT_ACCENTS.PRIMARY;

interface SectionProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  accounts: any[];
  total: number;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, icon: Icon, iconColor, accounts, total, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="border shadow-sm overflow-hidden" style={{ borderColor: BORDER }}>
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors"
        onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${iconColor}18` }}>
            <Icon size={14} style={{ color: iconColor }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{title}</span>
          <Badge className="bg-gray-100 text-gray-700 border-0 text-[10px] pointer-events-none ml-1">{accounts.length}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold font-mono" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(total)}</span>
          {open ? <ChevronUp size={14} style={{ color: TEXT_MUTE }} /> : <ChevronDown size={14} style={{ color: TEXT_MUTE }} />}
        </div>
      </button>
      {open && accounts.length > 0 && (
        <div style={{ borderTop: `1px solid ${BORDER}` }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'hsl(220,16%,97%)' }}>
                <th className="text-left px-4 py-1.5 font-medium text-xs hidden sm:table-cell" style={{ color: TEXT_MUTE }}>Code</th>
                <th className="text-left px-4 py-1.5 font-medium text-xs" style={{ color: TEXT_MUTE }}>Account</th>
                <th className="text-right px-4 py-1.5 font-medium text-xs" style={{ color: TEXT_MUTE }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc: any, i: number) => (
                <tr key={i} style={{ borderTop: `1px solid ${BORDER}` }}>
                  <td className="px-4 py-2 font-mono text-xs hidden sm:table-cell" style={{ color: TEXT_MUTE }}>{acc.account_code || acc.accountCode || ''}</td>
                  <td className="px-4 py-2 text-xs font-medium" style={{ color: TEXT_MAIN }}>{acc.account_name || acc.accountName || ''}</td>
                  <td className="px-4 py-2 text-right font-mono text-xs font-semibold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(acc.balance ?? acc.amount ?? 0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${BORDER}`, background: 'hsl(220,16%,97%)' }}>
                <td colSpan={2} className="px-4 py-2 text-xs font-bold uppercase" style={{ color: TEXT_MUTE }}>Total {title}</td>
                <td className="px-4 py-2 text-right font-mono text-sm font-bold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>
  );
}

export function BalanceSheet() {
  const [asOfDate, setAsOfDate] = useState<Date>(new Date());
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const result = await financeReportService.getBalanceSheet();
      setData(result);
    } catch {
      toast({ title: 'Error', description: 'Failed to generate balance sheet', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [asOfDate]);

  const isBalanced = data ? Math.abs(data.assets.total - (data.liabilities.total + data.equity.total)) < 1 : false;

  return (
    <div className="space-y-3">
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3 overflow-hidden" style={{ borderColor: BORDER }}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-medium" style={{ color: TEXT_MUTE }}>As of</span>
            <DatePicker
              date={asOfDate}
              onDateChange={(d) => d && setAsOfDate(d)}
              placeholder="Select date"
              className="h-8 text-xs w-40"
            />
          </div>
          <Button size="sm" className="h-8 text-xs flex-shrink-0" onClick={generate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </Button>
          <div className="flex-1 hidden lg:block" />
          <Button size="sm" variant="outline" className="h-8 text-xs opacity-50 cursor-not-allowed flex-shrink-0" disabled>
            <Lock size={11} className="mr-1" /> Export PDF
            <Badge className="bg-amber-50 text-amber-700 border-0 text-[9px] ml-1.5 pointer-events-none">PREMIUM</Badge>
          </Button>
        </div>
      </div>

      {!data && !loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Scale className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Click "Generate" to load the Balance Sheet</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Generating balance sheet...</p>
          </div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* KPI strip */}
          <div className="stat-cards-scroll">
            <div className="flex flex-nowrap gap-3 w-max">
              <StatCard label="Total Assets" value={formatIndianCurrency(data.assets.total)} icon={Landmark} accent={STAT_ACCENTS.PRIMARY} active={true} />
              <StatCard label="Total Liabilities" value={formatIndianCurrency(data.liabilities.total)} icon={TrendingDown} accent={STAT_ACCENTS.DANGER} active={true} />
              <StatCard label="Total Equity" value={formatIndianCurrency(data.equity.total)} icon={TrendingUp} accent={STAT_ACCENTS.PURPLE} />
              <StatCard label="Net Assets" value={formatIndianCurrency(data.netAssets)} icon={DollarSign} accent={STAT_ACCENTS.SUCCESS} active={true} />
            </div>
          </div>

          {/* Collapsible sections */}
          <div>
            <CollapsibleSection
              title="Assets"
              icon={Landmark}
              iconColor={STAT_ACCENTS.PRIMARY}
              accounts={data.assets.accounts}
              total={data.assets.total}
            />
            <CollapsibleSection
              title="Liabilities"
              icon={TrendingDown}
              iconColor={STAT_ACCENTS.DANGER}
              accounts={data.liabilities.accounts}
              total={data.liabilities.total}
            />
            <CollapsibleSection
              title="Equity"
              icon={TrendingUp}
              iconColor={STAT_ACCENTS.PURPLE}
              accounts={data.equity.accounts}
              total={data.equity.total}
            />
          </div>

          {/* Equation verification footer */}
          <Card className="border shadow-sm p-4" style={{ borderColor: BORDER }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale size={16} style={{ color: isBalanced ? STAT_ACCENTS.SUCCESS : STAT_ACCENTS.DANGER }} />
                <span className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>
                  Accounting Equation Verification
                </span>
              </div>
              <Badge className={`${isBalanced ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'} border-0 text-xs pointer-events-none`}>
                {isBalanced ? 'Balanced' : 'Imbalanced'}
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm font-mono" style={{ color: TEXT_MAIN }}>
              <div className="flex-1 text-center p-2 rounded-lg" style={{ background: `${STAT_ACCENTS.PRIMARY}10` }}>
                <p className="text-[10px] font-medium uppercase" style={{ color: TEXT_MUTE }}>Assets</p>
                <p className="font-bold">{formatIndianCurrency(data.assets.total)}</p>
              </div>
              <span className="text-lg font-bold" style={{ color: TEXT_MUTE }}>=</span>
              <div className="flex-1 text-center p-2 rounded-lg" style={{ background: `${STAT_ACCENTS.DANGER}10` }}>
                <p className="text-[10px] font-medium uppercase" style={{ color: TEXT_MUTE }}>Liabilities</p>
                <p className="font-bold">{formatIndianCurrency(data.liabilities.total)}</p>
              </div>
              <span className="text-lg font-bold" style={{ color: TEXT_MUTE }}>+</span>
              <div className="flex-1 text-center p-2 rounded-lg" style={{ background: `${STAT_ACCENTS.PURPLE}10` }}>
                <p className="text-[10px] font-medium uppercase" style={{ color: TEXT_MUTE }}>Equity</p>
                <p className="font-bold">{formatIndianCurrency(data.equity.total)}</p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
