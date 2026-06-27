
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import {
  Search, Filter, User, Phone, Mail, Calendar, Activity, ArrowUpDown,
  Eye, Edit, Trash2, LogOut, Check, Stethoscope, Clock, UserCheck, BedDouble, ShieldCheck,
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/hooks/use-toast';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import * as patientService from '@/services/patientService';
import { Patient } from '@/services/patientService';
import { ModernPatientOverlay } from '@/components/patients/ModernPatientOverlay';
import { DischargeModal } from '@/components/patients/DischargeModal';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { OpdRegistrationSheet } from '@/components/patients/OpdRegistrationSheet';
import { AdmissionSheet } from '@/components/patients/AdmissionSheet';
import { RegisterPatientSheet } from '@/components/patients/RegisterPatientSheet';
import { AbdmSheet } from '@/components/abdm/AbdmSheet';
import * as opdService from '@/services/opdVisitService';
import { OpdVisit } from '@/services/opdVisitService';
import * as abdmService from '@/services/abdmService';

// ── Design tokens ────────────────────────────────────────────────────────────
const PRIMARY   = STAT_ACCENTS.PRIMARY;
const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';

type ActiveTab = 'opd' | 'ipd';

// ── Status badge (IPD) ───────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'active':      return 'bg-green-100 text-green-800 border-green-200';
      case 'discharged':  return 'bg-primary/10 text-primary border-primary/20';
      case 'admitted':    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':    return 'bg-red-100 text-red-800 border-red-200';
      case 'registered':  return 'bg-purple-100 text-purple-800 border-purple-200';
      default:            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  return (
    <Badge className={`${getStatusColor(status)} border text-[11px] pointer-events-none`}>
      {status}
    </Badge>
  );
};

// ── OPD visit status badge ───────────────────────────────────────────────────
const OpdStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'waiting':        return <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">Waiting</span>;
    case 'in_consultation':return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">In Consult</span>;
    case 'completed':      return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">Done</span>;
    case 'cancelled':      return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700 font-medium">Cancelled</span>;
    default:               return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 font-medium">{status}</span>;
  }
};

// ── Mobile card (IPD) ────────────────────────────────────────────────────────
const PatientMobileCard = ({ patient, onClick, onDischarge, onAbdm }: { patient: Patient; onClick?: () => void; onDischarge?: () => void; onAbdm?: () => void }) => {
  const abha = abdmService.getAbhaForPatient(patient.id);
  const statusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'active':      return 'bg-green-100 text-green-800 border-green-200';
      case 'discharged':  return 'bg-primary/10 text-primary border-primary/20';
      case 'admitted':    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':    return 'bg-red-100 text-red-800 border-red-200';
      case 'registered':  return 'bg-purple-100 text-purple-800 border-purple-200';
      default:            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  return (
    <Card className="w-full cursor-pointer active:scale-[0.99] transition-all duration-150 hover:shadow-md" style={{ borderColor: BORDER }} onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
              <User size={15} style={{ color: PRIMARY }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: TEXT_MAIN }}>{patient.name}</p>
              <p className="text-xs truncate leading-tight mt-0.5" style={{ color: TEXT_MUTE }}>{patient.patientId} • {patient.age}y {patient.gender}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {abha && (
              <Badge className="bg-primary/10 text-primary border border-primary/20 pointer-events-none text-[10px] gap-1 px-1.5">
                <ShieldCheck size={9} /> ABHA
              </Badge>
            )}
            <Badge className={`${statusColor(patient.status)} border pointer-events-none text-xs`}>{patient.status}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Department</p>
            <p className="text-xs font-medium truncate" style={{ color: TEXT_MAIN }}>{patient.department || '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Blood Group</p>
            <p className="text-xs font-medium" style={{ color: TEXT_MAIN }}>{patient.bloodGroup || '—'}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-1">
            <Calendar size={11} style={{ color: TEXT_MUTE }} />
            <span className="text-xs" style={{ color: TEXT_MUTE }}>Admitted: {patient.admissionDate || '—'}</span>
          </div>
          <span className="text-xs" style={{ color: TEXT_MUTE }}>Last: {patient.lastVisit || '—'}</span>
        </div>
        {onDischarge && patient.status?.toLowerCase() === 'admitted' && (
          <div className="pt-2 mt-2 border-t" style={{ borderColor: BORDER }}>
            <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
              onClick={(e) => { e.stopPropagation(); onDischarge(); }}>
              <LogOut size={12} /> Initiate Discharge
            </Button>
          </div>
        )}
        {onAbdm && !abha && (
          <div className={`pt-2 mt-2 border-t ${patient.status?.toLowerCase() === 'admitted' ? '' : 'border-t'}`} style={{ borderColor: BORDER }}>
            <Button size="sm" variant="ghost" className="w-full h-7 text-[11px] gap-1.5 text-primary/70 hover:text-primary hover:bg-primary/5"
              onClick={(e) => { e.stopPropagation(); onAbdm(); }}>
              <ShieldCheck size={11} /> Link ABHA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ── OPD Mobile Card ───────────────────────────────────────────────────────────
const OpdMobileCard = ({ visit, onStart, onComplete, onCancel }: {
  visit: OpdVisit;
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
}) => {
  const statusConfig = {
    waiting:         { label: 'Waiting',    cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    in_consultation: { label: 'In Consult', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    completed:       { label: 'Done',       cls: 'bg-green-100 text-green-700 border-green-200' },
    cancelled:       { label: 'Cancelled',  cls: 'bg-red-100 text-red-700 border-red-200' },
  }[visit.status] ?? { label: visit.status, cls: 'bg-gray-100 text-gray-700 border-gray-200' };

  return (
    <Card className="w-full" style={{ borderColor: BORDER }}>
      <CardContent className="p-3">
        {/* Row 1: icon + name/phone + status badge */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
              <Stethoscope size={15} style={{ color: PRIMARY }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: TEXT_MAIN }}>{visit.patientName}</p>
              <p className="text-xs truncate leading-tight mt-0.5" style={{ color: TEXT_MUTE }}>{visit.tokenNumber} · {visit.patientPhone || '—'}</p>
            </div>
          </div>
          <Badge className={`${statusConfig.cls} border pointer-events-none text-[11px] flex-shrink-0`}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Row 2: 2-col grid (Doctor | Department) */}
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Doctor</p>
            <p className="text-xs font-medium truncate" style={{ color: TEXT_MAIN }}>{visit.doctorName || '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Department</p>
            <p className="text-xs font-medium truncate" style={{ color: TEXT_MAIN }}>{visit.department || '—'}</p>
          </div>
        </div>

        {/* Row 3: token on left, fee on right */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
          <span className="text-xs" style={{ color: TEXT_MUTE }}>
            Token: <span className="font-mono font-semibold" style={{ color: PRIMARY }}>{visit.tokenNumber}</span>
          </span>
          <span className="text-xs" style={{ color: TEXT_MUTE }}>
            {visit.consultationFee > 0
              ? <>Fee: <span className="font-semibold" style={{ color: TEXT_MAIN }}>₹{visit.consultationFee.toLocaleString('en-IN')}</span></>
              : 'No fee'}
          </span>
        </div>

        {/* Row 4: full-width action buttons */}
        {(visit.status === 'waiting' || visit.status === 'in_consultation') && (
          <div className="pt-2 mt-2 border-t" style={{ borderColor: BORDER }}>
            {visit.status === 'waiting' && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1.5"
                  style={{ color: PRIMARY, borderColor: `${PRIMARY}40` }} onClick={onStart}>
                  Start Consultation
                </Button>
                <Button size="sm" variant="ghost" className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            )}
            {visit.status === 'in_consultation' && (
              <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1.5 text-green-600 border-green-200 hover:bg-green-50"
                onClick={onComplete}>
                Complete Consultation
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ── Page component ────────────────────────────────────────────────────────────
export const Patients = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  // ── Tab — driven by URL so AppLayout can read it ──────────────────────────
  const activeTab = (searchParams.get('tab') as ActiveTab) ?? 'ipd';
  const setActiveTab = (tab: ActiveTab) => setSearchParams({ tab }, { replace: true });

  // ── IPD data ──────────────────────────────────────────────────────────────
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0, activePatients: 0, admittedPatients: 0,
    dischargedPatients: 0, criticalPatients: 0,
    totalDepartments: 0, averageAge: 0, bloodGroups: 0,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  // IPD UI state
  const [ipdSearch, setIpdSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'admissionDate' | 'lastVisit'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 25;

  // Patient overlay state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDischargeOpen, setIsDischargeOpen] = useState(false);
  const [dischargePatient, setDischargePatient] = useState<Patient | null>(null);

  // Register patient (master record)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Delete confirmation
  const [deletePatientTarget, setDeletePatientTarget] = useState<Patient | null>(null);

  // ── OPD data ──────────────────────────────────────────────────────────────
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);

  // ABHA / ABDM sheet
  const [isAbdmOpen, setIsAbdmOpen] = useState(false);
  const [abdmPatient, setAbdmPatient] = useState<Patient | null>(null);
  const openAbdmFor = (p: Patient) => { setAbdmPatient(p); setIsAbdmOpen(true); };

  const [opdQueue, setOpdQueue] = useState<OpdVisit[]>([]);
  const [isOpdLoading, setIsOpdLoading] = useState(false);
  const [isOpdSheetOpen, setIsOpdSheetOpen] = useState(false);

  // OPD filter state
  const [opdStatusFilter, setOpdStatusFilter] = useState<string>('all');
  const [opdSearch, setOpdSearch] = useState('');

  // ── Load IPD ──────────────────────────────────────────────────────────────
  const loadPatients = async (page = currentPage) => {
    setIsLoadingData(true);
    try {
      const result = await patientService.fetchPatients(page, itemsPerPage);
      setPatients(result.data);
      setTotalItems(result.total);
    } catch {
      toast({ title: 'Error', description: 'Failed to load patients.', variant: 'destructive' });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadStats = async () => {
    try {
      setStats(await patientService.fetchPatientStats());
    } catch { /* best-effort */ }
  };

  useEffect(() => { loadPatients(currentPage); }, [currentPage]);
  useEffect(() => { loadStats(); }, []);
  useEffect(() => { setCurrentPage(1); }, [ipdSearch, selectedStatus]);

  // ── Load OPD ──────────────────────────────────────────────────────────────
  const loadOpdQueue = useCallback(async () => {
    setIsOpdLoading(true);
    try {
      setOpdQueue(await opdService.fetchTodayQueue());
    } catch { /* best-effort */ }
    finally { setIsOpdLoading(false); }
  }, []);

  useEffect(() => { loadOpdQueue(); }, [loadOpdQueue]);

  const handleOpdStatusChange = async (visitId: string, newStatus: string) => {
    try {
      await opdService.updateOpdVisitStatus(visitId, newStatus);
      await loadOpdQueue();
    } catch {
      toast({ title: 'Error', description: 'Failed to update visit status.', variant: 'destructive' });
    }
  };

  // ── CustomEvent listener ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.type === 'patient') { setIsRegisterOpen(true); }
      else if (e.detail?.type === 'opd') { setIsOpdSheetOpen(true); setActiveTab('opd'); }
      else if (e.detail?.type === 'ipd') { setIsAdmissionOpen(true); setActiveTab('ipd'); }
    };
    window.addEventListener('openCreateModal', handler);
    return () => window.removeEventListener('openCreateModal', handler);
  }, []);

  // ── IPD derived data ──────────────────────────────────────────────────────
  const statuses = ['All', 'Active', 'Admitted', 'Discharged', 'Critical'];
  const departments = useMemo(() =>
    ['All', ...Array.from(new Set(patients.map(p => p.department).filter(Boolean))).sort()],
    [patients]);
  const SORT_LABELS = { name: 'Name', age: 'Age', admissionDate: 'Admission Date', lastVisit: 'Last Visit' };

  const filteredPatients = useMemo(() => {
    const filtered = patients.filter(p => {
      const matchSearch = !ipdSearch ||
        p.name.toLowerCase().includes(ipdSearch.toLowerCase()) ||
        p.patientId.toLowerCase().includes(ipdSearch.toLowerCase()) ||
        p.phone.includes(ipdSearch) ||
        p.email.toLowerCase().includes(ipdSearch.toLowerCase());
      const matchStatus = selectedStatus === 'All' || p.status === selectedStatus;
      const matchDept = filterDept === 'All' || p.department === filterDept;
      return matchSearch && matchStatus && matchDept;
    });
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'age') cmp = (a.age ?? 0) - (b.age ?? 0);
      else if (sortBy === 'admissionDate') cmp = (a.admissionDate ?? '').localeCompare(b.admissionDate ?? '');
      else if (sortBy === 'lastVisit') cmp = (a.lastVisit ?? '').localeCompare(b.lastVisit ?? '');
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [patients, ipdSearch, selectedStatus, filterDept, sortBy, sortOrder]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Mobile: infinite scroll for IPD list
  const { displayedItems: mobilePatients, hasMoreItems: hasMorePatients, isLoading: isLoadingMore, loadMoreItems } =
    useInfiniteScroll({ data: filteredPatients, itemsPerPage: 10, enabled: isMobile });
  const ipdData = isMobile ? mobilePatients : filteredPatients;

  // ── OPD derived data ──────────────────────────────────────────────────────
  const opdStats = useMemo(() => ({
    waiting:        opdQueue.filter(v => v.status === 'waiting').length,
    inConsultation: opdQueue.filter(v => v.status === 'in_consultation').length,
    completed:      opdQueue.filter(v => v.status === 'completed').length,
    cancelled:      opdQueue.filter(v => v.status === 'cancelled').length,
  }), [opdQueue]);

  const filteredOpdQueue = useMemo(() => {
    return opdQueue.filter(v => {
      const matchStatus = opdStatusFilter === 'all' || v.status === opdStatusFilter;
      const q = opdSearch.toLowerCase();
      const matchSearch = !q ||
        v.patientName?.toLowerCase().includes(q) ||
        v.tokenNumber?.toLowerCase().includes(q) ||
        v.doctorName?.toLowerCase().includes(q) ||
        v.department?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [opdQueue, opdStatusFilter, opdSearch]);

  // ── Patient handlers ──────────────────────────────────────────────────────
  const handleViewPatient   = (p: Patient) => { setSelectedPatient(p); setIsEditMode(false); setIsAddPatientOpen(true); };
  const handleEditPatient   = (p: Patient) => { setSelectedPatient(p); setIsEditMode(true); setIsAddPatientOpen(true); };
  const handleAddPatient    = ()           => { setSelectedPatient(null); setIsEditMode(false); setIsAddPatientOpen(true); };
  const handleCloseOverlay  = ()           => { setIsAddPatientOpen(false); setSelectedPatient(null); setIsEditMode(false); };

  const handleDeletePatient = async (id: string) => {
    const patient = patients.find(p => p.id === id) || null;
    setDeletePatientTarget(patient);
  };

  const confirmDeletePatient = async () => {
    if (!deletePatientTarget) return;
    try {
      await patientService.deletePatient(deletePatientTarget.id);
      setPatients(p => p.filter(x => x.id !== deletePatientTarget.id));
      await loadStats();
      toast({ title: 'Patient Deleted', variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete patient.', variant: 'destructive' });
    }
  };

  const handleSavePatient = async (data: Patient) => {
    try {
      if (isEditMode && selectedPatient) {
        await patientService.updatePatient(selectedPatient.id, data);
        setPatients(p => p.map(x => x.id === selectedPatient.id ? { ...data, id: selectedPatient.id } : x));
      } else {
        const created = await patientService.createPatient(data);
        setPatients(p => [...p, created]);
      }
      await loadStats();
      setIsAddPatientOpen(false);
      setSelectedPatient(null);
    } catch (err) { throw err; }
  };

  // ── OPD status filter pills ───────────────────────────────────────────────
  const OPD_STATUS_FILTERS = [
    { key: 'all',             label: 'All',        count: opdQueue.length },
    { key: 'waiting',         label: 'Waiting',    count: opdStats.waiting },
    { key: 'in_consultation', label: 'In Consult', count: opdStats.inConsultation },
    { key: 'completed',       label: 'Done',       count: opdStats.completed },
    { key: 'cancelled',       label: 'Cancelled',  count: opdStats.cancelled },
  ];

  return (
    <div className="space-y-4">

      {/* ── Stat cards — swap by tab ─────────────────────────────────────── */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          {activeTab === 'ipd' ? (
            <>
              <StatCard label="Total" value={stats.totalPatients} icon={User} accent={STAT_ACCENTS.PRIMARY}
                active={selectedStatus === 'All'} onClick={() => setSelectedStatus('All')} />
              <StatCard label="Active" value={stats.activePatients} icon={Activity} accent={STAT_ACCENTS.SUCCESS}
                active={selectedStatus === 'Active'} onClick={() => setSelectedStatus(s => s === 'Active' ? 'All' : 'Active')} />
              <StatCard label="Admitted" value={stats.admittedPatients} icon={BedDouble} accent={STAT_ACCENTS.WARNING}
                active={selectedStatus === 'Admitted'} onClick={() => setSelectedStatus(s => s === 'Admitted' ? 'All' : 'Admitted')} />
              <StatCard label="Critical" value={stats.criticalPatients} icon={Activity} accent={STAT_ACCENTS.DANGER}
                active={selectedStatus === 'Critical'} onClick={() => setSelectedStatus(s => s === 'Critical' ? 'All' : 'Critical')} />
            </>
          ) : (
            <>
              <StatCard label="Today's Visits" value={opdQueue.length} icon={Stethoscope} accent={STAT_ACCENTS.PRIMARY}
                active={opdStatusFilter === 'all'} onClick={() => setOpdStatusFilter('all')} />
              <StatCard label="Waiting" value={opdStats.waiting} icon={Clock} accent={STAT_ACCENTS.WARNING}
                active={opdStatusFilter === 'waiting'} onClick={() => setOpdStatusFilter(f => f === 'waiting' ? 'all' : 'waiting')} />
              <StatCard label="In Consult" value={opdStats.inConsultation} icon={UserCheck} accent="hsl(210,70%,50%)"
                active={opdStatusFilter === 'in_consultation'} onClick={() => setOpdStatusFilter(f => f === 'in_consultation' ? 'all' : 'in_consultation')} />
              <StatCard label="Done" value={opdStats.completed} icon={Check} accent={STAT_ACCENTS.SUCCESS}
                active={opdStatusFilter === 'completed'} onClick={() => setOpdStatusFilter(f => f === 'completed' ? 'all' : 'completed')} />
            </>
          )}
        </div>
      </div>

      {/* ── Tab switcher ─────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('opd')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={activeTab === 'opd'
            ? { background: 'hsl(var(--card))', color: PRIMARY, boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }
            : { color: TEXT_MUTE }}>
          <Stethoscope className="h-4 w-4" />
          OPD
          {opdStats.waiting > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 ml-0.5">
              {opdStats.waiting}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('ipd')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={activeTab === 'ipd'
            ? { background: 'hsl(var(--card))', color: PRIMARY, boxShadow: '0 1px 4px rgba(0,0,0,0.10)' }
            : { color: TEXT_MUTE }}>
          <BedDouble className="h-4 w-4" />
          IPD
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* OPD TAB                                                           */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'opd' && (
        <div className="space-y-3">

          {/* OPD toolbar */}
          <div className="bg-card rounded-xl border shadow-sm p-3 space-y-2.5 sm:space-y-0 sm:flex sm:flex-row sm:items-center sm:gap-3">
            {/* Search — full-width on mobile */}
            <div className="relative w-full sm:w-64 sm:flex-shrink-0">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search patient, token, doctor…"
                className="pl-8 text-xs h-8" value={opdSearch}
                onChange={e => setOpdSearch(e.target.value)} />
            </div>
            {/* Status filter pills — horizontally scrollable on mobile */}
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide flex-1">
              <div className="flex gap-1.5 w-max sm:w-auto sm:flex-wrap">
                {OPD_STATUS_FILTERS.map(f => (
                  <button key={f.key} onClick={() => setOpdStatusFilter(f.key)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                    style={{
                      background:   opdStatusFilter === f.key ? PRIMARY : 'transparent',
                      color:        opdStatusFilter === f.key ? '#fff' : TEXT_MUTE,
                      borderColor:  opdStatusFilter === f.key ? PRIMARY : BORDER,
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* OPD queue table */}
          <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
            {isOpdLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredOpdQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Stethoscope className="h-10 w-10 text-muted-foreground opacity-30" />
                <p className="text-sm text-muted-foreground">
                  {opdSearch || opdStatusFilter !== 'all' ? 'No visits match your filter' : 'No OPD visits today'}
                </p>
                {!opdSearch && opdStatusFilter === 'all' && (
                  <Button size="sm" variant="outline" onClick={() => setIsOpdSheetOpen(true)}>
                    Register First Visit
                  </Button>
                )}
              </div>
            ) : isMobile ? (
              // ── Mobile OPD cards ──────────────────────────────────────────
              <div className="p-3 space-y-2.5">
                {filteredOpdQueue.map(visit => (
                  <OpdMobileCard
                    key={visit.id}
                    visit={visit}
                    onStart={() => handleOpdStatusChange(visit.id, 'in_consultation')}
                    onComplete={() => handleOpdStatusChange(visit.id, 'completed')}
                    onCancel={() => handleOpdStatusChange(visit.id, 'cancelled')}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">#</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Token</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden sm:table-cell">Doctor</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Dept</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground hidden md:table-cell">Fee</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOpdQueue.map((visit, i) => (
                      <tr key={visit.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-primary">{visit.tokenNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground">{visit.patientName}</p>
                          {visit.patientPhone && <p className="text-muted-foreground mt-0.5">{visit.patientPhone}</p>}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{visit.doctorName}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{visit.department}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                          {visit.consultationFee > 0 ? `₹${visit.consultationFee.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <OpdStatusBadge status={visit.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {visit.status === 'waiting' && (
                              <Button size="sm" variant="outline" className="h-6 text-xs px-2"
                                onClick={() => handleOpdStatusChange(visit.id, 'in_consultation')}>
                                Start
                              </Button>
                            )}
                            {visit.status === 'in_consultation' && (
                              <Button size="sm" variant="outline" className="h-6 text-xs px-2 text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleOpdStatusChange(visit.id, 'completed')}>
                                Complete
                              </Button>
                            )}
                            {visit.status === 'waiting' && (
                              <Button size="sm" variant="ghost" className="h-6 text-xs px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleOpdStatusChange(visit.id, 'cancelled')}>
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* IPD TAB                                                           */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'ipd' && (
        <div className="space-y-4">

          {/* Filters bar - sticky */}
          <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3 overflow-hidden">
            {/* Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
                <div className="flex gap-1.5 w-max">
                  {statuses.map(s => (
                    <button key={s} onClick={() => setSelectedStatus(s)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                      style={{
                        background:  selectedStatus === s ? PRIMARY : 'transparent',
                        color:       selectedStatus === s ? '#fff' : TEXT_MUTE,
                        borderColor: selectedStatus === s ? PRIMARY : BORDER,
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <div className="relative w-60">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input type="search" placeholder="Search patients…" className="pl-8 text-xs h-8"
                    value={ipdSearch} onChange={e => setIpdSearch(e.target.value)} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                      style={filterDept !== 'All' ? { background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` } : {}}>
                      <Filter size={13} />
                      {filterDept !== 'All' ? filterDept : 'Filter'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Department</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {departments.map(dept => (
                      <DropdownMenuItem key={dept} onClick={() => setFilterDept(dept)} className="flex items-center justify-between text-sm">
                        {dept}
                        {filterDept === dept && <Check className="h-3.5 w-3.5 text-primary" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                      <ArrowUpDown size={13} />
                      {SORT_LABELS[sortBy]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(['name', 'age', 'admissionDate', 'lastVisit'] as const).map(key => (
                      <DropdownMenuItem key={key} onClick={() => {
                        if (sortBy === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                        else { setSortBy(key); setSortOrder('asc'); }
                      }} className="flex items-center justify-between text-sm">
                        {SORT_LABELS[key]}
                        {sortBy === key && <span className="text-xs text-primary">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input type="search" placeholder="Search patients…" className="pl-8 text-xs h-8"
                    value={ipdSearch} onChange={e => setIpdSearch(e.target.value)} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                      style={filterDept !== 'All' ? { background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` } : {}}>
                      <Filter size={13} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Department</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {departments.map(dept => (
                      <DropdownMenuItem key={dept} onClick={() => setFilterDept(dept)} className="flex items-center justify-between text-sm">
                        {dept}
                        {filterDept === dept && <Check className="h-3.5 w-3.5 text-primary" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                      <ArrowUpDown size={13} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(['name', 'age', 'admissionDate', 'lastVisit'] as const).map(key => (
                      <DropdownMenuItem key={key} onClick={() => {
                        if (sortBy === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                        else { setSortBy(key); setSortOrder('asc'); }
                      }} className="flex items-center justify-between text-sm">
                        {SORT_LABELS[key]}
                        {sortBy === key && <span className="text-xs text-primary">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
                <div className="flex gap-1.5 w-max">
                  {statuses.map(s => (
                    <button key={s} onClick={() => setSelectedStatus(s)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                      style={{
                        background:  selectedStatus === s ? PRIMARY : 'transparent',
                        color:       selectedStatus === s ? '#fff' : TEXT_MUTE,
                        borderColor: selectedStatus === s ? PRIMARY : BORDER,
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Patient table */}
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              <p className="text-sm text-muted-foreground">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <BedDouble className="h-12 w-12 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No patients found</p>
            </div>
          ) : (
            <MobileTableView
              stickyHeader={true}
              data={ipdData}
              renderMobileItem={(p, onView) => (
                <PatientMobileCard patient={p as Patient} onClick={onView}
                  onDischarge={() => { setDischargePatient(p as Patient); setIsDischargeOpen(true); }}
                  onAbdm={() => openAbdmFor(p as Patient)} />
              )}
              columns={[
                {
                  key: 'name', label: 'Patient', width: 'w-[22%]',
                  render: (value, p) => (
                    <div>
                      <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{value as string}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>
                        {(p as any).patientId} · {(p as any).age}y {(p as any).gender}
                      </p>
                    </div>
                  )
                },
                {
                  key: 'phone', label: 'Contact', width: 'w-[18%]',
                  render: (value, p) => (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} style={{ color: TEXT_MUTE }} />
                        <p className="text-[11px]" style={{ color: TEXT_MAIN }}>{value as string}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail size={11} style={{ color: TEXT_MUTE }} />
                        <p className="text-[11px] truncate max-w-[130px]" style={{ color: TEXT_MUTE }}>{(p as any).email}</p>
                      </div>
                    </div>
                  )
                },
                {
                  key: 'department', label: 'Medical Info', width: 'w-[20%]',
                  render: (value, p) => (
                    <div>
                      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full border inline-block"
                        style={{ background: `${PRIMARY}14`, color: PRIMARY, borderColor: `${PRIMARY}33` }}>
                        {value as string}
                      </span>
                      <p className="text-[11px] mt-1" style={{ color: TEXT_MUTE }}>
                        Blood: <span className="font-semibold" style={{ color: TEXT_MAIN }}>{(p as any).bloodGroup}</span>
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>{(p as any).doctor}</p>
                    </div>
                  )
                },
                {
                  key: 'status', label: 'Status', width: 'w-[13%]',
                  render: (value) => <StatusBadge status={value as string} />
                },
                {
                  key: 'lastVisit', label: 'Last Visit', width: 'w-[17%]',
                  render: (value, p) => (
                    <div>
                      <div className="flex items-center gap-1">
                        <Calendar size={11} style={{ color: TEXT_MUTE }} />
                        <p className="text-sm" style={{ color: TEXT_MAIN }}>{value as string}</p>
                      </div>
                      {(p as any).admissionDate && (
                        <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>Admitted: {(p as any).admissionDate}</p>
                      )}
                    </div>
                  )
                }
              ]}
              onRowClick={p => handleViewPatient(p)}
              getActions={p => [
                { label: 'View',      onClick: () => handleViewPatient(p),  icon: Eye },
                { label: 'Edit',      onClick: () => handleEditPatient(p),  icon: Edit },
                { label: abdmService.getAbhaForPatient(p.id) ? 'View ABHA' : 'Link ABHA', onClick: () => openAbdmFor(p), icon: ShieldCheck },
                { label: 'Discharge', onClick: () => { setDischargePatient(p); setIsDischargeOpen(true); }, icon: LogOut },
                { label: 'Delete',    onClick: () => handleDeletePatient(p.id), variant: 'destructive' as const, icon: Trash2 },
              ]}
            />
          )}

          {/* Desktop pagination */}
          {!isMobile && !isLoadingData && totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">{page}</PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Mobile load-more */}
          {isMobile && !isLoadingData && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-xs text-muted-foreground">
                Showing {mobilePatients.length} of {filteredPatients.length} patients
              </p>
              {hasMorePatients && (
                <Button variant="outline" size="sm" onClick={loadMoreItems} disabled={isLoadingMore}
                  className="h-8 text-xs px-6">
                  {isLoadingMore
                    ? <><span className="animate-spin mr-1.5">⏳</span>Loading…</>
                    : 'Load more'}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Overlays ─────────────────────────────────────────────────────── */}
      <ModernPatientOverlay
        isOpen={isAddPatientOpen}
        onClose={handleCloseOverlay}
        patient={selectedPatient}
        isEditMode={isEditMode}
        onSave={handleSavePatient}
      />

      <DischargeModal
        patient={dischargePatient}
        isOpen={isDischargeOpen}
        onClose={() => { setIsDischargeOpen(false); setDischargePatient(null); }}
      />

      <OpdRegistrationSheet
        isOpen={isOpdSheetOpen}
        onClose={() => setIsOpdSheetOpen(false)}
        onRegistered={() => loadOpdQueue()}
      />

      <AdmissionSheet
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        onAdmitted={() => { loadPatients(); loadStats(); }}
      />

      <RegisterPatientSheet
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={() => { loadPatients(); loadStats(); }}
      />

      {abdmPatient && (
        <AbdmSheet
          isOpen={isAbdmOpen}
          onClose={() => { setIsAbdmOpen(false); setAbdmPatient(null); }}
          patientId={abdmPatient.id}
          patientName={abdmPatient.name}
          existingProfile={abdmService.getAbhaForPatient(abdmPatient.id)}
          onLinked={() => { setIsAbdmOpen(false); setAbdmPatient(null); }}
        />
      )}

      <ConfirmDialog
        open={!!deletePatientTarget}
        onOpenChange={(open) => { if (!open) setDeletePatientTarget(null); }}
        title={`Delete patient "${deletePatientTarget?.name ?? ''}"?`}
        description="This will permanently remove the patient record. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDeletePatient}
      />
    </div>
  );
};
