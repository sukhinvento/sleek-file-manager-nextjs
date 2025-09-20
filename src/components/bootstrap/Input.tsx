import React from 'react';
import { Form, FormControlProps } from 'react-bootstrap';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<FormControlProps, 'as'> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Form.Control
        className={cn("form-control", className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };