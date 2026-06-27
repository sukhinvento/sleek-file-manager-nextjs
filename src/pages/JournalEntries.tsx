import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatIndianCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  Search, X, Trash2, CheckCircle2, RotateCcw, ChevronDown, Plus,
  BookMarked, Clock, ArrowRightLeft,
} from 'lucide-react';
import * as journalService from '@/services/journalService';
import * as accountService from '@/services/accountService';
import { JournalEntry, JournalEntryStatus, JournalLine } from '@/types/finance';
import { DatePicker } from '@/components/ui/date-picker';

const toDate = (s: string): Date | undefined => s ? new Date(s + 'T00:00:00') : undefined;
const fromDate = (d: Date | undefined): string => d ? d.toISOString().split('T')[0] : '';
import { AttachmentSection, Attachment } from '@/components/finance/AttachmentSection';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';
const PRIMARY   = STAT_ACCENTS.PRIMARY;

const STATUS_STYLE: Record<JournalEntryStatus, string> = {
  [JournalEntryStatus.DRAFT]:    'bg-amber-50 text-amber-700 border-amber-200',
  [JournalEntryStatus.POSTED]:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  [JournalEntryStatus.REVERSED]: 'bg-gray-100 text-gray-600 border-gray-200',
};

const EMPTY_LINE: JournalLine = { accountId: '', accountCode: '', accountName: '', description: '', debit: 0, credit: 0 };

const STATUS_FILTERS = [
  { label: 'All',      value: '' as const },
  { label: 'Draft',    value: JournalEntryStatus.DRAFT },
  { label: 'Posted',   value: JournalEntryStatus.POSTED },
  { label: 'Reversed', value: JournalEntryStatus.REVERSED },
];

export function JournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JournalEntryStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 25;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailEntry, setDetailEntry] = useState<JournalEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [accountOptions, setAccountOptions] = useState<Array<{ value: string; label: string; code: string }>>([]);
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDesc, setFormDesc] = useState('');
  const [formRef, setFormRef] = useState('');
  const [formLines, setFormLines] = useState<JournalLine[]>([{ ...EMPTY_LINE }, { ...EMPTY_LINE }]);

  const totalDr = formLines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCr = formLines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = Math.abs(totalDr - totalCr) < 0.01 && totalDr > 0;

  const statusCounts = entries.reduce((acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await journalService.listEntries({ page, limit: LIMIT, search, status: statusFilter });
      setEntries(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast({ title: 'Error', description: 'Failed to load journal entries', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);
  useEffect(() => { accountService.getAccountOptions().then(setAccountOptions).catch(() => {}); }, []);

  // Listen for header "New Entry" button
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail?.type === 'journal-entry') openCreate();
    };
    window.addEventListener('openCreateModal', handler);
    return () => window.removeEventListener('openCreateModal', handler);
  }, []);

  function openCreate() {
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormDesc(''); setFormRef('');
    setFormLines([{ ...EMPTY_LINE }, { ...EMPTY_LINE }]);
    setAttachments([]);
    setDetailEntry(null);
    setDrawerOpen(true);
  }
  function closeDrawer() { setDrawerOpen(false); setDetailEntry(null); setAttachments([]); }

  function setLine(idx: number, patch: Partial<JournalLine>) {
    setFormLines(prev => prev.map((l, i) => i === idx ? { ...l, ...patch } : l));
  }
  function pickAccount(idx: number, value: string) {
    const opt = accountOptions.find(o => o.value === value);
    if (opt) setLine(idx, { accountId: opt.value, accountCode: opt.code, accountName: opt.label });
  }
  function addLine() { setFormLines(prev => [...prev, { ...EMPTY_LINE }]); }
  function removeLine(idx: number) { setFormLines(prev => prev.filter((_, i) => i !== idx)); }

  async function handleSave(saveStatus: JournalEntryStatus) {
    if (!formDesc.trim()) { toast({ title: 'Required', description: 'Description is required', variant: 'destructive' }); return; }
    if (!balanced && saveStatus === JournalEntryStatus.POSTED) {
      toast({ title: 'Unbalanced', description: 'Debits must equal credits to post', variant: 'destructive' }); return;
    }
    setSaving(true);
    try {
      const newEntry = await journalService.createEntry({
        date: formDate, description: formDesc, reference: formRef,
        status: saveStatus, lines: formLines.filter(l => l.accountId),
      });
      setEntries(prev => [newEntry, ...prev]);
      toast({ title: saveStatus === JournalEntryStatus.POSTED ? 'Posted' : 'Saved as Draft', description: newEntry.entryNumber });
      closeDrawer();
    } catch {
      toast({ title: 'Error', description: 'Failed to save journal entry', variant: 'destructive' });
    } finally { setSaving(false); }
  }

  async function handlePost(entry: JournalEntry) {
    try {
      const updated = await journalService.postEntry(entry.id);
      setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
      toast({ title: 'Posted', description: `${entry.entryNumber} posted to ledger` });
    } catch { toast({ title: 'Error', description: 'Failed to post entry', variant: 'destructive' }); }
  }

  async function handleReverse(entry: JournalEntry) {
    if (!confirm(`Reverse ${entry.entryNumber}?`)) return;
    try {
      const updated = await journalService.reverseEntry(entry.id);
      setEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
      toast({ title: 'Reversed', description: `${entry.entryNumber} reversed` });
    } catch { toast({ title: 'Error', description: 'Failed to reverse entry', variant: 'destructive' }); }
  }

  async function handleDelete(entry: JournalEntry) {
    if (entry.status !== JournalEntryStatus.DRAFT) { toast({ title: 'Cannot delete', description: 'Only draft entries can be deleted', variant: 'destructive' }); return; }
    if (!confirm(`Delete ${entry.entryNumber}?`)) return;
    try {
      await journalService.deleteEntry(entry.id);
      setEntries(prev => prev.filter(e => e.id !== entry.id));
      toast({ title: 'Deleted' });
    } catch { toast({ title: 'Error', description: 'Failed to delete entry', variant: 'destructive' }); }
  }

  return (
    <>
    <div className="space-y-3">
      {/* Stat cards */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="All" value={total} icon={BookMarked} accent={STAT_ACCENTS.PRIMARY}
            active={statusFilter === ''} onClick={() => { setStatusFilter(''); setPage(1); }} />
          <StatCard label="Draft" value={statusCounts[JournalEntryStatus.DRAFT] || 0} icon={Clock} accent={STAT_ACCENTS.WARNING}
            active={statusFilter === JournalEntryStatus.DRAFT}
            onClick={() => { setStatusFilter(statusFilter === JournalEntryStatus.DRAFT ? '' : JournalEntryStatus.DRAFT); setPage(1); }} />
          <StatCard label="Posted" value={statusCounts[JournalEntryStatus.POSTED] || 0} icon={CheckCircle2} accent={STAT_ACCENTS.SUCCESS}
            active={statusFilter === JournalEntryStatus.POSTED}
            onClick={() => { setStatusFilter(statusFilter === JournalEntryStatus.POSTED ? '' : JournalEntryStatus.POSTED); setPage(1); }} />
          <StatCard label="Reversed" value={statusCounts[JournalEntryStatus.REVERSED] || 0} icon={RotateCcw} accent={STAT_ACCENTS.DANGER}
            active={statusFilter === JournalEntryStatus.REVERSED}
            onClick={() => { setStatusFilter(statusFilter === JournalEntryStatus.REVERSED ? '' : JournalEntryStatus.REVERSED); setPage(1); }} />
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3" style={{ borderColor: BORDER }}>
        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {STATUS_FILTERS.map(f => (
                <button key={f.value}
                  onClick={() => { setStatusFilter(f.value); setPage(1); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: statusFilter === f.value ? PRIMARY : 'transparent',
                    color: statusFilter === f.value ? '#fff' : TEXT_MUTE,
                    borderColor: statusFilter === f.value ? PRIMARY : BORDER,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-52 flex-shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input type="search" placeholder="Search entry or description…"
              className="pl-8 h-8 text-xs"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
        {/* Mobile */}
        <div className="lg:hidden space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input type="search" placeholder="Search entry or description…"
              className="pl-8 h-8 text-xs"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {STATUS_FILTERS.map(f => (
                <button key={f.value}
                  onClick={() => { setStatusFilter(f.value); setPage(1); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: statusFilter === f.value ? PRIMARY : 'transparent',
                    color: statusFilter === f.value ? '#fff' : TEXT_MUTE,
                    borderColor: statusFilter === f.value ? PRIMARY : BORDER,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading / Empty */}
      {loading && <div className="text-center py-12 text-sm" style={{ color: TEXT_MUTE }}>Loading…</div>}
      {!loading && entries.length === 0 && <div className="text-center py-12 text-sm" style={{ color: TEXT_MUTE }}>No entries found</div>}

      {!loading && entries.length > 0 && (
        <>
          {/* ── Mobile cards ─────────────────────────────── */}
          <div className="md:hidden space-y-2">
            {entries.map(e => (
              <Card key={e.id} className="shadow-sm cursor-pointer active:scale-[0.99] transition-all" style={{ borderColor: BORDER }}
                onClick={() => { setDetailEntry(e); setDrawerOpen(false); }}>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-mono text-xs font-semibold" style={{ color: PRIMARY }}>{e.entryNumber}</span>
                        <span className="text-[11px]" style={{ color: TEXT_MUTE }}>{e.date}</span>
                        <Badge className={`${STATUS_STYLE[e.status]} border text-[10px] pointer-events-none`}>{e.status}</Badge>
                      </div>
                      <p className="text-sm font-medium line-clamp-2" style={{ color: TEXT_MAIN }}>{e.description}</p>
                      {e.reference && <p className="text-xs font-mono mt-0.5" style={{ color: TEXT_MUTE }}>Ref: {e.reference}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: BORDER }}>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-semibold mb-0.5" style={{ color: TEXT_MUTE }}>Debit</p>
                      <p className="font-mono font-semibold text-xs" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(e.totalDebit)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide font-semibold mb-0.5" style={{ color: TEXT_MUTE }}>Credit</p>
                      <p className="font-mono font-semibold text-xs" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(e.totalCredit)}</p>
                    </div>
                  </div>
                  {(e.status === JournalEntryStatus.DRAFT || e.status === JournalEntryStatus.POSTED) && (
                    <div className="flex gap-1 pt-2 mt-2 border-t justify-end" style={{ borderColor: BORDER }}
                      onClick={ev => ev.stopPropagation()}>
                      {e.status === JournalEntryStatus.DRAFT && (
                        <button className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-emerald-50 transition-colors" onClick={() => handlePost(e)}>
                          <CheckCircle2 size={12} style={{ color: STAT_ACCENTS.SUCCESS }} /> Post
                        </button>
                      )}
                      {e.status === JournalEntryStatus.POSTED && (
                        <button className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-gray-100 transition-colors" onClick={() => handleReverse(e)}>
                          <RotateCcw size={12} style={{ color: TEXT_MUTE }} /> Reverse
                        </button>
                      )}
                      {e.status === JournalEntryStatus.DRAFT && (
                        <button className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-red-50 transition-colors" onClick={() => handleDelete(e)}>
                          <Trash2 size={12} style={{ color: STAT_ACCENTS.DANGER }} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* ── Desktop table ─────────────────────────────── */}
          <Card className="border-0 shadow-sm overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full dense-table text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}`, background: 'hsl(220,16%,97%)' }}>
                    {['Entry #', 'Date', 'Description', 'Reference', 'Lines', 'Total Dr', 'Total Cr', 'Status', 'Actions'].map(h => (
                      <th key={h} className={`px-3 py-2 font-semibold text-xs uppercase tracking-wide ${['Total Dr','Total Cr'].includes(h) ? 'text-right' : ['Lines','Status','Actions'].includes(h) ? 'text-center' : 'text-left'}`} style={{ color: TEXT_MUTE }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={e.id}
                      style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? '#fff' : 'hsl(220,16%,99%)' }}
                      className="hover:bg-primary/5 transition-colors cursor-pointer"
                      onClick={() => { setDetailEntry(e); setDrawerOpen(false); }}>
                      <td className="px-3 py-2.5 font-mono font-medium text-xs" style={{ color: PRIMARY }}>{e.entryNumber}</td>
                      <td className="px-3 py-2.5 text-xs" style={{ color: TEXT_MUTE }}>{e.date}</td>
                      <td className="px-3 py-2.5 font-medium max-w-[200px] truncate" style={{ color: TEXT_MAIN }}>{e.description}</td>
                      <td className="px-3 py-2.5 text-xs font-mono" style={{ color: TEXT_MUTE }}>{e.reference || '—'}</td>
                      <td className="px-3 py-2.5 text-center text-xs" style={{ color: TEXT_MUTE }}>{e.lines.length}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs font-semibold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(e.totalDebit)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs font-semibold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(e.totalCredit)}</td>
                      <td className="px-3 py-2.5 text-center" onClick={ev => ev.stopPropagation()}>
                        <Badge className={`${STATUS_STYLE[e.status]} border text-[10px] pointer-events-none`}>{e.status}</Badge>
                      </td>
                      <td className="px-3 py-2.5" onClick={ev => ev.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {e.status === JournalEntryStatus.DRAFT && (
                            <button className="p-1 rounded hover:bg-emerald-50 transition-colors" onClick={() => handlePost(e)} title="Post">
                              <CheckCircle2 size={13} style={{ color: STAT_ACCENTS.SUCCESS }} />
                            </button>
                          )}
                          {e.status === JournalEntryStatus.POSTED && (
                            <button className="p-1 rounded hover:bg-gray-100 transition-colors" onClick={() => handleReverse(e)} title="Reverse">
                              <RotateCcw size={13} style={{ color: TEXT_MUTE }} />
                            </button>
                          )}
                          {e.status === JournalEntryStatus.DRAFT && (
                            <button className="p-1 rounded hover:bg-red-50 transition-colors" onClick={() => handleDelete(e)} title="Delete">
                              <Trash2 size={13} style={{ color: STAT_ACCENTS.DANGER }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
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
      {/* Entry detail panel — outside space-y-3 */}
      {detailEntry && !drawerOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="flex-1 bg-black/50" onClick={() => setDetailEntry(null)} />
          <div className="w-full max-w-lg bg-background shadow-2xl flex flex-col border-l border-border">
            <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookMarked className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-foreground leading-tight">{detailEntry.entryNumber}</h1>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-1">{detailEntry.date} · {detailEntry.description}</p>
                </div>
                <button onClick={() => setDetailEntry(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0 text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
              <div className="flex gap-2 flex-wrap">
                <Badge className={`${STATUS_STYLE[detailEntry.status]} border`}>{detailEntry.status}</Badge>
                {detailEntry.reference && <span className="text-xs font-mono px-2 py-1 rounded bg-gray-50 border" style={{ borderColor: BORDER, color: TEXT_MUTE }}>Ref: {detailEntry.reference}</span>}
              </div>
              <table className="w-full text-xs border rounded-lg overflow-hidden" style={{ borderColor: BORDER }}>
                <thead>
                  <tr style={{ background: 'hsl(220,16%,97%)', borderBottom: `1px solid ${BORDER}` }}>
                    <th className="text-left px-3 py-2 font-semibold" style={{ color: TEXT_MUTE }}>Account</th>
                    <th className="text-right px-3 py-2 font-semibold" style={{ color: TEXT_MUTE }}>Debit</th>
                    <th className="text-right px-3 py-2 font-semibold" style={{ color: TEXT_MUTE }}>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {detailEntry.lines.map((l, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td className="px-3 py-2">
                        <span className="font-mono text-[10px] mr-1.5" style={{ color: TEXT_MUTE }}>{l.accountCode}</span>
                        <span style={{ color: TEXT_MAIN }}>{l.accountName}</span>
                        {l.description && <span className="ml-1.5 text-[10px]" style={{ color: TEXT_MUTE }}>· {l.description}</span>}
                      </td>
                      <td className="px-3 py-2 text-right font-mono" style={{ color: l.debit > 0 ? TEXT_MAIN : TEXT_MUTE }}>{l.debit > 0 ? formatIndianCurrency(l.debit) : '—'}</td>
                      <td className="px-3 py-2 text-right font-mono" style={{ color: l.credit > 0 ? TEXT_MAIN : TEXT_MUTE }}>{l.credit > 0 ? formatIndianCurrency(l.credit) : '—'}</td>
                    </tr>
                  ))}
                  <tr style={{ background: 'hsl(220,16%,97%)', borderTop: `2px solid ${BORDER}` }}>
                    <td className="px-3 py-2 font-semibold" style={{ color: TEXT_MAIN }}>Total</td>
                    <td className="px-3 py-2 text-right font-mono font-bold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(detailEntry.totalDebit)}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(detailEntry.totalCredit)}</td>
                  </tr>
                </tbody>
              </table>
              {detailEntry.postedBy && <p className="text-xs" style={{ color: TEXT_MUTE }}>Posted by <strong>{detailEntry.postedBy}</strong></p>}
            </div>
          </div>
        </div>
      )}

      {/* Create entry drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="flex-1 bg-black/50" onClick={closeDrawer} />
          <div className="w-full max-w-xl bg-background shadow-2xl flex flex-col border-l border-border">
            <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookMarked className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-foreground leading-tight">New Journal Entry</h1>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">Record a new accounting journal entry</p>
                </div>
                <button onClick={closeDrawer} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0 text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Date *</label>
                  <DatePicker
                    date={toDate(formDate)}
                    onDateChange={d => setFormDate(fromDate(d))}
                    placeholder="Entry date"
                    className="h-9 w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Reference</label>
                  <Input className="h-9 text-sm" placeholder="INV-001, PO-002…" value={formRef} onChange={e => setFormRef(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Description *</label>
                <Input className="h-9 text-sm" placeholder="Brief description…" value={formDesc} onChange={e => setFormDesc(e.target.value)} />
              </div>

              {/* Lines table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium" style={{ color: TEXT_MUTE }}>Journal Lines</label>
                  <button className="text-xs flex items-center gap-1 hover:underline" style={{ color: PRIMARY }} onClick={addLine}>
                    <Plus size={12} /> Add Line
                  </button>
                </div>
                <div className="border rounded-lg overflow-hidden" style={{ borderColor: BORDER }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: 'hsl(220,16%,97%)', borderBottom: `1px solid ${BORDER}` }}>
                        <th className="text-left px-2 py-2 font-semibold" style={{ color: TEXT_MUTE }}>Account</th>
                        <th className="text-left px-2 py-2 font-semibold hidden sm:table-cell" style={{ color: TEXT_MUTE }}>Notes</th>
                        <th className="text-right px-2 py-2 font-semibold" style={{ color: TEXT_MUTE }}>Debit</th>
                        <th className="text-right px-2 py-2 font-semibold" style={{ color: TEXT_MUTE }}>Credit</th>
                        <th className="w-6" />
                      </tr>
                    </thead>
                    <tbody>
                      {formLines.map((l, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                          <td className="px-1 py-1">
                            <Select value={l.accountId || ''} onValueChange={v => pickAccount(i, v)}>
                              <SelectTrigger className="h-7 text-xs w-full px-2">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                              <SelectContent>
                                {accountOptions.map(o => (
                                  <SelectItem key={o.value} value={o.value} className="text-xs">
                                    {o.code} — {o.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-1 py-1 hidden sm:table-cell">
                            <Input className="h-7 text-xs" placeholder="Notes…" value={l.description}
                              onChange={e => setLine(i, { description: e.target.value })} />
                          </td>
                          <td className="px-1 py-1">
                            <Input type="number" className="h-7 text-xs text-right" placeholder="0"
                              value={l.debit || ''} onChange={e => setLine(i, { debit: parseFloat(e.target.value) || 0, credit: 0 })} />
                          </td>
                          <td className="px-1 py-1">
                            <Input type="number" className="h-7 text-xs text-right" placeholder="0"
                              value={l.credit || ''} onChange={e => setLine(i, { credit: parseFloat(e.target.value) || 0, debit: 0 })} />
                          </td>
                          <td className="px-1 py-1 text-center">
                            {formLines.length > 2 && (
                              <button onClick={() => removeLine(i)} className="p-0.5 rounded hover:bg-red-50">
                                <X size={11} style={{ color: STAT_ACCENTS.DANGER }} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: 'hsl(220,16%,97%)', borderTop: `2px solid ${BORDER}` }}>
                        <td colSpan={2} className="px-2 py-2 font-semibold text-xs" style={{ color: TEXT_MAIN }}>Total</td>
                        <td className="px-2 py-2 text-right font-mono font-bold text-xs" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(totalDr)}</td>
                        <td className="px-2 py-2 text-right font-mono font-bold text-xs" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(totalCr)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {totalDr > 0 && !balanced && (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: STAT_ACCENTS.DANGER }}>
                    <ArrowRightLeft size={12} /> Difference: {formatIndianCurrency(Math.abs(totalDr - totalCr))}
                  </p>
                )}
                {balanced && (
                  <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: STAT_ACCENTS.SUCCESS }}>
                    <CheckCircle2 size={12} /> Entry is balanced
                  </p>
                )}
              </div>

              {/* Attachments */}
              <div className="pt-1 border-t" style={{ borderColor: BORDER }}>
                <AttachmentSection attachments={attachments} onChange={setAttachments} />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t flex gap-2 justify-end flex-shrink-0" style={{ borderColor: BORDER }}>
              <Button variant="outline" size="sm" onClick={closeDrawer}>Cancel</Button>
              <Button variant="outline" size="sm" onClick={() => handleSave(JournalEntryStatus.DRAFT)} disabled={saving}>Save Draft</Button>
              <Button size="sm" onClick={() => handleSave(JournalEntryStatus.POSTED)} disabled={saving || !balanced}>
                {saving ? 'Posting…' : 'Post Entry'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
