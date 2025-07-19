import { useState } from 'react';
import { Search, Plus, Filter, ArrowRight, MapPin, Package, Clock, CheckCircle, AlertTriangle, Eye, Edit, MoreVertical, Truck, User } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ModernStockTransferOverlay } from "@/components/stock-transfer/ModernStockTransferOverlay";
import { toast } from "@/hooks/use-toast";

// Enhanced stock transfer data
const stockTransfersData = [
  {
    id: 1,
    transferId: 'ST-100001',
    fromLocation: 'Main Warehouse',
    toLocation: 'Emergency Room',
    items: [
      { name: 'Bandages', quantity: 50, sku: 'MED-BND-001' },
      { name: 'Syringes', quantity: 100, sku: 'MED-SYR-002' }
    ],
    status: 'Completed',
    priority: 'Normal',
    requestDate: '2024-01-15',
    completedDate: '2024-01-16',
    requestedBy: 'Dr. Sarah Johnson',
    approvedBy: 'John Manager',
    transferValue: 1250.00,
    department: 'Emergency Medicine',
    notes: 'Urgent request for emergency supplies'
  },
  {
    id: 2,
    transferId: 'ST-100002',
    fromLocation: 'Eastern Warehouse',
    toLocation: 'ICU',
    items: [
      { name: 'IV Fluids', quantity: 25, sku: 'MED-IV-003' },
      { name: 'Oxygen Masks', quantity: 15, sku: 'MED-OXY-004' }
    ],
    status: 'In Transit',
    priority: 'High',
    requestDate: '2024-01-17',
    completedDate: null,
    requestedBy: 'Nurse Manager',
    approvedBy: 'Jane Supervisor',
    transferValue: 875.50,
    department: 'Intensive Care',
    notes: 'Critical care supplies needed'
  },
  {
    id: 3,
    transferId: 'ST-100003',
    fromLocation: 'Main Warehouse',
    toLocation: 'Pharmacy',
    items: [
      { name: 'Antibiotics', quantity: 200, sku: 'MED-ANT-005' },
      { name: 'Pain Relievers', quantity: 150, sku: 'MED-PAI-006' }
    ],
    status: 'Pending',
    priority: 'Normal',
    requestDate: '2024-01-18',
    completedDate: null,
    requestedBy: 'Pharmacy Manager',
    approvedBy: null,
    transferValue: 3200.00,
    department: 'Pharmacy',
    notes: 'Monthly stock replenishment'
  },
  {
    id: 4,
    transferId: 'ST-100004',
    fromLocation: 'Storage Room A',
    toLocation: 'Operating Theater',
    items: [
      { name: 'Surgical Instruments', quantity: 5, sku: 'SUR-INS-007' },
      { name: 'Sterile Gauze', quantity: 100, sku: 'SUR-GAU-008' }
    ],
    status: 'Approved',
    priority: 'High',
    requestDate: '2024-01-19',
    completedDate: null,
    requestedBy: 'Surgery Coordinator',
    approvedBy: 'Medical Director',
    transferValue: 2150.75,
    department: 'Surgery',
    notes: 'Scheduled surgery preparations'
  },
  {
    id: 5,
    transferId: 'ST-100005',
    fromLocation: 'Central Storage',
    toLocation: 'Pediatric Ward',
    items: [
      { name: 'Pediatric Medication', quantity: 75, sku: 'PED-MED-009' },
      { name: 'Small Needles', quantity: 200, sku: 'PED-NEE-010' }
    ],
    status: 'Cancelled',
    priority: 'Low',
    requestDate: '2024-01-16',
    completedDate: null,
    requestedBy: 'Pediatric Nurse',
    approvedBy: null,
    transferValue: 450.25,
    department: 'Pediatrics',
    notes: 'Request cancelled due to overstocking'
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Approved': 'bg-blue-100 text-blue-800 border-blue-200',
    'In Transit': 'bg-purple-100 text-purple-800 border-purple-200',
    'Completed': 'bg-green-100 text-green-800 border-green-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200'
  };
  return (
    <Badge variant="outline" className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800 border-gray-200'}>
      {status}
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const variants = {
    'Low': 'bg-gray-100 text-gray-800 border-gray-200',
    'Normal': 'bg-blue-100 text-blue-800 border-blue-200',
    'High': 'bg-orange-100 text-orange-800 border-orange-200',
    'Critical': 'bg-red-100 text-red-800 border-red-200'
  };
  return (
    <Badge variant="outline" className={variants[priority as keyof typeof variants] || 'bg-gray-100 text-gray-800 border-gray-200'}>
      {priority}
    </Badge>
  );
};

export const StockTransfer = () => {
  const [transfers, setTransfers] = useState(stockTransfersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [isViewTransferOpen, setIsViewTransferOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const statuses = ['All', 'Pending', 'Approved', 'In Transit', 'Completed', 'Cancelled'];
  const priorities = ['All', 'Low', 'Normal', 'High', 'Critical'];
  
  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.transferId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || transfer.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || transfer.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalTransfers = transfers.length;
  const pendingTransfers = transfers.filter(t => t.status === 'Pending').length;
  const inTransitTransfers = transfers.filter(t => t.status === 'In Transit').length;
  const completedTransfers = transfers.filter(t => t.status === 'Completed').length;
  const highPriorityTransfers = transfers.filter(t => t.priority === 'High' || t.priority === 'Critical').length;
  const totalValue = transfers.reduce((sum, t) => sum + t.transferValue, 0);

  const handleEditTransfer = (transfer: any) => {
    setSelectedTransfer(transfer);
    setIsEditMode(true);
    setIsViewTransferOpen(true);
  };

  const handleViewTransfer = (transfer: any) => {
    setSelectedTransfer(transfer);
    setIsEditMode(false);
    setIsViewTransferOpen(true);
  };

  const handleDeleteTransfer = (transferId: string) => {
    setTransfers(transfers.filter(t => t.transferId !== transferId));
    toast({
      title: "Transfer Deleted",
      description: "Stock transfer has been successfully deleted.",
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Transfer</h1>
          <p className="text-muted-foreground mt-1">
            Manage stock transfers between locations and track delivery status
          </p>
        </div>
        <Button 
          className="bg-slate-600 hover:bg-slate-700 text-white shadow-lg"
          onClick={() => setIsNewTransferOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Transfer Request
        </Button>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Transfers</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalTransfers}</div>
            <p className="text-xs text-muted-foreground mt-1">All transfer requests</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingTransfers}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">{inTransitTransfers}</div>
            <p className="text-xs text-muted-foreground mt-1">Being transferred</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTransfers}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highPriorityTransfers}</div>
            <p className="text-xs text-muted-foreground mt-1">Urgent transfers</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Value</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₹{(totalValue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">Transfer value</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Search */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
              <Input
                type="search"
                placeholder="Search by transfer ID, location, or requestor..."
                className="pl-10 h-12 text-base border-border/50 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <div className="flex gap-2">
                <span className="text-sm font-medium text-muted-foreground self-center">Status:</span>
                {statuses.map(status => (
                  <Button
                    key={status}
                    variant={selectedStatus === status ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full h-8 px-3 text-xs ${
                      selectedStatus === status ? 'bg-slate-600 text-white' : ''
                    }`}
                    onClick={() => setSelectedStatus(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>

              {/* Priority Filter */}
              <div className="flex gap-2">
                <span className="text-sm font-medium text-muted-foreground self-center">Priority:</span>
                {priorities.map(priority => (
                  <Button
                    key={priority}
                    variant={selectedPriority === priority ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full h-8 px-3 text-xs ${
                      selectedPriority === priority ? 'bg-slate-600 text-white' : ''
                    }`}
                    onClick={() => setSelectedPriority(priority)}
                  >
                    {priority}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTransfers.length} of {totalTransfers} stock transfers
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('All');
                    setSelectedPriority('All');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stock Transfers Table */}
      <Card className="border-border/50 shadow-sm">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[25%] font-semibold">Transfer Details</TableHead>
                <TableHead className="w-[20%] font-semibold">Route & Items</TableHead>
                <TableHead className="w-[15%] font-semibold">Status & Priority</TableHead>
                <TableHead className="w-[15%] font-semibold">Request Info</TableHead>
                <TableHead className="w-[15%] font-semibold">Financial</TableHead>
                <TableHead className="w-[10%] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => (
                <TableRow 
                  key={transfer.id} 
                  className="hover:bg-muted/30 transition-colors border-border/50"
                >
                  {/* Transfer Details */}
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-base">
                            {transfer.transferId}
                          </div>
                          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md inline-block">
                            {transfer.department}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Requested: {transfer.requestDate}
                      </div>
                      {transfer.completedDate && (
                        <div className="text-xs text-muted-foreground">
                          Completed: {transfer.completedDate}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Route & Items */}
                  <TableCell className="py-4">
                    <div className="space-y-3">
                      {/* Route */}
                      <div className="flex items-center space-x-2">
                        <div className="text-sm">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                            <span className="font-medium">{transfer.fromLocation}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                            <span className="font-medium">{transfer.toLocation}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Items */}
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {transfer.items.length} item{transfer.items.length !== 1 ? 's' : ''}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {transfer.items.slice(0, 2).map((item, index) => (
                            <div key={index}>
                              {item.name} ({item.quantity})
                            </div>
                          ))}
                          {transfer.items.length > 2 && (
                            <div>+{transfer.items.length - 2} more...</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status & Priority */}
                  <TableCell className="py-4">
                    <div className="space-y-3">
                      <StatusBadge status={transfer.status} />
                      <PriorityBadge priority={transfer.priority} />
                    </div>
                  </TableCell>

                  {/* Request Info */}
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Requested by:</span>
                      </div>
                      <div className="text-sm text-muted-foreground ml-5">
                        {transfer.requestedBy}
                      </div>
                      {transfer.approvedBy && (
                        <>
                          <div className="flex items-center gap-1 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="font-medium">Approved by:</span>
                          </div>
                          <div className="text-sm text-muted-foreground ml-5">
                            {transfer.approvedBy}
                          </div>
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Financial */}
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-foreground">
                        ₹{transfer.transferValue.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Transfer Value
                      </div>
                      <div className="text-xs bg-muted px-2 py-1 rounded text-center">
                        {transfer.items.reduce((sum, item) => sum + item.quantity, 0)} units
                      </div>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleViewTransfer(transfer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTransfer(transfer)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Transfer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTransfer(transfer.transferId)}
                          className="text-red-600"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Delete Transfer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Enhanced Stock Transfer Overlays */}
      <ModernStockTransferOverlay
        transfer={null}
        isOpen={isNewTransferOpen}
        onClose={() => setIsNewTransferOpen(false)}
        isEdit={false}
        onSave={(transfer) => {
          const newTransfer = {
            ...transfer,
            id: transfers.length + 1,
            transferValue: 0,
            status: 'Pending',
            priority: 'Normal'
          };
          setTransfers([...transfers, newTransfer as any]);
          toast({
            title: "Transfer Request Created",
            description: `Transfer request ${transfer.transferId} has been successfully created.`,
          });
        }}
      />

      <ModernStockTransferOverlay
        transfer={selectedTransfer}
        isOpen={isViewTransferOpen}
        onClose={() => {
          setIsViewTransferOpen(false);
          setSelectedTransfer(null);
          setIsEditMode(false);
        }}
        isEdit={isEditMode}
        onUpdate={(transfer) => {
          setTransfers(transfers.map(t => t.id === transfer.id ? transfer as any : t));
          toast({
            title: "Transfer Updated",
            description: `Transfer ${transfer.transferId} has been successfully updated.`,
          });
        }}
        onDelete={handleDeleteTransfer}
      />
    </div>
  );
};