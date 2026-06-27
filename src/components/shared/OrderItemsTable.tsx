import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Package } from 'lucide-react';
import { OrderItem } from '@/types/shared';
import { DeletePopover } from '@/components/ui/delete-popover';

interface OrderItemsTableProps {
  items: OrderItem[];
  editable?: boolean;
  onItemsChange?: (items: OrderItem[]) => void;
  compact?: boolean;
  currency?: string;
}

export default function OrderItemsTable({
  items,
  editable = false,
  onItemsChange,
  compact = false,
  currency = '₹',
}: OrderItemsTableProps) {
  const updateItem = (index: number, updates: Partial<OrderItem>) => {
    if (!onItemsChange) return;
    const newItems = [...items];
    const item = { ...newItems[index], ...updates };
    item.subtotal = item.qty * item.unitPrice * (1 - (item.discount || 0) / 100);
    newItems[index] = item;
    onItemsChange(newItems);
  };

  const removeItem = (index: number) => {
    if (!onItemsChange) return;
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
          <Package className="h-5 w-5 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No items added</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {editable ? 'Search or scan items to add them here' : 'This order has no line items'}
        </p>
      </div>
    );
  }

  /* ── Compact mode for POS cart ── */
  if (compact) {
    return (
      <div className="divide-y divide-border">
        {items.map((item, index) => (
          <div key={item.id || index} className="flex items-center gap-3 py-3 px-1">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              {item.sku && <p className="text-xs text-muted-foreground">{item.sku}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">
                {currency}{fmt(item.unitPrice)} each
              </p>
            </div>
            {editable ? (
              <Input
                type="number" min={1} value={item.qty}
                onChange={(e) => updateItem(index, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-16 h-9 text-center text-sm font-medium"
              />
            ) : (
              <span className="text-sm text-muted-foreground">x{item.qty}</span>
            )}
            <span className="text-sm font-semibold w-20 text-right">{currency}{fmt(item.subtotal)}</span>
            {editable && (
              <button type="button" onClick={() => removeItem(index)}
                className="shrink-0 p-1 rounded hover:bg-red-50 transition-colors">
                <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  /* ── Full mode ── */
  const hasDiscount = editable || items.some(i => (i.discount || 0) > 0);

  return (
    <>
      {/* Mobile: card list */}
      <div className="sm:hidden space-y-2 p-2">
        {items.map((item, index) => (
          <div key={item.id || index} className="rounded-lg border border-border bg-background p-3 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm leading-tight">{item.name}</p>
                {item.sku && <p className="text-xs text-muted-foreground mt-0.5">{item.sku}</p>}
                {item.saleUnit && <p className="text-xs text-muted-foreground">{item.saleUnit}</p>}
              </div>
              {editable && (
                <DeletePopover
                  onConfirm={() => removeItem(index)}
                  title="Remove this item?"
                  description="It will be removed from the order."
                />
              )}
            </div>
            {editable ? (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Qty', field: 'qty' as const, value: item.qty, step: '1', min: 1, center: true },
                  { label: 'Price', field: 'unitPrice' as const, value: item.unitPrice, step: '0.01', min: 0, center: false },
                  { label: 'Disc%', field: 'discount' as const, value: item.discount, step: '0.5', min: 0, center: false },
                ].map(({ label, field, value, step, min, center }) => (
                  <div key={field}>
                    <label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</label>
                    <Input type="number" step={step} min={min} max={field === 'discount' ? 100 : undefined}
                      value={value}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        updateItem(index, { [field]: field === 'discount' ? Math.min(100, v) : Math.max(min, field === 'qty' ? (parseInt(e.target.value) || 1) : v) });
                      }}
                      className={`h-9 text-sm ${center ? 'text-center' : 'text-right'}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Qty: <span className="text-foreground font-medium">{item.qty}</span></span>
                <span>{currency}{fmt(item.unitPrice)}</span>
                {(item.discount || 0) > 0 && <span>-{item.discount}%</span>}
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-2">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-sm">{currency}{fmt(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: polished table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-primary/[0.06] border-b border-border">
              <th className="text-left px-3 py-2.5 font-semibold text-primary uppercase tracking-wider w-10">#</th>
              <th className="text-left px-3 py-2.5 font-semibold text-primary uppercase tracking-wider">Product</th>
              <th className="text-center px-3 py-2.5 font-semibold text-primary uppercase tracking-wider w-20">Qty</th>
              <th className="text-right px-3 py-2.5 font-semibold text-primary uppercase tracking-wider w-28">Unit Price</th>
              {hasDiscount && (
                <th className="text-right px-3 py-2.5 font-semibold text-primary uppercase tracking-wider w-20">Disc%</th>
              )}
              <th className="text-right px-3 py-2.5 font-semibold text-primary uppercase tracking-wider w-28">Subtotal</th>
              {editable && <th className="w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index} className={`border-b border-border/50 last:border-0 ${index % 2 === 0 ? 'bg-card' : 'bg-primary/[0.02]'}`}>
                <td className="px-3 py-2.5 text-muted-foreground">{index + 1}</td>
                <td className="px-3 py-2.5">
                  <p className="font-medium text-foreground text-[13px]">{item.name}</p>
                  {item.sku && <p className="text-[11px] text-muted-foreground mt-0.5">{item.sku}</p>}
                  {item.saleUnit && <p className="text-[11px] text-muted-foreground">{item.saleUnit}</p>}
                </td>
                <td className="px-3 py-2 text-center">
                  {editable ? (
                    <Input type="number" min="1" value={item.qty}
                      onChange={(e) => updateItem(index, { qty: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-16 h-8 text-center text-xs mx-auto" />
                  ) : (
                    <span className="text-foreground">{item.qty}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {editable ? (
                    <Input type="number" step="0.01" min="0" value={item.unitPrice}
                      onChange={(e) => updateItem(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-24 h-8 text-right text-xs ml-auto" />
                  ) : (
                    <span className="text-muted-foreground">{currency}{fmt(item.unitPrice)}</span>
                  )}
                </td>
                {hasDiscount && (
                  <td className="px-3 py-2 text-right">
                    {editable ? (
                      <Input type="number" step="0.5" min="0" max="100" value={item.discount}
                        onChange={(e) => updateItem(index, { discount: Math.min(100, parseFloat(e.target.value) || 0) })}
                        className="w-16 h-8 text-right text-xs ml-auto" />
                    ) : (
                      <span className="text-muted-foreground">{(item.discount || 0) > 0 ? `${item.discount}%` : '—'}</span>
                    )}
                  </td>
                )}
                <td className="px-3 py-2.5 text-right font-semibold text-foreground text-[13px]">
                  {currency}{fmt(item.subtotal)}
                </td>
                {editable && (
                  <td className="py-2 px-1">
                    <DeletePopover
                      onConfirm={() => removeItem(index)}
                      title="Remove this item?"
                      description="It will be removed from the order."
                      className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
