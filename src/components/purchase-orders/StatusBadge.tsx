import { Clock, CheckCircle, X, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variants = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-blue-100 text-blue-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Partial': 'bg-orange-100 text-orange-800'
  };
  
  const icons = {
    'Pending': Clock,
    'Approved': CheckCircle,
    'Delivered': CheckCircle,
    'Cancelled': X,
    'Partial': AlertCircle
  };
  
  const Icon = icons[status as keyof typeof icons] || Clock;
  
  return (
    <Badge className={`${variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
};