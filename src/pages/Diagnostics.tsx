import { useState, useEffect, useMemo } from 'react';
import {
  Search, Filter, ArrowUpDown, Calendar, Clock, Activity, TrendingUp,
  Eye, Edit, Trash2, FileText, AlertCircle, FlaskConical, BookOpen,
  ClipboardList, CheckCircle2, Package, Timer, Stethoscope, ChevronRight,
  ArrowUpRight, ReceiptText,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import * as diagnosticService from '@/services/diagnosticService';
import type { PatientDiagnostic, DiagnosticTest } from '@/services/diagnosticService';
import { ModernDiagnosticOverlay } from '@/components/diagnostics/ModernDiagnosticOverlay';
import { DiagnosticFilterModal } from '@/components/diagnostics/DiagnosticFilterModal';
import { DiagnosticsSortModal } from '@/components/diagnostics/DiagnosticsSortModal';
import { countActiveFilters } from '@/lib/filterUtils';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// ── Design tokens ───────────────────────────────────────────────────────────
const PRIMARY   = STAT_ACCENTS.PRIMARY;
const SUCCESS   = STAT_ACCENTS.SUCCESS;
const WARNING   = STAT_ACCENTS.WARNING;
const DANGER    = STAT_ACCENTS.DANGER;
const PURPLE    = STAT_ACCENTS.PURPLE;
const CYAN      = STAT_ACCENTS.CYAN;
const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';

// ── Category colours ─────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Haematology:   { bg: 'hsl(354,70%,50%/0.08)',  text: DANGER,   border: 'hsl(354,70%,50%/0.2)' },
  Biochemistry:  { bg: 'hsl(220,48%,42%/0.08)',  text: PRIMARY,  border: 'hsl(220,48%,42%/0.2)' },
  Microbiology:  { bg: 'hsl(270,60%,50%/0.08)',  text: PURPLE,   border: 'hsl(270,60%,50%/0.2)' },
  Radiology:     { bg: 'hsl(195,70%,42%/0.08)',  text: CYAN,     border: 'hsl(195,70%,42%/0.2)' },
  Cardiology:    { bg: 'hsl(354,70%,50%/0.08)',  text: DANGER,   border: 'hsl(354,70%,50%/0.2)' },
  Pathology:     { bg: 'hsl(33,92%,48%/0.08)',   text: WARNING,  border: 'hsl(33,92%,48%/0.2)'  },
  Other:         { bg: 'hsl(220,12%,54%/0.08)',  text: TEXT_MUTE, border: BORDER },
};

const catStyle = (cat: string) => CAT_COLORS[cat] ?? CAT_COLORS.Other;

// ── Badge helpers ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Completed:   'bg-green-100 text-green-800 border-green-200',
    Scheduled:   'bg-blue-100 text-blue-800 border-blue-200',
    'In Progress': 'bg-amber-100 text-amber-800 border-amber-200',
    Cancelled:   'bg-red-100 text-red-800 border-red-200',
    Pending:     'bg-gray-100 text-gray-700 border-gray-200',
  };
  return <Badge className={`${map[status] ?? 'bg-gray-100 text-gray-700 border-gray-200'} border text-[11px] pointer-events-none`}>{status}</Badge>;
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const map: Record<string, string> = {
    Emergency: 'bg-red-100 text-red-800 border-red-200',
    Urgent:    'bg-orange-100 text-orange-800 border-orange-200',
    Routine:   'bg-primary/10 text-primary border-primary/20',
  };
  return <Badge className={`${map[priority] ?? 'bg-gray-100 text-gray-700 border-gray-200'} border text-[11px] pointer-events-none`}>{priority}</Badge>;
};

const PaymentBadge = ({ status }: { status: 'completed' | 'other' }) =>
  status === 'completed' ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: 'hsl(158,70%,36%/0.1)', color: SUCCESS }}>
      <CheckCircle2 size={10} /> Billed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: 'hsl(33,92%,48%/0.1)', color: WARNING }}>
      <Timer size={10} /> Pending
    </span>
  );

// ── Tab button ────────────────────────────────────────────────────────────────
const Tab = ({ active, icon: Icon, label, count, onClick }: { active: boolean; icon: React.ElementType; label: string; count?: number; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap"
    style={{
      borderBottomColor: active ? PRIMARY : 'transparent',
      color: active ? PRIMARY : TEXT_MUTE,
    }}
  >
    <Icon size={15} />
    {label}
    {count !== undefined && (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5"
        style={{ background: active ? `${PRIMARY}18` : 'hsl(220,14%,94%)', color: active ? PRIMARY : TEXT_MUTE }}>
        {count}
      </span>
    )}
  </button>
);

// ── Test Catalog card ─────────────────────────────────────────────────────────
const TestCard = ({ test, onBook }: { test: DiagnosticTest; onBook: (t: DiagnosticTest) => void }) => {
  const cs = catStyle(test.category);
  return (
    <Card className="shadow hover:shadow-md transition-shadow flex flex-col" style={{ background: 'hsl(0,0%,100%)', borderColor: BORDER }}>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border" style={{ background: cs.bg, color: cs.text, borderColor: cs.border }}>
            {test.category}
          </span>
          <span className="text-sm font-bold" style={{ color: TEXT_MAIN }}>₹{test.price?.toLocaleString('en-IN') ?? '—'}</span>
        </div>
        <h4 className="text-sm font-semibold mb-1 leading-snug" style={{ color: TEXT_MAIN }}>{test.name}</h4>
        <p className="text-xs mb-3 line-clamp-2 flex-1" style={{ color: TEXT_MUTE }}>{test.description || test.preparation || 'No description available.'}</p>
        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: TEXT_MUTE }}>
          <span className="flex items-center gap-1"><Timer size={11} />{test.duration || '—'}</span>
          <span className="flex items-center gap-1"><Stethoscope size={11} />{test.department}</span>
        </div>
        {test.preparation && (
          <p className="text-[11px] p-2 rounded-md mb-3 italic line-clamp-2" style={{ background: 'hsl(220,14%,96%)', color: TEXT_MUTE }}>
            Prep: {test.preparation}
          </p>
        )}
        <Button size="sm" className="w-full text-xs h-7 mt-auto" style={{ background: PRIMARY, color: '#fff' }}
          onClick={() => onBook(test)}>
          Book Test
        </Button>
      </CardContent>
    </Card>
  );
};

// ── Diagnostic booking mobile card (PO-card style) ───────────────────────────
const DiagnosticMobileCard = ({ d, onClick }: { d: PatientDiagnostic; onClick?: () => void }) => {
  const cs = catStyle(d.category);
  return (
    <Card
      className="w-full cursor-pointer active:scale-[0.99] transition-all duration-150 hover:shadow-md"
      style={{ borderColor: BORDER }}
      onClick={onClick}
    >
      <CardContent className="p-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
              <FlaskConical size={15} style={{ color: PRIMARY }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: TEXT_MAIN }}>{d.patientName || '—'}</p>
              <p className="text-xs truncate leading-tight mt-0.5" style={{ color: TEXT_MUTE }}>{d.testName}</p>
            </div>
          </div>
          <StatusBadge status={d.status} />
        </div>

        {/* Key info grid */}
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Category</p>
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full border inline-block" style={{ background: cs.bg, color: cs.text, borderColor: cs.border }}>
              {d.category || '—'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Price</p>
            <p className="text-sm font-bold" style={{ color: TEXT_MAIN }}>₹{d.price?.toLocaleString('en-IN') ?? '—'}</p>
          </div>
        </div>

        {/* Footer: dates + priority */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-1">
            <Calendar size={11} style={{ color: TEXT_MUTE }} />
            <span className="text-xs" style={{ color: TEXT_MUTE }}>{d.orderedDate || '—'}</span>
            {d.scheduledDate && <><span className="text-xs" style={{ color: TEXT_MUTE }}>→</span><span className="text-xs" style={{ color: TEXT_MUTE }}>{d.scheduledDate}</span></>}
          </div>
          <PriorityBadge priority={d.priority} />
        </div>
      </CardContent>
    </Card>
  );
};

// ── Result mobile card ────────────────────────────────────────────────────────
const ResultMobileCard = ({ d, onClick }: { d: PatientDiagnostic; onClick?: () => void }) => {
  const cs = catStyle(d.category);
  return (
    <Card
      className="w-full cursor-pointer active:scale-[0.99] transition-all duration-150 hover:shadow-md"
      style={{ borderColor: BORDER }}
      onClick={onClick}
    >
      <CardContent className="p-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${SUCCESS}15` }}>
              <CheckCircle2 size={15} style={{ color: SUCCESS }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: TEXT_MAIN }}>{d.patientName || '—'}</p>
              <p className="text-xs truncate leading-tight mt-0.5" style={{ color: TEXT_MUTE }}>{d.testName}</p>
            </div>
          </div>
          {d.results ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: `${SUCCESS}15`, color: SUCCESS }}>
              <FileText size={10} /> Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: `${WARNING}15`, color: WARNING }}>
              <Clock size={10} /> Pending
            </span>
          )}
        </div>

        {/* Key info grid */}
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Category</p>
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full border inline-block" style={{ background: cs.bg, color: cs.text, borderColor: cs.border }}>
              {d.category || '—'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Price</p>
            <p className="text-sm font-bold" style={{ color: TEXT_MAIN }}>₹{d.price?.toLocaleString('en-IN') ?? '—'}</p>
          </div>
        </div>

        {/* Footer: completed date + priority */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-1">
            <CheckCircle2 size={11} style={{ color: SUCCESS }} />
            <span className="text-xs" style={{ color: TEXT_MUTE }}>{d.completedDate || d.scheduledDate || '—'}</span>
          </div>
          <PriorityBadge priority={d.priority} />
        </div>
      </CardContent>
    </Card>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
type TabId = 'bookings' | 'catalog' | 'results';

export const Diagnostics = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabId>('bookings');

  // ── Data state ──────────────────────────────────────────────────────────────
  const [diagnostics, setDiagnostics] = useState<PatientDiagnostic[]>([]);
  const [catalogTests, setCatalogTests] = useState<DiagnosticTest[]>([]);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, inProgress: 0, completed: 0, urgent: 0, emergency: 0 });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCat, setCatalogCat] = useState('All');
  const [resultsSearch, setResultsSearch] = useState('');
  const [resultsCategory, setResultsCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  const [sortConfig, setSortConfig] = useState({ field: 'orderedDate', direction: 'desc' as 'asc' | 'desc' });
  const [isBookTestOpen, setIsBookTestOpen] = useState(false);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<PatientDiagnostic | null>(null);
  const [preselectedTest, setPreselectedTest] = useState<DiagnosticTest | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isResultsFilterModalOpen, setIsResultsFilterModalOpen] = useState(false);
  const [isResultsSortModalOpen, setIsResultsSortModalOpen] = useState(false);
  const [resultsSortConfig, setResultsSortConfig] = useState({ field: '', direction: 'desc' as 'asc' | 'desc' });
  const [isCatalogSortModalOpen, setIsCatalogSortModalOpen] = useState(false);
  const [catalogSortConfig, setCatalogSortConfig] = useState({ field: '', direction: 'asc' as 'asc' | 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ── Load data ───────────────────────────────────────────────────────────────
  const loadDiagnostics = async () => {
    setIsLoadingData(true);
    try {
      const data = await diagnosticService.fetchAllPatientDiagnostics();
      setDiagnostics(data);
      setStats({
        total: data.length,
        scheduled: data.filter(d => d.status === 'Scheduled').length,
        inProgress: data.filter(d => d.status === 'In Progress').length,
        completed: data.filter(d => d.status === 'Completed').length,
        urgent: data.filter(d => d.priority === 'Urgent').length,
        emergency: data.filter(d => d.priority === 'Emergency').length,
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to load diagnostics.', variant: 'destructive' });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadCatalog = async () => {
    if (catalogTests.length > 0) return;
    setIsLoadingCatalog(true);
    try {
      const data = await diagnosticService.fetchDiagnosticTests();
      setCatalogTests(data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load test catalog.', variant: 'destructive' });
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
    window.addEventListener('openCreateModal', (e: any) => {
      if (e.detail?.type === 'diagnostic') openBooking();
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'catalog') loadCatalog();
  }, [activeTab]);

  // ── Filters & sorting (Bookings tab) ────────────────────────────────────────
  const activeFilterCount = useMemo(() => countActiveFilters(selectedFilters), [selectedFilters]);
  const hasFilters = activeFilterCount > 0;
  const hasSort = sortConfig.field !== 'orderedDate' || sortConfig.direction !== 'desc';

  const filteredBookings = useMemo(() => diagnostics.filter(d => {
    if (selectedStatus !== 'All' && d.status !== selectedStatus) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!(d.patientName || '').toLowerCase().includes(s) && !(d.testName || '').toLowerCase().includes(s) &&
          !(d.category || '').toLowerCase().includes(s) && !(d.orderedBy || '').toLowerCase().includes(s)) return false;
    }
    return true;
  }), [diagnostics, selectedStatus, searchTerm]);

  const sortedBookings = useMemo(() => [...filteredBookings].sort((a, b) => {
    const f = sortConfig.field as keyof PatientDiagnostic;
    const av = a[f] ?? ''; const bv = b[f] ?? '';
    if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
    if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  }), [filteredBookings, sortConfig]);

  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const paginatedBookings = useMemo(() => {
    const s = (currentPage - 1) * itemsPerPage;
    return sortedBookings.slice(s, s + itemsPerPage);
  }, [sortedBookings, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedStatus, selectedFilters, sortConfig]);

  // ── Catalog filters ──────────────────────────────────────────────────────────
  const catalogCategories = useMemo(() => ['All', ...Array.from(new Set(catalogTests.map(t => t.category)))], [catalogTests]);
  const filteredCatalog = useMemo(() => {
    const filtered = catalogTests.filter(t => {
      if (catalogCat !== 'All' && t.category !== catalogCat) return false;
      if (catalogSearch) {
        const s = catalogSearch.toLowerCase();
        if (!t.name.toLowerCase().includes(s) && !t.department.toLowerCase().includes(s)) return false;
      }
      return true;
    });
    if (!catalogSortConfig.field) return filtered;
    return [...filtered].sort((a, b) => {
      const f = catalogSortConfig.field as keyof DiagnosticTest;
      const av = a[f] ?? ''; const bv = b[f] ?? '';
      if (av < bv) return catalogSortConfig.direction === 'asc' ? -1 : 1;
      if (av > bv) return catalogSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [catalogTests, catalogCat, catalogSearch, catalogSortConfig]);

  // ── Results (completed bookings) ─────────────────────────────────────────────
  const results = useMemo(() => diagnostics.filter(d => d.status === 'Completed'), [diagnostics]);
  const resultsCategories = useMemo(() => ['All', ...Array.from(new Set(results.map(d => d.category).filter(Boolean)))], [results]);
  const filteredResults = useMemo(() => results.filter(d => {
    if (resultsCategory !== 'All' && d.category !== resultsCategory) return false;
    if (resultsSearch) {
      const s = resultsSearch.toLowerCase();
      if (!(d.patientName || '').toLowerCase().includes(s) && !(d.testName || '').toLowerCase().includes(s)) return false;
    }
    return true;
  }), [results, resultsCategory, resultsSearch]);

  const sortedResults = useMemo(() => {
    if (!resultsSortConfig.field) return filteredResults;
    return [...filteredResults].sort((a, b) => {
      const f = resultsSortConfig.field as keyof PatientDiagnostic;
      const av = a[f] ?? ''; const bv = b[f] ?? '';
      if (av < bv) return resultsSortConfig.direction === 'asc' ? -1 : 1;
      if (av > bv) return resultsSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredResults, resultsSortConfig]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const openBooking = (test?: DiagnosticTest) => {
    setIsBookTestOpen(true);
    setIsEditMode(false);
    setSelectedDiagnostic(null);
    setPreselectedTest(test ?? null);
  };

  const handleSave = async (diagnostic: any) => {
    try {
      if (isEditMode && selectedDiagnostic) {
        await diagnosticService.updatePatientDiagnostic(selectedDiagnostic.id, diagnostic);
        toast({ title: 'Success', description: 'Test updated.', variant: 'success' });
      } else {
        await diagnosticService.bookDiagnosticTest(diagnostic);
        toast({ title: 'Success', description: 'Test booked.', variant: 'success' });
      }
      await loadDiagnostics();
      setIsBookTestOpen(false); setSelectedDiagnostic(null); setIsEditMode(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to save.', variant: 'destructive' });
    }
  };

  const [cancelTarget, setCancelTarget] = useState<PatientDiagnostic | null>(null);

  const handleDelete = async (d: PatientDiagnostic) => {
    try {
      await diagnosticService.cancelDiagnosticTest(d.id);
      await loadDiagnostics();
      toast({ title: 'Cancelled', description: 'Test cancelled.', variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel.', variant: 'destructive' });
    }
  };

  // ── Status filter chips ───────────────────────────────────────────────────────
  const statuses = ['All', 'Scheduled', 'In Progress', 'Completed', 'Pending', 'Cancelled'];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Stat strip ───────────────────────────────────────────────────────── */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Total" value={stats.total} icon={FileText} accent={PRIMARY}
            active={selectedStatus === 'All' && activeTab === 'bookings'}
            onClick={() => { setSelectedStatus('All'); setActiveTab('bookings'); }} />
          <StatCard label="Scheduled" value={stats.scheduled} icon={Calendar} accent={CYAN}
            active={selectedStatus === 'Scheduled' && activeTab === 'bookings'}
            onClick={() => { setSelectedStatus('Scheduled'); setActiveTab('bookings'); }} />
          <StatCard label="In Progress" value={stats.inProgress} icon={Activity} accent={WARNING}
            active={selectedStatus === 'In Progress' && activeTab === 'bookings'}
            onClick={() => { setSelectedStatus('In Progress'); setActiveTab('bookings'); }} />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} accent={SUCCESS}
            active={activeTab === 'results'}
            onClick={() => setActiveTab('results')} />
          <StatCard label="Urgent" value={stats.urgent + stats.emergency} icon={AlertCircle} accent={DANGER}
            active={false} onClick={() => { setSelectedStatus('All'); setActiveTab('bookings'); }} />
        </div>
      </div>

      {/* ── Tabs — mobile segmented control ──────────────────────────────────── */}
      <div className="md:hidden">
        <div className="flex w-full rounded-xl p-1 gap-1" style={{ background: 'hsl(220,14%,94%)' }}>
          {([
            { id: 'bookings', icon: ClipboardList, label: 'Bookings', count: diagnostics.length },
            { id: 'catalog',  icon: BookOpen,      label: 'Catalog',  count: catalogTests.length || undefined },
            { id: 'results',  icon: TrendingUp,    label: 'Results',  count: results.length },
          ] as const).map(({ id, icon: Icon, label, count }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className="flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-[10px] font-semibold transition-all"
                style={{
                  background: active ? 'hsl(0,0%,100%)' : 'transparent',
                  color: active ? PRIMARY : TEXT_MUTE,
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}>
                <Icon size={16} />
                <span>{label}</span>
                {count !== undefined && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: active ? `${PRIMARY}18` : 'hsl(220,14%,88%)', color: active ? PRIMARY : TEXT_MUTE }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tabs — desktop underline ──────────────────────────────────────────── */}
      <div className="hidden md:block border-b" style={{ borderColor: BORDER }}>
        <div className="flex gap-0">
          <Tab active={activeTab === 'bookings'} icon={ClipboardList} label="Bookings"
            count={diagnostics.length} onClick={() => setActiveTab('bookings')} />
          <Tab active={activeTab === 'catalog'} icon={BookOpen} label="Test Catalog"
            count={catalogTests.length || undefined} onClick={() => setActiveTab('catalog')} />
          <Tab active={activeTab === 'results'} icon={TrendingUp} label="Results"
            count={results.length} onClick={() => setActiveTab('results')} />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 1 — BOOKINGS
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3 overflow-hidden">
          {/* Filter bar — desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
              <div className="flex gap-1.5 w-max">
                {statuses.map(s => (
                  <button key={s}
                    onClick={() => setSelectedStatus(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                    style={{
                      background: selectedStatus === s ? PRIMARY : 'transparent',
                      color: selectedStatus === s ? '#fff' : TEXT_MUTE,
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
                <Input type="search" placeholder="Search tests, patients…"
                  className="pl-8 text-xs h-8" value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                style={hasFilters ? { background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` } : {}}
                onClick={() => setIsFilterModalOpen(true)}>
                <Filter size={13} /> Filters
                {hasFilters && <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full" style={{ background: PRIMARY, color: '#fff' }}>{activeFilterCount}</span>}
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                style={hasSort ? { background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` } : {}}
                onClick={() => setIsSortModalOpen(true)}>
                <ArrowUpDown size={13} /> Sort
              </Button>
            </div>
          </div>

          {/* Filter bar — mobile */}
          <div className="lg:hidden space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input type="search" placeholder="Search tests, patients…"
                  className="pl-8 text-xs h-8" value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                style={hasFilters ? { background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` } : {}}
                onClick={() => setIsFilterModalOpen(true)}>
                <Filter size={13} />
                <span className="hidden sm:inline">Filters</span>
                {hasFilters && <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full" style={{ background: PRIMARY, color: '#fff' }}>{activeFilterCount}</span>}
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                style={hasSort ? { background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` } : {}}
                onClick={() => setIsSortModalOpen(true)}>
                <ArrowUpDown size={13} />
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </div>
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
              <div className="flex gap-1.5 w-max">
                {statuses.map(s => (
                  <button key={s}
                    onClick={() => setSelectedStatus(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                    style={{
                      background: selectedStatus === s ? PRIMARY : 'transparent',
                      color: selectedStatus === s ? '#fff' : TEXT_MUTE,
                      borderColor: selectedStatus === s ? PRIMARY : BORDER,
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>{/* /sticky */}

          {/* Table */}
          {isLoadingData ? (
            <Card className="border-0 shadow-sm">
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="animate-spin rounded-full h-9 w-9 border-b-2" style={{ borderColor: PRIMARY }} />
                <p className="text-sm" style={{ color: TEXT_MUTE }}>Loading bookings…</p>
              </div>
            </Card>
          ) : paginatedBookings.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <FlaskConical size={36} style={{ color: 'hsl(220,13%,80%)' }} />
                <p className="text-sm" style={{ color: TEXT_MUTE }}>No diagnostics found</p>
                <Button size="sm" className="mt-2 text-xs" style={{ background: PRIMARY }} onClick={() => openBooking()}>
                  Book First Test
                </Button>
              </div>
            </Card>
          ) : (
            <MobileTableView
              stickyHeader={true}
              data={paginatedBookings}
              renderMobileItem={(d, onView) => (
                <DiagnosticMobileCard d={d as PatientDiagnostic} onClick={onView} />
              )}
              columns={[
                {
                  key: 'patientName',
                  label: 'Patient',
                  width: 'w-[18%]',
                  render: (value, d) => (
                    <div>
                      <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{value || '—'}</p>
                      <p className="text-[11px]" style={{ color: TEXT_MUTE }}>{d.orderedDate}</p>
                    </div>
                  ),
                },
                {
                  key: 'testName',
                  label: 'Test',
                  width: 'w-[20%]',
                  render: (value, d) => (
                    <div>
                      <p className="text-sm font-medium" style={{ color: TEXT_MAIN }}>{value}</p>
                      {d.orderedBy && <p className="text-[11px]" style={{ color: TEXT_MUTE }}>{d.orderedBy.startsWith('Dr.') ? d.orderedBy.slice(0, 14) : `Dr. ${d.orderedBy.slice(0, 10)}`}…</p>}
                    </div>
                  ),
                },
                {
                  key: 'category',
                  label: 'Category',
                  width: 'w-[13%]',
                  render: (value) => {
                    const cs = catStyle(value);
                    return <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full border" style={{ background: cs.bg, color: cs.text, borderColor: cs.border }}>{value}</span>;
                  },
                },
                {
                  key: 'scheduledDate',
                  label: 'Scheduled',
                  width: 'w-[12%]',
                  render: (value) => value
                    ? <div className="flex items-center gap-1 text-sm" style={{ color: TEXT_MUTE }}><Calendar size={12} />{value}</div>
                    : <span className="text-xs" style={{ color: TEXT_MUTE }}>Not set</span>,
                },
                {
                  key: 'priority',
                  label: 'Priority',
                  width: 'w-[8%]',
                  render: (value) => <PriorityBadge priority={value} />,
                },
                {
                  key: 'status',
                  label: 'Status',
                  width: 'w-[9%]',
                  render: (value) => <StatusBadge status={value} />,
                },
                {
                  key: 'price',
                  label: 'Price',
                  width: 'w-[8%]',
                  render: (value, d) => (
                    <div>
                      <span className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>₹{value?.toLocaleString('en-IN') ?? '—'}</span>
                      <div className="mt-0.5"><PaymentBadge status={d.status === 'Completed' ? 'completed' : 'other'} /></div>
                    </div>
                  ),
                },
              ]}
              getTitle={(d) => d.patientName || '—'}
              getSubtitle={(d) => `${d.testName}${d.category ? ` · ${d.category}` : ''}`}
              getStatus={(d) => d.status}
              getStatusColor={(d) => {
                const map: Record<string, string> = {
                  Completed: 'text-green-700', Scheduled: 'text-blue-700',
                  'In Progress': 'text-amber-700', Cancelled: 'text-red-700', Pending: 'text-gray-600',
                };
                return map[d.status] ?? 'text-gray-600';
              }}
              onRowClick={(d) => { setSelectedDiagnostic(d); setIsBookTestOpen(true); setIsEditMode(false); }}
              getActions={(d) => [
                { label: 'View', icon: Eye, onClick: () => { setSelectedDiagnostic(d); setIsBookTestOpen(true); setIsEditMode(false); }, variant: 'outline' as const },
                { label: 'Edit', icon: Edit, onClick: () => { setSelectedDiagnostic(d); setIsBookTestOpen(true); setIsEditMode(true); }, variant: 'outline' as const },
                { label: 'Cancel', icon: Trash2, onClick: () => setCancelTarget(d), variant: 'destructive' as const },
              ]}
            />
          )}

          {/* Pagination */}
          {!isLoadingData && totalPages > 1 && (
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
                        <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
                          {page}
                        </PaginationLink>
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
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 2 — TEST CATALOG
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Catalog filter bar */}
          <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3 overflow-hidden">
          {/* Catalog filter bar — desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
              <div className="flex gap-1.5 w-max">
                {catalogCategories.map(c => (
                  <button key={c} onClick={() => setCatalogCat(c)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                    style={{
                      background: catalogCat === c ? PRIMARY : 'transparent',
                      color: catalogCat === c ? '#fff' : TEXT_MUTE,
                      borderColor: catalogCat === c ? PRIMARY : BORDER,
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <div className="relative w-60">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input type="search" placeholder="Search tests…" className="pl-8 text-xs h-8"
                  value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                style={catalogSortConfig.field ? { background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` } : {}}
                onClick={() => setIsCatalogSortModalOpen(true)}>
                <ArrowUpDown size={13} /> Sort
              </Button>
            </div>
          </div>

          {/* Catalog filter bar — mobile */}
          <div className="lg:hidden space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input type="search" placeholder="Search tests…" className="pl-8 text-xs h-8 w-full"
                  value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                style={catalogSortConfig.field ? { background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` } : {}}
                onClick={() => setIsCatalogSortModalOpen(true)}>
                <ArrowUpDown size={13} />
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </div>
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
              <div className="flex gap-1.5 w-max">
                {catalogCategories.map(c => (
                  <button key={c} onClick={() => setCatalogCat(c)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                    style={{
                      background: catalogCat === c ? PRIMARY : 'transparent',
                      color: catalogCat === c ? '#fff' : TEXT_MUTE,
                      borderColor: catalogCat === c ? PRIMARY : BORDER,
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>{/* /sticky */}

          {isLoadingCatalog ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-9 w-9 border-b-2" style={{ borderColor: PRIMARY }} />
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Package size={36} style={{ color: 'hsl(220,13%,80%)' }} />
              <p className="text-sm" style={{ color: TEXT_MUTE }}>No tests found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCatalog.map(test => (
                <TestCard key={test.id} test={test} onBook={t => { openBooking(t); setActiveTab('bookings'); }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          TAB 3 — RESULTS
          ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {/* Results filter bar */}
          <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3 overflow-hidden">
          {/* Results filter bar — desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
              <div className="flex gap-1.5 w-max">
                {resultsCategories.map(c => (
                  <button key={c} onClick={() => setResultsCategory(c)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                    style={{
                      background: resultsCategory === c ? PRIMARY : 'transparent',
                      color: resultsCategory === c ? '#fff' : TEXT_MUTE,
                      borderColor: resultsCategory === c ? PRIMARY : BORDER,
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <div className="relative w-60">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input type="search" placeholder="Search results…" className="pl-8 text-xs h-8"
                  value={resultsSearch} onChange={e => setResultsSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                style={isResultsFilterModalOpen || Object.keys(selectedFilters).length > 0 ? { background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` } : {}}
                onClick={() => setIsResultsFilterModalOpen(true)}>
                <Filter size={13} /> Filter
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                style={resultsSortConfig.field ? { background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` } : {}}
                onClick={() => setIsResultsSortModalOpen(true)}>
                <ArrowUpDown size={13} /> Sort
              </Button>
            </div>
          </div>

          {/* Results filter bar — mobile */}
          <div className="lg:hidden space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input type="search" placeholder="Search results…" className="pl-8 text-xs h-8 w-full"
                  value={resultsSearch} onChange={e => setResultsSearch(e.target.value)} />
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                onClick={() => setIsResultsFilterModalOpen(true)}>
                <Filter size={13} />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
                style={resultsSortConfig.field ? { background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` } : {}}
                onClick={() => setIsResultsSortModalOpen(true)}>
                <ArrowUpDown size={13} />
                <span className="hidden sm:inline">Sort</span>
              </Button>
            </div>
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
              <div className="flex gap-1.5 w-max">
                {resultsCategories.map(c => (
                  <button key={c} onClick={() => setResultsCategory(c)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                    style={{
                      background: resultsCategory === c ? PRIMARY : 'transparent',
                      color: resultsCategory === c ? '#fff' : TEXT_MUTE,
                      borderColor: resultsCategory === c ? PRIMARY : BORDER,
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </div>{/* /sticky */}

          {isLoadingData ? (
            <Card className="border-0 shadow-sm">
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-9 w-9 border-b-2" style={{ borderColor: PRIMARY }} />
              </div>
            </Card>
          ) : sortedResults.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <TrendingUp size={36} style={{ color: 'hsl(220,13%,80%)' }} />
                <p className="text-sm" style={{ color: TEXT_MUTE }}>No completed tests yet</p>
              </div>
            </Card>
          ) : (
            <MobileTableView
              stickyHeader={true}
              data={sortedResults}
              renderMobileItem={(d, onView) => (
                <ResultMobileCard d={d as PatientDiagnostic} onClick={onView} />
              )}
              columns={[
                {
                  key: 'patientName',
                  label: 'Patient',
                  width: 'w-[20%]',
                  render: (value, d) => (
                    <div>
                      <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{value || '—'}</p>
                      <p className="text-[11px]" style={{ color: TEXT_MUTE }}>{(d as PatientDiagnostic).orderedDate}</p>
                    </div>
                  ),
                },
                {
                  key: 'testName',
                  label: 'Test',
                  width: 'w-[22%]',
                  render: (value) => <p className="text-sm font-medium" style={{ color: TEXT_MAIN }}>{value}</p>,
                },
                {
                  key: 'category',
                  label: 'Category',
                  width: 'w-[13%]',
                  render: (value) => {
                    const cs = catStyle(value);
                    return <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full border" style={{ background: cs.bg, color: cs.text, borderColor: cs.border }}>{value}</span>;
                  },
                },
                {
                  key: 'completedDate',
                  label: 'Completed',
                  width: 'w-[12%]',
                  render: (value, d) => (
                    <div className="flex items-center gap-1 text-sm" style={{ color: TEXT_MUTE }}>
                      <CheckCircle2 size={12} style={{ color: SUCCESS }} />
                      {value || (d as PatientDiagnostic).scheduledDate || '—'}
                    </div>
                  ),
                },
                {
                  key: 'priority',
                  label: 'Priority',
                  width: 'w-[8%]',
                  render: (value) => <PriorityBadge priority={value} />,
                },
                {
                  key: 'price',
                  label: 'Price',
                  width: 'w-[8%]',
                  render: (value) => <span className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>₹{value?.toLocaleString('en-IN') ?? '—'}</span>,
                },
                {
                  key: 'results',
                  label: 'Report',
                  width: 'w-[12%]',
                  render: (value) => value ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${SUCCESS}15`, color: SUCCESS }}>
                      <FileText size={10} /> Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: `${WARNING}15`, color: WARNING }}>
                      <Clock size={10} /> Pending
                    </span>
                  ),
                },
              ]}
              onRowClick={(d) => { setSelectedDiagnostic(d as PatientDiagnostic); setIsBookTestOpen(true); setIsEditMode(false); }}
              getActions={(d) => [
                { label: 'View', icon: Eye, onClick: () => { setSelectedDiagnostic(d as PatientDiagnostic); setIsBookTestOpen(true); setIsEditMode(false); }, variant: 'outline' as const },
              ]}
            />
          )}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {isBookTestOpen && (
        <ModernDiagnosticOverlay
          isOpen={isBookTestOpen}
          onClose={() => { setIsBookTestOpen(false); setSelectedDiagnostic(null); setIsEditMode(false); setPreselectedTest(null); }}
          onSave={handleSave}
          diagnostic={selectedDiagnostic}
          isEditMode={isEditMode}
          preselectedTest={preselectedTest}
        />
      )}
      <DiagnosticFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={(f: any) => { setSelectedFilters(f); setIsFilterModalOpen(false); }}
        statuses={['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']}
        categories={['Haematology', 'Biochemistry', 'Microbiology', 'Radiology', 'Cardiology', 'Pathology']}
        priorities={['routine', 'urgent', 'emergency']}
      />
      <DiagnosticsSortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={(s: any) => { setSortConfig(s); setIsSortModalOpen(false); }}
        currentSort={sortConfig}
      />
      <DiagnosticFilterModal
        isOpen={isResultsFilterModalOpen}
        onClose={() => setIsResultsFilterModalOpen(false)}
        onApplyFilters={(f: any) => { setSelectedFilters(f); setIsResultsFilterModalOpen(false); }}
        statuses={['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']}
        categories={['Haematology', 'Biochemistry', 'Microbiology', 'Radiology', 'Cardiology', 'Pathology']}
        priorities={['routine', 'urgent', 'emergency']}
      />
      <DiagnosticsSortModal
        isOpen={isResultsSortModalOpen}
        onClose={() => setIsResultsSortModalOpen(false)}
        onApplySort={(s: any) => { setResultsSortConfig(s); setIsResultsSortModalOpen(false); }}
        currentSort={resultsSortConfig}
      />
      <DiagnosticsSortModal
        isOpen={isCatalogSortModalOpen}
        onClose={() => setIsCatalogSortModalOpen(false)}
        onApplySort={(s: any) => { setCatalogSortConfig(s); setIsCatalogSortModalOpen(false); }}
        currentSort={catalogSortConfig}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => { if (!open) setCancelTarget(null); }}
        title="Cancel diagnostic test?"
        description={`This will cancel the diagnostic test${cancelTarget?.testName ? ` "${cancelTarget.testName}"` : ''}. This action cannot be undone.`}
        confirmLabel="Cancel Test"
        variant="destructive"
        onConfirm={() => cancelTarget && handleDelete(cancelTarget)}
      />
    </div>
  );
};
