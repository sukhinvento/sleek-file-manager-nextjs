import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentAndShippingProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  isReadOnly: boolean;
}

export const PaymentAndShipping = ({ paymentMethod, setPaymentMethod, isReadOnly }: PaymentAndShippingProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Terms & Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Payment Terms</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isReadOnly}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net-30">Net 30 (Payment due in 30 days)</SelectItem>
                <SelectItem value="net-15">Net 15 (Payment due in 15 days)</SelectItem>
                <SelectItem value="net-7">Net 7 (Payment due in 7 days)</SelectItem>
                <SelectItem value="cod">Cash on Delivery</SelectItem>
                <SelectItem value="advance">Advance Payment (100% upfront)</SelectItem>
                <SelectItem value="pos">POS - Credit/Debit Card</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {paymentMethod === 'pos' && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2">POS Payment Details</h5>
              <div className="space-y-2 text-sm text-blue-700">
                <p>• Accepts Visa, MasterCard, American Express</p>
                <p>• Processing fee: 2.9% + ₹30 per transaction</p>
                <p>• Instant payment confirmation</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shipping & Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="include-shipping" defaultChecked disabled={isReadOnly} />
            <Label htmlFor="include-shipping">Include shipping costs (₹500)</Label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="express-delivery" disabled={isReadOnly} />
            <Label htmlFor="express-delivery">Express delivery (+₹200)</Label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="insurance" disabled={isReadOnly} />
            <Label htmlFor="insurance">Insurance coverage (+₹100)</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};