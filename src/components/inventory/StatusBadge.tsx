import React from 'react';
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, XCircle, Truck, Package, DollarSign } from 'lucide-react';

type OrderStatus = 'Pending' | 'Approved' | 'Delivered' | 'Cancelled' | 'Shipped' | 'Processing' | 'In Transit' | 'Completed';
type StockStatus = 'critical' | 'low' | 'normal';
type PaymentStatus = 'Paid' | 'Pending' | 'Overdue' | 'Partial';

interface StatusBadgeProps {
  status: OrderStatus | StockStatus | PaymentStatus;
  type?: 'order' | 'stock' | 'payment';
  showIcon?: boolean;
}

const getStatusConfig = (status: string, type: string) => {
  const configs = {
    order: {
      'Pending': { 
        className: 'status-badge-pending', 
        icon: Clock,
        label: 'Pending' 
      },
      'Approved': { 
        className: 'status-badge-approved', 
        icon: CheckCircle,
        label: 'Approved' 
      },
      'Processing': { 
        className: 'status-badge-approved', 
        icon: Package,
        label: 'Processing' 
      },
      'Shipped': { 
        className: 'status-badge-approved', 
        icon: Truck,
        label: 'Shipped' 
      },
      'In Transit': { 
        className: 'status-badge-approved', 
        icon: Truck,
        label: 'In Transit' 
      },
      'Delivered': { 
        className: 'status-badge-delivered', 
        icon: CheckCircle,
        label: 'Delivered' 
      },
      'Completed': { 
        className: 'status-badge-delivered', 
        icon: CheckCircle,
        label: 'Completed' 
      },
      'Cancelled': { 
        className: 'status-badge-cancelled', 
        icon: XCircle,
        label: 'Cancelled' 
      }
    },
    stock: {
      'critical': { 
        className: 'stock-badge-critical', 
        icon: AlertTriangle,
        label: 'Critical' 
      },
      'low': { 
        className: 'stock-badge-low', 
        icon: AlertTriangle,
        label: 'Low Stock' 
      },
      'normal': { 
        className: 'stock-badge-normal', 
        icon: CheckCircle,
        label: 'Normal' 
      }
    },
    payment: {
      'Paid': { 
        className: 'status-badge-delivered', 
        icon: CheckCircle,
        label: 'Paid' 
      },
      'Pending': { 
        className: 'status-badge-pending', 
        icon: Clock,
        label: 'Pending' 
      },
      'Overdue': { 
        className: 'status-badge-cancelled', 
        icon: AlertTriangle,
        label: 'Overdue' 
      },
      'Partial': { 
        className: 'status-badge-pending', 
        icon: DollarSign,
        label: 'Partial' 
      }
    }
  };

  return configs[type as keyof typeof configs]?.[status] || {
    className: 'bg-muted text-muted-foreground',
    icon: AlertTriangle,
    label: status
  };
};

export const StatusBadge = ({ status, type = 'order', showIcon = true }: StatusBadgeProps) => {
  const config = getStatusConfig(status, type);
  const IconComponent = config.icon;

  return (
    <Badge className={`${config.className} animate-scale-in font-medium gap-1.5`}>
      {showIcon && <IconComponent className="w-3 h-3" />}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;