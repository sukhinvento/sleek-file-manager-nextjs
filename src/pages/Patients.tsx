
import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Filter, User, Phone, Mail, Calendar, TrendingUp, Activity, Heart, ArrowUpDown, Eye, Edit, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import * as patientService from '@/services/patientService';
import { Patient } from '@/services/patientService';
import { ModernPatientOverlay } from '@/components/patients/ModernPatientOverlay';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'discharged': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'admitted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border pointer-events-none`}>
      {status}
    </Badge>
  );
};

export const Patients = () => {
  const isMobile = useIsMobile();
  
  // Data state
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    admittedPatients: 0,
    dischargedPatients: 0,
    criticalPatients: 0,
    totalDepartments: 0,
    averageAge: 0,
    bloodGroups: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load patients data and stats
  const loadPatients = async () => {
    setIsLoadingData(true);
    try {
      const patientsData = await patientService.fetchPatients();
      setPatients(patientsData);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load patients. Please try again.",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadStats = async () => {
    try {
      const patientStats = await patientService.fetchPatientStats();
      setStats(patientStats);
    } catch (error) {
      console.error('Failed to load patient stats:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadPatients();
    loadStats();
  }, []);

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'patient') {
        handleAddPatient();
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  const statuses = ['All', 'Active', 'Admitted', 'Discharged', 'Critical'];
  
  // Filter logic
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = !searchTerm || 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'All' || patient.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [patients, searchTerm, selectedStatus]);

  // Infinite scroll for mobile
  const { displayedItems: mobileDisplayedItems, hasMoreItems, isLoading, loadMoreItems } = useInfiniteScroll({
    data: filteredPatients,
    itemsPerPage: 10,
    enabled: isMobile
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const currentPageData = isMobile 
    ? mobileDisplayedItems
    : filteredPatients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditMode(false);
    setIsAddPatientOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditMode(true);
    setIsAddPatientOpen(true);
  };

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setIsEditMode(false);
    setIsAddPatientOpen(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      await patientService.deletePatient(patientId);
      setPatients(patients.filter(p => p.id !== patientId));
      await loadStats();
      toast({
        title: "Patient Deleted",
        description: "Patient record has been successfully deleted.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete patient. Please try again.",
      });
    }
  };

  const handleSavePatient = async (patientData: Patient) => {
    try {
      if (isEditMode && selectedPatient) {
        await patientService.updatePatient(selectedPatient.id, patientData);
        // Update local state
        setPatients(patients.map(p => 
          p.id === selectedPatient.id ? { ...patientData, id: selectedPatient.id } : p
        ));
      } else {
        const newPatient = await patientService.createPatient(patientData);
        setPatients([...patients, newPatient]);
      }
      await loadStats();
      setIsAddPatientOpen(false);
      setSelectedPatient(null);
    } catch (error) {
      throw error; // Let the overlay handle the error toast
    }
  };

  const handleCloseOverlay = () => {
    setIsAddPatientOpen(false);
    setSelectedPatient(null);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards Section */}
      <section className="bg-card space-y-3 lg:space-y-0 overflow-hidden sm:mx-0">
        <div className="h-scroll py-4">
          <div className="flex flex-nowrap gap-3 sm:gap-4 w-max">
            {/* Total Patients Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total</p>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalPatients}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center z-10">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600">All patients</span>
                  </div>
                </div>
              </CardContent>
              
              <User className="absolute bottom-0 right-0 h-12 w-12 text-blue-500/5 transform translate-x-3 translate-y-3" />
            </Card>

            {/* Active Patients Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Active</p>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activePatients}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center z-10">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>
                
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
                        className="text-green-200"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="transparent"
                        strokeDasharray={`${stats.totalPatients > 0 ? (stats.activePatients / stats.totalPatients) * 75.4 : 0} 75.4`}
                        className="text-green-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-green-700 leading-none">
                        {stats.totalPatients > 0 ? Math.round((stats.activePatients / stats.totalPatients) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-green-600">of total</span>
                </div>
              </CardContent>
              
              <Activity className="absolute bottom-0 right-0 h-12 w-12 text-green-500/5 transform translate-x-3 translate-y-3" />
            </Card>

            {/* Admitted Patients Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">Admitted</p>
                    <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.admittedPatients}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center z-10">
                      <Heart className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-600">In hospital</span>
                  </div>
                </div>
              </CardContent>
              
              <Heart className="absolute bottom-0 right-0 h-12 w-12 text-yellow-500/5 transform translate-x-3 translate-y-3" />
            </Card>

            {/* Critical Patients Card */}
            <Card className="flex-shrink-0 w-36 sm:w-40 md:w-44 animate-fade-in hover-scale shadow-lg border-none bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Critical</p>
                    <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.criticalPatients}</div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center z-10">
                      <Activity className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-1 text-xs">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span className="text-red-600">Needs attention</span>
                  </div>
                </div>
              </CardContent>
              
              <Activity className="absolute bottom-0 right-0 h-12 w-12 text-red-500/5 transform translate-x-3 translate-y-3" />
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
                placeholder="Search patients..."
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
                placeholder="Search patients..."
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

      {/* Patients Table Section */}
      <Card className="border-border/50 shadow-sm">
        <div className="overflow-x-auto">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <User className="h-12 w-12 text-muted-foreground opacity-50" />
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">No patients found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || selectedStatus !== 'All' 
                    ? 'Try adjusting your filters' 
                    : 'Get started by adding your first patient'}
                </p>
              </div>
            </div>
          ) : (
          <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold w-[20%]">Patient Details</TableHead>
              <TableHead className="font-semibold w-[20%]">Contact Info</TableHead>
              <TableHead className="font-semibold w-[20%]">Medical Info</TableHead>
              <TableHead className="font-semibold w-[15%]">Status</TableHead>
              <TableHead className="font-semibold w-[15%]">Last Visit</TableHead>
              <TableHead className="font-semibold text-right w-[10%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.map((patient) => (
              <TableRow key={patient.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div>
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-muted-foreground">ID: {patient.patientId}</div>
                    <div className="text-sm text-muted-foreground">
                      {patient.age} years, {patient.gender}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Phone className="w-3 h-3 mr-1" />
                      {patient.phone}
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="w-3 h-3 mr-1" />
                      {patient.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm">Blood: {patient.bloodGroup}</div>
                    <div className="text-sm text-muted-foreground">{patient.doctor}</div>
                    <Badge variant="outline" className="text-xs">{patient.department}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={patient.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-3 h-3 mr-1" />
                    {patient.lastVisit}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewPatient(patient)}
                      className="h-8 w-8 p-0"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditPatient(patient)}
                      className="h-8 w-8 p-0"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeletePatient(patient.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
          )}
        </div>
      </Card>

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
                Showing {mobileDisplayedItems.length} of {filteredPatients.length} patients
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
              All {filteredPatients.length} patients loaded
            </div>
          )}
        </div>
      )}
      
      {/* Patient Add/Edit Modal */}
      <ModernPatientOverlay
        isOpen={isAddPatientOpen}
        onClose={handleCloseOverlay}
        patient={selectedPatient}
        isEditMode={isEditMode}
        onSave={handleSavePatient}
      />
    </div>
  );
};
