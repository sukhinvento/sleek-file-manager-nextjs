import { useState, useEffect } from 'react';
import { X, Save, Plus, Edit3, CheckCircle, Printer, Mail, Copy, Truck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { InventoryOverlay } from '../inventory/InventoryOverlay';
import { SalesOrder, SalesOrderItem } from '../../types/inventory';
import { OrderSummary } from './OrderSummary';
import { CustomerInformation } from './CustomerInformation';
import { OrderItems } from './OrderItems';
import { ShippingAndPayment } from './ShippingAndPayment';

interface DetailedSOOverlayProps {
  order: SalesOrder | null;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  onSave?: (order: SalesOrder) => void;
  onUpdate?: (order: SalesOrder) => void;
  onDelete?: (orderId: string) => void;
}

export const DetailedSOOverlay = ({ 
  order, 
  isOpen, 
  onClose, 
  isEdit = false, 
  onSave, 
  onUpdate, 
  onDelete 
}: DetailedSOOverlayProps) => {
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

  const headerActions = (
    <div className="flex items-center gap-2">
      {/* Primary Action CTAs */}
      {(isEditMode || !order) && (
        <>
          <Button 
            variant="outline" 
            onClick={() => {
              if (order) {
                setIsEditMode(false);
              } else {
                onClose();
              }
            }}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveOrder}
            disabled={isSaving || isReadOnly}
            className="action-button-primary"
          >
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditMode(true)}
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Edit
        </Button>
      )}

      {order && order.status === 'Processing' && !isEditMode && (
        <Button 
          onClick={handleShipOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Truck className="h-4 w-4 mr-2" />
          Ship Order
        </Button>
      )}
    </div>
  );

  return (
    <InventoryOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={order ? (isEditMode ? 'Edit Sales Order' : 'Sales Order Details') : 'New Sales Order'}
      size="xl"
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order & Customer Info */}
        <div className="lg:col-span-1 space-y-4">
          <OrderSummary 
            order={order}
            totals={totals}
            isEditMode={isEditMode}
            orderDate={orderDate}
            setOrderDate={setOrderDate}
            deliveryDate={deliveryDate}
            setDeliveryDate={setDeliveryDate}
          />

          <CustomerInformation
            order={order}
            isEditMode={isEditMode}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerEmail={customerEmail}
            setCustomerEmail={setCustomerEmail}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            customerAddress={customerAddress}
            setCustomerAddress={setCustomerAddress}
          />

          <ShippingAndPayment
            order={order}
            isEditMode={isEditMode}
            shippingAddress={shippingAddress}
            setShippingAddress={setShippingAddress}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            notes={notes}
            setNotes={setNotes}
          />
        </div>

        {/* Right Column - Items */}
        <div className="lg:col-span-2">
          <OrderItems
            items={items}
            isEditMode={isEditMode}
            isReadOnly={isReadOnly}
            updateItem={updateItem}
            addItem={addItem}
            removeItem={removeItem}
          />
        </div>
      </div>
    </InventoryOverlay>
  );
};