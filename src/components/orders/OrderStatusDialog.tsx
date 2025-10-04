import { useState } from 'react';
import { 
  ResponsiveDialog, 
  ResponsiveDialogContent, 
  ResponsiveDialogFooter, 
  ResponsiveDialogHeader, 
  ResponsiveDialogTitle,
  ResponsiveDialogBody
} from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Package, 
  PackageCheck,
  PackageX,
  Undo2,
  AlertOctagon
} from 'lucide-react';

export interface OrderItem {
  id?: string;
  name: string;
  qty: number;
  fulfilledQty?: number;
  returnedQty?: number;
  damagedQty?: number;
}

export interface StatusUpdateData {
  status: string;
  items?: Array<{
    id?: string;
    name: string;
    orderedQty: number;
    fulfilledQty: number;
    returnedQty: number;
    damagedQty: number;
  }>;
  notes?: string;
  updateDate: string;
}

interface OrderStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderType: 'purchase' | 'sales' | 'stock-transfer';
  orderNumber: string;
  currentStatus: string;
  items: OrderItem[];
  onStatusUpdate: (data: StatusUpdateData) => void;
}

const statusOptions = {
  purchase: [
    { value: 'Pending', label: 'Pending', icon: AlertTriangle, color: 'text-yellow-600' },
    { value: 'Approved', label: 'Approved', icon: CheckCircle2, color: 'text-green-600' },
    { value: 'Partially Received', label: 'Partially Received', icon: Package, color: 'text-blue-600' },
    { value: 'Received', label: 'Received', icon: PackageCheck, color: 'text-green-600' },
    { value: 'Cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-600' },
  ],
  sales: [
    { value: 'Pending', label: 'Pending', icon: AlertTriangle, color: 'text-yellow-600' },
    { value: 'Processing', label: 'Processing', icon: Package, color: 'text-blue-600' },
    { value: 'Partially Shipped', label: 'Partially Shipped', icon: Package, color: 'text-blue-600' },
    { value: 'Shipped', label: 'Shipped', icon: PackageCheck, color: 'text-green-600' },
    { value: 'Delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-green-600' },
    { value: 'Cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-600' },
  ],
  'stock-transfer': [
    { value: 'Pending', label: 'Pending', icon: AlertTriangle, color: 'text-yellow-600' },
    { value: 'In Transit', label: 'In Transit', icon: Package, color: 'text-blue-600' },
    { value: 'Partially Received', label: 'Partially Received', icon: Package, color: 'text-blue-600' },
    { value: 'Completed', label: 'Completed', icon: CheckCircle2, color: 'text-green-600' },
    { value: 'Cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-600' },
  ],
};

export const OrderStatusDialog = ({
  isOpen,
  onClose,
  orderType,
  orderNumber,
  currentStatus,
  items,
  onStatusUpdate,
}: OrderStatusDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [notes, setNotes] = useState('');
  const [itemQuantities, setItemQuantities] = useState<Record<string, {
    fulfilled: number;
    returned: number;
    damaged: number;
  }>>(
    items.reduce((acc, item, index) => {
      const key = item.id || `item-${index}`;
      acc[key] = {
        fulfilled: item.fulfilledQty || 0,
        returned: item.returnedQty || 0,
        damaged: item.damagedQty || 0,
      };
      return acc;
    }, {} as Record<string, { fulfilled: number; returned: number; damaged: number }>)
  );

  const statusOpts = statusOptions[orderType] || statusOptions.purchase;
  const requiresItemUpdate = selectedStatus.includes('Partial') || 
                             selectedStatus === 'Received' || 
                             selectedStatus === 'Delivered' ||
                             selectedStatus === 'Completed';

  const handleQuantityChange = (itemKey: string, field: 'fulfilled' | 'returned' | 'damaged', value: string) => {
    const numValue = parseInt(value) || 0;
    setItemQuantities(prev => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        [field]: Math.max(0, numValue),
      },
    }));
  };

  const handleSubmit = () => {
    const updateData: StatusUpdateData = {
      status: selectedStatus,
      updateDate: new Date().toISOString(),
      notes: notes.trim() || undefined,
    };

    if (requiresItemUpdate) {
      updateData.items = items.map((item, index) => {
        const key = item.id || `item-${index}`;
        const quantities = itemQuantities[key];
        return {
          id: item.id,
          name: item.name,
          orderedQty: item.qty,
          fulfilledQty: quantities?.fulfilled || 0,
          returnedQty: quantities?.returned || 0,
          damagedQty: quantities?.damaged || 0,
        };
      });
    }

    // Call the update handler with data
    try {
      onStatusUpdate(updateData);
      // Close dialog after successful callback
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      // Keep dialog open if there's an error
    }
  };

  const getItemKey = (item: OrderItem, index: number) => item.id || `item-${index}`;

  const getTotalFulfilled = (itemKey: string) => {
    return itemQuantities[itemKey]?.fulfilled || 0;
  };

  const getTotalReturned = (itemKey: string) => {
    return itemQuantities[itemKey]?.returned || 0;
  };

  const getTotalDamaged = (itemKey: string) => {
    return itemQuantities[itemKey]?.damaged || 0;
  };

  const validateQuantities = (item: OrderItem, index: number) => {
    const key = getItemKey(item, index);
    const fulfilled = getTotalFulfilled(key);
    const returned = getTotalReturned(key);
    const damaged = getTotalDamaged(key);
    const total = fulfilled + returned + damaged;
    return total <= item.qty;
  };

  const isValid = () => {
    if (!selectedStatus) return false;
    
    if (requiresItemUpdate) {
      return items.every((item, index) => validateQuantities(item, index));
    }
    
    return true;
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            <Package className="h-5 w-5 text-white" />
            Update Order Status - {orderNumber}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="space-y-6">
          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Order Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOpts.map((status) => {
                  const Icon = status.icon;
                  return (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${status.color}`} />
                        <span>{status.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Item-level Fulfillment */}
          {requiresItemUpdate && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b">
                <PackageCheck className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Item Fulfillment Details</h3>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => {
                  const key = getItemKey(item, index);
                  const quantities = itemQuantities[key];
                  const total = getTotalFulfilled(key) + getTotalReturned(key) + getTotalDamaged(key);
                  const isOverLimit = total > item.qty;

                  return (
                    <div key={key} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-600 mt-0.5">Ordered Quantity: {item.qty}</p>
                        </div>
                        {isOverLimit && (
                          <div className="flex items-center gap-1 text-red-600 text-xs">
                            <AlertOctagon className="h-3 w-3" />
                            <span>Exceeds ordered qty</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {/* Fulfilled Quantity */}
                        <div className="space-y-1">
                          <Label htmlFor={`fulfilled-${key}`} className="text-xs flex items-center gap-1">
                            <PackageCheck className="h-3 w-3 text-green-600" />
                            Fulfilled
                          </Label>
                          <Input
                            id={`fulfilled-${key}`}
                            type="number"
                            min="0"
                            max={item.qty}
                            value={quantities.fulfilled}
                            onChange={(e) => handleQuantityChange(key, 'fulfilled', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>

                        {/* Returned Quantity */}
                        <div className="space-y-1">
                          <Label htmlFor={`returned-${key}`} className="text-xs flex items-center gap-1">
                            <Undo2 className="h-3 w-3 text-blue-600" />
                            Returned
                          </Label>
                          <Input
                            id={`returned-${key}`}
                            type="number"
                            min="0"
                            max={item.qty}
                            value={quantities.returned}
                            onChange={(e) => handleQuantityChange(key, 'returned', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>

                        {/* Damaged Quantity */}
                        <div className="space-y-1">
                          <Label htmlFor={`damaged-${key}`} className="text-xs flex items-center gap-1">
                            <PackageX className="h-3 w-3 text-red-600" />
                            Damaged
                          </Label>
                          <Input
                            id={`damaged-${key}`}
                            type="number"
                            min="0"
                            max={item.qty}
                            value={quantities.damaged}
                            onChange={(e) => handleQuantityChange(key, 'damaged', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="text-xs text-gray-600 pt-2 border-t flex justify-between">
                        <span>Total Accounted: {total}</span>
                        <span className={total > item.qty ? 'text-red-600 font-semibold' : ''}>
                          Remaining: {Math.max(0, item.qty - total)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Fulfillment Guidelines:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>Fulfilled: Items successfully received/delivered in good condition</li>
                      <li>Returned: Items sent back to vendor/customer</li>
                      <li>Damaged: Items received/delivered but damaged or defective</li>
                      <li>Total (Fulfilled + Returned + Damaged) should not exceed ordered quantity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Comments (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this status update..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid()} className="flex-1 sm:flex-initial">
            Update Status
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
