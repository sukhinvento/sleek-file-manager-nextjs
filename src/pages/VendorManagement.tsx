
import { useState } from 'react';
import { Search, Plus, Filter, MapPin, Phone, Mail, Building2, User, CreditCard, Eye, Edit, MoreVertical, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ModernVendorOverlay } from "@/components/vendor/ModernVendorOverlay";
import { toast } from "@/hooks/use-toast";

// Extended vendor data with additional fields
const vendorsData = [
  {
    id: 1,
    vendorId: 'V001',
    name: 'Cuisine Supply Inc.',
    contactPerson: 'John Anderson',
    phone: '+91-98765-43210',
    email: 'john@cuisinesupply.com',
    address: '123 Industrial Blvd, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    country: 'India',
    category: 'Food & Beverages',
    status: 'Active',
    totalOrders: 45,
    lastOrderDate: '2024-01-15',
    totalValue: 125000.50,
    paymentTerms: 'Net 30',
    taxId: 'ABCDE1234F',
    gstNumber: '27ABCDE1234F1Z5',
    website: 'www.cuisinesupply.com',
    bankName: 'HDFC Bank',
    accountNumber: '50100123456789',
    ifscCode: 'HDFC0001234',
    creditLimit: 50000.00,
    outstandingBalance: 12500.00,
    registrationDate: '2023-01-15',
    notes: 'Reliable supplier for food and beverage items',
    recentActivity: 'Order placed 2 days ago',
    riskLevel: 'Low'
  },
  {
    id: 2,
    vendorId: 'V002',
    name: 'Medical Equipment Co.',
    contactPerson: 'Sarah Wilson',
    phone: '+91-87654-32109',
    email: 'sarah@medequip.com',
    address: '456 Medical Drive, Delhi',
    city: 'Delhi',
    state: 'Delhi',
    zipCode: '110001',
    country: 'India',
    category: 'Medical Equipment',
    status: 'Active',
    totalOrders: 23,
    lastOrderDate: '2024-01-16',
    totalValue: 89000.75,
    paymentTerms: 'Net 15',
    taxId: 'FGHIJ5678K',
    gstNumber: '07FGHIJ5678K2Y4',
    website: 'www.medequip.com',
    bankName: 'ICICI Bank',
    accountNumber: '60200987654321',
    ifscCode: 'ICIC0005678',
    creditLimit: 75000.00,
    outstandingBalance: 8900.00,
    registrationDate: '2023-03-20',
    notes: 'Specialized in medical equipment and supplies',
    recentActivity: 'Payment received 1 week ago',
    riskLevel: 'Low'
  },
  {
    id: 3,
    vendorId: 'V003',
    name: 'Pharma Distributors Ltd.',
    contactPerson: 'Michael Brown',
    phone: '+91-76543-21098',
    email: 'michael@pharmadist.com',
    address: '789 Pharma Street, Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    zipCode: '560001',
    country: 'India',
    category: 'Pharmaceuticals',
    status: 'Pending',
    totalOrders: 67,
    lastOrderDate: '2024-01-10',
    totalValue: 235000.25,
    paymentTerms: 'Net 45',
    taxId: 'KLMNO9012P',
    gstNumber: '29KLMNO9012P3X6',
    website: 'www.pharmadist.com',
    bankName: 'State Bank of India',
    accountNumber: '70300456789012',
    ifscCode: 'SBIN0009012',
    creditLimit: 100000.00,
    outstandingBalance: 0.00,
    registrationDate: '2022-08-10',
    notes: 'Large pharmaceutical distributor with wide product range',
    recentActivity: 'Document verification pending',
    riskLevel: 'Medium'
  },
  {
    id: 4,
    vendorId: 'V004',
    name: 'Tech Solutions Pvt Ltd',
    contactPerson: 'Rajesh Kumar',
    phone: '+91-98765-12345',
    email: 'rajesh@techsolutions.com',
    address: '321 Tech Park, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    zipCode: '500001',
    country: 'India',
    category: 'Electronics',
    status: 'Active',
    totalOrders: 12,
    lastOrderDate: '2024-01-14',
    totalValue: 67500.00,
    paymentTerms: 'Net 30',
    taxId: 'PQRST3456U',
    gstNumber: '36PQRST3456U4W7',
    website: 'www.techsolutions.com',
    bankName: 'Axis Bank',
    accountNumber: '80400123456789',
    ifscCode: 'UTIB0003456',
    creditLimit: 40000.00,
    outstandingBalance: 5500.00,
    registrationDate: '2023-06-15',
    notes: 'Technology and electronics supplier',
    recentActivity: 'Order delivered yesterday',
    riskLevel: 'Low'
  },
  {
    id: 5,
    vendorId: 'V005',
    name: 'Office Supplies Hub',
    contactPerson: 'Priya Sharma',
    phone: '+91-87654-98765',
    email: 'priya@officesupplies.com',
    address: '654 Office Complex, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411001',
    country: 'India',
    category: 'Office Supplies',
    status: 'Inactive',
    totalOrders: 89,
    lastOrderDate: '2023-12-20',
    totalValue: 156000.00,
    paymentTerms: 'Net 45',
    taxId: 'UVWXY7890Z',
    gstNumber: '27UVWXY7890Z5A8',
    website: 'www.officesupplies.com',
    bankName: 'Punjab National Bank',
    accountNumber: '90500987654321',
    ifscCode: 'PUNB0007890',
    creditLimit: 60000.00,
    outstandingBalance: 15600.00,
    registrationDate: '2022-11-10',
    notes: 'Office supplies and stationery provider',
    recentActivity: 'Contract expired 1 month ago',
    riskLevel: 'High'
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusStyle(status)} font-medium`}>
      {status}
    </Badge>
  );
};

const RiskBadge = ({ level }: { level: string }) => {
  const getRiskStyle = (level: string) => {
    switch (level) {
      case 'Low':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Badge variant="outline" className={`${getRiskStyle(level)} text-xs`}>
      {level} Risk
    </Badge>
  );
};


export const VendorManagement = () => {
  const [vendors, setVendors] = useState(vendorsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isViewVendorOpen, setIsViewVendorOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const statuses = ['All', 'Active', 'Inactive', 'Pending'];
  const categories = ['All', ...Array.from(new Set(vendors.map(v => v.category)))];
  const riskLevels = ['All', 'Low', 'Medium', 'High'];
  
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.vendorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || vendor.status === selectedStatus;
    const matchesCategory = selectedCategory === 'All' || vendor.category === selectedCategory;
    const matchesRisk = selectedRisk === 'All' || vendor.riskLevel === selectedRisk;
    return matchesSearch && matchesStatus && matchesCategory && matchesRisk;
  });

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === 'Active').length;
  const pendingVendors = vendors.filter(v => v.status === 'Pending').length;
  const highRiskVendors = vendors.filter(v => v.riskLevel === 'High').length;
  const totalValue = vendors.reduce((sum, v) => sum + v.totalValue, 0);
  const totalOutstanding = vendors.reduce((sum, v) => sum + v.outstandingBalance, 0);

  const handleEditVendor = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsEditMode(true);
    setIsViewVendorOpen(true);
  };

  const handleViewVendor = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsEditMode(false);
    setIsViewVendorOpen(true);
  };

  const handleDeleteVendor = (vendorId: string) => {
    setVendors(vendors.filter(v => v.vendorId !== vendorId));
    toast({
      title: "Vendor Deleted",
      description: "Vendor has been successfully deleted.",
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your vendor relationships and track performance
          </p>
        </div>
        <Button 
          className="bg-slate-600 hover:bg-slate-700 text-white shadow-lg"
          onClick={() => setIsAddVendorOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Vendor
        </Button>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Vendors</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalVendors}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered vendors</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeVendors}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((activeVendors / totalVendors) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingVendors}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">High Risk</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highRiskVendors}</div>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Value</CardTitle>
            <CreditCard className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-600">
              ₹{(totalValue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime orders</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{(totalOutstanding / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pending payments</p>
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
                placeholder="Search by name, ID, contact person, email..."
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

              {/* Category Filter */}
              <div className="flex gap-2">
                <span className="text-sm font-medium text-muted-foreground self-center">Category:</span>
                {categories.slice(0, 4).map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full h-8 px-3 text-xs ${
                      selectedCategory === category ? 'bg-slate-600 text-white' : ''
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Risk Filter */}
              <div className="flex gap-2">
                <span className="text-sm font-medium text-muted-foreground self-center">Risk:</span>
                {riskLevels.map(risk => (
                  <Button
                    key={risk}
                    variant={selectedRisk === risk ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full h-8 px-3 text-xs ${
                      selectedRisk === risk ? 'bg-slate-600 text-white' : ''
                    }`}
                    onClick={() => setSelectedRisk(risk)}
                  >
                    {risk}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Showing {filteredVendors.length} of {totalVendors} vendors
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('All');
                    setSelectedCategory('All');
                    setSelectedRisk('All');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Vendors Table */}
      <Card className="border-border/50 shadow-sm">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[30%] font-semibold">Vendor Details</TableHead>
                <TableHead className="w-[20%] font-semibold">Contact & Location</TableHead>
                <TableHead className="w-[15%] font-semibold">Category & Status</TableHead>
                <TableHead className="w-[15%] font-semibold">Performance</TableHead>
                <TableHead className="w-[10%] font-semibold">Financial</TableHead>
                <TableHead className="w-[10%] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow 
                  key={vendor.id} 
                  className="hover:bg-muted/30 transition-colors border-border/50"
                >
                  {/* Vendor Details - Enhanced */}
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-base">
                            {vendor.name}
                          </div>
                          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md inline-block">
                            ID: {vendor.vendorId}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        {vendor.contactPerson}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {vendor.recentActivity}
                      </div>
                    </div>
                  </TableCell>

                  {/* Contact & Location */}
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{vendor.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className="text-primary hover:underline cursor-pointer">
                          {vendor.email}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{vendor.city}, {vendor.state}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category & Status */}
                  <TableCell className="py-4">
                    <div className="space-y-3">
                      <Badge 
                        variant="outline" 
                        className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
                      >
                        {vendor.category}
                      </Badge>
                      <div className="flex flex-col gap-2">
                        <StatusBadge status={vendor.status} />
                        <RiskBadge level={vendor.riskLevel} />
                      </div>
                    </div>
                  </TableCell>

                  {/* Performance */}
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-foreground">
                        {vendor.totalOrders}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Orders
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        ₹{(vendor.totalValue / 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last: {new Date(vendor.lastOrderDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>

                  {/* Financial */}
                  <TableCell className="py-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Credit: ₹{(vendor.creditLimit / 1000).toFixed(0)}K
                      </div>
                      <div className={`text-sm font-semibold ${
                        vendor.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        Outstanding: ₹{vendor.outstandingBalance.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs bg-muted px-2 py-1 rounded text-center">
                        {vendor.paymentTerms}
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
                        <DropdownMenuItem onClick={() => handleViewVendor(vendor)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditVendor(vendor)}>
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

      {/* Modern Vendor Overlays */}
      <ModernVendorOverlay 
        vendor={null}
        isOpen={isAddVendorOpen}
        onClose={() => setIsAddVendorOpen(false)}
        isEdit={false}
        onSave={(vendor) => {
          const newVendor = {
            ...vendor,
            id: vendors.length + 1,
            recentActivity: 'Vendor created',
            riskLevel: 'Low'
          };
          setVendors([...vendors, newVendor as any]);
          toast({
            title: "Vendor Created",
            description: `Vendor ${vendor.name} has been successfully created.`,
          });
        }}
      />
      
      <ModernVendorOverlay 
        vendor={selectedVendor}
        isOpen={isViewVendorOpen}
        onClose={() => {
          setIsViewVendorOpen(false);
          setSelectedVendor(null);
          setIsEditMode(false);
        }}
        isEdit={isEditMode}
        onUpdate={(vendor) => {
          setVendors(vendors.map(v => v.id === vendor.id ? vendor as any : v));
          toast({
            title: "Vendor Updated",
            description: `Vendor ${vendor.name} has been successfully updated.`,
          });
        }}
        onDelete={handleDeleteVendor}
      />
    </div>
  );
};
