import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Edit3, X, Package, MapPin, Clock, User, ArrowRight, Trash2, Calendar, AlertCircle, Box, TrendingUp, FileText, Send, Smartphone, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ModernInventoryOverlay } from '../inventory/ModernInventoryOverlay';
import { ItemScanner } from '../scanner/ItemScanner';
import { StockTransfer, StockTransferItem, InventoryItem } from '@/types/inventory';
import { OrderStatusDialog, StatusUpdateData } from '../orders/OrderStatusDialog';
import { AutosuggestInput } from '../purchase-orders/AutosuggestInput';
import { DatePicker } from "@/components/ui/date-picker";
import { StockItem } from '@/types/purchaseOrder';

interface ModernStockTransferOverlayProps {
  transfer: StockTransfer | null;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  onSave?: (transfer: StockTransfer) => void;
  onUpdate?: (transfer: StockTransfer) => void;
  onDelete?: (transferId: string) => void;
}

const statusColors = {
  'Pending': 'pending' as const,
  'In Transit': 'approved' as const,
  'Completed': 'delivered' as const,
  'Cancelled': 'cancelled' as const
};

const locations = [
  'Main Warehouse',
  'Eastern Warehouse', 
  'Western Warehouse',
  'Emergency Room',
  'ICU',
  'Pharmacy',
  'Surgery Department'
];

const sampleItems = [
  { name: 'Bandages', availableStock: 500, saleUnit: 'Box' },
  { name: 'Syringes', availableStock: 1000, saleUnit: 'Pack' },
  { name: 'IV Fluids', availableStock: 250, saleUnit: 'Bottle' },
  { name: 'Oxygen Masks', availableStock: 150, saleUnit: 'Single Unit' },
  { name: 'Antibiotics', availableStock: 300, saleUnit: 'Strip' },
  { name: 'Pain Relievers', availableStock: 200, saleUnit: 'Strip' }
];

// Mock inventory database for scanner
const mockInventory: InventoryItem[] = [
  {
    id: 'INV-001',
    name: 'Paracetamol 500mg',
    category: 'Medicines',
    sku: 'MED-PAR-500',
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    unitPrice: 5.99,
    supplier: 'PharmaCorp',
    location: 'Shelf A-12',
    description: 'Pain relief medication',
    batchNumber: 'BATCH-2025-001',
    saleUnit: 'Strip',
    barcode: '1234567890128',
    barcodeType: 'EAN-13',
    qrCode: 'QR-INV-001',
    rfidTag: 'A1B2C3D4E5F67890ABCDEF12',
    trackingEnabled: true
  },
  {
    id: 'INV-002',
    name: 'Amoxicillin 250mg',
    category: 'Antibiotics',
    sku: 'MED-AMX-250',
    currentStock: 200,
    minStock: 75,
    maxStock: 600,
    unitPrice: 12.50,
    supplier: 'MediSupply Co',
    location: 'Shelf B-05',
    description: 'Antibiotic medication',
    batchNumber: 'BATCH-2025-002',
    saleUnit: 'Strip',
    barcode: '9876543210987',
    barcodeType: 'EAN-13',
    qrCode: 'QR-INV-002',
    rfidTag: 'B2C3D4E5F6G78901BCDEF123',
    trackingEnabled: true
  },
  {
    id: 'INV-003',
    name: 'Ibuprofen 400mg',
    category: 'Medicines',
    sku: 'MED-IBU-400',
    currentStock: 300,
    minStock: 100,
    maxStock: 800,
    unitPrice: 8.75,
    supplier: 'PharmaCorp',
    location: 'Shelf A-15',
    description: 'Anti-inflammatory medication',
    batchNumber: 'BATCH-2025-003',
    saleUnit: 'Strip',
    barcode: '5555666677778',
    barcodeType: 'EAN-13',
    qrCode: 'QR-INV-003',
    rfidTag: 'C3D4E5F6G7H89012CDEF1234',
    trackingEnabled: true
  }
];

export const ModernStockTransferOverlay = ({ 
  transfer, 
  isOpen, 
  onClose, 
  isEdit = false, 
  onSave, 
  onUpdate, 
  onDelete 
}: ModernStockTransferOverlayProps) => {
  const [items, setItems] = useState<StockTransferItem[]>([]);
  const [fromLocation, setFromLocation] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('');
  const [requestedBy, setRequestedBy] = useState<string>('');
  const [priority, setPriority] = useState<string>('Medium');
  const [reason, setReason] = useState<string>('');
  const [expectedDate, setExpectedDate] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(isEdit);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [isNarrowLayout, setIsNarrowLayout] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transfer) {
      setItems(transfer.items || []);
      setFromLocation(transfer.fromLocation || '');
      setToLocation(transfer.toLocation || '');
      setRequestedBy(transfer.requestedBy || '');
      setPriority(transfer.priority || 'Medium');
      setReason(transfer.reason || '');
      setExpectedDate(transfer.expectedDate || '');
    } else {
      setItems([]);
      setFromLocation('');
      setToLocation('');
      setRequestedBy('');
      setPriority('Medium');
      setReason('');
      setExpectedDate('');
    }
    setIsEditMode(isEdit || !transfer);
  }, [transfer, isEdit]);

  // Responsive layout detection
  useEffect(() => {
    if (!isOpen) return;

    const mq = window.matchMedia('(max-width: 1300px)');
    const handleMQ = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsNarrowLayout(e.matches);
    };
    handleMQ(mq);
    mq.addEventListener('change', handleMQ as any);

    const el = containerRef.current;
    let ro: ResizeObserver | null = null;
    if (el) {
      const measureContainer = () => {
        const cw = el.getBoundingClientRect().width;
        if (cw < 600 && !mq.matches) {
          setIsNarrowLayout(true);
        }
      };
      measureContainer();
      ro = new ResizeObserver(measureContainer);
      ro.observe(el);
    }

    return () => {
      mq.removeEventListener('change', handleMQ as any);
      if (ro) ro.disconnect();
    };
  }, [isOpen]);

  const isReadOnly = transfer?.status === 'Completed' || transfer?.status === 'Cancelled';

  const addItem = (stockItem?: StockItem) => {
    if (isReadOnly) return;
    
    const newItem: StockTransferItem = stockItem ? {
      name: stockItem.name,
      quantity: 1,
      availableStock: stockItem.stock || 0,
      saleUnit: stockItem.saleUnit || 'Single Unit'
    } : {
      name: '', 
      quantity: 1,
      availableStock: 0,
      saleUnit: 'Single Unit'
    };
    
    // Add new item at the beginning to push existing items down
    setItems([newItem, ...items]);
    
    toast({
      title: "Item Added",
      description: "New item has been added to the transfer.",
    });
  };

  const handleItemScanned = (item: InventoryItem, quantity?: number) => {
    if (isReadOnly) return;

    const newItem: StockTransferItem = {
      name: item.name,
      quantity: quantity || 1,
      availableStock: item.currentStock || 0,
      saleUnit: item.saleUnit || 'Single Unit'
    };
    
    setItems([...items, newItem]);
    
    toast({
      title: "Item Added via Scanner",
      description: `${item.name} - Qty: ${quantity || 1}`,
    });
  };

  const removeItem = (index: number) => {
    if (isReadOnly) return;
    setItems(items.filter((_, i: number) => i !== index));
    
    toast({
      title: "Item Removed",
      description: "Item has been removed from the transfer.",
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    if (isReadOnly) return;
    
    const updatedItems = [...items];
    (updatedItems[index] as any)[field] = value;
    
    // If item name is selected, update available stock and sale unit
    if (field === 'name') {
      const selectedItem = sampleItems.find(item => item.name === value);
      if (selectedItem) {
        updatedItems[index].availableStock = selectedItem.availableStock;
        updatedItems[index].saleUnit = selectedItem.saleUnit as any;
      }
    }
    
    setItems(updatedItems);
  };

  const handleSaveTransfer = async () => {
    if (!items.length) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item to the transfer.",
        variant: "destructive",
      });
      return;
    }

    if (!fromLocation || !toLocation) {
      toast({
        title: "Validation Error",
        description: "Please select both source and destination locations.",
        variant: "destructive",
      });
      return;
    }

    if (!requestedBy.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the requester name.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const transferData: StockTransfer = {
        id: transfer?.id || `st-${Date.now()}`,
        transferId: transfer?.transferId || `ST-${Date.now()}`,
        fromLocation,
        toLocation,
        items,
        status: transfer?.status || 'Pending',
        requestDate: transfer?.requestDate || new Date().toISOString().split('T')[0],
        requestedBy,
        priority: priority as 'Low' | 'Medium' | 'High' | 'Urgent',
        reason,
        expectedDate: expectedDate,
      };

      if (transfer && onUpdate) {
        await onUpdate(transferData);
        toast({
          title: "Transfer Updated",
          description: `Stock transfer ${transferData.transferId} has been updated successfully.`,
        });
      } else if (onSave) {
        await onSave(transferData);
        toast({
          title: "Transfer Created",
          description: `Stock transfer ${transferData.transferId} has been created successfully.`,
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const quickActions = (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <Package className="h-4 w-4 mr-1" />
        Track
      </Button>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <Clock className="h-4 w-4 mr-1" />
        History
      </Button>
    </div>
  );

  const handleDeleteTransfer = () => {
    if (transfer && onDelete) {
      if (confirm(`Are you sure you want to delete stock transfer ${transfer.transferId}?\n\nThis action cannot be undone.`)) {
        onDelete(transfer.transferId);
        toast({
          title: "Transfer Deleted",
          description: `Stock transfer ${transfer.transferId} has been removed.`,
        });
        onClose();
      }
    }
  };

  const handleStatusUpdate = (statusData: StatusUpdateData) => {
    if (!transfer || !onUpdate) return;

    // Validate and map status to allowed values
    const validStatuses = ['Pending', 'In Transit', 'Completed', 'Cancelled', 'Partially Received'] as const;
    const mappedStatus = validStatuses.includes(statusData.status as any) 
      ? statusData.status as typeof validStatuses[number]
      : 'Pending';

    // Update the transfer with new status and item fulfillment data
    const updatedTransfer: StockTransfer = {
      ...transfer,
      status: mappedStatus,
    };

    // Update items with fulfillment data if provided
    if (statusData.items) {
      updatedTransfer.items = items.map((item, index) => {
        const statusItem = statusData.items?.find(si => 
          (item.id && si.id === item.id) || si.name === item.name
        ) || statusData.items?.[index];
        
        if (statusItem) {
          return {
            ...item,
            id: item.id || `item-${index}`,
            fulfilledQty: statusItem.fulfilledQty,
            returnedQty: statusItem.returnedQty,
            damagedQty: statusItem.damagedQty,
          };
        }
        return item;
      });
      setItems(updatedTransfer.items);
    }

    // Update the transfer (dialog already closed by this point)
    try {
      onUpdate(updatedTransfer);
      
      toast({
        title: "Status Updated",
        description: `Transfer ${transfer.transferId} status changed to ${statusData.status}`,
      });

      // If there are damaged or returned items, show additional info
      if (statusData.items) {
        const damagedTotal = statusData.items.reduce((sum, item) => sum + (item.damagedQty || 0), 0);
        const returnedTotal = statusData.items.reduce((sum, item) => sum + (item.returnedQty || 0), 0);
        
        if (damagedTotal > 0 || returnedTotal > 0) {
          setTimeout(() => {
            toast({
              title: "Transfer Summary",
              description: `${returnedTotal > 0 ? `Returned: ${returnedTotal} items. ` : ''}${damagedTotal > 0 ? `Damaged: ${damagedTotal} items.` : ''}`,
              variant: damagedTotal > 0 ? "destructive" : "default",
            });
          }, 1000);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      {transfer && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowStatusDialog(true)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Update Status
        </Button>
      )}
      
      {(isEditMode || !transfer) && (
        <>
          <Button 
            size="sm"
            onClick={handleSaveTransfer}
            disabled={isSaving || isReadOnly}
            className="bg-slate-600 hover:bg-slate-700 text-white"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                {transfer ? 'Update' : 'Create'}
              </>
            )}
          </Button>
        </>
      )}
      
      {!isEditMode && transfer && !isReadOnly && (
        <>
          {onDelete && transfer.status !== 'Completed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteTransfer}
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
    <>
    <ModernInventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={transfer ? `Stock Transfer ${transfer.transferId}` : 'New Stock Transfer'}
      subtitle={transfer ? `Requested on ${transfer.requestDate}` : 'Create a new stock transfer request'}
      status={transfer?.status}
      statusColor={transfer?.status ? statusColors[transfer.status] : 'pending'}
      headerActions={headerActions}
      quickActions={quickActions}
      size="wide"
    >
      {/* Responsive Layout */}
      <div 
        ref={containerRef}
        className={isNarrowLayout ? "flex flex-col gap-4 overflow-y-auto" : "grid h-full"} 
        style={isNarrowLayout ? {} : { gridTemplateColumns: '30% 70%' }}
      >

        {/* Left Column / Top Section - Transfer Information */}
        <div className={isNarrowLayout ? "flex flex-col gap-4 p-4" : "flex flex-col gap-4 p-6 overflow-y-auto"}>

          {/* Location Information */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Transfer Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="from-location" className="text-xs font-medium flex items-center gap-1">
                  <Send className="h-3 w-3 text-blue-600" />
                  From Location
                </Label>
                <Select value={fromLocation} onValueChange={setFromLocation} disabled={!isEditMode}>
                  <SelectTrigger className="h-8 text-sm mt-1">
                    <SelectValue placeholder="Select source location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-center py-2">
                <ArrowRight className="h-5 w-5 text-green-600" />
              </div>
              
              <div>
                <Label htmlFor="to-location" className="text-xs font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-green-600" />
                  To Location
                </Label>
                <Select value={toLocation} onValueChange={setToLocation} disabled={!isEditMode}>
                  <SelectTrigger className="h-8 text-sm mt-1">
                    <SelectValue placeholder="Select destination location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Request Information */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="requested-by" className="text-xs font-medium flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  Requested By
                </Label>
                <Input
                  id="requested-by"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  disabled={!isEditMode}
                  className="h-8 text-sm mt-1"
                  placeholder="Enter requester name"
                />
              </div>
              <div>
                <Label htmlFor="priority" className="text-xs font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-muted-foreground" />
                  Priority
                </Label>
                <Select value={priority} onValueChange={setPriority} disabled={!isEditMode}>
                  <SelectTrigger className="h-8 text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem value="Medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="High">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="Urgent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Urgent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expected-date" className="text-xs font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  Expected Completion
                </Label>
                <div className="mt-1">
                  <DatePicker
                    date={expectedDate ? new Date(expectedDate) : undefined}
                    onDateChange={(date) => setExpectedDate(date ? date.toISOString().split('T')[0] : '')}
                    placeholder="Select expected date"
                    disabled={!isEditMode}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reason for Transfer */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Reason for Transfer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={!isEditMode}
                className="text-sm resize-none"
                placeholder="Enter reason for transfer..."
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column / Bottom Section - Transfer Items Table */}
        <div className={isNarrowLayout ? "flex flex-col gap-4 p-4" : "flex flex-col gap-4 p-6 h-full"}>

          {/* Items Table */}
          <Card className={isNarrowLayout ? "flex flex-col border-border/50 shadow-sm" : "flex flex-col border-border/50 shadow-sm"} style={isNarrowLayout ? {} : { height: '75vh' }}>
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Transfer Items ({items.length})
                </CardTitle>
                {(isEditMode || !transfer) && (
                  <div className="flex gap-2">
                    <ItemScanner 
                      onItemScanned={handleItemScanned}
                      existingItems={[]}
                      disabled={isReadOnly}
                    />
                    <Button onClick={() => addItem()} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className={isNarrowLayout ? "py-4" : "flex-1 overflow-hidden"}>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  No items added yet. Click "Add Item" to get started.
                </div>
              ) : (
                <div className={isNarrowLayout ? "overflow-auto max-h-96" : "h-full overflow-auto"} style={isNarrowLayout ? {} : { height: '60vh' }}>
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-[45%]">Item Name</TableHead>
                        <TableHead className="w-[20%]">Transfer Quantity</TableHead>
                        <TableHead className="w-[20%]">Available Stock</TableHead>
                        {(isEditMode || !transfer) && <TableHead className="w-[15%]"></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="relative overflow-visible p-2 break-words">
                            {(isEditMode || !transfer) ? (
                              <AutosuggestInput
                                value={item.name}
                                onChange={(value) => updateItem(index, 'name', value)}
                                onSelect={(stockItem) => {
                                  updateItem(index, 'name', stockItem.name);
                                  updateItem(index, 'availableStock', stockItem.stock || 0);
                                  updateItem(index, 'saleUnit', stockItem.saleUnit || 'Unit');
                                  updateItem(index, 'quantity', 1);
                                  if (index === items.length - 1) {
                                    addItem();
                                  }
                                }}
                                placeholder="Search items..."
                              />
                            ) : (
                              <span className="font-medium whitespace-normal break-words leading-tight">{item.name}</span>
                            )}
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex items-center gap-2">
                              {(isEditMode || !transfer) ? (
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                  className="w-20 min-w-[5rem] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  min={1}
                                />
                              ) : (
                                <span>{item.quantity}</span>
                              )}
                              <Badge variant="outline" className="text-xs whitespace-nowrap">
                                {item.saleUnit || 'Unit'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="p-2">
                            <Badge variant="outline" className="bg-muted">
                              {item.availableStock || 0} units
                            </Badge>
                          </TableCell>
                          {(isEditMode || !transfer) && (
                            <TableCell className="p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ModernInventoryOverlay>

    {/* Order Status Dialog */}
    {transfer && (
      <OrderStatusDialog
        isOpen={showStatusDialog}
        onClose={() => setShowStatusDialog(false)}
        orderType="stock-transfer"
        orderNumber={transfer.transferId}
        currentStatus={transfer.status}
        items={items.map((item, index) => ({
          id: item.id || `item-${index}`,
          name: item.name,
          qty: item.quantity,
          fulfilledQty: item.fulfilledQty,
          returnedQty: item.returnedQty,
          damagedQty: item.damagedQty,
        }))}
        onStatusUpdate={handleStatusUpdate}
      />
    )}
    </>
  );
};