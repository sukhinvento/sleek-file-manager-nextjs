import { useState } from 'react';
import { Search, Plus, Filter, Package, AlertTriangle, Calendar, Edit, Trash2, TrendingUp, Clock, Eye, MoreVertical, Tag, DollarSign } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ModernInventoryOverlay } from "@/components/inventory/ModernInventoryOverlay";
import { InventoryFormOverlay } from "@/components/inventory/InventoryFormOverlay";
import { FilterModal } from "@/components/ui/filter-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

// Enhanced inventory data
const inventoryItems = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    category: 'Medication',
    sku: 'MED001',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unitPrice: 2.50,
    supplier: 'PharmaCorp Ltd',
    expiryDate: '2025-08-15',
    batchNumber: 'PC2024001',
    location: 'Pharmacy-A1',
    lastRestocked: '2024-01-10',
    reorderPoint: 75
  },
  {
    id: 2,
    name: 'Surgical Gloves (Box)',
    category: 'Medical Supplies',
    sku: 'SUP001',
    currentStock: 25,
    minStock: 20,
    maxStock: 100,
    unitPrice: 15.00,
    supplier: 'MedSupply Co',
    expiryDate: '2026-12-31',
    batchNumber: 'MS2024015',
    location: 'Storage-B2',
    lastRestocked: '2024-01-08',
    reorderPoint: 30
  },
  {
    id: 3,
    name: 'Digital Thermometer',
    category: 'Equipment',
    sku: 'EQP001',
    currentStock: 8,
    minStock: 5,
    maxStock: 25,
    unitPrice: 45.00,
    supplier: 'MedTech Solutions',
    expiryDate: null,
    batchNumber: 'MT2024008',
    location: 'Equipment-C1',
    lastRestocked: '2024-01-05',
    reorderPoint: 10
  },
  {
    id: 4,
    name: 'Antiseptic Solution',
    category: 'Medical Supplies',
    sku: 'SUP002',
    currentStock: 5,
    minStock: 15,
    maxStock: 50,
    unitPrice: 8.75,
    supplier: 'CleanMed Inc',
    expiryDate: '2025-03-20',
    batchNumber: 'CM2024003',
    location: 'Storage-B1',
    lastRestocked: '2024-01-03',
    reorderPoint: 20
  },
  {
    id: 5,
    name: 'Blood Pressure Monitor',
    category: 'Equipment',
    sku: 'EQP002',
    currentStock: 12,
    minStock: 8,
    maxStock: 20,
    unitPrice: 120.00,
    supplier: 'HealthTech Pro',
    expiryDate: null,
    batchNumber: 'HT2024012',
    location: 'Equipment-C2',
    lastRestocked: '2024-01-12',
    reorderPoint: 10
  }
];

const getStockStatus = (current: number, min: number, reorderPoint: number) => {
  if (current <= min) return 'critical';
  if (current <= reorderPoint) return 'low';
  return 'normal';
};

const StockBadge = ({ status }: { status: 'critical' | 'low' | 'normal' }) => {
  const variants = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    normal: 'bg-green-100 text-green-800 border-green-200'
  };

  const icons = {
    critical: <AlertTriangle className="w-3 h-3 mr-1" />,
    low: <Clock className="w-3 h-3 mr-1" />,
    normal: <Package className="w-3 h-3 mr-1" />
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export const Inventory = () => {
  const [items, setItems] = useState(inventoryItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const categories = ['All', 'Medication', 'Medical Supplies', 'Equipment'];
  const stockStatuses = ['All', 'Critical', 'Low', 'Normal'];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const stockStatus = getStockStatus(item.currentStock, item.minStock, item.reorderPoint);
    const matchesStockStatus = selectedStockStatus === 'All' || 
                               stockStatus.toLowerCase() === selectedStockStatus.toLowerCase();
    return matchesSearch && matchesCategory && matchesStockStatus;
  });

  const totalItems = items.length;
  const lowStockItems = items.filter(item => getStockStatus(item.currentStock, item.minStock, item.reorderPoint) !== 'normal').length;
  const criticalItems = items.filter(item => getStockStatus(item.currentStock, item.minStock, item.reorderPoint) === 'critical').length;
  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
  const categories_count = new Set(items.map(item => item.category)).size;
  const outOfStockItems = items.filter(item => item.currentStock === 0).length;

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setIsEditMode(true);
  };

  const handleViewItem = (item: any) => {
    setEditingItem(item);
    setIsEditMode(false);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== parseInt(itemId)));
    toast({
      title: "Item Deleted",
      description: "Inventory item has been successfully deleted.",
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your inventory levels, stock alerts, and item details
          </p>
        </div>
        <Button 
          className="bg-slate-600 hover:bg-slate-700 text-white shadow-lg"
          onClick={() => {
            setSelectedItem(null);
            setIsEditMode(false);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Items</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique inventory items</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Critical Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Immediate attention needed</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Low Stock</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Need reordering soon</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categories</CardTitle>
            <Tag className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{categories_count}</div>
            <p className="text-xs text-muted-foreground mt-1">Product categories</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{(totalValue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground mt-1">Inventory worth</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Items unavailable</p>
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
                placeholder="Search by name, SKU, or supplier..."
                className="pl-10 h-12 text-base border-border/50 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <div className="flex gap-2">
                <span className="text-sm font-medium text-muted-foreground self-center">Category:</span>
                {categories.map(category => (
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

              {/* Stock Status Filter */}
              <div className="flex gap-2">
                <span className="text-sm font-medium text-muted-foreground self-center">Stock:</span>
                {stockStatuses.map(status => (
                  <Button
                    key={status}
                    variant={selectedStockStatus === status ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full h-8 px-3 text-xs ${
                      selectedStockStatus === status ? 'bg-slate-600 text-white' : ''
                    }`}
                    onClick={() => setSelectedStockStatus(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Showing {filteredItems.length} of {totalItems} inventory items
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedStockStatus('All');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Inventory Table */}
      <Card className="border-border/50 shadow-sm">
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[25%] font-semibold">Item Details</TableHead>
                <TableHead className="w-[15%] font-semibold">Category & SKU</TableHead>
                <TableHead className="w-[20%] font-semibold">Stock Status</TableHead>
                <TableHead className="w-[15%] font-semibold">Pricing</TableHead>
                <TableHead className="w-[15%] font-semibold">Location & Supplier</TableHead>
                <TableHead className="w-[10%] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item.currentStock, item.minStock, item.reorderPoint);
                return (
                  <TableRow 
                    key={item.id} 
                    className={`hover:bg-muted/30 transition-colors border-border/50 cursor-pointer ${
                      selectedItemId === item.id.toString() ? 'bg-slate-50 border-slate-300' : ''
                    }`}
                    onClick={() => setSelectedItemId(selectedItemId === item.id.toString() ? null : item.id.toString())}
                  >
                    {/* Item Details */}
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground text-base">
                              {item.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Batch: {item.batchNumber}
                            </div>
                          </div>
                        </div>
                        {item.expiryDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Expires: {item.expiryDate}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Category & SKU */}
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {item.category}
                        </Badge>
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                          SKU: {item.sku}
                        </div>
                      </div>
                    </TableCell>

                    {/* Stock Status */}
                    <TableCell className="py-4">
                      <div className="space-y-3">
                        <StockBadge status={stockStatus} />
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-foreground">
                            {item.currentStock}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Min: {item.minStock} / Max: {item.maxStock}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Reorder at: {item.reorderPoint}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Pricing */}
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-foreground">
                          ₹{item.unitPrice.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Per unit
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          ₹{(item.currentStock * item.unitPrice).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Total value
                        </div>
                      </div>
                    </TableCell>

                    {/* Location & Supplier */}
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-foreground">
                          {item.location}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Location
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.supplier}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last restocked: {item.lastRestocked}
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
                          <DropdownMenuItem onClick={() => handleViewItem(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditItem(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteItem(item.id.toString())}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Inventory Form Overlay */}
      <InventoryFormOverlay
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        item={selectedItem}
        isEdit={isEditMode}
        onSave={(item) => {
          const newItem = { 
            ...item, 
            id: parseInt(item.id),
            lastRestocked: new Date().toISOString().split('T')[0],
            reorderPoint: item.minStock || 0,
            expiryDate: item.expiryDate || '',
            location: item.location || '',
            description: item.description || '',
            manufacturer: item.manufacturer || ''
          };
          setItems([...items, newItem]);
          toast({
            title: "Item Created",
            description: "Inventory item has been successfully created.",
          });
        }}
        onUpdate={(item) => {
          const updatedItem = { 
            ...item, 
            id: parseInt(item.id),
            lastRestocked: new Date().toISOString().split('T')[0],
            reorderPoint: item.minStock || 0,
            expiryDate: item.expiryDate || '',
            location: item.location || '',
            description: item.description || '',
            manufacturer: item.manufacturer || ''
          };
          setItems(items.map(i => i.id === parseInt(item.id) ? updatedItem : i));
          toast({
            title: "Item Updated",
            description: "Inventory item has been successfully updated.",
          });
        }}
      />

      {/* View Details Overlay */}
      <ModernInventoryOverlay
        isOpen={!!editingItem && !isEditMode}
        onClose={() => {
          setEditingItem(null);
          setIsEditMode(false);
        }}
        title={editingItem ? `View Item Details` : ''}
        subtitle={editingItem ? editingItem.name : ''}
        size="large"
      >
        <div className="p-6">
          <p className="text-muted-foreground">
            View inventory item details would go here...
          </p>
        </div>
      </ModernInventoryOverlay>
    </div>
  );
};