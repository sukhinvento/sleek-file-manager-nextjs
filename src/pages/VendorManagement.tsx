import React, { useState, useMemo, useEffect } from 'react';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import { VendorFilterModal } from '@/components/vendor/VendorFilterModal';
import { VendorSortModal } from '@/components/vendor/VendorSortModal';
import { ModernVendorOverlay } from '@/components/vendor/ModernVendorOverlay';
import { Vendor } from '@/types/inventory';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { formatIndianCurrency, formatIndianQuantity } from '@/lib/utils';
import { countActiveFilters } from '@/lib/filterUtils';
import * as vendorService from '@/services/vendorService';
import { VendorWithRisk } from '@/services/vendorService';

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
    <Badge className={`${getStatusColor(status)} border pointer-events-none`}>
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
    <Badge variant="outline" className={`${getStatusColor(level)} text-xs pointer-events-none`}>
      {level} Risk
    </Badge>
  );
};

export const VendorManagement = () => {
  const isMobile = useIsMobile();
  
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
  
  // Modal states
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorWithRisk | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  
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

  // Load vendors from service
  const loadVendors = async () => {
    try {
      setIsLoadingData(true);
      const data = await vendorService.fetchVendors();
      setVendors(data);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast({
        title: "Error",
        description: "Failed to load vendors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Load stats from service
  const loadStats = async () => {
    try {
      const statsData = await vendorService.fetchVendorStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadVendors();
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

  // Get unique values for filters
  const statuses = ['All', ...Array.from(new Set(vendors.map(vendor => vendor.status)))];
  const categories = ['All', ...Array.from(new Set(vendors.map(vendor => vendor.category)))];

  // Count active filters
  const activeFilterCount = useMemo(() => countActiveFilters(selectedFilters), [selectedFilters]);
  const hasFilters = activeFilterCount > 0;
  const hasSort = sortConfig.field !== 'name' || sortConfig.direction !== 'asc';

  // Filter logic
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = !searchTerm || 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.vendorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'All' || vendor.status === selectedStatus;
      const matchesCategory = selectedCategory === 'All' || vendor.category === selectedCategory;
      
      const matchesVendorId = !selectedFilters.vendorId || vendor.vendorId.toLowerCase().includes(selectedFilters.vendorId.toLowerCase());
      const matchesContactPerson = !selectedFilters.contactPerson || vendor.contactPerson.toLowerCase().includes(selectedFilters.contactPerson.toLowerCase());
      const matchesPhone = !selectedFilters.phone || vendor.phone.toLowerCase().includes(selectedFilters.phone.toLowerCase());
      const matchesEmail = !selectedFilters.email || vendor.email.toLowerCase().includes(selectedFilters.email.toLowerCase());
      const matchesCity = !selectedFilters.city || vendor.city?.toLowerCase().includes(selectedFilters.city.toLowerCase());
      const matchesState = !selectedFilters.state || vendor.state?.toLowerCase().includes(selectedFilters.state.toLowerCase());
      const matchesFilterCategory = !selectedFilters.category || selectedFilters.category === 'All' || vendor.category === selectedFilters.category;
      const matchesFilterStatus = !selectedFilters.status || selectedFilters.status === 'All' || vendor.status === selectedFilters.status;
      const matchesPaymentTerms = !selectedFilters.paymentTerms || vendor.paymentTerms.toLowerCase().includes(selectedFilters.paymentTerms.toLowerCase());
      
      const matchesRegDateRange = !selectedFilters.registrationDateRange?.from || 
        (new Date(vendor.registrationDate) >= new Date(selectedFilters.registrationDateRange.from) &&
         (!selectedFilters.registrationDateRange.to || new Date(vendor.registrationDate) <= new Date(selectedFilters.registrationDateRange.to)));
      
      const matchesCreditLimit = (!selectedFilters.creditLimitRange?.min || vendor.creditLimit >= Number(selectedFilters.creditLimitRange.min)) &&
        (!selectedFilters.creditLimitRange?.max || vendor.creditLimit <= Number(selectedFilters.creditLimitRange.max));
      
      const matchesOutstanding = (!selectedFilters.outstandingBalanceRange?.min || vendor.outstandingBalance >= Number(selectedFilters.outstandingBalanceRange.min)) &&
        (!selectedFilters.outstandingBalanceRange?.max || vendor.outstandingBalance <= Number(selectedFilters.outstandingBalanceRange.max));
      
      return matchesSearch && matchesStatus && matchesCategory && matchesVendorId && matchesContactPerson &&
        matchesPhone && matchesEmail && matchesCity && matchesState && matchesFilterCategory && matchesFilterStatus &&
        matchesPaymentTerms && matchesRegDateRange && matchesCreditLimit && matchesOutstanding;
    });
  }, [vendors, searchTerm, selectedStatus, selectedCategory, selectedFilters]);

  // Infinite scroll for mobile
  const { displayedItems: mobileDisplayedItems, hasMoreItems, isLoading, loadMoreItems } = useInfiniteScroll({
    data: filteredVendors,
    itemsPerPage: 10,
    enabled: isMobile
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const currentPageData = isMobile 
    ? mobileDisplayedItems
    : filteredVendors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedCategory, selectedFilters]);

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
      toast({
        title: "Success",
        description: "Vendor deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast({
        title: "Error",
        description: "Failed to delete vendor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveVendor = async (vendorData: VendorWithRisk) => {
    try {
      if (vendorData.id && (vendorData.id.startsWith('v-') || vendorData.id.match(/^\d+$/))) {
        // Update existing vendor
        await vendorService.updateVendor(vendorData.id, vendorData);
        toast({
          title: "Success",
          description: "Vendor updated successfully.",
        });
      } else {
        // Create new vendor
        await vendorService.createVendor(vendorData);
        toast({
          title: "Success",
          description: "Vendor created successfully.",
        });
      }
      await loadVendors();
      await loadStats();
      setIsAddVendorOpen(false);
      setEditingVendor(null);
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast({
        title: "Error",
        description: "Failed to save vendor. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards Section */}
      <section className="bg-card space-y-3 lg:space-y-0 overflow-hidden sm:mx-0">
        <div className="h-scroll py-4">
          <div className="flex flex-nowrap gap-3 sm:gap-4 w-max">
            {/* Total Vendors Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Vendors</p>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalVendors}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center z-10">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                {/* Mini Chart */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1">
                    <div className="flex items-end gap-px h-4">
                      {[3, 5, 4, 6, 8, 7, 9, 8].map((height, i) => (
                        <div 
                          key={i} 
                          className="bg-blue-400 rounded-sm flex-1 opacity-70"
                          style={{ height: `${height * 2}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    +5%
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <Building2 className="absolute bottom-0 right-0 h-12 w-12 text-blue-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Active Vendors Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active</p>
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.activeVendors}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center z-10">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
                
                {/* Progress Circle */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-8 h-8 transform -rotate-90">
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        className="text-emerald-200"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        strokeDasharray={`${(stats.activeVendors / stats.totalVendors) * 75.4} 75.4`}
                        className="text-emerald-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-emerald-700 leading-none">
                        {Math.round((stats.activeVendors / stats.totalVendors) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-emerald-800">Online</p>
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <TrendingUp className="absolute bottom-0 right-0 h-12 w-12 text-emerald-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Total Value Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Total Value</p>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {formatIndianCurrency(stats.totalValue)}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center z-10">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </div>
                
                {/* Value Breakdown */}
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span className="text-purple-600">Vendors: {stats.totalVendors}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-purple-700 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    <span>+18%</span>
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <CreditCard className="absolute bottom-0 right-0 h-12 w-12 text-purple-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Outstanding Balance Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Outstanding</p>
                    <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                      {formatIndianCurrency(stats.outstandingBalance)}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center z-10">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                </div>
                
                {/* Status Indicators */}
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-amber-200 rounded-full h-1.5">
                      <div 
                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${stats.totalValue > 0 ? (stats.outstandingBalance / stats.totalValue) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-amber-700">{stats.totalValue > 0 ? Math.round((stats.outstandingBalance / stats.totalValue) * 100) : 0}%</span>
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <AlertCircle className="absolute bottom-0 right-0 h-12 w-12 text-amber-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* High Risk Vendors Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">High Risk</p>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.highRiskVendors}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center z-10">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="space-y-1 mb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-600">Risk Level</span>
                    <span className="text-xs font-bold text-red-700">{Math.round((stats.highRiskVendors / stats.totalVendors) * 100)}%</span>
                  </div>
                  <div className="grid grid-cols-6 gap-px">
                    {[2, 1, 3, 0, 1, 2].map((height, i) => (
                      <div 
                        key={i} 
                        className="bg-red-400 rounded-sm h-1"
                        style={{ opacity: height > 0 ? 0.7 : 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
              
              {/* Background Icon */}
              <AlertCircle className="absolute bottom-0 right-0 h-12 w-12 text-red-500/5 transform translate-x-3 translate-y-3" />
            </Card>
          </div>
        </div>
      </section>

      {/* Filters Section - Sticky */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-4 space-y-3 lg:space-y-0 overflow-hidden sm:mx-0 mt-4 lg:mt-6">
        {/* Desktop Layout - All in one line */}
        <div className="hidden lg:flex lg:items-center lg:gap-4 lg:justify-between">
          {/* Status Filter Pills */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-2 pb-2 w-max min-w-0">
              {statuses.map(status => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  className="rounded-full whitespace-nowrap text-sm px-3 py-1 animate-fade-in"
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
                placeholder="Search vendors, contacts..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsFilterModalOpen(true)}
              className={hasFilters ? "bg-primary/10 border-primary/20 hover:bg-primary/20" : ""}
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
              className={hasSort ? "bg-primary/10 border-primary/20 hover:bg-primary/20" : ""}
            >
              <ArrowUpDown className="mr-1 h-4 w-4" /> 
              Sort
            </Button>
          </div>
        </div>

        {/* Mobile/Tablet Layout - Stacked */}
        <div className="lg:hidden space-y-3">
          {/* Status Filter Pills */}
          <div className="overflow-x-auto overflow-y-hidden">
            <div className="flex gap-2 pb-2 w-max min-w-full">
              {statuses.map(status => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  className="rounded-full whitespace-nowrap text-xs sm:text-sm px-3 py-1 animate-fade-in"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Search and Action Buttons */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search vendors..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="px-2 sm:px-3" 
              onClick={() => setIsFilterModalOpen(true)}
              {...(hasFilters && { className: "px-2 sm:px-3 bg-primary/10 border-primary/20 hover:bg-primary/20" })}
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
              className="px-2 sm:px-3" 
              onClick={() => setIsSortModalOpen(true)}
              {...(hasSort && { className: "px-2 sm:px-3 bg-primary/10 border-primary/20 hover:bg-primary/20" })}
            >
              <ArrowUpDown className="h-4 w-4 sm:mr-1" /> 
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card className="border-border/50 shadow-sm">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold w-[20%]">Vendor Details</TableHead>
                    <TableHead className="font-semibold w-[18%]">Contact Info</TableHead>
                    <TableHead className="font-semibold w-[18%]">Category & Status</TableHead>
                    <TableHead className="font-semibold w-[19%]">Performance</TableHead>
                    <TableHead className="font-semibold w-[20%]">Financial</TableHead>
                    <TableHead className="font-semibold w-[5%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageData.map((vendor) => (
                    <TableRow key={vendor.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div>
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {vendor.vendorId}</div>
                          <div className="text-sm text-muted-foreground">{vendor.contactPerson}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 mr-2" />
                            {vendor.phone}
                          </div>
                          <div className="flex items-center text-sm">
                            <Mail className="w-4 h-4 mr-2" />
                            <span className="truncate max-w-[150px]">{vendor.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" />
                            {vendor.city}, {vendor.state}
                          </div>
                        </div>
                      </TableCell>
                       <TableCell>
                         <div className="space-y-1">
                           <div>
                             <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 pointer-events-none">
                               {vendor.category}
                             </Badge>
                           </div>
                           <div><StatusBadge status={vendor.status} /></div>
                           <div><RiskBadge level={vendor.riskLevel} /></div>
                         </div>
                       </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-lg font-bold">{vendor.totalOrders}</div>
                          <div className="text-xs text-muted-foreground">Orders</div>
                          <div className="text-sm font-semibold text-green-600">
                            {formatIndianCurrency(vendor.totalValue)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">
                            Credit: {formatIndianCurrency(vendor.creditLimit)}
                          </div>
                          <div className={`text-sm font-semibold ${
                            vendor.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            Outstanding: {formatIndianCurrency(vendor.outstandingBalance)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {vendor.paymentTerms}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewVendor(vendor)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditVendor(vendor)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteVendor(vendor.vendorId)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}
          </Card>

          {/* Desktop Pagination */}
          {!isMobile && !isLoadingData && totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const page = i + Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
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

        {/* Mobile Cards View */}
        <div className="md:hidden">
          {mobileDisplayedItems.map((vendor: VendorWithRisk) => (
              <Card key={vendor.id} className="mb-3 animate-fade-in hover-scale cursor-pointer transition-all duration-200 shadow-lg" onClick={() => handleViewVendor(vendor)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{vendor.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {vendor.vendorId}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewVendor(vendor);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditVendor(vendor);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVendor(vendor.vendorId);
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Contact Person</p>
                      <p className="font-medium">{vendor.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <StatusBadge status={vendor.status} />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {vendor.category}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Risk Level</p>
                      <RiskBadge level={vendor.riskLevel} />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Orders</p>
                      <p className="font-medium">{vendor.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Value</p>
                      <p className="font-bold text-green-600">{formatIndianCurrency(vendor.totalValue)}</p>
                    </div>
                  </div>
                 </CardContent>
               </Card>
             ))}
         </div>
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
        onDelete={handleDeleteVendor}
      />
    </div>
  );
};