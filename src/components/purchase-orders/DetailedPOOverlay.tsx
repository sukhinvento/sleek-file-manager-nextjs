import { useState, useEffect } from 'react';
import { X, Paperclip, Printer, Mail, FileText, Copy, CheckCircle, Save, Plus, Edit3 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { OrderSummary } from './OrderSummary';
import { VendorInformation } from './VendorInformation';
import { OrderItems } from './OrderItems';
import { PaymentAndShipping } from './PaymentAndShipping';
import { RemarksSection } from './RemarksSection';
import { PurchaseOrder, PurchaseOrderItem, StockItem } from '../../types/purchaseOrder';
import { offers } from '../../data/purchaseOrderData';

interface DetailedPOOverlayProps {
  order: PurchaseOrder | null;
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  onSave?: (order: PurchaseOrder) => void;
  onUpdate?: (order: PurchaseOrder) => void;
  onDelete?: (orderId: string) => void;
}

export const DetailedPOOverlay = ({ 
  order, 
  isOpen, 
  onClose, 
  isEdit = false, 
  onSave, 
  onUpdate, 
  onDelete 
}: DetailedPOOverlayProps) => {
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [selectedTaxSlab, setSelectedTaxSlab] = useState<number>(18);
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('net-30');
  const [vendorName, setVendorName] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [orderDate, setOrderDate] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(isEdit);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initialize form with order data
  useEffect(() => {
    if (order) {
      setItems(order.items || []);
      setPaymentMethod(order.paymentMethod || 'net-30');
      setVendorName(order.vendorName || '');
      setShippingAddress(order.shippingAddress || '');
      setOrderDate(order.orderDate || '');
      setDeliveryDate(order.deliveryDate || '');
      setRemarks(Array.isArray(order.remarks) ? order.remarks.map(r => r.message).join('\n') : order.remarks || '');
    } else {
      // Reset for new order
      setItems([]);
      setPaymentMethod('net-30');
      setVendorName('');
      setShippingAddress('');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setDeliveryDate('');
      setRemarks('');
    }
    setIsEditMode(isEdit);
  }, [order, isEdit]);
  
  // Determine if order can be edited based on status
  const isQuotation = order?.status === 'Pending';
  const isPartiallyFulfilled = order?.status === 'Partial';
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
        taxSlab: selectedTaxSlab 
      }]);
    } else {
      setItems([...items, { 
        name: '', 
        qty: 1, 
        unitPrice: 0, 
        discount: 0, 
        subtotal: 0, 
        taxSlab: selectedTaxSlab 
      }]);
    }
    
    toast({
      title: "Item Added",
      description: "New item has been added to the order.",
    });
  };

  const removeItem = (index: number) => {
    if (isReadOnly || isPartiallyFulfilled) return;
    setItems(items.filter((_, i: number) => i !== index));
    
    toast({
      title: "Item Removed",
      description: "Item has been removed from the order.",
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    if (isReadOnly) return;
    if (isPartiallyFulfilled && field !== 'qty') return;
    
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
    const subTotal = items.reduce((sum: number, item: PurchaseOrderItem) => sum + (item.subtotal || 0), 0);
    
    // Apply offer discount
    let offerDiscount = 0;
    if (selectedOffer) {
      const offer = offers.find(o => o.id === selectedOffer);
      if (offer) {
        const totalQty = items.reduce((sum: number, item: PurchaseOrderItem) => sum + (item.qty || 0), 0);
        if (totalQty >= offer.minQty) {
          offerDiscount = subTotal * (offer.rate / 100);
        }
      }
    }
    
    const discountedTotal = subTotal - offerDiscount;
    const tax = discountedTotal * (selectedTaxSlab / 100);
    const shipping = 500.0;
    const total = discountedTotal + tax + shipping;
    
    return { subTotal, offerDiscount, tax, shipping, total, discountedTotal };
  };

  const totals = calculateTotals();

  const handlePrintInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Purchase Order - ${order?.poNumber || 'PO-2024-XXX'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .details { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .totals { text-align: right; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Purchase Order</h1>
              <h2>${order?.poNumber || 'PO-2024-XXX'}</h2>
            </div>
            <div class="details">
              <p><strong>Vendor:</strong> ${order?.vendorName || ''}</p>
              <p><strong>Order Date:</strong> ${order?.orderDate || ''}</p>
              <p><strong>Delivery Date:</strong> ${order?.deliveryDate || ''}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            </div>
            <table>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Discount</th>
                <th>Subtotal</th>
              </tr>
              ${items.map((item: PurchaseOrderItem) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td>₹${item.unitPrice?.toFixed(2)}</td>
                  <td>${item.discount}%</td>
                  <td>₹${item.subtotal?.toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
            <div class="totals">
              <p><strong>Subtotal: ₹${totals.subTotal.toFixed(2)}</strong></p>
              <p><strong>Tax (${selectedTaxSlab}%): ₹${totals.tax.toFixed(2)}</strong></p>
              <p><strong>Shipping: ₹${totals.shipping.toFixed(2)}</strong></p>
              <p><strong>Total: ₹${totals.total.toFixed(2)}</strong></p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getPaymentMethodDisplay = (method: string) => {
    const methods = {
      'net-30': 'Net 30 Days',
      'net-15': 'Net 15 Days',
      'net-7': 'Net 7 Days',
      'cod': 'Cash on Delivery',
      'advance': 'Advance Payment',
      'pos': 'POS (Credit/Debit Card)',
      'bank-transfer': 'Bank Transfer'
    };
    return methods[method as keyof typeof methods] || method;
  };

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
        description: "Please select a vendor.",
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
        vendorPhone: order?.vendorPhone || '',
        vendorEmail: order?.vendorEmail || '',
        vendorAddress: order?.vendorAddress || '',
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

  const handleMarkAsDelivered = async () => {
    if (!order || !onUpdate) return;
    
    const updatedOrder = { ...order, status: 'Delivered' as const };
    
    try {
      await onUpdate(updatedOrder);
      toast({
        title: "Order Updated",
        description: "Order has been marked as delivered.",
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[85vw] max-w-6xl overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-xl font-semibold">
                {order ? (isEditMode ? 'Edit Purchase Order' : 'Purchase Order Details') : 'New Purchase Order'}
              </SheetTitle>
              {!isEditMode && order && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                  disabled={isReadOnly}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm"><Paperclip className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Copy className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={handlePrintInvoice}><Printer className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><Mail className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm"><FileText className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pt-6">
          <OrderSummary 
            order={order} 
            totals={totals} 
            paymentMethod={paymentMethod} 
            getPaymentMethodDisplay={getPaymentMethodDisplay}
            isEditMode={isEditMode}
            vendorName={vendorName}
            setVendorName={setVendorName}
            orderDate={orderDate}
            setOrderDate={setOrderDate}
            deliveryDate={deliveryDate}
            setDeliveryDate={setDeliveryDate}
          />

          <VendorInformation 
            order={order} 
            isEditMode={isEditMode}
            shippingAddress={shippingAddress}
            setShippingAddress={setShippingAddress}
          />

          <OrderItems 
            items={items}
            setItems={setItems}
            selectedTaxSlab={selectedTaxSlab}
            showScanner={showScanner}
            setShowScanner={setShowScanner}
            isQuotation={isEditMode || !order}
            isPartiallyFulfilled={isPartiallyFulfilled}
            isReadOnly={isReadOnly && !isEditMode}
            updateItem={updateItem}
            addItem={addItem}
            removeItem={removeItem}
          />

          <PaymentAndShipping 
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            isReadOnly={isReadOnly && !isEditMode}
          />

          <RemarksSection 
            order={order} 
            isEditMode={isEditMode}
            remarks={remarks}
            setRemarks={setRemarks}
          />

          {/* Enhanced Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex gap-3">
              <Button 
                onClick={handlePrintInvoice} 
                variant="outline"
                className="action-button-secondary"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
              <Button variant="outline" className="action-button-secondary">
                <Mail className="h-4 w-4 mr-2" />
                Email Order
              </Button>
              <Button variant="outline" className="action-button-secondary">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
            </div>

            <div className="flex gap-3">
              {order && order.status === 'Approved' && !isEditMode && (
                <Button 
                  onClick={handleMarkAsDelivered}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Delivered
                </Button>
              )}
              
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
                    className="action-button-primary min-w-[120px]"
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
              
              {order && !isEditMode && order.status === 'Pending' && (
                <Button 
                  onClick={handleDeleteOrder}
                  variant="destructive"
                  className="ml-2"
                >
                  Delete Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};