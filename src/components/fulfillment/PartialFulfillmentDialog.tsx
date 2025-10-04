import { useState } from 'react';
import { Package, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ResponsiveDialog, 
  ResponsiveDialogContent, 
  ResponsiveDialogHeader, 
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogBody
} from "@/components/ui/responsive-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

export interface OrderItem {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity?: number;
  damagedQuantity?: number;
  missingQuantity?: number;
  status?: 'pending' | 'fulfilled' | 'partial' | 'damaged' | 'missing';
  notes?: string;
  unitPrice: number;
}

interface PartialFulfillmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderType: 'PO' | 'SO' | 'ST';
  orderId: string;
  orderItems: OrderItem[];
  onSave: (items: OrderItem[], overallStatus: string) => void;
}

export const PartialFulfillmentDialog = ({
  isOpen,
  onClose,
  orderType,
  orderId,
  orderItems: initialItems,
  onSave
}: PartialFulfillmentDialogProps) => {
  const [items, setItems] = useState<OrderItem[]>(
    initialItems.map(item => ({
      ...item,
      receivedQuantity: item.receivedQuantity ?? item.orderedQuantity,
      damagedQuantity: item.damagedQuantity ?? 0,
      missingQuantity: item.missingQuantity ?? 0,
      status: item.status ?? 'pending'
    }))
  );
  const [overallNotes, setOverallNotes] = useState('');

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Auto-calculate status based on quantities
    const item = updatedItems[index];
    const received = item.receivedQuantity || 0;
    const damaged = item.damagedQuantity || 0;
    const missing = item.missingQuantity || 0;
    const ordered = item.orderedQuantity;

    if (received === ordered && damaged === 0 && missing === 0) {
      item.status = 'fulfilled';
    } else if (received === 0 && (damaged > 0 || missing > 0)) {
      item.status = damaged > 0 ? 'damaged' : 'missing';
    } else if (received < ordered || damaged > 0 || missing > 0) {
      item.status = 'partial';
    }

    setItems(updatedItems);
  };

  const getOverallStatus = () => {
    const allFulfilled = items.every(item => item.status === 'fulfilled');
    const anyDamaged = items.some(item => (item.damagedQuantity || 0) > 0);
    const anyMissing = items.some(item => (item.missingQuantity || 0) > 0);
    const anyPartial = items.some(item => item.status === 'partial');

    if (allFulfilled) return 'Fulfilled';
    if (anyPartial || anyDamaged || anyMissing) return 'Partially Fulfilled';
    return 'Pending';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; color: string }> = {
      fulfilled: { variant: 'default', icon: CheckCircle2, color: 'text-green-600' },
      partial: { variant: 'secondary', icon: AlertTriangle, color: 'text-amber-600' },
      damaged: { variant: 'destructive', icon: XCircle, color: 'text-red-600' },
      missing: { variant: 'destructive', icon: Info, color: 'text-red-600' },
      pending: { variant: 'outline', icon: Package, color: 'text-muted-foreground' }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleSave = () => {
    const overallStatus = getOverallStatus();
    
    // Add overall notes to items if provided
    const itemsWithNotes = items.map(item => ({
      ...item,
      notes: item.notes || overallNotes
    }));

    onSave(itemsWithNotes, overallStatus);
    
    toast({
      title: `${orderType} Updated`,
      description: `Order status: ${overallStatus}`,
    });

    onClose();
  };

  const getTotals = () => {
    return items.reduce((acc, item) => ({
      ordered: acc.ordered + item.orderedQuantity,
      received: acc.received + (item.receivedQuantity || 0),
      damaged: acc.damaged + (item.damagedQuantity || 0),
      missing: acc.missing + (item.missingQuantity || 0)
    }), { ordered: 0, received: 0, damaged: 0, missing: 0 });
  };

  const totals = getTotals();
  const overallStatus = getOverallStatus();

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <ResponsiveDialogContent className="!max-w-[900px] max-w-[900px]">
        <ResponsiveDialogHeader className="-mx-6 -mt-6 mb-4">
          <ResponsiveDialogTitle>
            <Package className="h-5 w-5 text-white" />
            Process {orderType} - {orderId}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="space-y-4">
          {/* Overall Status Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Overall Status</div>
                  <div className="mt-1">{getStatusBadge(overallStatus.toLowerCase())}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {totals.received} / {totals.ordered}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Items Received / Ordered
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <div className="text-sm font-medium">Received</div>
                </div>
                <div className="text-2xl font-bold text-green-700 mt-1">{totals.received}</div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <div className="text-sm font-medium">Damaged</div>
                </div>
                <div className="text-2xl font-bold text-red-700 mt-1">{totals.damaged}</div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <div className="text-sm font-medium">Missing</div>
                </div>
                <div className="text-2xl font-bold text-amber-700 mt-1">{totals.missing}</div>
              </CardContent>
            </Card>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[250px]">Item</TableHead>
                  <TableHead className="text-center">Ordered</TableHead>
                  <TableHead className="text-center">Received</TableHead>
                  <TableHead className="text-center">Damaged</TableHead>
                  <TableHead className="text-center">Missing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{item.itemName}</div>
                        <div className="text-xs text-muted-foreground">{item.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {item.orderedQuantity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={item.orderedQuantity}
                        value={item.receivedQuantity || 0}
                        onChange={(e) => updateItem(index, 'receivedQuantity', parseInt(e.target.value) || 0)}
                        className="w-20 text-center"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={item.orderedQuantity}
                        value={item.damagedQuantity || 0}
                        onChange={(e) => updateItem(index, 'damagedQuantity', parseInt(e.target.value) || 0)}
                        className="w-20 text-center"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={item.orderedQuantity}
                        value={item.missingQuantity || 0}
                        onChange={(e) => updateItem(index, 'missingQuantity', parseInt(e.target.value) || 0)}
                        className="w-20 text-center"
                      />
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status || 'pending')}
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Add notes..."
                        value={item.notes || ''}
                        onChange={(e) => updateItem(index, 'notes', e.target.value)}
                        className="w-32 text-xs"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Overall Notes */}
          <div className="space-y-2">
            <Label htmlFor="overall-notes">Overall Notes (applies to all items)</Label>
            <Textarea
              id="overall-notes"
              placeholder="Add general notes about this fulfillment..."
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <div className="space-y-1">
                <div className="font-medium">Processing Guidelines:</div>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li><strong>Received:</strong> Quantity actually received in good condition</li>
                  <li><strong>Damaged:</strong> Items received but damaged/defective</li>
                  <li><strong>Missing:</strong> Items not received (short delivery)</li>
                  <li>Status auto-updates based on quantities entered</li>
                  <li>Add notes for tracking issues or follow-up actions</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2 flex-1 sm:flex-initial">
            <CheckCircle2 className="h-4 w-4" />
            Save & Update Status
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default PartialFulfillmentDialog;
