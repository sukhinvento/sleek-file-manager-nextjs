import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SalesOrder } from '../../types/inventory';

interface CustomerInformationProps {
  order: SalesOrder | null;
  isEditMode?: boolean;
  customerName?: string;
  setCustomerName?: (name: string) => void;
  customerEmail?: string;
  setCustomerEmail?: (email: string) => void;
  customerPhone?: string;
  setCustomerPhone?: (phone: string) => void;
  customerAddress?: string;
  setCustomerAddress?: (address: string) => void;
}

export const CustomerInformation = ({
  order,
  isEditMode = false,
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  customerPhone,
  setCustomerPhone,
  customerAddress,
  setCustomerAddress
}: CustomerInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <User className="h-5 w-5 mr-2" />
          Customer Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground">Customer Name</Label>
          {isEditMode ? (
            <Input
              value={customerName}
              onChange={(e) => setCustomerName?.(e.target.value)}
              placeholder="Enter customer name"
            />
          ) : (
            <p className="font-medium">{order?.customerName || customerName || ''}</p>
          )}
        </div>
        
        <div>
          <Label className="text-sm text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Email Address
          </Label>
          {isEditMode ? (
            <Input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail?.(e.target.value)}
              placeholder="Enter email address"
            />
          ) : (
            <p className="font-medium">{order?.customerEmail || customerEmail || 'N/A'}</p>
          )}
        </div>
        
        <div>
          <Label className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" />
            Phone Number
          </Label>
          {isEditMode ? (
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone?.(e.target.value)}
              placeholder="Enter phone number"
            />
          ) : (
            <p className="font-medium">{order?.customerPhone || customerPhone || 'N/A'}</p>
          )}
        </div>
        
        <div>
          <Label className="text-sm text-muted-foreground">Order Value</Label>
          <p className="font-medium text-success">
            ₹{(order?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="col-span-2">
          <Label className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Billing Address
          </Label>
          {isEditMode ? (
            <Textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress?.(e.target.value)}
              placeholder="Enter billing address"
              rows={3}
            />
          ) : (
            <p className="font-medium">{order?.customerAddress || customerAddress || ''}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};