import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { formatIndianCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  Search, Users, DollarSign, Calendar, Play,
  Edit, X, ChevronDown, Banknote, CheckCircle, Clock,
  ToggleLeft, ToggleRight,
} from 'lucide-react';
import * as payrollService from '@/services/payrollService';
import { EmployeeSalary, PayrollRun } from '@/types/finance';
import { AttachmentSection, Attachment } from '@/components/finance/AttachmentSection';

const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';
const PRIMARY   = STAT_ACCENTS.PRIMARY;

const STATUS_STYLES: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800 border-gray-200',
  Processed: 'bg-blue-100 text-blue-800 border-blue-200',
  Paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const EMPTY_FORM: Partial<EmployeeSalary> = {
  employeeName: '', designation: '', basicSalary: 0, hra: 0, specialAllowance: 0,
  pfDeduction: 0, taxDeduction: 0, isActive: true, doctorId: '',
};

export function Payroll() {
  const [activeTab, setActiveTab] = useState<'salary' | 'runs'>('salary');
  const [employees, setEmployees] = useState<EmployeeSalary[]>([]);
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeSalary | null>(null);
  const [form, setForm] = useState<Partial<EmployeeSalary>>(EMPTY_FORM);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [emps, payRuns] = await Promise.all([
        payrollService.listEmployees(),
        payrollService.listRuns(),
      ]);
      setEmployees(emps);
      setRuns(payRuns);
    } catch {
      toast({ title: 'Error', description: 'Failed to load payroll data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Listen for header "Run Payroll" button
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === 'payroll') handleRunPayroll();
    };
    window.addEventListener('openCreateModal', handler);
    return () => window.removeEventListener('openCreateModal', handler);
  }, []);

  const activeEmployees = employees.filter(e => e.isActive);
  const totalMonthly = activeEmployees.reduce((s, e) => s + e.netSalary, 0);
  const lastRun = runs[0];

  const filteredEmployees = employees.filter(e => {
    const q = search.toLowerCase();
    return !search || e.employeeName.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q);
  });

  function openCreate() {
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
    setAttachments([]);
    setDrawerOpen(true);
  }

  function openEdit(emp: EmployeeSalary) {
    setEditingEmployee(emp);
    setForm({ ...emp });
    setAttachments([]);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingEmployee(null);
    setForm(EMPTY_FORM);
    setAttachments([]);
  }

  function computeNet(f: Partial<EmployeeSalary>) {
    return (f.basicSalary || 0) + (f.hra || 0) + (f.specialAllowance || 0) - (f.pfDeduction || 0) - (f.taxDeduction || 0);
  }

  async function handleSave() {
    if (!form.employeeName?.trim() || !form.designation?.trim()) {
      toast({ title: 'Required', description: 'Name and designation are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, netSalary: computeNet(form) };
      if (editingEmployee) {
        const updated = await payrollService.updateEmployee(editingEmployee.id, payload);
        setEmployees(prev => prev.map(e => e.id === updated.id ? updated : e));
        toast({ title: 'Updated', description: `${updated.employeeName} saved` });
      } else {
        const created = await payrollService.createEmployee(payload);
        setEmployees(prev => [created, ...prev]);
        toast({ title: 'Created', description: `${created.employeeName} added` });
      }
      closeDrawer();
    } catch {
      toast({ title: 'Error', description: 'Failed to save employee', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function handleRunPayroll() {
    try {
      const run = await payrollService.runPayroll();
      setRuns(prev => [run, ...prev]);
      setActiveTab('runs');
      toast({ title: 'Payroll Run Created', description: `Period: ${run.payrollPeriod}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to run payroll', variant: 'destructive' });
    }
  }

  async function handleProcess(id: string) {
    try {
      const updated = await payrollService.processRun(id);
      setRuns(prev => prev.map(r => r.id === updated.id ? updated : r));
      toast({ title: 'Processed', description: 'Payroll run processed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to process payroll', variant: 'destructive' });
    }
  }

  async function handlePay(id: string) {
    try {
      const updated = await payrollService.payRun(id);
      setRuns(prev => prev.map(r => r.id === updated.id ? updated : r));
      toast({ title: 'Paid', description: 'Payroll disbursed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to pay payroll', variant: 'destructive' });
    }
  }

  return (
    <>
    <div className="space-y-3">
      {/* Stat cards */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Employees" value={activeEmployees.length} icon={Users} accent={STAT_ACCENTS.PRIMARY} active={true} />
          <StatCard label="Monthly Total" value={formatIndianCurrency(totalMonthly)} icon={DollarSign} accent={STAT_ACCENTS.SUCCESS} active={true} />
          <StatCard label="Last Run" value={lastRun ? lastRun.status : 'N/A'} icon={Calendar} accent={STAT_ACCENTS.CYAN} />
        </div>
      </div>

      {/* Tabs + filter bar */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3 overflow-hidden" style={{ borderColor: BORDER }}>
        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab('salary')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
              style={{
                background: activeTab === 'salary' ? PRIMARY : 'transparent',
                color: activeTab === 'salary' ? '#fff' : TEXT_MUTE,
                borderColor: activeTab === 'salary' ? PRIMARY : BORDER,
              }}>
              Salary Config
            </button>
            <button
              onClick={() => setActiveTab('runs')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
              style={{
                background: activeTab === 'runs' ? PRIMARY : 'transparent',
                color: activeTab === 'runs' ? '#fff' : TEXT_MUTE,
                borderColor: activeTab === 'runs' ? PRIMARY : BORDER,
              }}>
              Payroll Runs
            </button>
          </div>
          <div className="flex-1" />
          {activeTab === 'salary' && (
            <>
              <div className="relative w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input type="search" placeholder="Search employees..."
                  className="pl-8 h-8 text-xs"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Button size="sm" className="h-8 text-xs" onClick={openCreate}>Add Employee</Button>
            </>
          )}
        </div>
        {/* Mobile */}
        <div className="lg:hidden space-y-2">
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab('salary')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
              style={{
                background: activeTab === 'salary' ? PRIMARY : 'transparent',
                color: activeTab === 'salary' ? '#fff' : TEXT_MUTE,
                borderColor: activeTab === 'salary' ? PRIMARY : BORDER,
              }}>
              Salary Config
            </button>
            <button
              onClick={() => setActiveTab('runs')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
              style={{
                background: activeTab === 'runs' ? PRIMARY : 'transparent',
                color: activeTab === 'runs' ? '#fff' : TEXT_MUTE,
                borderColor: activeTab === 'runs' ? PRIMARY : BORDER,
              }}>
              Payroll Runs
            </button>
          </div>
          {activeTab === 'salary' && (
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input type="search" placeholder="Search employees..."
                  className="pl-8 h-8 text-xs"
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Button size="sm" className="h-8 text-xs flex-shrink-0" onClick={openCreate}>Add</Button>
            </div>
          )}
        </div>
      </div>

      {/* Salary Config Tab */}
      {activeTab === 'salary' && (
        <>
          {loading && <div className="text-center py-12 text-sm" style={{ color: TEXT_MUTE }}>Loading...</div>}
          {!loading && filteredEmployees.length === 0 && <div className="text-center py-12 text-sm" style={{ color: TEXT_MUTE }}>No employees found</div>}
          {!loading && filteredEmployees.length > 0 && (
            <>
              {/* Mobile cards */}
              <div className="md:hidden space-y-2">
                {filteredEmployees.map(emp => (
                  <Card key={emp.id} className="shadow-sm cursor-pointer active:scale-[0.99] transition-all"
                    style={{ borderColor: BORDER }} onClick={() => openEdit(emp)}>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{emp.employeeName}</p>
                            {emp.isActive
                              ? <ToggleRight size={16} style={{ color: STAT_ACCENTS.SUCCESS }} />
                              : <ToggleLeft size={16} style={{ color: TEXT_MUTE }} />}
                          </div>
                          <p className="text-xs" style={{ color: TEXT_MUTE }}>{emp.designation}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Net Salary</p>
                          <p className="font-mono font-bold text-sm" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(emp.netSalary)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t" style={{ borderColor: BORDER }}>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: TEXT_MUTE }}>Basic</p>
                          <p className="font-mono" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(emp.basicSalary)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: TEXT_MUTE }}>HRA+Allow</p>
                          <p className="font-mono" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(emp.hra + emp.specialAllowance)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: TEXT_MUTE }}>Deductions</p>
                          <p className="font-mono" style={{ color: STAT_ACCENTS.DANGER }}>{formatIndianCurrency(emp.pfDeduction + emp.taxDeduction)}</p>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2 mt-1 border-t" style={{ borderColor: BORDER }}
                        onClick={ev => ev.stopPropagation()}>
                        <button className="p-1.5 rounded hover:bg-primary/10 transition-colors" onClick={() => openEdit(emp)} title="Edit">
                          <Edit size={14} style={{ color: PRIMARY }} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop table */}
              <Card className="border-0 shadow-sm overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full dense-table text-sm">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}`, background: 'hsl(220,16%,97%)' }}>
                        <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Employee</th>
                        <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Designation</th>
                        <th className="text-right px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Basic</th>
                        <th className="text-right px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>HRA</th>
                        <th className="text-right px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Allowance</th>
                        <th className="text-right px-3 py-2 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell" style={{ color: TEXT_MUTE }}>PF</th>
                        <th className="text-right px-3 py-2 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell" style={{ color: TEXT_MUTE }}>Tax</th>
                        <th className="text-right px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Net</th>
                        <th className="text-center px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Active</th>
                        <th className="text-center px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((emp, i) => (
                        <tr key={emp.id}
                          style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? '#fff' : 'hsl(220,16%,99%)' }}
                          className="hover:bg-primary/5 transition-colors">
                          <td className="px-3 py-2.5 font-medium" style={{ color: TEXT_MAIN }}>{emp.employeeName}</td>
                          <td className="px-3 py-2.5 text-xs" style={{ color: TEXT_MUTE }}>{emp.designation}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(emp.basicSalary)}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(emp.hra)}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(emp.specialAllowance)}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs hidden lg:table-cell" style={{ color: STAT_ACCENTS.DANGER }}>{formatIndianCurrency(emp.pfDeduction)}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-xs hidden lg:table-cell" style={{ color: STAT_ACCENTS.DANGER }}>{formatIndianCurrency(emp.taxDeduction)}</td>
                          <td className="px-3 py-2.5 text-right font-mono font-semibold text-sm" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(emp.netSalary)}</td>
                          <td className="px-3 py-2.5 text-center">
                            {emp.isActive
                              ? <ToggleRight size={18} style={{ color: STAT_ACCENTS.SUCCESS }} />
                              : <ToggleLeft size={18} style={{ color: TEXT_MUTE }} />}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button className="p-1 rounded hover:bg-primary/10 transition-colors" onClick={() => openEdit(emp)} title="Edit">
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
        </>
      )}

      {/* Payroll Runs Tab */}
      {activeTab === 'runs' && (
        <>
          {loading && <div className="text-center py-12 text-sm" style={{ color: TEXT_MUTE }}>Loading...</div>}
          {!loading && runs.length === 0 && <div className="text-center py-12 text-sm" style={{ color: TEXT_MUTE }}>No payroll runs yet</div>}
          {!loading && runs.length > 0 && (
            <>
              {/* Mobile cards */}
              <div className="md:hidden space-y-2">
                {runs.map(run => (
                  <Card key={run.id} className="shadow-sm" style={{ borderColor: BORDER }}>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{run.payrollPeriod}</p>
                          <p className="text-xs mt-0.5" style={{ color: TEXT_MUTE }}>Run: {run.runDate}</p>
                        </div>
                        <Badge className={`${STATUS_STYLES[run.status] || 'bg-gray-100 text-gray-800'} border text-[10px] pointer-events-none`}>{run.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t mb-2" style={{ borderColor: BORDER }}>
                        <div>
                          <p className="text-[10px] uppercase tracking-wide font-semibold mb-0.5" style={{ color: TEXT_MUTE }}>Gross</p>
                          <p className="font-mono text-sm" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(run.totalGross)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wide font-semibold mb-0.5" style={{ color: TEXT_MUTE }}>Net</p>
                          <p className="font-mono font-bold text-sm" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(run.totalNet)}</p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        {run.status === 'Draft' && (
                          <Button size="sm" variant="outline" className="h-7 text-[11px] px-2" onClick={() => handleProcess(run.id)}>
                            <Play size={11} className="mr-1" /> Process
                          </Button>
                        )}
                        {run.status === 'Processed' && (
                          <Button size="sm" variant="outline" className="h-7 text-[11px] px-2" onClick={() => handlePay(run.id)}>
                            <Banknote size={11} className="mr-1" /> Pay
                          </Button>
                        )}
                        {run.status === 'Paid' && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] pointer-events-none">
                            <CheckCircle size={10} className="mr-1" /> Complete
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop table */}
              <Card className="border-0 shadow-sm overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full dense-table text-sm">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}`, background: 'hsl(220,16%,97%)' }}>
                        <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Period</th>
                        <th className="text-left px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Run Date</th>
                        <th className="text-center px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Status</th>
                        <th className="text-right px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Gross</th>
                        <th className="text-right px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Net</th>
                        <th className="text-center px-3 py-2 font-semibold text-xs uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {runs.map((run, i) => (
                        <tr key={run.id}
                          style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? '#fff' : 'hsl(220,16%,99%)' }}
                          className="hover:bg-primary/5 transition-colors">
                          <td className="px-3 py-2.5 font-medium" style={{ color: TEXT_MAIN }}>{run.payrollPeriod}</td>
                          <td className="px-3 py-2.5 text-xs" style={{ color: TEXT_MUTE }}>{run.runDate}</td>
                          <td className="px-3 py-2.5 text-center">
                            <Badge className={`${STATUS_STYLES[run.status] || 'bg-gray-100 text-gray-800'} border text-[10px] pointer-events-none`}>{run.status}</Badge>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-sm" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(run.totalGross)}</td>
                          <td className="px-3 py-2.5 text-right font-mono font-semibold text-sm" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(run.totalNet)}</td>
                          <td className="px-3 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {run.status === 'Draft' && (
                                <Button size="sm" variant="outline" className="h-7 text-[11px] px-2" onClick={() => handleProcess(run.id)}>
                                  <Play size={11} className="mr-1" /> Process
                                </Button>
                              )}
                              {run.status === 'Processed' && (
                                <Button size="sm" variant="outline" className="h-7 text-[11px] px-2" onClick={() => handlePay(run.id)}>
                                  <Banknote size={11} className="mr-1" /> Pay
                                </Button>
                              )}
                              {run.status === 'Paid' && (
                                <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] pointer-events-none">
                                  <CheckCircle size={10} className="mr-1" /> Complete
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </>
      )}

    </div>
      {/* Drawer — outside space-y-3 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="flex-1 bg-black/50" onClick={closeDrawer} />
          <div className="w-full max-w-md bg-background shadow-2xl flex flex-col border-l border-border">
            <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-foreground leading-tight">
                    {editingEmployee ? 'Edit Employee Salary' : 'New Employee Salary'}
                  </h1>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {editingEmployee ? 'Update salary details' : 'Configure employee payroll'}
                  </p>
                </div>
                <button onClick={closeDrawer} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0 text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Employee Name *</label>
                <Input className="h-9 text-sm" placeholder="e.g. Dr. Rajesh Gupta"
                  value={form.employeeName || ''} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Designation *</label>
                  <Input className="h-9 text-sm" placeholder="e.g. Senior Consultant"
                    value={form.designation || ''} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
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

              <div className="border-t pt-3" style={{ borderColor: BORDER }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: TEXT_MUTE }}>Earnings</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Basic</label>
                    <Input className="h-9 text-sm font-mono" type="number" placeholder="0"
                      value={form.basicSalary ?? ''} onChange={e => setForm(f => ({ ...f, basicSalary: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>HRA</label>
                    <Input className="h-9 text-sm font-mono" type="number" placeholder="0"
                      value={form.hra ?? ''} onChange={e => setForm(f => ({ ...f, hra: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Special Allow.</label>
                    <Input className="h-9 text-sm font-mono" type="number" placeholder="0"
                      value={form.specialAllowance ?? ''} onChange={e => setForm(f => ({ ...f, specialAllowance: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>
              </div>

              <div className="border-t pt-3" style={{ borderColor: BORDER }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: TEXT_MUTE }}>Deductions</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>PF</label>
                    <Input className="h-9 text-sm font-mono" type="number" placeholder="0"
                      value={form.pfDeduction ?? ''} onChange={e => setForm(f => ({ ...f, pfDeduction: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: TEXT_MUTE }}>Tax</label>
                    <Input className="h-9 text-sm font-mono" type="number" placeholder="0"
                      value={form.taxDeduction ?? ''} onChange={e => setForm(f => ({ ...f, taxDeduction: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>
              </div>

              <div className="border-t pt-3" style={{ borderColor: BORDER }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: TEXT_MUTE }}>Net Salary</p>
                  <p className="text-lg font-bold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(computeNet(form))}</p>
                </div>
              </div>

              <div className="pt-1 border-t" style={{ borderColor: BORDER }}>
                <AttachmentSection attachments={attachments} onChange={setAttachments} />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t flex gap-2 justify-end flex-shrink-0" style={{ borderColor: BORDER }}>
              <Button variant="outline" size="sm" onClick={closeDrawer}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingEmployee ? 'Save Changes' : 'Add Employee'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
