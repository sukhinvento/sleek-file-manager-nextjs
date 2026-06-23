import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// Card removed — using tinted section headers pattern
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  X, Save, Edit3, Trash2, CreditCard, User,
  FileText, IndianRupee, Package,
  AlertCircle, Printer, CheckCircle,
  MapPin, Receipt, ShoppingBag,
} from 'lucide-react';
import { SalesOrder, SalesOrderItem } from '@/types/inventory';
import { StockItem } from '@/types/purchaseOrder';
import OrderItemsTable from '@/components/shared/OrderItemsTable';
import OrderSummaryCard from '@/components/shared/OrderSummaryCard';
import RecordPaymentDialog from '@/components/shared/RecordPaymentDialog';
import DocumentPreviewDialog from '@/components/shared/DocumentPreviewDialog';
import { AutosuggestInput } from '@/components/purchase-orders/AutosuggestInput';
import { PaymentRecord } from '@/types/shared';
import * as salesOrderService from '@/services/salesOrderService';
import { toast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const PRIMARY = '#385a9f';

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Processing: 'bg-blue-100 text-blue-800 border-blue-200',
  Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
  'Partially Shipped': 'bg-orange-100 text-orange-800 border-orange-200',
};

const PAYMENT_STYLES: Record<string, string> = {
  Paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Partial: 'bg-blue-100 text-blue-800 border-blue-200',
  Overdue: 'bg-red-100 text-red-800 border-red-200',
};

interface SalesOrderSheetProps {
  order: SalesOrder | null;
  mode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onSave: (order: SalesOrder) => void;
  onDelete?: (orderId: string) => void;
  onRefresh?: () => void;
}

export default function SalesOrderSheet({ order, mode, onClose, onSave, onDelete, onRefresh }: SalesOrderSheetProps) {
  const [form, setForm] = useState<Partial<SalesOrder>>(order ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrintPopover, setShowPrintPopover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'Pick Up' | 'Delivery'>('Pick Up');
  const isEdit = mode === 'edit' || mode === 'add';
  const isSettled = order?.status === 'Delivered' || order?.status === 'Cancelled';

  useEffect(() => {
    if (mode === 'add') {
      setForm({
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        paymentStatus: 'Pending',
        paymentMethod: '',
        shippingAddress: 'Pick Up - Store',
        items: [],
        total: 0,
        paidAmount: 0,
        notes: '',
      });
      setDeliveryType('Pick Up');
    } else {
      setForm(order ?? {});
      if (order?.shippingAddress?.toLowerCase().includes('pick up')) {
        setDeliveryType('Pick Up');
      } else {
        setDeliveryType(order?.shippingAddress ? 'Delivery' : 'Pick Up');
      }
    }
    setErrors({});
  }, [order, mode]);

  const upd = (key: string, val: any) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  // Recalculate total when items change
  const recalcTotal = (items: SalesOrderItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.subtotal || item.qty * item.unitPrice), 0);
    setForm((p) => ({ ...p, items, total }));
  };

  const balanceDue = Math.max(0, (order?.total || 0) - (order?.paidAmount || 0));

  const handleRecordPayment = async (payment: PaymentRecord) => {
    if (!order) return;
    try {
      const newPaidAmount = (order.paidAmount || 0) + payment.amount;
      const newPaymentStatus = newPaidAmount >= order.total ? 'Paid' : 'Partial';
      await salesOrderService.updateSalesOrder(order.id, {
        paidAmount: newPaidAmount,
        paymentStatus: newPaymentStatus,
        paymentMethod: payment.paymentMethod,
      } as Partial<SalesOrder>);
      toast({ title: 'Payment Recorded', description: `₹${payment.amount.toFixed(2)} recorded successfully.`, variant: 'success' });
      setShowPrintPopover(true);
      onRefresh?.();
    } catch {
      throw new Error('Failed to record payment');
    }
  };

  const handleSave = async () => {
    const errs: Record<string, string> = {};
    if (!form.customerName?.trim()) errs.customerName = 'Customer name is required';
    if (!form.items || form.items.length === 0) errs.items = 'Add at least one item';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const finalForm = {
        ...form,
        shippingAddress: deliveryType === 'Pick Up' ? 'Pick Up - Store' : (form.shippingAddress || ''),
      };
      onSave(finalForm as SalesOrder);
    } catch {
      toast({ title: 'Error', description: 'Failed to save order.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (order && onDelete) {
      onDelete(order.id);
      onClose();
    }
  };

  const [markingDelivered, setMarkingDelivered] = useState(false);
  const handleMarkDelivered = async () => {
    if (!order) return;
    setMarkingDelivered(true);
    try {
      await salesOrderService.updateSalesOrder(order.id, {
        status: 'Delivered',
      } as Partial<SalesOrder>);
      toast({ title: 'Order Delivered', description: `${order.orderNumber} marked as Delivered.`, variant: 'success' });
      onRefresh?.();
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to mark as delivered.', variant: 'destructive' });
    } finally {
      setMarkingDelivered(false);
    }
  };

  const handleAddItem = (stockItem: StockItem) => {
    const currentItems = form.items || [];
    const existing = currentItems.findIndex((i) => i.item_id === stockItem.id || i.name === stockItem.name);
    if (existing >= 0) {
      const updated = [...currentItems];
      updated[existing] = {
        ...updated[existing],
        qty: updated[existing].qty + 1,
        subtotal: (updated[existing].qty + 1) * updated[existing].unitPrice,
      };
      recalcTotal(updated);
    } else {
      const newItem: SalesOrderItem = {
        item_id: stockItem.id,
        name: stockItem.name,
        qty: 1,
        unitPrice: stockItem.unitPrice,
        discount: 0,
        subtotal: stockItem.unitPrice,
        saleUnit: stockItem.saleUnit,
      };
      recalcTotal([...currentItems, newItem]);
    }
  };

  const handlePrint = (type: 'invoice' | 'receipt' | 'bill') => {
    setShowPrintPopover(false);
    setShowPreview(true);
  };

  const parseDate = (str?: string) => {
    if (!str) return undefined;
    const d = new Date(str);
    return isNaN(d.getTime()) ? undefined : d;
  };

  return (
    <>
      <Sheet open={!!order || mode === 'add'} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent side="right" className="w-full sm:w-[80vw] sm:max-w-[80vw] p-0 flex flex-col h-full bg-background">

          {/* Header — title + subtitle + close only; CTAs are in the footer */}
          <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground leading-tight break-words">
                {mode === 'add' ? 'New Sales Order' : mode === 'edit' ? `Edit — ${order?.orderNumber}` : order?.orderNumber}
              </h2>
              {mode === 'view' && order && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {order.customerName} · {order.orderDate}
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Read-only banner for settled orders */}
          {mode === 'view' && (order?.status === 'Delivered' || order?.status === 'Cancelled') && (
            <div className="flex items-center gap-2 px-6 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 flex-shrink-0">
              <svg className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                This order is <span className="font-bold">{order?.status}</span> and cannot be edited or deleted.
              </p>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* ── VIEW MODE ───────────────────────────────────── */}
            {mode === 'view' && order && (
              <>
                {/* Status badges row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-800'} border text-xs font-semibold pointer-events-none`}>
                    {order.status}
                  </Badge>
                  <Badge className={`${PAYMENT_STYLES[order.paymentStatus] || 'bg-gray-100 text-gray-800'} border text-xs font-semibold pointer-events-none`}>
                    {order.paymentStatus}
                  </Badge>
                  {order.paymentMethod && (
                    <Badge className="bg-slate-100 text-slate-700 border-0 text-xs pointer-events-none">
                      {order.paymentMethod}
                    </Badge>
                  )}
                </div>

                {/* Customer + Summary side-by-side */}
                <div className="grid lg:grid-cols-[1fr_1fr] gap-5 lg:items-stretch">
                  {/* Left: Customer card + Order details */}
                  <div className="space-y-4">
                    {/* Customer card */}
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Customer</span>
                      </div>
                      <div className="p-4">
                        <p className="text-[13px] font-semibold text-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {[order.customerPhone, order.customerEmail].filter(Boolean).join(' · ') || 'No contact info'}
                        </p>
                        {order.customerAddress && (
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" /> {order.customerAddress}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order details table — alternating rows */}
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Order Details</span>
                      </div>
                      {[
                        ['Order Date', order.orderDate],
                        ['Delivery Date', order.deliveryDate || '—'],
                        ['Due Date', order.dueDate || '—'],
                        ['Fulfilment', order.shippingAddress?.includes('Pick Up') ? 'Store Pick Up' : (order.shippingAddress || '—')],
                        ['Created By', order.createdBy || '—'],
                      ].map(([label, value], idx) => (
                        <div key={label} className={`flex px-4 py-2.5 border-b border-border/50 last:border-0 ${idx % 2 === 0 ? 'bg-card' : 'bg-primary/[0.02]'}`}>
                          <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{label}</span>
                          <span className="text-xs font-semibold text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Payment summary */}
                  <div className="flex flex-col">
                    <OrderSummaryCard
                      subtotal={order.items.reduce((sum, i) => sum + (i.subtotal || 0), 0)}
                      total={order.total}
                      paidAmount={order.paidAmount || 0}
                      onRecordPayment={balanceDue > 0 ? () => setShowPaymentDialog(true) : undefined}
                      items={order.items}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Items table — full width with section header */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Order Items</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <OrderItemsTable items={order.items} />
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Notes</span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-xs text-foreground leading-relaxed">{order.notes}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── EDIT / ADD MODE ──────────────────────────────── */}
            {isEdit && (
              <>
                {/* Customer Details */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Customer Details</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Name — full width (most important, needs space) */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Customer Name *</Label>
                      <Input value={form.customerName || ''} onChange={(e) => upd('customerName', e.target.value)}
                        className={errors.customerName ? 'border-red-500' : ''}
                        placeholder="Customer name" />
                      {errors.customerName && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.customerName}
                        </p>
                      )}
                    </div>
                    {/* Phone + Email side by side */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Phone</Label>
                        <Input value={form.customerPhone || ''} onChange={(e) => upd('customerPhone', e.target.value)}
                          placeholder="Phone number" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Email</Label>
                        <Input value={form.customerEmail || ''} onChange={(e) => upd('customerEmail', e.target.value)}
                          placeholder="Email" />
                      </div>
                    </div>
                    {/* Address — full width */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Address</Label>
                      <Input value={form.customerAddress || ''} onChange={(e) => upd('customerAddress', e.target.value)}
                        placeholder="Address" />
                    </div>
                  </div>
                </div>

                {/* Items — AutosuggestInput + editable table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                    <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Items</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <AutosuggestInput
                      onSelect={handleAddItem}
                      clearOnSelect
                      placeholder="Search items by name, SKU, or barcode..."
                    />
                    {errors.items && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.items}
                      </p>
                    )}
                    <OrderItemsTable
                      items={form.items || []}
                      editable
                      onItemsChange={(items) => recalcTotal(items)}
                    />
                    {(form.items?.length || 0) > 0 && (
                      <div className="flex justify-end pt-2 border-t border-border">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-lg font-bold text-primary">
                            ₹{(form.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Order Details</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Status — full width so it never truncates */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Status</Label>
                      <Select value={form.status || 'Pending'} onValueChange={(v) => upd('status', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Dates — 2-col gives each DatePicker enough space */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Order Date</Label>
                        <DatePicker
                          date={parseDate(form.orderDate)}
                          onDateChange={(d) => upd('orderDate', d ? d.toISOString().split('T')[0] : '')}
                          placeholder="Order date"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Delivery Date</Label>
                        <DatePicker
                          date={parseDate(form.deliveryDate)}
                          onDateChange={(d) => upd('deliveryDate', d ? d.toISOString().split('T')[0] : '')}
                          placeholder="Delivery date"
                        />
                      </div>
                    </div>
                    {/* Fulfilment toggle — full width */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Fulfilment</Label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setDeliveryType('Pick Up'); upd('shippingAddress', 'Pick Up - Store'); }}
                          className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                            deliveryType === 'Pick Up' ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          <MapPin className="h-3.5 w-3.5" /> Pick Up
                        </button>
                        <button
                          onClick={() => { setDeliveryType('Delivery'); upd('shippingAddress', ''); }}
                          className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                            deliveryType === 'Delivery' ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          <Package className="h-3.5 w-3.5" /> Delivery
                        </button>
                      </div>
                    </div>
                    {/* Payment Method — full width */}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Payment Method</Label>
                      <Select value={form.paymentMethod || ''} onValueChange={(v) => upd('paymentMethod', v)}>
                        <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
                        <SelectContent>
                          {['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque', 'Net-30', 'Net-60', 'COD'].map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {deliveryType === 'Delivery' && (
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Delivery Address</Label>
                        <Input value={form.shippingAddress === 'Pick Up - Store' ? '' : (form.shippingAddress || '')}
                          onChange={(e) => upd('shippingAddress', e.target.value)}
                          placeholder="Delivery address" />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Notes</Label>
                      <Textarea value={form.notes || ''} onChange={(e) => upd('notes', e.target.value)} rows={2} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {isEdit && (
            <div className="border-t border-border px-6 py-4 flex items-center gap-3 flex-shrink-0">
              <Button variant="outline" onClick={onClose} className="h-9 text-xs">Cancel</Button>
              <Button onClick={handleSave} disabled={saving}
                className="h-9 text-xs ml-auto">
                {saving ? 'Saving...' : <><Save className="h-3.5 w-3.5 mr-1" /> {mode === 'add' ? 'Create Sale' : 'Update Sale'}</>}
              </Button>
            </div>
          )}

          {mode === 'view' && (
            <div className="border-t border-border px-6 py-4 flex items-center gap-2 flex-wrap flex-shrink-0">
              {onDelete && !isSettled && (
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)}
                  className="h-9 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              )}
              {balanceDue > 0 && (
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1"
                  onClick={() => setShowPaymentDialog(true)}>
                  <CreditCard className="h-3.5 w-3.5" /> Record Payment
                </Button>
              )}
              <Popover open={showPrintPopover} onOpenChange={setShowPrintPopover}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 text-xs gap-1">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-44 p-1.5" align="start">
                  <div className="space-y-0.5">
                    <button onClick={() => handlePrint('invoice')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs hover:bg-muted transition-colors text-left">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Invoice
                    </button>
                    <button onClick={() => handlePrint('receipt')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs hover:bg-muted transition-colors text-left">
                      <Receipt className="h-3.5 w-3.5 text-muted-foreground" /> Receipt
                    </button>
                    <button onClick={() => handlePrint('bill')}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs hover:bg-muted transition-colors text-left">
                      <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" /> Bill
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
              {/* Mark Delivered — only for active (non-settled) orders */}
              {!isSettled && order?.status !== 'Delivered' && (
                <Button
                  size="sm"
                  className="h-9 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleMarkDelivered}
                  disabled={markingDelivered}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {markingDelivered ? 'Updating…' : 'Mark Delivered'}
                </Button>
              )}
              {!isSettled && (
                <Button size="sm" className="h-9 text-xs ml-auto gap-1"
                  onClick={() => onSave({ ...order! })}>
                  <Edit3 className="h-3.5 w-3.5" /> Edit Order
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Payment Dialog */}
      {order && (
        <RecordPaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          totalAmount={order.total}
          paidAmount={order.paidAmount || 0}
          onRecordPayment={handleRecordPayment}
          entityLabel={order.orderNumber}
        />
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete ${order?.orderNumber ?? 'order'}?`}
        description="This will permanently delete this sales order. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {order && showPreview && (
        <DocumentPreviewDialog
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          doc={{
            documentType: 'Sales Order',
            documentNumber: order.orderNumber,
            status: order.status,
            partyLabel: 'Customer',
            partyName: order.customerName,
            partyEmail: order.customerEmail,
            partyPhone: order.customerPhone,
            partyAddress: order.customerAddress,
            details: [
              { label: 'Order Date', value: order.orderDate || '—' },
              { label: 'Delivery Date', value: order.deliveryDate || '—' },
              { label: 'Payment', value: order.paymentMethod || '—' },
              { label: 'Payment Status', value: order.paymentStatus || '—' },
            ],
            lineItems: (order.items || []).map(item => ({
              description: item.name,
              quantity: item.qty,
              unitPrice: item.unitPrice,
              discount: item.discount,
              amount: item.subtotal,
            })),
            subtotal: (order.items || []).reduce((s, i) => s + (i.qty * i.unitPrice), 0),
            discountAmount: (order.items || []).reduce((s, i) => s + ((i.qty * i.unitPrice) * (i.discount || 0) / 100), 0),
            grandTotal: order.total,
            paidAmount: order.paidAmount,
            notes: order.notes,
            footerText: order.shippingAddress
              ? `Shipping: ${order.shippingAddress}`
              : undefined,
          }}
        />
      )}
    </>
  );
}
