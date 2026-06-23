import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Package, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Truck,
  Eye,
  Edit,
  Trash2,
  ArrowRight,
  AlertTriangle,
  User
} from 'lucide-react';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import { StockTransferFilterModal } from '@/components/stock-transfer/StockTransferFilterModal';
import { StockTransferSortModal } from '@/components/stock-transfer/StockTransferSortModal';
import { ModernStockTransferOverlay } from '@/components/stock-transfer/ModernStockTransferOverlay';
import { StockTransfer as StockTransferType } from '@/types/inventory';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { formatIndianCurrency, formatIndianQuantity } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import * as stockTransferService from '@/services/stockTransferService';
import { countActiveFilters } from '@/lib/filterUtils';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// ── Design tokens ────────────────────────────────────────────────────────────
const PRIMARY   = STAT_ACCENTS.PRIMARY;
const SUCCESS   = STAT_ACCENTS.SUCCESS;
const WARNING   = STAT_ACCENTS.WARNING;
const DANGER    = STAT_ACCENTS.DANGER;
const PURPLE    = STAT_ACCENTS.PURPLE;
const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-primary/10 text-primary border-primary/20';
      case 'in transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border text-[11px] pointer-events-none`}>
      {status}
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const getStatusColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'normal': return 'bg-primary/10 text-primary border-primary/20';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusColor(priority)} text-[11px] pointer-events-none`}>
      {priority}
    </Badge>
  );
};

const StockTransferMobileCard = ({ transfer, onClick }: { transfer: StockTransferType; onClick?: () => void }) => {
  return (
    <Card className="w-full cursor-pointer active:scale-[0.99] transition-all duration-150 hover:shadow-md" style={{ borderColor: BORDER }} onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
              <Truck size={15} style={{ color: PRIMARY }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: TEXT_MAIN }}>{transfer.transferId}</p>
              <p className="text-xs truncate leading-tight mt-0.5" style={{ color: TEXT_MUTE }}>{transfer.fromLocation} → {transfer.toLocation}</p>
            </div>
          </div>
          <StatusBadge status={transfer.status} />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Items</p>
            <p className="text-xs font-medium" style={{ color: TEXT_MAIN }}>{transfer.items.length} items</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Priority</p>
            <PriorityBadge priority={transfer.priority} />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-1">
            <User size={11} style={{ color: TEXT_MUTE }} />
            <span className="text-xs" style={{ color: TEXT_MUTE }}>{transfer.requestedBy}</span>
          </div>
          <span className="text-xs" style={{ color: TEXT_MUTE }}>{transfer.requestDate}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const StockTransfer = () => {
  
  // Data state
  const [stockTransfers, setStockTransfers] = useState<StockTransferType[]>([]);
  const [stats, setStats] = useState({
    totalTransfers: 0,
    pendingTransfers: 0,
    inTransitTransfers: 0,
    completedTransfers: 0,
    highPriorityTransfers: 0,
    totalItems: 0,
    averageItems: 0,
    averageCompletionTime: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortConfig, setSortConfig] = useState({ field: 'requestDate', direction: 'desc' as 'asc' | 'desc' });
  
  // Modal states
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<StockTransferType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 25;

  // Filter states
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  
  // Calculate active filter count
  const activeFilterCount = useMemo(() => countActiveFilters(selectedFilters), [selectedFilters]);
  const hasFilters = activeFilterCount > 0;
  const hasSort = sortConfig.field !== 'requestDate' || sortConfig.direction !== 'desc';

  // Load stock transfers from service
  const loadStockTransfers = async (page = currentPage) => {
    try {
      setIsLoadingData(true);
      const result = await stockTransferService.fetchStockTransfers(page, itemsPerPage);
      setStockTransfers(result.data);
      setTotalItems(result.total);
    } catch (error) {
      console.error('Error loading stock transfers:', error);
      toast({ title: 'Error', description: 'Failed to load stock transfers. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load stats from service
  const loadStats = async () => {
    try {
      const statsData = await stockTransferService.fetchStockTransferStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => { loadStockTransfers(currentPage); }, [currentPage]);
  useEffect(() => { loadStats(); }, []);

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'stock-transfer') {
        setIsNewTransferOpen(true);
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  // Get unique values for filters
  const statuses = ['All', ...Array.from(new Set(stockTransfers.map(transfer => transfer.status)))];
  const priorities = ['All', ...Array.from(new Set(stockTransfers.map(transfer => transfer.priority)))];
  const allLocations = Array.from(new Set([
    ...stockTransfers.map(transfer => transfer.fromLocation),
    ...stockTransfers.map(transfer => transfer.toLocation)
  ])).sort();

  // Filter logic
  const filteredTransfers = useMemo(() => {
    return stockTransfers.filter(transfer => {
      const matchesSearch = !searchTerm || 
        transfer.transferId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'All' || transfer.status === selectedStatus;
      const matchesPriority = selectedPriority === 'All' || transfer.priority === selectedPriority;
      
      // Comprehensive filter matching
      const matchesTransferId = !selectedFilters.transferId || 
        transfer.transferId.toLowerCase().includes(selectedFilters.transferId.toLowerCase());
      
      const matchesFromLocation = !selectedFilters.fromLocation || 
        transfer.fromLocation.toLowerCase().includes(selectedFilters.fromLocation.toLowerCase());
      
      const matchesToLocation = !selectedFilters.toLocation || 
        transfer.toLocation.toLowerCase().includes(selectedFilters.toLocation.toLowerCase());
      
      const matchesRequestedBy = !selectedFilters.requestedBy || 
        transfer.requestedBy.toLowerCase().includes(selectedFilters.requestedBy.toLowerCase());
      
      const matchesFilterStatus = !selectedFilters.status || 
        selectedFilters.status === 'All' || 
        transfer.status === selectedFilters.status;
      
      const matchesFilterPriority = !selectedFilters.priority || 
        selectedFilters.priority === 'All' || 
        transfer.priority === selectedFilters.priority;
      
      const matchesRequestDateRange = !selectedFilters.requestDateRange?.from || 
        (new Date(transfer.requestDate) >= new Date(selectedFilters.requestDateRange.from) &&
         (!selectedFilters.requestDateRange.to || new Date(transfer.requestDate) <= new Date(selectedFilters.requestDateRange.to)));
      
      const matchesExpectedDateRange = !selectedFilters.expectedDateRange?.from || 
        (new Date(transfer.expectedDate) >= new Date(selectedFilters.expectedDateRange.from) &&
         (!selectedFilters.expectedDateRange.to || new Date(transfer.expectedDate) <= new Date(selectedFilters.expectedDateRange.to)));
      
      return matchesSearch && matchesStatus && matchesPriority && matchesTransferId &&
             matchesFromLocation && matchesToLocation && matchesRequestedBy &&
             matchesFilterStatus && matchesFilterPriority && 
             matchesRequestDateRange && matchesExpectedDateRange;
    });
  }, [stockTransfers, searchTerm, selectedStatus, selectedPriority, selectedFilters]);

  // Sort logic
  const sortedTransfers = useMemo(() => {
    return [...filteredTransfers].sort((a, b) => {
      const field = sortConfig.field as keyof StockTransferType;
      const aValue = a[field];
      const bValue = b[field];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTransfers, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPageData = sortedTransfers;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedPriority, selectedFilters, sortConfig]);

  // Event handlers
  const handleApplyFilters = (filters: any) => {
    setSelectedFilters(filters);
    setIsFilterModalOpen(false);
  };

  const handleApplySort = (sortConfig: { field: string; direction: 'asc' | 'desc' }) => {
    setSortConfig(sortConfig);
    setIsSortModalOpen(false);
  };

  const handleViewTransfer = (transfer: StockTransferType) => {
    setEditingTransfer(transfer);
    setIsEditMode(false);
  };

  const handleEditTransfer = (transfer: StockTransferType) => {
    setEditingTransfer(transfer);
    setIsEditMode(true);
  };

  const handleDeleteTransfer = async (transferId: string) => {
    try {
      await stockTransferService.deleteStockTransfer(transferId);
      await loadStockTransfers();
      await loadStats();
      toast({ title: 'Success', description: 'Stock transfer deleted successfully.', variant: 'success' });
    } catch (error) {
      console.error('Error deleting stock transfer:', error);
      toast({ title: 'Error', description: 'Failed to delete stock transfer. Please try again.', variant: 'destructive' });
    }
  };

  const handleSaveTransfer = async (transferData: StockTransferType) => {
    try {
      if (transferData.id && /^[0-9a-f]{24}$/i.test(transferData.id)) {
        // Update existing transfer (real MongoDB ObjectId)
        await stockTransferService.updateStockTransfer(transferData.id, transferData);
        toast({ title: 'Success', description: 'Stock transfer updated successfully.', variant: 'success' });
      } else {
        // Create new transfer
        await stockTransferService.createStockTransfer(transferData);
        toast({ title: 'Success', description: 'Stock transfer created successfully.', variant: 'success' });
      }
      await loadStockTransfers();
      await loadStats();
      setIsNewTransferOpen(false);
      setEditingTransfer(null);
    } catch (error) {
      console.error('Error saving stock transfer:', error);
      toast({ title: 'Error', description: 'Failed to save stock transfer. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards Section */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Total" value={stats.totalTransfers} icon={Package} accent={STAT_ACCENTS.PRIMARY}
            active={selectedStatus === 'All'} onClick={() => setSelectedStatus('All')} />
          <StatCard label="Pending" value={stats.pendingTransfers} icon={Clock} accent={STAT_ACCENTS.WARNING}
            active={selectedStatus === 'Pending'} onClick={() => setSelectedStatus(selectedStatus === 'Pending' ? 'All' : 'Pending')} />
          <StatCard label="In Transit" value={stats.inTransitTransfers} icon={Truck} accent={STAT_ACCENTS.PURPLE}
            active={selectedStatus === 'In Transit'} onClick={() => setSelectedStatus(selectedStatus === 'In Transit' ? 'All' : 'In Transit')} />
          <StatCard label="Completed" value={stats.completedTransfers} icon={CheckCircle} accent={STAT_ACCENTS.SUCCESS}
            active={selectedStatus === 'Completed'} onClick={() => setSelectedStatus(selectedStatus === 'Completed' ? 'All' : 'Completed')} />
          <StatCard label="Items" value={formatIndianQuantity(stats.totalItems)} icon={TrendingUp} accent={STAT_ACCENTS.CYAN} />
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
              <Input type="search" placeholder="Search transfers, locations…"
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
              <Input type="search" placeholder="Search transfers…"
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
              <p className="text-sm text-muted-foreground">Loading stock transfers...</p>
            </div>
          </div>
        ) : currentPageData.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-2">
              <Truck className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No stock transfers found</p>
            </div>
          </div>
        ) : (
          <MobileTableView
            data={currentPageData}
            stickyHeader={true}
            onRowClick={handleViewTransfer}
            renderMobileItem={(transfer, onView) => (
              <StockTransferMobileCard transfer={transfer as StockTransferType} onClick={onView} />
            )}
            columns={[
              {
                key: 'transferId' as keyof StockTransferType,
                label: 'Transfer',
                width: 'w-[18%]',
                render: (_, transfer) => (
                  <div>
                    <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{(transfer as any).transferId}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>
                      {(transfer as any).items?.length ?? 0} items · {(transfer as any).requestDate}
                    </p>
                  </div>
                ),
              },
              {
                key: 'fromLocation' as keyof StockTransferType,
                label: 'Route',
                width: 'w-[20%]',
                render: (_, transfer) => (
                  <div>
                    <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{(transfer as any).fromLocation}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <ArrowRight size={11} style={{ color: TEXT_MUTE }} />
                      <p className="text-[11px]" style={{ color: TEXT_MUTE }}>{(transfer as any).toLocation}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'status' as keyof StockTransferType,
                label: 'Status',
                width: 'w-[16%]',
                render: (_, transfer) => (
                  <div className="space-y-1">
                    <div><StatusBadge status={(transfer as any).status} /></div>
                    <div><PriorityBadge priority={(transfer as any).priority} /></div>
                  </div>
                ),
              },
              {
                key: 'requestedBy' as keyof StockTransferType,
                label: 'Requested By',
                width: 'w-[20%]',
                render: (_, transfer) => (
                  <div>
                    <p className="text-sm" style={{ color: TEXT_MAIN }}>{(transfer as any).requestedBy}</p>
                    {(transfer as any).approvedBy && (
                      <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>Approved: {(transfer as any).approvedBy}</p>
                    )}
                  </div>
                ),
              },
              {
                key: 'items' as keyof StockTransferType,
                label: 'Est. Value',
                width: 'w-[18%]',
                render: (_, transfer) => (
                  <div>
                    <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>
                      {formatIndianCurrency((transfer as any).items?.reduce((sum: number, item: any) => sum + (item.quantity * 10), 0) ?? 0)}
                    </p>
                    {(transfer as any).completedDate && (
                      <p className="text-[11px] mt-0.5" style={{ color: SUCCESS }}>Done: {(transfer as any).completedDate}</p>
                    )}
                  </div>
                ),
              },
            ]}
            getActions={(transfer) => {
              const settled = transfer.status === 'Completed' || transfer.status === 'Cancelled';
              return [
                { label: 'View', onClick: () => handleViewTransfer(transfer), icon: Eye },
                { label: 'Edit', onClick: () => handleEditTransfer(transfer), icon: Edit, disabled: settled, disabledReason: settled ? 'Cannot edit settled transfer' : undefined },
                { label: 'Delete', onClick: () => setDeleteTarget(transfer.transferId), variant: 'destructive' as const, icon: Trash2, disabled: settled, disabledReason: settled ? 'Cannot delete settled transfer' : undefined },
              ];
            }}
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
      <StockTransferFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        locations={allLocations}
        statuses={statuses}
      />
      
      <StockTransferSortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={handleApplySort}
      />

      {/* Stock Transfer Modal */}
      <ModernStockTransferOverlay
        key={editingTransfer?.id ?? 'new'}
        transfer={editingTransfer as any}
        isOpen={isNewTransferOpen || !!editingTransfer}
        onClose={() => {
          setIsNewTransferOpen(false);
          setEditingTransfer(null);
          setIsEditMode(false);
        }}
        isEdit={isEditMode}
        onSave={handleSaveTransfer as any}
        onUpdate={handleSaveTransfer as any}
        onDelete={(transferId: string) => setDeleteTarget(transferId)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete stock transfer?"
        description="This will permanently remove this stock transfer. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteTarget ? handleDeleteTransfer(deleteTarget) : Promise.resolve()}
      />
    </div>
  );
};