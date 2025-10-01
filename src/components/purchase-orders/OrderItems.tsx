import { Package, Plus, QrCode, Scan, Camera, AlertCircle, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Order Items
          </CardTitle>
          {!isReadOnly && (
            <div className="flex items-center gap-2">
              {isQuotation && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setShowScanner(!showScanner)}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Scanner
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addItem()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        
        {isPartiallyFulfilled && (
          <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            Order is partially fulfilled. You can only adjust quantities for returns or damaged items.
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {showScanner && isQuotation && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Scan Options:</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
              <Button variant="outline" size="sm">
                <Scan className="h-4 w-4 mr-2" />
                Barcode
              </Button>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                RFID
              </Button>
            </div>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                {!isReadOnly && <TableHead>Unit Price</TableHead>}
                {!isReadOnly && <TableHead>Discount</TableHead>}
                <TableHead>Subtotal</TableHead>
                {!isReadOnly && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: PurchaseOrderItem, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    {isQuotation ? (
                      <AutosuggestInput
                        value={item.name}
                        onChange={(value) => updateItem(index, 'name', value)}
                        onSelect={(stockItem) => {
                          // Update all item fields when a stock item is selected
                          updateItem(index, 'name', stockItem.name);
                          updateItem(index, 'unitPrice', stockItem.unitPrice);
                          updateItem(index, 'saleUnit', stockItem.saleUnit);
                          updateItem(index, 'qty', 1);
                          updateItem(index, 'discount', 0);
                        }}
                        placeholder="Search products..."
                      />
                    ) : (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isReadOnly ? (
                        <span>{item.qty}</span>
                      ) : (
                        <Input 
                          type="number" 
                          value={item.qty} 
                          onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                          className="w-20" 
                        />
                      )}
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 whitespace-nowrap">
                        {item.saleUnit || 'Unit'}
                      </span>
                    </div>
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.unitPrice} 
                        onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                        className="w-24"
                        disabled={isPartiallyFulfilled}
                      />
                    </TableCell>
                  )}
                  {!isReadOnly && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Input 
                          type="number" 
                          value={item.discount} 
                          onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                          className="w-16"
                          disabled={isPartiallyFulfilled}
                        />
                        <span className="text-sm">%</span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <span className="font-medium">₹{item.subtotal?.toFixed(2)}</span>
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeItem(index)}
                        disabled={isPartiallyFulfilled}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {isQuotation && (
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => addItem()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Button variant="outline" size="sm">
              <Scan className="h-4 w-4 mr-2" />
              Scan Product
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};