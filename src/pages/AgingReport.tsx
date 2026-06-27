import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { formatIndianCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, TrendingDown, Clock, AlertTriangle, Landmark, X } from 'lucide-react';
import * as financeReportService from '@/services/financeReportService';
import { DatePicker } from '@/components/ui/date-picker';

const toDate = (s: string): Date | undefined => s ? new Date(s + 'T00:00:00') : undefined;
const fromDate = (d: Date | undefined): string => d ? d.toISOString().split('T')[0] : '';
import { AgingEntry, AgingBucketSummary } from '@/types/finance';
import { AttachmentSection, Attachment } from '@/components/finance/AttachmentSection';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';
const PRIMARY   = STAT_ACCENTS.PRIMARY;

const BUCKET_TEXT: Record<string, string> = {
  current:  'text-emerald-700', '31-60': 'text-amber-600',
  '61-90':  'text-orange-600',  '90+':   'text-red-700',
};
const BUCKET_BADGE: Record<string, string> = {
  current:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  '31-60':  'bg-amber-50 text-amber-700 border-amber-200',
  '61-90':  'bg-orange-50 text-orange-700 border-orange-200',
  '90+':    'bg-red-50 text-red-700 border-red-200',
};

const BUCKET_ACCENTS: Record<string, string> = {
  current: STAT_ACCENTS.SUCCESS,
  '31-60': STAT_ACCENTS.WARNING,
  '61-90': 'hsl(25,92%,48%)',
  '90+':   STAT_ACCENTS.DANGER,
};

export function AgingReport() {
  const [reportType, setReportType] = useState<'AR' | 'AP'>('AR');
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));
  const [bucketFilter, setBucketFilter] = useState<string>('');
  const [entries, setEntries] = useState<AgingEntry[]>([]);
  const [summary, setSummary] = useState<AgingBucketSummary>({ current: 0, days31to60: 0, days61to90: 0, over90: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 25;

  // Detail panel for an aging entry
  const [detailEntry, setDetailEntry] = useState<AgingEntry | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await financeReportService.getAgingReport(reportType, asOf, page, LIMIT);
      let filtered = res.entries;
      if (bucketFilter) filtered = filtered.filter(e => e.bucket === bucketFilter);
      setEntries(filtered);
      setSummary(res.summary);
      setTotal(bucketFilter ? filtered.length : res.total);
      setTotalPages(bucketFilter ? Math.ceil(filtered.length / LIMIT) : res.totalPages);
    } catch {
      toast({ title: 'Error', description: 'Failed to load aging report', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [reportType, asOf, page, bucketFilter]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const BUCKET_FILTERS = [
    { label: 'All',        value: '', accent: PRIMARY },
    { label: 'Current',    value: 'current', accent: STAT_ACCENTS.SUCCESS },
    { label: '31–60 Days', value: '31-60',   accent: STAT_ACCENTS.WARNING },
    { label: '61–90 Days', value: '61-90',   accent: 'hsl(25,92%,48%)' },
    { label: 'Over 90',    value: '90+',     accent: STAT_ACCENTS.DANGER },
  ];

  return (
    <>
    <div className="space-y-3">
      {/* Stat cards — summary buckets */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label={reportType === 'AR' ? 'Total AR' : 'Total AP'} value={formatIndianCurrency(summary.total)}
            icon={Landmark} accent={PRIMARY} active={true} />
          <StatCard label="Current" value={formatIndianCurrency(summary.current)}
            icon={Clock} accent={STAT_ACCENTS.SUCCESS}
            active={bucketFilter === 'current'}
            onClick={() => { setBucketFilter(b => b === 'current' ? '' : 'current'); setPage(1); }} />
          <StatCard label="31–60 Days" value={formatIndianCurrency(summary.days31to60)}
            icon={AlertTriangle} accent={STAT_ACCENTS.WARNING}
            active={bucketFilter === '31-60'}
            onClick={() => { setBucketFilter(b => b === '31-60' ? '' : '31-60'); setPage(1); }} />
          <StatCard label="61–90 Days" value={formatIndianCurrency(summary.days61to90)}
            icon={AlertTriangle} accent="hsl(25,92%,48%)"
            active={bucketFilter === '61-90'}
            onClick={() => { setBucketFilter(b => b === '61-90' ? '' : '61-90'); setPage(1); }} />
          <StatCard label="Over 90" value={formatIndianCurrency(summary.over90)}
            icon={TrendingDown} accent={STAT_ACCENTS.DANGER}
            active={bucketFilter === '90+'}
            onClick={() => { setBucketFilter(b => b === '90+' ? '' : '90+'); setPage(1); }} />
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3" style={{ borderColor: BORDER }}>
        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-3 flex-wrap">
          <div className="flex gap-1.5">
            {(['AR', 'AP'] as const).map(t => (
              <button key={t}
                onClick={() => { setReportType(t); setPage(1); setBucketFilter(''); }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                style={{
                  background: reportType === t ? PRIMARY : 'transparent',
                  color: reportType === t ? '#fff' : TEXT_MUTE,
                  borderColor: reportType === t ? PRIMARY : BORDER,
                }}>{t === 'AR' ? 'Receivable' : 'Payable'}</button>
            ))}
          </div>
          <div className="w-px h-5 bg-border" />
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {BUCKET_FILTERS.map(f => (
                <button key={f.value}
                  onClick={() => { setBucketFilter(f.value); setPage(1); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: bucketFilter === f.value ? f.accent : 'transparent',
                    color: bucketFilter === f.value ? '#fff' : TEXT_MUTE,
                    borderColor: bucketFilter === f.value ? f.accent : BORDER,
                  }}>{f.label}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-xs" style={{ color: TEXT_MUTE }}>As of</span>
            <DatePicker
              date={toDate(asOf)}
              onDateChange={d => { setAsOf(fromDate(d)); setPage(1); }}
              placeholder="Pick date"
              className="h-8 text-xs w-40"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 flex-shrink-0" onClick={fetchReport} disabled={loading}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>
        {/* Mobile */}
        <div className="lg:hidden space-y-2">
          {/* Row 1: AR/AP toggle pills + Refresh icon */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 flex-1">
              {(['AR', 'AP'] as const).map(t => (
                <button key={t}
                  onClick={() => { setReportType(t); setPage(1); setBucketFilter(''); }}
                  className="flex-1 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={{
                    background: reportType === t ? PRIMARY : 'transparent',
                    color: reportType === t ? '#fff' : TEXT_MUTE,
                    borderColor: reportType === t ? PRIMARY : BORDER,
                  }}>{t === 'AR' ? 'Receivable' : 'Payable'}</button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 flex-shrink-0" onClick={fetchReport} disabled={loading}>
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
          {/* Row 2: As-of date — full width */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium flex-shrink-0" style={{ color: TEXT_MUTE }}>As of</span>
            <DatePicker
              date={toDate(asOf)}
              onDateChange={d => { setAsOf(fromDate(d)); setPage(1); }}
              placeholder="Select date"
              className="h-8 text-xs flex-1"
            />
          </div>
          {/* Row 3: Bucket pills */}
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {BUCKET_FILTERS.map(f => (
                <button key={f.value}
                  onClick={() => { setBucketFilter(f.value); setPage(1); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: bucketFilter === f.value ? f.accent : 'transparent',
                    color: bucketFilter === f.value ? '#fff' : TEXT_MUTE,
                    borderColor: bucketFilter === f.value ? f.accent : BORDER,
                  }}>{f.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading / Empty */}
      {loading && <div className="text-center py-12 text-sm" style={{ color: TEXT_MUTE }}>Loading…</div>}
      {!loading && entries.length === 0 && <div className="text-center py-12 text-sm" style={{ color: TEXT_MUTE }}>No outstanding items</div>}

      {!loading && entries.length > 0 && (
        <>
          {/* ── Mobile cards ─────────────────────────────── */}
          <div className="md:hidden space-y-2">
            {entries.map(e => (
              <Card key={e.id} className="shadow-sm cursor-pointer active:scale-[0.99] transition-all" style={{ borderColor: BORDER }}
                onClick={() => { setDetailEntry(e); setAttachments([]); }}>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: TEXT_MAIN }}>{e.entityName}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="font-mono text-[11px]" style={{ color: PRIMARY }}>{e.invoiceNumber}</span>
                        <span className="text-[11px]" style={{ color: TEXT_MUTE }}>Due {e.dueDate}</span>
                      </div>
                    </div>
                    <Badge className={`${BUCKET_BADGE[e.bucket] || ''} border text-[10px] pointer-events-none flex-shrink-0`}>
                      {e.bucket === 'current' ? 'Current' : e.bucket}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: BORDER }}>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-semibold mb-0.5" style={{ color: TEXT_MUTE }}>Outstanding</p>
                      <p className="font-mono font-bold text-sm" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(e.outstandingAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide font-semibold mb-0.5" style={{ color: TEXT_MUTE }}>Age</p>
                      <span className={`text-sm font-bold ${BUCKET_TEXT[e.bucket] || ''}`}>
                        {e.daysOverdue <= 0 ? `${Math.abs(e.daysOverdue)}d left` : `+${e.daysOverdue}d`}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {/* Mobile page total */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-semibold" style={{ borderColor: BORDER, background: 'hsl(220,16%,97%)' }}>
              <span style={{ color: TEXT_MUTE }}>Page Total</span>
              <span className="font-mono font-bold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(entries.reduce((s, e) => s + e.outstandingAmount, 0))}</span>
            </div>
          </div>

          {/* ── Desktop table ─────────────────────────────── */}
          <Card className="border-0 shadow-sm overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full dense-table text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}`, background: 'hsl(220,16%,97%)' }}>
                    {[reportType === 'AR' ? 'Customer' : 'Vendor', 'Invoice #', 'Invoice Date', 'Due Date', 'Original', 'Outstanding', 'Days', 'Bucket'].map(h => (
                      <th key={h} className={`px-3 py-2 font-semibold text-xs uppercase tracking-wide ${['Original','Outstanding'].includes(h) ? 'text-right' : ['Days','Bucket'].includes(h) ? 'text-center' : 'text-left'}`} style={{ color: TEXT_MUTE }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={e.id}
                      style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? '#fff' : 'hsl(220,16%,99%)' }}
                      className="hover:bg-primary/5 transition-colors cursor-pointer"
                      onClick={() => { setDetailEntry(e); setAttachments([]); }}>
                      <td className="px-3 py-2.5 font-medium" style={{ color: TEXT_MAIN }}>{e.entityName}</td>
                      <td className="px-3 py-2.5 font-mono text-xs" style={{ color: PRIMARY }}>{e.invoiceNumber}</td>
                      <td className="px-3 py-2.5 text-xs" style={{ color: TEXT_MUTE }}>{e.invoiceDate}</td>
                      <td className="px-3 py-2.5 text-xs" style={{ color: TEXT_MUTE }}>{e.dueDate}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs" style={{ color: TEXT_MUTE }}>{formatIndianCurrency(e.originalAmount)}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold text-sm" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(e.outstandingAmount)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`text-xs font-bold ${BUCKET_TEXT[e.bucket] || ''}`}>
                          {e.daysOverdue <= 0 ? `${Math.abs(e.daysOverdue)}d left` : `+${e.daysOverdue}d`}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge className={`${BUCKET_BADGE[e.bucket] || ''} border text-[10px] pointer-events-none`}>
                          {e.bucket === 'current' ? 'Current' : e.bucket}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: `2px solid ${BORDER}`, background: 'hsl(220,16%,97%)' }}>
                    <td colSpan={4} className="px-3 py-2.5 font-semibold text-sm" style={{ color: TEXT_MAIN }}>Page Total</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-sm" style={{ color: TEXT_MUTE }}>{formatIndianCurrency(entries.reduce((s, e) => s + e.originalAmount, 0))}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-sm" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(entries.reduce((s, e) => s + e.outstandingAmount, 0))}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border rounded-xl bg-card flex items-center justify-between" style={{ borderColor: BORDER }}>
              <p className="text-xs" style={{ color: TEXT_MUTE }}>Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem><PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} /></PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const n = Math.max(1, page - 2) + i;
                    if (n > totalPages) return null;
                    return <PaginationItem key={n}><PaginationLink isActive={n === page} onClick={() => setPage(n)} className="cursor-pointer">{n}</PaginationLink></PaginationItem>;
                  })}
                  <PaginationItem><PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} /></PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

    </div>
      {/* Detail panel — outside space-y-3 */}
      {detailEntry && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="flex-1 bg-black/50" onClick={() => setDetailEntry(null)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col" style={{ borderLeft: `1px solid ${BORDER}` }}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b flex-shrink-0" style={{ borderColor: BORDER }}>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{detailEntry.invoiceNumber}</h2>
                <p className="text-xs mt-0.5" style={{ color: TEXT_MUTE }}>{detailEntry.entityName} · Due {detailEntry.dueDate}</p>
              </div>
              <button onClick={() => setDetailEntry(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={15} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Original Amount', value: formatIndianCurrency(detailEntry.originalAmount) },
                  { label: 'Outstanding', value: formatIndianCurrency(detailEntry.outstandingAmount) },
                  { label: 'Invoice Date', value: detailEntry.invoiceDate },
                  { label: 'Due Date', value: detailEntry.dueDate },
                ].map(f => (
                  <div key={f.label} className="rounded-lg border p-3" style={{ borderColor: BORDER }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: TEXT_MUTE }}>{f.label}</p>
                    <p className="text-sm font-bold" style={{ color: TEXT_MAIN }}>{f.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border p-3" style={{ borderColor: BORDER }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: TEXT_MUTE }}>Aging</p>
                <div className="flex items-center gap-2">
                  <Badge className={`${BUCKET_BADGE[detailEntry.bucket] || ''} border`}>
                    {detailEntry.bucket === 'current' ? 'Current' : detailEntry.bucket}
                  </Badge>
                  <span className={`text-sm font-bold ${BUCKET_TEXT[detailEntry.bucket] || ''}`}>
                    {detailEntry.daysOverdue <= 0 ? `${Math.abs(detailEntry.daysOverdue)} days remaining` : `${detailEntry.daysOverdue} days overdue`}
                  </span>
                </div>
              </div>
              <div className="pt-1 border-t" style={{ borderColor: BORDER }}>
                <AttachmentSection attachments={attachments} onChange={setAttachments} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
