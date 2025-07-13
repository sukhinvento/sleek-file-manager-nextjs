import { useState, useEffect } from 'react';
import { Save, Plus, Edit3, Truck, X, Clock, FileText, User, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ModernInventoryOverlay } from '../inventory/ModernInventoryOverlay';
import { SalesOrder, SalesOrderItem } from '../../types/inventory';
import { OrderItems } from './OrderItems';

interface ModernSOOverlayProps {
  order: SalesOrder | null;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  onSave?: (order: SalesOrder) => void;
  onUpdate?: (order: SalesOrder) => void;
  onDelete?: (orderId: string) => void;
}

const statusColors = {
  'Processing': 'approved' as const,
  'Shipped': 'delivered' as const,
  'Delivered': 'delivered' as const,
  'Cancelled': 'cancelled' as const,
  'Pending': 'pending' as const
};

export const ModernSOOverlay = ({ 
  order, 
  isOpen, 
  onClose, 
  isEdit = false, 
  onSave, 
  onUpdate, 
  onDelete 
}: ModernSOOverlayProps) => {
  const [items, setItems] = useState<SalesOrderItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(isEdit);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initialize form with order data
  useEffect(() => {
    if (order) {
      setItems(order.items || []);
      setCustomerName(order.customerName || '');
      setCustomerEmail(order.customerEmail || '');
      setCustomerPhone(order.customerPhone || '');
      setCustomerAddress(order.customerAddress || '');
      setShippingAddress(order.shippingAddress || '');
      setOrderDate(order.orderDate || '');
      setDeliveryDate(order.deliveryDate || '');
      setNotes(order.notes || '');
      setPaymentMethod(order.paymentMethod || 'Bank Transfer');
    } else {
      // Reset for new order
      setItems([]);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerAddress('');
      setShippingAddress('');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setDeliveryDate('');
      setNotes('');
      setPaymentMethod('Bank Transfer');
    }
    setIsEditMode(isEdit);
  }, [order, isEdit]);

  const isReadOnly = order?.status === 'Delivered';

  const addItem = () => {
    if (isReadOnly) return;
    
    setItems([...items, { 
      name: '', 
      qty: 1, 
      unitPrice: 0, 
      discount: 0, 
      subtotal: 0 
    }]);
    
    toast({
      title: "Item Added",
      description: "New item has been added to the order.",
    });
  };

  const removeItem = (index: number) => {
    if (isReadOnly) return;
    setItems(items.filter((_, i: number) => i !== index));
    
    toast({
      title: "Item Removed",
      description: "Item has been removed from the order.",
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    if (isReadOnly) return;
    
    const updatedItems = [...items];
    (updatedItems[index] as any)[field] = value;
    
    // Recalculate subtotal when qty or unitPrice changes
    if (field === 'qty' || field === 'unitPrice' || field === 'discount') {
      const qty = updatedItems[index].qty || 0;
      const unitPrice = updatedItems[index].unitPrice || 0;
      const discount = updatedItems[index].discount || 0;
      updatedItems[index].subtotal = (qty * unitPrice) * (1 - discount / 100);
    }
    
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((sum: number, item: SalesOrderItem) => sum + (item.subtotal || 0), 0);
    const sgst = subTotal * 0.09; // 9% SGST
    const cgst = subTotal * 0.09; // 9% CGST
    const shipping = 200.0;
    const total = subTotal + sgst + cgst + shipping;
    return { subTotal, sgst, cgst, shipping, total };
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

    if (!customerName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter customer name.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const orderData: SalesOrder = {
        id: order?.id || `so-${Date.now()}`,
        orderNumber: order?.orderNumber || `SO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        orderDate,
        deliveryDate,
        status: order?.status || 'Processing',
        items,
        total: totals.total,
        dueDate: deliveryDate,
        paymentStatus: order?.paymentStatus || 'Pending',
        paymentMethod,
        shippingAddress,
        billingAddress: customerAddress,
        notes,
      };

      if (order && onUpdate) {
        await onUpdate(orderData);
        toast({
          title: "Order Updated",
          description: `Sales order ${orderData.orderNumber} has been updated successfully.`,
        });
      } else if (onSave) {
        await onSave(orderData);
        toast({
          title: "Order Created",
          description: `Sales order ${orderData.orderNumber} has been created successfully.`,
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

  const handleShipOrder = async () => {
    if (!order || !onUpdate) return;
    
    const updatedOrder = { ...order, status: 'Shipped' as const };
    
    try {
      await onUpdate(updatedOrder);
      toast({
        title: "Order Shipped",
        description: "Order has been marked as shipped.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const quickActions = (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <FileText className="h-4 w-4 mr-1" />
        Export
      </Button>
      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        <Clock className="h-4 w-4 mr-1" />
        History
      </Button>
    </div>
  );

  const headerActions = (
    <div className="flex items-center gap-2">
      {(isEditMode || !order) && (
        <>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (order) {
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
            onClick={handleSaveOrder}
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
                {order ? 'Update' : 'Save'}
              </>
            )}
          </Button>
        </>
      )}
      
      {!isEditMode && order && !isReadOnly && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditMode(true)}
        >
          <Edit3 className="h-4 w-4 mr-1" />
          Edit
        </Button>
      )}

      {order && order.status === 'Processing' && !isEditMode && (
        <Button 
          size="sm"
          onClick={handleShipOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Truck className="h-4 w-4 mr-1" />
          Ship
        </Button>
      )}
    </div>
  );

  return (
    <ModernInventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Sales Order ${order.orderNumber}` : 'New Sales Order'}
      subtitle={order ? `Created on ${order.orderDate}` : 'Create a new sales order'}
      status={order?.status}
      statusColor={order?.status ? statusColors[order.status] : 'pending'}
      size="full"
      headerActions={headerActions}
      quickActions={quickActions}
    >
      <div className="flex h-full overflow-hidden bg-gradient-to-br from-background to-muted/20">
        {/* Left Panel - Order & Customer Information */}
        <div className="w-80 border-r border-border/50 bg-background/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="order-date" className="text-xs">Order Date</Label>
                    <Input
                      id="order-date"
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      disabled={!isEditMode}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery-date" className="text-xs">Delivery Date</Label>
                    <Input
                      id="delivery-date"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      disabled={!isEditMode}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totals.subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SGST (9%)</span>
                    <span>₹{totals.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CGST (9%)</span>
                    <span>₹{totals.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₹{totals.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border/50">
                    <span>Total</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="customer-name" className="text-xs">Customer Name</Label>
                  <Input
                    id="customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={!isEditMode}
                    className="h-8 text-sm"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-email" className="text-xs">Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    disabled={!isEditMode}
                    className="h-8 text-sm"
                    placeholder="customer@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-phone" className="text-xs">Phone</Label>
                  <Input
                    id="customer-phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={!isEditMode}
                    className="h-8 text-sm"
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-address" className="text-xs">Address</Label>
                  <Textarea
                    id="customer-address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    disabled={!isEditMode}
                    className="text-sm resize-none"
                    placeholder="Customer address"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping & Payment */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Shipping & Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="shipping-address" className="text-xs">Shipping Address</Label>
                  <Textarea
                    id="shipping-address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    disabled={!isEditMode}
                    className="text-sm resize-none"
                    placeholder="Shipping address"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="payment-method" className="text-xs">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={!isEditMode}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-xs">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!isEditMode}
                    className="text-sm resize-none"
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Order Items */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6">
            <Card className="h-full border-border/50">
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Order Items</CardTitle>
                  {isEditMode && !isReadOnly && (
                    <Button onClick={addItem} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-full overflow-y-auto p-6">
                  <OrderItems
                    items={items}
                    isEditMode={isEditMode}
                    isReadOnly={isReadOnly}
                    updateItem={updateItem}
                    addItem={addItem}
                    removeItem={removeItem}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ModernInventoryOverlay>
  );
};