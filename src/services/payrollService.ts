import apiClient from '@/lib/api-client';
import { EmployeeSalary, PayrollRun, PayrollRunEntry } from '@/types/finance';

// ── Mapping helpers ──────────────────────────────────────────────────────────

function mapEmployee(raw: any): EmployeeSalary {
  return {
    id: raw._id || raw.id || '',
    doctorId: raw.doctor_id || raw.doctorId || '',
    employeeName: raw.employee_name || raw.employeeName || '',
    designation: raw.designation || '',
    basicSalary: raw.basic_salary ?? raw.basicSalary ?? 0,
    hra: raw.hra ?? 0,
    specialAllowance: raw.special_allowance ?? raw.specialAllowance ?? 0,
    pfDeduction: raw.pf_deduction ?? raw.pfDeduction ?? 0,
    taxDeduction: raw.tax_deduction ?? raw.taxDeduction ?? 0,
    netSalary: raw.net_salary ?? raw.netSalary ?? 0,
    isActive: raw.is_active ?? raw.isActive ?? true,
  };
}

function mapRunEntry(raw: any): PayrollRunEntry {
  return {
    employeeSalaryId: raw.employee_salary_id || raw.employeeSalaryId || '',
    employeeName: raw.employee_name || raw.employeeName || '',
    designation: raw.designation || '',
    gross: raw.gross ?? 0,
    deductions: raw.deductions ?? 0,
    net: raw.net ?? 0,
    paid: raw.paid ?? false,
  };
}

function mapRun(raw: any): PayrollRun {
  return {
    id: raw._id || raw.id || '',
    payrollPeriod: raw.payroll_period || raw.payrollPeriod || '',
    runDate: raw.run_date || raw.runDate || '',
    status: raw.status || 'Draft',
    entries: (raw.entries || []).map(mapRunEntry),
    totalGross: raw.total_gross ?? raw.totalGross ?? 0,
    totalNet: raw.total_net ?? raw.totalNet ?? 0,
    journalEntryId: raw.journal_entry_id || raw.journalEntryId || '',
    createdAt: raw.created_at || raw.createdAt || '',
  };
}

function toBackendEmployee(data: Partial<EmployeeSalary>): Record<string, any> {
  return {
    doctor_id: data.doctorId,
    employee_name: data.employeeName,
    designation: data.designation,
    basic_salary: data.basicSalary,
    hra: data.hra,
    special_allowance: data.specialAllowance,
    pf_deduction: data.pfDeduction,
    tax_deduction: data.taxDeduction,
    is_active: data.isActive,
  };
}

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_EMPLOYEES: EmployeeSalary[] = [
  { id: 'emp-1', doctorId: 'd-01', employeeName: 'Dr. Rajesh Gupta', designation: 'Senior Consultant', basicSalary: 120000, hra: 48000, specialAllowance: 20000, pfDeduction: 14400, taxDeduction: 18000, netSalary: 155600, isActive: true },
  { id: 'emp-2', doctorId: 'd-02', employeeName: 'Dr. Meena Sharma', designation: 'Radiologist', basicSalary: 95000, hra: 38000, specialAllowance: 15000, pfDeduction: 11400, taxDeduction: 12000, netSalary: 124600, isActive: true },
  { id: 'emp-3', doctorId: '', employeeName: 'Priya Nair', designation: 'Head Nurse', basicSalary: 45000, hra: 18000, specialAllowance: 8000, pfDeduction: 5400, taxDeduction: 4000, netSalary: 61600, isActive: true },
  { id: 'emp-4', doctorId: '', employeeName: 'Amit Patel', designation: 'Admin Manager', basicSalary: 55000, hra: 22000, specialAllowance: 10000, pfDeduction: 6600, taxDeduction: 6000, netSalary: 74400, isActive: true },
  { id: 'emp-5', doctorId: '', employeeName: 'Sita Reddy', designation: 'Lab Technician', basicSalary: 35000, hra: 14000, specialAllowance: 5000, pfDeduction: 4200, taxDeduction: 2500, netSalary: 47300, isActive: false },
];

const MOCK_RUNS: PayrollRun[] = [
  {
    id: 'pr-1', payrollPeriod: '2026-05', runDate: '2026-06-01', status: 'Paid',
    entries: MOCK_EMPLOYEES.filter(e => e.isActive).map(e => ({ employeeSalaryId: e.id, employeeName: e.employeeName, designation: e.designation, gross: e.basicSalary + e.hra + e.specialAllowance, deductions: e.pfDeduction + e.taxDeduction, net: e.netSalary, paid: true })),
    totalGross: 496000, totalNet: 416200, journalEntryId: 'je-005', createdAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'pr-2', payrollPeriod: '2026-04', runDate: '2026-05-01', status: 'Paid',
    entries: [], totalGross: 496000, totalNet: 416200, journalEntryId: '', createdAt: '2026-05-01T08:00:00Z',
  },
];

// ── Service methods ──────────────────────────────────────────────────────────

export async function listEmployees(): Promise<EmployeeSalary[]> {
  try {
    const res = await apiClient.get('/payroll/employees');
    return (res.data.data || res.data || []).map(mapEmployee);
  } catch {
    console.warn('payrollService.listEmployees: backend unavailable, using mock data');
    return MOCK_EMPLOYEES;
  }
}

export async function createEmployee(data: Partial<EmployeeSalary>): Promise<EmployeeSalary> {
  try {
    const res = await apiClient.post('/payroll/employees', toBackendEmployee(data));
    return mapEmployee(res.data);
  } catch {
    const emp: EmployeeSalary = {
      ...data as EmployeeSalary,
      id: `emp-${Date.now()}`,
      netSalary: (data.basicSalary || 0) + (data.hra || 0) + (data.specialAllowance || 0) - (data.pfDeduction || 0) - (data.taxDeduction || 0),
    };
    MOCK_EMPLOYEES.push(emp);
    return emp;
  }
}

export async function updateEmployee(id: string, data: Partial<EmployeeSalary>): Promise<EmployeeSalary> {
  try {
    const res = await apiClient.patch(`/payroll/employees/${id}`, toBackendEmployee(data));
    return mapEmployee(res.data);
  } catch {
    const idx = MOCK_EMPLOYEES.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Employee not found');
    MOCK_EMPLOYEES[idx] = { ...MOCK_EMPLOYEES[idx], ...data };
    return MOCK_EMPLOYEES[idx];
  }
}

export async function runPayroll(): Promise<PayrollRun> {
  try {
    const res = await apiClient.post('/payroll/run');
    return mapRun(res.data);
  } catch {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const activeEmps = MOCK_EMPLOYEES.filter(e => e.isActive);
    const run: PayrollRun = {
      id: `pr-${Date.now()}`,
      payrollPeriod: period,
      runDate: now.toISOString().split('T')[0],
      status: 'Draft',
      entries: activeEmps.map(e => ({
        employeeSalaryId: e.id, employeeName: e.employeeName, designation: e.designation,
        gross: e.basicSalary + e.hra + e.specialAllowance,
        deductions: e.pfDeduction + e.taxDeduction,
        net: e.netSalary, paid: false,
      })),
      totalGross: activeEmps.reduce((s, e) => s + e.basicSalary + e.hra + e.specialAllowance, 0),
      totalNet: activeEmps.reduce((s, e) => s + e.netSalary, 0),
      journalEntryId: '',
      createdAt: now.toISOString(),
    };
    MOCK_RUNS.unshift(run);
    return run;
  }
}

export async function listRuns(): Promise<PayrollRun[]> {
  try {
    const res = await apiClient.get('/payroll/runs');
    return (res.data.data || res.data || []).map(mapRun);
  } catch {
    console.warn('payrollService.listRuns: backend unavailable, using mock data');
    return MOCK_RUNS;
  }
}

export async function processRun(id: string): Promise<PayrollRun> {
  try {
    const res = await apiClient.post(`/payroll/runs/${id}/process`);
    return mapRun(res.data);
  } catch {
    const idx = MOCK_RUNS.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Run not found');
    MOCK_RUNS[idx] = { ...MOCK_RUNS[idx], status: 'Processed' };
    return MOCK_RUNS[idx];
  }
}

export async function payRun(id: string): Promise<PayrollRun> {
  try {
    const res = await apiClient.post(`/payroll/runs/${id}/pay`);
    return mapRun(res.data);
  } catch {
    const idx = MOCK_RUNS.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Run not found');
    MOCK_RUNS[idx] = { ...MOCK_RUNS[idx], status: 'Paid', entries: MOCK_RUNS[idx].entries.map(e => ({ ...e, paid: true })) };
    return MOCK_RUNS[idx];
  }
}
