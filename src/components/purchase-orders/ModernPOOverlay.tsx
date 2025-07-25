import { useState, useEffect } from 'react';
import { Save, Edit3, CheckCircle, Trash2, Plus, FileText, Mail, Copy, Printer, Truck, Package, User, CreditCard, MessageSquare, Calendar, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { ModernInventoryOverlay } from '../inventory/ModernInventoryOverlay';
import { AutosuggestInput } from './AutosuggestInput';
import { PurchaseOrder, PurchaseOrderItem, StockItem } from '../../types/purchaseOrder';

interface ModernPOOverlayProps {
  order: PurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  onSave?: (order: PurchaseOrder) => void;
  onUpdate?: (order: PurchaseOrder) => void;
  onDelete?: (orderId: string) => void;
}

export const ModernPOOverlay = ({ 
  order, 
  isOpen, 
  onClose, 
  isEdit = false, 
  onSave, 
  onUpdate, 
  onDelete 
}: ModernPOOverlayProps) => {
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [vendorName, setVendorName] = useState<string>('');
  const [vendorEmail, setVendorEmail] = useState<string>('');
  const [vendorPhone, setVendorPhone] = useState<string>('');
  const [vendorAddress, setVendorAddress] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('net-30');
  const [remarks, setRemarks] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(isEdit);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initialize form data
  useEffect(() => {
    if (order) {
      setItems(order.items || []);
      setVendorName(order.vendorName || '');
      setVendorEmail(order.vendorEmail || '');
      setVendorPhone(order.vendorPhone || '');
      setVendorAddress(order.vendorAddress || '');
      setShippingAddress(order.shippingAddress || '');
      setOrderDate(order.orderDate || '');
      setDeliveryDate(order.deliveryDate || '');
      setPaymentMethod(order.paymentMethod || 'net-30');
      setRemarks(Array.isArray(order.remarks) ? order.remarks.map(r => r.message).join('\n') : order.remarks || '');
    } else {
      // Reset for new order
      setItems([]);
      setVendorName('');
      setVendorEmail('');
      setVendorPhone('');
      setVendorAddress('');
      setShippingAddress('');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setDeliveryDate('');
      setPaymentMethod('net-30');
      setRemarks('');
    }
    setIsEditMode(isEdit);
  }, [order, isEdit]);

  const isReadOnly = order?.status === 'Delivered' || order?.status === 'Cancelled';

  const addItem = (stockItem?: StockItem) => {
    if (isReadOnly) return;
    
    if (stockItem) {
      setItems([...items, { 
        name: stockItem.name, 
        qty: 1, 
        unitPrice: stockItem.unitPrice, 
        discount: 0, 
        subtotal: stockItem.unitPrice,
        taxSlab: 18 
      }]);
    } else {
      setItems([...items, { 
        name: '', 
        qty: 1, 
        unitPrice: 0, 
        discount: 0, 
        subtotal: 0, 
        taxSlab: 18 
      }]);
    }
  };

  const removeItem = (index: number) => {
    if (isReadOnly) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    if (isReadOnly) return;
    
    const updatedItems = [...items];
    (updatedItems[index] as any)[field] = value;
    
    if (field === 'qty' || field === 'unitPrice' || field === 'discount') {
      const qty = updatedItems[index].qty || 0;
      const unitPrice = updatedItems[index].unitPrice || 0;
      const discount = updatedItems[index].discount || 0;
      updatedItems[index].subtotal = (qty * unitPrice) * (1 - discount / 100);
    }
    
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const tax = subTotal * 0.18; // 18% tax
    const shipping = 500.0;
    const total = subTotal + tax + shipping;
    return { subTotal, tax, shipping, total };
  };

  const totals = calculateTotals();

  const handleSaveOrder = async () => {
    if (!items.length) {
      toast({
        title: "Validation Error",
        description: "Please add at least one item to the order.",
        variant: "destructive",
      });
      return;
    }

    if (!vendorName.trim()) {
      toast({
        title: "Validation Error", 
        description: "Please enter vendor name.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const orderData: PurchaseOrder = {
        id: order?.id || `po-${Date.now()}`,
        poNumber: order?.poNumber || `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        vendorName,
        vendorContact: order?.vendorContact || '',
        vendorPhone,
        vendorEmail,
        vendorAddress,
        orderDate,
        deliveryDate,
        fulfilmentDate: order?.fulfilmentDate || null,
        status: order?.status || 'Pending',
        items,
        total: totals.total,
        paidAmount: order?.paidAmount || 0,
        createdBy: order?.createdBy || 'System',
        approvedBy: order?.approvedBy || '',
        notes: order?.notes || '',
        attachments: order?.attachments || 0,
        paymentMethod,
        shippingAddress,
        remarks: typeof remarks === 'string' ? [{ date: new Date().toISOString().split('T')[0], user: 'System', message: remarks }] : order?.remarks || [],
      };

      if (order && onUpdate) {
        await onUpdate(orderData);
        toast({
          title: "Order Updated",
          description: `Purchase order ${orderData.poNumber} has been updated successfully.`,
        });
      } else if (onSave) {
        await onSave(orderData);
        toast({
          title: "Order Created",
          description: `Purchase order ${orderData.poNumber} has been created successfully.`,
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!order?.id || !onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) {
      try {
        await onDelete(order.id);
        toast({
          title: "Order Deleted",
          description: "Purchase order has been deleted successfully.",
        });
        onClose();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete order.",
          variant: "destructive",
        });
      }
    }
  };

  const headerActions = (
    <>
      {(isEditMode || !order) && (
        <>
          <Button variant="outline" onClick={() => {
            if (order) {
              setIsEditMode(false);
            } else {
              onClose();
            }
          }}>
            Cancel
          </Button>
          <Button onClick={handleSaveOrder} disabled={isSaving} className="bg-slate-600 hover:bg-slate-700 text-white">
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {order ? 'Update Order' : 'Save Order'}
              </>
            )}
          </Button>
        </>
      )}
      
      {!isEditMode && order && !isReadOnly && (
        <Button variant="outline" onClick={() => setIsEditMode(true)}>
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Order
        </Button>
      )}

      {order && order.status === 'Pending' && !isEditMode && (
        <Button variant="destructive" onClick={handleDeleteOrder}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      )}
    </>
  );

  const quickActions = (
    <>
      <Button variant="ghost" size="sm">
        <FileText className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
      <Button variant="ghost" size="sm">
        <Mail className="h-4 w-4 mr-2" />
        Email
      </Button>
      <Button variant="ghost" size="sm">
        <Copy className="h-4 w-4 mr-2" />
        Duplicate
      </Button>
      <Button variant="ghost" size="sm">
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
    </>
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Pending': return 'pending';
      case 'Approved': return 'approved';
      case 'Delivered': return 'delivered';
      case 'Cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  return (
    <ModernInventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Purchase Order ${order.poNumber}` : 'New Purchase Order'}
      subtitle={order ? `Created on ${order.orderDate} • Total: ₹${totals.total.toFixed(2)}` : 'Create a new purchase order'}
      status={order?.status}
      statusColor={getStatusColor(order?.status)}
      headerActions={headerActions}
      quickActions={quickActions}
      size="full"
    >
      <div className="flex h-full">
        {/* Left Sidebar - Order Info */}
        <div className="w-80 bg-muted/30 border-r border-border/50 flex-shrink-0 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{totals.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (18%)</span>
                  <span className="font-medium">₹{totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">₹{totals.shipping.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-lg">₹{totals.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Vendor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="vendorName" className="text-xs font-medium text-muted-foreground">Vendor Name</Label>
                  <Input
                    id="vendorName"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="Enter vendor name"
                    disabled={!isEditMode && !!order}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vendorEmail" className="text-xs font-medium text-muted-foreground">Email</Label>
                  <Input
                    id="vendorEmail"
                    type="email"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    placeholder="vendor@example.com"
                    disabled={!isEditMode && !!order}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vendorPhone" className="text-xs font-medium text-muted-foreground">Phone</Label>
                  <Input
                    id="vendorPhone"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    disabled={!isEditMode && !!order}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="vendorAddress" className="text-xs font-medium text-muted-foreground">Address</Label>
                  <Textarea
                    id="vendorAddress"
                    value={vendorAddress}
                    onChange={(e) => setVendorAddress(e.target.value)}
                    placeholder="Enter vendor address"
                    disabled={!isEditMode && !!order}
                    className="mt-1 min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="orderDate" className="text-xs font-medium text-muted-foreground">Order Date</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    disabled={!isEditMode && !!order}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryDate" className="text-xs font-medium text-muted-foreground">Expected Delivery</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    disabled={!isEditMode && !!order}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod" className="text-xs font-medium text-muted-foreground">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={!isEditMode && !!order}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net-30">Net 30 Days</SelectItem>
                      <SelectItem value="net-15">Net 15 Days</SelectItem>
                      <SelectItem value="net-7">Net 7 Days</SelectItem>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                      <SelectItem value="advance">Advance Payment</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Items Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Items ({items.length})
                  </CardTitle>
                  {(isEditMode || !order) && (
                    <Button onClick={() => addItem()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="font-semibold w-24">Qty</TableHead>
                        <TableHead className="font-semibold w-32">Unit Price</TableHead>
                        <TableHead className="font-semibold w-24">Discount</TableHead>
                        <TableHead className="font-semibold w-32">Subtotal</TableHead>
                        {(isEditMode || !order) && <TableHead className="font-semibold w-12"></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            {(isEditMode || !order) ? (
                              <AutosuggestInput
                                value={item.name}
                                onChange={(value) => updateItem(index, 'name', value)}
                                onSelect={(stockItem) => {
                                  updateItem(index, 'name', stockItem.name);
                                  updateItem(index, 'unitPrice', stockItem.unitPrice);
                                  updateItem(index, 'qty', 1);
                                  updateItem(index, 'discount', 0);
                                }}
                                placeholder="Search products..."
                              />
                            ) : (
                              <span className="font-medium">{item.name}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {(isEditMode || !order) ? (
                              <Input 
                                type="number" 
                                value={item.qty} 
                                onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                                className="w-full" 
                                min="1"
                              />
                            ) : (
                              <span>{item.qty}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {(isEditMode || !order) ? (
                              <Input 
                                type="number" 
                                value={item.unitPrice} 
                                onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                                className="w-full"
                                min="0"
                                step="0.01"
                              />
                            ) : (
                              <span>₹{item.unitPrice?.toFixed(2)}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {(isEditMode || !order) ? (
                              <div className="flex items-center gap-1">
                                <Input 
                                  type="number" 
                                  value={item.discount} 
                                  onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                                  className="w-16"
                                  min="0"
                                  max="100"
                                />
                                <span className="text-sm text-muted-foreground">%</span>
                              </div>
                            ) : (
                              <span>{item.discount}%</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">₹{item.subtotal?.toFixed(2)}</span>
                          </TableCell>
                          {(isEditMode || !order) && (
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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

          {/* Notes Section */}
          <div className="p-6 pt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Notes & Remarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add notes, special instructions, or remarks for this order..."
                  disabled={!isEditMode && !!order}
                  className="min-h-[80px] resize-none"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModernInventoryOverlay>
  );
};