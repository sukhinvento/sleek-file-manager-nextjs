import React from 'react';
import { Button as BSButton } from 'react-bootstrap';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "btn btn-primary",
        destructive: "btn btn-danger", 
        outline: "btn btn-outline-primary",
        secondary: "btn btn-secondary",
        ghost: "btn btn-light",
        link: "btn btn-link",
      },
      size: {
        default: "btn",
        sm: "btn btn-sm",
        lg: "btn btn-lg",
        icon: "btn p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);
    
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...children.props,
        className: cn(classes, (children.props as any).className),
        ...props
      } as any);
    }

    return (
      <BSButton
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </BSButton>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };