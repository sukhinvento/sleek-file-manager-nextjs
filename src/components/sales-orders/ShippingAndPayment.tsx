import { Truck, CreditCard, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalesOrder } from '../../types/inventory';

interface ShippingAndPaymentProps {
  order: SalesOrder | null;
  isEditMode?: boolean;
  shippingAddress?: string;
  setShippingAddress?: (address: string) => void;
  paymentMethod?: string;
  setPaymentMethod?: (method: string) => void;
  notes?: string;
  setNotes?: (notes: string) => void;
}

export const ShippingAndPayment = ({
  order,
  isEditMode = false,
  shippingAddress,
  setShippingAddress,
  paymentMethod,
  setPaymentMethod,
  notes,
  setNotes
}: ShippingAndPaymentProps) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Shipping Address</Label>
            {isEditMode ? (
              <Textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress?.(e.target.value)}
                placeholder="Enter shipping address"
                rows={3}
              />
            ) : (
              <p className="font-medium">{order?.shippingAddress || shippingAddress || ''}</p>
            )}
          </div>
          
          <div>
            <Label className="text-sm text-muted-foreground">Expected Delivery</Label>
            <p className="font-medium">{order?.deliveryDate || 'TBD'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment & Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment & Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Payment Method</Label>
            {isEditMode ? (
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="font-medium">{order?.paymentMethod || paymentMethod || 'N/A'}</p>
            )}
          </div>
          
          <div>
            <Label className="text-sm text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Notes
            </Label>
            {isEditMode ? (
              <Textarea
                value={notes}
                onChange={(e) => setNotes?.(e.target.value)}
                placeholder="Additional notes about the order..."
                rows={3}
              />
            ) : (
              <p className="font-medium">{order?.notes || notes || 'No notes'}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};