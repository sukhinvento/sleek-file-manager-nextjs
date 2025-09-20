import React from 'react';
import { Badge as BSBadge } from 'react-bootstrap';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  "badge",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary", 
        destructive: "bg-danger",
        outline: "border border-primary text-primary bg-transparent",
        success: "bg-success",
        warning: "bg-warning",
        info: "bg-info",
        pending: "status-badge pending",
        approved: "status-badge approved", 
        delivered: "status-badge delivered",
        cancelled: "status-badge cancelled",
        critical: "stock-badge critical",
        low: "stock-badge low",
        normal: "stock-badge normal",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  if (variant && ['pending', 'approved', 'delivered', 'cancelled', 'critical', 'low', 'normal'].includes(variant)) {
    return (
      <span
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }

  return (
    <BSBadge
      bg={variant === 'outline' ? undefined : variant || 'primary'}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };