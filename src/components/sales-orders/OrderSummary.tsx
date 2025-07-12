import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from '../inventory/SectionHeader';
import { FileText, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { SalesOrder } from '../../types/inventory';
import { StatusBadge } from '../inventory/StatusBadge';

interface OrderSummaryProps {
  order: SalesOrder | null;
  totals: {
    total: number;
    subTotal: number;
    sgst: number;
    cgst: number;
    shipping: number;
  };
  isEditMode?: boolean;
  orderDate?: string;
  setOrderDate?: (date: string) => void;
  deliveryDate?: string;
  setDeliveryDate?: (date: string) => void;
}

export const OrderSummary = ({ 
  order, 
  totals, 
  isEditMode = false, 
  orderDate, 
  setOrderDate, 
  deliveryDate, 
  setDeliveryDate 
}: OrderSummaryProps) => {
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
                <span className="text-sm text-muted-foreground">Order Number:</span>
              </div>
              <span className="font-semibold text-foreground">{order?.orderNumber || 'SO-100001'}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Order Date:</span>
              </div>
              {isEditMode ? (
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate?.(e.target.value)}
                  className="w-auto text-right"
                />
              ) : (
                <span className="font-medium text-foreground">{order?.orderDate || orderDate}</span>
              )}
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Expected Delivery:</span>
              </div>
              {isEditMode ? (
                <Input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate?.(e.target.value)}
                  className="w-auto text-right"
                />
              ) : (
                <span className="font-medium text-foreground">{order?.deliveryDate || deliveryDate}</span>
              )}
            </div>
            
            {order?.status && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <StatusBadge status={order.status} type="order" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Payment Summary */}
      <div className="flex justify-end">
        <Card className="w-full max-w-80 summary-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Order Summary</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal:</span>
                <span className="font-medium text-foreground">
                  ₹{totals.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">SGST (9%):</span>
                <span className="font-medium text-foreground">
                  ₹{totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">CGST (9%):</span>
                <span className="font-medium text-foreground">
                  ₹{totals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Shipping:</span>
                <span className="font-medium text-foreground">
                  ₹{totals.shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Total Amount:</span>
                </div>
                <span className="font-bold text-lg text-primary">
                  ₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              {order?.paymentStatus && (
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">Payment Status:</span>
                  <StatusBadge status={order.paymentStatus} type="payment" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};