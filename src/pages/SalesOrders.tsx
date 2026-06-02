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
  AlertTriangle,
  User,
  Calendar
} from 'lucide-react';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import POSOverlay from '@/components/sales-orders/POSOverlay';
import SalesOrderSheet from '@/components/sales-orders/SalesOrderSheet';
import { SalesOrderFilterModal } from '@/components/sales-orders/SalesOrderFilterModal';
import { SalesOrderSortModal } from '@/components/sales-orders/SalesOrderSortModal';
import { SalesOrder } from '@/types/inventory';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from '@/hooks/use-toast';
import { formatIndianCurrency, formatIndianQuantity } from '@/lib/utils';
import { countActiveFilters } from '@/lib/filterUtils';
import * as salesOrderService from '@/services/salesOrderService';
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

const SO_STAGE: Record<string, { label: string; color: string }> = {
  'Pending':           { label: '→ Confirm & Process', color: 'hsl(33,92%,48%)' },
  'Processing':        { label: '→ Ready to Ship',     color: STAT_ACCENTS.PRIMARY },
  'Shipped':           { label: '→ Awaiting Delivery', color: 'hsl(270,60%,50%)' },
  'Delivered':         { label: '✓ Delivered',          color: 'hsl(158,70%,36%)' },
  'Cancelled':         { label: '✗ Cancelled',          color: 'hsl(354,70%,50%)' },
  'Partially Shipped': { label: '→ Partial Dispatch',  color: 'hsl(33,92%,48%)' },
};

const StatusBadge = ({ status, type = 'order' }: { status: string; type?: 'order' | 'payment' }) => {
  const getStatusColor = (status: string, type: string) => {
    if (type === 'payment') {
      switch (status.toLowerCase()) {
        case 'paid': return 'bg-green-100 text-green-800 border-green-200';
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    } else {
      switch (status.toLowerCase()) {
        case 'processing': return 'bg-primary/10 text-primary border-primary/20';
        case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
        case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  return (
    <Badge className={`${getStatusColor(status, type)} border text-[11px] pointer-events-none`}>
      {status}
    </Badge>
  );
};

const SOMobileCard = ({ order, onClick }: { order: SalesOrder; onClick?: () => void }) => {
  return (
    <Card className="w-full cursor-pointer active:scale-[0.99] transition-all duration-150 hover:shadow-md" style={{ borderColor: BORDER }} onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
              <Package size={15} style={{ color: PRIMARY }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: TEXT_MAIN }}>{order.orderNumber}</p>
              <p className="text-xs truncate leading-tight mt-0.5" style={{ color: TEXT_MUTE }}>{order.customerName} • {order.items.length} items</p>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Payment</p>
            <StatusBadge status={order.paymentStatus} type="payment" />
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
            {order.dueDate && <><span className="text-xs mx-0.5" style={{ color: TEXT_MUTE }}>→</span><span className="text-xs" style={{ color: TEXT_MUTE }}>{order.dueDate}</span></>}
          </div>
          <span className="text-xs" style={{ color: TEXT_MUTE }}>{order.paymentMethod || '—'}</span>
          {(order as any).actor && (
            <span className="text-[10px] ml-1" style={{ color: TEXT_MUTE }}>· {(order as any).actor}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const SalesOrders = () => {
  
  // Data state
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    pendingPayments: 0,
    averageOrderValue: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modal/Sheet states
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [sheetMode, setSheetMode] = useState<'view' | 'edit' | 'add'>('view');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [selectedFilters, setSelectedFilters] = useState({
    orderNumber: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    orderDateRange: undefined,
    deliveryDateRange: undefined,
    amountRange: { min: '', max: '' }
  });
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({ field: 'orderDate', direction: 'desc' });

  // Load initial data
  useEffect(() => {
    loadSalesOrders();
    loadStats();
  }, []);

  const loadSalesOrders = async () => {
    try {
      setIsLoadingData(true);
      const orders = await salesOrderService.fetchSalesOrders();
      setSalesOrders(orders);
    } catch (error) {
      console.error('Failed to load sales orders:', error);
      toast({ title: 'Error', description: 'Failed to load sales orders. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadStats = async () => {
    try {
      const fetchedStats = await salesOrderService.fetchSalesOrderStats();
      setStats(fetchedStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'sales-order') {
        setIsPOSOpen(true);
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  // Get unique values for filters
  const statuses = ['All', ...Array.from(new Set(salesOrders.map(order => order.status)))];

  // Count active filters
  const activeFilterCount = useMemo(() => countActiveFilters(selectedFilters), [selectedFilters]);
  const hasFilters = activeFilterCount > 0;
  const hasSort = sortConfig.field !== 'orderDate' || sortConfig.direction !== 'desc';

  // Filter logic
  const filteredOrders = useMemo(() => {
    return salesOrders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
      
      const matchesOrderNumber = !selectedFilters.orderNumber || order.orderNumber.toLowerCase().includes(selectedFilters.orderNumber.toLowerCase());
      const matchesCustomerName = !selectedFilters.customerName || order.customerName.toLowerCase().includes(selectedFilters.customerName.toLowerCase());
      const matchesCustomerEmail = !selectedFilters.customerEmail || order.customerEmail.toLowerCase().includes(selectedFilters.customerEmail.toLowerCase());
      const matchesCustomerPhone = !selectedFilters.customerPhone || order.customerPhone?.toLowerCase().includes(selectedFilters.customerPhone.toLowerCase());
      const matchesFilterStatus = !selectedFilters.status || order.status === selectedFilters.status;
      const matchesPaymentStatus = !selectedFilters.paymentStatus || order.paymentStatus === selectedFilters.paymentStatus;
      const matchesPaymentMethod = !selectedFilters.paymentMethod || order.paymentMethod === selectedFilters.paymentMethod;
      
      const matchesOrderDateRange = !selectedFilters.orderDateRange?.from || !selectedFilters.orderDateRange?.to ||
        (new Date(order.orderDate) >= new Date(selectedFilters.orderDateRange.from) &&
         new Date(order.orderDate) <= new Date(selectedFilters.orderDateRange.to));
         
      const matchesDeliveryDateRange = !selectedFilters.deliveryDateRange?.from || !selectedFilters.deliveryDateRange?.to ||
        (new Date(order.deliveryDate) >= new Date(selectedFilters.deliveryDateRange.from) &&
         new Date(order.deliveryDate) <= new Date(selectedFilters.deliveryDateRange.to));
      
      const matchesAmountRange = (!selectedFilters.amountRange?.min || order.total >= Number(selectedFilters.amountRange.min)) &&
        (!selectedFilters.amountRange?.max || order.total <= Number(selectedFilters.amountRange.max));
      
      return matchesSearch && matchesStatus && matchesOrderNumber && matchesCustomerName && matchesCustomerEmail &&
        matchesCustomerPhone && matchesFilterStatus && matchesPaymentStatus && matchesPaymentMethod &&
        matchesOrderDateRange && matchesDeliveryDateRange && matchesAmountRange;
    });
  }, [salesOrders, searchTerm, selectedStatus, selectedFilters]);

  // Sort logic — default is newest-first (by order date, then Mongo id as a creation-time tiebreaker)
  const sortedOrders = useMemo(() => {
    const arr = [...filteredOrders];
    if (sortConfig.field === 'orderDate') {
      arr.sort((a, b) => {
        const dateCmp = (b.orderDate || '').localeCompare(a.orderDate || '');
        const cmp = dateCmp !== 0 ? dateCmp : (b.id || '').localeCompare(a.id || '');
        return sortConfig.direction === 'desc' ? cmp : -cmp;
      });
    } else {
      const field = sortConfig.field as keyof SalesOrder;
      arr.sort((a, b) => {
        const av = a[field] as any;
        const bv = b[field] as any;
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return arr;
  }, [filteredOrders, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  const currentPageData = sortedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // Event handlers
  const handleApplyFilters = (filters: any) => {
    setSelectedFilters(filters);
    setIsFilterModalOpen(false);
  };

  const handleApplySort = (sortConfig: { field: string; direction: 'asc' | 'desc' }) => {
    setSortConfig(sortConfig);
    setIsSortModalOpen(false);
  };

  const handleViewOrder = async (order: SalesOrder) => {
    setEditingOrder(order);
    setSheetMode('view');
    const detail = await salesOrderService.fetchSalesOrderById(order.id);
    if (detail) setEditingOrder(detail);
  };

  const handleEditOrder = async (order: SalesOrder) => {
    setEditingOrder(order);
    setSheetMode('edit');
    const detail = await salesOrderService.fetchSalesOrderById(order.id);
    if (detail) setEditingOrder(detail);
  };

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await salesOrderService.deleteSalesOrder(orderId);
      toast({ title: 'Sales Order Deleted', description: 'Sales order has been successfully deleted.', variant: 'success' });
      await loadSalesOrders();
      await loadStats();
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast({ title: 'Error', description: 'Failed to delete sales order. Please try again.', variant: 'destructive' });
    }
  };

  const handleSaveOrder = async (orderData: SalesOrder) => {
    try {
      if (orderData.id && editingOrder) {
        // Update existing order
        await salesOrderService.updateSalesOrder(orderData.id, orderData);
        toast({ title: 'Success', description: 'Sales order updated successfully.', variant: 'success' });
      } else {
        // Create new order
        await salesOrderService.createSalesOrder(orderData);
        toast({ title: 'Success', description: 'Sales order created successfully.', variant: 'success' });
      }
      await loadSalesOrders();
      await loadStats();
      setEditingOrder(null);
      setIsPOSOpen(false);
    } catch (error) {
      console.error('Failed to save order:', error);
      toast({ title: 'Error', description: 'Failed to save sales order. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards Section */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Total" value={stats.totalOrders} icon={Package} accent={STAT_ACCENTS.PRIMARY}
            active={selectedStatus === 'All'} onClick={() => setSelectedStatus('All')} />
          <StatCard label="Processing" value={stats.processingOrders} icon={Clock} accent={STAT_ACCENTS.WARNING}
            active={selectedStatus === 'Processing'} onClick={() => setSelectedStatus(selectedStatus === 'Processing' ? 'All' : 'Processing')} />
          <StatCard label="Delivered" value={stats.deliveredOrders} icon={CheckCircle} accent={STAT_ACCENTS.SUCCESS}
            active={selectedStatus === 'Delivered'} onClick={() => setSelectedStatus(selectedStatus === 'Delivered' ? 'All' : 'Delivered')} />
          <StatCard label="Revenue" value={formatIndianCurrency(stats.totalRevenue)} icon={DollarSign} accent={STAT_ACCENTS.CYAN} />
          <StatCard label="Pending ₹" value={formatIndianCurrency(stats.pendingPayments)} icon={AlertTriangle} accent={STAT_ACCENTS.DANGER} />
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
              <Input type="search" placeholder="Search orders, customers…"
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

      {/* Table + Cards */}
      {isLoadingData ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading sales orders...</p>
          </div>
        </div>
      ) : currentPageData.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-2">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No sales orders found</p>
          </div>
        </div>
      ) : (
        <MobileTableView
          stickyHeader={true}
          data={currentPageData}
          renderMobileItem={(order, onView) => <SOMobileCard order={order as SalesOrder} onClick={onView} />}
          columns={[
            {
              key: 'orderNumber',
              label: 'Order',
              width: 'w-[18%]',
              render: (value, order) => (
                <div>
                  <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{value as string}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>{(order as any).items?.length ?? 0} items</p>
                </div>
              ),
            },
            {
              key: 'customerName',
              label: 'Customer',
              width: 'w-[20%]',
              render: (value, order) => (
                <div>
                  <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{value as string}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>{(order as any).customerEmail}</p>
                  {(order as any).actor && (
                    <p className="text-[10px] mt-0.5 font-medium" style={{ color: TEXT_MUTE }}>via {(order as any).actor}</p>
                  )}
                </div>
              ),
            },
            {
              key: 'status',
              label: 'Workflow',
              width: 'w-[16%]',
              render: (value, order) => {
                const o = order as SalesOrder;
                const stage = SO_STAGE[value as string];
                return (
                  <div>
                    <StatusBadge status={value as string} />
                    {stage && (
                      <p className="text-[10px] mt-1 font-semibold" style={{ color: stage.color }}>{stage.label}</p>
                    )}
                    {o.createdBy && (
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
                  {(order as any).dueDate && (
                    <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>Due: {(order as any).dueDate}</p>
                  )}
                </div>
              ),
            },
            {
              key: 'total',
              label: 'Payment',
              width: 'w-[18%]',
              render: (value, order) => {
                const o = order as SalesOrder;
                const total = value as number;
                const paid = o.paidAmount || 0;
                const balance = Math.max(0, total - paid);
                const isPaid = o.paymentStatus === 'Paid';
                const isPartial = o.paymentStatus === 'Partial';
                const isOverdue = o.paymentStatus === 'Overdue';
                const pct = isPaid ? 100 : (total > 0 && paid > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0);
                return (
                  <div>
                    <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(total)}</p>
                    {total > 0 && (
                      <div className="mt-1.5 h-1.5 rounded-full overflow-hidden w-20" style={{ background: 'hsl(158,70%,36%,0.15)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: isPaid ? 'hsl(158,70%,36%)' : isOverdue ? 'hsl(354,70%,50%)' : 'hsl(33,92%,48%)' }} />
                      </div>
                    )}
                    <div className="mt-0.5">
                      {isPaid ? (
                        <span className="text-[10px] font-medium" style={{ color: 'hsl(158,70%,36%)' }}>✓ Fully Paid</span>
                      ) : isPartial && paid > 0 ? (
                        <div className="flex gap-1.5 flex-wrap">
                          <span className="text-[10px] font-medium" style={{ color: 'hsl(158,70%,36%)' }}>Pd {formatIndianCurrency(paid)}</span>
                          <span className="text-[10px] font-medium" style={{ color: 'hsl(33,92%,48%)' }}>Due {formatIndianCurrency(balance)}</span>
                        </div>
                      ) : isOverdue ? (
                        <span className="text-[10px] font-medium" style={{ color: 'hsl(354,70%,50%)' }}>⚠ Overdue {formatIndianCurrency(total)}</span>
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
          onRowClick={(order) => handleViewOrder(order)}
          getActions={(order) => [
            { label: 'View', onClick: () => handleViewOrder(order), icon: Eye },
            { label: 'Edit', onClick: () => handleEditOrder(order), icon: Edit },
            { label: 'Delete', onClick: () => setDeleteTarget(order.id), variant: 'destructive' as const, icon: Trash2 }
          ]}
        />
      )}

      {/* Pagination */}
      {!isLoadingData && totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
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
                <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* POS Overlay for new sales */}
      <POSOverlay
        isOpen={isPOSOpen}
        onClose={() => setIsPOSOpen(false)}
        onComplete={async () => {
          await loadSalesOrders();
          await loadStats();
          setIsPOSOpen(false);
        }}
      />

      {/* Sales Order Sheet for viewing/editing existing orders */}
      {editingOrder && (
        <SalesOrderSheet
          key={editingOrder.id}
          order={editingOrder}
          mode={sheetMode}
          onClose={() => {
            setEditingOrder(null);
            setSheetMode('view');
          }}
          onSave={(savedOrder) => {
            // If view-mode edit was clicked, reopen in edit mode
            if (sheetMode === 'view') {
              setSheetMode('edit');
              return;
            }
            handleSaveOrder(savedOrder);
          }}
          onUpdate={async (updatedOrder) => {
            await handleSaveOrder(updatedOrder);
          }}
          onDelete={handleDeleteOrder}
          onRefresh={async () => {
            await loadSalesOrders();
            await loadStats();
          }}
        />
      )}

      {/* Filter Modal */}
      <SalesOrderFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={(filters) => {
          setSelectedFilters(filters);
          setIsFilterModalOpen(false);
        }}
      />

      {/* Sort Modal */}
      <SalesOrderSortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={handleApplySort}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete sales order?"
        description="This will permanently delete this sales order. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteTarget && handleDeleteOrder(deleteTarget)}
      />
    </div>
  );
};