import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from './StatusBadge';
import { SectionHeader } from '../inventory/SectionHeader';
import { FileText, CreditCard, DollarSign, Calendar, CheckCircle } from 'lucide-react';
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
    <div className="grid grid-cols-2 gap-6 animate-slide-up">
      {/* Left Section - Order Details */}
      <div className="space-y-4">
        <SectionHeader title="Order Details" icon={FileText} />
        <div className="bg-muted/30 rounded-lg p-6 border border-border/50 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">PO Number:</span>
              </div>
              <span className="font-semibold text-foreground">{order?.poNumber || 'PO-2024-XXX'}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Placed Date:</span>
              </div>
              <span className="font-medium text-foreground">{order?.orderDate || ''}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Expected Delivery:</span>
              </div>
              <span className="font-medium text-foreground">{order?.deliveryDate || ''}</span>
            </div>
            
            {order?.fulfilmentDate && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm text-muted-foreground">Fulfilled Date:</span>
                </div>
                <span className="font-medium text-success">{order.fulfilmentDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Status Card */}
      <div className="flex justify-end">
        <Card className="w-full max-w-80 summary-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Payment Summary</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <StatusBadge status={order?.status || 'Pending'} />
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground">Total Amount:</span>
                <span className="font-bold text-lg text-foreground">
                  ₹{(order?.total || totals.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Paid Amount:</span>
                <span className="font-semibold text-success">
                  ₹{(order?.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3 px-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Pending Balance:</span>
                </div>
                <span className={`font-bold text-lg ${pendingBalance > 0 ? 'text-warning' : 'text-success'}`}>
                  ₹{pendingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                  {getPaymentMethodDisplay(order?.paymentMethod || paymentMethod)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};