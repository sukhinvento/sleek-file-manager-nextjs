import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { formatIndianCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, Building2, DollarSign, TrendingDown, Package,
  Edit, X, ChevronDown, Play, Calendar,
} from 'lucide-react';
import * as fixedAssetService from '@/services/fixedAssetService';
import { FixedAsset, DepreciationScheduleEntry } from '@/types/finance';
import { AttachmentSection, Attachment } from '@/components/finance/AttachmentSection';
import { DatePicker } from '@/components/ui/date-picker';

const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';
const PRIMARY   = STAT_ACCENTS.PRIMARY;

const CATEGORY_FILTERS = ['All', 'Medical Equipment', 'Building', 'Vehicle', 'Furniture', 'IT Equipment'];
const STATUS_FILTERS = ['All', 'Active', 'Disposed'];

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Disposed: 'bg-gray-100 text-gray-700 border-gray-200',
};

const EMPTY_FORM: Partial<FixedAsset> = {
  assetCode: '', assetName: '', category: 'Medical Equipment', purchaseDate: '',
  purchaseCost: 0, usefulLifeYears: 10, depreciationMethod: 'Straight-Line',
  salvageValue: 0, status: 'Active', linkedAccountId: '', depreciationAccountId: '',
};

export function FixedAssets() {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 25;

  // Detail panel
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null);
  const [schedule, setSchedule] = useState<DepreciationScheduleEntry[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);
  const [form, setForm] = useState<Partial<FixedAsset>>(EMPTY_FORM);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fixedAssetService.listAssets({
        page, limit: LIMIT, search,
        category: categoryFilter === 'All' ? '' : categoryFilter,
        status: statusFilter === 'All' ? '' : statusFilter,
      });
      setAssets(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast({ title: 'Error', description: 'Failed to load assets', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  // Listen for header "Add Asset" button
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === 'fixed-asset') openCreate();
    };
    window.addEventListener('openCreateModal', handler);
    return () => window.removeEventListener('openCreateModal', handler);
  }, []);

  const totalCost = assets.reduce((s, a) => s + a.purchaseCost, 0);
  const totalDep = assets.reduce((s, a) => s + a.accumulatedDepreciation, 0);
  const totalNBV = assets.reduce((s, a) => s + a.netBookValue, 0);

  function openCreate() {
    setEditingAsset(null);
    setForm(EMPTY_FORM);
    setAttachments([]);
    setDrawerOpen(true);
  }

  function openEdit(asset: FixedAsset) {
    setEditingAsset(asset);
    setForm({ ...asset });
    setAttachments([]);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingAsset(null);
    setForm(EMPTY_FORM);
    setAttachments([]);
  }

  async function handleSave() {
    if (!form.assetCode?.trim() || !form.assetName?.trim()) {
      toast({ title: 'Required', description: 'Asset code and name are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingAsset) {
        const updated = await fixedAssetService.updateAsset(editingAsset.id, form);
        setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
        toast({ title: 'Updated', description: `${updated.assetName} saved` });
      } else {
        const created = await fixedAssetService.createAsset(form);
        setAssets(prev => [created, ...prev]);
        toast({ title: 'Created', description: `${created.assetName} added` });
      }
      closeDrawer();
    } catch {
      toast({ title: 'Error', description: 'Failed to save asset', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function openDetail(asset: FixedAsset) {
    setSelectedAsset(asset);
    setScheduleLoading(true);
    try {
      const data = await fixedAssetService.getDepreciationSchedule(asset.id);
      setSchedule(data);
    } catch {
      setSchedule([]);
    } finally {
      setScheduleLoading(false);
    }
  }

  function closeDetail() {
    setSelectedAsset(null);
    setSchedule([]);
  }

  async function handleRunDepreciation() {
    try {
      await fixedAssetService.runDepreciation();
      toast({ title: 'Success', description: 'Depreciation run completed' });
      fetchAssets();
    } catch {
      toast({ title: 'Error', description: 'Failed to run depreciation', variant: 'destructive' });
    }
  }

  return (
    <>
    <div className="space-y-3">
      {/* Stat cards */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Total Assets" value={total} icon={Building2} accent={STAT_ACCENTS.PRIMARY} active={true} />
          <StatCard label="Total Cost" value={formatIndianCurrency(totalCost)} icon={DollarSign} accent={STAT_ACCENTS.CYAN} />
          <StatCard label="Depreciation" value={formatIndianCurrency(totalDep)} icon={TrendingDown} accent={STAT_ACCENTS.DANGER} />
          <StatCard label="Net Book Value" value={formatIndianCurrency(totalNBV)} icon={Package} accent={STAT_ACCENTS.SUCCESS} active={true} />
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3 overflow-hidden" style={{ borderColor: BORDER }}>
        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {CATEGORY_FILTERS.map(f => (
                <button key={f}
                  onClick={() => { setCategoryFilter(f); setPage(1); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: categoryFilter === f ? PRIMARY : 'transparent',
                    color: categoryFilter === f ? '#fff' : TEXT_MUTE,
                    borderColor: categoryFilter === f ? PRIMARY : BORDER,
                  }}>
                  {f}
                </button>
              ))}
              <div className="w-px h-5 mx-1" style={{ background: BORDER, alignSelf: 'center' }} />
              {STATUS_FILTERS.map(f => (
                <button key={`s-${f}`}
                  onClick={() => { setStatusFilter(f); setPage(1); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: statusFilter === f ? STAT_ACCENTS.SUCCESS : 'transparent',
                    color: statusFilter === f ? '#fff' : TEXT_MUTE,
                    borderColor: statusFilter === f ? STAT_ACCENTS.SUCCESS : BORDER,
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-48 flex-shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input type="search" placeholder="Search assets..."
              className="pl-8 h-8 text-xs"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Button size="sm" variant="outline" className="h-8 text-xs flex-shrink-0" onClick={handleRunDepreciation}>
            <Play size={12} className="mr-1" /> Run Depreciation
          </Button>
        </div>
        {/* Mobile */}
        <div className="lg:hidden space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input type="search" placeholder="Search assets..."
                className="pl-8 h-8 text-xs"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs flex-shrink-0 px-2" onClick={handleRunDepreciation}>
              <Play size={12} className="mr-1" /> Depreciate
            </Button>
          </div>
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {CATEGORY_FILTERS.map(f => (
                <button key={f}
                  onClick={() => { setCategoryFilter(f); setPage(1); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: categoryFilter === f ? PRIMARY : 'transparent',
                    color: categoryFilter === f ? '#fff' : TEXT_MUTE,
                    borderColor: categoryFilter === f ? PRIMARY : BORDER,
                  }}>
                  {f}
                </button>
              ))}
              <div className="w-px h-5 mx-1" style={{ background: BORDER, alignSelf: 'center' }} />
              {STATUS_FILTERS.map(f => (
                <button key={`s-${f}`}
                  onClick={() => { setStatusFilter(f); setPage(1); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: statusFilter === f ? STAT_ACCENTS.SUCCESS : 'transparent',
                    color: statusFilter === f ? '#fff' : TEXT_MUTE,
                    borderColor: statusFilter === f ? STAT_ACCENTS.SUCCESS : BORDER,
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading / Empty */}
      {loading && <div className="text-center py-12 text-sm" style={{ color: TEXT_MUTE }}>Loading...</div>}
      {!loading && assets.length === 0 && <div className="text-center py-12 text-sm" style={{ color: TEXT_MUTE }}>No assets found</div>}

      {!loading && assets.length > 0 && (
        <>
          {/* ── Mobile cards ─────────────────────────────── */}
          <div className="md:hidden space-y-2">
            {assets.map(a => (
              <Card key={a.id} className="shadow-sm cursor-pointer active:scale-[0.99] transition-all" style={{ borderColor: BORDER }}
                onClick={() => openDetail(a)}>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-mono text-[11px] font-semibold" style={{ color: TEXT_MUTE }}>{a.assetCode}</span>
                        <Badge className={`${STATUS_STYLES[a.status] || 'bg-gray-100 text-gray-700'} border text-[10px] pointer-events-none`}>{a.status}</Badge>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{a.assetName}</p>
                      <p className="text-xs mt-0.5" style={{ color: TEXT_MUTE }}>{a.category} · {a.purchaseDate}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: TEXT_MUTE }}>NBV</p>
                      <p className="font-mono font-bold text-sm" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(a.netBookValue)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: BORDER }}>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide font-semibold mb-0.5" style={{ color: TEXT_MUTE }}>Cost</p>
                      <p className="font-mono text-xs" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(a.purchaseCost)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide font-semibold mb-0.5" style={{ color: TEXT_MUTE }}>Accum. Dep.</p>
                      <p className="font-mono text-xs" style={{ color: STAT_ACCENTS.DANGER }}>{formatIndianCurrency(a.accumulatedDepreciation)}</p>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2 mt-1 border-t" style={{ borderColor: BORDER }}
                    onClick={ev => ev.stopPropagation()}>
                    <button className="p-1.5 rounded hover:bg-primary/10 transition-colors"
                      onClick={() => openEdit(a)} title="Edit">
                      <Edit size={14} style={{ color: PRIMARY }} />
                    </button>
                  </div>
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
                    <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Code</th>
                    <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Asset Name</th>
                    <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Category</th>
                    <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell" style={{ color: TEXT_MUTE }}>Purchase Date</th>
                    <th className="text-right px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Cost</th>
                    <th className="text-right px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Accum. Dep.</th>
                    <th className="text-right px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>NBV</th>
                    <th className="text-center px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Status</th>
                    <th className="text-center px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a, i) => (
                    <tr key={a.id}
                      className="hover:bg-primary/5 transition-colors cursor-pointer"
                      style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? '#fff' : 'hsl(220,16%,99%)' }}
                      onClick={() => openDetail(a)}>
                      <td className="px-3 py-2.5 font-mono font-medium text-xs" style={{ color: TEXT_MAIN }}>{a.assetCode}</td>
                      <td className="px-3 py-2.5 font-medium" style={{ color: TEXT_MAIN }}>{a.assetName}</td>
                      <td className="px-3 py-2.5 text-xs" style={{ color: TEXT_MUTE }}>{a.category}</td>
                      <td className="px-3 py-2.5 text-xs hidden lg:table-cell" style={{ color: TEXT_MUTE }}>{a.purchaseDate}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(a.purchaseCost)}</td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs" style={{ color: STAT_ACCENTS.DANGER }}>{formatIndianCurrency(a.accumulatedDepreciation)}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold text-sm" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(a.netBookValue)}</td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge className={`${STATUS_STYLES[a.status] || 'bg-gray-100 text-gray-700'} border text-[10px] pointer-events-none`}>{a.status}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button className="p-1 rounded hover:bg-primary/10 transition-colors" onClick={(e) => { e.stopPropagation(); openEdit(a); }} title="Edit">
                          <Edit size={14} style={{ color: PRIMARY }} />
                        </button>
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
              <p className="text-xs" style={{ color: TEXT_MUTE }}>
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const n = Math.max(1, page - 2) + i;
                    if (n > totalPages) return null;
                    return <PaginationItem key={n}><PaginationLink isActive={n === page} onClick={() => setPage(n)} className="cursor-pointer">{n}</PaginationLink></PaginationItem>;
                  })}
                  <PaginationItem>
                    <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

    </div>
      {/* Modals — outside space-y-3 */}
      {selectedAsset && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="flex-1 bg-black/50" onClick={closeDetail} />
          <div className="w-full max-w-lg bg-background shadow-2xl flex flex-col border-l border-border">
            <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-foreground leading-tight break-words">{selectedAsset.assetName}</h1>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{selectedAsset.assetCode} · {selectedAsset.category}</p>
                </div>
                <button onClick={closeDetail} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0 text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-3 border-b grid grid-cols-3 gap-4" style={{ borderColor: BORDER }}>
              <div>
                <p className="text-[10px] font-medium uppercase" style={{ color: TEXT_MUTE }}>Cost</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(selectedAsset.purchaseCost)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase" style={{ color: TEXT_MUTE }}>Accum. Dep.</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: STAT_ACCENTS.DANGER }}>{formatIndianCurrency(selectedAsset.accumulatedDepreciation)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase" style={{ color: TEXT_MUTE }}>NBV</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: STAT_ACCENTS.SUCCESS }}>{formatIndianCurrency(selectedAsset.netBookValue)}</p>
              </div>
            </div>

            <div className="px-5 py-3 border-b grid grid-cols-3 gap-4 text-xs" style={{ borderColor: BORDER }}>
              <div>
                <p className="font-medium" style={{ color: TEXT_MUTE }}>Purchase Date</p>
                <p style={{ color: TEXT_MAIN }}>{selectedAsset.purchaseDate}</p>
              </div>
              <div>
                <p className="font-medium" style={{ color: TEXT_MUTE }}>Useful Life</p>
                <p style={{ color: TEXT_MAIN }}>{selectedAsset.usefulLifeYears} years</p>
              </div>
              <div>
                <p className="font-medium" style={{ color: TEXT_MUTE }}>Method</p>
                <p style={{ color: TEXT_MAIN }}>{selectedAsset.depreciationMethod}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="px-5 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: TEXT_MUTE }}>Depreciation Schedule</h3>
                {scheduleLoading ? (
                  <p className="text-sm py-8 text-center" style={{ color: TEXT_MUTE }}>Loading schedule...</p>
                ) : schedule.length === 0 ? (
                  <p className="text-sm py-8 text-center" style={{ color: TEXT_MUTE }}>No schedule entries yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                          <th className="text-left py-1.5 px-2 font-medium" style={{ color: TEXT_MUTE }}>Month</th>
                          <th className="text-right py-1.5 px-2 font-medium" style={{ color: TEXT_MUTE }}>Opening</th>
                          <th className="text-right py-1.5 px-2 font-medium" style={{ color: TEXT_MUTE }}>Dep.</th>
                          <th className="text-right py-1.5 px-2 font-medium" style={{ color: TEXT_MUTE }}>Accum.</th>
                          <th className="text-right py-1.5 px-2 font-medium" style={{ color: TEXT_MUTE }}>Closing</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((entry, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                            <td className="py-1.5 px-2 font-mono" style={{ color: TEXT_MAIN }}>{entry.month}</td>
                            <td className="py-1.5 px-2 text-right font-mono" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(entry.openingValue)}</td>
                            <td className="py-1.5 px-2 text-right font-mono" style={{ color: STAT_ACCENTS.DANGER }}>{formatIndianCurrency(entry.depreciationAmount)}</td>
                            <td className="py-1.5 px-2 text-right font-mono" style={{ color: TEXT_MUTE }}>{formatIndianCurrency(entry.accumulatedDepreciation)}</td>
                            <td className="py-1.5 px-2 text-right font-mono font-semibold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(entry.closingValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="flex-1 bg-black/50" onClick={closeDrawer} />
          <div className="w-full max-w-md bg-background shadow-2xl flex flex-col border-l border-border">
            <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-foreground leading-tight">
                    {editingAsset ? 'Edit Asset' : 'New Asset'}
                  </h1>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {editingAsset ? 'Update fixed asset details' : 'Register a new fixed asset'}
                  </p>
                </div>
                <button onClick={closeDrawer} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0 text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Asset Code *</label>
                  <Input className="h-9 text-sm font-mono" placeholder="e.g. FA-008"
                    value={form.assetCode || ''} onChange={e => setForm(f => ({ ...f, assetCode: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Status</label>
                  <Select value={form.status || 'Active'} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger className="h-9 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Disposed">Disposed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Asset Name *</label>
                <Input className="h-9 text-sm" placeholder="e.g. MRI Machine"
                  value={form.assetName || ''} onChange={e => setForm(f => ({ ...f, assetName: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Category</label>
                  <Select value={form.category || 'Medical Equipment'} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                    <SelectTrigger className="h-9 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_FILTERS.filter(c => c !== 'All').map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Purchase Date</label>
                  <DatePicker
                    date={form.purchaseDate ? new Date(form.purchaseDate) : undefined}
                    onDateChange={(d) => setForm(f => ({ ...f, purchaseDate: d ? d.toISOString().split('T')[0] : '' }))}
                    placeholder="Select date"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Purchase Cost</label>
                  <Input className="h-9 text-sm font-mono" type="number" placeholder="0"
                    value={form.purchaseCost ?? ''} onChange={e => setForm(f => ({ ...f, purchaseCost: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Salvage Value</label>
                  <Input className="h-9 text-sm font-mono" type="number" placeholder="0"
                    value={form.salvageValue ?? ''} onChange={e => setForm(f => ({ ...f, salvageValue: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Useful Life (years)</label>
                  <Input className="h-9 text-sm font-mono" type="number" placeholder="10"
                    value={form.usefulLifeYears ?? ''} onChange={e => setForm(f => ({ ...f, usefulLifeYears: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Depreciation Method</label>
                  <Select value={form.depreciationMethod || 'Straight-Line'} onValueChange={v => setForm(f => ({ ...f, depreciationMethod: v }))}>
                    <SelectTrigger className="h-9 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Straight-Line">Straight-Line</SelectItem>
                      <SelectItem value="Declining-Balance">Declining Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-1 border-t" style={{ borderColor: BORDER }}>
                <AttachmentSection attachments={attachments} onChange={setAttachments} />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t flex gap-2 justify-end flex-shrink-0" style={{ borderColor: BORDER }}>
              <Button variant="outline" size="sm" onClick={closeDrawer}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingAsset ? 'Save Changes' : 'Create Asset'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
