import React from 'react';
import { Form } from 'react-bootstrap';
import { cn } from '@/lib/utils';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <Form.Label
      ref={ref}
      className={cn("form-label", className)}
      {...props}
    />
  )
);

Label.displayName = "Label";

export { Label };