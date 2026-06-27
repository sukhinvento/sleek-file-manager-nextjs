import { useState, useEffect, useRef } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Save, Plus, Edit3, Package, MapPin, Clock, User, ArrowRight, Trash2, Calendar, AlertCircle, TrendingUp, FileText, Send, CheckCircle, ArrowRightLeft, MessageSquare, History, Navigation } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DeletePopover } from '@/components/ui/delete-popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchInventoryItems, fetchItemLocations, updateInventoryStock, InventoryLocationStock } from '@/services/inventoryService';
import { fetchLocationLookup } from '@/services/locationService';

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
  // Per-item location stock cache: itemName → array of InventoryLocationStock
  const [itemLocationStocks, setItemLocationStocks] = useState<Map<string, InventoryLocationStock[]>>(new Map());

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

  // Load locations and inventory items
  useEffect(() => {
    fetchLocationLookup().then(locs => setLocations(locs.map(l => l.label))).catch(() => setLocations([]));
    fetchInventoryItems(1, 200).then(res => {
      const loaded = res.data || [];
      setInventoryItems(loaded);
      // Pre-fetch location stocks for items already on the transfer
      if (transfer?.items?.length) {
        transfer.items.forEach(ti => {
          const inv = loaded.find(i => i.name === ti.name);
          if (inv) fetchAndCacheItemLocations(inv.id, ti.name);
        });
      }
    }).catch(() => {});
  }, []);

  // Fetch per-location stock for a single inventory item and cache by name
  const fetchAndCacheItemLocations = (inventoryItemId: string, itemName: string) => {
    if (!inventoryItemId) return;
    fetchItemLocations(inventoryItemId).then(locs => {
      if (locs.length > 0) {
        setItemLocationStocks(prev => new Map(prev).set(itemName, locs));
      }
    }).catch(() => {});
  };

  // Returns stock at the fromLocation for a specific item name using per-item cache
  const getStockAtFromLocation = (itemName: string): number | undefined => {
    if (!fromLocation) return undefined;
    const locs = itemLocationStocks.get(itemName);
    if (locs) {
      const match = locs.find(l => l.locationName === fromLocation);
      return match?.quantity ?? 0;
    }
    return undefined;
  };

  // Returns stock at the toLocation for a specific item name using per-item cache
  const getStockAtToLocation = (itemName: string): number | undefined => {
    if (!toLocation) return undefined;
    const locs = itemLocationStocks.get(itemName);
    if (!locs) return undefined;
    return locs.find(l => l.locationName === toLocation)?.quantity ?? 0;
  };

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

    setItems(prev => [...prev, newItem]);
    fetchAndCacheItemLocations(item.id, item.name);

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
    
    if (field === 'name') {
      const globalItem = inventoryItems.find(item => item.name === value);
      if (globalItem) {
        updatedItems[index].availableStock = globalItem.currentStock ?? 0;
        updatedItems[index].saleUnit = globalItem.saleUnit as any;
        fetchAndCacheItemLocations(globalItem.id, value);
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

  const quickActions = transfer ? (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => setShowTrack(true)}>
        <Navigation className="h-4 w-4 mr-1" />
        Track
      </Button>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => setShowHistory(true)}>
        <History className="h-4 w-4 mr-1" />
        History
      </Button>
    </div>
  ) : null;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTrack, setShowTrack] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleDeleteTransfer = () => {
    if (transfer && onDelete) {
      onDelete(transfer.transferId);
      toast({ title: 'Transfer Deleted', description: `Stock transfer ${transfer.transferId} has been removed.`, variant: 'success' });
      onClose();
    }
  };

  const handleStatusUpdate = async (statusData: StatusUpdateData) => {
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

    // 1. Save the transfer status first (critical — must not be blocked by inventory updates)
    try {
      onUpdate(updatedTransfer);
      toast({ title: 'Status Updated', description: `Transfer ${transfer.transferId} status changed to ${statusData.status}`, variant: 'success' });

      if (statusData.items) {
        const damagedTotal = statusData.items.reduce((sum, item) => sum + (item.damagedQty || 0), 0);
        const returnedTotal = statusData.items.reduce((sum, item) => sum + (item.returnedQty || 0), 0);
        if (damagedTotal > 0 || returnedTotal > 0) {
          setTimeout(() => {
            const msg = `${returnedTotal > 0 ? `Returned: ${returnedTotal} items. ` : ''}${damagedTotal > 0 ? `Damaged: ${damagedTotal} items.` : ''}`;
            toast({ title: 'Transfer Summary', description: msg, variant: damagedTotal > 0 ? 'destructive' : 'success' });
          }, 800);
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update transfer status. Please try again.', variant: 'destructive' });
      return;
    }

    // 2. Best-effort inventory location adjustment (non-blocking, never surfaces errors to the user)
    if (mappedStatus === 'Completed' && fromLocation && toLocation) {
      const inventoryMap = new Map(inventoryItems.map(inv => [inv.name, inv]));

      for (const item of updatedTransfer.items) {
        const inv = inventoryMap.get(item.name);
        if (!inv?.id) continue;

        const fulfilledQty = item.fulfilledQty ?? item.quantity;

        // Deduct from source location
        updateInventoryStock(inv.id, fromLocation, -(item.quantity)).catch(e =>
          console.warn(`Could not deduct ${item.name} from ${fromLocation}:`, e)
        );

        // Add to destination location
        updateInventoryStock(inv.id, toLocation, fulfilledQty).catch(e =>
          console.warn(`Could not add ${item.name} to ${toLocation}:`, e)
        );
      }
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
            className=""
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

  const editable = isEditMode || !transfer;

  const itemsTableContent = (
    <>
      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
          No items added yet. Click "Add Item" to get started.
        </div>
      ) : !editable && isNarrowLayout ? (
        /* ── Mobile view mode: item cards ─────────────────────── */
        <div className="space-y-3">
          {items.map((item, index) => {
            const fromStock = getStockAtFromLocation(item.name);
            const toStock = getStockAtToLocation(item.name);
            const hasFromData = fromLocation && fromStock !== undefined;
            const displayFromStock = fromStock ?? item.availableStock ?? 0;
            const isOver = hasFromData && item.quantity > displayFromStock;
            const fromBadgeClass = isOver
              ? 'bg-red-50 text-red-700 border-red-200'
              : hasFromData
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-muted text-muted-foreground border-border';
            const toBadgeClass = toStock !== undefined
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-muted text-muted-foreground border-border';
            return (
              <div key={index} className="rounded-xl border border-border bg-muted/30 p-3 space-y-2.5">
                {/* Item name row */}
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-semibold text-foreground leading-tight">{item.name}</span>
                </div>
                {/* Qty + stock flow */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Transfer:</span>
                    <span className="font-bold text-sm text-foreground">{item.quantity}</span>
                    <Badge variant="outline" className="text-[10px]">{item.saleUnit || 'Unit'}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap pt-0.5 border-t border-border">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">From Stock</span>
                    <Badge variant="outline" className={`text-xs w-fit ${fromBadgeClass}`}>
                      {hasFromData ? `${displayFromStock}` : (fromLocation ? '…' : '—')}
                      {hasFromData && <span className="ml-0.5 font-normal opacity-70 text-[9px]">avail</span>}
                    </Badge>
                    {isOver && (
                      <span className="text-[10px] text-red-600 font-medium">-{item.quantity - displayFromStock} over</span>
                    )}
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">To Stock</span>
                    <Badge variant="outline" className={`text-xs w-fit ${toBadgeClass}`}>
                      {toStock !== undefined ? `${toStock}` : (toLocation ? '…' : '—')}
                      {toStock !== undefined && <span className="ml-0.5 font-normal opacity-70 text-[9px]">there</span>}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Edit mode: keep table with inputs ─────────────────── */
        <div className="h-full overflow-auto" style={{ height: isNarrowLayout ? 'auto' : '58vh' }}>
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[35%]">Item Name</TableHead>
                <TableHead className="w-[17%]">Transfer Qty</TableHead>
                <TableHead className="w-[18%]">
                  <div className="flex flex-col leading-tight">
                    <span className="text-blue-600 dark:text-blue-400">From Stock</span>
                    {fromLocation && <span className="text-[10px] font-normal text-muted-foreground truncate max-w-[100px]">{fromLocation}</span>}
                  </div>
                </TableHead>
                <TableHead className="w-[18%]">
                  <div className="flex flex-col leading-tight">
                    <span className="text-emerald-600 dark:text-emerald-400">To Stock</span>
                    {toLocation && <span className="text-[10px] font-normal text-muted-foreground truncate max-w-[100px]">{toLocation}</span>}
                  </div>
                </TableHead>
                {editable && !isReadOnly && <TableHead className="w-[12%]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const fromStock = getStockAtFromLocation(item.name);
                const toStock = getStockAtToLocation(item.name);
                const hasFromData = fromLocation && fromStock !== undefined;
                const displayFromStock = fromStock ?? item.availableStock ?? 0;
                const isOver = hasFromData && item.quantity > displayFromStock;
                const isAtLimit = hasFromData && !isOver && item.quantity === displayFromStock;
                const fromBadgeClass = isOver
                  ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
                  : isAtLimit
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800'
                  : hasFromData
                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
                  : 'bg-muted text-muted-foreground border-border';
                const toBadgeClass = toStock !== undefined
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-muted text-muted-foreground border-border';
                return (
                  <TableRow key={index} className={isOver ? 'bg-red-50/30 dark:bg-red-950/10' : ''}>
                    <TableCell className="relative overflow-visible p-2 break-words">
                      {editable ? (
                        <AutosuggestInput
                          value={item.name}
                          onChange={(value) => updateItem(index, 'name', value)}
                          onSelect={(stockItem: any) => {
                            const id = stockItem.id || stockItem._id;
                            updateItem(index, 'name', stockItem.name);
                            updateItem(index, 'availableStock', stockItem.currentStock || stockItem.stock || 0);
                            updateItem(index, 'saleUnit', stockItem.saleUnit || 'Unit');
                            updateItem(index, 'quantity', 1);
                            if (id) fetchAndCacheItemLocations(id, stockItem.name);
                            if (index === items.length - 1) addItem();
                          }}
                          placeholder="Search items..."
                        />
                      ) : (
                        <span className="font-medium text-sm whitespace-normal break-words leading-tight">{item.name}</span>
                      )}
                    </TableCell>
                    <TableCell className="p-2">
                      {editable ? (
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            value={item.quantity}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className={`w-16 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isOver ? 'border-red-300 focus-visible:ring-red-300' : ''}`}
                            min={1}
                          />
                          <Badge variant="outline" className="text-[10px] whitespace-nowrap">{item.saleUnit || 'Unit'}</Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{item.quantity}</span>
                          <Badge variant="outline" className="text-xs">{item.saleUnit || 'Unit'}</Badge>
                        </div>
                      )}
                    </TableCell>

                    {/* From-location stock */}
                    <TableCell className="p-2">
                      <div className="flex flex-col gap-0.5">
                        <Badge variant="outline" className={`text-xs w-fit ${fromBadgeClass}`}>
                          {hasFromData ? `${displayFromStock}` : (fromLocation ? '…' : '—')}
                          {hasFromData && <span className="ml-0.5 font-normal opacity-70 text-[9px]">avail</span>}
                        </Badge>
                        {isOver && (
                          <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                            -{item.quantity - displayFromStock} over
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* To-location stock */}
                    <TableCell className="p-2">
                      <Badge variant="outline" className={`text-xs w-fit ${toBadgeClass}`}>
                        {toStock !== undefined ? `${toStock}` : (toLocation ? '…' : '—')}
                        {toStock !== undefined && <span className="ml-0.5 font-normal opacity-70 text-[9px]">there</span>}
                      </Badge>
                    </TableCell>

                    {editable && !isReadOnly && (
                      <TableCell className="p-2">
                        <DeletePopover
                          onConfirm={() => removeItem(index)}
                          title="Remove this item?"
                          description="It will be removed from the transfer."
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );


  return (
    <>
    <ModernInventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={transfer ? `Transfer ${transfer.transferId.length > 16 ? transfer.transferId.slice(0, 16) + '…' : transfer.transferId}` : 'New Stock Transfer'}
      subtitle={transfer ? `Requested on ${transfer.requestDate}${transfer.requestedBy ? ` · ${transfer.requestedBy}` : ''}` : 'Create a new stock transfer request'}
      icon={<ArrowRightLeft className="h-5 w-5 text-primary" />}
      status={transfer?.status}
      statusColor={transfer?.status ? statusColors[transfer.status] : 'pending'}
      headerActions={headerActions}
      quickActions={quickActions}
      size="wide"
    >
      <div ref={containerRef} className="h-full min-h-0">

        {/* Read-only banner for completed/cancelled transfers */}
        {isReadOnly && (
          <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
            <svg className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
              This transfer is <span className="font-bold">{transfer?.status}</span> and cannot be edited or deleted.
            </p>
          </div>
        )}

      {!isNarrowLayout ? (
        /* ── WIDE: two-column layout matching SO/PO ── */
        <div className="grid h-full" style={{ gridTemplateColumns: '30% 70%' }}>

          {/* Left Column */}
          <div className="flex flex-col gap-4 p-6 overflow-y-auto">

            {/* Transfer Summary (like SO/PO Order Summary) */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Transfer Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Qty</span>
                  <span className="font-medium">{items.reduce((s, i) => s + (i.quantity || 0), 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Status</span>
                  <span className="text-sm capitalize">{transfer?.status || 'New'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Route (like Customer Info in SO) */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  Transfer Route
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <Send className="h-3 w-3 text-blue-600" />
                    From Location
                  </Label>
                  {editable ? (
                    <Select value={fromLocation} onValueChange={setFromLocation} disabled={isReadOnly}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select source location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border/40">
                      <Send className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium">{fromLocation || '—'}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    To Location
                  </Label>
                  {editable ? (
                    <Select value={toLocation} onValueChange={setToLocation} disabled={isReadOnly}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select destination location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border/40">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm font-medium">{toLocation || '—'}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transfer Details (like Order Details in SO) */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Transfer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    Requested By
                  </Label>
                  {editable ? (
                    <Input
                      value={requestedBy}
                      onChange={e => setRequestedBy(e.target.value)}
                      className="mt-1"
                      placeholder="Enter requester name"
                    />
                  ) : (
                    <div className="mt-1 px-3 py-2 rounded-md bg-muted/50 border border-border/40 text-sm font-medium">{requestedBy || '—'}</div>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-muted-foreground" />
                    Priority
                  </Label>
                  {editable ? (
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" />Low</div></SelectItem>
                        <SelectItem value="Medium"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" />Medium</div></SelectItem>
                        <SelectItem value="High"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" />High</div></SelectItem>
                        <SelectItem value="Urgent"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" />Urgent</div></SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1 px-3 py-2 rounded-md bg-muted/50 border border-border/40 text-sm font-medium">{priority || '—'}</div>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    Expected Completion
                  </Label>
                  {editable ? (
                    <div className="mt-1">
                      <DatePicker
                        date={expectedDate ? new Date(expectedDate) : undefined}
                        onDateChange={date => setExpectedDate(date ? date.toISOString().split('T')[0] : '')}
                        placeholder="Select expected date"
                      />
                    </div>
                  ) : (
                    <div className="mt-1 px-3 py-2 rounded-md bg-muted/50 border border-border/40 text-sm font-medium">{expectedDate || '—'}</div>
                  )}
                </div>
                {transfer && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Request Date</span>
                        <span className="font-medium">{transfer.requestDate || '—'}</span>
                      </div>
                      {transfer.approvedBy && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Approved By</span>
                          <span className="font-medium">{transfer.approvedBy}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column — Items Table + Reason (like SO: Products + Additional Notes) */}
          <div className="flex flex-col gap-4 p-6 h-full">
            <Card className="flex flex-col border-border/50 shadow-sm" style={{ height: '75vh' }}>
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Transfer Items ({items.length})
                  </CardTitle>
                  {editable && !isReadOnly && (
                    <div className="flex gap-2">
                      <ItemScanner onItemScanned={handleItemScanned} existingItems={[]} disabled={isReadOnly} />
                      <Button onClick={() => addItem()} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden px-6 pb-4 pt-0">
                {itemsTableContent}
              </CardContent>
            </Card>

            {/* Reason for Transfer (like SO's Additional Notes) */}
            <Card className="flex-shrink-0 border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Reason for Transfer
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editable ? (
                  <Textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Add any reason or notes for this stock transfer…"
                    className="resize-none min-h-[60px]"
                    disabled={isReadOnly}
                  />
                ) : (
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap min-h-[40px]">
                    {reason || <span className="text-muted-foreground italic">No reason provided.</span>}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      ) : !editable ? (
        /* ── NARROW VIEW MODE: Doctor-style sections ── */
        <div className="flex flex-col gap-4 p-4">

          {/* Stat cards row — Items / Total Qty / Status */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Items', val: items.length, icon: Package },
              { label: 'Total Qty', val: items.reduce((s, i) => s + (i.quantity || 0), 0), icon: TrendingUp },
              { label: 'Status', val: transfer?.status || 'New', icon: CheckCircle, small: true },
            ].map(s => (
              <div key={s.label} className="rounded-lg border border-border bg-card p-3 text-center">
                <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className={`font-bold text-foreground ${s.small ? 'text-xs mt-1' : 'text-xl'}`}>{s.val}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Transfer Route section */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Transfer Route</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
              <span className="text-sm text-muted-foreground">From</span>
              <span className="text-sm font-semibold text-foreground text-right">{fromLocation || '—'}</span>
            </div>
            <div className="flex justify-center py-2 bg-primary/[0.025]">
              <ArrowRight className="h-4 w-4 text-primary/40" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-card">
              <span className="text-sm text-muted-foreground">To</span>
              <span className="text-sm font-semibold text-foreground text-right">{toLocation || '—'}</span>
            </div>
          </div>

          {/* Transfer Details section */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Transfer Details</span>
            </div>
            {[
              { label: 'Requested By', value: requestedBy || '—' },
              { label: 'Priority', value: priority || '—' },
              { label: 'Expected Date', value: expectedDate || '—' },
              { label: 'Request Date', value: transfer?.requestDate || '—' },
              ...(transfer?.approvedBy ? [{ label: 'Approved By', value: transfer.approvedBy }] : []),
            ].map(({ label, value }, i) => (
              <div key={label} className={`flex items-center justify-between px-4 py-2.5 border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-semibold text-foreground text-right">{value}</span>
              </div>
            ))}
          </div>

          {/* Transfer Items section */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Transfer Items ({items.length})</span>
            </div>
            <div className="p-3 space-y-3">
              {itemsTableContent}
            </div>
          </div>

          {/* Reason section */}
          {reason && (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Reason for Transfer</span>
              </div>
              <p className="px-4 py-3 text-sm text-foreground leading-relaxed whitespace-pre-wrap">{reason}</p>
            </div>
          )}
        </div>

      ) : (
        /* ── NARROW EDIT MODE: stacked inputs ── */
        <div className="flex flex-col gap-4 p-4">

          {/* Transfer Route */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-primary" />
                Transfer Route
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">From Location</Label>
                <Select value={fromLocation} onValueChange={setFromLocation} disabled={isReadOnly}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select source location" /></SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-center"><ArrowRight className="h-4 w-4 text-primary" /></div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">To Location</Label>
                <Select value={toLocation} onValueChange={setToLocation} disabled={isReadOnly}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select destination location" /></SelectTrigger>
                  <SelectContent>
                    {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Transfer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Requested By</Label>
                <Input value={requestedBy} onChange={e => setRequestedBy(e.target.value)} className="mt-1" placeholder="Enter requester name" />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Expected Completion</Label>
                <div className="mt-1">
                  <DatePicker
                    date={expectedDate ? new Date(expectedDate) : undefined}
                    onDateChange={date => setExpectedDate(date ? date.toISOString().split('T')[0] : '')}
                    placeholder="Select expected date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  Transfer Items ({items.length})
                </CardTitle>
                {!isReadOnly && (
                  <div className="flex gap-2">
                    <ItemScanner onItemScanned={handleItemScanned} existingItems={[]} disabled={isReadOnly} />
                    <Button onClick={() => addItem()} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {itemsTableContent}
            </CardContent>
          </Card>

          {/* Reason for Transfer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Reason for Transfer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Add any reason or notes for this stock transfer…"
                disabled={!editable}
                className="resize-none min-h-[80px]"
              />
            </CardContent>
          </Card>
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

    {/* Track Dialog */}
    {transfer && (
      <Dialog open={showTrack} onOpenChange={setShowTrack}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Navigation className="h-4 w-4 text-primary" />
              Track Transfer · {transfer.transferId}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {/* Route summary */}
            <div className="flex items-center justify-between rounded-lg bg-muted/40 border border-border px-4 py-3 mb-5 text-sm">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-0.5">From</p>
                <p className="font-semibold text-foreground text-xs">{transfer.fromLocation || '—'}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-primary/50 flex-shrink-0" />
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-0.5">To</p>
                <p className="font-semibold text-foreground text-xs">{transfer.toLocation || '—'}</p>
              </div>
            </div>
            {/* Status timeline */}
            <div className="space-y-0">
              {(['Pending', 'In Transit', 'Completed'] as const).map((step, idx) => {
                const statusOrder = { 'Pending': 0, 'In Transit': 1, 'Completed': 2, 'Cancelled': 3, 'Partially Received': 1.5 };
                const currentOrder = statusOrder[transfer.status as keyof typeof statusOrder] ?? 0;
                const stepOrder = statusOrder[step];
                const isCancelled = transfer.status === 'Cancelled';
                const isDone = !isCancelled && currentOrder > stepOrder;
                const isCurrent = !isCancelled && Math.floor(currentOrder) === stepOrder;
                const stepColors = isDone ? 'bg-emerald-500 border-emerald-500' : isCurrent ? 'bg-primary border-primary' : 'bg-muted border-border';
                const labelColor = isDone || isCurrent ? 'text-foreground' : 'text-muted-foreground';
                return (
                  <div key={step} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 ${stepColors} mt-0.5 flex-shrink-0`} />
                      {idx < 2 && <div className={`w-0.5 h-8 ${isDone ? 'bg-emerald-400' : 'bg-border'}`} />}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm font-semibold ${labelColor}`}>{step}</p>
                      {isCurrent && (
                        <p className="text-xs text-primary font-medium mt-0.5">Current status</p>
                      )}
                      {step === 'Pending' && transfer.requestDate && (
                        <p className="text-xs text-muted-foreground mt-0.5">{transfer.requestDate}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {transfer.status === 'Cancelled' && (
                <div className="flex items-start gap-3 mt-1">
                  <div className="w-3 h-3 rounded-full border-2 bg-red-500 border-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-600">Cancelled</p>
                    <p className="text-xs text-muted-foreground mt-0.5">This transfer was cancelled</p>
                  </div>
                </div>
              )}
            </div>
            {/* Items summary */}
            <div className="mt-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Items</span>
                <span className="font-semibold">{items.length}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-muted-foreground">Total Qty</span>
                <span className="font-semibold">{items.reduce((s, i) => s + (i.quantity || 0), 0)}</span>
              </div>
              {transfer.expectedDate && (
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-muted-foreground">Expected by</span>
                  <span className="font-semibold">{transfer.expectedDate}</span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )}

    {/* History Dialog */}
    {transfer && (
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-primary" />
              History · {transfer.transferId}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-1">
            {[
              ...(transfer.approvedBy ? [{
                icon: CheckCircle,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50 dark:bg-emerald-950/30',
                label: `Status changed to ${transfer.status}`,
                meta: `By ${transfer.approvedBy}`,
              }] : []),
              {
                icon: Send,
                color: 'text-blue-600',
                bg: 'bg-blue-50 dark:bg-blue-950/30',
                label: 'Transfer requested',
                meta: `${transfer.requestDate ? `On ${transfer.requestDate}` : ''} · By ${transfer.requestedBy || '—'}`,
              },
              {
                icon: FileText,
                color: 'text-muted-foreground',
                bg: 'bg-muted/50',
                label: 'Transfer created',
                meta: `${items.length} item${items.length !== 1 ? 's' : ''} · ${transfer.fromLocation} → ${transfer.toLocation}`,
              },
            ].map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${event.bg}`}>
                  <event.icon className={`h-3.5 w-3.5 ${event.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{event.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
};