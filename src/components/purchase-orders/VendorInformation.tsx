import { User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PurchaseOrder } from '../../types/purchaseOrder';

interface VendorInformationProps {
  order: PurchaseOrder | null;
  isEditMode?: boolean;
  shippingAddress?: string;
  setShippingAddress?: (address: string) => void;
}

export const VendorInformation = ({ order }: VendorInformationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <User className="h-5 w-5 mr-2" />
          Vendor Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-gray-600">Vendor Name</Label>
          <p className="font-medium">{order?.vendorName || ''}</p>
        </div>
        <div>
          <Label className="text-sm text-gray-600">Contact Person</Label>
          <p className="font-medium">{order?.vendorContact || 'N/A'}</p>
        </div>
        <div>
          <Label className="text-sm text-gray-600">Phone</Label>
          <p className="font-medium">{order?.vendorPhone || 'N/A'}</p>
        </div>
        <div>
          <Label className="text-sm text-gray-600">Email</Label>
          <p className="font-medium">{order?.vendorEmail || 'N/A'}</p>
        </div>
        <div className="col-span-2">
          <Label className="text-sm text-gray-600">Address</Label>
          <p className="font-medium">{order?.vendorAddress || order?.shippingAddress || ''}</p>
        </div>
      </CardContent>
    </Card>
  );
};