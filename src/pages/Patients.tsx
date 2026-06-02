
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, User, Phone, Mail, Calendar, Activity, Heart, ArrowUpDown, Eye, Edit, Trash2, LogOut, Check } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from '@/hooks/use-toast';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import * as patientService from '@/services/patientService';
import { Patient } from '@/services/patientService';
import { ModernPatientOverlay } from '@/components/patients/ModernPatientOverlay';
import { DischargeModal } from '@/components/patients/DischargeModal';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';

// ── Design tokens ────────────────────────────────────────────────────────────
const PRIMARY   = STAT_ACCENTS.PRIMARY;
const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'discharged': return 'bg-primary/10 text-primary border-primary/20';
      case 'admitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border text-[11px] pointer-events-none`}>
      {status}
    </Badge>
  );
};

const PatientMobileCard = ({ patient, onClick, onDischarge }: { patient: Patient; onClick?: () => void; onDischarge?: () => void }) => {
  const statusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'discharged': return 'bg-primary/10 text-primary border-primary/20';
      case 'admitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <Badge className={`${statusColor(patient.status)} border pointer-events-none text-xs`}>{patient.status}</Badge>
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
        {/* Mobile discharge action */}
        {onDischarge && patient.status?.toLowerCase() === 'admitted' && (
          <div className="pt-2 mt-2 border-t" style={{ borderColor: BORDER }}>
            <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
              onClick={(e) => { e.stopPropagation(); onDischarge(); }}>
              <LogOut size={12} /> Initiate Discharge
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const Patients = () => {
  const navigate = useNavigate();
  
  // Data state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    admittedPatients: 0,
    dischargedPatients: 0,
    criticalPatients: 0,
    totalDepartments: 0,
    averageAge: 0,
    bloodGroups: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [filterDept, setFilterDept] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'admissionDate' | 'lastVisit'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDischargeOpen, setIsDischargeOpen] = useState(false);
  const [dischargePatient, setDischargePatient] = useState<Patient | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load patients data and stats
  const loadPatients = async () => {
    setIsLoadingData(true);
    try {
      const patientsData = await patientService.fetchPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast({ title: 'Error', description: 'Failed to load patients. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadStats = async () => {
    try {
      const patientStats = await patientService.fetchPatientStats();
      setStats(patientStats);
    } catch (error) {
      console.error('Failed to load patient stats:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadPatients();
    loadStats();
  }, []);

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'patient') {
        handleAddPatient();
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  const statuses = ['All', 'Active', 'Admitted', 'Discharged', 'Critical'];

  const departments = useMemo(() => ['All', ...Array.from(new Set(patients.map(p => p.department).filter(Boolean))).sort()], [patients]);

  const SORT_LABELS: Record<string, string> = {
    name: 'Name', age: 'Age', admissionDate: 'Admission Date', lastVisit: 'Last Visit',
  };

  // Filter + sort logic
  const filteredPatients = useMemo(() => {
    const filtered = patients.filter(patient => {
      const matchesSearch = !searchTerm ||
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || patient.status === selectedStatus;
      const matchesDept = filterDept === 'All' || patient.department === filterDept;
      return matchesSearch && matchesStatus && matchesDept;
    });

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'age') cmp = (a.age ?? 0) - (b.age ?? 0);
      else if (sortBy === 'admissionDate') cmp = (a.admissionDate ?? '').localeCompare(b.admissionDate ?? '');
      else if (sortBy === 'lastVisit') cmp = (a.lastVisit ?? '').localeCompare(b.lastVisit ?? '');
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [patients, searchTerm, selectedStatus, filterDept, sortBy, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const currentPageData = filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditMode(false);
    setIsAddPatientOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditMode(true);
    setIsAddPatientOpen(true);
  };

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setIsEditMode(false);
    setIsAddPatientOpen(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      await patientService.deletePatient(patientId);
      setPatients(patients.filter(p => p.id !== patientId));
      await loadStats();
      toast({ title: 'Patient Deleted', description: 'Patient record has been successfully deleted.', variant: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete patient. Please try again.', variant: 'destructive' });
    }
  };

  const handleSavePatient = async (patientData: Patient) => {
    try {
      if (isEditMode && selectedPatient) {
        await patientService.updatePatient(selectedPatient.id, patientData);
        // Update local state
        setPatients(patients.map(p => 
          p.id === selectedPatient.id ? { ...patientData, id: selectedPatient.id } : p
        ));
      } else {
        const newPatient = await patientService.createPatient(patientData);
        setPatients([...patients, newPatient]);
      }
      await loadStats();
      setIsAddPatientOpen(false);
      setSelectedPatient(null);
    } catch (error) {
      throw error; // Let the overlay handle the error toast
    }
  };

  const handleCloseOverlay = () => {
    setIsAddPatientOpen(false);
    setSelectedPatient(null);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards Section */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Total" value={stats.totalPatients} icon={User} accent={STAT_ACCENTS.PRIMARY}
            active={selectedStatus === 'All'} onClick={() => setSelectedStatus('All')} />
          <StatCard label="Active" value={stats.activePatients} icon={Activity} accent={STAT_ACCENTS.SUCCESS}
            active={selectedStatus === 'Active'} onClick={() => setSelectedStatus(selectedStatus === 'Active' ? 'All' : 'Active')} />
          <StatCard label="Admitted" value={stats.admittedPatients} icon={Heart} accent={STAT_ACCENTS.WARNING}
            active={selectedStatus === 'Admitted'} onClick={() => setSelectedStatus(selectedStatus === 'Admitted' ? 'All' : 'Admitted')} />
          <StatCard label="Critical" value={stats.criticalPatients} icon={Activity} accent={STAT_ACCENTS.DANGER}
            active={selectedStatus === 'Critical'} onClick={() => setSelectedStatus(selectedStatus === 'Critical' ? 'All' : 'Critical')} />
        </div>
      </div>


      {/* Filters Section - Sticky */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3 overflow-hidden">
        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {statuses.map(status => (
                <button key={status}
                  onClick={() => setSelectedStatus(status)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: selectedStatus === status ? PRIMARY : 'transparent',
                    color: selectedStatus === status ? '#fff' : TEXT_MUTE,
                    borderColor: selectedStatus === status ? PRIMARY : BORDER,
                  }}>
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <div className="relative w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input type="search" placeholder="Search patients…"
                className="pl-8 text-xs h-8" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} />
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
              <Input type="search" placeholder="Search patients…"
                className="pl-8 text-xs h-8" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} />
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
              {statuses.map(status => (
                <button key={status}
                  onClick={() => setSelectedStatus(status)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: selectedStatus === status ? PRIMARY : 'transparent',
                    color: selectedStatus === status ? '#fff' : TEXT_MUTE,
                    borderColor: selectedStatus === status ? PRIMARY : BORDER,
                  }}>
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      {isLoadingData ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading patients...</p>
        </div>
      ) : currentPageData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <User className="h-12 w-12 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">No patients found</p>
        </div>
      ) : (
        <MobileTableView
          stickyHeader={true}
          data={currentPageData}
          renderMobileItem={(patient, onView) => <PatientMobileCard patient={patient as Patient} onClick={onView} onDischarge={() => { setDischargePatient(patient as Patient); setIsDischargeOpen(true); }} />}
          columns={[
            {
              key: 'name',
              label: 'Patient',
              width: 'w-[22%]',
              render: (value, patient) => (
                <div>
                  <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{value as string}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>
                    {(patient as any).patientId} · {(patient as any).age}y {(patient as any).gender}
                  </p>
                </div>
              )
            },
            {
              key: 'phone',
              label: 'Contact',
              width: 'w-[18%]',
              render: (value, patient) => (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Phone size={11} style={{ color: TEXT_MUTE }} />
                    <p className="text-[11px]" style={{ color: TEXT_MAIN }}>{value as string}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={11} style={{ color: TEXT_MUTE }} />
                    <p className="text-[11px] truncate max-w-[130px]" style={{ color: TEXT_MUTE }}>{(patient as any).email}</p>
                  </div>
                </div>
              )
            },
            {
              key: 'department',
              label: 'Medical Info',
              width: 'w-[20%]',
              render: (value, patient) => (
                <div>
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full border inline-block"
                    style={{ background: `${PRIMARY}14`, color: PRIMARY, borderColor: `${PRIMARY}33` }}>
                    {value as string}
                  </span>
                  <p className="text-[11px] mt-1" style={{ color: TEXT_MUTE }}>
                    Blood: <span className="font-semibold" style={{ color: TEXT_MAIN }}>{(patient as any).bloodGroup}</span>
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>{(patient as any).doctor}</p>
                </div>
              )
            },
            {
              key: 'status',
              label: 'Status',
              width: 'w-[13%]',
              render: (value) => <StatusBadge status={value as string} />
            },
            {
              key: 'lastVisit',
              label: 'Last Visit',
              width: 'w-[17%]',
              render: (value, patient) => (
                <div>
                  <div className="flex items-center gap-1">
                    <Calendar size={11} style={{ color: TEXT_MUTE }} />
                    <p className="text-sm" style={{ color: TEXT_MAIN }}>{value as string}</p>
                  </div>
                  {(patient as any).admissionDate && (
                    <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>Admitted: {(patient as any).admissionDate}</p>
                  )}
                </div>
              )
            }
          ]}
          onRowClick={(patient) => handleViewPatient(patient)}
          getActions={(patient) => [
            { label: 'View', onClick: () => handleViewPatient(patient), icon: Eye },
            { label: 'Edit', onClick: () => handleEditPatient(patient), icon: Edit },
            { label: 'Discharge', onClick: () => { setDischargePatient(patient); setIsDischargeOpen(true); }, icon: LogOut },
            { label: 'Delete', onClick: () => handleDeletePatient(patient.id), variant: 'destructive' as const, icon: Trash2 }
          ]}
        />
      )}

      {/* Pagination */}
      {!isLoadingData && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
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
                <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      {/* Patient Add/Edit Modal */}
      <ModernPatientOverlay
        isOpen={isAddPatientOpen}
        onClose={handleCloseOverlay}
        patient={selectedPatient}
        isEditMode={isEditMode}
        onSave={handleSavePatient}
      />

      {/* Discharge Process Modal */}
      <DischargeModal
        patient={dischargePatient}
        isOpen={isDischargeOpen}
        onClose={() => { setIsDischargeOpen(false); setDischargePatient(null); }}
      />
    </div>
  );
};
