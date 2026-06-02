import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  User,
  Plus,
  Calendar
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import { BillingFilterModal } from '@/components/billing/BillingFilterModal';
import { BillingSortModal } from '@/components/billing/BillingSortModal';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import * as billingService from '@/services/billingService';
import { formatIndianCurrency } from '@/lib/utils';
import { BillingRecord } from '@/services/billingService';
import { ModernBillingOverlay } from '@/components/billing/ModernBillingOverlay';
import { countActiveFilters } from '@/lib/filterUtils';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-red-100 text-red-800 border-red-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border pointer-events-none`}>
      {status}
    </Badge>
  );
};

const BillingMobileCard = ({ invoice, onClick }: { invoice: BillingRecord; onClick?: () => void }) => {
  const PRIMARY = 'hsl(220,48%,42%)';
  const BORDER = 'hsl(220,16%,90%)';
  const TEXT_MAIN = 'hsl(215,28%,14%)';
  const TEXT_MUTE = 'hsl(220,12%,54%)';
  return (
    <Card className="w-full cursor-pointer active:scale-[0.99] transition-all duration-150 hover:shadow-md" style={{ borderColor: BORDER }} onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
              <FileText size={15} style={{ color: PRIMARY }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: TEXT_MAIN }}>{invoice.invoiceNumber}</p>
              <p className="text-xs truncate leading-tight mt-0.5" style={{ color: TEXT_MUTE }}>{invoice.patientName} • {invoice.department}</p>
            </div>
          </div>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Patient ID</p>
            <p className="text-xs font-medium truncate" style={{ color: TEXT_MAIN }}>{invoice.patientId || '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Amount</p>
            <p className="text-sm font-bold" style={{ color: TEXT_MAIN }}>${invoice.amount?.toLocaleString() ?? '—'}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-1">
            <Calendar size={11} style={{ color: TEXT_MUTE }} />
            <span className="text-xs" style={{ color: TEXT_MUTE }}>{invoice.date || '—'}</span>
          </div>
          {invoice.paidAmount > 0 && <span className="text-xs font-medium" style={{ color: 'hsl(158,70%,36%)' }}>Paid: ${invoice.paidAmount?.toLocaleString()}</span>}
          {(invoice as any).actor && <span className="text-[10px]" style={{ color: TEXT_MUTE }}>· {(invoice as any).actor}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export const Billing = () => {
  const isMobile = useIsMobile();
  
  // Data state
  const [invoices, setInvoices] = useState<BillingRecord[]>([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    partialInvoices: 0,
    averageInvoiceAmount: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortConfig, setSortConfig] = useState({ field: 'invoiceDate', direction: 'desc' as 'asc' | 'desc' });
  
  // Modal states
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load billing data and stats
  const loadBillingRecords = async () => {
    setIsLoadingData(true);
    try {
      const records = await billingService.fetchBillingRecords();
      setInvoices(records);
    } catch (error) {
      console.error('Failed to load billing records:', error);
      toast({ title: 'Error', description: 'Failed to load billing records. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadStats = async () => {
    try {
      const billingStats = await billingService.fetchBillingStats();
      setStats(billingStats);
    } catch (error) {
      console.error('Failed to load billing stats:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadBillingRecords();
    loadStats();
  }, []);

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'invoice' || event.detail?.type === 'billing') {
        setIsNewInvoiceOpen(true);
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  // Get unique values for filters
  const statuses = ['All', ...Array.from(new Set(invoices.map(record => record.status)))];

  // Calculate active filter count
  const activeFilterCount = useMemo(() => countActiveFilters(selectedFilters), [selectedFilters]);
  const hasFilters = activeFilterCount > 0;
  const hasSort = sortConfig.field !== 'invoiceDate' || sortConfig.direction !== 'desc';

  // Filter logic
  const filteredRecords = useMemo(() => {
    return invoices.filter(record => {
      const matchesSearch = !searchTerm || 
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patientId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'All' || record.status === selectedStatus;
      
      // Comprehensive filter matching
      const matchesInvoiceNumber = !selectedFilters.invoiceNumber || 
        record.invoiceNumber.toLowerCase().includes(selectedFilters.invoiceNumber.toLowerCase());
      
      const matchesPatientId = !selectedFilters.patientId || 
        record.patientId.toLowerCase().includes(selectedFilters.patientId.toLowerCase());
      
      const matchesPatientName = !selectedFilters.patientName || 
        record.patientName.toLowerCase().includes(selectedFilters.patientName.toLowerCase());
      
      const matchesDepartment = !selectedFilters.department || 
        record.department.toLowerCase().includes(selectedFilters.department.toLowerCase());
      
      const matchesDoctor = !selectedFilters.doctor || 
        record.doctor.toLowerCase().includes(selectedFilters.doctor.toLowerCase());
      
      const matchesFilterStatus = !selectedFilters.status || 
        selectedFilters.status === 'All' || 
        record.status === selectedFilters.status;
      
      const matchesDateRange = !selectedFilters.dateRange?.from || 
        (new Date(record.date) >= new Date(selectedFilters.dateRange.from) &&
         (!selectedFilters.dateRange.to || new Date(record.date) <= new Date(selectedFilters.dateRange.to)));
      
      const matchesDueDateRange = !selectedFilters.dueDateRange?.from || 
        (new Date(record.dueDate) >= new Date(selectedFilters.dueDateRange.from) &&
         (!selectedFilters.dueDateRange.to || new Date(record.dueDate) <= new Date(selectedFilters.dueDateRange.to)));
      
      const matchesAmountRange = 
        (!selectedFilters.amountRange?.min || record.amount >= Number(selectedFilters.amountRange.min)) &&
        (!selectedFilters.amountRange?.max || record.amount <= Number(selectedFilters.amountRange.max));
      
      return matchesSearch && matchesStatus && matchesInvoiceNumber && matchesPatientId &&
             matchesPatientName && matchesDepartment && matchesDoctor && matchesFilterStatus &&
             matchesDateRange && matchesDueDateRange && matchesAmountRange;
    });
  }, [invoices, searchTerm, selectedStatus, selectedFilters]);

  // Sort logic
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const field = sortConfig.field;
      let aValue: any = a[field as keyof typeof a];
      let bValue: any = b[field as keyof typeof b];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRecords, sortConfig]);

  // Infinite scroll for mobile
  const { displayedItems: mobileDisplayedItems, hasMoreItems, isLoading, loadMoreItems } = useInfiniteScroll({
    data: sortedRecords,
    itemsPerPage: 10,
    enabled: isMobile
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const currentPageData = isMobile 
    ? mobileDisplayedItems
    : sortedRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedFilters, sortConfig]);

  // Event handlers
  const handleApplyFilters = (filters: any) => {
    setSelectedFilters(filters);
    setIsFilterModalOpen(false);
  };

  const handleApplySort = (sortConfig: { field: string; direction: 'asc' | 'desc' }) => {
    setSortConfig(sortConfig);
    setIsSortModalOpen(false);
  };

  const handleViewInvoice = (invoice: any) => {
    setEditingInvoice(invoice);
    setIsEditMode(false);
  };

  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice(invoice);
    setIsEditMode(true);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await billingService.deleteBillingRecord(invoiceId);
      setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
      await loadStats();
      toast({ title: 'Invoice Deleted', description: 'Invoice has been successfully deleted.', variant: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete invoice. Please try again.', variant: 'destructive' });
    }
  };

  const handleSaveInvoice = async (billing: BillingRecord) => {
    try {
      if (isEditMode && editingInvoice) {
        await billingService.updateBillingRecord(editingInvoice.id, billing);
        setInvoices(invoices.map(inv => inv.id === editingInvoice.id ? billing : inv));
      } else {
        const newBilling = await billingService.createBillingRecord(billing);
        setInvoices([newBilling, ...invoices]);
      }
      await loadStats();
      setIsNewInvoiceOpen(false);
      setEditingInvoice(null);
      setIsEditMode(false);
    } catch (error) {
      throw error;
    }
  };

  const handleCloseOverlay = () => {
    setIsNewInvoiceOpen(false);
    setEditingInvoice(null);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards Section */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Total" value={stats.totalInvoices || 0} icon={FileText} accent={STAT_ACCENTS.PRIMARY}
            active={selectedStatus === 'All'} onClick={() => setSelectedStatus('All')} />
          <StatCard label="Pending" value={stats.pendingInvoices || 0} icon={Clock} accent={STAT_ACCENTS.WARNING}
            active={selectedStatus === 'Pending'} onClick={() => setSelectedStatus(selectedStatus === 'Pending' ? 'All' : 'Pending')} />
          <StatCard label="Paid" value={stats.paidInvoices || 0} icon={CheckCircle} accent={STAT_ACCENTS.SUCCESS}
            active={selectedStatus === 'Paid'} onClick={() => setSelectedStatus(selectedStatus === 'Paid' ? 'All' : 'Paid')} />
          <StatCard label="Collected" value={formatIndianCurrency(stats.totalPaid || 0)} icon={DollarSign} accent={STAT_ACCENTS.CYAN} />
          <StatCard label="Revenue" value={formatIndianCurrency(stats.totalRevenue || 0)} icon={TrendingUp} accent={STAT_ACCENTS.PURPLE} />
        </div>
      </div>

      {/* Filters Section - Sticky */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-4 space-y-3 lg:space-y-0 overflow-hidden sm:mx-0 mt-4 lg:mt-6">
        {/* Desktop Layout - All in one line */}
        <div className="hidden lg:flex lg:items-center lg:gap-4 lg:justify-between">
          {/* Status Filter Pills */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-2 w-max min-w-0">
              {statuses.map(status => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  className="rounded-full whitespace-nowrap text-xs px-2.5 h-7 lg:h-9 lg:text-sm lg:px-3 animate-fade-in"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Search and Action Buttons */}
          <div className="flex gap-3 flex-shrink-0 min-w-0">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search invoices, patients..."
                className="pl-8 text-sm h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsFilterModalOpen(true)}
              className={hasFilters ? 'bg-primary/10 border-primary/20 hover:bg-primary/20' : ''}
            >
              <Filter className="mr-1 h-4 w-4" /> 
              Filters
              {hasFilters && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsSortModalOpen(true)}
              className={hasSort ? 'bg-primary/10 border-primary/20 hover:bg-primary/20' : ''}
            >
              <ArrowUpDown className="mr-1 h-4 w-4" /> 
              Sort
            </Button>
          </div>
        </div>

        {/* Mobile/Tablet Layout - Stacked */}
        <div className="lg:hidden space-y-3">
          {/* Search and Action Buttons */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search invoices..."
                className="pl-8 text-sm h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className={`px-2 sm:px-3 ${hasFilters ? 'bg-primary/10 border-primary/20 hover:bg-primary/20' : ''}`}
              onClick={() => setIsFilterModalOpen(true)}
            >
              <Filter className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`px-2 sm:px-3 ${hasSort ? 'bg-primary/10 border-primary/20 hover:bg-primary/20' : ''}`}
              onClick={() => setIsSortModalOpen(true)}
            >
              <ArrowUpDown className="h-4 w-4 sm:mr-1" /> 
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </div>

          {/* Status Filter Pills */}
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-2 w-max min-w-full">
              {statuses.map(status => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  className="rounded-full whitespace-nowrap text-xs px-2.5 h-7 lg:h-9 lg:text-sm lg:px-3 animate-fade-in"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Table Section */}
      {isLoadingData ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading billing records...</p>
        </div>
      ) : currentPageData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-lg">No invoices found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm || selectedStatus !== 'All' 
                ? 'Try adjusting your filters' 
                : 'Get started by creating your first invoice'}
            </p>
          </div>
        </div>
      ) : (
        <MobileTableView
          data={currentPageData}
          columns={[
            {
              key: 'invoiceNumber',
              label: 'Invoice',
              width: 'w-[20%]',
              render: (value, invoice) => (
                <div>
                  <div className="font-medium">{value}</div>
                  <div className="text-sm text-muted-foreground">{invoice.date}</div>
                </div>
              )
            },
            {
              key: 'patientName',
              label: 'Patient',
              width: 'w-[25%]',
              render: (value, invoice) => (
                <div>
                  <div className="font-medium">{value}</div>
                  <div className="text-sm text-muted-foreground">{invoice.patientId}</div>
                  <div className="text-sm text-muted-foreground">{invoice.department}</div>
                  {(invoice as any).actor && (
                    <div className="text-xs text-muted-foreground mt-0.5">via {(invoice as any).actor}</div>
                  )}
                </div>
              )
            },
            {
              key: 'status',
              label: 'Status',
              width: 'w-[15%]',
              render: (value) => <StatusBadge status={value} />
            },
            {
              key: 'amount',
              label: 'Amount',
              width: 'w-[35%]',
              render: (value, invoice) => (
                <div>
                  <div className="font-semibold text-lg">
                    ${value.toLocaleString()}
                  </div>
                  {invoice.paidAmount > 0 && (
                    <div className="text-xs text-green-600">
                      Paid: ${invoice.paidAmount.toLocaleString()}
                    </div>
                  )}
                </div>
              )
            }
          ]}
          stickyHeader={true}
          renderMobileItem={(invoice, onView) => <BillingMobileCard invoice={invoice as BillingRecord} onClick={onView} />}
          getActions={(invoice) => [
            { label: 'View', onClick: () => handleViewInvoice(invoice), icon: Eye },
            { label: 'Edit', onClick: () => handleEditInvoice(invoice), icon: Edit },
            { label: 'Delete', onClick: () => handleDeleteInvoice(invoice.id), variant: 'destructive' as const, icon: Trash2 }
          ]}
          onRowClick={(invoice) => handleViewInvoice(invoice)}
        />
      )}

      {/* Desktop Pagination */}
      {!isMobile && !isLoadingData && totalPages > 1 && (
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNumber)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Mobile: Show loading indicator and load more button */}
      {isMobile && (
        <div className="text-center">
          {hasMoreItems ? (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Showing {mobileDisplayedItems.length} of {filteredRecords.length} invoices
              </div>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={loadMoreItems}
                  className="w-full"
                >
                  Load More
                </Button>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              All {filteredRecords.length} invoices loaded
            </div>
          )}
        </div>
      )}

      {/* Filter Modal */}
      <BillingFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={(filters) => {
          setSelectedFilters(filters);
          setIsFilterModalOpen(false);
        }}
        statuses={statuses}
      />

      {/* Sort Modal */}
            <BillingSortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={handleApplySort}
      />

      {/* Billing Invoice Overlay */}
      <ModernBillingOverlay
        isOpen={isNewInvoiceOpen || !!editingInvoice}
        onClose={handleCloseOverlay}
        billing={editingInvoice || undefined}
        isEditMode={isEditMode}
        onSave={handleSaveInvoice}
        onRefresh={async () => {
          await loadBillingRecords();
          await loadStats();
        }}
      />
    </div>
  );
};