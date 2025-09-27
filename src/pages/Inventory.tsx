import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Package, AlertTriangle, Calendar, Edit, Trash2, TrendingUp, Clock, Eye, MoreVertical, Tag, DollarSign } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { InventoryFormOverlay } from '../components/inventory/InventoryFormOverlay';
import { InventoryItem } from '../types/inventory';

// Sample inventory data
const inventoryData: InventoryItem[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    category: 'Medication',
    sku: 'MED001',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unitPrice: 2.50,
    supplier: 'PharmaCorp Ltd',
    expiryDate: '2025-08-15',
    location: 'Pharmacy-A1',
    batchNumber: 'B001',
    description: 'Pain relief medication',
    manufacturer: 'PharmaCorp'
  },
  {
    id: '2',
    name: 'Surgical Gloves (Box)',
    category: 'Medical Supplies',
    sku: 'SUP001',
    currentStock: 25,
    minStock: 20,
    maxStock: 100,
    unitPrice: 15.00,
    supplier: 'MedSupply Co',
    expiryDate: '2026-12-31',
    location: 'Storage-B2',
    batchNumber: 'B002',
    description: 'Sterile surgical gloves',
    manufacturer: 'MedSupply Co'
  },
  {
    id: '3',
    name: 'Ultrasound Gel',
    category: 'Medical Supplies',
    sku: 'SUP002',
    currentStock: 5,
    minStock: 15,
    maxStock: 50,
    unitPrice: 8.50,
    supplier: 'MedEquip Inc',
    expiryDate: '2025-06-30',
    location: 'Radiology',
    batchNumber: 'B003',
    description: 'Ultrasound gel for diagnostics',
    manufacturer: 'MedEquip Inc'
  }
];

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    'Normal': 'bg-green-100 text-green-800',
    'Low': 'bg-yellow-100 text-yellow-800',
    'Critical': 'bg-red-100 text-red-800',
    'Out of Stock': 'bg-red-100 text-red-800'
  };

  return (
    <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};

export const Inventory = () => {
  const [items, setItems] = useState<InventoryItem[]>(inventoryData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Listen for global create modal events
  useEffect(() => {
    const handleOpenCreateModal = (event: any) => {
      if (event.detail?.type === 'inventory') {
        setIsAddItemOpen(true);
      }
    };

    window.addEventListener('openCreateModal', handleOpenCreateModal);
    return () => window.removeEventListener('openCreateModal', handleOpenCreateModal);
  }, []);

  const categories = ['All', 'Medication', 'Medical Supplies', 'Equipment'];
  const statuses = ['All', 'Normal', 'Low', 'Critical', 'Out of Stock'];

  const getItemStatus = (item: InventoryItem): string => {
    if (item.currentStock === 0) return 'Out of Stock';
    if (item.currentStock < item.minStock) return 'Critical';
    if (item.currentStock < item.minStock * 1.5) return 'Low';
    return 'Normal';
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || getItemStatus(item) === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalItems = items.length;
  const lowStockItems = items.filter(item => getItemStatus(item) !== 'Normal').length;
  const criticalItems = items.filter(item => getItemStatus(item) === 'Critical').length;
  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
    toast({
      title: "Item Deleted",
      description: "Inventory item has been successfully deleted.",
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
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItems}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${totalValue.toFixed(2)}
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
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="rounded-full whitespace-nowrap"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search inventory..."
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

        {/* Inventory Table */}
        <Card className="border-border/50 shadow-sm">
          <div className="overflow-x-auto max-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">SKU: {item.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <StatusBadge status={getItemStatus(item)} />
                        <div className="text-sm text-muted-foreground">
                          {item.currentStock} / {item.minStock} min
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${item.unitPrice.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        Total: ${(item.currentStock * item.unitPrice).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.location}</div>
                        <div className="text-sm text-muted-foreground">{item.supplier}</div>
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
                            setEditingItem(item);
                            setIsEditMode(false);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setEditingItem(item);
                            setIsEditMode(true);
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Item
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

      {/* Inventory Item Modal */}
      <InventoryFormOverlay
        item={editingItem}
        isOpen={isAddItemOpen || !!editingItem}
        onClose={() => {
          setIsAddItemOpen(false);
          setEditingItem(null);
          setIsEditMode(false);
        }}
        isEdit={isEditMode}
        onSave={(newItem) => {
          setItems([...items, newItem]);
          setIsAddItemOpen(false);
        }}
        onUpdate={(updatedItem) => {
          setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i));
          setEditingItem(null);
          setIsEditMode(false);
        }}
      />
    </div>
  );
};