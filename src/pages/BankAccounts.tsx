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
  Search, Landmark, DollarSign, CreditCard, Wallet,
  Edit, X, ChevronDown, CheckCircle, Clock,
  ToggleLeft, ToggleRight, ArrowRightLeft,
} from 'lucide-react';
import * as bankAccountService from '@/services/bankAccountService';
import { BankAccount, BankTransaction } from '@/types/finance';
import { AttachmentSection, Attachment } from '@/components/finance/AttachmentSection';

const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';
const PRIMARY   = STAT_ACCENTS.PRIMARY;

const TYPE_FILTERS = ['All', 'Current', 'Savings'];

const EMPTY_FORM: Partial<BankAccount> = {
  bankName: '', accountNumber: '', ifscCode: '', accountType: 'Current',
  linkedAccountId: '', balance: 0, isActive: true,
};

export function BankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Detail panel
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [txnLoading, setTxnLoading] = useState(false);

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [form, setForm] = useState<Partial<BankAccount>>(EMPTY_FORM);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bankAccountService.listBankAccounts();
      setAccounts(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load bank accounts', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  // Listen for header "Add Account" button
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === 'bank-account') openCreate();
    };
    window.addEventListener('openCreateModal', handler);
    return () => window.removeEventListener('openCreateModal', handler);
  }, []);

  const filtered = accounts.filter(a => {
    const q = search.toLowerCase();
    const matchesSearch = !search || a.bankName.toLowerCase().includes(q) || a.accountNumber.includes(q);
    const matchesType = typeFilter === 'All' || a.accountType === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    totalAccounts: accounts.length,
    totalBalance: accounts.reduce((s, a) => s + a.balance, 0),
    savings: accounts.filter(a => a.accountType === 'Savings').length,
    current: accounts.filter(a => a.accountType === 'Current').length,
  };

  function openCreate() {
    setEditingAccount(null);
    setForm(EMPTY_FORM);
    setAttachments([]);
    setDrawerOpen(true);
  }

  function openEdit(account: BankAccount) {
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

  async function handleSave() {
    if (!form.bankName?.trim() || !form.accountNumber?.trim()) {
      toast({ title: 'Required', description: 'Bank name and account number are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      if (editingAccount) {
        const updated = await bankAccountService.updateBankAccount(editingAccount.id, form);
        setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
        toast({ title: 'Updated', description: `${updated.bankName} saved` });
      } else {
        const created = await bankAccountService.createBankAccount(form);
        setAccounts(prev => [created, ...prev]);
        toast({ title: 'Created', description: `${created.bankName} added` });
      }
      closeDrawer();
    } catch {
      toast({ title: 'Error', description: 'Failed to save bank account', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function openDetail(account: BankAccount) {
    setSelectedAccount(account);
    setTxnLoading(true);
    try {
      const res = await bankAccountService.getTransactions(account.id);
      setTransactions(res.data);
    } catch {
      setTransactions([]);
    } finally {
      setTxnLoading(false);
    }
  }

  function closeDetail() {
    setSelectedAccount(null);
    setTransactions([]);
  }

  async function handleReconcile(txn: BankTransaction) {
    if (!selectedAccount) return;
    try {
      const updated = await bankAccountService.reconcileTransaction(selectedAccount.id, txn.id);
      setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast({ title: 'Reconciled', description: `Transaction ${txn.referenceNumber} reconciled` });
    } catch {
      toast({ title: 'Error', description: 'Failed to reconcile transaction', variant: 'destructive' });
    }
  }

  return (
    <>
    <div className="space-y-3">
      {/* Stat cards */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Accounts" value={stats.totalAccounts} icon={Landmark} accent={STAT_ACCENTS.PRIMARY} active={true} />
          <StatCard label="Total Balance" value={formatIndianCurrency(stats.totalBalance)} icon={DollarSign} accent={STAT_ACCENTS.SUCCESS} active={true} />
          <StatCard label="Savings" value={stats.savings} icon={Wallet} accent={STAT_ACCENTS.CYAN}
            active={typeFilter === 'Savings'} onClick={() => setTypeFilter(typeFilter === 'Savings' ? 'All' : 'Savings')} />
          <StatCard label="Current" value={stats.current} icon={CreditCard} accent={STAT_ACCENTS.WARNING}
            active={typeFilter === 'Current'} onClick={() => setTypeFilter(typeFilter === 'Current' ? 'All' : 'Current')} />
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3 overflow-hidden" style={{ borderColor: BORDER }}>
        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {TYPE_FILTERS.map(f => (
                <button key={f}
                  onClick={() => setTypeFilter(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: typeFilter === f ? PRIMARY : 'transparent',
                    color: typeFilter === f ? '#fff' : TEXT_MUTE,
                    borderColor: typeFilter === f ? PRIMARY : BORDER,
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-52 flex-shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input type="search" placeholder="Search bank or account…"
              className="pl-8 h-8 text-xs"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        {/* Mobile */}
        <div className="lg:hidden space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input type="search" placeholder="Search bank or account…"
              className="pl-8 h-8 text-xs"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {TYPE_FILTERS.map(f => (
                <button key={f}
                  onClick={() => setTypeFilter(f)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: typeFilter === f ? PRIMARY : 'transparent',
                    color: typeFilter === f ? '#fff' : TEXT_MUTE,
                    borderColor: typeFilter === f ? PRIMARY : BORDER,
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
      {!loading && filtered.length === 0 && <div className="text-center py-12 text-sm" style={{ color: TEXT_MUTE }}>No bank accounts found</div>}

      {!loading && filtered.length > 0 && (
        <>
          {/* ── Mobile cards ─────────────────────────────── */}
          <div className="md:hidden space-y-2">
            {filtered.map(a => (
              <Card key={a.id} className="shadow-sm cursor-pointer active:scale-[0.99] transition-all" style={{ borderColor: BORDER }}
                onClick={() => openDetail(a)}>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold truncate" style={{ color: TEXT_MAIN }}>{a.bankName}</p>
                        <Badge className={`${a.accountType === 'Savings' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'} border text-[10px] pointer-events-none flex-shrink-0`}>{a.accountType}</Badge>
                      </div>
                      <p className="font-mono text-xs" style={{ color: TEXT_MUTE }}>{a.accountNumber}</p>
                      {a.ifscCode && <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>IFSC: {a.ifscCode}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono font-bold text-base" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(a.balance)}</p>
                      <div className="flex items-center justify-end mt-1 gap-1">
                        {a.isActive
                          ? <ToggleRight size={16} style={{ color: STAT_ACCENTS.SUCCESS }} />
                          : <ToggleLeft size={16} style={{ color: TEXT_MUTE }} />}
                        <span className="text-[10px]" style={{ color: a.isActive ? STAT_ACCENTS.SUCCESS : TEXT_MUTE }}>
                          {a.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2 border-t" style={{ borderColor: BORDER }}
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
                    <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Bank</th>
                    <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Account No.</th>
                    <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>IFSC</th>
                    <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Type</th>
                    <th className="text-right px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Balance</th>
                    <th className="text-center px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Status</th>
                    <th className="text-center px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.id}
                      className="hover:bg-primary/5 transition-colors cursor-pointer"
                      style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? '#fff' : 'hsl(220,16%,99%)' }}
                      onClick={() => openDetail(a)}>
                      <td className="px-3 py-2.5 font-medium" style={{ color: TEXT_MAIN }}>{a.bankName}</td>
                      <td className="px-3 py-2.5 font-mono text-xs" style={{ color: TEXT_MAIN }}>{a.accountNumber}</td>
                      <td className="px-3 py-2.5 font-mono text-xs" style={{ color: TEXT_MUTE }}>{a.ifscCode}</td>
                      <td className="px-3 py-2.5">
                        <Badge className={`${a.accountType === 'Savings' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'} border text-[10px] pointer-events-none`}>{a.accountType}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold text-sm" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(a.balance)}</td>
                      <td className="px-3 py-2.5 text-center">
                        {a.isActive
                          ? <ToggleRight size={18} style={{ color: STAT_ACCENTS.SUCCESS }} />
                          : <ToggleLeft size={18} style={{ color: TEXT_MUTE }} />}
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
        </>
      )}

    </div>
      {/* Modals — outside space-y-3 */}
      {selectedAccount && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="flex-1 bg-black/50" onClick={closeDetail} />
          <div className="w-full max-w-lg bg-background shadow-2xl flex flex-col border-l border-border">
            <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Landmark className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-foreground leading-tight break-words">{selectedAccount.bankName}</h1>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">{selectedAccount.accountNumber} · {selectedAccount.accountType}</p>
                </div>
                <button onClick={closeDetail} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0 text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-3 border-b" style={{ borderColor: BORDER }}>
              <p className="text-xs font-medium" style={{ color: TEXT_MUTE }}>Current Balance</p>
              <p className="text-xl font-bold mt-0.5" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(selectedAccount.balance)}</p>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="px-5 py-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: TEXT_MUTE }}>Recent Transactions</h3>
                {txnLoading ? (
                  <p className="text-sm py-8 text-center" style={{ color: TEXT_MUTE }}>Loading transactions...</p>
                ) : transactions.length === 0 ? (
                  <p className="text-sm py-8 text-center" style={{ color: TEXT_MUTE }}>No transactions found</p>
                ) : (
                  <div className="space-y-2">
                    {transactions.map(txn => (
                      <div key={txn.id} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: BORDER }}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${txn.debit > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                          <ArrowRightLeft size={14} style={{ color: txn.debit > 0 ? 'hsl(354,70%,50%)' : 'hsl(158,70%,36%)' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: TEXT_MAIN }}>{txn.description}</p>
                          <p className="text-[11px]" style={{ color: TEXT_MUTE }}>{txn.transactionDate} · {txn.referenceNumber}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-semibold ${txn.debit > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {txn.debit > 0 ? `-${formatIndianCurrency(txn.debit)}` : `+${formatIndianCurrency(txn.credit)}`}
                          </p>
                          {txn.isReconciled ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[9px] pointer-events-none mt-0.5">Reconciled</Badge>
                          ) : (
                            <button
                              className="text-[10px] font-medium mt-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                              onClick={() => handleReconcile(txn)}>
                              Reconcile
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
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
                  <Landmark className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-foreground leading-tight">
                    {editingAccount ? 'Edit Bank Account' : 'New Bank Account'}
                  </h1>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {editingAccount ? 'Update bank account details' : 'Add a new bank account'}
                  </p>
                </div>
                <button onClick={closeDrawer} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0 text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Bank Name *</label>
                <Input className="h-9 text-sm" placeholder="e.g. HDFC Bank"
                  value={form.bankName || ''} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Account Number *</label>
                  <Input className="h-9 text-sm font-mono" placeholder="e.g. 50100123456789"
                    value={form.accountNumber || ''} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>IFSC Code</label>
                  <Input className="h-9 text-sm font-mono" placeholder="e.g. HDFC0001234"
                    value={form.ifscCode || ''} onChange={e => setForm(f => ({ ...f, ifscCode: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Account Type</label>
                  <Select value={form.accountType || 'Current'} onValueChange={v => setForm(f => ({ ...f, accountType: v }))}>
                    <SelectTrigger className="h-9 text-sm w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Current">Current</SelectItem>
                      <SelectItem value="Savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
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
                <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Opening Balance</label>
                <Input className="h-9 text-sm font-mono" type="number" placeholder="0"
                  value={form.balance ?? ''} onChange={e => setForm(f => ({ ...f, balance: parseFloat(e.target.value) || 0 }))} />
              </div>

              <div className="pt-1 border-t" style={{ borderColor: BORDER }}>
                <AttachmentSection attachments={attachments} onChange={setAttachments} />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t flex gap-2 justify-end flex-shrink-0" style={{ borderColor: BORDER }}>
              <Button variant="outline" size="sm" onClick={closeDrawer}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingAccount ? 'Save Changes' : 'Create Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
