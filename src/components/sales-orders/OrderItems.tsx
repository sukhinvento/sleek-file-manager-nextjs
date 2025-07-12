import { Package, Plus, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Order Items
          </CardTitle>
          {isEditMode && !isReadOnly && (
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                {(isEditMode || !isReadOnly) && <TableHead>Unit Price</TableHead>}
                {(isEditMode || !isReadOnly) && <TableHead>Discount</TableHead>}
                <TableHead>Subtotal</TableHead>
                {isEditMode && !isReadOnly && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: SalesOrderItem, index: number) => (
                <TableRow key={index}>
                  <TableCell>
                    {isEditMode && !isReadOnly ? (
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        placeholder="Enter product name"
                      />
                    ) : (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditMode && !isReadOnly ? (
                      <Input 
                        type="number" 
                        value={item.qty} 
                        onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                        className="w-20" 
                      />
                    ) : (
                      <span>{item.qty}</span>
                    )}
                  </TableCell>
                  {(isEditMode || !isReadOnly) && (
                    <TableCell>
                      {isEditMode && !isReadOnly ? (
                        <Input 
                          type="number" 
                          value={item.unitPrice} 
                          onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                          className="w-24"
                        />
                      ) : (
                        <span>₹{item.unitPrice?.toFixed(2)}</span>
                      )}
                    </TableCell>
                  )}
                  {(isEditMode || !isReadOnly) && (
                    <TableCell>
                      {isEditMode && !isReadOnly ? (
                        <div className="flex items-center gap-1">
                          <Input 
                            type="number" 
                            value={item.discount} 
                            onChange={(e) => updateItem(index, 'discount', Number(e.target.value))}
                            className="w-16"
                          />
                          <span className="text-sm">%</span>
                        </div>
                      ) : (
                        <span>{item.discount}%</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <span className="font-medium">₹{item.subtotal?.toFixed(2)}</span>
                  </TableCell>
                  {isEditMode && !isReadOnly && (
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeItem(index)}
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

        {isEditMode && !isReadOnly && (
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};