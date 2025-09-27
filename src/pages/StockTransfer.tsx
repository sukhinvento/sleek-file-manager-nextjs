import { useState, useEffect } from 'react';
import { Search, Plus, Filter, ArrowRight, MapPin, Package, Clock, CheckCircle, AlertTriangle, Eye, Edit, MoreVertical, Truck, User, TrendingUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

// Sample stock transfer data
const stockTransfersData = [
  {
    id: 1,
    transferId: 'ST-2024-001',
    fromLocation: 'Main Warehouse',
    toLocation: 'Emergency Room',
    status: 'Completed',
    priority: 'Normal',
    requestDate: '2024-01-15',
    completedDate: '2024-01-16',
    requestedBy: 'Dr. Sarah Johnson',
    approvedBy: 'John Manager',
    transferValue: 1250.00,
    itemCount: 5,
    notes: 'Urgent request for emergency supplies'
  },
  {
    id: 2,
    transferId: 'ST-2024-002',
    fromLocation: 'Eastern Warehouse',
    toLocation: 'ICU',
    status: 'In Transit',
    priority: 'High',
    requestDate: '2024-01-17',
    completedDate: null,
    requestedBy: 'Nurse Manager',
    approvedBy: 'Jane Supervisor',
    transferValue: 875.50,
    itemCount: 3,
    notes: 'Critical supplies for ICU'
  },
  {
    id: 3,
    transferId: 'ST-2024-003',
    fromLocation: 'Central Storage',
    toLocation: 'Pharmacy',
    status: 'Pending',
    priority: 'Low',
    requestDate: '2024-01-18',
    completedDate: null,
    requestedBy: 'Pharmacist',
    approvedBy: null,
    transferValue: 2100.00,
    itemCount: 8,
    notes: 'Regular stock replenishment'
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-blue-100 text-blue-800',
    'In Transit': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };

  return (
    <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const variants = {
    'Low': 'bg-gray-100 text-gray-800',
    'Normal': 'bg-blue-100 text-blue-800',
    'High': 'bg-orange-100 text-orange-800',
    'Critical': 'bg-red-100 text-red-800'
  };

  return (
    <Badge variant="outline" className={variants[priority as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
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

  const statuses = ['All', 'Pending', 'Approved', 'In Transit', 'Completed', 'Cancelled'];
  const priorities = ['All', 'Low', 'Normal', 'High', 'Critical'];
  
  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.transferId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || transfer.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || transfer.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalTransfers = transfers.length;
  const pendingTransfers = transfers.filter(transfer => transfer.status === 'Pending').length;
  const inTransitTransfers = transfers.filter(transfer => transfer.status === 'In Transit').length;
  const totalValue = transfers.reduce((sum, transfer) => sum + transfer.transferValue, 0);

  const handleDeleteTransfer = (transferId: string) => {
    setTransfers(transfers.filter(t => t.transferId !== transferId));
    toast({
      title: "Transfer Deleted",
      description: "Stock transfer has been successfully deleted.",
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Summary Cards - Horizontally scrollable */}
      <div className="flex-shrink-0 mb-6">
        <div className="overflow-x-auto max-w-full pb-2">
          <div className="inline-flex w-max gap-4 pr-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTransfers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingTransfers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Transit</CardTitle>
                <Truck className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{inTransitTransfers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${totalValue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {statuses.map(status => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                className="rounded-full whitespace-nowrap"
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transfers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Stock Transfers Table */}
        <Card className="border-border/50 shadow-sm">
          <div className="overflow-x-auto max-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer Details</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status & Priority</TableHead>
                  <TableHead>Request Info</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map((transfer) => (
                  <TableRow key={transfer.id} className="cursor-pointer hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <div className="font-medium">{transfer.transferId}</div>
                        <div className="text-sm text-muted-foreground">
                          {transfer.itemCount} items
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transfer.requestDate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">
                          <div className="font-medium">{transfer.fromLocation}</div>
                          <div className="flex items-center text-muted-foreground mt-1">
                            <ArrowRight className="h-3 w-3 mx-1" />
                            <span>{transfer.toLocation}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <StatusBadge status={transfer.status} />
                        <PriorityBadge priority={transfer.priority} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">Requested by:</div>
                        <div className="text-sm">{transfer.requestedBy}</div>
                        {transfer.approvedBy && (
                          <>
                            <div className="text-sm font-medium mt-1">Approved by:</div>
                            <div className="text-sm">{transfer.approvedBy}</div>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        ${transfer.transferValue.toLocaleString()}
                      </div>
                      {transfer.completedDate && (
                        <div className="text-xs text-muted-foreground">
                          Completed: {transfer.completedDate}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Transfer
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTransfer(transfer.transferId)}
                            className="text-red-600"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Cancel Transfer
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

        {/* New Transfer Modal Placeholder */}
        {isNewTransferOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-lg font-semibold mb-4">New Stock Transfer</h2>
              <p className="text-muted-foreground mb-4">Transfer form would go here...</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewTransferOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setIsNewTransferOpen(false);
                  toast({
                    title: "Transfer Created",
                    description: "New stock transfer has been successfully created.",
                  });
                }}>
                  Create Transfer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};