import React, { useState, useEffect } from 'react';
import { ModernInventoryOverlay } from './ModernInventoryOverlay';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from 'lucide-react';
import { InventoryItem } from '../../types/inventory';

interface InventoryFormOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
  isEdit?: boolean;
  onSave?: (item: InventoryItem) => void;
  onUpdate?: (item: InventoryItem) => void;
}

export const InventoryFormOverlay = ({
  isOpen,
  onClose,
  item,
  isEdit = false,
  onSave,
  onUpdate
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
    batchNumber: ''
  });

  useEffect(() => {
    if (item && isEdit) {
      setFormData(item);
    } else {
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
        batchNumber: ''
      });
    }
  }, [item, isEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      batchNumber: formData.batchNumber || ''
    };

    if (isEdit && onUpdate) {
      onUpdate(inventoryItem);
    } else if (onSave) {
      onSave(inventoryItem);
    }
    
    onClose();
  };

  const headerActions = (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onClose}>
        <X className="mr-2 h-4 w-4" />
        Cancel
      </Button>
      <Button type="submit" form="inventory-form" className="bg-primary hover:bg-primary/90">
        <Save className="mr-2 h-4 w-4" />
        {isEdit ? 'Update' : 'Create'} Item
      </Button>
    </div>
  );

  return (
    <ModernInventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Inventory Item' : 'New Inventory Item'}
      subtitle={isEdit ? `Editing ${item?.name}` : 'Add a new item to inventory'}
      headerActions={headerActions}
      size="large"
    >
      <div className="flex-1 overflow-y-auto p-6">
        <form id="inventory-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Enter SKU"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Enter supplier name"
                />
              </div>
            </div>
          </div>

          {/* Stock Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Stock Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentStock">Current Stock *</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStock">Minimum Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStock">Maximum Stock</Label>
                <Input
                  id="maxStock"
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., A1-B2, Room 101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  placeholder="Enter batch number"
                />
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Pricing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter item description, specifications, or notes..."
                rows={4}
              />
            </div>
          </div>
        </form>
      </div>
    </ModernInventoryOverlay>
  );
};