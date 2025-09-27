import { useState, useEffect } from 'react';
import { Search, Plus, Filter, MapPin, Phone, Mail, Building2, User, CreditCard, Eye, Edit, MoreVertical, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { ModernVendorOverlay } from '../components/vendor/ModernVendorOverlay';
import { Vendor } from '../types/inventory';

// Sample vendor data
interface VendorWithRisk extends Vendor {
  riskLevel: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

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
  const variants = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    'Pending': 'bg-yellow-100 text-yellow-800'
  };

  return (
    <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};

const RiskBadge = ({ level }: { level: string }) => {
  const variants = {
    'Low': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-red-100 text-red-800'
  };

  return (
    <Badge variant="outline" className={`${variants[level as keyof typeof variants]} text-xs`}>
      {level} Risk
    </Badge>
  );
};

export const VendorManagement = () => {
  const [vendors, setVendors] = useState<VendorWithRisk[]>(vendorsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorWithRisk | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

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

  const statuses = ['All', 'Active', 'Inactive', 'Pending'];
  const categories = ['All', 'Pharmaceuticals', 'Medical Supplies', 'Medical Equipment'];
  
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.vendorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || vendor.status === selectedStatus;
    const matchesCategory = selectedCategory === 'All' || vendor.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(vendor => vendor.status === 'Active').length;
  const totalValue = vendors.reduce((sum, vendor) => sum + vendor.totalValue, 0);
  const totalOutstanding = vendors.reduce((sum, vendor) => sum + vendor.outstandingBalance, 0);

  const handleDeleteVendor = (vendorId: string) => {
    setVendors(vendors.filter(v => v.vendorId !== vendorId));
    toast({
      title: "Vendor Deleted",
      description: "Vendor has been successfully deleted.",
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
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeVendors}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${(totalValue / 1000).toFixed(0)}K
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ${(totalOutstanding / 1000).toFixed(0)}K
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
        <Card className="border-border/50 shadow-sm">
          <div className="overflow-x-auto max-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Details</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Category & Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Financial</TableHead>
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
                          <Phone className="w-4 h-4 mr-2" />
                          {vendor.phone}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2" />
                          {vendor.email}
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingVendor(vendor);
                            setIsEditMode(false);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setEditingVendor(vendor);
                            setIsEditMode(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Vendor
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteVendor(vendor.vendorId)}
                            className="text-red-600"
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Delete Vendor
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