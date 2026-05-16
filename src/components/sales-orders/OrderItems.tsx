import { Package, Plus, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { SalesOrderItem } from '../../types/inventory';

interface OrderItemsProps {
  items: SalesOrderItem[];
  isEditMode?: boolean;
  isReadOnly?: boolean;
  updateItem: (index: number, field: string, value: any) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
}

export const OrderItems = ({
  items,
  isEditMode = false,
  isReadOnly = false,
  updateItem,
  addItem,
  removeItem
}: OrderItemsProps) => {
  const canEdit = isEditMode && !isReadOnly;
  const subtotal = items.reduce((s, i) => s + (i.subtotal ?? 0), 0);

  return (
    <div className="flex flex-col h-full border border-border rounded-xl overflow-hidden bg-card">
      {/* Compact header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Package className="h-4 w-4 text-primary" />
          Order Items
          <span className="text-xs font-normal text-muted-foreground ml-1">({items.length} line{items.length !== 1 ? 's' : ''})</span>
        </div>
        {canEdit && (
          <Button size="sm" className="h-7 px-2.5 text-xs action-button-primary" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        )}
      </div>

      {/* Dense table */}
      <div className="dense-table-wrap flex-1">
        <table className="dense-table">
          <thead>
            <tr>
              <th style={{ width: 28 }}>#</th>
              <th>Product</th>
              <th style={{ width: 80, textAlign: 'right' }}>Qty</th>
              <th style={{ width: 72 }}>Unit</th>
              {(isEditMode || !isReadOnly) && <th style={{ width: 96, textAlign: 'right' }}>Price</th>}
              {(isEditMode || !isReadOnly) && <th style={{ width: 72, textAlign: 'right' }}>Disc %</th>}
              <th style={{ width: 100, textAlign: 'right' }}>Subtotal</th>
              {canEdit && <th style={{ width: 32 }}></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item: SalesOrderItem, index: number) => (
              <tr key={index}>
                <td className="text-muted-foreground">{String(index + 1).padStart(2, '0')}</td>

                <td className="item-name">
                  {canEdit ? (
                    <input
                      className="dense-input"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="Product name…"
                    />
                  ) : (
                    <span className="font-medium">{item.name}</span>
                  )}
                </td>

                <td style={{ textAlign: 'right' }}>
                  {canEdit ? (
                    <input
                      className="dense-input text-right"
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                      style={{ width: 64, marginLeft: 'auto' }}
                    />
                  ) : (
                    item.qty
                  )}
                </td>

                <td className="text-muted-foreground text-xs">{item.saleUnit || 'unit'}</td>

                {(isEditMode || !isReadOnly) && (
                  <td style={{ textAlign: 'right' }}>
                    {canEdit ? (
                      <input
                        className="dense-input text-right"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                        style={{ width: 80, marginLeft: 'auto' }}
                      />
                    ) : (
                      `₹${item.unitPrice?.toFixed(2)}`
                    )}
                  </td>
                )}

                {(isEditMode || !isReadOnly) && (
                  <td style={{ textAlign: 'right' }}>
                    {canEdit ? (
                      <input
                        className="dense-input text-right"
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                        style={{ width: 56, marginLeft: 'auto' }}
                      />
                    ) : (
                      `${item.discount}%`
                    )}
                  </td>
                )}

                <td style={{ textAlign: 'right' }}>
                  <b>₹{(item.subtotal ?? 0).toFixed(2)}</b>
                </td>

                {canEdit && (
                  <td>
                    <button
                      onClick={() => removeItem(index)}
                      className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {canEdit && (
              <tr>
                <td colSpan={canEdit ? 8 : 5}>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1.5 w-full text-xs text-muted-foreground hover:text-primary transition-colors py-0.5 px-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add line
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sticky totals footer */}
      <div className="dense-footer flex-shrink-0">
        <span><span className="total-label">Subtotal </span><span className="total-val">₹{subtotal.toFixed(2)}</span></span>
        <span><span className="total-label">Total </span><span className="total-val" style={{ color: 'hsl(var(--primary))' }}>₹{subtotal.toFixed(2)}</span></span>
      </div>
    </div>
  );
};
