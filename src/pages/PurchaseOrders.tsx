
import { useState } from 'react';
import { Search, Plus, Filter, MapPin, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

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

// Sample data
const purchaseOrders = Array(15).fill(null).map((_, index) => ({
  orderNumber: index % 3 === 1 ? `PO-100002` : `PO-100001`,
  status: index % 3 === 1 ? 'Quote' as const : 'FulFilled' as const,
  vendor: 'Cuisine Supply Inc.',
  orderDate: '3 Nov 2024',
  location: 'Eastern Warehouse',
  total: 14001.20,
  balance: 14001.20,
}));

export const PurchaseOrders = () => {
  const [activeFilter, setActiveFilter] = useState<'Open' | 'Unpaid' | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Purchase orders</h1>
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2">
          <Button 
            variant={activeFilter === 'Open' ? 'default' : 'outline'} 
            className={`rounded-full ${activeFilter === 'Open' ? 'bg-enterprise-700' : ''}`}
            onClick={() => setActiveFilter('Open')}
          >
            Open
          </Button>
          <Button 
            variant={activeFilter === 'Unpaid' ? 'default' : 'outline'} 
            className={`rounded-full ${activeFilter === 'Unpaid' ? 'bg-enterprise-700' : ''}`}
            onClick={() => setActiveFilter('Unpaid')}
          >
            Unpaid
          </Button>
          <Button 
            variant={activeFilter === 'All' ? 'default' : 'outline'} 
            className={`rounded-full ${activeFilter === 'All' ? 'bg-enterprise-700' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            All
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by [Input]"
              className="pl-8 w-full"
            />
          </div>
          <Button className="bg-enterprise-700 hover:bg-enterprise-800">
            <Plus className="mr-2 h-4 w-4" /> New purchase order
          </Button>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <Button variant="outline" className="whitespace-nowrap">
          <Filter className="mr-2 h-4 w-4" /> All filters
        </Button>
        <Button variant="outline" className="whitespace-nowrap">
          <User className="mr-2 h-4 w-4" /> Vendor
        </Button>
        <Button variant="outline" className="whitespace-nowrap">
          <MapPin className="mr-2 h-4 w-4" /> Location
        </Button>
        <Button variant="outline" className="whitespace-nowrap">
          <Calendar className="mr-2 h-4 w-4" /> Order date
        </Button>
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
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseOrders.map((order, index) => (
              <TableRow key={index} className="cursor-pointer hover:bg-muted/30">
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
                <TableCell className="text-right">${order.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
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
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} 
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  isActive={currentPage === i + 1} 
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            {totalPages > 5 && (
              <PaginationItem>
                <PaginationLink>...</PaginationLink>
              </PaginationItem>
            )}
            
            {totalPages > 5 && (
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} 
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
