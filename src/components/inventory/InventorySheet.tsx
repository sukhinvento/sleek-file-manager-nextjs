import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// Card removed — using tinted section headers pattern
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  X, Save, Edit3, Trash2, Package, AlertCircle,
  MapPin, Building2, FlaskConical, Tag, Box, IndianRupee,
  ArrowLeft, RotateCcw,
} from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { BarcodeQRManager } from './BarcodeQRManager';
import { VendorAutosuggestInput } from './VendorAutosuggestInput';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/hooks/use-toast';

// Design tokens (matching DoctorSheet)
const PRIMARY = '#385a9f';

const CATEGORIES = ['Medical Supplies', 'Equipment', 'Pharmaceuticals', 'Consumables', 'Safety', 'Surgical', 'Diagnostics'];
const SALE_UNITS = ['Single Unit', 'Strip', 'Box', 'Bottle', 'Vial', 'Pack', 'Sachet'] as const;

interface InventorySheetProps {
  item: InventoryItem | null;
  mode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  onDelete?: (itemId: string) => void;
}

// Helper sub-components
const FieldGroup = ({
  label, required, children, error,
}: {
  label: string; required?: boolean; children: React.ReactNode; error?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-foreground">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" /> {error}
      </p>
    )}
  </div>
);

const getStockStatus = (item: InventoryItem) => {
  if (item.currentStock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' };
  if (item.currentStock < item.minStock * 0.5) return { label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' };
  if (item.currentStock <= item.minStock) return { label: 'Low', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  return { label: 'Normal', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
};

const getStockColor = (item: InventoryItem) => {
  if (item.currentStock === 0) return '#ef4444';
  if (item.currentStock <= item.minStock) return '#f59e0b';
  return '#059669';
};

const EMPTY_ITEM: Partial<InventoryItem> = {
  name: '', category: '', sku: '', currentStock: 0, minStock: 0, maxStock: 0,
  unitPrice: 0, supplier: '', location: '', description: '', batchNumber: '',
  saleUnit: 'Single Unit', barcode: '', barcodeType: 'EAN-13', qrCode: '', rfidTag: '',
  manufacturer: '',
};

export default function InventorySheet({ item, mode, onClose, onSave, onDelete }: InventorySheetProps) {
  const [form, setForm] = useState<Partial<InventoryItem>>(item ?? { ...EMPTY_ITEM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEdit = mode === 'edit' || mode === 'add';

  useEffect(() => { setForm(item ?? { ...EMPTY_ITEM }); setErrors({}); }, [item]);

  const upd = (key: string, val: any) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = 'Item name is required';
    if (!form.sku?.trim()) e.sku = 'SKU is required';
    if (!form.category) e.category = 'Category is required';
    if ((form.unitPrice ?? 0) <= 0) e.unitPrice = 'Price must be greater than 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const inventoryItem: InventoryItem = {
        id: item?.id || Date.now().toString(),
        name: form.name || '',
        category: form.category || '',
        sku: form.sku || '',
        currentStock: form.currentStock || 0,
        minStock: form.minStock || 0,
        maxStock: form.maxStock || 0,
        unitPrice: form.unitPrice || 0,
        supplier: form.supplier || '',
        manufacturer: form.manufacturer || '',
        location: form.location || '',
        description: form.description || '',
        batchNumber: form.batchNumber || '',
        expiryDate: form.expiryDate,
        saleUnit: form.saleUnit,
        barcode: form.barcode || '',
        barcodeType: form.barcodeType,
        qrCode: form.qrCode,
        rfidTag: form.rfidTag || '',
        rfidEnabled: form.rfidEnabled,
        trackingEnabled: form.trackingEnabled,
        serialNumbers: form.serialNumbers,
      };
      await onSave(inventoryItem);
    } catch {
      toast({ title: 'Error', description: 'Failed to save item.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (item && onDelete) {
      onDelete(item.id);
      onClose();
    }
  };

  return (
    <>
      <Sheet open={!!item || mode === 'add'} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent side="right" className="w-full sm:w-[680px] sm:max-w-[680px] p-0 flex flex-col h-full bg-background">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {mode !== 'add' && item && (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-base font-bold text-foreground truncate">
                  {mode === 'add' ? 'Add New Item' : mode === 'edit' ? `Edit — ${item?.name}` : item?.name}
                </h2>
                {mode === 'view' && item && (
                  <p className="text-xs text-muted-foreground mt-0.5">SKU: {item.sku} · {item.category}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {mode === 'view' && (
                <>
                  {onDelete && (
                    <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs">
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  )}
                </>
              )}
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* ── VIEW MODE ───────────────────────────────────── */}
            {mode === 'view' && item && (
              <>
                {/* Status badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getStockStatus(item).color} border text-xs font-semibold pointer-events-none`}>
                    {getStockStatus(item).label}
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-700 border-0 text-xs pointer-events-none">
                    {item.category}
                  </Badge>
                  {item.saleUnit && (
                    <Badge className="bg-purple-50 text-purple-700 border-0 text-xs pointer-events-none">
                      {item.saleUnit}
                    </Badge>
                  )}
                </div>

                {/* Stat cards row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="p-3 text-center bg-card">
                      <Package className="h-4 w-4 mx-auto mb-1.5" style={{ color: getStockColor(item) }} />
                      <p className="text-lg font-bold" style={{ color: getStockColor(item) }}>
                        {item.currentStock}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Current Stock</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="p-3 text-center bg-card">
                      <AlertCircle className="h-4 w-4 mx-auto mb-1.5 text-amber-500" />
                      <p className="text-lg font-bold text-foreground">{item.minStock}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Min Level</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="p-3 text-center bg-card">
                      <IndianRupee className="h-4 w-4 mx-auto mb-1.5" className="text-primary" />
                      <p className="text-lg font-bold text-foreground">
                        ₹{item.unitPrice.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Unit Price</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Description</span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-xs text-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                )}

                {/* Details table */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                    <Box className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Item Details</span>
                  </div>
                  {[
                    ['Category', item.category],
                    ['Batch Number', item.batchNumber || '—'],
                    ['Location', item.location || '—'],
                    ['Manufacturer', item.manufacturer || '—'],
                    ['Supplier', item.supplier || '—'],
                    ['Sale Unit', item.saleUnit || '—'],
                    ['Max Stock', item.maxStock > 0 ? String(item.maxStock) : '—'],
                    ['Expiry Date', item.expiryDate || '—'],
                  ].map(([label, value], idx) => (
                    <div key={label} className={`flex px-4 py-2.5 border-b border-border/50 last:border-0 ${idx % 2 === 0 ? 'bg-card' : 'bg-primary/[0.02]'}`}>
                      <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{label}</span>
                      <span className="text-xs font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Barcode/QR Section */}
                {(item.barcode || item.qrCode || item.rfidTag) && (
                  <BarcodeQRManager
                    itemId={item.id}
                    itemName={item.name}
                    sku={item.sku}
                    barcode={item.barcode}
                    barcodeType={item.barcodeType as any}
                    qrCode={item.qrCode}
                    rfidTag={item.rfidTag}
                    onUpdate={() => {}}
                    disabled
                  />
                )}
              </>
            )}

            {/* ── EDIT / ADD MODE ─────────────────────────────── */}
            {isEdit && (
              <>
                {/* Basic Info */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Basic Information</span>
                  </div>
                  <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FieldGroup label="Item Name" required error={errors.name}>
                          <Input value={form.name || ''} onChange={(e) => upd('name', e.target.value)}
                            placeholder="Enter item name" className={errors.name ? 'border-red-500' : ''} />
                        </FieldGroup>
                        <FieldGroup label="SKU" required error={errors.sku}>
                          <Input value={form.sku || ''} onChange={(e) => upd('sku', e.target.value)}
                            placeholder="Enter SKU" className={errors.sku ? 'border-red-500' : ''} />
                        </FieldGroup>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FieldGroup label="Category" required error={errors.category}>
                          <Select value={form.category || ''} onValueChange={(v) => upd('category', v)}>
                            <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FieldGroup>
                        <FieldGroup label="Description">
                          <Input value={form.description || ''} onChange={(e) => upd('description', e.target.value)}
                            placeholder="Brief description" />
                        </FieldGroup>
                      </div>
                  </div>
                </div>

                {/* Stock & Pricing */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                    <IndianRupee className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Stock & Pricing</span>
                  </div>
                  <div className="p-4 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <FieldGroup label="Current Stock">
                          <Input type="number" value={form.currentStock ?? 0}
                            onChange={(e) => upd('currentStock', parseInt(e.target.value) || 0)} />
                        </FieldGroup>
                        <FieldGroup label="Min Stock">
                          <Input type="number" value={form.minStock ?? 0}
                            onChange={(e) => upd('minStock', parseInt(e.target.value) || 0)} />
                        </FieldGroup>
                        <FieldGroup label="Max Stock">
                          <Input type="number" value={form.maxStock ?? 0}
                            onChange={(e) => upd('maxStock', parseInt(e.target.value) || 0)} />
                        </FieldGroup>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FieldGroup label="Unit Price" required error={errors.unitPrice}>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                            <Input type="number" step="0.01" value={form.unitPrice ?? 0}
                              onChange={(e) => upd('unitPrice', parseFloat(e.target.value) || 0)}
                              className={`pl-7 ${errors.unitPrice ? 'border-red-500' : ''}`} />
                          </div>
                        </FieldGroup>
                        <FieldGroup label="Sale Unit">
                          <Select value={form.saleUnit || 'Single Unit'} onValueChange={(v) => upd('saleUnit', v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SALE_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FieldGroup>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FieldGroup label="Batch Number">
                          <Input value={form.batchNumber || ''} onChange={(e) => upd('batchNumber', e.target.value)}
                            placeholder="Enter batch number" />
                        </FieldGroup>
                        <FieldGroup label="Expiry Date">
                          <Input type="date" value={form.expiryDate || ''} onChange={(e) => upd('expiryDate', e.target.value)} />
                        </FieldGroup>
                      </div>
                  </div>
                </div>

                {/* Supplier & Location */}
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Supplier & Location</span>
                  </div>
                  <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FieldGroup label="Supplier">
                          <VendorAutosuggestInput
                            value={form.supplier || ''}
                            onChange={(v) => upd('supplier', v)}
                            onSelect={(vendor) => upd('supplier', vendor.name)}
                            placeholder="Search supplier..."
                          />
                        </FieldGroup>
                        <FieldGroup label="Manufacturer">
                          <Input value={form.manufacturer || ''} onChange={(e) => upd('manufacturer', e.target.value)}
                            placeholder="Enter manufacturer" />
                        </FieldGroup>
                      </div>
                      <FieldGroup label="Storage Location">
                        <Input value={form.location || ''} onChange={(e) => upd('location', e.target.value)}
                          placeholder="e.g., A1-B2, Room 101" />
                      </FieldGroup>
                  </div>
                </div>

                {/* Barcode & Tracking */}
                <BarcodeQRManager
                  itemId={form.id || 'new-item'}
                  itemName={form.name || 'New Item'}
                  sku={form.sku || ''}
                  barcode={form.barcode}
                  barcodeType={form.barcodeType as any}
                  qrCode={form.qrCode}
                  rfidTag={form.rfidTag}
                  onUpdate={(data) => {
                    setForm((prev) => ({
                      ...prev,
                      barcode: data.barcode,
                      barcodeType: data.barcodeType as any,
                      qrCode: data.qrCode,
                      rfidTag: data.rfidTag,
                      trackingEnabled: !!(data.barcode || data.qrCode || data.rfidTag),
                    }));
                  }}
                />
              </>
            )}
          </div>

          {/* Footer */}
          {isEdit && (
            <div className="border-t border-border px-6 py-4 flex items-center gap-3 flex-shrink-0">
              <Button variant="outline" onClick={onClose} className="h-9 text-xs">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}
                className="h-9 text-xs ml-auto">
                {saving ? (
                  <>
                    <div className="animate-spin h-3.5 w-3.5 mr-1 border-2 border-white border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5 mr-1" />
                    {mode === 'add' ? 'Create Item' : 'Update Item'}
                  </>
                )}
              </Button>
            </div>
          )}

          {mode === 'view' && (
            <div className="border-t border-border px-6 py-4 flex items-center gap-3 flex-shrink-0">
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1">
                <RotateCcw className="h-3.5 w-3.5" /> Stock History
              </Button>
              <Button size="sm" className="h-9 text-xs ml-auto gap-1"
                onClick={() => onSave({ ...item! })}>
                <Edit3 className="h-3.5 w-3.5" /> Edit Item
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete ${item?.name ?? 'item'}?`}
        description="This will permanently remove this item from inventory. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
