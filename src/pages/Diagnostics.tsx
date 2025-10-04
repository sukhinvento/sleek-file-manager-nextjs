import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Filter, ArrowUpDown, Calendar, Clock, Activity, TrendingUp, Eye, Edit, Trash2, FileText, AlertCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import * as diagnosticService from '@/services/diagnosticService';
import { PatientDiagnostic } from '@/services/diagnosticService';
import { ModernDiagnosticOverlay } from '@/components/diagnostics/ModernDiagnosticOverlay';
import { DiagnosticFilterModal } from '@/components/diagnostics/DiagnosticFilterModal';
import { DiagnosticsSortModal } from '@/components/diagnostics/DiagnosticsSortModal';
import { countActiveFilters } from '@/lib/filterUtils';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border pointer-events-none`}>
      {status}
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'routine': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getPriorityColor(priority)} border pointer-events-none`}>
      {priority}
    </Badge>
  );
};

export const Diagnostics = () => {
  const isMobile = useIsMobile();
  
  // Data state
  const [diagnostics, setDiagnostics] = useState<PatientDiagnostic[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
    urgent: 0,
    emergency: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortConfig, setSortConfig] = useState({ field: 'requestDate', direction: 'desc' as 'asc' | 'desc' });
  const [isBookTestOpen, setIsBookTestOpen] = useState(false);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<PatientDiagnostic | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  
  // Calculate active filter count
  const activeFilterCount = useMemo(() => countActiveFilters(selectedFilters), [selectedFilters]);
  const hasFilters = activeFilterCount > 0;
  const hasSort = sortConfig.field !== 'requestDate' || sortConfig.direction !== 'desc';
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load diagnostics data and stats
  const loadDiagnostics = async () => {
    setIsLoadingData(true);
    try {
      const data = await diagnosticService.fetchAllPatientDiagnostics();
      setDiagnostics(data);
    } catch (error) {
      console.error('Failed to load diagnostics:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load diagnostics. Please try again.",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadStats = async () => {
    try {
      const diagnosticStats = await diagnosticService.getDiagnosticStats();
      setStats(diagnosticStats);
    } catch (error) {
      console.error('Failed to load diagnostic stats:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadDiagnostics();
    loadStats();
  }, []);

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'diagnostic') {
        handleBookTest();
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  const statuses = ['All', 'Scheduled', 'In Progress', 'Completed', 'Pending', 'Cancelled'];
  const categories = ['All', ...Array.from(new Set(diagnostics.map(d => d.category)))];
  const priorities = ['All', 'Routine', 'Urgent', 'Emergency'];

  // Filter and search
  const filteredDiagnostics = useMemo(() => {
    return diagnostics.filter(diagnostic => {
      const matchesStatus = selectedStatus === 'All' || diagnostic.status === selectedStatus;
      const matchesSearch = 
        diagnostic.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diagnostic.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diagnostic.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diagnostic.orderedBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Comprehensive filter matching
      const matchesPatientId = !selectedFilters.patientId || 
        diagnostic.patientId.toLowerCase().includes(selectedFilters.patientId.toLowerCase());
      
      const matchesPatientName = !selectedFilters.patientName || 
        diagnostic.patientName.toLowerCase().includes(selectedFilters.patientName.toLowerCase());
      
      const matchesTestName = !selectedFilters.testName || 
        diagnostic.testName.toLowerCase().includes(selectedFilters.testName.toLowerCase());
      
      const matchesCategory = !selectedFilters.category || 
        selectedFilters.category === 'All' || 
        diagnostic.category === selectedFilters.category;
      
      const matchesOrderedBy = !selectedFilters.orderedBy || 
        diagnostic.orderedBy.toLowerCase().includes(selectedFilters.orderedBy.toLowerCase());
      
      const matchesFilterStatus = !selectedFilters.status || 
        selectedFilters.status === 'All' || 
        diagnostic.status === selectedFilters.status;
      
      const matchesPriority = !selectedFilters.priority || 
        selectedFilters.priority === 'All' || 
        diagnostic.priority === selectedFilters.priority;
      
      const matchesOrderedDateRange = !selectedFilters.orderedDateRange?.from || 
        (new Date(diagnostic.orderedDate) >= new Date(selectedFilters.orderedDateRange.from) &&
         (!selectedFilters.orderedDateRange.to || new Date(diagnostic.orderedDate) <= new Date(selectedFilters.orderedDateRange.to)));
      
      const matchesScheduledDateRange = !selectedFilters.scheduledDateRange?.from || !diagnostic.scheduledDate ||
        (new Date(diagnostic.scheduledDate) >= new Date(selectedFilters.scheduledDateRange.from) &&
         (!selectedFilters.scheduledDateRange.to || new Date(diagnostic.scheduledDate) <= new Date(selectedFilters.scheduledDateRange.to)));
      
      return matchesStatus && matchesSearch && matchesPatientId && matchesPatientName &&
             matchesTestName && matchesCategory && matchesOrderedBy && matchesFilterStatus &&
             matchesPriority && matchesOrderedDateRange && matchesScheduledDateRange;
    });
  }, [diagnostics, selectedStatus, searchTerm, selectedFilters]);

  // Sort logic
  const sortedDiagnostics = useMemo(() => {
    return [...filteredDiagnostics].sort((a, b) => {
      const field = sortConfig.field as keyof PatientDiagnostic;
      const aValue = a[field];
      const bValue = b[field];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredDiagnostics, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedDiagnostics.length / itemsPerPage);
  const paginatedDiagnostics = useMemo(() => {
    if (isMobile) return sortedDiagnostics; // Show all for infinite scroll on mobile
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedDiagnostics.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedDiagnostics, currentPage, isMobile]);

  // Mobile infinite scroll
  const { 
    displayedItems: mobileDisplayedItems, 
    hasMoreItems, 
    loadMoreItems, 
    isLoading 
  } = useInfiniteScroll<PatientDiagnostic>({ 
    data: sortedDiagnostics, 
    itemsPerPage: 10,
    enabled: isMobile 
  });

  // Reset pagination when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedFilters, sortConfig]);

  const handleBookTest = () => {
    setIsBookTestOpen(true);
    setIsEditMode(false);
    setSelectedDiagnostic(null);
  };

  const handleApplyFilters = (filters: any) => {
    setSelectedFilters(filters);
    setIsFilterModalOpen(false);
  };

  const handleApplySort = (sortConfig: { field: string; direction: 'asc' | 'desc' }) => {
    setSortConfig(sortConfig);
    setIsSortModalOpen(false);
  };

  const handleViewDiagnostic = (diagnostic: PatientDiagnostic) => {
    setSelectedDiagnostic(diagnostic);
    setIsBookTestOpen(true);
    setIsEditMode(false);
  };

  const handleEditDiagnostic = (diagnostic: PatientDiagnostic) => {
    setSelectedDiagnostic(diagnostic);
    setIsBookTestOpen(true);
    setIsEditMode(true);
  };

  const handleDeleteDiagnostic = async (diagnostic: PatientDiagnostic) => {
    if (window.confirm('Are you sure you want to cancel this diagnostic test?')) {
      try {
        await diagnosticService.cancelDiagnosticTest(diagnostic.id);
        await loadDiagnostics();
        await loadStats();
        toast({
          title: "Success",
          description: "Diagnostic test cancelled successfully.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to cancel diagnostic test.",
        });
      }
    }
  };

  const handleSaveDiagnostic = async (diagnostic: any) => {
    try {
      if (isEditMode && selectedDiagnostic) {
        await diagnosticService.updatePatientDiagnostic(selectedDiagnostic.id, diagnostic);
        toast({
          title: "Success",
          description: "Diagnostic test updated successfully.",
        });
      } else {
        await diagnosticService.bookDiagnosticTest(diagnostic);
        toast({
          title: "Success",
          description: "Diagnostic test booked successfully.",
        });
      }
      await loadDiagnostics();
      await loadStats();
      setIsBookTestOpen(false);
      setSelectedDiagnostic(null);
      setIsEditMode(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save diagnostic test.",
      });
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards Section */}
      <section className="bg-card space-y-3 lg:space-y-0 overflow-hidden sm:mx-0">
        <div className="h-scroll py-4">
          <div className="flex flex-nowrap gap-3 sm:gap-4 w-max">
            {/* Total Tests Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Tests</p>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center z-10">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <FileText className="absolute bottom-0 right-0 h-12 w-12 text-blue-500/5 transform translate-x-3 translate-y-3" />
            </Card>

            {/* Scheduled Tests Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Scheduled</p>
                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.scheduled}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center z-10">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <Calendar className="absolute bottom-0 right-0 h-12 w-12 text-emerald-500/5 transform translate-x-3 translate-y-3" />
            </Card>

            {/* In Progress Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Progress</p>
                    <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.inProgress}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center z-10">
                      <Activity className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <Activity className="absolute bottom-0 right-0 h-12 w-12 text-amber-500/5 transform translate-x-3 translate-y-3" />
            </Card>

            {/* Completed Tests Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider">Completed</p>
                    <div className="text-2xl font-bold text-violet-900 dark:text-violet-100">{stats.completed}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-violet-500/10 rounded-full flex items-center justify-center z-10">
                      <TrendingUp className="h-5 w-5 text-violet-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <TrendingUp className="absolute bottom-0 right-0 h-12 w-12 text-violet-500/5 transform translate-x-3 translate-y-3" />
            </Card>

            {/* Urgent/Emergency Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Urgent</p>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.urgent + stats.emergency}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center z-10">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <AlertCircle className="absolute bottom-0 right-0 h-12 w-12 text-red-500/5 transform translate-x-3 translate-y-3" />
            </Card>
          </div>
        </div>
      </section>

      {/* Filters Section - Sticky */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-4 space-y-3 lg:space-y-0 overflow-hidden sm:mx-0 mt-4 lg:mt-6">
        {/* Desktop Layout */}
        <div className="hidden lg:flex lg:items-center lg:gap-4 lg:justify-between">
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
          
          <div className="flex gap-3 flex-shrink-0 min-w-0">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tests, patients..."
                className="pl-8 text-sm"
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

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-3">
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
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tests..."
                className="pl-8 text-sm"
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
        </div>
      </div>

      {/* Desktop Table */}
      {!isMobile && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingData ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading diagnostics...
                    </TableCell>
                  </TableRow>
                ) : paginatedDiagnostics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No diagnostics found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDiagnostics.map((diagnostic) => (
                    <TableRow key={diagnostic.id}>
                      <TableCell className="font-medium">{diagnostic.id}</TableCell>
                      <TableCell>{diagnostic.patientName}</TableCell>
                      <TableCell>{diagnostic.testName}</TableCell>
                      <TableCell>{diagnostic.category}</TableCell>
                      <TableCell>{diagnostic.scheduledDate || '-'}</TableCell>
                      <TableCell><PriorityBadge priority={diagnostic.priority} /></TableCell>
                      <TableCell><StatusBadge status={diagnostic.status} /></TableCell>
                      <TableCell>${diagnostic.price}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDiagnostic(diagnostic)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditDiagnostic(diagnostic)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteDiagnostic(diagnostic)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <Pagination className="mt-4 pb-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (totalPages > 7 && (page > 3 && page < totalPages - 2) && Math.abs(currentPage - page) > 1) {
                  if (page === 4 && currentPage > 4) return <PaginationItem key={page}>...</PaginationItem>;
                  return null;
                }
                
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
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Card>
      )}

      {/* Mobile: Show loading indicator and load more button */}
      {isMobile && (
        <div className="space-y-3">
          {isLoadingData ? (
            <div className="text-center py-8">Loading diagnostics...</div>
          ) : mobileDisplayedItems.length === 0 ? (
            <div className="text-center py-8">No diagnostics found</div>
          ) : (
            <>
              {mobileDisplayedItems.map((diagnostic) => (
                <Card key={diagnostic.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">{diagnostic.patientName}</div>
                        <div className="text-sm text-muted-foreground">{diagnostic.id}</div>
                      </div>
                      <StatusBadge status={diagnostic.status} />
                    </div>
                    <div className="text-sm">
                      <div><strong>Test:</strong> {diagnostic.testName}</div>
                      <div><strong>Category:</strong> {diagnostic.category}</div>
                      <div><strong>Scheduled:</strong> {diagnostic.scheduledDate || '-'}</div>
                      <div><strong>Priority:</strong> <PriorityBadge priority={diagnostic.priority} /></div>
                      <div><strong>Price:</strong> ${diagnostic.price}</div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDiagnostic(diagnostic)}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditDiagnostic(diagnostic)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteDiagnostic(diagnostic)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {hasMoreItems && (
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Showing {mobileDisplayedItems.length} of {filteredDiagnostics.length} tests
                  </div>
                  {isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  ) : (
                    <Button variant="outline" onClick={loadMoreItems} className="w-full">
                      Load More
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Diagnostic Booking Overlay */}
      <ModernDiagnosticOverlay
        isOpen={isBookTestOpen}
        onClose={() => {
          setIsBookTestOpen(false);
          setSelectedDiagnostic(null);
          setIsEditMode(false);
        }}
        diagnostic={selectedDiagnostic || undefined}
        isEditMode={isEditMode}
        onSave={handleSaveDiagnostic}
      />

      {/* Filter Modal */}
      <DiagnosticFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        statuses={statuses}
        categories={categories}
        priorities={priorities}
      />

      {/* Sort Modal */}
      <DiagnosticsSortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        onApplySort={handleApplySort}
      />
    </div>
  );
};
