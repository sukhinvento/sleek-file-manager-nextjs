import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
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
}

export const MobileResponsiveCard = ({
  title,
  subtitle,
  status,
  statusColor = 'secondary',
  fields,
  actions = [],
  onViewClick
}: MobileCardProps) => {
  return (
    <Card className="w-full mb-3">
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