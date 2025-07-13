import { useState, useEffect } from 'react';
import { Save, Plus, Edit3, X, Package, MapPin, Clock, User, ArrowRight } from 'lucide-react';
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

interface StockTransferItem {
  name: string;
  quantity: number;
  availableStock?: number;
}

interface StockTransfer {
  id?: number;
  transferId: string;
  fromLocation: string;
  toLocation: string;
  items: StockTransferItem[];
  status: string;
  requestDate: string;
  completedDate?: string | null;
  requestedBy: string;
  priority?: string;
  reason?: string;
  expectedCompletionDate?: string;
}

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
  { name: 'Bandages', availableStock: 500 },
  { name: 'Syringes', availableStock: 1000 },
  { name: 'IV Fluids', availableStock: 250 },
  { name: 'Oxygen Masks', availableStock: 150 },
  { name: 'Antibiotics', availableStock: 300 },
  { name: 'Pain Relievers', availableStock: 200 }
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

  useEffect(() => {
    if (transfer) {
      setItems(transfer.items || []);
      setFromLocation(transfer.fromLocation || '');
      setToLocation(transfer.toLocation || '');
      setRequestedBy(transfer.requestedBy || '');
      setPriority(transfer.priority || 'Medium');
      setReason(transfer.reason || '');
      setExpectedDate(transfer.expectedCompletionDate || '');
    } else {
      setItems([]);
      setFromLocation('');
      setToLocation('');
      setRequestedBy('');
      setPriority('Medium');
      setReason('');
      setExpectedDate('');
    }
    setIsEditMode(isEdit);
  }, [transfer, isEdit]);

  const isReadOnly = transfer?.status === 'Completed' || transfer?.status === 'Cancelled';

  const addItem = () => {
    if (isReadOnly) return;
    
    setItems([...items, { 
      name: '', 
      quantity: 1,
      availableStock: 0
    }]);
    
    toast({
      title: "Item Added",
      description: "New item has been added to the transfer.",
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
    
    // If item name is selected, update available stock
    if (field === 'name') {
      const selectedItem = sampleItems.find(item => item.name === value);
      if (selectedItem) {
        updatedItems[index].availableStock = selectedItem.availableStock;
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
        id: transfer?.id,
        transferId: transfer?.transferId || `ST-${Date.now()}`,
        fromLocation,
        toLocation,
        items,
        status: transfer?.status || 'Pending',
        requestDate: transfer?.requestDate || new Date().toISOString().split('T')[0],
        requestedBy,
        priority,
        reason,
        expectedCompletionDate: expectedDate,
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

  const headerActions = (
    <div className="flex items-center gap-2">
      {(isEditMode || !transfer) && (
        <>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (transfer) {
                setIsEditMode(false);
              } else {
                onClose();
              }
            }}
            disabled={isSaving}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={handleSaveTransfer}
            disabled={isSaving || isReadOnly}
            className="bg-primary hover:bg-primary/90"
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditMode(true)}
        >
          <Edit3 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}
    </div>
  );

  return (
    <ModernInventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={transfer ? `Stock Transfer ${transfer.transferId}` : 'New Stock Transfer'}
      subtitle={transfer ? `Requested on ${transfer.requestDate}` : 'Create a new stock transfer request'}
      status={transfer?.status}
      statusColor={transfer?.status ? statusColors[transfer.status] : 'pending'}
      size="full"
      headerActions={headerActions}
      quickActions={quickActions}
    >
      <div className="flex h-full overflow-hidden bg-gradient-to-br from-background to-muted/20">
        {/* Left Panel - Transfer Information */}
        <div className="w-80 border-r border-border/50 bg-background/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Location Information */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Transfer Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="from-location" className="text-xs">From Location</Label>
                  <Select value={fromLocation} onValueChange={setFromLocation} disabled={!isEditMode}>
                    <SelectTrigger className="h-8 text-sm">
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
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div>
                  <Label htmlFor="to-location" className="text-xs">To Location</Label>
                  <Select value={toLocation} onValueChange={setToLocation} disabled={!isEditMode}>
                    <SelectTrigger className="h-8 text-sm">
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
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="requested-by" className="text-xs">Requested By</Label>
                  <Input
                    id="requested-by"
                    value={requestedBy}
                    onChange={(e) => setRequestedBy(e.target.value)}
                    disabled={!isEditMode}
                    className="h-8 text-sm"
                    placeholder="Enter requester name"
                  />
                </div>
                <div>
                  <Label htmlFor="priority" className="text-xs">Priority</Label>
                  <Select value={priority} onValueChange={setPriority} disabled={!isEditMode}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expected-date" className="text-xs">Expected Completion</Label>
                  <Input
                    id="expected-date"
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    disabled={!isEditMode}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="reason" className="text-xs">Reason for Transfer</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={!isEditMode}
                    className="text-sm resize-none"
                    placeholder="Enter reason for transfer..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Transfer Items */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            <Card className="h-full border-border/50">
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Transfer Items</CardTitle>
                  {isEditMode && !isReadOnly && (
                    <Button onClick={addItem} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-full overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm">
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Available Stock</TableHead>
                        {isEditMode && !isReadOnly && <TableHead className="w-12"></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {isEditMode && !isReadOnly ? (
                              <Select
                                value={item.name}
                                onValueChange={(value) => updateItem(index, 'name', value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select item" />
                                </SelectTrigger>
                                <SelectContent>
                                  {sampleItems.map(sampleItem => (
                                    <SelectItem key={sampleItem.name} value={sampleItem.name}>
                                      {sampleItem.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="font-medium">{item.name}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditMode && !isReadOnly ? (
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                className="w-24"
                                min={1}
                              />
                            ) : (
                              <span>{item.quantity}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-muted">
                              {item.availableStock || 0} units
                            </Badge>
                          </TableCell>
                          {isEditMode && !isReadOnly && (
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            No items added yet. Click "Add Item" to get started.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModernInventoryOverlay>
  );
};