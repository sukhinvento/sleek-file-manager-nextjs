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
  Search, BookOpen, DollarSign, TrendingUp, TrendingDown, Landmark,
  ToggleLeft, ToggleRight, Edit, Trash2, X, ChevronDown,
} from 'lucide-react';
import * as accountService from '@/services/accountService';
import { Account, AccountType, AccountSubType, SUBTYPE_BY_TYPE } from '@/types/finance';
import { AttachmentSection, Attachment } from '@/components/finance/AttachmentSection';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';
const PRIMARY   = STAT_ACCENTS.PRIMARY;

const TYPE_BADGE: Record<AccountType, string> = {
  [AccountType.ASSET]:     'bg-blue-50 text-blue-700 border-blue-200',
  [AccountType.LIABILITY]: 'bg-red-50 text-red-700 border-red-200',
  [AccountType.EQUITY]:    'bg-purple-50 text-purple-700 border-purple-200',
  [AccountType.REVENUE]:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  [AccountType.EXPENSE]:   'bg-amber-50 text-amber-700 border-amber-200',
};

const EMPTY_FORM: Partial<Account> = {
  accountCode: '', accountName: '', accountType: AccountType.ASSET,
  accountSubType: AccountSubType.CURRENT_ASSET, description: '', isActive: true,
};

const TYPE_FILTERS: Array<{ label: string; value: AccountType | '' }> = [
  { label: 'All', value: '' },
  { label: 'Asset', value: AccountType.ASSET },
  { label: 'Liability', value: AccountType.LIABILITY },
  { label: 'Equity', value: AccountType.EQUITY },
  { label: 'Revenue', value: AccountType.REVENUE },
  { label: 'Expense', value: AccountType.EXPENSE },
];

export function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AccountType | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 25;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form, setForm] = useState<Partial<Account>>(EMPTY_FORM);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  // Stats come from dedicated stats endpoint (not derived from current page)
  const typeCounts: Record<string, number> = {
    [AccountType.ASSET]:     stats.asset ?? 0,
    [AccountType.LIABILITY]: stats.liability ?? 0,
    [AccountType.EQUITY]:    stats.equity ?? 0,
    [AccountType.REVENUE]:   stats.revenue ?? 0,
    [AccountType.EXPENSE]:   stats.expense ?? 0,
  };

  const loadStats = async () => {
    try {
      const data = await accountService.fetchAccountStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading account stats:', error);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await accountService.listAccounts({ page, limit: LIMIT, search, type: typeFilter });
      setAccounts(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch {
      toast({ title: 'Error', description: 'Failed to load accounts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  // Listen for header "Add Account" button
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === 'chart-of-accounts') openCreate();
    };
    window.addEventListener('openCreateModal', handler);
    return () => window.removeEventListener('openCreateModal', handler);
  }, []);

  function openCreate() {
    setEditingAccount(null);
    setForm(EMPTY_FORM);
    setAttachments([]);
    setDrawerOpen(true);
  }

  function openEdit(account: Account) {
    setEditingAccount(account);
    setForm({ ...account });
    setAttachments([]);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingAccount(null);
    setForm(EMPTY_FORM);
    setAttachments([]);
  }

  function handleTypeChange(t: AccountType) {
    setForm(f => ({ ...f, accountType: t, accountSubType: SUBTYPE_BY_TYPE[t][0] }));
  }

  async function handleSave() {
    if (!form.accountCode?.trim() || !form.accountName?.trim()) {
      toast({ title: 'Required', description: 'Account code and name are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingAccount) {
        const updated = await accountService.updateAccount(editingAccount.id, form);
        setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
        toast({ title: 'Updated', description: `${updated.accountName} saved` });
      } else {
        const created = await accountService.createAccount(form as Omit<Account, 'id' | 'balance' | 'createdAt' | 'updatedAt'>);
        setAccounts(prev => [created, ...prev]);
        toast({ title: 'Created', description: `${created.accountName} added` });
      }
      closeDrawer();
    } catch {
      toast({ title: 'Error', description: 'Failed to save account', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(account: Account) {
    setDeleteTarget(account);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await accountService.deleteAccount(deleteTarget.id);
      setAccounts(prev => prev.filter(a => a.id !== deleteTarget.id));
      toast({ title: 'Deleted', description: `${deleteTarget.accountName} removed` });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete account', variant: 'destructive' });
    }
  }

  async function toggleActive(account: Account) {
    try {
      const updated = await accountService.updateAccount(account.id, { isActive: !account.isActive });
      setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  }

  const STAT_CARDS = [
    { label: 'Total', value: total, icon: BookOpen, accent: STAT_ACCENTS.PRIMARY, filter: '' as const },
    { label: 'Assets', value: typeCounts[AccountType.ASSET] || 0, icon: Landmark, accent: STAT_ACCENTS.CYAN, filter: AccountType.ASSET },
    { label: 'Liabilities', value: typeCounts[AccountType.LIABILITY] || 0, icon: TrendingDown, accent: STAT_ACCENTS.DANGER, filter: AccountType.LIABILITY },
    { label: 'Revenue', value: typeCounts[AccountType.REVENUE] || 0, icon: TrendingUp, accent: STAT_ACCENTS.SUCCESS, filter: AccountType.REVENUE },
    { label: 'Expenses', value: typeCounts[AccountType.EXPENSE] || 0, icon: DollarSign, accent: STAT_ACCENTS.WARNING, filter: AccountType.EXPENSE },
  ];

  return (
    <>
    <div className="space-y-3">
      {/* Stat cards — same scroll container as other pages */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          {STAT_CARDS.map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent}
              active={typeFilter === s.filter}
              onClick={() => { setTypeFilter(typeFilter === s.filter ? '' : s.filter as AccountType); setPage(1); }}
            />
          ))}
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3 overflow-hidden" style={{ borderColor: BORDER }}>
        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {TYPE_FILTERS.map(f => (
                <button key={f.value}
                  onClick={() => { setTypeFilter(f.value); setPage(1); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: typeFilter === f.value ? PRIMARY : 'transparent',
                    color: typeFilter === f.value ? '#fff' : TEXT_MUTE,
                    borderColor: typeFilter === f.value ? PRIMARY : BORDER,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-52 flex-shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input type="search" placeholder="Search code or name…"
              className="pl-8 h-8 text-xs"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
        {/* Mobile */}
        <div className="lg:hidden space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input type="search" placeholder="Search code or name…"
              className="pl-8 h-8 text-xs"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {TYPE_FILTERS.map(f => (
                <button key={f.value}
                  onClick={() => { setTypeFilter(f.value); setPage(1); }}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: typeFilter === f.value ? PRIMARY : 'transparent',
                    color: typeFilter === f.value ? '#fff' : TEXT_MUTE,
                    borderColor: typeFilter === f.value ? PRIMARY : BORDER,
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
      {!loading && accounts.length === 0 && <div className="text-center py-12 text-sm" style={{ color: TEXT_MUTE }}>No accounts found</div>}

      {!loading && accounts.length > 0 && (
        <>
          {/* ── Mobile cards ───────────────────────────────── */}
          <div className="md:hidden space-y-2">
            {accounts.map(a => (
              <Card key={a.id} className="shadow-sm cursor-pointer active:scale-[0.99] transition-all"
                style={{ borderColor: BORDER }} onClick={() => openEdit(a)}>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] font-semibold" style={{ color: TEXT_MUTE }}>{a.accountCode}</span>
                        <Badge className={`${TYPE_BADGE[a.accountType]} border text-[10px] pointer-events-none`}>{a.accountType}</Badge>
                      </div>
                      <p className="text-sm font-semibold leading-tight" style={{ color: TEXT_MAIN }}>{a.accountName}</p>
                      {a.description && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: TEXT_MUTE }}>{a.description}</p>}
                      <p className="text-[10px] mt-1" style={{ color: TEXT_MUTE }}>{a.accountSubType}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono font-bold text-sm" style={{ color: a.balance >= 0 ? TEXT_MAIN : STAT_ACCENTS.DANGER }}>
                        {formatIndianCurrency(a.balance)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BORDER }}
                    onClick={ev => ev.stopPropagation()}>
                    <button onClick={() => toggleActive(a)} title={a.isActive ? 'Deactivate' : 'Activate'}>
                      {a.isActive
                        ? <ToggleRight size={18} style={{ color: STAT_ACCENTS.SUCCESS }} />
                        : <ToggleLeft size={18} style={{ color: TEXT_MUTE }} />}
                    </button>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded hover:bg-primary/10 transition-colors" onClick={() => openEdit(a)} title="Edit">
                        <Edit size={14} style={{ color: PRIMARY }} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-red-50 transition-colors" onClick={ev => { ev.stopPropagation(); handleDelete(a); }} title="Delete">
                        <Trash2 size={14} style={{ color: STAT_ACCENTS.DANGER }} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* ── Desktop table ──────────────────────────────── */}
          <Card className="border-0 shadow-sm overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full dense-table text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}`, background: 'hsl(220,16%,97%)' }}>
                    <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Code</th>
                    <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Account Name</th>
                    <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Type</th>
                    <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Sub-type</th>
                    <th className="text-right px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Balance</th>
                    <th className="text-center px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Active</th>
                    <th className="text-center px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a, i) => (
                    <tr key={a.id}
                      style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? '#fff' : 'hsl(220,16%,99%)' }}
                      className="hover:bg-primary/5 transition-colors">
                      <td className="px-3 py-2.5 font-mono font-medium text-xs" style={{ color: TEXT_MAIN }}>{a.accountCode}</td>
                      <td className="px-3 py-2.5 font-medium" style={{ color: TEXT_MAIN }}>
                        {a.accountName}
                        {a.description && <p className="text-xs font-normal mt-0.5 truncate max-w-[220px]" style={{ color: TEXT_MUTE }}>{a.description}</p>}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge className={`${TYPE_BADGE[a.accountType]} border text-[10px] pointer-events-none`}>{a.accountType}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-xs" style={{ color: TEXT_MUTE }}>{a.accountSubType}</td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold text-sm" style={{ color: a.balance >= 0 ? TEXT_MAIN : STAT_ACCENTS.DANGER }}>
                        {formatIndianCurrency(a.balance)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button onClick={() => toggleActive(a)} title={a.isActive ? 'Deactivate' : 'Activate'}>
                          {a.isActive
                            ? <ToggleRight size={18} style={{ color: STAT_ACCENTS.SUCCESS }} />
                            : <ToggleLeft size={18} style={{ color: TEXT_MUTE }} />}
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1 rounded hover:bg-primary/10 transition-colors" onClick={() => openEdit(a)} title="Edit">
                            <Edit size={14} style={{ color: PRIMARY }} />
                          </button>
                          <button className="p-1 rounded hover:bg-red-50 transition-colors" onClick={() => handleDelete(a)} title="Delete">
                            <Trash2 size={14} style={{ color: STAT_ACCENTS.DANGER }} />
                          </button>
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
      {/* Drawer — outside space-y-3 so it gets no margin-top */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="flex-1 bg-black/50" onClick={closeDrawer} />
          <div className="w-full max-w-md bg-background shadow-2xl flex flex-col border-l border-border">
            {/* Drawer header */}
            <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-foreground leading-tight">
                    {editingAccount ? 'Edit Account' : 'New Account'}
                  </h1>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {editingAccount ? 'Update chart of accounts entry' : 'Add a new account to the chart'}
                  </p>
                </div>
                <button onClick={closeDrawer} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0 text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Account Code *</label>
                  <Input className="h-9 text-sm font-mono" placeholder="e.g. 1001"
                    value={form.accountCode || ''} onChange={e => setForm(f => ({ ...f, accountCode: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Status</label>
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                    className="h-9 w-full rounded-md border flex items-center justify-between px-3 text-sm"
                    style={{ borderColor: BORDER, color: form.isActive ? STAT_ACCENTS.SUCCESS : TEXT_MUTE }}>
                    <span>{form.isActive ? 'Active' : 'Inactive'}</span>
                    {form.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Account Name *</label>
                <Input className="h-9 text-sm" placeholder="e.g. Cash in Hand"
                  value={form.accountName || ''} onChange={e => setForm(f => ({ ...f, accountName: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Account Type *</label>
                  <Select value={form.accountType} onValueChange={v => handleTypeChange(v as AccountType)}>
                    <SelectTrigger className="h-9 text-sm w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AccountType).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Sub-type *</label>
                  <Select value={form.accountSubType} onValueChange={v => setForm(f => ({ ...f, accountSubType: v as AccountSubType }))}>
                    <SelectTrigger className="h-9 text-sm w-full">
                      <SelectValue placeholder="Select sub-type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(SUBTYPE_BY_TYPE[form.accountType as AccountType] || []).map(st => (
                        <SelectItem key={st} value={st}>{st}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Description</label>
                <textarea className="w-full text-sm rounded-md border px-3 py-2 resize-none outline-none focus:ring-1 focus:ring-primary/30"
                  style={{ borderColor: BORDER, color: TEXT_MAIN }}
                  rows={3} placeholder="Optional description…"
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Attachments */}
              <div className="pt-1 border-t" style={{ borderColor: BORDER }}>
                <AttachmentSection attachments={attachments} onChange={setAttachments} />
              </div>
            </div>

            {/* Drawer footer */}
            <div className="px-5 py-3.5 border-t flex gap-2 justify-end flex-shrink-0" style={{ borderColor: BORDER }}>
              <Button variant="outline" size="sm" onClick={closeDrawer}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editingAccount ? 'Save Changes' : 'Create Account'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Delete "${deleteTarget?.accountName ?? ''}"?`}
        description="This will permanently remove the account. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}
