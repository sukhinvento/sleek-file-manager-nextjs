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
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import PurchaseOrderSheet from '@/components/purchase-orders/PurchaseOrderSheet';
import { PurchaseOrderFilterModal } from '@/components/purchase-orders/PurchaseOrderFilterModal';
import { PurchaseOrderSortModal } from '@/components/purchase-orders/PurchaseOrderSortModal';
import { PurchaseOrder } from '@/types/purchaseOrder';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { formatIndianCurrency, formatIndianQuantity } from '@/lib/utils';
import { countActiveFilters } from '@/lib/filterUtils';
import { toast } from '@/hooks/use-toast';
import * as purchaseOrderService from '@/services/purchaseOrderService';
import * as vendorService from '@/services/vendorService';
import { EntityOption } from '@/types/shared';
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

const PO_STAGE: Record<string, { label: string; color: string }> = {
  'Pending':            { label: '→ Awaiting Approval', color: 'hsl(33,92%,48%)' },
  'Approved':           { label: '→ Pending Delivery',  color: STAT_ACCENTS.PRIMARY },
  'Partial':            { label: '→ Partial Receipt',   color: 'hsl(33,92%,48%)' },
  'Partially Received': { label: '→ More Expected',     color: 'hsl(33,92%,48%)' },
  'Received':           { label: '✓ Received',           color: 'hsl(158,70%,36%)' },
  'Delivered':          { label: '✓ Fulfilled',          color: 'hsl(158,70%,36%)' },
  'Cancelled':          { label: '✗ Cancelled',          color: 'hsl(354,70%,50%)' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-primary/10 text-primary border-primary/20';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
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

const POMobileCard = ({ order, onClick }: { order: PurchaseOrder; onClick?: () => void }) => {
  return (
    <Card className="w-full cursor-pointer active:scale-[0.99] transition-all duration-150 hover:shadow-md" style={{ borderColor: BORDER }} onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
              <Package size={15} style={{ color: PRIMARY }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: TEXT_MAIN }}>{order.poNumber}</p>
              <p className="text-xs truncate leading-tight mt-0.5" style={{ color: TEXT_MUTE }}>{order.vendorName} • {order.items.length} items</p>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Created By</p>
            <p className="text-xs font-medium truncate" style={{ color: TEXT_MAIN }}>{order.createdBy || '—'}</p>
            {(order as any).actor && (
              <p className="text-[10px] truncate mt-0.5" style={{ color: TEXT_MUTE }}>actor: {(order as any).actor}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Total</p>
            <p className="text-sm font-bold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(order.total)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
          <div className="flex items-center gap-1">
            <Calendar size={11} style={{ color: TEXT_MUTE }} />
            <span className="text-xs" style={{ color: TEXT_MUTE }}>{order.orderDate || '—'}</span>
            {order.deliveryDate && <><span className="text-xs mx-0.5" style={{ color: TEXT_MUTE }}>→</span><span className="text-xs" style={{ color: TEXT_MUTE }}>{order.deliveryDate}</span></>}
          </div>
          {order.paidAmount > 0 && <span className="text-xs font-medium" style={{ color: 'hsl(158,70%,36%)' }}>Paid: {formatIndianCurrency(order.paidAmount)}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export const PurchaseOrders = () => {
  const isMobile = useIsMobile();
  
  // Data state
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [vendorOptions, setVendorOptions] = useState<EntityOption[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    deliveredOrders: 0,
    totalValue: 0,
    pendingValue: 0,
    averageOrderValue: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modal states
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [sheetMode, setSheetMode] = useState<'view' | 'edit' | 'add'>('view');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 25;

  // Filter states
  const [selectedFilters, setSelectedFilters] = useState({
    vendor: '',
    poNumber: '',
    vendorContact: '',
    status: '',
    paymentMethod: '',
    createdBy: '',
    approvedBy: '',
    orderDateRange: undefined,
    deliveryDateRange: undefined,
    amountRange: { min: '', max: '' },
    paidAmountRange: { min: '', max: '' }
  });
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({ field: 'orderDate', direction: 'desc' });

  // Load purchase orders from service
  const loadPurchaseOrders = async (page = currentPage) => {
    try {
      setIsLoadingData(true);
      const result = await purchaseOrderService.fetchPurchaseOrders(page, itemsPerPage);
      setPurchaseOrders(result.data);
      setTotalItems(result.total);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      toast({ title: 'Error', description: 'Failed to load purchase orders. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load stats from service
  const loadStats = async () => {
    try {
      const statsData = await purchaseOrderService.fetchPurchaseOrderStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load vendors for the PO sheet autosuggest
  const loadVendors = async () => {
    try {
      const { vendors: list } = await vendorService.fetchVendors({ limit: 200 });
      setVendorOptions(
        list.map((v: any) => ({
          id: v.id,
          name: v.name,
          phone: v.phone || '',
          email: v.email || '',
          address: v.address || v.city || '',
          contactPerson: v.contactPerson || '',
          category: v.category || '',
        }))
      );
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  // Load data on mount and page change
  useEffect(() => {
    loadPurchaseOrders(currentPage);
  }, [currentPage]);

  useEffect(() => {
    loadStats();
    loadVendors();
  }, []);

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'purchase-order') {
        setIsNewOrderOpen(true);
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  // Get unique values for filters
  const statuses = ['All', ...Array.from(new Set(purchaseOrders.map(order => order.status)))];
  const vendors = Array.from(new Set(purchaseOrders.map(order => order.vendorName)));

  // Count active filters
  const activeFilterCount = useMemo(() => countActiveFilters(selectedFilters), [selectedFilters]);
  const hasFilters = activeFilterCount > 0;
  const hasSort = sortConfig.field !== 'orderDate' || sortConfig.direction !== 'desc';

  // Filter and sort logic
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
      
      const matchesVendor = !selectedFilters.vendor || order.vendorName === selectedFilters.vendor;
      const matchesPONumber = !selectedFilters.poNumber || order.poNumber.toLowerCase().includes(selectedFilters.poNumber.toLowerCase());
      const matchesVendorContact = !selectedFilters.vendorContact || 
        order.vendorContact?.toLowerCase().includes(selectedFilters.vendorContact.toLowerCase()) ||
        order.vendorPhone?.toLowerCase().includes(selectedFilters.vendorContact.toLowerCase()) ||
        order.vendorEmail?.toLowerCase().includes(selectedFilters.vendorContact.toLowerCase());
      const matchesFilterStatus = !selectedFilters.status || order.status === selectedFilters.status;
      const matchesPaymentMethod = !selectedFilters.paymentMethod || order.paymentMethod === selectedFilters.paymentMethod;
      const matchesCreatedBy = !selectedFilters.createdBy || order.createdBy?.toLowerCase().includes(selectedFilters.createdBy.toLowerCase());
      const matchesApprovedBy = !selectedFilters.approvedBy || order.approvedBy?.toLowerCase().includes(selectedFilters.approvedBy.toLowerCase());
      
      const matchesOrderDateRange = !selectedFilters.orderDateRange?.from || !selectedFilters.orderDateRange?.to ||
        (new Date(order.orderDate) >= new Date(selectedFilters.orderDateRange.from) &&
         new Date(order.orderDate) <= new Date(selectedFilters.orderDateRange.to));
         
      const matchesDeliveryDateRange = !selectedFilters.deliveryDateRange?.from || !selectedFilters.deliveryDateRange?.to ||
        (new Date(order.deliveryDate) >= new Date(selectedFilters.deliveryDateRange.from) &&
         new Date(order.deliveryDate) <= new Date(selectedFilters.deliveryDateRange.to));
      
      const matchesAmountRange = (!selectedFilters.amountRange?.min || order.total >= Number(selectedFilters.amountRange.min)) &&
        (!selectedFilters.amountRange?.max || order.total <= Number(selectedFilters.amountRange.max));
        
      const matchesPaidAmountRange = (!selectedFilters.paidAmountRange?.min || order.paidAmount >= Number(selectedFilters.paidAmountRange.min)) &&
        (!selectedFilters.paidAmountRange?.max || order.paidAmount <= Number(selectedFilters.paidAmountRange.max));
      
      return matchesSearch && matchesStatus && matchesVendor && matchesPONumber && matchesVendorContact &&
        matchesFilterStatus && matchesPaymentMethod && matchesCreatedBy && matchesApprovedBy &&
        matchesOrderDateRange && matchesDeliveryDateRange && matchesAmountRange && matchesPaidAmountRange;
    });
  }, [purchaseOrders, searchTerm, selectedStatus, selectedFilters]);

  const sortedOrders = useMemo(() => {
    const arr = [...filteredOrders];
    if (sortConfig.field === 'orderDate') {
      // Newest-first by order date, then Mongo id as a creation-time tiebreaker
      arr.sort((a, b) => {
        const dateCmp = (b.orderDate || '').localeCompare(a.orderDate || '');
        const cmp = dateCmp !== 0 ? dateCmp : (b.id || '').localeCompare(a.id || '');
        return sortConfig.direction === 'desc' ? cmp : -cmp;
      });
    } else {
      const field = sortConfig.field as keyof PurchaseOrder;
      arr.sort((a, b) => {
        const aValue = a[field] as any;
        const bValue = b[field] as any;
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return arr;
  }, [filteredOrders, sortConfig]);

  // Infinite scroll for mobile
  const { displayedItems: mobileDisplayedItems, hasMoreItems, isLoading, loadMoreItems } = useInfiniteScroll({
    data: sortedOrders,
    itemsPerPage: 10,
    enabled: isMobile
  });

  // Pagination logic — page count comes from server total
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPageData = isMobile ? mobileDisplayedItems : sortedOrders;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedFilters, sortConfig]);

  // Event handlers
  const handleViewOrder = async (order: PurchaseOrder) => {
    setEditingOrder(order);
    setSheetMode('view');
    const detail = await purchaseOrderService.fetchPurchaseOrderById(order.id);
    if (detail) setEditingOrder(detail);
  };

  const handleEditOrder = async (order: PurchaseOrder) => {
    setEditingOrder(order);
    setSheetMode('edit');
    const detail = await purchaseOrderService.fetchPurchaseOrderById(order.id);
    if (detail) setEditingOrder(detail);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await purchaseOrderService.deletePurchaseOrder(orderId);
      await loadPurchaseOrders();
      await loadStats();
      toast({ title: 'Success', description: 'Purchase order deleted successfully.', variant: 'success' });
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      toast({ title: 'Error', description: 'Failed to delete purchase order. Please try again.', variant: 'destructive' });
    }
  };

  const handleSaveOrder = async (orderData: PurchaseOrder) => {
    try {
      // A real MongoDB ObjectId is 24 hex chars; frontend-generated ids like "po-<timestamp>" are not
      const isRealId = /^[0-9a-f]{24}$/i.test(orderData.id);
      if (isRealId) {
        await purchaseOrderService.updatePurchaseOrder(orderData.id, orderData);
        toast({ title: 'Success', description: 'Purchase order updated successfully.', variant: 'success' });
      } else {
        await purchaseOrderService.createPurchaseOrder(orderData);
        toast({ title: 'Success', description: 'Purchase order created successfully.', variant: 'success' });
      }
      await loadPurchaseOrders();
      await loadStats();
      setIsNewOrderOpen(false);
      setEditingOrder(null);
    } catch (error) {
      console.error('Error saving purchase order:', error);
      toast({ title: 'Error', description: 'Failed to save purchase order. Please try again.', variant: 'destructive' });
    }
  };

  const handleApplyFilters = (filters: any) => {
    setSelectedFilters(filters);
    setIsFilterModalOpen(false);
  };

  const handleApplySort = (sortConfig: { field: string; direction: 'asc' | 'desc' }) => {
    setSortConfig(sortConfig);
    setIsSortModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards Section */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Total" value={stats.totalOrders} icon={Package} accent={STAT_ACCENTS.PRIMARY}
            active={selectedStatus === 'All'} onClick={() => setSelectedStatus('All')} />
          <StatCard label="Pending" value={stats.pendingOrders} icon={Clock} accent={STAT_ACCENTS.WARNING}
            active={selectedStatus === 'Pending'} onClick={() => setSelectedStatus(selectedStatus === 'Pending' ? 'All' : 'Pending')} />
          <StatCard label="Approved" value={stats.approvedOrders} icon={CheckCircle} accent={STAT_ACCENTS.SUCCESS}
            active={selectedStatus === 'Approved'} onClick={() => setSelectedStatus(selectedStatus === 'Approved' ? 'All' : 'Approved')} />
          <StatCard label="Delivered" value={stats.deliveredOrders} icon={TrendingUp} accent={STAT_ACCENTS.CYAN}
            active={selectedStatus === 'Delivered'} onClick={() => setSelectedStatus(selectedStatus === 'Delivered' ? 'All' : 'Delivered')} />
          <StatCard label="Value" value={formatIndianCurrency(stats.totalValue)} icon={DollarSign} accent={STAT_ACCENTS.PURPLE} />
          <StatCard label="Avg Order" value={stats.totalOrders > 0 ? formatIndianCurrency(stats.averageOrderValue) : formatIndianCurrency(0)} icon={Package} accent={STAT_ACCENTS.WARNING} />
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
              <Input type="search" placeholder="Search PO, vendor…"
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
              <Input type="search" placeholder="Search orders…"
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

      {/* Purchase Orders Table Section */}
      {isLoadingData ? (
        <Card className="border-border/50 shadow-sm">
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading purchase orders...</p>
            </div>
          </div>
        </Card>
      ) : currentPageData.length === 0 ? (
        <Card className="border-border/50 shadow-sm">
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-2">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No purchase orders found</p>
            </div>
          </div>
        </Card>
      ) : (
      <MobileTableView
        data={currentPageData}
        columns={[
          {
            key: 'poNumber',
            label: 'PO Details',
            width: 'w-[18%]',
            render: (value, order) => (
              <div>
                <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{value as string}</p>
                <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>
                  {(order as any).items?.length ?? 0} items{(order as any).createdBy ? ` · ${(order as any).createdBy}` : ''}
                </p>
              </div>
            ),
          },
          {
            key: 'vendorName',
            label: 'Vendor',
            width: 'w-[20%]',
            render: (value, order) => (
              <div>
                <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{value as string}</p>
                <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>{(order as any).vendorPhone}</p>
                {(order as any).actor && (
                  <p className="text-[10px] mt-0.5 font-medium" style={{ color: TEXT_MUTE }}>via {(order as any).actor}</p>
                )}
              </div>
            ),
          },
          {
            key: 'status',
            label: 'Workflow',
            width: 'w-[15%]',
            render: (value, order) => {
              const o = order as PurchaseOrder;
              const stage = PO_STAGE[value as string];
              return (
                <div>
                  <StatusBadge status={value as string} />
                  {stage && (
                    <p className="text-[10px] mt-1 font-semibold" style={{ color: stage.color }}>{stage.label}</p>
                  )}
                  {o.approvedBy && (
                    <p className="text-[10px] mt-0.5" style={{ color: TEXT_MUTE }}>by {o.approvedBy}</p>
                  )}
                  {o.createdBy && !o.approvedBy && value === 'Pending' && (
                    <p className="text-[10px] mt-0.5" style={{ color: TEXT_MUTE }}>by {o.createdBy}</p>
                  )}
                </div>
              );
            },
          },
          {
            key: 'orderDate',
            label: 'Timeline',
            width: 'w-[20%]',
            render: (value, order) => (
              <div>
                <div className="flex items-center gap-1">
                  <Calendar size={11} style={{ color: TEXT_MUTE }} />
                  <p className="text-sm" style={{ color: TEXT_MAIN }}>{value as string}</p>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>Due: {(order as any).deliveryDate}</p>
                {(order as any).fulfilmentDate && (
                  <p className="text-[11px] mt-0.5" style={{ color: SUCCESS }}>Delivered: {(order as any).fulfilmentDate}</p>
                )}
              </div>
            ),
          },
          {
            key: 'total',
            label: 'Payment',
            width: 'w-[17%]',
            render: (value, order) => {
              const o = order as PurchaseOrder;
              const total = value as number;
              const paid = o.paidAmount || 0;
              const balance = Math.max(0, total - paid);
              const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
              return (
                <div>
                  <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(total)}</p>
                  {total > 0 && (
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden w-20" style={{ background: 'hsl(158,70%,36%,0.15)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct === 100 ? 'hsl(158,70%,36%)' : 'hsl(33,92%,48%)' }} />
                    </div>
                  )}
                  <div className="flex gap-2 mt-0.5 flex-wrap">
                    {paid > 0 ? (
                      <>
                        <span className="text-[10px] font-medium" style={{ color: 'hsl(158,70%,36%)' }}>Pd {formatIndianCurrency(paid)}</span>
                        {balance > 0 && <span className="text-[10px] font-medium" style={{ color: 'hsl(33,92%,48%)' }}>Due {formatIndianCurrency(balance)}</span>}
                      </>
                    ) : (
                      <span className="text-[10px] font-medium" style={{ color: 'hsl(33,92%,48%)' }}>Due {formatIndianCurrency(total)}</span>
                    )}
                  </div>
                  {o.paymentMethod && <p className="text-[10px] mt-0.5" style={{ color: TEXT_MUTE }}>{o.paymentMethod}</p>}
                </div>
              );
            },
          },
        ]}
        stickyHeader={true}
        renderMobileItem={(order, onView) => <POMobileCard order={order as PurchaseOrder} onClick={onView} />}
        getActions={(order) => {
          const settled = order.status === 'Delivered' || order.status === 'Cancelled';
          return [
            { label: 'View', onClick: () => handleViewOrder(order), icon: Eye },
            { label: 'Edit', onClick: () => handleEditOrder(order), icon: Edit, disabled: settled, disabledReason: settled ? 'Cannot edit settled order' : undefined },
            { label: 'Delete', onClick: () => setDeleteTarget(order.id), variant: 'destructive' as const, icon: Trash2, disabled: settled, disabledReason: settled ? 'Cannot delete settled order' : undefined },
          ];
        }}
        onRowClick={(order) => handleViewOrder(order)}
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
                Showing {mobileDisplayedItems.length} of {sortedOrders.length} orders
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
              All {sortedOrders.length} orders loaded
            </div>
          )}
        </div>
      )}

      {/* Purchase Order Sheet (view / edit / add) */}
      {(isNewOrderOpen || editingOrder) && (
        <PurchaseOrderSheet
          key={editingOrder?.id ?? 'new'}
          order={editingOrder}
          vendors={vendorOptions}
          mode={isNewOrderOpen ? 'add' : sheetMode}
          onClose={() => {
            setIsNewOrderOpen(false);
            setEditingOrder(null);
            setSheetMode('view');
          }}
          onSave={(savedOrder) => {
            if (sheetMode === 'view' && editingOrder) {
              setSheetMode('edit');
              return;
            }
            handleSaveOrder(savedOrder);
          }}
          onUpdate={async (updatedOrder) => {
            await handleSaveOrder(updatedOrder);
          }}
          onDelete={(id: string) => setDeleteTarget(id)}
          onRefresh={async () => {
            await loadPurchaseOrders();
            await loadStats();
          }}
        />
      )}

      {/* Filter Modal */}
      <PurchaseOrderFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        vendors={vendors}
      />

      {/* Sort Modal */}
      <PurchaseOrderSortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={handleApplySort}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete purchase order?"
        description="This will permanently remove this purchase order. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteTarget ? handleDeleteOrder(deleteTarget) : Promise.resolve()}
      />
    </div>
  );
};