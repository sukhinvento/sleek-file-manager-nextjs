import React, { useState, useEffect } from 'react';
import { ModernInventoryOverlay } from './ModernInventoryOverlay';
import { VendorAutosuggestInput } from './VendorAutosuggestInput';
import { BarcodeQRManager } from './BarcodeQRManager';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Save, X, Edit3, Trash2, Package, FileText, Printer, Box, Tag, TrendingUp, Barcode, Building2, MapPin, AlignLeft, FlaskConical, ShoppingCart, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../../types/inventory';
import { toast } from "@/hooks/use-toast";

interface InventoryFormOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
  isEdit?: boolean;
  onSave?: (item: InventoryItem) => void;
  onUpdate?: (item: InventoryItem) => void;
  onDelete?: (itemId: string) => void;
}

export const InventoryFormOverlay = ({
  isOpen,
  onClose,
  item,
  isEdit = false,
  onSave,
  onUpdate,
  onDelete
}: InventoryFormOverlayProps) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: '',
    sku: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unitPrice: 0,
    supplier: '',
    location: '',
    description: '',
    batchNumber: '',
    saleUnit: 'Single Unit',
    barcode: '',
    barcodeType: 'EAN-13',
    qrCode: '',
    rfidTag: '',
    rfidEnabled: false,
    trackingEnabled: false
  });
  
  const [isEditMode, setIsEditMode] = useState<boolean>(isEdit);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      setFormData(item);
      setIsEditMode(isEdit);
    } else {
      // Reset form for new item
      setFormData({
        name: '',
        category: '',
        sku: '',
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        unitPrice: 0,
        supplier: '',
        location: '',
        description: '',
        batchNumber: '',
        saleUnit: 'Single Unit'
      });
      setIsEditMode(true); // Always in edit mode for new items
    }
  }, [item, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    
    try {
      const inventoryItem: InventoryItem = {
        id: item?.id || Date.now().toString(),
        name: formData.name || '',
        category: formData.category || '',
        sku: formData.sku || '',
        currentStock: formData.currentStock || 0,
        minStock: formData.minStock || 0,
        maxStock: formData.maxStock || 0,
        unitPrice: formData.unitPrice || 0,
        supplier: formData.supplier || '',
        location: formData.location || '',
        description: formData.description || '',
        batchNumber: formData.batchNumber || '',
        saleUnit: formData.saleUnit
      };

      if (item && onUpdate) {
        await onUpdate(inventoryItem);
        toast({
          title: "Item Updated",
          description: `${inventoryItem.name} has been updated successfully.`,
        });
      } else if (onSave) {
        await onSave(inventoryItem);
        toast({
          title: "Item Created",
          description: `${inventoryItem.name} has been added to inventory.`,
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (item && onDelete) {
      if (confirm(`Are you sure you want to delete ${item.name}?`)) {
        onDelete(item.id);
        toast({
          title: "Item Deleted",
          description: `${item.name} has been removed from inventory.`,
        });
        onClose();
      }
    }
  };

  // Quick Actions - Show only when viewing (not in edit mode)
  const quickActions = !isEditMode && item ? (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <Package className="h-4 w-4 mr-1" />
        Stock History
      </Button>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <FileText className="h-4 w-4 mr-1" />
        Generate Label
      </Button>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <Printer className="h-4 w-4 mr-1" />
        Print
      </Button>
    </div>
  ) : null;

  // Header Actions - Different for viewing vs editing vs creating
  const headerActions = (
    <div className="flex items-center gap-2">
      {(isEditMode || !item) ? (
        <>
          <Button 
            type="submit" 
            form="inventory-form" 
            size="sm"
            className="bg-slate-600 hover:bg-slate-700 text-white"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                {item ? 'Update' : 'Create'} Item
              </>
            )}
          </Button>
        </>
      ) : (
        <>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode(true)}
          >
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </>
      )}
    </div>
  );

  return (
    <ModernInventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={item ? `Inventory Item ${item.sku}` : 'New Inventory Item'}
      subtitle={item ? item.name : 'Add a new item to inventory'}
      headerActions={headerActions}
      quickActions={quickActions}
      size="small"
    >
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form id="inventory-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Box className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Item Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter item name"
                    disabled={!isEditMode}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-sm font-medium flex items-center gap-1">
                    <Barcode className="h-4 w-4 text-muted-foreground" />
                    SKU <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Enter SKU"
                    disabled={!isEditMode}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium flex items-center gap-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    Category
                  </Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={!isEditMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Pharmaceuticals">Pharmaceuticals</SelectItem>
                      <SelectItem value="Consumables">Consumables</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier" className="text-sm font-medium flex items-center gap-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Supplier
                  </Label>
                  <VendorAutosuggestInput
                    value={formData.supplier}
                    onChange={(value) => setFormData({ ...formData, supplier: value })}
                    onSelect={(vendor) => setFormData({ ...formData, supplier: vendor.name })}
                    placeholder="Search and select supplier..."
                    disabled={!isEditMode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Information */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Stock Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStock" className="text-sm font-medium flex items-center gap-1">
                    <Package className="h-4 w-4 text-green-600" />
                    Current Stock <span className="text-destructive">*</span>
                  </Label>
                  <Input
                  id="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  disabled={!isEditMode}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock" className="text-sm font-medium flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Minimum Stock
                </Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  disabled={!isEditMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStock" className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Maximum Stock
                </Label>
                <Input
                  id="maxStock"
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  disabled={!isEditMode}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Storage Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., A1-B2, Room 101"
                  disabled={!isEditMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber" className="text-sm font-medium flex items-center gap-1">
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                  Batch Number
                </Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  placeholder="Enter batch number"
                  disabled={!isEditMode}
                />
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitPrice" className="text-sm font-medium flex items-center gap-1">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Unit Price
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      disabled={!isEditMode}
                      className="pl-7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saleUnit" className="text-sm font-medium flex items-center gap-1">
                    <Box className="h-4 w-4 text-muted-foreground" />
                    Minimum Sale Unit <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.saleUnit} 
                    onValueChange={(value) => setFormData({ ...formData, saleUnit: value as any })}
                    disabled={!isEditMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sale unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single Unit">Single Unit</SelectItem>
                      <SelectItem value="Strip">Strip (10 units)</SelectItem>
                      <SelectItem value="Box">Box (Multiple strips)</SelectItem>
                      <SelectItem value="Bottle">Bottle</SelectItem>
                    <SelectItem value="Vial">Vial</SelectItem>
                    <SelectItem value="Pack">Pack</SelectItem>
                    <SelectItem value="Sachet">Sachet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlignLeft className="h-5 w-5 text-primary" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter item description, specifications, or notes..."
                  rows={4}
                  disabled={!isEditMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Barcode & Tracking */}
          <BarcodeQRManager
            itemId={formData.id || 'new-item'}
            itemName={formData.name || 'New Item'}
            sku={formData.sku || ''}
            barcode={formData.barcode}
            barcodeType={formData.barcodeType as any}
            qrCode={formData.qrCode}
            rfidTag={formData.rfidTag}
            onUpdate={(data) => {
              setFormData(prev => ({ 
                ...prev, 
                barcode: data.barcode,
                barcodeType: data.barcodeType as any,
                qrCode: data.qrCode,
                rfidTag: data.rfidTag,
                trackingEnabled: !!(data.barcode || data.qrCode || data.rfidTag)
              }));
            }}
            disabled={!isEditMode}
          />
        </form>
      </div>
    </ModernInventoryOverlay>
  );
};