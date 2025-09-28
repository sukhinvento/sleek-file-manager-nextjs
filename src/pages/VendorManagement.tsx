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
import { ModernVendorOverlay } from '@/components/vendor/ModernVendorOverlay';
import { Vendor } from '@/types/inventory';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

// Extended vendor interface
interface VendorWithRisk extends Vendor {
  riskLevel: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// Sample vendor data
const vendorsData: VendorWithRisk[] = [
  {
    id: '1',
    vendorId: 'V001',
    name: 'PharmaCorp Ltd',
    contactPerson: 'John Anderson',
    phone: '+1-555-0123',
    email: 'john@pharmacorp.com',
    address: '123 Industrial Blvd',
    city: 'New York',
    state: 'NY',
    category: 'Pharmaceuticals',
    status: 'Active',
    totalOrders: 45,
    totalValue: 125000.50,
    creditLimit: 50000.00,
    outstandingBalance: 12500.00,
    paymentTerms: 'Net 30',
    registrationDate: '2023-01-15',
    riskLevel: 'Low'
  },
  {
    id: '2',
    vendorId: 'V002',
    name: 'MedSupply Co',
    contactPerson: 'Sarah Wilson',
    phone: '+1-555-0124',
    email: 'sarah@medsupply.com',
    address: '456 Healthcare Ave',
    city: 'Chicago',
    state: 'IL',
    category: 'Medical Supplies',
    status: 'Active',
    totalOrders: 32,
    totalValue: 89000.25,
    creditLimit: 30000.00,
    outstandingBalance: 8500.00,
    paymentTerms: 'Net 15',
    registrationDate: '2023-03-20',
    riskLevel: 'Medium'
  },
  {
    id: '3',
    vendorId: 'V003',
    name: 'Equipment Plus',
    contactPerson: 'Mike Johnson',
    phone: '+1-555-0125',
    email: 'mike@equipmentplus.com',
    address: '789 Medical Dr',
    city: 'Boston',
    state: 'MA',
    category: 'Medical Equipment',
    status: 'Inactive',
    totalOrders: 18,
    totalValue: 245000.00,
    creditLimit: 100000.00,
    outstandingBalance: 25000.00,
    paymentTerms: 'Net 45',
    registrationDate: '2022-11-10',
    riskLevel: 'High'
  }
];

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
    <Badge className={`${getStatusColor(status)} border`}>
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
    <Badge variant="outline" className={`${getStatusColor(level)} text-xs`}>
      {level} Risk
    </Badge>
  );
};

export const VendorManagement = () => {
  const isMobile = useIsMobile();
  
  // Data state
  const [vendors, setVendors] = useState<VendorWithRisk[]>(vendorsData);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modal states
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorWithRisk | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [vendors, searchTerm, selectedStatus, selectedCategory]);

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
  }, [searchTerm, selectedStatus, selectedCategory]);

  // Calculate summary metrics
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(vendor => vendor.status === 'Active').length;
  const totalValue = vendors.reduce((sum, vendor) => sum + vendor.totalValue, 0);
  const totalOutstanding = vendors.reduce((sum, vendor) => sum + vendor.outstandingBalance, 0);
  const highRiskVendors = vendors.filter(vendor => vendor.riskLevel === 'High').length;

  // Event handlers
  const handleViewVendor = (vendor: VendorWithRisk) => {
    setEditingVendor(vendor);
    setIsEditMode(false);
  };

  const handleEditVendor = (vendor: VendorWithRisk) => {
    setEditingVendor(vendor);
    setIsEditMode(true);
  };

  const handleDeleteVendor = (vendorId: string) => {
    setVendors(vendors.filter(vendor => vendor.vendorId !== vendorId));
    toast({
      title: "Vendor Deleted",
      description: "Vendor has been successfully deleted.",
    });
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
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalVendors}</div>
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
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{activeVendors}</div>
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
                        strokeDasharray={`${(activeVendors / totalVendors) * 75.4} 75.4`}
                        className="text-emerald-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-emerald-700 leading-none">
                        {Math.round((activeVendors / totalVendors) * 100)}%
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
                      ${(totalValue / 1000).toFixed(0)}K
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
                    <span className="text-purple-600">Vendors: {totalVendors}</span>
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
                      ${(totalOutstanding / 1000).toFixed(0)}K
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
                        style={{ width: `${(totalOutstanding / totalValue) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-amber-700">{Math.round((totalOutstanding / totalValue) * 100)}%</span>
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
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">{highRiskVendors}</div>
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
                    <span className="text-xs font-bold text-red-700">{Math.round((highRiskVendors / totalVendors) * 100)}%</span>
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
            <Button variant="outline" size="sm">
              <Filter className="mr-1 h-4 w-4" /> 
              Filters
            </Button>
            <Button variant="outline" size="sm">
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
            <Button variant="outline" size="sm" className="px-2 sm:px-3">
              <Filter className="h-4 w-4 sm:mr-1" /> 
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <Button variant="outline" size="sm" className="px-2 sm:px-3">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Vendor Details</TableHead>
                    <TableHead className="font-semibold">Contact Info</TableHead>
                    <TableHead className="font-semibold">Category & Status</TableHead>
                    <TableHead className="font-semibold">Performance</TableHead>
                    <TableHead className="font-semibold">Financial</TableHead>
                    <TableHead className="font-semibold w-12"></TableHead>
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
                        <div className="space-y-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {vendor.category}
                          </Badge>
                          <StatusBadge status={vendor.status} />
                          <RiskBadge level={vendor.riskLevel} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-lg font-bold">{vendor.totalOrders}</div>
                          <div className="text-xs text-muted-foreground">Orders</div>
                          <div className="text-sm font-semibold text-green-600">
                            ${(vendor.totalValue / 1000).toFixed(0)}K
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">
                            Credit: ${(vendor.creditLimit / 1000).toFixed(0)}K
                          </div>
                          <div className={`text-sm font-semibold ${
                            vendor.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            Outstanding: ${(vendor.outstandingBalance / 1000).toFixed(0)}K
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
          </Card>

          {/* Desktop Pagination */}
          {!isMobile && totalPages > 1 && (
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
              <Card key={vendor.id} className="mb-3">
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
                      <p className="font-bold text-green-600">${(vendor.totalValue / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                 </CardContent>
               </Card>
             ))}
         </div>
      </div>

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
        onSave={(newVendor: any) => {
          setVendors([...vendors, newVendor]);
          setIsAddVendorOpen(false);
        }}
        onUpdate={(updatedVendor: any) => {
          setVendors(vendors.map(v => v.id === updatedVendor.id ? updatedVendor : v));
          setEditingVendor(null);
          setIsEditMode(false);
        }}
        onDelete={(vendorId: string) => {
          setVendors(vendors.filter(v => v.vendorId !== vendorId));
          setEditingVendor(null);
        }}
      />
    </div>
  );
};