import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// Card removed — using tinted section headers pattern
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  X, Save, Edit3, Trash2, CreditCard, Building2,
  IndianRupee, Package, Printer, ScanLine, Banknote, Smartphone, Shield,
  AlertCircle, Truck, ShieldCheck, CheckCircle2, MapPin,
} from 'lucide-react';
import { PurchaseOrder, PurchaseOrderItem } from '@/types/purchaseOrder';
import OrderItemsTable from '@/components/shared/OrderItemsTable';
import OrderSummaryCard from '@/components/shared/OrderSummaryCard';
import RecordPaymentDialog from '@/components/shared/RecordPaymentDialog';
import DocumentPreviewDialog, { PrintableDocument } from '@/components/shared/DocumentPreviewDialog';
import { AutosuggestInput } from './AutosuggestInput';
import { ItemScanner } from '@/components/scanner/ItemScanner';
import { PaymentRecord, EntityOption } from '@/types/shared';
import EntityAutosuggest from '@/components/shared/EntityAutosuggest';
import * as purchaseOrderService from '@/services/purchaseOrderService';
import { fetchRooms, Room } from '@/services/roomService';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { toast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const PRIMARY = '#385a9f';

const PAYMENT_METHODS_PO = [
  { value: 'Bank Transfer', label: 'Bank Transfer', icon: Building2 },
  { value: 'Cash', label: 'Cash', icon: Banknote },
  { value: 'Card', label: 'Card', icon: CreditCard },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
  { value: 'Cheque', label: 'Cheque', icon: IndianRupee },
  { value: 'Net-30', label: 'Net-30', icon: Shield },
];

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Approved: 'bg-blue-100 text-blue-800 border-blue-200',
  Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
  Partial: 'bg-orange-100 text-orange-800 border-orange-200',
  Received: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Partially Received': 'bg-orange-100 text-orange-800 border-orange-200',
};

interface PurchaseOrderSheetProps {
  order: PurchaseOrder | null;
  mode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onSave: (order: PurchaseOrder) => void;
  onDelete?: (orderId: string) => void;
  onRefresh?: () => void;
  vendors?: EntityOption[];
}

export default function PurchaseOrderSheet({
  order, mode, onClose, onSave, onDelete, onRefresh, vendors = [],
}: PurchaseOrderSheetProps) {
  const [form, setForm] = useState<Partial<PurchaseOrder>>(order ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const isEdit = mode === 'edit' || mode === 'add';

  const { displayName } = useCurrentUser();

  // Delivery locations derived from rooms (departments + types)
  const [deliveryLocations, setDeliveryLocations] = useState<{ id: string; name: string; detail: string }[]>([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  useEffect(() => {
    if (mode === 'add' || mode === 'edit') {
      fetchRooms().then((rooms) => {
        const seen = new Set<string>();
        const locs: { id: string; name: string; detail: string }[] = [];
        // Static hospital locations first
        const staticLocations = ['Pharmacy', 'Operation Theatre (OT)', 'Emergency', 'ICU', 'NICU', 'General Ward', 'Reception', 'Store Room', 'Admin Office', 'Laboratory', 'Radiology'];
        staticLocations.forEach((loc, i) => {
          locs.push({ id: `static-${i}`, name: loc, detail: 'Hospital' });
          seen.add(loc.toLowerCase());
        });
        // Derive from rooms: unique departments
        rooms.forEach((room) => {
          if (room.department && !seen.has(room.department.toLowerCase())) {
            seen.add(room.department.toLowerCase());
            locs.push({ id: `dept-${room.department}`, name: room.department, detail: `Floor ${room.floor}` });
          }
        });
        // Also add room types as categories (ICU, General Ward, etc.)
        const typeLabels: Record<string, string> = {
          General: 'General Ward', Private: 'Private Ward', ICU: 'ICU',
          'Semi-Private': 'Semi-Private Ward', Deluxe: 'Deluxe Ward', Suite: 'Suite',
        };
        rooms.forEach((room) => {
          const label = typeLabels[room.type] || room.type;
          if (!seen.has(label.toLowerCase())) {
            seen.add(label.toLowerCase());
            locs.push({ id: `type-${room.type}`, name: label, detail: `Floor ${room.floor}` });
          }
        });
        setDeliveryLocations(locs);
      }).catch(() => {
        // Fallback: provide static locations even if rooms API fails
        setDeliveryLocations([
          { id: 'static-0', name: 'Pharmacy', detail: 'Hospital' },
          { id: 'static-1', name: 'Operation Theatre (OT)', detail: 'Hospital' },
          { id: 'static-2', name: 'Emergency', detail: 'Hospital' },
          { id: 'static-3', name: 'ICU', detail: 'Hospital' },
          { id: 'static-4', name: 'NICU', detail: 'Hospital' },
          { id: 'static-5', name: 'General Ward', detail: 'Hospital' },
          { id: 'static-6', name: 'Store Room', detail: 'Hospital' },
          { id: 'static-7', name: 'Reception', detail: 'Hospital' },
          { id: 'static-8', name: 'Admin Office', detail: 'Hospital' },
          { id: 'static-9', name: 'Laboratory', detail: 'Hospital' },
          { id: 'static-10', name: 'Radiology', detail: 'Hospital' },
        ]);
      });
    }
  }, [mode]);

  const filteredLocations = useMemo(() => {
    if (!locationQuery.trim()) return deliveryLocations;
    const q = locationQuery.toLowerCase();
    return deliveryLocations.filter(
      (l) => l.name.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q)
    );
  }, [locationQuery, deliveryLocations]);

  useEffect(() => { setForm(order ?? {}); setErrors({}); }, [order]);

  const upd = (key: string, val: any) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const balanceDue = Math.max(0, (order?.total || 0) - (order?.paidAmount || 0));

  const parseDate = (str?: string) => {
    if (!str) return undefined;
    const d = new Date(str);
    return isNaN(d.getTime()) ? undefined : d;
  };

  // Format date as YYYY-MM-DD using local timezone (avoids UTC offset shifting to previous day)
  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleRecordPayment = async (payment: PaymentRecord) => {
    if (!order) return;
    try {
      const newPaidAmount = (order.paidAmount || 0) + payment.amount;
      await purchaseOrderService.updatePurchaseOrder(order.id, {
        paidAmount: newPaidAmount,
        paymentMethod: payment.paymentMethod,
      } as Partial<PurchaseOrder>);
      toast({ title: 'Payment Recorded', description: `₹${payment.amount.toFixed(2)} recorded successfully.`, variant: 'success' });
      onRefresh?.();
      onClose();
    } catch {
      throw new Error('Failed to record payment');
    }
  };

  const handleApprove = async () => {
    if (!order) return;
    try {
      await purchaseOrderService.approvePurchaseOrder(order.id, 'current-user');
      toast({ title: 'Approved', description: `${order.poNumber} approved successfully.`, variant: 'success' });
      onRefresh?.();
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to approve order.', variant: 'destructive' });
    }
  };

  const handleMarkDelivered = async () => {
    if (!order) return;
    try {
      await purchaseOrderService.markPurchaseOrderDelivered(order.id, formatLocalDate(new Date()));
      toast({ title: 'Delivered', description: `${order.poNumber} marked as delivered.`, variant: 'success' });
      onRefresh?.();
      onClose();
    } catch {
      toast({ title: 'Error', description: 'Failed to mark as delivered.', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!form.vendorName?.trim()) {
      setErrors({ vendorName: 'Vendor is required' });
      return;
    }
    setSaving(true);
    try {
      // Ensure total is computed from items before saving
      const items = form.items || [];
      const computedTotal = round2(items.reduce((s, i) => s + (i.subtotal || 0), 0));
      const dataToSave = {
        ...form,
        total: computedTotal,
        orderDate: form.orderDate || formatLocalDate(new Date()),
        createdBy: form.createdBy || displayName || '',
      } as PurchaseOrder;
      onSave(dataToSave);
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

  // Vendor selection for edit mode
  const selectedVendor: EntityOption | null = form.vendorName ? {
    id: form.vendorId || '',
    name: form.vendorName || '',
    phone: form.vendorPhone || '',
    email: form.vendorEmail || '',
    address: form.vendorAddress || '',
    contactPerson: form.vendorContact || '',
  } : null;

  // Scanner toggle for add mode
  const [showScanner, setShowScanner] = useState(false);

  // Computed totals for add mode
  const addItems = form.items || [];
  const subtotal = useMemo(() => round2(addItems.reduce((s, i) => s + (i.subtotal || 0), 0)), [addItems]);
  const total = subtotal; // POs typically don't add GST upfront — vendor invoice has tax

  // Handle add-mode item from autosuggest
  const handleAddItem = useCallback((stockItem: any) => {
    const currentItems = form.items || [];
    const existing = currentItems.findIndex((i) => i.item_id === stockItem.id || i.name === stockItem.name);
    if (existing >= 0) {
      const updated = [...currentItems];
      updated[existing] = {
        ...updated[existing],
        qty: updated[existing].qty + 1,
        subtotal: round2((updated[existing].qty + 1) * updated[existing].unitPrice),
      };
      upd('items', updated);
    } else {
      upd('items', [...currentItems, {
        item_id: stockItem.id,
        name: stockItem.name,
        qty: 1,
        unitPrice: stockItem.unitPrice,
        discount: 0,
        subtotal: stockItem.unitPrice,
        saleUnit: stockItem.saleUnit,
      }]);
    }
  }, [form.items]);

  // Handle scanned item for add mode
  const handleScannedItem = useCallback((item: any) => {
    handleAddItem({
      id: item.id,
      name: item.name,
      unitPrice: item.unitPrice || 0,
      saleUnit: item.saleUnit,
    });
  }, [handleAddItem]);

  return (
    <>
      <Sheet open={!!order || mode === 'add'} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent side="right" className="w-full sm:w-[80vw] sm:max-w-[80vw] p-0 flex flex-col h-full gap-0 bg-background">

          {/* ── ADD MODE — POS-style layout ──────────────── */}
          {mode === 'add' ? (
            <>
              {/* Top Bar */}
              <div className="flex items-center justify-between px-5 h-14 border-b border-border bg-background shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-bold text-foreground">New Purchase Order</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border pointer-events-none">
                    {addItems.length} {addItems.length === 1 ? 'item' : 'items'}
                  </Badge>
                  <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Main Content — Cart (left) + Details (right) */}
              <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">

                {/* LEFT — Items Cart */}
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
                          existingItems={addItems.map(i => i.item_id || i.name)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Cart items */}
                  <div className="lg:flex-1 lg:overflow-y-auto p-4 min-h-[200px]">
                    {addItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center min-h-[200px] h-full text-center">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                          <Package className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">No items added</p>
                        <p className="text-xs text-muted-foreground mt-1">Search or scan items to add them here</p>
                      </div>
                    ) : (
                      <OrderItemsTable
                        items={addItems}
                        editable
                        onItemsChange={(items) => upd('items', items)}
                        compact
                      />
                    )}
                  </div>
                </div>

                {/* RIGHT — Vendor + Details + Summary */}
                <div className="flex flex-col lg:flex-[2] lg:min-h-0 lg:overflow-y-auto bg-muted/10 border-t lg:border-t-0 border-border">
                  <div className="p-4 space-y-4">

                    {/* Vendor */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor</p>
                      <EntityAutosuggest
                        entities={vendors}
                        value={selectedVendor}
                        onSelect={(entity) => {
                          if (entity) {
                            upd('vendorId', entity.id);
                            upd('vendorName', entity.name);
                            upd('vendorPhone', entity.phone || '');
                            upd('vendorEmail', entity.email || '');
                            upd('vendorAddress', entity.address || '');
                            upd('vendorContact', entity.contactPerson || '');
                          } else {
                            upd('vendorName', '');
                            upd('vendorPhone', '');
                            upd('vendorEmail', '');
                            upd('vendorAddress', '');
                            upd('vendorContact', '');
                          }
                        }}
                        placeholder="Search vendors..."
                        error={errors.vendorName}
                      />
                      {form.vendorName && (
                        <div className="bg-muted/50 rounded-lg p-2.5 text-xs text-muted-foreground space-y-0.5">
                          {form.vendorPhone && <p>{form.vendorPhone}</p>}
                          {form.vendorEmail && <p>{form.vendorEmail}</p>}
                          {form.vendorAddress && <p>{form.vendorAddress}</p>}
                        </div>
                      )}
                    </div>

                    {/* Order Dates */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Details</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Order Date</label>
                          <DatePicker
                            date={parseDate(form.orderDate || formatLocalDate(new Date()))}
                            onDateChange={(d) => upd('orderDate', d ? formatLocalDate(d) : '')}
                            placeholder="Order date"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Delivery Date</label>
                          <DatePicker
                            date={parseDate(form.deliveryDate)}
                            onDateChange={(d) => upd('deliveryDate', d ? formatLocalDate(d) : '')}
                            placeholder="Delivery date"
                          />
                        </div>
                      </div>
                      <div className="space-y-1 relative">
                        <label className="text-xs text-muted-foreground">Delivery Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                          <Input
                            value={form.shippingAddress || ''}
                            onChange={(e) => {
                              upd('shippingAddress', e.target.value);
                              setLocationQuery(e.target.value);
                              setShowLocationDropdown(true);
                            }}
                            onFocus={() => {
                              setLocationQuery(form.shippingAddress || '');
                              setShowLocationDropdown(true);
                            }}
                            onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                            placeholder="Search location..."
                            className="text-sm pl-8"
                          />
                        </div>
                        {showLocationDropdown && filteredLocations.length > 0 && (
                          <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
                            {filteredLocations.map((loc) => (
                              <button
                                key={loc.id}
                                type="button"
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60 transition-colors"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  upd('shippingAddress', loc.name);
                                  setShowLocationDropdown(false);
                                  setLocationQuery('');
                                }}
                              >
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{loc.name}</p>
                                  <p className="text-xs text-muted-foreground">{loc.detail}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summary</p>
                      <div className="rounded-lg border border-border bg-background p-3 space-y-2.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal ({addItems.length} items)</span>
                          <span className="font-medium">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-border pt-2.5">
                          <span className="text-sm font-semibold">Total</span>
                          <span className="text-lg font-bold flex items-center text-primary">
                            <IndianRupee className="h-4 w-4" />
                            {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Method</p>
                      <div className="grid grid-cols-3 gap-2">
                        {PAYMENT_METHODS_PO.map((m) => (
                          <button
                            key={m.value}
                            onClick={() => upd('paymentMethod', m.value)}
                            className="flex flex-col items-center gap-1.5 py-2.5 rounded-lg border transition-all text-xs font-semibold hover:bg-muted/50"
                            style={form.paymentMethod === m.value ? { backgroundColor: PRIMARY, borderColor: PRIMARY, color: '#fff' } : {}}
                          >
                            <m.icon className="h-4 w-4" />
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</p>
                      <Textarea
                        value={form.notes || ''}
                        onChange={(e) => upd('notes', e.target.value)}
                        placeholder="Special instructions, remarks..."
                        className="text-sm min-h-[60px]"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border bg-background shrink-0">
                <div className="w-full lg:max-w-md lg:ml-auto space-y-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving || addItems.length === 0}
                    className="w-full h-12 text-base font-bold text-white gap-2"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Create PO — ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="w-full text-xs" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          ) : (
          <>
          {/* ── VIEW / EDIT — Standard header + content + footer ── */}

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-foreground truncate">
                  {mode === 'edit' ? `Edit — ${order?.poNumber}` : order?.poNumber}
                </h2>
                {mode === 'view' && order && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.vendorName} · {order.orderDate}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {mode === 'view' && onDelete && (
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs">
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              )}
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

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
                  {order.paymentMethod && (
                    <Badge className="bg-slate-100 text-slate-700 border-0 text-xs pointer-events-none">
                      {order.paymentMethod}
                    </Badge>
                  )}
                  {order.approvedBy && (
                    <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" /> Approved by {order.approvedBy}
                    </span>
                  )}
                </div>

                {/* Vendor + Summary side-by-side */}
                <div className="grid lg:grid-cols-[1fr_1fr] gap-5 lg:items-stretch">
                  {/* Left: Vendor card + Order details */}
                  <div className="space-y-4">
                    {/* Vendor card */}
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Vendor</span>
                      </div>
                      <div className="p-4">
                        <p className="text-[13px] font-semibold text-foreground">{order.vendorName}</p>
                        {order.vendorContact && (
                          <p className="text-xs text-muted-foreground mt-0.5">{order.vendorContact}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {[order.vendorPhone, order.vendorEmail].filter(Boolean).join(' · ') || 'No contact info'}
                        </p>
                        {order.vendorAddress && (
                          <p className="text-xs text-muted-foreground mt-0.5">{order.vendorAddress}</p>
                        )}
                      </div>
                    </div>

                    {/* Order details table — alternating rows */}
                    <div className="rounded-lg border border-border overflow-hidden">
                      <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Order Details</span>
                      </div>
                      {[
                        ['Order Date', order.orderDate],
                        ['Delivery Date', order.deliveryDate || '—'],
                        ['Fulfilment Date', order.fulfilmentDate || '—'],
                        ['Shipping Address', order.shippingAddress || '—'],
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
                      subtotal={order.total}
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
                      <Package className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Order Items</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <OrderItemsTable items={order.items} />
                </div>

                {/* Remarks timeline */}
                {order.remarks && order.remarks.length > 0 && (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Remarks</span>
                    </div>
                    <div className="divide-y divide-border/50">
                      {order.remarks.map((r, i) => (
                        <div key={i} className={`px-4 py-3 ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.02]'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-foreground">{r.user}</span>
                            <span className="text-[10px] text-muted-foreground">{r.date}</span>
                          </div>
                          <p className="text-xs text-foreground/80 leading-relaxed">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {order.notes && (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                      <IndianRupee className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Notes</span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-xs text-foreground leading-relaxed">{order.notes}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── EDIT MODE (existing PO) ──────────────────── */}
            {mode === 'edit' && (
              <>
                {/* Vendor */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Vendor</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <EntityAutosuggest
                      entities={vendors}
                      value={selectedVendor}
                      onSelect={(entity) => {
                        if (entity) {
                          upd('vendorId', entity.id);
                          upd('vendorName', entity.name);
                          upd('vendorPhone', entity.phone || '');
                          upd('vendorEmail', entity.email || '');
                          upd('vendorAddress', entity.address || '');
                          upd('vendorContact', entity.contactPerson || '');
                        } else {
                          upd('vendorName', '');
                          upd('vendorPhone', '');
                          upd('vendorEmail', '');
                          upd('vendorAddress', '');
                          upd('vendorContact', '');
                        }
                      }}
                      placeholder="Search vendors..."
                      error={errors.vendorName}
                      label="Vendor"
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Items</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <AutosuggestInput
                      onSelect={(stockItem) => {
                        const newItem: PurchaseOrderItem = {
                          item_id: stockItem.id,
                          name: stockItem.name,
                          qty: 1,
                          unitPrice: stockItem.unitPrice,
                          discount: 0,
                          subtotal: stockItem.unitPrice,
                          saleUnit: stockItem.saleUnit,
                        };
                        upd('items', [...(form.items || []), newItem]);
                      }}
                      placeholder="Search items to add..."
                    />
                    <OrderItemsTable
                      items={form.items || []}
                      editable
                      onItemsChange={(items) => upd('items', items)}
                    />
                  </div>
                </div>

                {/* Order Details */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                    <IndianRupee className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Order Details</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Status</Label>
                        <Select value={form.status || 'Pending'} onValueChange={(v) => upd('status', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['Pending', 'Approved', 'Delivered', 'Cancelled'].map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Order Date</Label>
                        <DatePicker
                          date={parseDate(form.orderDate || formatLocalDate(new Date()))}
                          onDateChange={(d) => upd('orderDate', d ? formatLocalDate(d) : '')}
                          placeholder="Order date"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Delivery Date</Label>
                        <DatePicker
                          date={parseDate(form.deliveryDate)}
                          onDateChange={(d) => upd('deliveryDate', d ? formatLocalDate(d) : '')}
                          placeholder="Delivery date"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Shipping Address</Label>
                        <Input value={form.shippingAddress || ''}
                          onChange={(e) => upd('shippingAddress', e.target.value)}
                          placeholder="Shipping address" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Payment Method</Label>
                        <Select value={form.paymentMethod || ''} onValueChange={(v) => upd('paymentMethod', v)}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque', 'Net-30', 'Net-60', 'COD'].map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Notes</Label>
                      <Textarea value={form.notes || ''} onChange={(e) => upd('notes', e.target.value)} rows={2} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer — Edit mode */}
          {mode === 'edit' && (
            <div className="border-t border-border px-6 py-4 flex items-center gap-3 flex-shrink-0">
              <Button variant="outline" onClick={onClose} className="h-9 text-xs">Cancel</Button>
              <Button onClick={handleSave} disabled={saving}
                className="h-9 text-xs ml-auto">
                {saving ? 'Saving...' : <><Save className="h-3.5 w-3.5 mr-1" /> Update PO</>}
              </Button>
            </div>
          )}

          {/* Footer — View mode */}
          {mode === 'view' && (
            <div className="border-t border-border px-6 py-4 flex items-center gap-3 flex-shrink-0">
              {order?.status === 'Pending' && (
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={handleApprove}>
                  <ShieldCheck className="h-3.5 w-3.5" /> Approve
                </Button>
              )}
              {order?.status === 'Approved' && (
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1" onClick={handleMarkDelivered}>
                  <Truck className="h-3.5 w-3.5" /> Mark Delivered
                </Button>
              )}
              {balanceDue > 0 && (
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1"
                  onClick={() => setShowPaymentDialog(true)}>
                  <CreditCard className="h-3.5 w-3.5" /> Record Payment
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1"
                onClick={() => setShowPreview(true)}>
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
              <Button size="sm" className="h-9 text-xs ml-auto gap-1"
                onClick={() => onSave({ ...order! })}>
                <Edit3 className="h-3.5 w-3.5" /> Edit PO
              </Button>
            </div>
          )}
          </>
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
          entityLabel={order.poNumber}
        />
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete ${order?.poNumber ?? 'order'}?`}
        description="This will permanently delete this purchase order. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {order && showPreview && (
        <DocumentPreviewDialog
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          doc={{
            documentType: 'Purchase Order',
            documentNumber: order.poNumber,
            status: order.status,
            partyLabel: 'Vendor',
            partyName: order.vendorName,
            partyEmail: order.vendorEmail,
            partyPhone: order.vendorPhone,
            partyAddress: order.vendorAddress,
            details: [
              { label: 'Order Date', value: order.orderDate || '—' },
              { label: 'Delivery Date', value: order.deliveryDate || '—' },
              { label: 'Payment', value: order.paymentMethod || '—' },
              { label: 'Approved By', value: order.approvedBy || '—' },
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
          }}
        />
      )}
    </>
  );
}
