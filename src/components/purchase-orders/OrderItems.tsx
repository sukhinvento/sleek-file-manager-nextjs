import { Package, Plus, QrCode, Scan, Camera, AlertCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AutosuggestInput } from './AutosuggestInput';
import { PurchaseOrderItem, StockItem } from '../../types/purchaseOrder';

interface OrderItemsProps {
  items: PurchaseOrderItem[];
  setItems: (items: PurchaseOrderItem[]) => void;
  selectedTaxSlab: number;
  showScanner: boolean;
  setShowScanner: (show: boolean) => void;
  isQuotation: boolean;
  isPartiallyFulfilled: boolean;
  isReadOnly: boolean;
  updateItem: (index: number, field: string, value: any) => void;
  addItem: (stockItem?: StockItem) => void;
  removeItem: (index: number) => void;
}

export const OrderItems = ({
  items,
  selectedTaxSlab,
  showScanner,
  setShowScanner,
  isQuotation,
  isPartiallyFulfilled,
  isReadOnly,
  updateItem,
  addItem,
  removeItem
}: OrderItemsProps) => {
  const subtotal = items.reduce((s, i) => s + (i.subtotal ?? 0), 0);
  const totalTax = items.reduce((s, i) => {
    const base = (i.subtotal ?? 0);
    return s + base * ((selectedTaxSlab || 0) / 100);
  }, 0);
  const grandTotal = subtotal + totalTax;

  return (
    <div className="flex flex-col h-full border border-border rounded-xl overflow-hidden bg-card">
      {/* Compact header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Package className="h-4 w-4 text-primary" />
          Order Items
          <span className="text-xs font-normal text-muted-foreground ml-1">({items.length} line{items.length !== 1 ? 's' : ''})</span>
        </div>
        {!isReadOnly && isQuotation && (
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={() => setShowScanner(!showScanner)}>
              <QrCode className="h-3 w-3 mr-1" />
              Scan
            </Button>
            <Button size="sm" className="h-7 px-2.5 text-xs action-button-primary" onClick={() => addItem()}>
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        )}
      </div>

      {isPartiallyFulfilled && (
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-warning-foreground bg-[hsl(var(--status-pending-bg))] border-b border-border flex-shrink-0">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          Partially fulfilled — only quantity adjustments for returns or damaged items are allowed.
        </div>
      )}

      {showScanner && isQuotation && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted/50 flex-shrink-0">
          <span className="text-xs font-medium text-muted-foreground">Scan via:</span>
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs"><QrCode className="h-3 w-3 mr-1" />QR</Button>
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs"><Scan className="h-3 w-3 mr-1" />Barcode</Button>
          <Button variant="outline" size="sm" className="h-6 px-2 text-xs"><Camera className="h-3 w-3 mr-1" />RFID</Button>
        </div>
      )}

      {/* Dense table */}
      <div className="dense-table-wrap flex-1">
        <table className="dense-table">
          <thead>
            <tr>
              <th style={{ width: 28 }}>#</th>
              <th>Product / SKU</th>
              <th style={{ width: 80, textAlign: 'right' }}>Qty</th>
              <th style={{ width: 72 }}>Unit</th>
              {!isReadOnly && <th style={{ width: 96, textAlign: 'right' }}>Price</th>}
              {!isReadOnly && <th style={{ width: 72, textAlign: 'right' }}>Disc %</th>}
              <th style={{ width: 100, textAlign: 'right' }}>Subtotal</th>
              {!isReadOnly && <th style={{ width: 32 }}></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item: PurchaseOrderItem, index: number) => (
              <tr key={index}>
                <td className="text-muted-foreground">{String(index + 1).padStart(2, '0')}</td>

                <td className="item-name">
                  {isQuotation ? (
                    <AutosuggestInput
                      value={item.name}
                      onChange={(value) => updateItem(index, 'name', value)}
                      onSelect={(stockItem) => {
                        updateItem(index, 'name', stockItem.name);
                        updateItem(index, 'unitPrice', stockItem.unitPrice);
                        updateItem(index, 'saleUnit', stockItem.saleUnit);
                        updateItem(index, 'qty', 1);
                        updateItem(index, 'discount', 0);
                      }}
                      placeholder="Type to search…"
                    />
                  ) : (
                    <span className="font-medium">{item.name}</span>
                  )}
                </td>

                <td style={{ textAlign: 'right' }}>
                  {isReadOnly ? (
                    item.qty
                  ) : (
                    <input
                      className="dense-input text-right"
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                      style={{ width: 64, marginLeft: 'auto' }}
                    />
                  )}
                </td>

                <td className="text-muted-foreground text-xs">{item.saleUnit || 'unit'}</td>

                {!isReadOnly && (
                  <td style={{ textAlign: 'right' }}>
                    <input
                      className="dense-input text-right"
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                      disabled={isPartiallyFulfilled}
                      style={{ width: 80, marginLeft: 'auto' }}
                    />
                  </td>
                )}

                {!isReadOnly && (
                  <td style={{ textAlign: 'right' }}>
                    <input
                      className="dense-input text-right"
                      type="number"
                      value={item.discount}
                      onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                      disabled={isPartiallyFulfilled}
                      style={{ width: 56, marginLeft: 'auto' }}
                    />
                  </td>
                )}

                <td style={{ textAlign: 'right' }}>
                  <b>₹{(item.subtotal ?? 0).toFixed(2)}</b>
                </td>

                {!isReadOnly && (
                  <td>
                    <button
                      onClick={() => removeItem(index)}
                      disabled={isPartiallyFulfilled}
                      className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}

            {/* Add row inline */}
            {isQuotation && !isReadOnly && (
              <tr>
                <td colSpan={!isReadOnly ? 8 : 4}>
                  <button
                    onClick={() => addItem()}
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
        {selectedTaxSlab > 0 && (
          <span><span className="total-label">Tax ({selectedTaxSlab}%) </span><span className="total-val">₹{totalTax.toFixed(2)}</span></span>
        )}
        <span><span className="total-label">Total </span><span className="total-val" style={{ color: 'hsl(var(--primary))' }}>₹{grandTotal.toFixed(2)}</span></span>
      </div>
    </div>
  );
};
