import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from './StatusBadge';
import { PurchaseOrder } from '../../types/purchaseOrder';

interface OrderSummaryProps {
  order: PurchaseOrder | null;
  totals: {
    total: number;
  };
  paymentMethod: string;
  getPaymentMethodDisplay: (method: string) => string;
}

export const OrderSummary = ({ order, totals, paymentMethod, getPaymentMethodDisplay }: OrderSummaryProps) => {
  const pendingBalance = (order?.total || totals.total) - (order?.paidAmount || 0);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Section - Order Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Order Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">PO Number:</span>
            <span className="font-medium">{order?.poNumber || 'PO-2024-XXX'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Placed Date:</span>
            <span className="font-medium">{order?.orderDate || ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Expected Delivery:</span>
            <span className="font-medium">{order?.deliveryDate || ''}</span>
          </div>
          {order?.fulfilmentDate && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Fulfilled Date:</span>
              <span className="font-medium text-green-600">{order.fulfilmentDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Status Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <StatusBadge status={order?.status || 'Pending'} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Amount</span>
              <span className="font-bold text-lg">₹{(order?.total || totals.total).toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Paid Amount</span>
              <span className="font-medium text-green-600">₹{(order?.paidAmount || 0).toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Balance</span>
              <span className={`font-bold ${pendingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{pendingBalance.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Method</span>
              <span className="font-medium">{getPaymentMethodDisplay(order?.paymentMethod || paymentMethod)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};