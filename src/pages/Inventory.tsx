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
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Tag,
  ShoppingCart
} from 'lucide-react';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import { InventoryFilterModal } from '@/components/inventory/InventoryFilterModal';
import { InventorySortModal } from '@/components/inventory/InventorySortModal';
import InventorySheet from '@/components/inventory/InventorySheet';
import PurchaseOrderSheet from '@/components/purchase-orders/PurchaseOrderSheet';
import { InventoryItem } from '@/types/inventory';
import { PurchaseOrder } from '@/types/purchaseOrder';
import { EntityOption } from '@/types/shared';
import * as purchaseOrderService from '@/services/purchaseOrderService';
import * as vendorService from '@/services/vendorService';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from '@/hooks/use-toast';
import { formatIndianCurrency, formatIndianQuantity } from '@/lib/utils';
import { countActiveFilters } from '@/lib/filterUtils';
import * as inventoryService from '@/services/inventoryService';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// ── Design tokens ────────────────────────────────────────────────────────────
const PRIMARY   = STAT_ACCENTS.PRIMARY;
const SUCCESS   = STAT_ACCENTS.SUCCESS;
const WARNING   = STAT_ACCENTS.WARNING;
const DANGER    = STAT_ACCENTS.DANGER;
const CYAN      = STAT_ACCENTS.CYAN;
const TEXT_MAIN = 'hsl(215,28%,14%)';
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';

// ── Category colour map ──────────────────────────────────────────────────────
const CAT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Pharmaceuticals:    { bg: `${STAT_ACCENTS.DANGER}14`,  text: STAT_ACCENTS.DANGER,   border: `${STAT_ACCENTS.DANGER}33`  },
  Equipment:          { bg: `${STAT_ACCENTS.CYAN}14`,    text: STAT_ACCENTS.CYAN,     border: `${STAT_ACCENTS.CYAN}33`    },
  Consumables:        { bg: `${STAT_ACCENTS.WARNING}14`, text: STAT_ACCENTS.WARNING,  border: `${STAT_ACCENTS.WARNING}33` },
  'Medical Supplies': { bg: `${STAT_ACCENTS.PRIMARY}14`, text: STAT_ACCENTS.PRIMARY,  border: `${STAT_ACCENTS.PRIMARY}33` },
  Surgical:           { bg: `${STAT_ACCENTS.PURPLE}14`,  text: STAT_ACCENTS.PURPLE,   border: `${STAT_ACCENTS.PURPLE}33`  },
  Diagnostics:        { bg: `${STAT_ACCENTS.SUCCESS}14`, text: STAT_ACCENTS.SUCCESS,  border: `${STAT_ACCENTS.SUCCESS}33` },
};
const catStyle = (cat: string) => CAT_COLORS[cat] ?? { bg: 'hsl(220,12%,54%/0.08)', text: TEXT_MUTE, border: BORDER };

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'out of stock': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border text-[11px] pointer-events-none`}>
      {status}
    </Badge>
  );
};

const InventoryMobileCard = ({ item, onClick }: { item: InventoryItem; onClick?: () => void }) => {
  const getStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return 'Out of Stock';
    if (item.currentStock <= item.minStock * 0.5) return 'Critical';
    if (item.currentStock <= item.minStock) return 'Low';
    return 'Normal';
  };
  const statusColorMap: Record<string, string> = {
    'Normal': 'bg-green-100 text-green-800 border-green-200',
    'Low': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Critical': 'bg-red-100 text-red-800 border-red-200',
    'Out of Stock': 'bg-red-100 text-red-800 border-red-200',
  };
  const status = getStatus(item);
  return (
    <Card className="w-full cursor-pointer active:scale-[0.99] transition-all duration-150 hover:shadow-md" style={{ borderColor: BORDER }} onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
              <Package size={15} style={{ color: PRIMARY }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight" style={{ color: TEXT_MAIN }}>{item.name}</p>
              <p className="text-xs truncate leading-tight mt-0.5" style={{ color: TEXT_MUTE }}>SKU: {item.sku} • {item.category}</p>
            </div>
          </div>
          <Badge className={`${statusColorMap[status] ?? 'bg-gray-100 text-gray-800 border-gray-200'} border pointer-events-none text-xs`}>{status}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Stock</p>
            <p className="text-xs font-medium" style={{ color: TEXT_MAIN }}>{item.currentStock} / {item.minStock} min</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: TEXT_MUTE }}>Unit Price</p>
            <p className="text-sm font-bold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(item.unitPrice)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BORDER }}>
          <span className="text-xs" style={{ color: TEXT_MUTE }}>{item.location || '—'}</span>
          <span className="text-xs" style={{ color: TEXT_MUTE }}>{item.supplier || '—'}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export const Inventory = () => {
  
  // Data state
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    criticalItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    totalCategories: 0,
    averageValue: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Sheet states
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [sheetMode, setSheetMode] = useState<'view' | 'edit' | 'add'>('view');

  // Raise-PO-from-inventory state
  const [poSeed, setPoSeed] = useState<PurchaseOrder | null>(null);
  const [vendorOptions, setVendorOptions] = useState<EntityOption[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 25;

  // Filter states
  const [selectedFilters, setSelectedFilters] = useState({
    sku: '',
    supplier: '',
    manufacturer: '',
    location: '',
    batchNumber: '',
    category: '',
    status: '',
    expiryDateRange: undefined,
    quantityRange: { min: '', max: '' },
    priceRange: { min: '', max: '' }
  });
  
  // Sort state
  const [sortConfig, setSortConfig] = useState({ field: 'name', direction: 'asc' });

  // Load inventory items from service
  const loadInventoryItems = async (page = currentPage) => {
    try {
      setIsLoadingData(true);
      const result = await inventoryService.fetchInventoryItems(page, itemsPerPage);
      setInventoryItems(result.data);
      setTotalItems(result.total);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast({ title: 'Error', description: 'Failed to load inventory items. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load stats from service
  const loadStats = async () => {
    try {
      const statsData = await inventoryService.fetchInventoryStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load vendors for the Raise-PO autosuggest
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

  useEffect(() => { loadInventoryItems(currentPage); }, [currentPage]);

  // Load data on mount
  useEffect(() => {
    loadStats();
    loadVendors();
  }, []);

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'inventory') {
        setIsNewItemOpen(true);
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  // Get unique values for filters
  const categories = ['All', ...Array.from(new Set(inventoryItems.map(item => item.category)))];

  const getItemStatus = (item: InventoryItem): string => {
    if (item.currentStock === 0) return 'Out of Stock';
    if (item.currentStock < item.minStock) return 'Critical';
    if (item.currentStock < item.minStock * 1.5) return 'Low';
    return 'Normal';
  };

  const statuses = ['All', 'Normal', 'Low', 'Critical', 'Out of Stock'];

  // Count active filters
  const activeFilterCount = useMemo(() => countActiveFilters(selectedFilters), [selectedFilters]);
  const hasFilters = activeFilterCount > 0;
  const hasSort = sortConfig.field !== 'name' || sortConfig.direction !== 'asc';

  // Filter logic
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const itemStatus = getItemStatus(item);
      const matchesStatus = selectedStatus === 'All' || itemStatus === selectedStatus;
      
      const matchesSKU = !selectedFilters.sku || item.sku.toLowerCase().includes(selectedFilters.sku.toLowerCase());
      const matchesSupplier = !selectedFilters.supplier || item.supplier.toLowerCase().includes(selectedFilters.supplier.toLowerCase());
      const matchesManufacturer = !selectedFilters.manufacturer || item.manufacturer?.toLowerCase().includes(selectedFilters.manufacturer.toLowerCase());
      const matchesLocation = !selectedFilters.location || item.location?.toLowerCase().includes(selectedFilters.location.toLowerCase());
      const matchesBatchNumber = !selectedFilters.batchNumber || item.batchNumber.toLowerCase().includes(selectedFilters.batchNumber.toLowerCase());
      const matchesFilterCategory = !selectedFilters.category || item.category === selectedFilters.category;
      const matchesFilterStatus = !selectedFilters.status || getItemStatus(item) === selectedFilters.status;
      
      const matchesExpiryDateRange = !selectedFilters.expiryDateRange?.from || !selectedFilters.expiryDateRange?.to || !item.expiryDate ||
        (new Date(item.expiryDate) >= new Date(selectedFilters.expiryDateRange.from) &&
         new Date(item.expiryDate) <= new Date(selectedFilters.expiryDateRange.to));
      
      const matchesQuantityRange = (!selectedFilters.quantityRange?.min || item.currentStock >= Number(selectedFilters.quantityRange.min)) &&
        (!selectedFilters.quantityRange?.max || item.currentStock <= Number(selectedFilters.quantityRange.max));
      
      const matchesPriceRange = (!selectedFilters.priceRange?.min || item.unitPrice >= Number(selectedFilters.priceRange.min)) &&
        (!selectedFilters.priceRange?.max || item.unitPrice <= Number(selectedFilters.priceRange.max));
      
      return matchesSearch && matchesCategory && matchesStatus && matchesSKU && matchesSupplier && 
        matchesManufacturer && matchesLocation && matchesBatchNumber && matchesFilterCategory && 
        matchesFilterStatus && matchesExpiryDateRange && matchesQuantityRange && matchesPriceRange;
    });
  }, [inventoryItems, searchTerm, selectedCategory, selectedStatus, selectedFilters]);

  // Pagination logic
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPageData = filteredItems;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, selectedFilters]);

  // Event handlers
  const handleApplyFilters = (filters: any) => {
    setSelectedFilters(filters);
    setIsFilterModalOpen(false);
  };

  const handleApplySort = (sortConfig: { field: string; direction: 'asc' | 'desc' }) => {
    setSortConfig(sortConfig);
    setIsSortModalOpen(false);
  };

  // Raise a Purchase Order pre-filled from a (low-stock) inventory item
  const handleRaisePO = (item: InventoryItem) => {
    const it = item as any;
    const target = it.maxStock && it.maxStock > 0 ? it.maxStock : item.minStock * 2;
    const reorderQty = Math.max(1, Math.round(target - item.currentStock) || item.minStock || 1);
    const unitPrice = item.unitPrice || 0;
    const seed = {
      id: `po-${Date.now()}`,
      poNumber: '',
      vendorId: it.supplierId || '',
      vendorName: item.supplier || '',
      vendorContact: it.supplierContact || '',
      vendorPhone: it.supplierPhone || '',
      vendorEmail: it.supplierEmail || '',
      vendorAddress: it.supplierAddress || '',
      shippingAddress: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      status: 'Pending',
      items: [{
        item_id: item.id,
        name: item.name,
        qty: reorderQty,
        unitPrice,
        discount: 0,
        subtotal: reorderQty * unitPrice,
        saleUnit: it.saleUnit,
      }],
      total: reorderQty * unitPrice,
      paidAmount: 0,
      paymentMethod: '',
      notes: `Reorder for low stock — ${item.name} (current ${item.currentStock}, min ${item.minStock})`,
    } as unknown as PurchaseOrder;
    setPoSeed(seed);
  };

  const handleCreatePOFromInventory = async (po: PurchaseOrder) => {
    try {
      await purchaseOrderService.createPurchaseOrder(po);
      toast({ title: 'Purchase Order Created', description: `PO raised for ${po.vendorName || 'vendor'}.`, variant: 'success' });
      setPoSeed(null);
    } catch (error) {
      console.error('Error creating PO from inventory:', error);
      toast({ title: 'Error', description: 'Failed to create purchase order. Please try again.', variant: 'destructive' });
    }
  };

  const handleViewItem = (item: InventoryItem) => {
    setEditingItem(item);
    setSheetMode('view');
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setSheetMode('edit');
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await inventoryService.deleteInventoryItem(itemId);
      await loadInventoryItems();
      await loadStats();
      toast({ title: 'Success', description: 'Inventory item deleted successfully.', variant: 'success' });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({ title: 'Error', description: 'Failed to delete inventory item. Please try again.', variant: 'destructive' });
    }
  };

  const handleSaveItem = async (itemData: InventoryItem) => {
    try {
      // MongoDB ObjectIds are 24-char hex strings
      const isRealId = /^[0-9a-f]{24}$/i.test(itemData.id);
      if (isRealId) {
        await inventoryService.updateInventoryItem(itemData.id, itemData);
        toast({ title: 'Success', description: 'Inventory item updated successfully.', variant: 'success' });
      } else {
        await inventoryService.createInventoryItem(itemData);
        toast({ title: 'Success', description: 'Inventory item created successfully.', variant: 'success' });
      }
      await loadInventoryItems();
      await loadStats();
      setIsNewItemOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast({ title: 'Error', description: 'Failed to save inventory item. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards Section */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Total" value={stats.totalItems} icon={Package} accent={STAT_ACCENTS.PRIMARY}
            active={selectedStatus === 'All'} onClick={() => setSelectedStatus('All')} />
          <StatCard label="Critical" value={stats.criticalItems} icon={AlertTriangle} accent={STAT_ACCENTS.DANGER}
            active={selectedStatus === 'Critical'} onClick={() => setSelectedStatus(selectedStatus === 'Critical' ? 'All' : 'Critical')} />
          <StatCard label="Low Stock" value={stats.lowStockItems} icon={Clock} accent={STAT_ACCENTS.WARNING}
            active={selectedStatus === 'Low'} onClick={() => setSelectedStatus(selectedStatus === 'Low' ? 'All' : 'Low')} />
          <StatCard label="Out of Stock" value={stats.outOfStockItems} icon={Tag} accent={STAT_ACCENTS.CYAN}
            active={selectedStatus === 'Out of Stock'} onClick={() => setSelectedStatus(selectedStatus === 'Out of Stock' ? 'All' : 'Out of Stock')} />
          <StatCard label="Value" value={formatIndianCurrency(stats.totalValue)} icon={DollarSign} accent={STAT_ACCENTS.SUCCESS} />
        </div>
      </div>



      {/* Filters Section - Sticky */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3 overflow-hidden">
        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {categories.map(category => (
                <button key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: selectedCategory === category ? PRIMARY : 'transparent',
                    color: selectedCategory === category ? '#fff' : TEXT_MUTE,
                    borderColor: selectedCategory === category ? PRIMARY : BORDER,
                  }}>
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <div className="relative w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input type="search" placeholder="Search items, SKU, supplier…"
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
              <Input type="search" placeholder="Search items…"
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
              {categories.map(category => (
                <button key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: selectedCategory === category ? PRIMARY : 'transparent',
                    color: selectedCategory === category ? '#fff' : TEXT_MUTE,
                    borderColor: selectedCategory === category ? PRIMARY : BORDER,
                  }}>
                  {category}
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
            <p className="text-sm text-muted-foreground">Loading inventory items...</p>
          </div>
        </div>
      ) : currentPageData.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-2">
            <Package className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No inventory items found</p>
          </div>
        </div>
      ) : (
        <MobileTableView
          stickyHeader={true}
          data={currentPageData}
          renderMobileItem={(item, onView) => <InventoryMobileCard item={item as InventoryItem} onClick={onView} />}
          columns={[
            {
              key: 'name',
              label: 'Item',
              width: 'w-[22%]',
              render: (value, item) => (
                <div>
                  <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{value}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>SKU: {(item as any).sku}</p>
                </div>
              ),
            },
            {
              key: 'category',
              label: 'Category',
              width: 'w-[14%]',
              render: (value) => {
                const cs = catStyle(value as string);
                return (
                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full border inline-block"
                    style={{ background: cs.bg, color: cs.text, borderColor: cs.border }}>
                    {value}
                  </span>
                );
              },
            },
            {
              key: 'currentStock',
              label: 'Stock',
              width: 'w-[18%]',
              render: (value, item) => {
                const status = getItemStatus(item as any);
                const col = status === 'Normal' ? SUCCESS : status === 'Low' ? WARNING : DANGER;
                return (
                  <div>
                    <StatusBadge status={status} />
                    <p className="text-[11px] mt-1" style={{ color: TEXT_MUTE }}>
                      <span style={{ color: col, fontWeight: 600 }}>{value as number}</span> / {(item as any).minStock} min
                    </p>
                  </div>
                );
              },
            },
            {
              key: 'unitPrice',
              label: 'Pricing',
              width: 'w-[18%]',
              render: (value, item) => (
                <div>
                  <p className="text-sm font-semibold" style={{ color: TEXT_MAIN }}>{formatIndianCurrency(value as number)}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>Total: {formatIndianCurrency((item as any).currentStock * (value as number))}</p>
                </div>
              ),
            },
            {
              key: 'location',
              label: 'Location',
              width: 'w-[22%]',
              render: (value, item) => (
                <div>
                  <p className="text-sm" style={{ color: TEXT_MAIN }}>{(value as string) || '—'}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: TEXT_MUTE }}>{(item as any).supplier || '—'}</p>
                </div>
              ),
            },
          ]}
          onRowClick={(item) => handleViewItem(item)}
          getActions={(item) => [
            { label: 'View', onClick: () => handleViewItem(item), icon: Eye },
            { label: 'Edit', onClick: () => handleEditItem(item), icon: Edit },
            ...(getItemStatus(item) !== 'Normal'
              ? [{ label: 'Raise PO', onClick: () => handleRaisePO(item), icon: ShoppingCart }]
              : []),
            { label: 'Delete', onClick: () => setDeleteTarget(item.id), variant: 'destructive' as const, icon: Trash2 }
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

      {/* Filter and Sort Modals */}
      <InventoryFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={(filters) => {
          setSelectedFilters(filters);
          setIsFilterModalOpen(false);
        }}
        categories={categories}
      />
      
      <InventorySortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={handleApplySort}
      />

      {/* Inventory Sheet (view / edit / add) */}
      {(isNewItemOpen || editingItem) && (
        <InventorySheet
          key={editingItem?.id ?? 'new'}
          item={editingItem}
          mode={isNewItemOpen ? 'add' : sheetMode}
          onClose={() => {
            setIsNewItemOpen(false);
            setEditingItem(null);
            setSheetMode('view');
          }}
          onSave={(savedItem) => {
            // If view-mode edit button was clicked, reopen in edit mode
            if (sheetMode === 'view' && editingItem) {
              setSheetMode('edit');
              return;
            }
            handleSaveItem(savedItem);
          }}
          onDelete={(id: string) => setDeleteTarget(id)}
        />
      )}

      {/* Raise PO from a low-stock item (opens the Purchase Order sheet in add mode) */}
      {poSeed && (
        <PurchaseOrderSheet
          key={poSeed.id}
          order={poSeed}
          vendors={vendorOptions}
          mode="add"
          onClose={() => setPoSeed(null)}
          onSave={handleCreatePOFromInventory}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete inventory item?"
        description="This will permanently remove this inventory item. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteTarget ? handleDeleteItem(deleteTarget) : Promise.resolve()}
      />
    </div>
  );
};