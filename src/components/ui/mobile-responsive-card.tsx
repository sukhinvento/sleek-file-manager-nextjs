import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Calendar, Package, User, Phone, CreditCard } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface MobileCardProps {
  title: string;
  subtitle?: string;
  status?: string;
  statusColor?: string;
  fields: Array<{
    label: string;
    value: string | number | React.ReactNode;
  }>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
  }>;
  onViewClick?: () => void;
  // Enhanced props for purchase orders
  orderDetails?: {
    poNumber: string;
    itemCount: number;
    createdBy: string;
  };
  vendorDetails?: {
    name: string;
    contact: string;
    phone: string;
  };
  timeline?: {
    orderDate: string;
    deliveryDate: string;
    fulfilmentDate?: string;
  };
  amount?: {
    total: number;
    paid: number;
    paymentMethod: string;
  };
}

export const MobileResponsiveCard = ({
  title,
  subtitle,
  status,
  statusColor = 'secondary',
  fields,
  actions = [],
  onViewClick,
  orderDetails,
  vendorDetails,
  timeline,
  amount
}: MobileCardProps) => {
  // Enhanced card for purchase orders
  if (orderDetails && vendorDetails && timeline && amount) {
    return (
      <Card className="w-full mb-3 animate-fade-in hover-scale cursor-pointer" onClick={onViewClick}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold">{orderDetails.poNumber}</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                {orderDetails.itemCount} items • Created by {orderDetails.createdBy}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              {status && (
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium px-2 py-1 ${
                    status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    status === 'Approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                    status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {status}
                </Badge>
              )}
              {actions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onViewClick && (
                      <DropdownMenuItem onClick={onViewClick}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    )}
                    {actions.map((action, index) => (
                      <DropdownMenuItem key={index} onClick={action.onClick}>
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          {/* Vendor Information */}
          <div className="bg-muted/20 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">Vendor Details</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold">{vendorDetails.name}</p>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">{vendorDetails.contact}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-2.5 w-2.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{vendorDetails.phone}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-muted/20 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">Timeline</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Ordered:</span>
                <span className="text-xs font-medium">{timeline.orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Due:</span>
                <span className="text-xs font-medium">{timeline.deliveryDate}</span>
              </div>
              {timeline.fulfilmentDate && (
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Delivered:</span>
                  <span className="text-xs font-medium text-green-600">{timeline.fulfilmentDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="bg-muted/20 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">Payment</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Amount:</span>
                <span className="text-sm font-bold text-primary">${amount.total.toLocaleString()}</span>
              </div>
              {amount.paid > 0 && (
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Paid:</span>
                  <span className="text-xs font-medium text-green-600">${amount.paid.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">Method:</span>
                <span className="text-xs font-medium">{amount.paymentMethod}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback to simple card
  return (
    <Card className="w-full mb-4 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold truncate">{title}</CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {status && (
              <Badge variant="outline" className={`text-xs ${statusColor}`}>
                {status}
              </Badge>
            )}
            {actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onViewClick && (
                    <DropdownMenuItem onClick={onViewClick}>
                      View Details
                    </DropdownMenuItem>
                  )}
                  {actions.map((action, index) => (
                    <DropdownMenuItem key={index} onClick={action.onClick}>
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{field.label}</span>
              <span className="text-xs font-medium text-right">{field.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};