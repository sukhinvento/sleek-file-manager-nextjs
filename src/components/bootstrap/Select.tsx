import React from "react";
import { Form, FormSelectProps } from "react-bootstrap";
import { cn } from "@/lib/utils";

interface SelectProps extends Omit<FormSelectProps, 'size'> {
  onValueChange?: (value: string) => void;
  value?: string;
  children: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, onValueChange, children, ...props }, ref) => (
    <Form.Select
      className={cn("form-select", className)}
      onChange={(e) => onValueChange?.(e.target.value)}
      ref={ref}
      {...props}
    >
      {children}
    </Form.Select>
  )
);
Select.displayName = "Select";

const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, children, ...props }, ref) => (
  <option
    className={cn("", className)}
    ref={ref}
    {...props}
  >
    {children}
  </option>
));
SelectItem.displayName = "SelectItem";

const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, onValueChange, children, ...props }, ref) => (
    <Form.Select
      className={cn("form-select", className)}
      onChange={(e) => onValueChange?.(e.target.value)}
      ref={ref}
      {...props}
    >
      {children}
    </Form.Select>
  )
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <option value="" disabled>
    {placeholder}
  </option>
);

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
};