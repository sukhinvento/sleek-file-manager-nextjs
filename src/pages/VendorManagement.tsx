import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Building2, 
  TrendingUp, 
  CreditCard, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import { VendorFilterModal } from '@/components/vendor/VendorFilterModal';
import { VendorSortModal } from '@/components/vendor/VendorSortModal';
import { ModernVendorOverlay } from '@/components/vendor/ModernVendorOverlay';
import { Vendor } from '@/types/inventory';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from '@/hooks/use-toast';
import { formatIndianCurrency, formatIndianQuantity } from '@/lib/utils';
import { countActiveFilters } from '@/lib/filterUtils';
import * as vendorService from '@/services/vendorService';
import type { VendorFilterParams } from '@/services/vendorService';
import { VendorWithRisk } from '@/services/vendorService';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// ── Design tokens ────────────────────────────────────────────────────────────
const PRIMARY   = STAT_ACCENTS.PRIMARY;
const SUCCESS   = STAT_ACCENTS.SUCCESS;
const WARNING   = STAT_ACCENTS.WARNING;
const DANGER    = STAT_ACCENTS.DANGER;
const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border text-[11px] pointer-events-none`}>
      {status}
    </Badge>
  );
};

const RiskBadge = ({ level }: { level: string }) => {
  const getStatusColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusColor(level)} text-[11px] pointer-events-none`}>
      {level} Risk
    </Badge>
  );
};

const VendorMobileCard = ({ vendor, onClick }: { vendor: VendorWithRisk; onClick?: () => void }) => {
  return (
    <Card className="w-full cursor-pointer active:scale-[0.99] transition-all duration-150 hover:shadow-md" style={{ borderColor: BORDER }} onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
              <Building2 size={15} style={{ color: PRIMARY }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: TEXT_MAIN }}>{vendor.name}</p>
              <p className="text-xs truncate leading-tight mt-0.5" style={{ color: TEXT_MUTE }}>{vendor.vendorId}{vendor.city ? ` • ${vendor.city}${vendor.state ? `, ${vendor.state}` : ''}` : ''}</p>
            </div>
          </div>
          <StatusBadge status={vendor.status} />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Category</p>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs pointer-events-none">{vendor.category}</Badge>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Outstanding</p>
            <p className="text-sm font-bold" style={{ color: vendor.outstandingBalance > 0 ? 'hsl(0,72%,51%)' : PRIMARY }}>{formatIndianCurrency(vendor.outstandingBalance)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-1">
            <Phone size={11} style={{ color: TEXT_MUTE }} />
            <span className="text-xs" style={{ color: TEXT_MUTE }}>{vendor.phone || '—'}</span>
          </div>
          <RiskBadge level={vendor.riskLevel} />
        </div>
      </CardContent>
    </Card>
  );
};

export const VendorManagement = () => {
  
  // Data state
  const [vendors, setVendors] = useState<VendorWithRisk[]>([]);
  const [stats, setStats] = useState({
    totalVendors: 0,
    activeVendors: 0,
    totalValue: 0,
    outstandingBalance: 0,
    averageOrderValue: 0,
    highRiskVendors: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  
  // Modal states
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorWithRisk | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter states
  const [selectedFilters, setSelectedFilters] = useState({
    vendorId: '',
    contactPerson: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    category: '',
    status: '',
    paymentTerms: '',
    registrationDateRange: undefined,
    creditLimitRange: { min: '', max: '' },
    outstandingBalanceRange: { min: '', max: '' }
  });
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({ field: 'name', direction: 'asc' });

  // Build backend filter query from frontend filters
  const buildBackendFilter = useMemo(() => {
    const filter: Record<string, any> = {};
    
    // Status filter
    if (selectedStatus !== 'All') {
      filter['custom_status'] = selectedStatus;
    }
    
    // Risk filter
    if (selectedRisk !== 'All') {
      filter['custom_riskLevel'] = selectedRisk;
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filter['custom_category'] = selectedCategory;
    }
    
    // Advanced filters from filter modal
    if (selectedFilters.vendorId) {
      filter['vendorCode'] = { regex: selectedFilters.vendorId, options: 'i' };
    }
    
    if (selectedFilters.contactPerson) {
      filter['contactPersons'] = { regex: selectedFilters.contactPerson, options: 'i' };
    }
    
    if (selectedFilters.phone) {
      filter['custom_phone'] = { regex: selectedFilters.phone, options: 'i' };
    }
    
    if (selectedFilters.email) {
      filter['custom_email'] = { regex: selectedFilters.email, options: 'i' };
    }
    
    if (selectedFilters.city) {
      filter['custom_city'] = { regex: selectedFilters.city, options: 'i' };
    }
    
    if (selectedFilters.state) {
      filter['custom_state'] = { regex: selectedFilters.state, options: 'i' };
    }
    
    if (selectedFilters.category && selectedFilters.category !== 'All') {
      filter['custom_category'] = selectedFilters.category;
    }
    
    if (selectedFilters.status && selectedFilters.status !== 'All') {
      filter['custom_status'] = selectedFilters.status;
    }
    
    if (selectedFilters.paymentTerms) {
      filter['paymentTerms'] = { regex: selectedFilters.paymentTerms, options: 'i' };
    }
    
    if (selectedFilters.registrationDateRange?.from) {
      filter['createdAt'] = { gte: selectedFilters.registrationDateRange.from.toISOString() };
      if (selectedFilters.registrationDateRange.to) {
        filter['createdAt'] = {
          ...filter['createdAt'],
          lte: selectedFilters.registrationDateRange.to.toISOString()
        };
      }
    }
    
    if (selectedFilters.creditLimitRange?.min) {
      filter['custom_creditLimit'] = { gte: Number(selectedFilters.creditLimitRange.min) };
      if (selectedFilters.creditLimitRange.max) {
        filter['custom_creditLimit'] = {
          ...filter['custom_creditLimit'],
          lte: Number(selectedFilters.creditLimitRange.max)
        };
      }
    }
    
    if (selectedFilters.outstandingBalanceRange?.min) {
      filter['custom_outstandingBalance'] = { gte: Number(selectedFilters.outstandingBalanceRange.min) };
      if (selectedFilters.outstandingBalanceRange.max) {
        filter['custom_outstandingBalance'] = {
          ...filter['custom_outstandingBalance'],
          lte: Number(selectedFilters.outstandingBalanceRange.max)
        };
      }
    }
    
    return filter;
  }, [selectedStatus, selectedCategory, selectedRisk, selectedFilters]);

  // Build sort string for backend
  const buildSortString = useMemo(() => {
    return `${sortConfig.field}_${sortConfig.direction}`;
  }, [sortConfig]);

  // Load vendors from service with backend filtering
  const loadVendors = useCallback(async () => {
    try {
      setIsLoadingData(true);
      
      const filterParams: vendorService.VendorFilterParams = {
        page: currentPage,
        limit: itemsPerPage,
        sort: buildSortString,
        filter: buildBackendFilter,
      };
      
      // Add search term to filter if provided
      if (searchTerm && searchTerm.trim()) {
        filterParams.filter = {
          ...buildBackendFilter,
          name: { regex: searchTerm.trim(), options: 'i' }
        };
      } else {
        filterParams.filter = buildBackendFilter;
      }
      
      const result = await vendorService.fetchVendors(filterParams);
      setVendors(result.vendors || []);
      
      // Update pagination info if available
      if (result.total !== undefined) {
        // Store total for pagination
      }
    } catch (error: any) {
      console.error('Error loading vendors:', error);
      toast({ title: 'Error', description: error?.message || 'Failed to load vendors. Please try again.', variant: 'destructive' });
      // Set empty vendors array on error to prevent blank page
      setVendors([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentPage, itemsPerPage, buildSortString, buildBackendFilter, searchTerm]);

  // Load stats from service
  const loadStats = async () => {
    try {
      const statsData = await vendorService.fetchVendorStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load data on mount and when filters/sort change
  useEffect(() => {
    loadVendors();
  }, [loadVendors]);
  
  useEffect(() => {
    loadStats();
  }, []);

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'vendor') {
        setIsAddVendorOpen(true);
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  // Get unique values for filters (will be fetched from backend or cached)
  const statuses = ['All', 'Active', 'Inactive', 'Pending'];
  const categories = ['All']; // Will be populated from backend or user selection

  // Count active filters
  const activeFilterCount = useMemo(() => countActiveFilters(selectedFilters), [selectedFilters]);
  const hasFilters = activeFilterCount > 0 || selectedStatus !== 'All' || selectedCategory !== 'All';
  const hasSort = sortConfig.field !== 'name' || sortConfig.direction !== 'asc';

  // Vendors are already filtered by backend, so use them directly
  const filteredVendors = vendors;
  
  // Pagination logic - backend handles pagination
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage) || 1;
  const currentPageData = filteredVendors; // Backend already returns paginated results

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedCategory, selectedRisk, selectedFilters, sortConfig]);

  // Event handlers
  const handleApplyFilters = (filters: any) => {
    setSelectedFilters(filters);
    setIsFilterModalOpen(false);
  };

  const handleApplySort = (sortConfig: { field: string; direction: 'asc' | 'desc' }) => {
    setSortConfig(sortConfig);
    setIsSortModalOpen(false);
  };

  const handleViewVendor = (vendor: VendorWithRisk) => {
    setEditingVendor(vendor);
    setIsEditMode(false);
  };

  const handleEditVendor = (vendor: VendorWithRisk) => {
    setEditingVendor(vendor);
    setIsEditMode(true);
  };

  const handleDeleteVendor = async (vendorId: string) => {
    try {
      await vendorService.deleteVendor(vendorId);
      await loadVendors();
      await loadStats();
      toast({ title: 'Success', description: 'Vendor deleted successfully.', variant: 'success' });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({ title: 'Error', description: 'Failed to delete vendor. Please try again.', variant: 'destructive' });
    }
  };

  const handleSaveVendor = async (vendorData: VendorWithRisk) => {
    try {
      // Check if this is an update (has valid MongoDB ObjectId) or create (empty/short id)
      const isUpdate = vendorData.id && vendorData.id.length === 24; // MongoDB ObjectId is exactly 24 chars
      
      if (isUpdate) {
        // Update existing vendor
        await vendorService.updateVendor(vendorData.id, vendorData);
        toast({ title: 'Success', description: 'Vendor updated successfully.', variant: 'success' });
      } else {
        // Create new vendor
        await vendorService.createVendor(vendorData);
        toast({ title: 'Success', description: 'Vendor created successfully.', variant: 'success' });
      }
      await loadVendors();
      await loadStats();
      setIsAddVendorOpen(false);
      setEditingVendor(null);
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast({ title: 'Error', description: 'Failed to save vendor. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards Section */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Total" value={stats.totalVendors} icon={Building2} accent={STAT_ACCENTS.PRIMARY}
            active={selectedStatus === 'All' && selectedRisk === 'All'}
            onClick={() => { setSelectedStatus('All'); setSelectedRisk('All'); }} />
          <StatCard label="Active" value={stats.activeVendors} icon={TrendingUp} accent={STAT_ACCENTS.SUCCESS}
            active={selectedStatus === 'Active'}
            onClick={() => { setSelectedStatus('Active'); setSelectedRisk('All'); }} />
          <StatCard label="Value" value={formatIndianCurrency(stats.totalValue)} icon={CreditCard} accent={STAT_ACCENTS.PURPLE} />
          <StatCard label="Outstanding" value={formatIndianCurrency(stats.outstandingBalance)} icon={AlertCircle} accent={STAT_ACCENTS.WARNING} />
          <StatCard label="High Risk" value={stats.highRiskVendors} icon={AlertCircle} accent={STAT_ACCENTS.DANGER}
            active={selectedRisk === 'High'}
            onClick={() => { setSelectedRisk('High'); setSelectedStatus('All'); }} />
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
              <Input type="search" placeholder="Search vendors, contacts…"
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

        {/* Mobile */}
        <div className="lg:hidden space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input type="search" placeholder="Search vendors…"
                className="pl-8 text-xs h-8" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
              style={hasFilters ? { background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` } : {}}
              onClick={() => setIsFilterModalOpen(true)}>
              <Filter size={13} />
              {hasFilters && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full" style={{ background: PRIMARY, color: '#fff' }}>{activeFilterCount}</span>}
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
              style={hasSort ? { background: `${PRIMARY}10`, borderColor: `${PRIMARY}30` } : {}}
              onClick={() => setIsSortModalOpen(true)}>
              <ArrowUpDown size={13} />
            </Button>
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

      {/* Data Table Section */}
      <div className="space-y-4">
        {isLoadingData ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading vendors...</p>
            </div>
          </div>
        ) : currentPageData.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-2">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No vendors found</p>
            </div>
          </div>
        ) : (
          <MobileTableView
            data={currentPageData}
            stickyHeader={true}
            onRowClick={handleViewVendor}
            renderMobileItem={(vendor, onView) => (
              <VendorMobileCard vendor={vendor as VendorWithRisk} onClick={onView} />
            )}
            columns={[
              {
                key: 'name' as keyof VendorWithRisk,
                label: 'Vendor',
                width: 'w-[20%]',
                render: (_, vendor) => (
                  <div>
                    <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{(vendor as any).name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>
                      ID: {(vendor as any).vendorId} · {(vendor as any).contactPerson}
                    </p>
                  </div>
                ),
              },
              {
                key: 'phone' as keyof VendorWithRisk,
                label: 'Contact',
                width: 'w-[20%]',
                render: (_, vendor) => (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Phone size={11} style={{ color: TEXT_MUTE }} />
                      <p className="text-[11px]" style={{ color: TEXT_MAIN }}>{(vendor as any).phone}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail size={11} style={{ color: TEXT_MUTE }} />
                      <p className="text-[11px] truncate max-w-[130px]" style={{ color: TEXT_MUTE }}>{(vendor as any).email}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} style={{ color: TEXT_MUTE }} />
                      <p className="text-[11px]" style={{ color: TEXT_MUTE }}>{(vendor as any).city}, {(vendor as any).state}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'category' as keyof VendorWithRisk,
                label: 'Category & Status',
                width: 'w-[18%]',
                render: (_, vendor) => (
                  <div className="space-y-1">
                    <div>
                      <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full border inline-block"
                        style={{ background: `${PRIMARY}14`, color: PRIMARY, borderColor: `${PRIMARY}33` }}>
                        {(vendor as any).category}
                      </span>
                    </div>
                    <div><StatusBadge status={(vendor as any).status} /></div>
                    <div><RiskBadge level={(vendor as any).riskLevel} /></div>
                  </div>
                ),
              },
              {
                key: 'totalOrders' as keyof VendorWithRisk,
                label: 'Performance',
                width: 'w-[18%]',
                render: (_, vendor) => (
                  <div>
                    <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{(vendor as any).totalOrders}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>orders</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: SUCCESS }}>{formatIndianCurrency((vendor as any).totalValue)}</p>
                  </div>
                ),
              },
              {
                key: 'creditLimit' as keyof VendorWithRisk,
                label: 'Financial',
                width: 'w-[20%]',
                render: (_, vendor) => (
                  <div>
                    <p className="text-[11px]" style={{ color: TEXT_MUTE }}>Credit: <span className="text-[14px] font-semibold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency((vendor as any).creditLimit)}</span></p>
                    <p className="text-[11px] mt-0.5 font-semibold" style={{ color: (vendor as any).outstandingBalance > 0 ? DANGER : SUCCESS }}>
                      Bal: {formatIndianCurrency((vendor as any).outstandingBalance)}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>{(vendor as any).paymentTerms}</p>
                  </div>
                ),
              },
            ]}
            getActions={(vendor) => [
              { label: 'View', onClick: () => handleViewVendor(vendor), icon: Eye },
              { label: 'Edit', onClick: () => handleEditVendor(vendor), icon: Edit },
              { label: 'Delete', onClick: () => setDeleteTarget(vendor.id), variant: 'destructive', icon: Trash2 },
            ]}
          />
        )}

        {!isLoadingData && totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
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
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Filter and Sort Modals */}
      <VendorFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        categories={categories}
      />
      
      <VendorSortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={handleApplySort}
      />

      {/* Vendor Modal */}
      <ModernVendorOverlay
        key={editingVendor?.id ?? 'new'}
        vendor={editingVendor as any}
        isOpen={isAddVendorOpen || !!editingVendor}
        onClose={() => {
          setIsAddVendorOpen(false);
          setEditingVendor(null);
          setIsEditMode(false);
        }}
        isEdit={isEditMode}
        onSave={handleSaveVendor}
        onUpdate={handleSaveVendor}
        onDelete={(id: string) => setDeleteTarget(id)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete vendor?"
        description="This will permanently remove this vendor and all associated data. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteTarget ? handleDeleteVendor(deleteTarget) : Promise.resolve()}
      />
    </div>
  );
};