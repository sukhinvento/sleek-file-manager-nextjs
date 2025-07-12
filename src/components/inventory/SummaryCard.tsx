import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  subtitle?: string;
  gradient?: boolean;
  className?: string;
}

export const SummaryCard = ({ 
  title, 
  value, 
  icon: Icon, 
  badge, 
  subtitle,
  gradient = false,
  className = '' 
}: SummaryCardProps) => {
  return (
    <Card className={`summary-card interactive-card group ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground/80">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className={`p-2 rounded-lg ${gradient ? 'bg-gradient-primary' : 'bg-muted/50'} transition-colors duration-300`}>
              <Icon className={`h-4 w-4 ${gradient ? 'text-primary-foreground' : 'icon-accent'}`} />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-foreground">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {badge && (
            <Badge variant={badge.variant || 'outline'} className="animate-scale-in">
              {badge.text}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;