
import { useState } from 'react';
import { Search, Plus, Filter, MapPin, Phone, Mail, Building2, User, CreditCard } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ModernVendorOverlay } from "@/components/vendor/ModernVendorOverlay";

// Sample vendor data
const vendorsData = [
  {
    id: 1,
    vendorId: 'V001',
    name: 'Cuisine Supply Inc.',
    contactPerson: 'John Anderson',
    phone: '+1-555-0123',
    email: 'john@cuisinesupply.com',
    address: '123 Industrial Blvd, City, State 12345',
    category: 'Food & Beverages',
    status: 'Active',
    totalOrders: 45,
    lastOrderDate: '2024-01-15',
    totalValue: 125000.50,
    paymentTerms: 'Net 30',
    taxId: 'TAX123456789',
    website: 'www.cuisinesupply.com',
    bankDetails: 'HDFC Bank - 123456789',
    creditLimit: 50000.00,
    outstandingBalance: 12500.00,
    registrationDate: '2023-01-15',
    notes: 'Reliable supplier for food and beverage items'
  },
  {
    id: 2,
    vendorId: 'V002',
    name: 'Medical Equipment Co.',
    contactPerson: 'Sarah Wilson',
    phone: '+1-555-0124',
    email: 'sarah@medequip.com',
    address: '456 Medical Drive, City, State 12345',
    category: 'Medical Equipment',
    status: 'Active',
    totalOrders: 23,
    lastOrderDate: '2024-01-16',
    totalValue: 89000.75,
    paymentTerms: 'Net 15',
    taxId: 'TAX987654321',
    website: 'www.medequip.com',
    bankDetails: 'ICICI Bank - 987654321',
    creditLimit: 75000.00,
    outstandingBalance: 8900.00,
    registrationDate: '2023-03-20',
    notes: 'Specialized in medical equipment and supplies'
  },
  {
    id: 3,
    vendorId: 'V003',
    name: 'Pharma Distributors Ltd.',
    contactPerson: 'Michael Brown',
    phone: '+1-555-0125',
    email: 'michael@pharmadist.com',
    address: '789 Pharma Street, City, State 12345',
    category: 'Pharmaceuticals',
    status: 'Inactive',
    totalOrders: 67,
    lastOrderDate: '2024-01-10',
    totalValue: 235000.25,
    paymentTerms: 'Net 45',
    taxId: 'TAX456789123',
    website: 'www.pharmadist.com',
    bankDetails: 'SBI Bank - 456789123',
    creditLimit: 100000.00,
    outstandingBalance: 0.00,
    registrationDate: '2022-08-10',
    notes: 'Large pharmaceutical distributor with wide product range'
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <Badge className={status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
      {status}
    </Badge>
  );
};


export const VendorManagement = () => {
  const [vendors, setVendors] = useState(vendorsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isViewVendorOpen, setIsViewVendorOpen] = useState(false);

  const statuses = ['All', 'Active', 'Inactive'];
  
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.vendorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || vendor.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === 'Active').length;
  const totalValue = vendors.reduce((sum, v) => sum + v.totalValue, 0);

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vendor Management</h1>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setIsAddVendorOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Vendor
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeVendors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{totalValue.toLocaleString('en-IN')}
            </div>
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
              className={`rounded-full whitespace-nowrap ${selectedStatus === status ? 'bg-primary' : ''}`}
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
              placeholder="Search vendors..."
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

      {/* Vendors Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor Details</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVendors.map((vendor) => (
              <TableRow key={vendor.id} className="cursor-pointer hover:bg-muted/30">
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
                      <Phone className="w-3 h-3 mr-1" />
                      {vendor.phone}
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="w-3 h-3 mr-1" />
                      {vendor.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{vendor.category}</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={vendor.status} />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm font-medium">{vendor.totalOrders} orders</div>
                    <div className="text-sm text-muted-foreground">
                      ₹{vendor.totalValue.toLocaleString('en-IN')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`text-sm font-medium ${vendor.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{vendor.outstandingBalance.toLocaleString('en-IN')}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setIsViewVendorOpen(true);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modern Vendor Overlays */}
      <ModernVendorOverlay 
        vendor={null}
        isOpen={isAddVendorOpen}
        onClose={() => setIsAddVendorOpen(false)}
        isEdit={false}
        onSave={(vendor) => {
          setVendors([...vendors, { ...vendor, id: vendors.length + 1 }]);
        }}
      />
      
      <ModernVendorOverlay 
        vendor={selectedVendor}
        isOpen={isViewVendorOpen}
        onClose={() => {
          setIsViewVendorOpen(false);
          setSelectedVendor(null);
        }}
        onUpdate={(vendor) => {
          setVendors(vendors.map(v => v.id === vendor.id ? vendor : v));
        }}
      />
    </div>
  );
};
