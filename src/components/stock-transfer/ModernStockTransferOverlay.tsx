import { useState, useEffect, useRef } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Save, Plus, Edit3, X, Package, MapPin, Clock, User, ArrowRight, Trash2, Calendar, AlertCircle, Box, TrendingUp, FileText, Send, Smartphone, CheckCircle, ArrowRightLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Card components removed — using tinted section headers pattern
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from '@/hooks/use-toast';
import { ModernInventoryOverlay } from '../inventory/ModernInventoryOverlay';
import { ItemScanner } from '../scanner/ItemScanner';
import { StockTransfer, StockTransferItem, InventoryItem } from '@/types/inventory';
import { OrderStatusDialog, StatusUpdateData } from '../orders/OrderStatusDialog';
import { AutosuggestInput } from '../purchase-orders/AutosuggestInput';
import { DatePicker } from "@/components/ui/date-picker";
import { StockItem } from '@/types/purchaseOrder';
import { fetchRooms } from '@/services/roomService';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { fetchInventoryItems } from '@/services/inventoryService';

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


export const ModernStockTransferOverlay = ({ 
  transfer, 
  isOpen, 
  onClose, 
  isEdit = false, 
  onSave, 
  onUpdate, 
  onDelete 
}: ModernStockTransferOverlayProps) => {
  const { displayName } = useCurrentUser();
  const [items, setItems] = useState<StockTransferItem[]>(transfer?.items || []);
  const [fromLocation, setFromLocation] = useState<string>(transfer?.fromLocation || '');
  const [toLocation, setToLocation] = useState<string>(transfer?.toLocation || '');
  const [requestedBy, setRequestedBy] = useState<string>(transfer?.requestedBy || displayName);
  const [priority, setPriority] = useState<string>(transfer?.priority || 'Medium');
  const [reason, setReason] = useState<string>(transfer?.reason || '');
  const [expectedDate, setExpectedDate] = useState<string>(transfer?.expectedDate || '');
  const [isEditMode, setIsEditMode] = useState<boolean>(isEdit || !transfer);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [isNarrowLayout, setIsNarrowLayout] = useState<boolean>(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);


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

  // Load locations (from rooms) and inventory items from API
  useEffect(() => {
    fetchRooms().then(rooms => {
      const seen = new Set<string>();
      const locs: string[] = [];
      for (const r of rooms) {
        const key = r.department || `Room ${r.roomNumber}`;
        if (!seen.has(key)) {
          seen.add(key);
          locs.push(key);
        }
      }
      setLocations(locs.length ? locs : ['Main Warehouse', 'Pharmacy', 'ICU', 'Emergency Room']);
    }).catch(() => {
      setLocations(['Main Warehouse', 'Pharmacy', 'ICU', 'Emergency Room']);
    });

    fetchInventoryItems().then(setInventoryItems).catch(() => {});
  }, []);

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
    
    toast({ title: 'Item Added', description: 'New item has been added to the transfer.', variant: 'success' });
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
    
    toast({ title: 'Item Added via Scanner', description: `${item.name} - Qty: ${quantity || 1}`, variant: 'success' });
  };

  const removeItem = (index: number) => {
    if (isReadOnly) return;
    setItems(items.filter((_, i: number) => i !== index));
    
    toast({ title: 'Item Removed', description: 'Item has been removed from the transfer.', variant: 'success' });
  };

  const updateItem = (index: number, field: string, value: any) => {
    if (isReadOnly) return;
    
    const updatedItems = [...items];
    (updatedItems[index] as any)[field] = value;
    
    // If item name is selected, update available stock and sale unit from loaded inventory
    if (field === 'name') {
      const selectedItem = inventoryItems.find(item => item.name === value);
      if (selectedItem) {
        updatedItems[index].availableStock = selectedItem.currentStock;
        updatedItems[index].saleUnit = selectedItem.saleUnit as any;
      }
    }
    
    setItems(updatedItems);
  };

  const handleSaveTransfer = async () => {
    if (!items.length) {
      toast({ title: 'Validation Error', description: 'Please add at least one item to the transfer.', variant: 'destructive' });
      return;
    }

    if (!fromLocation || !toLocation) {
      toast({ title: 'Validation Error', description: 'Please select both source and destination locations.', variant: 'destructive' });
      return;
    }

    if (!requestedBy.trim()) {
      toast({ title: 'Validation Error', description: 'Please enter the requester name.', variant: 'destructive' });
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
        toast({ title: 'Transfer Updated', description: `Stock transfer ${transferData.transferId} has been updated successfully.`, variant: 'success' });
      } else if (onSave) {
        await onSave(transferData);
        toast({ title: 'Transfer Created', description: `Stock transfer ${transferData.transferId} has been created successfully.`, variant: 'success' });
      }

      onClose();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save transfer. Please try again.', variant: 'destructive' });
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteTransfer = () => {
    if (transfer && onDelete) {
      onDelete(transfer.transferId);
      toast({ title: 'Transfer Deleted', description: `Stock transfer ${transfer.transferId} has been removed.`, variant: 'success' });
      onClose();
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
    const isProcessed = mappedStatus === 'In Transit' || mappedStatus === 'Completed';
    const updatedTransfer: StockTransfer = {
      ...transfer,
      status: mappedStatus,
      ...(isProcessed && displayName ? { approvedBy: displayName } : {}),
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
      
      toast({ title: 'Status Updated', description: `Transfer ${transfer.transferId} status changed to ${statusData.status}`, variant: 'success' });

      // If there are damaged or returned items, show additional info
      if (statusData.items) {
        const damagedTotal = statusData.items.reduce((sum, item) => sum + (item.damagedQty || 0), 0);
        const returnedTotal = statusData.items.reduce((sum, item) => sum + (item.returnedQty || 0), 0);

        if (damagedTotal > 0 || returnedTotal > 0) {
          setTimeout(() => {
            const msg = `${returnedTotal > 0 ? `Returned: ${returnedTotal} items. ` : ''}${damagedTotal > 0 ? `Damaged: ${damagedTotal} items.` : ''}`;
            if (damagedTotal > 0) {
              toast({ title: 'Transfer Summary', description: msg, variant: 'destructive' });
            } else {
              toast({ title: 'Transfer Summary', description: msg, variant: 'success' });
            }
          }, 1000);
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status. Please try again.', variant: 'destructive' });
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
              onClick={() => setShowDeleteConfirm(true)}
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
      <div ref={containerRef}>

      {/* ── VIEW MODE ── Clean read-only display ── */}
      {transfer && !isEditMode ? (
        <div className="flex flex-col gap-5 p-6">

          {/* Stat cards row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Items', value: `${items.length}`, icon: Package },
              { label: 'Priority', value: priority || '—', icon: AlertCircle },
              { label: 'Est. Value', value: `₹${items.reduce((s, i) => s + (i.quantity * (i.unitPrice || 0)), 0).toLocaleString('en-IN') || '—'}`, icon: TrendingUp },
            ].map(s => (
              <div key={s.label} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-base font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Transfer Route */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
              <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Transfer Route</span>
            </div>
            <div className="flex items-center px-4 py-4 bg-card">
              <div className="flex-1 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mb-1.5">
                  <Send className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">From</p>
                <p className="text-sm font-semibold text-foreground">{fromLocation || '—'}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary mx-4 flex-shrink-0" />
              <div className="flex-1 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 mb-1.5">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">To</p>
                <p className="text-sm font-semibold text-foreground">{toLocation || '—'}</p>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Request Details</span>
            </div>
            {[
              ['Requested By', requestedBy],
              ['Priority', priority],
              ['Request Date', transfer.requestDate],
              ['Expected Date', expectedDate || '—'],
              ['Status', transfer.status],
              ...(transfer.approvedBy ? [['Approved By', transfer.approvedBy]] : []),
            ].map(([label, value], i) => (
              <div key={label} className={`flex px-4 py-2.5 ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
                <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{label}</span>
                <span className="text-xs font-semibold text-foreground">{value || '—'}</span>
              </div>
            ))}
          </div>

          {/* Transfer Items */}
          {items.length > 0 && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-primary/[0.06]">
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Transfer Items</span>
                </div>
                <span className="text-xs text-muted-foreground font-medium">{items.length} item{items.length !== 1 ? 's' : ''}</span>
              </div>
              {/* Table header */}
              <div className="grid grid-cols-[1fr_auto_auto] px-4 py-2 bg-primary/[0.03] border-b border-border/50">
                <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">Item</span>
                <span className="text-[10px] text-primary font-semibold uppercase tracking-wider w-24 text-center">Qty</span>
                <span className="text-[10px] text-primary font-semibold uppercase tracking-wider w-24 text-right">Available</span>
              </div>
              {items.map((item, i) => (
                <div key={i} className={`grid grid-cols-[1fr_auto_auto] px-4 py-2.5 items-center ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
                  <span className="text-xs font-semibold text-foreground">{item.name}</span>
                  <div className="w-24 flex items-center justify-center gap-1">
                    <span className="text-xs font-semibold text-foreground">{item.quantity}</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">{item.saleUnit || 'Unit'}</Badge>
                  </div>
                  <div className="w-24 text-right">
                    <Badge variant="outline" className="text-[10px] bg-muted">{item.availableStock || 0} units</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reason */}
          {reason && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/[0.06]">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] text-primary uppercase tracking-wider font-semibold">Reason for Transfer</span>
              </div>
              <div className="px-4 py-3 bg-card">
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{reason}</p>
              </div>
            </div>
          )}
        </div>

      ) : (
      /* ── EDIT/ADD MODE ── */
      <div
        className={isNarrowLayout ? "flex flex-col gap-4 overflow-y-auto" : "grid h-full"}
        style={isNarrowLayout ? {} : { gridTemplateColumns: '30% 70%' }}
      >

        {/* Left Column / Top Section - Transfer Information */}
        <div className={isNarrowLayout ? "flex flex-col gap-4 p-4" : "flex flex-col gap-4 p-6 overflow-y-auto"}>

          {/* Location Information */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Transfer Locations</span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <Label htmlFor="from-location" className="text-xs font-medium flex items-center gap-1">
                  <Send className="h-3 w-3 text-blue-600" />
                  From Location
                </Label>
                <Select value={fromLocation} onValueChange={setFromLocation}>
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
                <Select value={toLocation} onValueChange={setToLocation}>
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
            </div>
          </div>

          {/* Request Information */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Request Details</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <Label htmlFor="requested-by" className="text-xs font-medium flex items-center gap-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  Requested By
                </Label>
                <Input
                  id="requested-by"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  className="h-8 text-sm mt-1"
                  placeholder="Enter requester name"
                />
              </div>
              <div>
                <Label htmlFor="priority" className="text-xs font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-muted-foreground" />
                  Priority
                </Label>
                <Select value={priority} onValueChange={setPriority}>
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
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reason for Transfer */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Reason for Transfer</span>
            </div>
            <div className="p-4">
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="text-sm resize-none"
                placeholder="Enter reason for transfer..."
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Right Column / Bottom Section - Transfer Items Table */}
        <div className={isNarrowLayout ? "flex flex-col gap-4 p-4" : "flex flex-col gap-4 p-6 h-full"}>

          {/* Items Table */}
          <div className={`flex flex-col rounded-lg border border-border overflow-hidden`} style={isNarrowLayout ? {} : { minHeight: '300px', maxHeight: '75vh' }}>
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Transfer Items ({items.length})</span>
                </div>
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
              </div>
            </div>
            <div className={isNarrowLayout ? "p-4" : "flex-1 overflow-y-auto p-4"}>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  No items added yet. Click "Add Item" to get started.
                </div>
              ) : isNarrowLayout ? (
                // Mobile/Narrow Layout: Card-based view
                <div className="space-y-3 overflow-auto">
                  {items.map((item, index) => (
                    <div key={index} className="rounded-lg border border-border bg-card">
                      <div className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-3">
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Item Name</Label>
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
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Transfer Quantity</Label>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                  className="mt-1 min-w-[60px]"
                                  min={1}
                                />
                              </div>

                              <div>
                                <Label className="text-xs font-medium text-muted-foreground">Sale Unit</Label>
                                <div className="mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {item.saleUnit || 'Unit'}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Available Stock</Label>
                              <div className="mt-1">
                                <Badge variant="outline" className="bg-muted">
                                  {item.availableStock || 0} units
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="bg-muted/30 rounded-lg p-2 flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop/Wide Layout: Table view
                <div className="h-full overflow-auto" style={{ height: '60vh' }}>
                  <Table>
                    <TableHeader className="sticky top-0 z-10">
                      <TableRow className="bg-primary/[0.06] border-b border-border">
                        <TableHead className="w-[45%] text-primary font-semibold uppercase tracking-wider text-xs">Item Name</TableHead>
                        <TableHead className="w-[20%] text-primary font-semibold uppercase tracking-wider text-xs">Transfer Qty</TableHead>
                        <TableHead className="w-[20%] text-primary font-semibold uppercase tracking-wider text-xs">Available</TableHead>
                        <TableHead className="w-[15%]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="relative overflow-visible p-2 break-words">
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
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={item.quantity}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-20 min-w-[5rem] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min={1}
                              />
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
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
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

    <ConfirmDialog
      open={showDeleteConfirm}
      onOpenChange={setShowDeleteConfirm}
      title={`Delete stock transfer ${transfer?.transferId ?? ''}?`}
      description="This will permanently remove this stock transfer. This action cannot be undone."
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={handleDeleteTransfer}
    />
    </>
  );
};