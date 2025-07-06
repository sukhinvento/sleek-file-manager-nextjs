
import { useState } from 'react';
import { Search, Plus, Filter, MapPin, User, Calendar, Edit } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

// Define order status tag component
const StatusTag = ({ status }: { status: 'FulFilled' | 'Quote' }) => {
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${
      status === 'FulFilled' 
        ? 'bg-yellow-100 text-yellow-800' 
        : 'bg-blue-100 text-blue-800'
    }`}>
      {status}
    </span>
  );
};

// Sample data - expanded with filtering capabilities
const allPurchaseOrders = Array(50).fill(null).map((_, index) => ({
  id: index + 1,
  orderNumber: index % 3 === 1 ? `PO-10000${index + 2}` : `PO-10000${index + 1}`,
  status: index % 3 === 1 ? 'Quote' as const : 'FulFilled' as const,
  vendor: index % 4 === 0 ? 'Cuisine Supply Inc.' : index % 4 === 1 ? 'Medical Equipment Co.' : index % 4 === 2 ? 'Pharma Distributors Ltd.' : 'Healthcare Solutions',
  orderDate: `${Math.floor(Math.random() * 28) + 1} Nov 2024`,
  location: index % 3 === 0 ? 'Eastern Warehouse' : index % 3 === 1 ? 'Main Warehouse' : 'Emergency Storage',
  total: 14001.20 + (index * 123.45),
  balance: 14001.20 + (index * 123.45),
}));

export const PurchaseOrders = () => {
  const [activeFilter, setActiveFilter] = useState<'Open' | 'Unpaid' | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('All');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  
  const itemsPerPage = 15;
  
  // Filter and search logic
  const filteredOrders = allPurchaseOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = selectedVendor === 'All' || order.vendor === selectedVendor;
    const matchesStatus = activeFilter === 'All' || 
                         (activeFilter === 'Open' && order.status === 'Quote') ||
                         (activeFilter === 'Unpaid' && order.balance > 0);
    return matchesSearch && matchesVendor && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  const handleFilterChange = (filter: 'Open' | 'Unpaid' | 'All') => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const vendors = ['All', ...Array.from(new Set(allPurchaseOrders.map(order => order.vendor)))];

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Purchase orders</h1>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2">
          <Button 
            variant={activeFilter === 'Open' ? 'default' : 'outline'} 
            className={`rounded-full ${activeFilter === 'Open' ? 'bg-enterprise-700' : ''}`}
            onClick={() => handleFilterChange('Open')}
          >
            Open
          </Button>
          <Button 
            variant={activeFilter === 'Unpaid' ? 'default' : 'outline'} 
            className={`rounded-full ${activeFilter === 'Unpaid' ? 'bg-enterprise-700' : ''}`}
            onClick={() => handleFilterChange('Unpaid')}
          >
            Unpaid
          </Button>
          <Button 
            variant={activeFilter === 'All' ? 'default' : 'outline'} 
            className={`rounded-full ${activeFilter === 'All' ? 'bg-enterprise-700' : ''}`}
            onClick={() => handleFilterChange('All')}
          >
            All
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by order number or vendor"
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Sheet open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
            <SheetTrigger asChild>
              <Button className="bg-enterprise-700 hover:bg-enterprise-800">
                <Plus className="mr-2 h-4 w-4" /> New purchase order
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>New Purchase Order</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <Input placeholder="Vendor" />
                <Input placeholder="Order Date" type="date" />
                <Input placeholder="Location" />
                <Input placeholder="Items" />
                <Input placeholder="Total Amount" type="number" />
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Create Order</Button>
                  <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>Cancel</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button variant="outline" className="whitespace-nowrap">
          <Filter className="mr-2 h-4 w-4" /> All filters
        </Button>
        <select 
          className="px-3 py-2 border rounded-md text-sm"
          value={selectedVendor}
          onChange={(e) => {
            setSelectedVendor(e.target.value);
            setCurrentPage(1);
          }}
        >
          {vendors.map(vendor => (
            <option key={vendor} value={vendor}>{vendor}</option>
          ))}
        </select>
        <Button variant="outline" className="whitespace-nowrap">
          <MapPin className="mr-2 h-4 w-4" /> Location
        </Button>
        <Button variant="outline" className="whitespace-nowrap">
          <Calendar className="mr-2 h-4 w-4" /> Order date
        </Button>
      </div>
      
      {/* Results count */}
      <div className="text-sm text-muted-foreground mb-4">
        Showing {paginatedOrders.length} of {filteredOrders.length} orders
      </div>
      
      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Order number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Order date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order, index) => (
              <TableRow key={order.id} className="cursor-pointer hover:bg-muted/30">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{order.orderNumber}</span>
                    <StatusTag status={order.status} />
                  </div>
                </TableCell>
                <TableCell>{order.vendor}</TableCell>
                <TableCell>{order.orderDate}</TableCell>
                <TableCell>{order.location}</TableCell>
                <TableCell>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                    ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </TableCell>
                <TableCell>${order.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setEditingOrder(order)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Edit Purchase Order</SheetTitle>
                      </SheetHeader>
                      <div className="space-y-4 mt-6">
                        <div>
                          <label className="text-sm font-medium">Order Number</label>
                          <Input value={order.orderNumber} disabled />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Vendor</label>
                          <Input defaultValue={order.vendor} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Status</label>
                          <select className="w-full px-3 py-2 border rounded-md">
                            <option value="Quote" selected={order.status === 'Quote'}>Quote</option>
                            <option value="FulFilled" selected={order.status === 'FulFilled'}>Fulfilled</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Location</label>
                          <Input defaultValue={order.location} />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Total</label>
                          <Input defaultValue={order.total} type="number" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Balance</label>
                          <Input defaultValue={order.balance} type="number" />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button className="flex-1">Save Changes</Button>
                          <Button variant="outline">Cancel</Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="mt-4 flex justify-end">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={i}>
                  <PaginationLink 
                    isActive={currentPage === pageNum} 
                    onClick={() => setCurrentPage(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationLink>...</PaginationLink>
              </PaginationItem>
            )}
            
            {totalPages > 5 && (
              <PaginationItem>
                <PaginationLink 
                  onClick={() => setCurrentPage(totalPages)}
                  className="cursor-pointer"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
