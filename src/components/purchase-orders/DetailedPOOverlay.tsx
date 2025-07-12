import { useState } from 'react';
import { X, Paperclip, Printer, Mail, FileText, Copy, CheckCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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
}

export const DetailedPOOverlay = ({ order, isOpen, onClose, isEdit = false }: DetailedPOOverlayProps) => {
  const [items, setItems] = useState<PurchaseOrderItem[]>(order?.items || []);
  const [selectedTaxSlab, setSelectedTaxSlab] = useState<number>(18);
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>(order?.paymentMethod || 'net-30');
  
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
      setItems([...items, { name: '', qty: 0, unitPrice: 0, discount: 0, subtotal: 0, taxSlab: selectedTaxSlab }]);
    }
  };

  const removeItem = (index: number) => {
    if (isReadOnly || isPartiallyFulfilled) return;
    setItems(items.filter((_, i: number) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    if (isReadOnly) return;
    if (isPartiallyFulfilled && field !== 'qty') return; // Only allow qty changes for partial fulfillment
    
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[75vw] overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">
              {isEdit ? 'Edit Purchase Order' : 'Purchase Order Details'}
            </SheetTitle>
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
          />

          <VendorInformation order={order} />

          <OrderItems 
            items={items}
            setItems={setItems}
            selectedTaxSlab={selectedTaxSlab}
            showScanner={showScanner}
            setShowScanner={setShowScanner}
            isQuotation={isQuotation}
            isPartiallyFulfilled={isPartiallyFulfilled}
            isReadOnly={isReadOnly}
            updateItem={updateItem}
            addItem={addItem}
            removeItem={removeItem}
          />

          <PaymentAndShipping 
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            isReadOnly={isReadOnly}
          />

          <RemarksSection order={order} />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={isReadOnly}>
              {isQuotation ? 'Save Order' : 'Update Order'}
            </Button>
            <Button onClick={handlePrintInvoice} variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
            {order?.status === 'Approved' && (
              <Button variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Delivered
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};