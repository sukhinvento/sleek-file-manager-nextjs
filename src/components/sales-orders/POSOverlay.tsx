import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  X, ShoppingCart, ScanLine, CreditCard,
  Banknote, Smartphone, Shield, IndianRupee,
  Package, CheckCircle2, FileText,
} from 'lucide-react';
import { AutosuggestInput } from '@/components/purchase-orders/AutosuggestInput';
import { ItemScanner } from '@/components/scanner/ItemScanner';
import OrderItemsTable from '@/components/shared/OrderItemsTable';
import EntityAutosuggest from '@/components/shared/EntityAutosuggest';
import { SalesOrder, SalesOrderItem } from '@/types/inventory';
import { StockItem } from '@/types/purchaseOrder';
import { EntityOption } from '@/types/shared';
import { toast } from '@/hooks/use-toast';
import * as salesOrderService from '@/services/salesOrderService';
import { fetchActiveTaxes } from '@/services/taxService';

// Design tokens
const PRIMARY = '#385a9f';
const CREDIT = '#d97706';

const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Cash', icon: Banknote },
  { value: 'Card', label: 'Card', icon: CreditCard },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
  { value: 'Insurance', label: 'Insurance', icon: Shield },
];

const FALLBACK_GST_RATES = [5, 12, 18];

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

interface POSOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (order: SalesOrder) => void;
  patients?: EntityOption[];
}

export default function POSOverlay({ isOpen, onClose, onComplete, patients = [] }: POSOverlayProps) {
  // Cart state
  const [cartItems, setCartItems] = useState<SalesOrderItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  // Customer state
  const [customer, setCustomer] = useState<EntityOption | null>(null);
  const [walkIn, setWalkIn] = useState(true);
  const [walkInName, setWalkInName] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [saleType, setSaleType] = useState<'cash' | 'credit'>('cash'); // cash memo vs credit (khata)
  const [doctorName, setDoctorName] = useState(''); // for prescription-based sales
  const [gstRate, setGstRate] = useState(FALLBACK_GST_RATES[0]);

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<SalesOrder | null>(null);

  // Tax slabs from API
  const [gstRates, setGstRates] = useState<number[]>(FALLBACK_GST_RATES);

  // Per-item stock validation: item_id (or index key) → over-stock amount
  const [stockErrors, setStockErrors] = useState<Record<string, number>>({});

  // Available stock per item (keyed by item_id or name)
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  // Fetch tax slabs on mount
  useEffect(() => {
    fetchActiveTaxes('sales')
      .then((taxes) => {
        const rates = taxes
          .filter(t => t.rate_type === 'percentage' && t.status === 'active')
          .map(t => t.rate);
        const unique = Array.from(new Set(rates)).sort((a, b) => a - b);
        if (unique.length > 0) {
          setGstRates(unique);
          setGstRate(unique[0]); // default to lowest configured slab
        }
      })
      .catch(() => {/* keep fallback */});
  }, []);

  // Calculations
  const subtotal = useMemo(() => round2(cartItems.reduce((sum, item) => sum + item.subtotal, 0)), [cartItems]);
  const taxAmount = useMemo(() => round2(subtotal * (gstRate / 100)), [subtotal, gstRate]);
  const total = useMemo(() => round2(subtotal + taxAmount), [subtotal, taxAmount]);
  const change = paymentMethod === 'Cash' && amountTendered
    ? Math.max(0, parseFloat(amountTendered) - total)
    : 0;

  // Add item from autosuggest
  const handleAddItem = useCallback((stockItem: StockItem) => {
    // Track available stock for this item
    const itemKey = stockItem.id || stockItem.name;
    setStockMap(prev => ({ ...prev, [itemKey]: stockItem.stock }));

    setCartItems((prev) => {
      const existing = prev.findIndex((i) => i.item_id === stockItem.id || i.name === stockItem.name);
      if (existing >= 0) {
        const newQty = prev[existing].qty + 1;
        if (newQty > stockItem.stock) {
          toast({
            title: 'Insufficient Stock',
            description: `Only ${stockItem.stock} units of "${stockItem.name}" available.`,
            variant: 'destructive',
          });
          return prev;
        }
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          qty: newQty,
          subtotal: round2(newQty * updated[existing].unitPrice),
        };
        return updated;
      }
      if (stockItem.stock <= 0) {
        toast({
          title: 'Out of Stock',
          description: `"${stockItem.name}" has no stock available.`,
          variant: 'destructive',
        });
        return prev;
      }
      return [...prev, {
        id: undefined,
        item_id: stockItem.id,
        name: stockItem.name,
        qty: 1,
        unitPrice: stockItem.unitPrice,
        discount: 0,
        subtotal: stockItem.unitPrice,
        saleUnit: stockItem.saleUnit,
      }];
    });
  }, []);

  // Add item from scanner
  const handleScannedItem = useCallback((item: any) => {
    handleAddItem({
      id: item.id,
      name: item.name,
      brand: '',
      stock: item.currentStock || 0,
      unitPrice: item.unitPrice || 0,
      saleUnit: item.saleUnit,
    });
  }, [handleAddItem]);

  // Cart item changes from OrderItemsTable — validate qty against available stock
  const handleCartChange = useCallback((items: SalesOrderItem[]) => {
    const newErrors: Record<string, number> = {};
    const validated = items.map((item) => {
      const key = item.item_id || item.name;
      const available = stockMap[key];
      const recalcSubtotal = round2(item.qty * item.unitPrice * (1 - (item.discount || 0) / 100));
      if (available !== undefined && item.qty > available) {
        newErrors[key] = item.qty - available;
        return { ...item, subtotal: recalcSubtotal };
      }
      return { ...item, subtotal: recalcSubtotal };
    });
    setStockErrors(newErrors);
    setCartItems(validated);
  }, [stockMap]);

  // Complete sale
  const handleCompleteSale = async () => {
    if (cartItems.length === 0) {
      toast({ title: 'Empty Cart', description: 'Add items before completing the sale.', variant: 'destructive' });
      return;
    }
    if (Object.keys(stockErrors).length > 0) {
      toast({ title: 'Stock Error', description: 'One or more items exceed available stock. Please adjust quantities.', variant: 'destructive' });
      return;
    }

    // Credit sales require a registered customer
    if (saleType === 'credit' && walkIn && !walkInName.trim()) {
      toast({ title: 'Customer Required', description: 'Credit sales require a customer name for the ledger.', variant: 'destructive' });
      return;
    }

    setProcessing(true);
    try {
      const customerName = walkIn ? (walkInName || 'Walk-in Customer') : (customer?.name || 'Customer');
      const isCreditSale = saleType === 'credit';
      const gstNote = gstRate > 0 ? ` | GST ${gstRate}% (₹${taxAmount.toFixed(2)})` : '';
      const itemsWithTax = gstRate > 0
        ? cartItems.map(item => ({ ...item, taxSlab: gstRate }))
        : cartItems;
      const orderData: Omit<SalesOrder, 'id'> = {
        orderNumber: '',
        customerId: walkIn ? undefined : customer?.id,
        customerName,
        customerEmail: walkIn ? '' : (customer?.email || ''),
        customerPhone: walkIn ? '' : (customer?.phone || ''),
        customerAddress: walkIn ? '' : (customer?.address || ''),
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        // Cash/card/UPI sales: customer takes items immediately → Delivered
        // Credit (Khata) sales: items pending collection → Processing
        status: isCreditSale ? 'Processing' : 'Delivered',
        paymentStatus: isCreditSale ? 'Pending' : 'Paid',
        items: itemsWithTax,
        total,
        paidAmount: isCreditSale ? 0 : total,
        paymentMethod: isCreditSale ? 'Credit' : paymentMethod,
        shippingAddress: 'Pick Up - Store',
        billingAddress: '',
        notes: isCreditSale
          ? `Credit Sale (Khata) — ${customerName}${doctorName ? ` | Dr. ${doctorName}` : ''}${gstNote}`
          : `POS Sale — ${paymentMethod}${doctorName ? ` | Dr. ${doctorName}` : ''}${gstNote}`,
        createdBy: '',
      };

      // Billing/invoice records are auto-generated by the backend (Kafka event handlers).
      // We intentionally do NOT create one here to avoid duplicate-invoice errors.
      const created = await salesOrderService.createSalesOrder(orderData as SalesOrder);

      setCompletedOrder(created);
      setCompleted(true);
      onComplete(created);
      toast({
        title: isCreditSale ? 'Credit Sale Saved' : 'Sale Complete',
        description: `Bill ${created.orderNumber} — ₹${total.toLocaleString('en-IN')}${isCreditSale ? ' (Credit)' : ''}`,
        variant: 'success',
      });
    } catch (err) {
      console.error('POS sale error:', err);
      toast({ title: 'Error', description: 'Failed to complete sale. Please try again.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  // Park & New - save draft and start fresh
  const handleParkAndNew = async () => {
    if (cartItems.length === 0) return;
    try {
      const customerName = walkIn ? (walkInName || 'Walk-in Customer') : (customer?.name || 'Customer');
      await salesOrderService.createSalesOrder({
        orderNumber: '',
        customerId: walkIn ? undefined : customer?.id,
        customerName,
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: '',
        dueDate: '',
        status: 'Pending',
        paymentStatus: 'Pending',
        items: cartItems,
        total,
        paidAmount: 0,
        paymentMethod: '',
        shippingAddress: 'Pick Up - Store',
        billingAddress: '',
        notes: 'Parked from POS',
        createdBy: '',
      } as SalesOrder);
      toast({ title: 'Order Parked', description: 'Draft saved. Starting new sale.', variant: 'success' });
      resetPOS();
    } catch {
      toast({ title: 'Error', description: 'Failed to park order.', variant: 'destructive' });
    }
  };

  const resetPOS = () => {
    setCartItems([]);
    setStockErrors({});
    setStockMap({});
    setCustomer(null);
    setWalkIn(true);
    setWalkInName('');
    setPaymentMethod('Cash');
    setAmountTendered('');
    setSaleType('cash');
    setDoctorName('');
    setGstRate(0);
    setCompleted(false);
    setCompletedOrder(null);
  };

  const accent = saleType === 'credit' ? CREDIT : PRIMARY;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) { resetPOS(); onClose(); } }}>
      <SheetContent
        side="right"
        className="w-full sm:w-[80vw] sm:max-w-[80vw] p-0 flex flex-col h-full gap-0 bg-background"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-border bg-background shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${PRIMARY}15` }}>
              <ShoppingCart className="h-4 w-4" style={{ color: PRIMARY }} />
            </div>
            <span className="font-bold text-foreground">Quick Sale</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border pointer-events-none">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </Badge>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Success screen */}
        {completed && completedOrder ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: completedOrder.paymentStatus === 'Paid' ? `${PRIMARY}15` : `${CREDIT}15` }}>
              <CheckCircle2 className="h-10 w-10"
                style={{ color: completedOrder.paymentStatus === 'Paid' ? PRIMARY : CREDIT }} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                {completedOrder.paymentStatus === 'Paid' ? 'Sale Complete!' : 'Credit Bill Saved!'}
              </h2>
              <p className="text-muted-foreground mt-1">Bill {completedOrder.orderNumber}</p>
              <p className="text-2xl font-bold mt-4"
                style={{ color: completedOrder.paymentStatus === 'Paid' ? PRIMARY : CREDIT }}>
                ₹{(completedOrder.total || total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              {completedOrder.paymentStatus === 'Paid' && paymentMethod === 'Cash' && change > 0 && (
                <p className="text-lg text-muted-foreground mt-2">
                  Change: ₹{change.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              )}
              {completedOrder.paymentStatus !== 'Paid' && (
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 inline-block">
                  <p className="text-sm text-amber-800 font-medium">Credit to: {completedOrder.customerName}</p>
                  <p className="text-xs text-amber-600 mt-0.5">Collect payment from Sales Orders or Invoices</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" className="gap-2" onClick={() => resetPOS()}>
                <ShoppingCart className="h-4 w-4" /> New Sale
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" /> Print Receipt
              </Button>
              <Button onClick={() => { resetPOS(); onClose(); }} style={{ backgroundColor: PRIMARY }} className="text-white gap-2">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
          {/* Main Content — Cart (left) + Checkout (right).
              On mobile everything scrolls as one column; on desktop each pane scrolls. */}
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">

            {/* LEFT — Cart */}
            <div className="flex flex-col lg:flex-[3] lg:min-h-0 lg:overflow-hidden lg:border-r border-border">
              {/* Search + Scan bar */}
              <div className="p-4 border-b border-border bg-muted/20 shrink-0">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <AutosuggestInput
                      onSelect={handleAddItem}
                      clearOnSelect
                      placeholder="Search items by name, SKU, or barcode..."
                    />
                  </div>
                  <Button
                    variant={showScanner ? 'default' : 'outline'}
                    onClick={() => setShowScanner(!showScanner)}
                    className="gap-2 shrink-0"
                    style={showScanner ? { backgroundColor: PRIMARY } : {}}
                  >
                    <ScanLine className="h-4 w-4" />
                    {showScanner ? 'Close Scanner' : 'Scan'}
                  </Button>
                </div>
                {showScanner && (
                  <div className="mt-3">
                    <ItemScanner
                      onItemScanned={handleScannedItem}
                      existingItems={cartItems.map(i => i.item_id || i.name)}
                    />
                  </div>
                )}
              </div>

              {/* Cart items */}
              <div className="lg:flex-1 lg:overflow-y-auto p-4 min-h-[200px]">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center min-h-[200px] h-full text-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <Package className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No items in cart</p>
                    <p className="text-xs text-muted-foreground mt-1">Search or scan items to add them here</p>
                  </div>
                ) : (
                  <>
                    <OrderItemsTable
                      items={cartItems}
                      editable
                      onItemsChange={handleCartChange}
                      compact
                    />
                    {/* Stock error banners */}
                    {Object.keys(stockErrors).length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {cartItems.map((item) => {
                          const key = item.item_id || item.name;
                          const over = stockErrors[key];
                          if (!over) return null;
                          const available = stockMap[key] ?? 0;
                          return (
                            <div key={key} className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2">
                              <svg className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                              </svg>
                              <p className="text-xs text-red-700 dark:text-red-300">
                                <span className="font-semibold">{item.name}</span>: only{' '}
                                <span className="font-semibold">{available}</span> in stock,{' '}
                                <span className="font-semibold">{over}</span> over limit.
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* RIGHT — Checkout */}
            <div className="flex flex-col lg:flex-[2] lg:min-h-0 lg:overflow-y-auto bg-muted/10 border-t lg:border-t-0 border-border">
              <div className="p-4 space-y-4">

                {/* Bill Type */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bill Type</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSaleType('cash')}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold border transition-all text-muted-foreground"
                      style={saleType === 'cash' ? { backgroundColor: PRIMARY, borderColor: PRIMARY, color: '#fff' } : {}}
                    >
                      Cash Sale
                    </button>
                    <button
                      onClick={() => setSaleType('credit')}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold border transition-all text-muted-foreground"
                      style={saleType === 'credit' ? { backgroundColor: CREDIT, borderColor: CREDIT, color: '#fff' } : {}}
                    >
                      Credit (Khata)
                    </button>
                  </div>
                </div>

                {/* Customer */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setWalkIn(true); setCustomer(null); }}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold border transition-all"
                      style={walkIn ? { backgroundColor: PRIMARY, borderColor: PRIMARY, color: '#fff' } : {}}
                    >
                      Walk-in
                    </button>
                    <button
                      onClick={() => setWalkIn(false)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold border transition-all"
                      style={!walkIn ? { backgroundColor: PRIMARY, borderColor: PRIMARY, color: '#fff' } : {}}
                    >
                      Select Patient
                    </button>
                  </div>

                  {walkIn ? (
                    <Input
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      placeholder={saleType === 'credit' ? 'Customer name (required for credit)' : 'Customer name (optional)'}
                      className={`text-sm ${saleType === 'credit' && !walkInName.trim() ? 'border-amber-400' : ''}`}
                    />
                  ) : (
                    <EntityAutosuggest
                      entities={patients}
                      value={customer}
                      onSelect={setCustomer}
                      placeholder="Search patients..."
                      searchFields={['name', 'phone', 'email']}
                    />
                  )}

                  <Input
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Dr. name (for prescription items)"
                    className="text-sm"
                  />
                </div>

                {/* Summary with GST breakdown */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summary</p>
                  <div className="rounded-lg border border-border bg-background p-3 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {/* GST rate selector — rates fetched from /taxes/active/list */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-muted-foreground shrink-0">GST</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {gstRates.map((r) => (
                          <button
                            key={r}
                            onClick={() => setGstRate(r)}
                            className="px-2 py-1 rounded-md text-xs font-semibold border transition-all"
                            style={gstRate === r ? { backgroundColor: PRIMARY, borderColor: PRIMARY, color: '#fff' } : {}}
                          >
                            {r}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {gstRate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">GST ({gstRate}%)</span>
                        <span className="font-medium">₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t border-border pt-2.5">
                      <span className="text-sm font-semibold">Total</span>
                      <span className="text-lg font-bold flex items-center" style={{ color: accent }}>
                        <IndianRupee className="h-4 w-4" />
                        {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment method — cash sales only */}
                {saleType === 'cash' && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Method</p>
                    <div className="grid grid-cols-4 gap-2">
                      {PAYMENT_METHODS.map((m) => (
                        <button
                          key={m.value}
                          onClick={() => setPaymentMethod(m.value)}
                          className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg border transition-all text-xs font-semibold hover:bg-muted/50"
                          style={paymentMethod === m.value ? { backgroundColor: PRIMARY, borderColor: PRIMARY, color: '#fff' } : {}}
                        >
                          <m.icon className="h-4 w-4" />
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {/* Amount tendered (cash only) */}
                    {paymentMethod === 'Cash' && total > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-xs text-muted-foreground">Amount Tendered</label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            value={amountTendered}
                            onChange={(e) => setAmountTendered(e.target.value)}
                            placeholder={total.toFixed(2)}
                            className="pl-9 text-lg font-bold"
                          />
                        </div>
                        {parseFloat(amountTendered) > total && (
                          <p className="text-sm font-semibold text-emerald-600">
                            Change: ₹{change.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Credit sale notice */}
                {saleType === 'credit' && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs font-semibold text-amber-800">Credit Sale (Khata)</p>
                    <p className="text-xs text-amber-700 mt-1">
                      ₹{total.toLocaleString('en-IN')} will be added to the customer's ledger.
                      Payment can be collected later from the Sales Orders or Invoices.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shared action footer — header & footer stay fixed; only the body scrolls */}
          <div className="px-4 py-3 border-t border-border bg-background shrink-0">
            <div className="w-full lg:max-w-md lg:ml-auto space-y-2">
              <Button
                onClick={handleCompleteSale}
                disabled={processing || cartItems.length === 0 || Object.keys(stockErrors).length > 0}
                className="w-full h-12 text-base font-bold text-white gap-2"
                style={{ backgroundColor: accent }}
              >
                {processing ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </>
                ) : saleType === 'credit' ? (
                  <>
                    <FileText className="h-5 w-5" />
                    Save Credit Bill — ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Complete Sale — ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </>
                )}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-xs" onClick={handleParkAndNew}
                  disabled={cartItems.length === 0}
                  style={{ borderColor: `${PRIMARY}40`, color: PRIMARY }}>
                  Park & New
                </Button>
                <Button variant="outline" className="flex-1 text-xs"
                  onClick={resetPOS} disabled={cartItems.length === 0}>
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
