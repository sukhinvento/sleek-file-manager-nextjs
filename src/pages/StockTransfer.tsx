
import { useState } from 'react';
import { Search, Plus, Filter, ArrowRight, MapPin, Package } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ModernStockTransferOverlay } from "@/components/stock-transfer/ModernStockTransferOverlay";

// Sample stock transfer data
const stockTransfersData = [
  {
    id: 1,
    transferId: 'ST-100001',
    fromLocation: 'Main Warehouse',
    toLocation: 'Emergency Room',
    items: [
      { name: 'Bandages', quantity: 50 },
      { name: 'Syringes', quantity: 100 }
    ],
    status: 'Completed',
    requestDate: '2024-01-15',
    completedDate: '2024-01-16',
    requestedBy: 'Dr. Sarah Johnson'
  },
  {
    id: 2,
    transferId: 'ST-100002',
    fromLocation: 'Eastern Warehouse',
    toLocation: 'ICU',
    items: [
      { name: 'IV Fluids', quantity: 25 },
      { name: 'Oxygen Masks', quantity: 15 }
    ],
    status: 'In Transit',
    requestDate: '2024-01-17',
    completedDate: null,
    requestedBy: 'Nurse Manager'
  },
  {
    id: 3,
    transferId: 'ST-100003',
    fromLocation: 'Main Warehouse',
    toLocation: 'Pharmacy',
    items: [
      { name: 'Antibiotics', quantity: 200 },
      { name: 'Pain Relievers', quantity: 150 }
    ],
    status: 'Pending',
    requestDate: '2024-01-18',
    completedDate: null,
    requestedBy: 'Pharmacy Manager'
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'In Transit': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };
  return (
    <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};

export const StockTransfer = () => {
  const [transfers, setTransfers] = useState(stockTransfersData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [isViewTransferOpen, setIsViewTransferOpen] = useState(false);

  const statuses = ['All', 'Pending', 'In Transit', 'Completed', 'Cancelled'];
  
  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.transferId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || transfer.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalTransfers = transfers.length;
  const pendingTransfers = transfers.filter(t => t.status === 'Pending').length;
  const inTransitTransfers = transfers.filter(t => t.status === 'In Transit').length;

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stock Transfer</h1>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsNewTransferOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> New Transfer Request
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingTransfers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inTransitTransfers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statuses.map(status => (
            <Button
              key={status}
              variant={selectedStatus === status ? 'default' : 'outline'}
              className={`rounded-full whitespace-nowrap ${selectedStatus === status ? 'bg-enterprise-700' : ''}`}
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
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transfer Details</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested By</TableHead>
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
                      Requested: {transfer.requestDate}
                    </div>
                    {transfer.completedDate && (
                      <div className="text-sm text-muted-foreground">
                        Completed: {transfer.completedDate}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {transfer.fromLocation}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {transfer.toLocation}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {transfer.items.map((item, index) => (
                      <div key={index} className="text-sm">
                        {item.name} ({item.quantity})
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={transfer.status} />
                </TableCell>
                <TableCell>{transfer.requestedBy}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedTransfer(transfer);
                        setIsViewTransferOpen(true);
                      }}
                    >
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedTransfer(transfer);
                        setIsViewTransferOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modern Stock Transfer Overlays */}
      <ModernStockTransferOverlay
        transfer={null}
        isOpen={isNewTransferOpen}
        onClose={() => setIsNewTransferOpen(false)}
        isEdit={false}
        onSave={(transfer) => {
          setTransfers([...transfers, { ...transfer, id: transfers.length + 1 } as any]);
        }}
      />

      <ModernStockTransferOverlay
        transfer={selectedTransfer}
        isOpen={isViewTransferOpen}
        onClose={() => {
          setIsViewTransferOpen(false);
          setSelectedTransfer(null);
        }}
        onUpdate={(transfer) => {
          setTransfers(transfers.map(t => t.id === transfer.id ? transfer as any : t));
        }}
      />
    </div>
  );
};
