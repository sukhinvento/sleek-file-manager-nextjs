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
  User
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTableView } from '@/components/ui/mobile-table-view';
import { FilterModal } from '@/components/purchase-orders/FilterModal';
import { SortModal } from '@/components/purchase-orders/SortModal';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

// Sample billing data
const billingRecords = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    patientName: 'John Smith',
    patientId: 'P001',
    department: 'Cardiology',
    doctor: 'Dr. Sarah Johnson',
    date: '2024-01-15',
    dueDate: '2024-02-15',
    amount: 2500.00,
    paidAmount: 2500.00,
    status: 'Paid',
    services: ['Consultation', 'ECG', 'Blood Test']
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    patientName: 'Emily Davis',
    patientId: 'P002',
    department: 'Orthopedics',
    doctor: 'Dr. Michael Brown',
    date: '2024-01-16',
    dueDate: '2024-02-16',
    amount: 4200.00,
    paidAmount: 1500.00,
    status: 'Partial',
    services: ['Surgery', 'X-Ray', 'Physical Therapy']
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    patientName: 'Robert Wilson',
    patientId: 'P003',
    department: 'Emergency',
    doctor: 'Dr. Lisa Anderson',
    date: '2024-01-17',
    dueDate: '2024-02-17',
    amount: 1800.00,
    paidAmount: 0.00,
    status: 'Pending',
    services: ['Emergency Care', 'CT Scan', 'Medication']
  }
];

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
    <Badge className={`${getStatusColor(status)} border`}>
      {status}
    </Badge>
  );
};

export const Billing = () => {
  const isMobile = useIsMobile();
  
  // Data state
  const [invoices, setInvoices] = useState<any[]>(billingRecords);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modal states
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'billing') {
        setIsNewInvoiceOpen(true);
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  // Get unique values for filters
  const statuses = ['All', ...Array.from(new Set(invoices.map(record => record.status)))];

  // Filter logic
  const filteredRecords = useMemo(() => {
    return invoices.filter(record => {
      const matchesSearch = !searchTerm || 
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patientId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'All' || record.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, selectedStatus]);

  // Infinite scroll for mobile
  const { displayedItems: mobileDisplayedItems, hasMoreItems, isLoading, loadMoreItems } = useInfiniteScroll({
    data: filteredRecords,
    itemsPerPage: 10,
    enabled: isMobile
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const currentPageData = isMobile 
    ? mobileDisplayedItems
    : filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // Calculate summary metrics
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, record) => sum + record.amount, 0);
  const totalPaid = invoices.reduce((sum, record) => sum + record.paidAmount, 0);
  const pendingPayments = invoices.filter(record => record.status !== 'Paid').length;

  // Event handlers
  const handleViewInvoice = (invoice: any) => {
    setEditingInvoice(invoice);
    setIsEditMode(false);
  };

  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice(invoice);
    setIsEditMode(true);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
    toast({
      title: "Invoice Deleted",
      description: "Invoice has been successfully deleted.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards Section */}
      <section className="bg-card space-y-3 lg:space-y-0 overflow-hidden sm:mx-0">
        <div className="h-scroll py-4">
          <div className="flex flex-nowrap gap-3 sm:gap-4 w-max">
            {/* Total Invoices Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Invoices</p>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalInvoices}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center z-10">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600">This month</span>
                  </div>
                </div>
              </CardContent>
              
              <FileText className="absolute bottom-0 right-0 h-12 w-12 text-blue-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Total Amount Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Amount</p>
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      ${(totalAmount / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center z-10">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 mb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-600">Collection</span>
                    <span className="text-xs font-bold text-emerald-700">{Math.round((totalPaid / totalAmount) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
              
              <DollarSign className="absolute bottom-0 right-0 h-12 w-12 text-emerald-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Pending Payments Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending</p>
                    <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{pendingPayments}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center z-10">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    <span className="text-amber-600">Needs attention</span>
                  </div>
                </div>
              </CardContent>
              
              <Clock className="absolute bottom-0 right-0 h-12 w-12 text-amber-500/5 transform translate-x-3 translate-y-3" />
            </Card>
            
            {/* Collected Amount Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-green-50 to-lime-50 dark:from-green-950/20 dark:to-lime-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Collected</p>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      ${(totalPaid / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center z-10">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    <span>+8%</span>
                  </div>
                </div>
              </CardContent>
              
              <CheckCircle className="absolute bottom-0 right-0 h-12 w-12 text-green-500/5 transform translate-x-3 translate-y-3" />
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
                placeholder="Search invoices, patients..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsFilterModalOpen(true)}>
              <Filter className="mr-1 h-4 w-4" /> 
              Filters
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsSortModalOpen(true)}>
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
                placeholder="Search invoices..."
                className="pl-8 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="px-2 sm:px-3" onClick={() => setIsFilterModalOpen(true)}>
              <Filter className="h-4 w-4 sm:mr-1" /> 
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <Button variant="outline" size="sm" className="px-2 sm:px-3" onClick={() => setIsSortModalOpen(true)}>
              <ArrowUpDown className="h-4 w-4 sm:mr-1" /> 
              <span className="hidden sm:inline">Sort</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Billing Table Section */}
      <MobileTableView
        data={currentPageData}
        columns={[
          {
            key: 'invoiceNumber',
            label: 'Invoice',
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
            render: (value, invoice) => (
              <div>
                <div className="font-medium">{value}</div>
                <div className="text-sm text-muted-foreground">{invoice.patientId}</div>
                <div className="text-sm text-muted-foreground">{invoice.department}</div>
              </div>
            )
          },
          {
            key: 'status',
            label: 'Status',
            render: (value) => <StatusBadge status={value} />
          },
          {
            key: 'amount',
            label: 'Amount',
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
        getTitle={(invoice) => invoice.invoiceNumber}
        getSubtitle={(invoice) => `${invoice.patientName} • ${invoice.department}`}
        getStatus={(invoice) => invoice.status}
        getStatusColor={(invoice) => {
          switch (invoice.status.toLowerCase()) {
            case 'paid': return 'green';
            case 'partial': return 'yellow';
            case 'pending': return 'red';
            case 'overdue': return 'red';
            default: return 'gray';
          }
        }}
        getActions={(invoice) => [
          { label: 'View', onClick: () => handleViewInvoice(invoice), icon: Eye },
          { label: 'Edit', onClick: () => handleEditInvoice(invoice), icon: Edit },
          { label: 'Delete', onClick: () => handleDeleteInvoice(invoice.id), variant: 'destructive' as const, icon: Trash2 }
        ]}
        onRowClick={(invoice) => handleViewInvoice(invoice)}
      />

      {/* Desktop Pagination */}
      {!isMobile && totalPages > 1 && (
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
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={() => {}}
        vendors={[]}
        statuses={statuses}
      />

      {/* Sort Modal */}
      <SortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={() => {}}
      />
    </div>
  );
};